import { GoogleGenAI } from "@google/genai";
import { marked } from "marked";

// --- IMPORTANT ---
// PASTE YOUR GEMINI API KEY HERE.
// This is necessary because GitHub Pages is a static host and cannot use environment variables.
// Get your key from Google AI Studio: https://aistudio.google.com/app/apikey
const GEMINI_API_KEY = "AIzaSyDoP1nyw4zxDhCuDA4EvTJ4BOkjlJbSZ8w";
// -----------------


const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const loadingIndicator = document.getElementById('loading-indicator');

let chat = null;

async function initializeChat() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
    console.error("API Key not provided in index.js");
    addMessageToLog("Chat is not configured correctly. The site owner needs to add an API key.", "ai");
    if (chatInput && chatForm) {
        chatInput.placeholder = "Chat is unavailable.";
        chatInput.disabled = true;
        chatForm.querySelector('button').disabled = true;
    }
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
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
        chatForm.querySelector('button').disabled = true;
    }
  }
}

function addMessageToLog(message, sender, isStreaming = false) {
  if (!chatLog) return;

  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', `${sender}-message`);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.classList.add('bubble');
  
  if (isStreaming) {
    bubbleDiv.classList.add('streaming');
    bubbleDiv.innerHTML = message;
  } else {
    bubbleDiv.innerHTML = marked.parse(message, { breaks: true, gfm: true });
  }

  messageDiv.appendChild(bubbleDiv);
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
  return bubbleDiv;
}


async function handleChatSubmit(e) {
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
      bubbleElement.innerHTML = marked.parse(aiResponse + '▌', { breaks: true, gfm: true });
      chatLog.scrollTop = chatLog.scrollHeight;
    }
    
    bubbleElement.innerHTML = marked.parse(aiResponse, { breaks: true, gfm: true });
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
