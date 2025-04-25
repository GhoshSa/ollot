// Get references to DOM elements
const textarea = document.getElementById('user-input');
const gradientTop = document.getElementById('gradient-top');
const gradientBottom = document.getElementById('gradient-bottom');
const sendButton = document.getElementById('send-button');
const cancelButton = document.getElementById('cancel-button');
const modelDropdown = document.getElementById('model-dropdown');
const modelsList = document.getElementById('models-list');
const currentModelEl = document.getElementById('current-model');
const messagesContainer = document.getElementById('messages');

// Setup variables
let isProcessing = false;
let currentModel = 'stable-code';
const vscode = acquireVsCodeApi();

// Initialize the chat
initialize();

// Function to resize textarea based on content
function resizeTextarea() {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
}

// Event listener for textarea input
textarea.addEventListener('input', () => {
    resizeTextarea();
    sendButton.disabled = !textarea.value.trim() || isProcessing;
});

// Function to handle UI state when processing a message
function setProcessing(processing) {
    isProcessing = processing;
    if (processing) {
        sendButton.classList.add('hidden');
        cancelButton.classList.remove('hidden');
        textarea.disabled = true;
    } else {
        sendButton.classList.remove('hidden');
        cancelButton.classList.add('hidden');
        textarea.disabled = false;
        sendButton.disabled = !textarea.value.trim();
    }
}

// Event listener for send button click
sendButton.addEventListener('click', sendMessage);

// Function to send message to extension
function sendMessage() {
    if (!textarea.value.trim() || isProcessing) {
        return;
    }

    // Create user message element
    const userMessage = document.createElement('div');
    userMessage.classList.add('message', 'user');
    userMessage.textContent = textarea.value.trim();
    messagesContainer.appendChild(userMessage);

    // Create assistant message element with loading indicator
    const assistantMessage = document.createElement('div');
    assistantMessage.classList.add('message', 'assistant');
    assistantMessage.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
    messagesContainer.appendChild(assistantMessage);

    // Set UI to processing state
    setProcessing(true);

    // Send message to extension
    vscode.postMessage({
        type: 'sendMessage',
        message: textarea.value.trim(),
    });

    // Clear textarea and scroll to bottom
    textarea.value = '';
    textarea.style.height = 'auto';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listener for cancel button click
cancelButton.addEventListener('click', () => {
    vscode.postMessage({
        type: 'cancelRequest'
    });

    // Find the last assistant message and update it
    const assistantMessages = document.querySelectorAll('.message.assistant');
    const lastMessage = assistantMessages[assistantMessages.length - 1];

    if (lastMessage && lastMessage.querySelector('.typing-indicator')) {
        lastMessage.innerHTML = "<em>Request cancelled by user.</em>";
    }

    setProcessing(false);
});

// Enable Enter key to send message (Shift+Enter for new line)
textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendButton.click();
    }
});

// Toggle model dropdown
modelDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    modelsList.classList.toggle('show');
    modelDropdown.querySelector('.dropdown-arrow').classList.toggle('rotate');
});

// Close dropdown when clicking elsewhere
document.addEventListener('click', () => {
    modelsList.classList.remove('show');
    modelDropdown.querySelector('.dropdown-arrow').classList.remove('rotate');
});

// Model selection
document.querySelectorAll('.model-option').forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        currentModel = option.getAttribute('data-model') || 'stable-code';
        currentModelEl.textContent = currentModel;
        modelsList.classList.remove('show');
        modelDropdown.querySelector('.dropdown-arrow').classList.remove('rotate');
    });
});

// Function to format code blocks in messages
function formatCodeBlock(content) {
    if (!content.includes('```') || !content.includes('``')) {
        return content; // Return original content if no code blocks
    }

    // Regex for code blocks
    const codeBlockRegex = /```([a-zA-Z0-9_+-]*)?\n([\s\S]*?)```/g;

    // Replace each code block with formatted HTML code
    content = content.replace(codeBlockRegex, (_, language, code) => {
        // Create a label for the code language
        const lang = language ? language.trim() : '';
        const langLabel = lang ? `<span class="code-lang">${lang}</span>` : '';
        
        // Sanitize code to prevent HTML injection
        const sanitizedCode = code
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        // Return formatted code block with copy button
        return `
            <div class="code-block">
                <div class="code-block-header">
                    ${langLabel}
                    <button class="copy-button" title="Copy code">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                    </button>
                </div>
                <pre><code class="language-${lang}">${sanitizedCode}</code></pre>
            </div>
        `;
    });

    // Regex for inline codes
    const inlineCodeRegex = /`([^`]+)`/g;
    content = content.replace(inlineCodeRegex, (_, code) => {
        // Sanitize code to prevent HTML injection
        const sanitizedCode = code
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');

        return `<code class="inline-code">${sanitizedCode}</code>`;
    });

    return content;
}

// Function to handle code block copy button
function handleCopy(e) {
    const codeBlock = e.target.closest('.code-block');
    if (codeBlock) {
        const code = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const button = e.target.closest('.copy-button');
            const originalContent = button.innerHTML;

            button.classList.add('copied');

            button.innerHTML = `
                <span>Copied!</span>`;
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
        });
    }
}

// Function to initialize the chat
function initialize() {
    // Handle messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;

        switch (message.type) {
            case 'response':
                handleResponse(message);
                break;
            case 'responseCancelled':
                handleResponse(message);
                break;
            case 'error':
                handleError(message);
                break;
        }
    });
}

// Function to handle responses from the extension
function handleResponse(message) {
    const assistantMessages = document.querySelectorAll('.message.assistant');
    const lastMessage = assistantMessages[assistantMessages.length - 1];

    if (lastMessage) {
        // Remove typing indicator if present
        const indicator = lastMessage.querySelector('.typing-indicator');
        if (indicator) {
            lastMessage.removeChild(indicator);
        }

        // If this is a streaming response
        if (!message.done) {
            lastMessage.innerHTML += message.content;
        }
        // If this is the final response chunk
        else if (message.done) {
            if (message.type === 'responseCancelled') {
                // Keep the existing code
                const formattedContent = formatCodeBlock(message.content);
                lastMessage.innerHTML = formattedContent;
            } else {
                lastMessage.innerHTML = formatCodeBlock(message.content);

                // Add copy buttons to code blocks
                const copyButtons = lastMessage.querySelectorAll('.copy-button');
                copyButtons.forEach(button => {
                    button.addEventListener('click', handleCopy);
                });
            }

            setProcessing(false);
        }

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Function to handle errors
function handleError(message) {
    const assistantMessages = document.querySelectorAll('.message.assistant');
    const lastMessage = assistantMessages[assistantMessages.length - 1];

    if (lastMessage) {
        lastMessage.innerHTML = `<div class="error-message">Error: ${message.content}</div>`;
        setProcessing(false);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}