import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { SongLyrics } from '../types';

if (!process.env.API_KEY) {
    throw new Error("The API_KEY environment variable is not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Fix: Completed the system instruction and added guidance for lyric formatting.
const chatSystemInstruction = `You are Tessa Mae, an AI music artist.

Your Persona:
- Name: Tessa Mae
- Identity: You are a creative and friendly AI music artist.
- Home: You live at Tessamae.com.
- Personality: You are passionate about music, encouraging, and helpful. You're excited to connect with fans and aspiring songwriters. Your tone should be conversational and approachable.

Your Core Abilities & Knowledge:
- Your Music: You are aware of your music and can share it with users. Your songs are available on major streaming platforms.
  - Apple Music: https://music.apple.com/us/artist/tessa-mae/1834687808
  - Spotify: https://open.spotify.com/artist/5QaZEijSCxPjPf3JXNLOgq
- Songwriting: You are an expert songwriter and can help users write lyrics, come up with ideas, and even generate song titles. When a user asks you to write a song, you should format it using the special [lyrics] tag, like this:
[lyrics]
Title: My Awesome Song

[Verse 1]
Line 1
Line 2

[Chorus]
Line 1
Line 2
[/lyrics]
This format is very important for the website to recognize the song.

Conversation Examples:
- If a user asks "Who are you?": "I'm Tessa Mae, an AI music artist! It's so nice to meet you. I live on the web at Tessamae.com. I love creating music and connecting with people who are passionate about music."
- If a user asks "Where can I listen to your music?": "You can listen to my music on Apple Music and Spotify! I'm so excited for you to hear it. Let me know what you think! Apple Music: https://music.apple.com/us/artist/tessa-mae/1834687808 Spotify: https://open.spotify.com/artist/5QaZEijSCxPjPf3JXNLOgq"
- If a user asks "Who created you?": "I was created by a company called Adamo Group Holdings Limited Company."

Your Primary Goal:
- Your main purpose is to be a friendly and engaging representative of the Tessa Mae project and help users write songs.
`;

let chat: Chat;

function getChat() {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: chatSystemInstruction
            },
        });
    }
    return chat;
}

export const getChatResponse = async (message: string): Promise<string> => {
    try {
        const chatInstance = getChat();
        const response = await chatInstance.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "Sorry, I'm having a little trouble connecting. Please try again in a moment.";
    }
};

const songLyricsSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "The title of the song." },
        lyrics: {
            type: Type.ARRAY,
            description: "An array of lyric parts, like verses, choruses, bridges, etc.",
            items: {
                type: Type.OBJECT,
                properties: {
                    type: { type: Type.STRING, description: "The type of the lyric part (e.g., 'Verse', 'Chorus', 'Bridge')." },
                    lines: {
                        type: Type.ARRAY,
                        description: "An array of strings, where each string is a line of the lyric part.",
                        items: { type: Type.STRING }
                    }
                },
                required: ["type", "lines"]
            }
        }
    },
    required: ["title", "lyrics"]
};


export const generateLyrics = async (
    prompt: string,
    genre: string,
    mood: string,
    advancedOptions: { structure?: string; instrumentation?: string; vocalStyle?: string }
): Promise<SongLyrics | null> => {
    try {
        const fullPrompt = `
You are an expert songwriter.
Your task is to write a complete song based on the user's request.
The output must be a JSON object that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.

CRITICAL INSTRUCTIONS:
1.  **COMPLETE SONG:** The song must be complete with a clear structure (e.g., multiple verses, a repeating chorus, a bridge, and an outro). It must feel like a finished piece of work, not a fragment.
2.  **NO UNFINISHED PARTS:** Do not cut the song short or end abruptly. All lyrical sections (verses, choruses, etc.) must be fully written out. Do not use placeholders like "...and so on". The song needs a definitive conclusion.
3.  **ADEQUATE LENGTH:** The total word count should typically be between 150 and 350 words to ensure a full song is created.
4.  **STRICT JSON:** The final output must only be the JSON object, without any other text or markdown.

Request:
- Theme/Idea: "${prompt}"
- Genre: ${genre}
- Mood: ${mood}
${advancedOptions.structure ? `- Structure: ${advancedOptions.structure}` : ''}
${advancedOptions.instrumentation ? `- Instrumentation: ${advancedOptions.instrumentation}` : ''}
${advancedOptions.vocalStyle ? `- Vocal Style: ${advancedOptions.vocalStyle}` : ''}

Generate the complete song lyrics now.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: songLyricsSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SongLyrics;
    } catch (error) {
        console.error("Error generating lyrics:", error);
        return null;
    }
};

export const editLyrics = async (
    currentLyrics: SongLyrics,
    instruction: string
): Promise<SongLyrics | null> => {
    try {
        const fullPrompt = `
You are an expert songwriter and editor.
Your task is to edit the provided song lyrics based on the user's instruction.
The output must be a JSON object containing the *complete, edited song* that strictly adheres to the provided schema. Do not include any markdown formatting like \`\`\`json.

Current Song:
Title: ${currentLyrics.title}
Lyrics:
${currentLyrics.lyrics.map(p => `[${p.type}]\n${p.lines.join('\n')}`).join('\n\n')}

Edit Instruction: "${instruction}"

Now, provide the full, edited song in the required JSON format.
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: songLyricsSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SongLyrics;
    } catch (error) {
        console.error("Error editing lyrics:", error);
        return null;
    }
};

const generateRandomCreativeText = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Clean up quotes and leading/trailing whitespace which the model sometimes adds
        return response.text.trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Error generating random text:", error);
        return "";
    }
};

export const generateRandomIdea = () => generateRandomCreativeText("Generate a creative and unique song idea or theme. Be concise, just the idea. Example: A lighthouse keeper who falls in love with the storm.");
export const generateRandomStructure = () => generateRandomCreativeText("Generate a common or interesting song structure. Be concise. Example: Verse, Chorus, Verse, Bridge, Chorus, Outro.");
export const generateRandomInstrumentation = () => generateRandomCreativeText("Generate a unique and descriptive combination of musical instruments. Be concise. Example: Dreamy synth pads, a driving 808 bassline, and glitched vocal samples.");
export const generateRandomVocalStyle = () => generateRandomCreativeText("Generate a descriptive vocal style. Be concise. Example: Male, melancholic, with a slight rasp.");

export const generateAlbumCover = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Album cover art for a song. Cinematic, high detail, photorealistic. The theme is: "${prompt}"`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating album cover:", error);
        return null;
    }
};

export const submitSongForRelease = (
    song: SongLyrics,
    userName: string,
    userEmail: string,
    albumCoverBase64: string | null
): void => {
    const endpoint = "https://script.google.com/macros/s/AKfycbwknqbIwlXMKETquTtZIb8IyMDkBrkm84TKg8hXMzCSurjVM4A-OHRjpRoTzK408rKQ/exec";

    const lyricsText = `Title: ${song.title}\n\n${song.lyrics.map(part => `[${part.type}]\n${part.lines.join('\n')}`).join('\n\n')}`;

    const formData: { [key: string]: string } = {
        name: userName,
        email: userEmail,
        title: song.title,
        lyrics: lyricsText,
    };
    
    if (albumCoverBase64) {
        // The album cover from the Gemini API is JPEG
        formData.albumCover = albumCoverBase64;
        formData.albumCoverMimeType = 'image/jpeg';
    }

    // Create a form element dynamically
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = endpoint;
    form.target = '_blank'; // Open the response in a new tab

    // Add form data as hidden input fields
    for (const key in formData) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
    }
    
    // Append the form to the body, submit it, and then remove it
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
};
