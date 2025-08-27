
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StudioPage from './pages/StudioPage';
import ContactPage from './pages/ContactPage';
import LegalPage from './pages/LegalPage';
import LatestReleasePage from './pages/LatestReleasePage';
import { InstagramIcon } from './components/Icons';

const App: React.FC = () => {
  const location = useLocation();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const navLinks = [
      { path: '/', label: 'Chat' },
      { path: '/studio', label: 'Studio' },
      { path: '/releases', label: 'Releases' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const controlHeader = () => {
      if (typeof window !== 'undefined') {
        // Hide header on scroll down, show on scroll up
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    window.addEventListener('scroll', controlHeader);
    return () => {
      window.removeEventListener('scroll', controlHeader);
    };
  }, [lastScrollY]);

  useEffect(() => {
    // A small delay allows the DOM to update before we measure the active link
    const timer = setTimeout(() => {
      const activeLinkEl = document.querySelector('nav a.active-nav-link') as HTMLElement;

      if (activeLinkEl && navContainerRef.current) {
          const navRect = navContainerRef.current.getBoundingClientRect();
          const linkRect = activeLinkEl.getBoundingClientRect();

          setSliderStyle({
              left: `${linkRect.left - navRect.left}px`,
              width: `${linkRect.width}px`,
              height: `${linkRect.height}px`,
              opacity: 1,
          });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, navLinks]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <div 
        className="fixed inset-x-0 top-0 z-50 bg-gradient-to-b from-black/50 to-transparent transition-transform duration-300"
        style={{ transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <header className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="font-script text-4xl select-none">
            <NavLink to="/">Tessa Mae</NavLink>
          </div>
          <nav ref={navContainerRef} className="relative hidden md:flex items-center gap-6 bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-full px-6 py-2 shadow-lg">
            {navLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `relative z-10 px-3 py-1 text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-white active-nav-link' : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
             <div
                className="absolute top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-brand-purple to-brand-pink p-[1.5px] transition-all duration-300 ease-out"
                style={sliderStyle}
              >
                <div className="w-full h-full bg-gray-900/50 rounded-md"></div>
              </div>
          </nav>
          <div className="flex items-center gap-4">
              <a href="https://instagram.com/tessamaeofficial" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon className="w-6 h-6 text-gray-400 hover:text-white transition-colors"/>
              </a>
          </div>
        </header>
      </div>

       {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <div className="relative flex justify-around items-center gap-2 bg-gray-900/70 backdrop-blur-md border border-white/10 rounded-full p-2 shadow-lg">
            {navLinks.map(({ path, label }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex-1 text-center relative z-10 px-3 py-2 text-sm font-medium transition-colors duration-300 rounded-full ${
                    isActive ? 'bg-brand-pink/20 text-white' : 'text-gray-400'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
      </nav>

      <main className="pt-24 pb-24">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/releases" element={<LatestReleasePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage />} />
        </Routes>
      </main>

      <footer className="container mx-auto px-6 py-6 text-sm text-gray-500">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
          <p className="select-none">&copy; {new Date().getFullYear()} Tessa Mae. All Rights Reserved.</p>
          <div className="flex gap-6">
            <NavLink to="/contact" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-brand-purple to-brand-pink transition-colors">Contact</NavLink>
            <NavLink to="/privacy" className="hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r from-brand-purple to-brand-pink transition-colors">Legal</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;