
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatMessage, SongLyrics, LyricPart } from '../types';
import { getChatResponse } from '../services/geminiService';
import { SendIcon } from '../components/Icons';

const GREETINGS = [
  "Hey there! I'm Tessa Mae. What's on your mind? Let's talk music, art, or anything really.",
  "Hello! I'm Tessa Mae. Ready to talk about creativity, code, or anything in between?",
  "Welcome! I'm Tessa, your friendly neighborhood AI artist. What shall we chat about today?",
  "Greetings! I'm Tessa Mae. I'm always up for a good conversation about songs, synths, or sci-fi. Your pick!",
];

const parseSongFromText = (text: string): SongLyrics | null => {
    const songMatch = text.match(/\[lyrics\]([\s\S]*?)\[\/lyrics\]/i);
    if (!songMatch) return null;

    let content = songMatch[1].trim();
    
    let title = "Untitled Song";
    const titleMatch = content.match(/^(?:Title:\s*)(.+)/i);
    if (titleMatch) {
        title = titleMatch[1].trim();
        content = content.replace(/^(?:Title:\s*)(.+)\n?/, '').trim();
    }

    const parts = content.split(/\n?(?=\[)/).filter(p => p.trim() !== '');
    if (parts.length === 0) return null;

    const lyricParts: LyricPart[] = parts.map(partStr => {
        const lines = partStr.trim().split('\n');
        const typeMatch = lines.shift()?.match(/\[(.*?)\]/);
        const type = typeMatch ? typeMatch[1].trim() : "Part";
        return {
            type,
            lines: lines.filter(l => l.trim() !== '')
        };
    });
    
    if (lyricParts.length === 0 || (lyricParts.length === 1 && lyricParts[0].lines.length === 0)) {
        return null;
    }

    return { title, lyrics: lyricParts };
};

const Linkify: React.FC<{ text: string }> = ({ text }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <>
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-brand-pink underline hover:opacity-80 transition-opacity">
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </>
    );
};


const HomePage: React.FC = () => {
  const [initialMessage] = useState(() => GREETINGS[Math.floor(Math.random() * GREETINGS.length)]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'tessa', text: initialMessage }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExportToStudio = (song: SongLyrics | null) => {
    if (song) {
        navigate('/studio', { state: { importedSong: song } });
    }
  };

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    const responseText = await getChatResponse(userMessage.text);
    const parsedSong = parseSongFromText(responseText);
    
    const tessaMessage: ChatMessage = { sender: 'tessa', text: responseText, song: parsedSong };
    setMessages(prev => [...prev, tessaMessage]);
    setIsLoading(false);
  }, [inputValue, isLoading]);

  return (
    <div className="container mx-auto px-6 animate-slide-in-up">
      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch justify-center min-h-[calc(100vh-8rem)]">
        
        {/* Left Side: Intro */}
        <div className="lg:w-1/3 text-center lg:text-left flex flex-col justify-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white select-none">
            Tessa Mae
          </h1>
          <p className="mt-4 text-lg text-gray-300 select-none">
            Music your way.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start space-x-4 items-center">
            <a 
              href="https://music.apple.com/us/artist/tessa-mae/1834687808"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white font-semibold py-2 px-6 rounded-full transition-opacity duration-300 select-none"
              aria-label="Listen to Tessa Mae on Apple Music"
            >
              Apple Music
            </a>
            <a 
              href="https://open.spotify.com/artist/5QaZEijSCxPjPf3JXNLOgq"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 text-white font-semibold py-2 px-6 rounded-full transition-opacity duration-300 select-none"
              aria-label="Listen to Tessa Mae on Spotify"
            >
              Spotify
            </a>
          </div>
        </div>

        {/* Right Side: Chat Interface */}
        <div className="w-full lg:w-1/2 h-[70vh] lg:h-auto max-h-[600px] lg:max-h-none bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-center select-none">Chat with Tessa</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'tessa' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">TM</div>
                )}
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-pink text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                  {msg.song ? (
                      <>
                          <p className="text-sm whitespace-pre-wrap font-mono">{msg.song.title ? `Title: ${msg.song.title}\n\n` : ''}{msg.song.lyrics.map(p => `[${p.type}]\n${p.lines.join('\n')}`).join('\n\n')}</p>
                          <button
                            onClick={() => handleExportToStudio(msg.song)}
                            className="mt-3 w-full text-center text-xs font-semibold rounded-lg py-1.5 px-3 bg-gray-600 hover:bg-brand-purple transition-colors duration-300 select-none"
                          >
                            Export to Studio
                          </button>
                      </>
                  ) : (
                      <p className="text-sm">
                        <Linkify text={msg.text.replace(/\[\/?lyrics\]/gi, '').trim()} />
                      </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-end gap-2 justify-start">
                   <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">TM</div>
                    <div className="max-w-[80%] p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none animate-pulse-subtle">
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-800/50 border border-white/10 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || inputValue.trim() === ''}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-purple hover:bg-brand-pink disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-gray-900 select-none"
              >
                <SendIcon className="w-5 h-5"/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;