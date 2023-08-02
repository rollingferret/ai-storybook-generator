require('dotenv').config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios, { AxiosResponse } from 'axios';

const app = express();
const port = 3000; // Replace with your desired port

const openaiApiKey = process.env.OPENAI_API_KEY;

// TODO
// 

// Interfaces
interface StoryRequest {
  prompt: string;
}

interface StoryResponse {
    story: string;
    imageUrl: string;
  }
interface ErrorResponse {
  error: string;
}

// Parse incoming JSON data
app.use(bodyParser.json());

// Function to handle the API call and return the story content
const generateStory = async (requestData: any): Promise<string> => {
  try {
    const response: AxiosResponse<{ choices: { message: { content: string } }[] }> = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': openaiApiKey
        },
      }
    );

    const story = response.data.choices[0].message.content;
    if (!story) {
      throw new Error('Empty story received from the API');
    }

    return story;
  } catch (error) {
    console.error(error);
    throw new Error('Error generating the story');
  }
};

// Function to handle the API call and return the story images
const generateImage = async (story: string): Promise<string> => {
    try {
      // Replace all occurrences of '\\n' with an empty string
      const sanitizedStory = story.replace(/\n/g, '');
  
      // Truncate the story if needed
      const maxPromptLength = 50;
      let truncatedStory = sanitizedStory.length > maxPromptLength ? sanitizedStory.slice(0, maxPromptLength) : sanitizedStory; 
      // Create the image generation request
      truncatedStory = truncatedStory + ' draw in cartoon style suitable for children';
      const requestData = {
        prompt: truncatedStory,
        n: 1, // Number of images to generate
        size: '1024x1024', // Size of the generated image
        response_format: 'url', // Format in which the generated images are returned
      };
  
      // Make a POST request to the OpenAI image generation API
      const response = await axios.post('https://api.openai.com/v1/images/generations', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: openaiApiKey,
        },
      });
  
      // Extract the URL of the generated image from the API response
      const imageUrl = response.data.data[0].url;
  
      return imageUrl;
    } catch (error) {
      console.error(error);
      throw new Error('Error generating the image');
    }
};


// Route to generate a story using the OpenAI API
app.post('/generate-story', async (req: Request<{}, {}, StoryRequest>, res: Response<StoryResponse | ErrorResponse>) => {
    try {
      // For testing purposes, we'll hardcode a sample prompt
      const samplePrompt = "tell me a story about poop...";
  
      // Request data for the chat completion
      const requestData = {
        model: "gpt-3.5-turbo", // Replace with the desired model ID
        messages: [
          { role: "system", content: "You are a children's book writer, please spell check before returning a story. Aim for 50 words and finish the story." },
          { role: "user", content: samplePrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      };
     
      const response = await generateStory(requestData);
      const imageUrl = await generateImage(response);
  
      const storyData: StoryResponse = { story: response, imageUrl };
      res.json(storyData);
    } catch (error) {
      console.error(error);
  
      // Return the error response
      const errorResponse: ErrorResponse = { error: 'Something went wrong' };
      res.status(500).json(errorResponse);
    }
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});