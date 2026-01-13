
import React from 'react';
import { Drama } from '../types';

interface DramaCardProps {
  drama: Drama;
  onClick: () => void;
}

const DramaCard: React.FC<DramaCardProps> = ({ drama, onClick }) => {
  return (
    <div onClick={onClick} className="group cursor-pointer space-y-3">
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        <img src={drama.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={drama.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
           <p className="text-[10px] text-white font-bold">{drama.episodes.length} Episode</p>
        </div>
        <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[8px] px-2 py-1 rounded-md shadow-lg">
           TOP {Math.floor(Math.random() * 10) + 1}
        </div>
      </div>
      <h3 className="font-bold text-sm leading-tight text-slate-200 group-hover:text-amber-500 transition-colors">{drama.title}</h3>
    </div>
  );
};

export default DramaCard;
