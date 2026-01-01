
import React, { useState } from 'react';
import { Friend } from '../types.ts';
import { Sparkles, Trash2, RefreshCw, Check, AlertTriangle, Loader2, Send, Download, Link as LinkIcon, Lock } from 'lucide-react';
import { generateHighResCard } from '../services/canvasService.ts';

interface FriendCardProps {
  friend: Friend;
  onRemove: (id: string) => void;
  onRegenerate: (id: string) => void;
}

const FriendCard: React.FC<FriendCardProps> = ({ friend, onRemove, onRegenerate }) => {
  const [shareState, setShareState] = useState<'idle' | 'coming-soon'>('idle');
  const [downloadState, setDownloadState] = useState<'idle' | 'processing'>('idle');

  const handleDownload = async () => {
    setDownloadState('processing');
    try {
      const now = new Date();
      const year = now.getMonth() >= 6 ? now.getFullYear() + 1 : now.getFullYear();
      const cardDataUrl = await generateHighResCard(friend);
      const link = document.createElement('a');
      link.href = cardDataUrl;
      link.download = `${year}_Wish_${friend.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadState('idle');
    }
  };

  const handleShare = () => {
    // UI is kept, but functionality is toggled off as requested
    setShareState('coming-soon');
    setTimeout(() => setShareState('idle'), 2000);
  };

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={friend.imageUrl} 
          alt={friend.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent"></div>
        <button 
          onClick={() => onRemove(friend.id)}
          className="absolute top-5 right-5 p-2 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white backdrop-blur-md"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
              {friend.relationship}
            </span>
            <h3 className="text-2xl font-serif font-bold text-white mt-2 leading-tight">{friend.name}</h3>
          </div>
          <button 
            disabled={friend.isGenerating}
            onClick={() => onRegenerate(friend.id)}
            className="p-2 text-slate-500 hover:text-amber-500 transition-colors"
          >
            <RefreshCw size={18} className={friend.isGenerating ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="relative min-h-[90px] mb-8">
          <p className="text-slate-300 italic font-light leading-relaxed">
            {friend.isGenerating ? "Composing your message..." : `"${friend.message}"`}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleDownload}
            disabled={downloadState === 'processing'}
            className="flex items-center justify-center gap-2 bg-slate-800 text-white py-4 rounded-2xl font-bold text-xs transition-all hover:bg-slate-700 active:scale-95 disabled:opacity-50"
          >
            {downloadState === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            <span>Save HD</span>
          </button>
          
          <button 
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-xs transition-all active:scale-95 ${
              shareState === 'coming-soon' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 
              'bg-amber-500 text-slate-950 hover:bg-amber-400'
            }`}
          >
            {shareState === 'coming-soon' ? <Lock size={16} /> : <LinkIcon size={16} />}
            <span>{shareState === 'coming-soon' ? 'Coming Soon' : 'Live Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
