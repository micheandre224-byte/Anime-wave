import React, { useState } from 'react';
import { GameSaveData, CharacterDef } from '../types/game';
import { ACCESSORIES_CATALOG } from '../data/accessories';
import { INITIAL_CHARACTERS } from '../data/characters';
import { soundManager } from '../services/audio';

interface AccessoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: GameSaveData;
  onUpdateSave: (newSave: GameSaveData) => void;
}

export const AccessoriesModal: React.FC<AccessoriesModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onUpdateSave,
}) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCharDef =
    INITIAL_CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || INITIAL_CHARACTERS[0];
  const currentlyEquippedId = saveData.equippedAccessories[activeCharDef.id];

  const handleBuy = (accId: string, cost: number) => {
    if (saveData.gems < cost) {
      setFeedbackMsg(`Gemas insuficientes! Custa ${cost} Gemas.`);
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    soundManager.playGemCollect();
    const newOwned = [...saveData.ownedAccessories, accId];
    onUpdateSave({
      ...saveData,
      gems: saveData.gems - cost,
      ownedAccessories: newOwned,
    });

    setFeedbackMsg('Acessório adquirido com sucesso!');
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleEquip = (accId: string) => {
    soundManager.playClick();
    onUpdateSave({
      ...saveData,
      equippedAccessories: {
        ...saveData.equippedAccessories,
        [activeCharDef.id]: accId,
      },
    });
    setFeedbackMsg(`Equipado em ${activeCharDef.name}!`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleUnequip = () => {
    soundManager.playClick();
    const copy = { ...saveData.equippedAccessories };
    delete copy[activeCharDef.id];
    onUpdateSave({
      ...saveData,
      equippedAccessories: copy,
    });
    setFeedbackMsg('Acessório desequipado!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h2 className="font-display font-bold text-lg text-white tracking-wide">
              Arsenal de Acessórios
            </h2>
            <span className="text-xs text-slate-400">
              Equipamento ativo para: <strong className="text-amber-400">{activeCharDef.name}</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mensagem de Feedback */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-indigo-950/80 border border-indigo-700 text-xs text-indigo-200">
            {feedbackMsg}
          </div>
        )}

        {/* Lista de Acessórios */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {ACCESSORIES_CATALOG.map((acc) => {
            const isOwned = saveData.ownedAccessories.includes(acc.id);
            const isEquippedHere = currentlyEquippedId === acc.id;

            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                  isEquippedHere
                    ? 'border-amber-400 bg-slate-800/90 shadow-md ring-1 ring-amber-400'
                    : isOwned
                    ? 'border-slate-800 bg-slate-900'
                    : 'border-slate-800/80 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                    {acc.iconType === 'ring'
                      ? '💍'
                      : acc.iconType === 'necklace'
                      ? '📿'
                      : acc.iconType === 'eye'
                      ? '👁️'
                      : acc.iconType === 'amulet'
                      ? '🧿'
                      : '🧣'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-white">{acc.name}</h4>
                      {isEquippedHere && (
                        <span className="text-[10px] font-bold text-amber-400 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600/60">
                          EQUIPADO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{acc.description}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      {acc.statBonus.damagePercent && <span>+{acc.statBonus.damagePercent}% de Dano</span>}
                      {acc.statBonus.attackSpeedPercent && <span>+{acc.statBonus.attackSpeedPercent}% de Vel. de Ataque</span>}
                      {acc.statBonus.rangePercent && <span>+{acc.statBonus.rangePercent}% de Alcance</span>}
                      {acc.statBonus.maxHpPercent && <span>+{acc.statBonus.maxHpPercent}% de Vida Máxima</span>}
                      {acc.statBonus.moveSpeedPercent && <span>+{acc.statBonus.moveSpeedPercent}% de Movimento</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 shrink-0">
                  {isEquippedHere ? (
                    <button
                      onClick={handleUnequip}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                    >
                      Remover
                    </button>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(acc.id)}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wide transition-all shadow"
                    >
                      Equipar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(acc.id, acc.priceInGems)}
                      className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                    >
                      <span>Comprar</span>
                      <span className="font-mono-numbers">💎 {acc.priceInGems}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
