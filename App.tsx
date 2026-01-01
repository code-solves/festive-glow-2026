
import React, { useState, useEffect, useMemo } from 'react';
import Hero from './components/Hero.tsx';
import FriendCard from './components/FriendCard.tsx';
import UploadModal from './components/UploadModal.tsx';
import { Friend, RelationshipType } from './types.ts';
import { generateNewYearWish } from './services/geminiService.ts';
import { Plus, Sparkles, Gift, ArrowLeft, AlertCircle, Image as ImageIcon, Github, Globe, ExternalLink, MessageCircle, Mail, MapPin } from 'lucide-react';

// Declaration for the global confetti function provided by the CDN script in index.html
declare const confetti: any;

const App: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Evergreen year calculation
  const targetYear = useMemo(() => {
    const now = new Date();
    return now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
  }, []);

  const sharedCard = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const cardData = params.get('card');
    if (cardData) {
      try {
        const decodedString = decodeURIComponent(escape(atob(cardData)));
        const decoded = JSON.parse(decodedString);
        if (decoded.n && decoded.w) {
          return decoded;
        }
      } catch (e) {
        console.error("Link decoding error", e);
        return { error: true };
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('festive_glow_friends');
    if (saved) {
      try {
        setFriends(JSON.parse(saved));
      } catch (e) {
        console.error("Storage load error", e);
      }
    }
    setIsInitialLoading(false);
  }, []);

  useEffect(() => {
    if (!isInitialLoading) {
      localStorage.setItem('festive_glow_friends', JSON.stringify(friends));
    }
  }, [friends, isInitialLoading]);

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#7c3aed'],
      disableForReducedMotion: true
    });
  };

  const handleAddFriend = async (name: string, relationship: string, imageUrl: string) => {
    const newId = Date.now().toString();
    const newFriend: Friend = {
      id: newId,
      name,
      relationship,
      imageUrl,
      message: `Composing a special ${targetYear} message...`,
      isGenerating: true
    };

    setFriends(prev => [newFriend, ...prev]);

    try {
      const wish = await generateNewYearWish(name, relationship);
      setFriends(prev => prev.map(f => f.id === newId ? { ...f, message: wish, isGenerating: false } : f));
      triggerCelebration();
    } catch (error) {
      setFriends(prev => prev.map(f => f.id === newId ? { ...f, message: `Happy New Year ${targetYear}!`, isGenerating: false } : f));
    }
  };

  const resetView = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('card');
    window.history.replaceState({}, '', url.pathname);
    window.location.reload();
  };

  if (sharedCard) {
    if (sharedCard.error) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="text-amber-500 mb-6 animate-bounce" size={56} />
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Greeting Link Broken</h1>
          <p className="text-slate-400 max-w-xs mb-10 leading-relaxed">This link has been clipped or modified. Try asking your friend to share the "Live Link" again!</p>
          <button onClick={resetView} className="bg-amber-500 text-slate-950 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-amber-400 transition-all">
            <ArrowLeft size={18} /> Back Home
          </button>
        </div>
      );
    }

    const isFallback = sharedCard.i === 'f';

    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full text-amber-500 font-bold tracking-widest text-[10px] uppercase mb-4">
              <Sparkles size={14} className="animate-pulse" />
              FestiveGlow {targetYear}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="aspect-[4/5] relative rounded-[2.5rem] overflow-hidden bg-slate-800 flex items-center justify-center border border-white/5 shadow-inner">
                {isFallback ? (
                  <div className="flex flex-col items-center gap-6 text-center p-12">
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center animate-bounce">
                       <Gift className="text-amber-500" size={48} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-amber-400 font-serif text-xl italic leading-tight">A gift from across the digital horizon</p>
                    </div>
                  </div>
                ) : (
                  <img src={sharedCard.i} alt={sharedCard.n} className="w-full h-full object-cover relative z-10" crossOrigin="anonymous" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent"></div>
              </div>
            </div>
            
            <div className="px-10 pb-14 text-center relative z-20">
              <span className="text-amber-500 font-bold tracking-[0.4em] uppercase text-[10px] block mb-4 opacity-70">Happy New Year</span>
              <h2 className="text-4xl font-serif font-bold text-white mb-6 leading-tight">{sharedCard.n}</h2>
              <p className="text-xl text-slate-200 italic font-light leading-relaxed">"{sharedCard.w}"</p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button onClick={resetView} className="text-slate-500 hover:text-white flex items-center gap-2 mx-auto text-sm transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5">
              <Plus size={16} /> Create your own card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 selection:bg-amber-500/30">
      <nav className="fixed top-0 w-full z-40 bg-slate-950/50 backdrop-blur-xl border-b border-white/5 h-24 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="text-slate-950" size={24} />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight">FestiveGlow</span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="bg-white text-slate-950 px-8 py-3 rounded-full font-bold hover:bg-amber-400 transition-all shadow-xl shadow-white/5 flex items-center gap-2 hover:scale-105 active:scale-95">
            <Plus size={20} /> Add Person
          </button>
        </div>
      </nav>

      <main className="pt-24">
        <Hero />
        <section id="gallery" className="max-w-7xl mx-auto px-6 md:px-12 pt-20">
          <div className="mb-16">
            <h2 className="text-5xl font-serif font-bold text-white mb-4">Your Circle</h2>
            <p className="text-slate-400 text-lg">Send personalized cards to your friends and family.</p>
          </div>
          
          {friends.length === 0 ? (
            <div className="py-40 border-2 border-dashed border-white/5 rounded-[4rem] text-center bg-white/[0.01]">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="text-slate-600" size={32} />
              </div>
              <p className="text-slate-500 text-lg mb-8">No greetings created yet.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-amber-500 font-bold text-lg hover:text-amber-400 underline underline-offset-8">
                Start by adding someone
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {friends.map(friend => (
                <FriendCard 
                  key={friend.id} 
                  friend={friend} 
                  onRemove={(id) => setFriends(f => f.filter(x => x.id !== id))} 
                  onRegenerate={async (id) => {
                    setFriends(f => f.map(x => x.id === id ? { ...x, isGenerating: true } : x));
                    try {
                      const wish = await generateNewYearWish(friend.name, friend.relationship);
                      setFriends(f => f.map(x => x.id === id ? { ...x, message: wish, isGenerating: false } : x));
                      triggerCelebration();
                    } catch (e) {
                      setFriends(f => f.map(x => x.id === id ? { ...x, isGenerating: false } : x));
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddFriend} />
      
      <footer className="mt-40 py-32 border-t border-white/5 text-center bg-[#020617] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center gap-12">
            
            <div className="space-y-6">
              <p className="text-slate-600 text-[10px] tracking-[0.6em] uppercase font-black opacity-60">Digital Architecture By</p>
              
              <a 
                href="https://github.com/GovWebDesign" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex flex-col items-center gap-6"
              >
                <div className="w-16 h-16 relative p-[2px] bg-gradient-to-tr from-white/20 to-transparent rounded-[1.4rem] transition-all group-hover:from-amber-500/30 group-hover:scale-105 shadow-2xl">
                  <div className="absolute inset-0 bg-slate-950 rounded-[1.4rem]"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-amber-500">
                    <svg viewBox="0 0 100 100" className="w-8 h-8 fill-current">
                      <rect x="25" y="25" width="20" height="50" rx="3" />
                      <rect x="55" y="25" width="20" height="18" rx="3" opacity="0.8" />
                      <rect x="55" y="52" width="20" height="23" rx="3" opacity="0.6" />
                    </svg>
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-3xl font-serif font-bold text-amber-500 tracking-tight transition-all group-hover:text-amber-400 flex items-center gap-3 justify-center">
                    GovWebDesign
                    <ExternalLink size={16} className="text-slate-700 group-hover:text-amber-500 transition-colors" />
                  </h3>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto mt-3 font-light leading-relaxed">
                    Engineering rapid-deployment web ecosystems for ambitious brands.
                  </p>
                </div>
              </a>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <a 
                  href="https://wa.me/+233508772690" 
                  target="_blank" 
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest"
                >
                  <MessageCircle size={14} className="text-amber-500" />
                  WhatsApp Consultation
                </a>
                <a 
                  href="mailto:beatricekwarteng142@gmail.com" 
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white border border-white/10 text-[10px] font-bold uppercase tracking-widest"
                >
                  <Mail size={14} className="text-amber-500" />
                  Project Inquiry
                </a>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 py-8 px-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-amber-500 font-bold text-lg">48h</span>
                 <span className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">Live Delivery</span>
               </div>
               <div className="w-px h-8 bg-white/5"></div>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-amber-500 font-bold text-lg flex items-center gap-1">
                   Accra <MapPin size={14} />
                 </span>
                 <span className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">Base Hub</span>
               </div>
            </div>

            <div className="pt-16 border-t border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-slate-600 text-[9px] uppercase tracking-[0.4em] font-medium">
                &copy; {new Date().getFullYear()} GovWebDesign • Designed for the Future.
              </p>
              <div className="flex items-center gap-6">
                <a href="https://github.com/GovWebDesign" target="_blank" className="text-slate-600 hover:text-amber-500 transition-colors">
                  <Github size={18} />
                </a>
                <a href="https://github.com/GovWebDesign" target="_blank" className="text-slate-600 hover:text-amber-500 transition-colors">
                  <Globe size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
