
import React, { useState, useRef } from 'react';
import { X, Upload, UserPlus, Image as ImageIcon } from 'lucide-react';
import { RelationshipType } from '../types.ts';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, relationship: string, imageFile: string) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<string>(RelationshipType.FRIEND);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Please upload an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && previewUrl) {
      onAdd(name, relationship, previewUrl);
      setName('');
      setPreviewUrl(null);
      setRelationship(RelationshipType.FRIEND);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <h2 className="text-2xl font-serif font-bold flex items-center gap-3">
            <UserPlus className="text-amber-500" />
            Add Someone Special
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Full Name</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Grandma Rose"
                className="w-full bg-slate-800/40 border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all text-white placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Relationship</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(RelationshipType).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setRelationship(type)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      relationship === type 
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                        : 'bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-bold">Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer border-2 border-dashed rounded-3xl transition-all h-48 flex flex-col items-center justify-center overflow-hidden ${
                  previewUrl ? 'border-amber-500/50' : 'border-white/10 hover:border-amber-500/30 bg-slate-800/20'
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                      <ImageIcon className="text-white" />
                      <span className="ml-2 text-white font-medium">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="text-slate-400 group-hover:text-amber-500" size={24} />
                    </div>
                    <p className="text-slate-400 text-sm">Drop a beautiful photo here</p>
                    <p className="text-slate-600 text-[10px] mt-1 uppercase tracking-widest">Max 5MB</p>
                  </div>
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={!name || !previewUrl}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 py-4 rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            Create Greeting
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
