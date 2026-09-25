import React, { useState } from 'react';
import { GameSaveData } from '../types/game';
import { AUTHORIZED_BLESSINGS, recommendAdaptiveBlessing } from '../data/blessings';
import { soundManager } from '../services/audio';

interface BlessingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: GameSaveData;
  onUpdateSave: (newSave: GameSaveData) => void;
}

export const BlessingsModal: React.FC<BlessingsModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onUpdateSave,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Análise adaptativa em tempo real com base no progresso do jogador
  const { recommended, reason } = recommendAdaptiveBlessing(saveData.progress);

  const handleSelectBlessing = (blessingId: string) => {
    soundManager.playClick();
    const isTogglingOff = saveData.activeBlessingId === blessingId;
    const newId = isTogglingOff ? null : blessingId;

    onUpdateSave({
      ...saveData,
      activeBlessingId: newId,
    });

    setFeedbackMsg(
      newId ? 'Bênção ativada para o próximo combate!' : 'Bênção desativada.'
    );
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h2 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span>Santuário de Bênçãos Adaptativas</span>
              <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-700/60">
                Sistema Balanceado
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Escolha uma graça divina para auxiliá-lo na próxima incursão de 4 ondas.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Feedback */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200">
            {feedbackMsg}
          </div>
        )}

        {/* Recomendação Adaptativa do Mestre */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 to-slate-950">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
              <span>✦</span>
              <span>Recomendação Adaptativa dos Mestres Ancestrais</span>
            </div>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
              «{reason}»
            </p>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-white">
                Sugerida: <strong className="text-amber-300">{recommended.name}</strong>
              </span>
              <button
                onClick={() => handleSelectBlessing(recommended.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-display uppercase tracking-wide transition-all ${
                  saveData.activeBlessingId === recommended.id
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {saveData.activeBlessingId === recommended.id ? '✓ Ativa' : 'Ativar Sugestão'}
              </button>
            </div>
          </div>

          {/* Todas as Bênçãos Autorizadas */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-display font-bold uppercase tracking-wider text-slate-400 px-1">
              Bênçãos Autorizadas Disponíveis
            </h3>

            {AUTHORIZED_BLESSINGS.map((blessing) => {
              const isActive = saveData.activeBlessingId === blessing.id;
              const isRec = recommended.id === blessing.id;

              return (
                <div
                  key={blessing.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-950/30 shadow-md ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-900/80 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">{blessing.name}</h4>
                      {isRec && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-700/60">
                          RECOMENDADA
                        </span>
                      )}
                      {isActive && (
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600">
                          ATIVA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{blessing.description}</p>
                    <span className="text-[11px] text-slate-500 block mt-1">
                      💡 {blessing.conditionHint}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectBlessing(blessing.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wide transition-all shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isActive ? 'Desativar' : 'Escolher'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
