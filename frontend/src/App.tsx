import { Component, createEffect, createSignal } from "solid-js";
import "./styles.css"; // Import the styles.css file for custom styles

function App(): Component {
  const [isOpen, setIsOpen] = createSignal<boolean>(false);
  const [userName, setUserName] = createSignal<string>("");
  const [prompt, setPrompt] = createSignal<string>("");
  const [generatedStory, setGeneratedStory] = createSignal<string>("");
  const [pages, setPages] = createSignal<number>(1); // Number of pages, initially set to 1

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleStoryGenerate = async (e: Event) => {
    e.preventDefault();
    try {
      // Call the backend API to generate the story
      const response = await fetch("http://localhost:5000/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt() }),
      });

      if (!response.ok) {
        throw new Error("Error generating the story");
      }

      const data = await response.json();
      setGeneratedStory(data.story);
      setPages(pages() + 1); // Increment the number of pages after API call
    } catch (error) {
      console.error(error);
    }
  };

  const handleTurnPage = () => {
    setPages(pages() + 1); // Increment the number of pages
  };

  return (
    <div class="h-screen flex justify-center items-center">
      <div class={`relative book-container ${isOpen() ? "opened" : ""}`}>
        {/* Book cover */}
        <div class="book-cover bg-gray-400 p-6 rounded-lg shadow-lg">
          {!isOpen() ? (
            <form onSubmit={handleSubmit} class="flex flex-col items-center">
              <h2 class="text-2xl font-bold mb-4">Enter your name</h2>
              <input
                type="text"
                class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                value={userName()}
                onInput={(e) => setUserName(e.target.value)}
              />
              <button
                type="submit"
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Open Book
              </button>
            </form>
          ) : (
            <>
              {Array.from({ length: pages() }).map((_, index) => (
                <div class="page" key={index}>
                  {/* Left page */}
                  <div class="left-page w-1/2 h-full">
                    {index > 0 && <div>Image for Page {index}</div>}
                  </div>

                  {/* Right page */}
                  <div class="right-page w-1/2 h-full">
                    {index === pages() - 1 ? (
                      <form
                        onSubmit={handleStoryGenerate}
                        class="flex flex-col items-center h-full"
                      >
                        <textarea
                          class="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                          value={prompt()}
                          onInput={(e) => setPrompt(e.target.value)}
                        />
                        <button
                          type="submit"
                          class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                        >
                          Generate Story
                        </button>
                      </form>
                    ) : (
                      <div class="mt-4">
                        <h2 class="text-2xl font-bold mb-2">Generated Story</h2>
                        <div class="border border-gray-300 p-4 rounded-lg">
                          <p>{generatedStory()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* Turn page button */}
              {generatedStory() && (
                <button
                  class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={handleTurnPage}
                >
                  Turn Page
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
