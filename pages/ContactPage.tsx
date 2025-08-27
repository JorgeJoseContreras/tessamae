
import React, { useState } from 'react';
import { ChevronDownIcon } from '../components/Icons';

const faqData = [
    {
        question: "Who is Tessa Mae?",
        answer: "Tessa Mae is a virtual music artist powered by AI. She was created by Adamo Group Holdings Limited Company to explore the intersection of technology and creativity. She can chat, write songs, and collaborate with users right here on this website."
    },
    {
        question: "How does the songwriting studio work?",
        answer: "You provide a theme, genre, and mood, and Tessa's AI will generate a complete set of song lyrics for you. You can then edit the lyrics yourself, or use the chat feature to ask Tessa to make specific changes. It's a true collaboration!"
    },
    {
        question: "What happens when I submit a song?",
        answer: "When you submit a song, the lyrics and your contact details are sent to the team behind Tessa Mae for review. If your song is selected for production and release, you will be contacted via email to set up your 50% royalty split. See our Legal page for more details."
    },
    {
        question: "Can I use the lyrics I generate for my own songs?",
        answer: "Absolutely! The lyrics you create in the studio are yours to use for your own personal projects. However, if you'd like the chance to have your song officially produced and released as a Tessa Mae track and earn royalties, use the 'Submit for Release' feature."
    },
    {
        question: "What AI model powers Tessa Mae?",
        answer: "Tessa Mae's conversational and songwriting abilities are powered by Google's advanced Gemini family of models. This allows her to understand context, generate creative text, and collaborate in real-time."
    },
    {
        question: "How is Tessa's 'voice' created?",
        answer: "Currently, Tessa's personality and creative abilities are expressed through text. While she doesn't have a singing voice yet, the music released under her name is created by human artists and producers who are inspired by the collaborative process on this platform."
    },
    {
        question: "Is Tessa Mae on social media?",
        answer: "Yes! You can follow Tessa's journey and get updates on new releases on her Instagram account @tessamaeofficial. You can find the link in the header of the site."
    },
    {
        question: "How often will new music be released?",
        answer: "The goal is to regularly release new music created through collaborations on this platform. Keep an eye on the 'Releases' page and follow on social media for the latest drops!"
    },
    {
        question: "What are the future plans for the Tessa Mae project?",
        answer: "The vision is to continuously evolve! This includes releasing more collaboratively created music, potentially exploring live virtual performances, and integrating more advanced AI capabilities to enhance the creative process. The community's involvement is key to shaping the future."
    },
    {
        question: "How can I support Tessa Mae?",
        answer: "The best way to support the project is to listen to the music on streaming platforms, share it with friends, and engage with the community. And of course, collaborating in the Songwriting Studio helps create the next wave of music!"
    },
    {
        question: "Who is Adamo Group Holdings Limited Company?",
        answer: "Adamo Group Holdings Limited Company is the creative and technical team that developed the Tessa Mae project. They are passionate about exploring new frontiers in art and technology."
    },
    {
        question: "I have a business inquiry. Who do I contact?",
        answer: "For all business, press, or other professional inquiries, please reach out to the team via the email address listed on our Privacy page."
    }
];

const FaqItem: React.FC<{ item: typeof faqData[0]; isOpen: boolean; onClick: () => void; }> = ({ item, isOpen, onClick }) => (
    <div className="border-b border-white/10">
        <button
            className="flex justify-between items-center w-full py-5 text-left"
            onClick={onClick}
            aria-expanded={isOpen}
            aria-controls={`faq-answer-${item.question.replace(/\s/g, '')}`}
        >
            <span className="text-lg font-medium text-white select-none">{item.question}</span>
            <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
        </button>
        <div 
            id={`faq-answer-${item.question.replace(/\s/g, '')}`}
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
            <div className="overflow-hidden">
                <p className="pb-5 text-gray-300 select-none">
                    {item.answer}
                </p>
            </div>
        </div>
    </div>
);


const ContactPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="container mx-auto px-6 animate-slide-in-up">
            <div className="max-w-3xl mx-auto py-16">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center select-none">Contact & FAQ</h1>
                <p className="mt-4 text-center text-lg text-gray-400 select-none">
                    Have questions? Find answers below. For anything else, reach out to us at <a href="mailto:aghlc.nm@gmail.com" className="text-brand-purple hover:text-brand-pink underline">aghlc.nm@gmail.com</a>.
                </p>

                <div className="mt-12">
                    {faqData.map((item, index) => (
                        <FaqItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onClick={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;