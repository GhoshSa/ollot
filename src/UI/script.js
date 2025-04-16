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

function handleScroll() {
    if (textarea.scrollTop > 10) {
        gradientTop.style.opacity = '1';
    } else {
        gradientTop.style.opacity = '0';
    }

    if (textarea.scrollHeight - textarea.scrollTop - textarea.clientHeight > 10) {
        gradientBottom.style.opacity = '1';
    } else {
        gradientBottom.style.opacity = '0';
    }
}

handleScroll();

textarea.addEventListener('scroll', handleScroll);

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
        model: currentModel
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
    // This would implement code block formatting with syntax highlighting
    // For now, we'll use a simple implementation
    return content;
}

// Function to handle code block copy button
function handleCopy(e) {
    const codeBlock = e.target.closest('.code-block');
    if (codeBlock) {
        const code = codeBlock.querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const button = e.target.closest('.copy-button');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
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
            lastMessage.innerHTML = formatCodeBlock(message.content);
            
            // Add copy buttons to code blocks
            const copyButtons = lastMessage.querySelectorAll('.copy-button');
            copyButtons.forEach(button => {
                button.addEventListener('click', handleCopy);
            });
            
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