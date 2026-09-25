import React from 'react';
import { CharacterDef } from '../types/game';
import { RARITY_BADGE_STYLE } from '../data/characters';
import { soundManager } from '../services/audio';

interface StarterRevealModalProps {
  character: CharacterDef;
  onClaim: () => void;
}

export const StarterRevealModal: React.FC<StarterRevealModalProps> = ({
  character,
  onClaim,
}) => {
  const badge = RARITY_BADGE_STYLE[character.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center flex flex-col items-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold px-3 py-1 rounded-full bg-amber-950/60 border border-amber-600/50 mb-3">
          ★ BOAS-VINDAS AO ANIME WAVE ★
        </div>

        <h2 className="font-display font-black text-2xl text-white tracking-wide">
          Seu Primeiro Guerreiro!
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Você recebeu um guerreiro aleatório gratuitamente para iniciar sua jornada.
        </p>

        {/* Cartão do Herói */}
        <div
          className={`my-5 w-full p-5 rounded-2xl border flex flex-col items-center justify-center ${badge.bg} ${badge.border} ${badge.glow} transition-all`}
        >
          <div
            className="w-18 h-18 rounded-2xl flex items-center justify-center font-display font-black text-white text-3xl shadow-lg mb-3"
            style={{ backgroundColor: character.outfitColor }}
          >
            {character.name.charAt(0)}
          </div>

          <span className={`text-xs font-bold ${badge.text} uppercase tracking-wider`}>
            {character.rarity} · {character.animeSource}
          </span>
          <h3 className="font-display font-black text-2xl text-white mt-0.5">
            {character.name}
          </h3>
          <p className="text-xs italic text-slate-300 mt-1 max-w-xs">
            «{character.quote}»
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 w-full text-xs font-mono-numbers">
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Dano Inicial</span>
              <span className="font-bold text-rose-400 text-sm">⚔️ {character.baseDamage}</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800 text-center">
              <span className="text-slate-400 text-[10px] block">Vida Inicial</span>
              <span className="font-bold text-emerald-400 text-sm">❤️ {character.baseHp}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onClaim();
          }}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
        >
          Começar Aventura
        </button>
      </div>
    </div>
  );
};
