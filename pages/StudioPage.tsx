import React, { useState, useCallback, Fragment, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { SongLyrics, ChatMessage } from '../types';
import { generateLyrics, submitSongForRelease, editLyrics, generateRandomIdea, generateRandomStructure, generateRandomInstrumentation, generateRandomVocalStyle, generateAlbumCover } from '../services/geminiService';
import { CheckCircleIcon, XMarkIcon, SendIcon, PrintIcon, ClipboardIcon } from '../components/Icons';

// --- HELPER & UI COMPONENTS (defined outside the main component to prevent re-creation on render) ---

const GENRES = ["Pop", "Rock", "Hip-Hop", "Electronic", "R&B", "Indie Folk", "Synthwave", "Country", "Jazz", "Classical", "Ambient", "Metal"];
const MOODS = ["Happy", "Sad", "Energetic", "Melancholic", "Romantic", "Hopeful", "Aggressive"];
const EXAMPLE_PROMPTS = ["A robot falling in love with a star", "The last message from a disappearing spaceship", "Finding magic in a rainy city", "A cyberpunk detective story", "An anthem for a lazy Sunday morning", "Two ghosts who miss each other"];
const EXAMPLE_STRUCTURES = ["Verse, Chorus, Verse, Bridge, Chorus", "Intro, Verse, Pre-Chorus, Chorus, Outro", "Verse 1, Verse 2, Chorus, Guitar Solo, Chorus", "AABA, with an instrumental break"];
const EXAMPLE_INSTRUMENTATION = ["Acoustic guitar, synth pads, drum machine", "Heavy electric guitars, pounding drums, bass", "Piano, strings, and a soft vocal harmony", "808 bass, trap hi-hats, and a synth lead"];
const EXAMPLE_VOCALS = ["Male, soulful, high-energy", "Female, ethereal, soft and breathy", "Androgynous, robotic, with vocoder effects", "Group vocals, like a choir"];
const EXAMPLE_EDIT_PROMPTS = ["Make the chorus more powerful...", "Can you rewrite the second verse?", "Add a bridge between the second chorus and the outro.", "Change the tone to be more hopeful.", "Make the lyrics shorter and punchier.", "Could you add more imagery about the ocean?"];
const LOADING_MESSAGES = ["Tuning the synths, finding the right words...", "Warming up the vocal circuits...", "Searching for the perfect rhyme...", "Mixing a new digital masterpiece...", "Crafting chords from the cosmos...", "Compiling a hit single..."];
const FONT_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl'];

const Confetti: React.FC = () => {
    const confettiCount = 50;
    const colors = ['#FF69B4', '#8A2BE2', '#FFFFFF', '#FBBF24'];

    const particles = Array.from({ length: confettiCount }).map((_, i) => {
        const style: React.CSSProperties = {
            position: 'absolute',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 6 + 4}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            top: `${Math.random() * -20}vh`,
            left: `${Math.random() * 100}vw`,
            animation: `confetti-fall ${Math.random() * 2 + 3}s linear ${Math.random() * 2}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
            opacity: 0,
        };
        return <div key={i} style={style} />;
    });

    return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[100]">{particles}</div>;
};

const SubmissionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmitted: () => void;
    song: SongLyrics;
    albumCover: string | null;
}> = ({ isOpen, onClose, onSubmitted, song, albumCover }) => {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmission = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim() || !userEmail.trim() || isSubmitting) return;

        setIsSubmitting(true);
        // This function now opens a new tab with the submission result
        submitSongForRelease(song, userName, userEmail, albumCover);
        onSubmitted();
        
        // Give a brief moment for the new tab to open before closing the modal
        setTimeout(() => {
            setIsSubmitting(false);
            onClose();
        }, 500);
    }
    
    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setUserName('');
            setUserEmail('');
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold select-none">Submit Your Song</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white select-none">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                <p className="text-sm text-gray-400 mb-6 select-none">Enter your details to submit "{song.title}". If selected for release by Tessa Mae on all music platforms, you will be entitled to 50% of all royalties.</p>
                <form onSubmit={handleSubmission} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1 select-none">Your Name</label>
                        <input id="name" type="text" value={userName} onChange={e => setUserName(e.target.value)} required className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all" placeholder="Your Name" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 select-none">Your Email</label>
                        <input id="email" type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} required className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all" placeholder="you@example.com" />
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 text-lg font-semibold rounded-lg py-3 px-6 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 select-none">
                        {isSubmitting ? "Opening Submission..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

const StudioPage: React.FC = () => {
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [mood, setMood] = useState(MOODS[0]);
  const [generatedLyrics, setGeneratedLyrics] = useState<SongLyrics | null>(null);
  const [originalLyrics, setOriginalLyrics] = useState<SongLyrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [lastGenerationParams, setLastGenerationParams] = useState<any>(null);

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({ structure: '', instrumentation: '', vocalStyle: '' });
  const [structurePlaceholder, setStructurePlaceholder] = useState('');
  const [instrumentationPlaceholder, setInstrumentationPlaceholder] = useState('');
  const [vocalStylePlaceholder, setVocalStylePlaceholder] = useState('');

  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [isGeneratingInstrumentation, setIsGeneratingInstrumentation] = useState(false);
  const [isGeneratingVocalStyle, setIsGeneratingVocalStyle] = useState(false);

  // Lyric appearance state
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // Default to 'text-base'
  const [copied, setCopied] = useState(false);

  // Lyric editing state
  const [editInput, setEditInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editChatHistory, setEditChatHistory] = useState<ChatMessage[]>([]);
  const [editPlaceholder, setEditPlaceholder] = useState('');

  // Album cover state
  const [albumCoverPrompt, setAlbumCoverPrompt] = useState('');
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const [coverError, setCoverError] = useState<string | null>(null);

  // Submission state
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);


  useEffect(() => {
    // Check for imported song from chat page
    const importedSong = location.state?.importedSong;
    if (importedSong) {
      setGeneratedLyrics(importedSong);
      setOriginalLyrics(importedSong);
      setEditChatHistory([{ sender: 'tessa', text: "Here's the song from our chat! Feel free to ask for changes." }]);
      window.history.replaceState({}, document.title);
    }

    // Set random placeholders
    setPlaceholder(EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]);
    setStructurePlaceholder(EXAMPLE_STRUCTURES[Math.floor(Math.random() * EXAMPLE_STRUCTURES.length)]);
    setInstrumentationPlaceholder(EXAMPLE_INSTRUMENTATION[Math.floor(Math.random() * EXAMPLE_INSTRUMENTATION.length)]);
    setVocalStylePlaceholder(EXAMPLE_VOCALS[Math.floor(Math.random() * EXAMPLE_VOCALS.length)]);
    setEditPlaceholder(EXAMPLE_EDIT_PROMPTS[Math.floor(Math.random() * EXAMPLE_EDIT_PROMPTS.length)]);
  }, [location.state]);


  const handleAdvancedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdvancedOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
        setError("Please enter a theme or idea for your song.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setEditChatHistory([]);
    setGeneratedCover(null); // Reset cover on new lyrics
    setAlbumCoverPrompt('');
    setIsSubmitted(false); // Reset submission status
    setLoadingMessage(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
    
    const currentParams = { prompt, genre, mood, advancedOptions };
    const result = await generateLyrics(prompt, genre, mood, advancedOptions);
    
    if (result) {
      setGeneratedLyrics(result);
      setOriginalLyrics(result);
      setLastGenerationParams(currentParams);
      setEditChatHistory([{ sender: 'tessa', text: "Here's what I came up with! Feel free to ask for changes." }]);
    } else {
      setError("I'm sorry, I couldn't come up with anything right now. Please try a different prompt.");
    }
    setIsLoading(false);
  }, [prompt, genre, mood, advancedOptions]);

  const handleRandomIdea = async () => {
    setIsGeneratingIdea(true);
    const idea = await generateRandomIdea();
    if (idea) { setPrompt(idea); }
    setIsGeneratingIdea(false);
  };

  const handleRandomStructure = async () => {
    setIsGeneratingStructure(true);
    const structure = await generateRandomStructure();
    if (structure) { setAdvancedOptions(prev => ({ ...prev, structure })); }
    setIsGeneratingStructure(false);
  };

  const handleRandomInstrumentation = async () => {
    setIsGeneratingInstrumentation(true);
    const instrumentation = await generateRandomInstrumentation();
    if (instrumentation) { setAdvancedOptions(prev => ({ ...prev, instrumentation })); }
    setIsGeneratingInstrumentation(false);
  };

  const handleRandomVocalStyle = async () => {
    setIsGeneratingVocalStyle(true);
    const vocalStyle = await generateRandomVocalStyle();
    if (vocalStyle) { setAdvancedOptions(prev => ({ ...prev, vocalStyle })); }
    setIsGeneratingVocalStyle(false);
  };

  const handleEditSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInput.trim() || isEditing || !generatedLyrics) return;
    
    const userMessage: ChatMessage = { sender: 'user', text: editInput.trim() };
    setEditChatHistory(prev => [...prev, userMessage]);
    setEditInput('');
    setIsEditing(true);

    const result = await editLyrics(generatedLyrics, userMessage.text);

    if (result) {
        setGeneratedLyrics(result);
        const tessaMessage: ChatMessage = { sender: 'tessa', text: "How's this?" };
        setEditChatHistory(prev => [...prev, tessaMessage]);
    } else {
        const tessaMessage: ChatMessage = { sender: 'tessa', text: "Sorry, I got a little stuck on that edit. Could you try rephrasing?" };
        setEditChatHistory(prev => [...prev, tessaMessage]);
    }
    setIsEditing(false);

  }, [isEditing, editInput, generatedLyrics]);
  
  const handleGenerateCover = async () => {
      if (!albumCoverPrompt.trim()) {
          setCoverError("Please describe your vision for the album cover.");
          return;
      }
      setIsGeneratingCover(true);
      setCoverError(null);
      const imageBytes = await generateAlbumCover(albumCoverPrompt);
      if (imageBytes) {
          setGeneratedCover(imageBytes);
      } else {
          setCoverError("Sorry, I couldn't create the cover. Please try a different prompt.");
      }
      setIsGeneratingCover(false);
  };
  
  const handleSubmitted = () => {
    setIsSubmitted(true);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000); // Confetti lasts for 5 seconds
  };

  // Editable lyrics handlers
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!generatedLyrics) return;
    setGeneratedLyrics({ ...generatedLyrics, title: e.target.value });
  };

  const handleLyricsChange = (partIndex: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!generatedLyrics) return;
    const newLyricsParts = [...generatedLyrics.lyrics];
    newLyricsParts[partIndex] = { ...newLyricsParts[partIndex], lines: e.target.value.split('\n') };
    setGeneratedLyrics({ ...generatedLyrics, lyrics: newLyricsParts });
    
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const hasBeenEdited = originalLyrics && JSON.stringify(originalLyrics) !== JSON.stringify(generatedLyrics);
  const handleRevert = () => {
    if (originalLyrics) { setGeneratedLyrics(originalLyrics); }
  };

  const handleIncreaseFontSize = () => setFontSizeIndex(prev => Math.min(FONT_SIZES.length - 1, prev + 1));
  const handleDecreaseFontSize = () => setFontSizeIndex(prev => Math.max(0, prev - 1));

  const handleCopy = () => {
    if (!generatedLyrics) return;
    const textToCopy = `Title: ${generatedLyrics.title}\n\n${generatedLyrics.lyrics.map(part => `[${part.type}]\n${part.lines.join('\n')}`).join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const CustomSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    disabled?: boolean;
  }> = ({ label, value, onChange, options, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    const handleSelectOption = (option: string) => {
      onChange(option);
      setIsOpen(false);
    };
  
    return (
      <div className="flex-1" ref={selectRef}>
        <label htmlFor={label.toLowerCase()} className="block text-sm font-medium text-gray-300 mb-1 select-none">{label}</label>
        <div className="relative">
          <button
            type="button" id={label.toLowerCase()} disabled={disabled} onClick={() => setIsOpen(!isOpen)}
            aria-haspopup="listbox" aria-expanded={isOpen}
            className="w-full text-left bg-gray-800 border border-white/10 rounded-lg py-2 px-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all flex justify-between items-center select-none"
          >
            {value}
            <div className="pointer-events-none inset-y-0 right-0 flex items-center text-gray-300">
              <svg className={`fill-current h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </button>
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-white/10 rounded-lg shadow-lg max-h-60 overflow-auto animate-fade-in" role="listbox">
              {options.map((option) => (
                <div
                  key={option} onClick={() => handleSelectOption(option)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSelectOption(option)}
                  role="option" aria-selected={value === option} tabIndex={0}
                  className="cursor-pointer select-none relative py-2 px-4 text-white hover:text-brand-pink transition-colors duration-150"
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const getButtonText = () => {
    if (isLoading) return "Thinking...";
    if (!generatedLyrics || !lastGenerationParams) return "Generate Lyrics";
    const paramsChanged = lastGenerationParams.prompt !== prompt || lastGenerationParams.genre !== genre || lastGenerationParams.mood !== mood || lastGenerationParams.advancedOptions.structure !== advancedOptions.structure || lastGenerationParams.advancedOptions.instrumentation !== advancedOptions.instrumentation || lastGenerationParams.advancedOptions.vocalStyle !== advancedOptions.vocalStyle;
    return paramsChanged ? "Generate New Lyrics" : "Regenerate Lyrics";
  };


  return (
    <Fragment>
      {showConfetti && <Confetti />}
      {generatedLyrics && <SubmissionModal isOpen={isSubmissionModalOpen} onClose={() => setIsSubmissionModalOpen(false)} onSubmitted={handleSubmitted} song={generatedLyrics} albumCover={generatedCover} />}
      <div className="container mx-auto px-6 animate-slide-in-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight select-none">Songwriting Studio</h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-300 select-none">Let's create a song together. Give me a theme, genre, and a mood, I'll take care of the rest!</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="p-8 bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-1 select-none">Theme / Idea</label>
                <div className="relative">
                  <input
                    id="prompt" type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`e.g., ${placeholder}`}
                    className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-4 pr-16 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                    disabled={isLoading || isGeneratingIdea}
                  />
                  <button
                    type="button" onClick={handleRandomIdea} disabled={isLoading || isGeneratingIdea}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 flex items-center justify-center rounded-md bg-brand-pink hover:opacity-90 disabled:opacity-50 transition-all text-white font-bold text-xs px-2.5 select-none"
                    aria-label="Generate random idea"
                  >
                    AI ✨
                  </button>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                <CustomSelect label="Genre" value={genre} onChange={setGenre} options={GENRES} disabled={isLoading} />
                <CustomSelect label="Mood" value={mood} onChange={setMood} options={MOODS} disabled={isLoading} />
              </div>
              
              <div className="space-y-4 pt-2">
                  <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-brand-purple hover:text-brand-pink font-semibold transition-colors duration-300 select-none">
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                  </button>
                  {showAdvanced && (
                      <div className="p-4 bg-gray-900/50 border border-white/20 rounded-lg space-y-4 animate-fade-in">
                          <div>
                              <label htmlFor="structure" className="block text-xs font-medium text-gray-400 mb-1 select-none">Song Structure</label>
                              <div className="relative">
                                  <input
                                      id="structure" name="structure" type="text"
                                      value={advancedOptions.structure} onChange={handleAdvancedChange}
                                      placeholder={`e.g., ${structurePlaceholder}`}
                                      className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                      disabled={isLoading || isGeneratingStructure}
                                  />
                                  <button
                                      type="button" onClick={handleRandomStructure} disabled={isLoading || isGeneratingStructure}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 flex items-center justify-center rounded-md bg-brand-pink hover:opacity-90 disabled:opacity-50 transition-all text-white font-bold text-xs px-2.5 select-none"
                                      aria-label="Generate random song structure"
                                  >
                                      AI ✨
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="instrumentation" className="block text-xs font-medium text-gray-400 mb-1 select-none">Instrumentation</label>
                              <div className="relative">
                                  <input
                                      id="instrumentation" name="instrumentation" type="text"
                                      value={advancedOptions.instrumentation} onChange={handleAdvancedChange}
                                      placeholder={`e.g., ${instrumentationPlaceholder}`}
                                      className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                      disabled={isLoading || isGeneratingInstrumentation}
                                  />
                                  <button
                                      type="button" onClick={handleRandomInstrumentation} disabled={isLoading || isGeneratingInstrumentation}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 flex items-center justify-center rounded-md bg-brand-pink hover:opacity-90 disabled:opacity-50 transition-all text-white font-bold text-xs px-2.5 select-none"
                                      aria-label="Generate random instrumentation"
                                  >
                                      AI ✨
                                  </button>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="vocalStyle" className="block text-xs font-medium text-gray-400 mb-1 select-none">Vocal Style</label>
                              <div className="relative">
                                  <input
                                      id="vocalStyle" name="vocalStyle" type="text"
                                      value={advancedOptions.vocalStyle} onChange={handleAdvancedChange}
                                      placeholder={`e.g., ${vocalStylePlaceholder}`}
                                      className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                                      disabled={isLoading || isGeneratingVocalStyle}
                                  />
                                  <button
                                      type="button" onClick={handleRandomVocalStyle} disabled={isLoading || isGeneratingVocalStyle}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-7 flex items-center justify-center rounded-md bg-brand-pink hover:opacity-90 disabled:opacity-50 transition-all text-white font-bold text-xs px-2.5 select-none"
                                      aria-label="Generate random vocal style"
                                  >
                                      AI ✨
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </div>

              <button
                type="button" onClick={handleGenerate} disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-lg font-semibold rounded-lg py-3 px-6 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-gray-900 select-none"
              >
                {getButtonText()}
              </button>
              {error && <p className="text-red-400 text-center">{error}</p>}
           </div>

          {isLoading && !generatedLyrics && (
            <div className="mt-8 text-center animate-pulse-subtle">
              <p className="text-lg text-gray-400 select-none">{loadingMessage}</p>
            </div>
          )}

          {generatedLyrics && (
            <div className="mt-12 animate-fade-in">
              <div id="lyrics-print-area" className="p-8 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
                <div className="flex justify-end items-center gap-2 mb-4 -mt-2">
                    {hasBeenEdited && (
                      <button 
                        onClick={handleRevert}
                        className="text-sm font-semibold text-brand-purple hover:text-brand-pink transition-colors duration-300 mr-auto select-none"
                        aria-label="Revert to original lyrics"
                      >
                        Revert to Original
                      </button>
                    )}
                     <button 
                        onClick={handleCopy}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors select-none"
                        aria-label="Copy lyrics"
                     >
                        {copied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                     </button>
                     <button 
                        onClick={() => window.print()}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors select-none"
                        aria-label="Print lyrics"
                    >
                        <PrintIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleDecreaseFontSize} disabled={fontSizeIndex === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors select-none"
                        aria-label="Decrease font size"
                    >
                        <span className="text-xs">A</span>
                    </button>
                    <button 
                        onClick={handleIncreaseFontSize} disabled={fontSizeIndex === FONT_SIZES.length - 1}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors select-none"
                        aria-label="Increase font size"
                    >
                        <span className="text-lg">A</span>
                    </button>
                </div>

                <input
                  type="text" value={generatedLyrics.title} onChange={handleTitleChange}
                  className={`w-full bg-transparent text-3xl font-bold text-center mb-6 focus:outline-none focus:ring-0 p-2 border-b border-transparent font-mono select-none`}
                  aria-label="Song Title"
                />
                <div className="space-y-6 text-gray-200">
                  {generatedLyrics.lyrics.map((part, index) => (
                    <div key={index}>
                      <h3 className={`font-bold text-brand-pink mb-2 font-mono select-none`}>{part.type}</h3>
                      <textarea
                        value={part.lines.join('\n')} onChange={(e) => handleLyricsChange(index, e)}
                        className={`w-full bg-transparent p-2 rounded-md resize-none overflow-hidden focus:outline-none font-mono ${FONT_SIZES[fontSizeIndex]}`}
                        rows={part.lines.length}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
                <div className="h-48 overflow-y-auto p-2 space-y-4">
                    {editChatHistory.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'tessa' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-purple to-brand-pink flex-shrink-0 flex items-center justify-center font-bold text-sm select-none">TM</div>
                            )}
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-brand-pink text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isEditing && (
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
                </div>
                 <form onSubmit={handleEditSubmit} className="mt-2 flex items-center space-x-2">
                    <input
                        type="text" value={editInput} onChange={(e) => setEditInput(e.target.value)}
                        placeholder={`e.g., ${editPlaceholder}`}
                        className="flex-1 bg-gray-800/50 border border-white/10 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                        disabled={isEditing}
                    />
                    <button
                        type="submit" disabled={isEditing || editInput.trim() === ''}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-purple hover:bg-brand-pink disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-gray-900 select-none"
                        aria-label="Send edit request"
                    >
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </form>
              </div>

              <div className="mt-8 p-8 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
                 <h3 className="text-xl font-bold text-center mb-4 select-none">Want an album cover?</h3>
                 <div className="space-y-4">
                     <div>
                        <label htmlFor="cover-prompt" className="block text-sm font-medium text-gray-300 mb-1 select-none">Describe your vision</label>
                        <input
                            id="cover-prompt"
                            type="text"
                            value={albumCoverPrompt}
                            onChange={(e) => setAlbumCoverPrompt(e.target.value)}
                            placeholder="e.g., a neon cat on a retro spaceship"
                            className="w-full bg-gray-800/50 border border-white/10 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-purple transition-all"
                            disabled={isGeneratingCover}
                        />
                     </div>
                     <button
                        type="button"
                        onClick={handleGenerateCover}
                        disabled={isGeneratingCover}
                        className="w-full flex items-center justify-center gap-2 text-md font-semibold rounded-lg py-2.5 px-6 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:ring-offset-2 focus:ring-offset-gray-900 select-none"
                    >
                        {isGeneratingCover ? 'Creating...' : 'Generate Cover'}
                    </button>
                    {coverError && <p className="text-red-400 text-center text-sm">{coverError}</p>}
                 </div>
                 {isGeneratingCover && (
                    <div className="mt-6 text-center text-gray-400 animate-pulse-subtle">
                        <p className="select-none">Painting with pixels, please wait...</p>
                    </div>
                 )}
                 {generatedCover && (
                    <div className="mt-6">
                        <img 
                            src={`data:image/jpeg;base64,${generatedCover}`} 
                            alt="AI Generated Album Cover"
                            className="w-full aspect-square rounded-lg shadow-lg select-none pointer-events-none"
                        />
                    </div>
                 )}
              </div>

              <div className="mt-8 flex flex-col items-center gap-6 pb-12">
                  {isSubmitted ? (
                     <div className="mt-4 flex items-center justify-center gap-2 text-lg font-semibold text-green-400 select-none animate-fade-in">
                        <CheckCircleIcon className="w-6 h-6" />
                        Submitted!
                     </div>
                  ) : (
                    <button 
                      onClick={() => setIsSubmissionModalOpen(true)}
                      className="mt-4 text-lg font-semibold rounded-lg py-3 px-8 bg-gradient-to-r from-brand-purple to-brand-pink hover:opacity-90 transition-opacity duration-300 select-none"
                    >
                      Submit for Release
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StudioPage;