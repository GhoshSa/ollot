# Ollot - Ollama Integration for VS Code

This extension provides seamless integration with the Ollama AI model server within Visual Studio Code, allowing you to interact with Ollama directly in your editor.

## Features

* **Chat View:** A dedicated sidebar chat view enables you to send prompts to Ollama models and receive responses.
* **Model Selection:** Easily switch between available Ollama models using a dropdown menu in the chat view.
* **Streaming Responses:** Experience real-time interaction with Ollama as the extension streams responses as they are generated.
* **Code Formatting:** The extension automatically formats code blocks in the responses for improved readability.

## Requirements

* Visual Studio Code (version ^1.97.0 or later)
* Ollama AI model server ([https://ollama.ai/](https://ollama.ai/)) running locally.

## Installation

1.  Open Visual Studio Code.
2.  Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
3.  Search for "Ollot".
4.  Click **Install**.

## Usage

1.  After installation, "Ollot" icon appears in the Activity Bar.
2.  Click the icon to open the Ollot sidebar.
3.  The Chat view will be displayed.
4.  Type your prompt in the input area and press Enter or click the send button.
5.  Ollama's response will appear in the chat.
6.  Use the model selection dropdown to choose a different Ollama model.

## Commands

If you dont see the icon the use the following command in the Command Palette:

* `Ollot: Open Chat` : Opens the Ollot chat view.

## Release Notes

### 0.0.1

Initial release of Ollot.

* Provides a chat view for interacting with Ollama.
* Supports model selection.
* Includes streaming responses and code formatting.

## License

This extension is released under the MIT License. See the [LICENSE](LICENSE) file for details.