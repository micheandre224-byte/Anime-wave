import React from 'react';

interface StageResultModalProps {
  isOpen: boolean;
  isVictory: boolean;
  waveReached: number;
  defeatedCount: number;
  gemsEarned: number;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
  onOpenBlessings?: () => void;
}

export const StageResultModal: React.FC<StageResultModalProps> = ({
  isOpen,
  isVictory,
  waveReached,
  defeatedCount,
  gemsEarned,
  onPlayAgain,
  onReturnToMenu,
  onOpenBlessings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-center flex flex-col items-center">
        {/* Ícone de Destaque */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-xl border ${
            isVictory
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]'
              : 'bg-rose-950/80 border-rose-500/80 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]'
          }`}
        >
          {isVictory ? '🏆' : '💀'}
        </div>

        {/* Título */}
        <h2 className="font-display font-black text-2xl tracking-wide text-white uppercase">
          {isVictory ? 'Fase Concluída!' : 'Guerreiro Abatido'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {isVictory
            ? 'Você superou todas as 4 ondas e derrotou o Mini-Boss com louvor!'
            : `Sua jornada foi interrompida na Onda ${waveReached} de 4.`}
        </p>

        {/* Recompensa de 50 Gemas (Regra central) */}
        {isVictory && (
          <div className="my-5 w-full p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/60 border border-amber-500/60 shadow-inner">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              ★ RECOMPENSA DE FASE ★
            </span>
            <div className="font-display font-black text-3xl text-cyan-300 mt-1 flex items-center justify-center gap-2">
              <span>💎</span>
              <span className="font-mono-numbers">+{gemsEarned} Gemas</span>
            </div>
            <span className="text-[11px] text-slate-300 mt-0.5 block">
              Adicionadas ao seu cofre para invocar novos guerreiros!
            </span>
          </div>
        )}

        {/* Estatísticas da partida */}
        <div className="w-full grid grid-cols-2 gap-2 text-xs mb-5">
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Ondas Superadas</span>
            <div className="font-display font-bold text-sm text-white font-mono-numbers">
              {isVictory ? '4 / 4 (100%)' : `${waveReached - 1} / 4`}
            </div>
          </div>
          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-semibold">Inimigos Abatidos</span>
            <div className="font-display font-bold text-sm text-amber-400 font-mono-numbers">
              ⚔️ {defeatedCount}
            </div>
          </div>
        </div>

        {/* Dica de Bênção Adaptativa caso derrotado */}
        {!isVictory && onOpenBlessings && (
          <div className="w-full p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/60 text-left mb-4 text-xs">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>💡</span>
              <span>Dica Adaptativa</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Ative uma <strong>Bênção da Proteção</strong> (+8% HP) ou <strong>Recuperação</strong> para restaurar vida entre cada onda!
            </p>
          </div>
        )}

        {/* Ações */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            Jogar Novamente
          </button>
          <button
            onClick={onReturnToMenu}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-bold text-xs uppercase tracking-wide border border-slate-700 active:scale-95 transition-all"
          >
            Retornar ao Menu
          </button>
        </div>
      </div>
    </div>
  );
};
