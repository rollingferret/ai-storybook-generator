import { Component, createSignal } from "solid-js";

function App(): Component {
  const [leftContent, setLeftContent] = createSignal<string | null>(
    "Welcome to AI Storybook Generator"
  );
  const [rightContent, setRightContent] = createSignal<string>(
    "Please input your name and story idea and we'll generate a story with an image for you!"
  );
  const [rightHeader, setRightHeader] = createSignal<string | null>(null);
  const [name, setName] = createSignal<string>("");
  const [storyPrompt, setStoryPrompt] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string | null>(null);

  const clearError = () => {
    setError(null);
  };

  const handleNameSubmit = (event: Event) => {
    event.preventDefault();
    if (name()) {
      setLeftContent("Put in some of your ideas and see what AI can do!");
      setRightHeader("Story Prompt");
      setRightContent("");
    }
  };

  const handleStoryGenerate = async (event: Event) => {
    event.preventDefault();
    if (storyPrompt()) {
      try {
        setLoading(true);
        const response = await fetch("/generate-story", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: storyPrompt(), name: name() }),
        });
  
        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit exceeded
            setError(
              "Rate limit exceeded. Please try again later after 10 minutes."
            );
          } else {
            throw new Error("Error generating the story");
          }
        } else {
          // No rate limit error, process the data
          const data = await response.json();
          setLeftContent(data.imageUrl);
          setRightHeader("Generated Story");
          setRightContent(data.story);
        }
      } catch (error) {
        console.error(error);
        setError(
          "An error occurred while generating the story. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReadNewStory = () => {
    setLeftContent("Welcome to AI Storybook Generator");
    setRightHeader(null);
    setRightContent(
      "Please input your name and story idea and we'll generate a story with an image for you!"
    );
    setStoryPrompt("");
    setName("");
  };

  return (
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md flex items-stretch justify-center space-x-8">
        {/* Left Div */}
        <div class="w-[600px] max-h-[600px] overflow-auto flex-grow min-h-[525px] border-4 border-solid border-purple-600 rounded-lg bg-purple-200 flex flex-col justify-center items-center p-8 space-y-4">
          {loading() ? (
            <div class="flex flex-col items-center space-y-2">
              <div class="text-2xl font-bold">Loading...</div>
              <div class="animate-spin text-3xl">&#9696;</div>
            </div>
          ) : leftContent() === null ? (
            <></>
          ) : (
            <>
              {error() && ( // Display error message if there's an error
                <div class="bg-red-200 text-red-800 p-4 mb-4 rounded-md text-center">
                  <p>{error()}</p>
                  <button
                    class="text-red-800 font-bold underline mt-2"
                    onClick={clearError}
                  >
                    Close
                  </button>
                </div>
              )}
              {rightHeader() !== "Generated Story" && (
                <>
                  <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
                  <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
                  <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
                </>
              )}
              {leftContent().startsWith("http") ? (
                <img
                  src={leftContent() || "https://i.imgur.com/h0Q2grM.gif"}
                  alt="Story Image"
                  class="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <h1 class="text-lg font-bold text-center overflow-wrap">
                    {leftContent()}
                  </h1>
                  {leftContent() === "Welcome to AI Storybook Generator" && (
                    <p class="text-sm text-center mt-4">
                      Please input your name and story idea and we'll generate a
                      story with an image for you!
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Right Div */}
        <div class="w-[600px] max-h-[600px] overflow-auto flex-grow min-h-[600px] border-4 border-solid border-purple-600 rounded-lg bg-purple-200 flex flex-col justify-between p-8">
          {rightHeader() && (
            <h1 class="text-2xl font-bold text-center overflow-wrap mb-4">
              {rightHeader()}
            </h1>
          )}
          {rightContent() ===
            "Please input your name and story idea and we'll generate a story with an image for you!" && (
            <form
              onSubmit={handleNameSubmit}
              class="flex flex-col items-center w-full space-y-4 mt-auto mb-auto max-h-[600px]"
            >
              <h2 class="text-xl font-bold text-center overflow-wrap mb-2">
                Input your name!
              </h2>
              <input
                type="text"
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 mt-2"
                value={name()}
                onInput={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
              <button
                type="submit"
                class={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                  loading() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading()} // Disable the button while loading is true
              >
                OK
              </button>
            </form>
          )}
          {rightHeader() === "Story Prompt" && (
            <form
              onSubmit={handleStoryGenerate}
              class="flex flex-col items-center w-full space-y-4 mt-auto mb-auto h-full max-h-[600px]"
            >
              <textarea
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 flex-grow mt-2"
                value={storyPrompt()}
                onInput={(e) => setStoryPrompt(e.target.value)}
                placeholder="Enter your story prompt here..."
              />
              <button
                type="submit"
                class={`w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-2 ${
                  loading() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading()} // Disable the button while loading is true
              >
                Generate Short Story
              </button>
            </form>
          )}
          {rightHeader() === "Generated Story" && (
            <div class="w-full flex flex-col items-center space-y-4 mt-2 flex-grow max-h-[600px]">
              <div class="w-full border border-gray-300 p-4 rounded-lg overflow-hidden">
                {/* Use "overflow-hidden" to hide the scroll bar */}
                <p class="text-base">{rightContent()}</p>
              </div>
              <div class="flex-grow"></div>
              <button
                class="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mt-4"
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
