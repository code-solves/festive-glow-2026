
import React, { useState, useEffect } from 'react';
import { Sparkles, Globe, MapPin, Loader2 } from 'lucide-react';
import { getCityFromCoords } from '../services/geminiService.ts';

const Hero: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState<string>('Detecting location...');
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  // Evergreen year calculation
  const targetYear = time.getMonth() >= 6 ? time.getFullYear() + 1 : time.getFullYear();

  useEffect(() => {
    // 1. Live clock update
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // 2. Initial detection via Timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz === 'UTC' || tz === 'Atlantic/Reykjavik' || tz === 'Africa/Accra') {
        // Explicitly set to Greenwich Mean Time for Ghana/UTC region fallbacks
        setLocation('Greenwich Mean Time');
      } else {
        const city = tz.split('/').pop()?.replace('_', ' ') || 'Local Time';
        setLocation(city);
      }
      setIsLocating(false);
    } catch (e) {
      setLocation('Local Time');
      setIsLocating(false);
    }

    // 3. Precision Geolocation with AI Refinement
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });
          setIsLocating(true);
          
          // Use Gemini to get the actual City/Country name (e.g., "Accra, Ghana")
          const accurateName = await getCityFromCoords(latitude, longitude);
          setLocation(accurateName);
          setIsLocating(false);
        },
        (error) => {
          console.log("Geolocation blocked. Using timezone/GMT fallback.");
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const getLocalComponents = (date: Date) => {
    return {
      hrs: date.getHours().toString().padStart(2, '0'),
      min: date.getMinutes().toString().padStart(2, '0'),
      sec: date.getSeconds().toString().padStart(2, '0'),
    };
  };

  const localTime = getLocalComponents(time);

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 space-y-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <div className={`inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-5 py-2 rounded-full text-amber-500 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs shadow-xl shadow-amber-500/5 transition-all hover:bg-amber-500/20 ${isLocating ? 'animate-pulse' : ''}`}>
            {isLocating ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} className="animate-spin-slow" />}
            {isLocating ? 'Synchronizing Location...' : `Live in ${location}`}
          </div>
          {coords && !isLocating && (
            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono tracking-widest uppercase opacity-60">
              <MapPin size={10} className="text-amber-600" />
              {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <h1 className="text-8xl md:text-[11.5rem] font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 leading-none py-2 drop-shadow-2xl">
            {targetYear}
          </h1>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white tracking-tight -mt-4 drop-shadow-lg">
            Happy New Year
          </h2>
        </div>

        {/* The 3-Card Grid Clock */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-2xl mx-auto pt-4">
          {[
            { label: 'Hours', value: localTime.hrs },
            { label: 'Minutes', value: localTime.min },
            { label: 'Seconds', value: localTime.sec, active: true },
          ].map((item) => (
            <div 
              key={item.label} 
              className={`bg-slate-900/40 backdrop-blur-xl border border-white/10 p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] transition-all hover:border-amber-500/30 group ${item.active ? 'ring-1 ring-amber-500/20 shadow-2xl shadow-amber-500/10 scale-105' : ''}`}
            >
              <span className={`block text-3xl md:text-6xl font-mono font-bold tracking-tighter tabular-nums ${item.active ? 'text-amber-400' : 'text-white'}`}>
                {item.value}
              </span>
              <span className="text-[8px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500 mt-2 md:mt-4 block font-black group-hover:text-amber-500/70 transition-colors">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light italic mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          "Welcome to {targetYear}. New horizons await in your most beautiful year yet."
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-20 w-px bg-gradient-to-t from-amber-500/40 to-transparent"></div>
    </div>
  );
};

export default Hero;
