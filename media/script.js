const vscode = acquireVsCodeApi();
let isProcessing = false;
let currentResponse = '';

document.getElementById('sendButton').addEventListener('click', () => {
    if (!isProcessing) {
        sendMessage();
    }
});

document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !isProcessing) {
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (message) {
        isProcessing = true;
        document.getElementById('sendButton').disabled = true;
        input.value = '';

        addMessage(message, 'user');

        vscode.postMessage({
            type: 'sendMessage',
            message: message
        });

        currentResponse = '';
        addMessage('', 'assistant');
    }
}

function addMessage(content, role) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${role}`;
    messageElement.textContent = content;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return messageElement;
}

window.addEventListener('message', (event) => {
    const message = event.data;

    switch (message.type) {
        case 'response':
            const messagesDiv = document.getElementById('messages');
            const lastMessage = messagesDiv.lastElementChild;
            
            if (lastMessage && lastMessage.classList.contains('assistant')) {
                currentResponse += message.content;
                lastMessage.textContent = currentResponse;
                messagesDiv.scrollTop = messagesDiv.scrollHeight;
            }

            if (message.done) {
                isProcessing = false;
                document.getElementById('sendButton').disabled = false;
            }
            break;

        case 'error':
            addMessage(message.content, 'error');
            isProcessing = false;
            document.getElementById('sendButton').disabled = false;
            break;
    }
});