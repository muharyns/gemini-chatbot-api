const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
 
// A simple history to pass to the backend for conversational context.
const chatHistory = [];
 
form.addEventListener('submit', async function (e) {
  e.preventDefault();
 
  const userMessage = input.value.trim();
  if (!userMessage) {
    return;
  }
 
  // Add user message to UI and history
  appendMessage('user', userMessage);
  chatHistory.push({ role: 'user', content: userMessage });
  input.value = '';
 
  // Add a "Thinking..." indicator and get a reference to its element
  const thinkingMessageElement = appendMessage('bot', 'Thinking...');
 
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Send the entire chat history for context
        messages: chatHistory,
      }),
    });
 
    if (!response.ok) {
      // Handle HTTP errors like 404 or 500
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || 'Failed to get response from server.';
      throw new Error(errorMessage);
    }
 
    const data = await response.json();
    const botMessage = data.result?.trim();
 
    if (botMessage) {
      // Update the "Thinking..." message with the actual AI response
      thinkingMessageElement.textContent = botMessage;
      // Add the AI's response to the history
      chatHistory.push({ role: 'model', content: botMessage });
    } else {
      // Handle cases where the response is successful but contains no result
      thinkingMessageElement.textContent = 'Sorry, no response was received.';
    }
  } catch (error) {
    console.error('Chat Error:', error);
    // Update the "Thinking..." message with the error
    thinkingMessageElement.textContent = error.message || 'An unexpected error occurred.';
  }
});
 
/**
 * Appends a message to the chat box and returns the created element.
 * @param {string} sender - The sender of the message ('user' or 'bot').
 * @param {string} text - The text content of the message.
 * @returns {HTMLDivElement} The message element that was appended.
 */
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  // Scroll to the bottom to ensure the latest message is visible
  chatBox.scrollTop = chatBox.scrollHeight;
  return msgDiv;
}

