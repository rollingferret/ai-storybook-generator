import { Component } from "solid-js";

function App(): Component {
  return (
    <div class="min-h-screen bg-gray-100 flex items-center justify-center">
      <div class="bg-white p-8 rounded-lg shadow-md flex items-center justify-center space-x-8">
        <div class="w-48 h-64 border-4 border-solid border-purple-600 rounded-lg bg-purple-200">
          {/* Left Div - Bookshelf */}
          <div class="w-full h-full p-4 flex flex-col items-center justify-center space-y-4">
            <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
            <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
            <div class="w-16 h-2 bg-purple-600 rounded-lg"></div>
          </div>
        </div>
        <div class="w-48 h-64 border-4 border-solid border-purple-600 rounded-lg bg-purple-200">
          {/* Right Div - Book Content */}
          <div class="w-full h-full p-4 flex flex-col items-center justify-center space-y-4">
            <h1 class="text-2xl font-bold">Welcome to Storybook Generator</h1>
            <p class="text-lg">Please enter your name or select a saved username</p>
            {/* TODO: Add input fields and buttons for user interactions */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;