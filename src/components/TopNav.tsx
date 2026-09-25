import React from 'react';
import { GameSaveData, CharacterDef } from '../types/game';

interface TopNavProps {
  saveData: GameSaveData;
  activeCharacter: CharacterDef;
  onOpenGacha: () => void;
  onOpenRoster: () => void;
  onOpenAccessories: () => void;
  onOpenBlessings: () => void;
  onOpenSettings: () => void;
  onStartBattle: () => void;
  isPlaying: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  saveData,
  activeCharacter,
  onOpenGacha,
  onOpenRoster,
  onOpenAccessories,
  onOpenBlessings,
  onOpenSettings,
  onStartBattle,
  isPlaying,
}) => {
  if (isPlaying) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Marca / Nome do Jogo */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400 whitespace-nowrap">
              ANIME WAVE
            </span>
            <span className="text-[10px] text-slate-400 tracking-tight font-medium -mt-1 hidden sm:block">
              Ação 2D · Ondas & Gacha
            </span>
          </div>
        </div>

        {/* Zone 2: Links / Atalhos Principais (Visível em Desktop/Tablet) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={onOpenRoster}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Personagens
          </button>
          <button
            onClick={onOpenGacha}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Invocar (Gacha)
          </button>
          <button
            onClick={onOpenAccessories}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Acessórios
          </button>
          <button
            onClick={onOpenBlessings}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Bênçãos
          </button>
          <button
            onClick={onOpenSettings}
            className="hover:text-amber-400 transition-colors whitespace-nowrap"
          >
            Ajustes
          </button>
        </nav>

        {/* Zone 3: Moeda Gemas & Botão Primário Jogar */}
        <div className="flex items-center gap-3">
          {/* Contador de Gemas */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-cyan-300 shadow-sm shrink-0">
            <span className="text-sm">💎</span>
            <span className="font-mono-numbers text-sm text-cyan-200">
              {saveData.gems}
            </span>
            <span className="text-[10px] text-slate-400 font-normal hidden xs:inline">Gemas</span>
          </div>

          {/* Botão Jogar / Iniciar Batalha */}
          <button
            onClick={onStartBattle}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Batalhar
          </button>
        </div>
      </div>
    </header>
  );
};
