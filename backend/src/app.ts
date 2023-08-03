require('dotenv').config();
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios, { AxiosResponse } from 'axios';
import rateLimit from 'express-rate-limit';
const cors = require('cors'); // Import the 'cors' package

const app = express();
const port = process.env.PORT || 4000;

const openaiApiKey = process.env.OPENAI_API_KEY;

// TODO
// Create seperate routes for generate story and image to allow decoupling API calls
// Parse through response to generate more individualized stories images (will increase cost)
// Allow choosing style of image generation (e.g. cartoon, realistic, etc.)
// Do to costs for multiple API calls, potentially look into a local hosted model

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // requests per windowMs put back to 10 later
});

// Add cors middleware to your Express app
app.use(cors());

// Apply rate limiting to all requests
app.use(limiter);


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
  
      // Truncate the story as needed
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
     
      // const response = await generateStory(requestData);
      // const imageUrl = await generateImage(response);

      const response = "Once upon a time, in a magical forest, there lived a mischievous little creature named Poopsie. Poopsie was a poop fairy who loved spreading laughter and joy. Every night, she sprinkled a pinch of sparkly poop dust, turning everyone's frowns upside down. And so, happiness bloomed in the enchanted forest forever. The end.";
      const imageUrl = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-vQKiveuZlQMSPacgeUyDvlyp/user-mYxc6i3whTWpcscnUOm0c2U6/img-cQuVbVmVi70YuM0XysORTWgs.png?st=2023-08-03T06%3A31%3A41Z&se=2023-08-03T08%3A31%3A41Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2023-08-03T05%3A46%3A00Z&ske=2023-08-04T05%3A46%3A00Z&sks=b&skv=2021-08-06&sig=71am7j2gwkHPMw0v1WpJzKvQ3tT/AzGCdcDnjiEIc6o%3D"

  
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