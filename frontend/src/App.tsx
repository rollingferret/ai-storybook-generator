import { Component, createSignal } from "solid-js";

function App(): Component {
  const [leftContent, setLeftContent] = createSignal<string | null>(
    "Welcome to AI Storybook Generator"
  );
  const [rightContent, setRightContent] = 
    createSignal<string>("Please input your name and story idea and we'll generate a story with an image for you!");
  const [rightHeader, setRightHeader] = createSignal<string>("Input your name!");
  const [name, setName] = createSignal<string>("");
  const [storyPrompt, setStoryPrompt] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(false);

  const handleNameSubmit = (event: Event) => {
    event.preventDefault();
    if (name()) {
      setLeftContent(null);
      setRightHeader("Put in your idea here!");
      setRightContent("Story Prompt");
    }
  };

  const handleStoryGenerate = async (event: Event) => {
    event.preventDefault();
    if (storyPrompt()) {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/generate-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: storyPrompt() }),
        });

        if (!response.ok) {
          throw new Error("Error generating the story");
        }

        const data = await response.json();
        setLeftContent(data.imageUrl);
        setRightHeader("Generated Story");
        setRightContent(data.story);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  };

  const handleReadNewStory = () => {
    setLeftContent("Welcome to AI Storybook Generator");
    setRightHeader("Input your name!");
    setRightContent("Please input your name and story idea and we'll generate a story with an image for you!");
  };

  return (
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md flex items-stretch justify-center space-x-8">
        <div class="w-80 flex-grow border-4 border-solid border-purple-600 rounded-lg bg-purple-200 flex flex-col justify-center items-center p-8 space-y-4">
          <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
          <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
          <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
          {loading() ? (
            <div>Loading...</div>
          ) : leftContent() === "Welcome to AI Storybook Generator" ? (
            <>
              <h1 class="text-lg font-bold text-center overflow-wrap">{leftContent()}</h1>
              <p class="text-sm text-center mt-4">Please input your name and story idea and we'll generate a story with an image for you!</p>
            </>
          ) : (
            <img
              src={leftContent() || "https://i.imgur.com/h0Q2grM.gif"}
              alt="Story Image"
              class="w-full h-full object-cover"
            />
          )}
        </div>
        <div class="w-80 flex-grow border-4 border-solid border-purple-600 rounded-lg bg-purple-200 flex flex-col justify-between p-8">
          <h1 class="text-2xl font-bold text-center overflow-wrap">{rightHeader()}</h1>
          {rightContent() === "Please input your name and story idea and we'll generate a story with an image for you!" && (
            <form
              onSubmit={handleNameSubmit}
              class="flex flex-col items-center w-full space-y-4"
            >
              <input
                type="text"
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                value={name()}
                onInput={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                OK
              </button>
            </form>
          )}
          {rightContent() === "Story Prompt" && (
            <form
              onSubmit={handleStoryGenerate}
              class="flex flex-col items-center w-full space-y-4 h-full"
            >
              <textarea
                class="w-full h-60 px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                value={storyPrompt()}
                onInput={(e) => setStoryPrompt(e.target.value)}
                placeholder="Enter your story prompt here..."
              />
              <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 self-center mt-auto"
              >
                Generate Story
              </button>
            </form>
          )}
          {rightContent() !== "Please input your name and story idea and we'll generate a story with an image for you!" && rightContent() !== "Story Prompt" && (
            <div class="w-full flex flex-col items-center justify-between space-y-4">
              <div class="w-full border border-gray-300 p-4 rounded-lg overflow-auto">
                <p class="text-base">{rightContent()}</p>
              </div>
              <button
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
                onClick={handleReadNewStory}
              >
                Read a New Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;