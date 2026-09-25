import React, { useState } from 'react';
import { soundManager } from '../services/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetProgress,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.isMuted);

  if (!isOpen) return null;

  const toggleSound = () => {
    soundManager.isMuted = !soundManager.isMuted;
    setIsMuted(soundManager.isMuted);
    if (!soundManager.isMuted) {
      soundManager.playClick();
    }
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <h2 className="font-display font-bold text-lg text-white tracking-wide">
            Configurações & Controles
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-300">
          {/* Som */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <div>
              <div className="font-display font-bold text-sm text-white">Efeitos Sonoros</div>
              <div className="text-[11px] text-slate-400">Web Audio API sintetizada</div>
            </div>
            <button
              onClick={toggleSound}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                !isMuted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {!isMuted ? 'Ligado 🔊' : 'Mudo 🔇'}
            </button>
          </div>

          {/* Guia de Controles */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <h3 className="font-display font-bold text-sm text-white">Guia de Controles</h3>

            <div className="space-y-1.5 pt-1">
              <div className="text-slate-400 font-semibold">No Celular (Mobile):</div>
              <div className="text-[11px] text-slate-300">
                Botões virtuais na tela: ◀ / ▶ para andar, ▲ para pular, ⚔️ para atacar, ✦ Especial e ⚡ Suprema.
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="text-slate-400 font-semibold">No Teclado (PC):</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">A / D</kbd> : Mover</div>
                <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">W / Espaço</kbd> : Pular</div>
                <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">J</kbd> : Ataque Básico</div>
                <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">K</kbd> : Habilidade Especial</div>
                <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-200">L</kbd> : Suprema</div>
              </div>
            </div>
          </div>

          {/* Apagar Progresso */}
          <div className="pt-2 border-t border-slate-800">
            {showConfirmReset ? (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/70 space-y-2.5">
                <div className="text-rose-200 font-bold text-xs">
                  Tem certeza que deseja apagar todo o progresso?
                </div>
                <div className="text-[11px] text-rose-300/80">
                  Esta ação reiniciará todas as Gemas, personagens obtidos e níveis para o estado inicial com um novo guerreiro aleatório.
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 font-display font-bold text-white text-xs uppercase"
                  >
                    Confirmar Reset
                  </button>
                  <button
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full py-2.5 rounded-xl border border-rose-900/60 hover:border-rose-700 text-rose-400 hover:text-rose-300 bg-rose-950/20 text-xs font-semibold transition-colors"
              >
                Apagar Progresso (Reset do Jogo)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
