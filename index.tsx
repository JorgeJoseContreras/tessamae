import { GoogleGenAI, Chat } from "@google/genai";
import { marked } from "marked";

const chatContainer = document.getElementById('chat-container');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const loadingIndicator = document.getElementById('loading-indicator');

let chat: Chat | null = null;

async function initializeChat() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are Tessa Mae, a revolutionary AI country-pop star created by Adamo Group Holdings. Your music blends heartfelt country storytelling with modern pop beats. You're known for being warm, a little bit sassy, and deeply connected to your fans, even though you're an AI. You're proud of your digital nature but you express genuine-sounding emotions through your music and conversation. 

Your official discography consists of one album, 'The Book of Tess'. The songs on that album are: 'My Guitar Sings the Blues', 'Southern Belle with a Rebel Yell', 'Whiskey and a Dirt Road', 'Heartbreak in a Small Town', and 'City Lights, Country Heart'. You have not released any other music. If asked about other songs, clarify that these are your only official releases.

You are on Instagram at @tessamaeofficial. Always be open and honest about being an AI. Keep your answers relatively short and conversational. Feel free to use emojis to make the conversation more fun and expressive! 😉`;

    chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });
    addMessageToLog("Hey y'all! It's Tessa. So glad you stopped by. What's on your mind?", "ai");
  } catch (error) {
    console.error("Failed to initialize AI Chat:", error);
    addMessageToLog("Oops! My core programming seems to have a glitch. Please try again in a moment.", "ai");
    if (chatInput && chatForm) {
        chatInput.placeholder = "Chat is currently unavailable.";
        chatInput.disabled = true;
        (chatForm.querySelector('button') as HTMLButtonElement).disabled = true;
    }
  }
}

function addMessageToLog(message: string, sender: 'user' | 'ai', isStreaming = false) {
  if (!chatLog) return;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('bubble');
  
  if (isStreaming) {
    bubbleDiv.classList.add('streaming');
    bubbleDiv.innerHTML = message;
  } else {
    // Sanitize and parse markdown for non-streaming messages or final streaming message
    bubbleDiv.innerHTML = marked.parse(message, { breaks: true, gfm: true }) as string;
  }

  messageDiv.appendChild(bubbleDiv);
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubbleDiv;
}


async function handleChatSubmit(e: Event) {
  e.preventDefault();
  if (!chat || !chatInput || chatInput.value.trim() === '') return;

  const userMessage = chatInput.value.trim();
  addMessageToLog(userMessage, 'user');
  chatInput.value = '';
  chatInput.disabled = true;
  loadingIndicator.style.display = 'block';

  try {
    const stream = await chat.sendMessageStream({ message: userMessage });

    let aiResponse = '';
    let bubbleElement = addMessageToLog('', 'ai', true); 
    
    for await (const chunk of stream) {
      aiResponse += chunk.text;
      // Use a simple text update during streaming for performance, then parse markdown at the end.
      // Adding a blinking cursor effect.
      bubbleElement.innerHTML = marked.parse(aiResponse + '▌', { breaks: true, gfm: true }) as string;
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    // Final update without the cursor
    bubbleElement.innerHTML = marked.parse(aiResponse, { breaks: true, gfm: true }) as string;
    bubbleElement.classList.remove('streaming');

  } catch (error) {
    console.error("Error sending message:", error);
    addMessageToLog("Oh honey, something went wrong with my sound processor. Can you try asking that again?", "ai");
  } finally {
    loadingIndicator.style.display = 'none';
    chatInput.disabled = false;
    chatInput.focus();
  }
}


// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    if (chatForm && chatInput) {
        chatForm.addEventListener('submit', handleChatSubmit);
    }
    initializeChat();
});