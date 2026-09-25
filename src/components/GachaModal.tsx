import React, { useState } from 'react';
import { CharacterDef, GameSaveData } from '../types/game';
import { INITIAL_CHARACTERS, GACHA_PROBABILITIES, RARITY_BADGE_STYLE } from '../data/characters';
import { rollRandomCharacter } from '../services/storage';
import { soundManager } from '../services/audio';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: GameSaveData;
  onUpdateSave: (newSave: GameSaveData) => void;
}

interface PullResult {
  character: CharacterDef;
  isDuplicate: boolean;
  shardsAwarded: number;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onUpdateSave,
}) => {
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [pullResults, setPullResults] = useState<PullResult[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Realizar invocação (1 giro = 10 gemas, 10 giros = 35 gemas)
  const handlePull = (count: 1 | 10) => {
    const cost = count === 1 ? 10 : 35; // 35 gemas para 10 giros conforme regra de teste!

    if (saveData.gems < cost) {
      setErrorMessage(`Gemas insuficientes! Você precisa de ${cost} Gemas, mas possui ${saveData.gems}.`);
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    setErrorMessage(null);
    setIsPulling(true);
    setPullResults(null);

    soundManager.playGachaPull(false);

    // Simular breve suspense da invocação
    setTimeout(() => {
      const results: PullResult[] = [];
      const newOwnedCharacters = [...saveData.ownedCharacters];
      const newShards = { ...saveData.characterShards };
      let foundMythic = false;

      for (let i = 0; i < count; i++) {
        const charId = rollRandomCharacter(GACHA_PROBABILITIES);
        const charDef = INITIAL_CHARACTERS.find((c) => c.id === charId) || INITIAL_CHARACTERS[0];
        const isDuplicate = newOwnedCharacters.includes(charId);

        if (charDef.rarity === 'Mítico') {
          foundMythic = true;
        }

        if (isDuplicate) {
          // Converte duplicata em fragmentos
          const shardCount = charDef.rarity === 'Mítico' ? 30 : charDef.rarity === 'Lendário' ? 20 : charDef.rarity === 'Épico' ? 15 : 10;
          newShards[charId] = (newShards[charId] || 0) + shardCount;
          results.push({
            character: charDef,
            isDuplicate: true,
            shardsAwarded: shardCount,
          });
        } else {
          newOwnedCharacters.push(charId);
          newShards[charId] = 0;
          results.push({
            character: charDef,
            isDuplicate: false,
            shardsAwarded: 0,
          });
        }
      }

      if (foundMythic) {
        soundManager.playGachaPull(true);
      }

      // Atualizar o Save
      const updated: GameSaveData = {
        ...saveData,
        gems: saveData.gems - cost,
        ownedCharacters: newOwnedCharacters,
        characterShards: newShards,
      };

      onUpdateSave(updated);
      setPullResults(results);
      setIsPulling(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Cabeçalho do Banner */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex flex-col">
            <h2 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span>Portal de Invocação</span>
              <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/60">
                Gacha Ativo
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Convoque guerreiros de diferentes animes para lutar em suas ondas!
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-rose-950/80 border border-rose-700 text-xs text-rose-200">
            {errorMessage}
          </div>
        )}

        {/* Conteúdo Central */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Banner Temático: DESTAQUE GOKU BLACK ROSÉ */}
          <div className="relative rounded-xl overflow-hidden border border-rose-600/50 bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 p-4 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  ★ Destaque Mítico Especial ★
                </span>
                <h3 className="font-display font-black text-xl text-white tracking-wide mt-0.5">
                  Goku Black Rosé
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mt-1">
                  «Eis o esplendor do poder divino... contemplem a lâmina de Ki violácea e a foice celestial!»
                </p>
              </div>

              <div className="w-16 h-16 rounded-xl bg-rose-900/40 border border-rose-500/60 flex flex-col items-center justify-center text-center p-1 shadow-inner shrink-0">
                <span className="text-xl">🌸</span>
                <span className="text-[9px] font-bold text-rose-300 uppercase tracking-tighter">
                  Mítico
                </span>
              </div>
            </div>

            {/* Tabela de Probabilidades Oficiais */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="bg-slate-900/60 rounded p-1.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Raro</div>
                <div className="font-mono-numbers font-bold text-sky-400">55%</div>
              </div>
              <div className="bg-slate-900/60 rounded p-1.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Épico</div>
                <div className="font-mono-numbers font-bold text-violet-400">30%</div>
              </div>
              <div className="bg-slate-900/60 rounded p-1.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Lendário</div>
                <div className="font-mono-numbers font-bold text-amber-400">12%</div>
              </div>
              <div className="bg-slate-900/60 rounded p-1.5 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-medium">Mítico</div>
                <div className="font-mono-numbers font-bold text-rose-400">3%</div>
              </div>
            </div>
          </div>

          {/* Resultado dos Giros */}
          {isPulling ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
              <span className="font-display font-bold text-sm text-amber-400 tracking-wide animate-pulse">
                Invocando da Fenda Dimensional...
              </span>
            </div>
          ) : pullResults ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-sm text-white">
                  Guerreiros Convocados ({pullResults.length})
                </h4>
                <button
                  onClick={() => setPullResults(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Limpar Resultado
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {pullResults.map((res, idx) => {
                  const badge = RARITY_BADGE_STYLE[res.character.rarity];
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${badge.bg} ${badge.border} ${badge.glow} transition-all`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-display font-bold text-white text-base shadow shrink-0"
                          style={{ backgroundColor: res.character.outfitColor }}
                        >
                          {res.character.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-display font-bold text-xs text-white truncate">
                            {res.character.name}
                          </span>
                          <span className={`text-[10px] font-semibold ${badge.text}`}>
                            {res.character.rarity} · {res.character.animeSource}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {res.isDuplicate ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-amber-300 font-bold">Duplicado!</span>
                            <span className="text-[10px] text-slate-300 font-mono-numbers">
                              +{res.shardsAwarded} Frags
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700/60">
                            NOVO!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Rodapé com Botões de Giro e Saldo */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Saldo:</span>
            <span className="font-mono-numbers font-bold text-cyan-300 flex items-center gap-1">
              💎 {saveData.gems} Gemas
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* 1 Giro = 10 Gemas */}
            <button
              onClick={() => handlePull(1)}
              disabled={isPulling}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow"
            >
              <span>1 Giro</span>
              <span className="text-cyan-300 font-mono-numbers">💎 10</span>
            </button>

            {/* 10 Giros = 35 Gemas (Preço intencional da versão de teste!) */}
            <button
              onClick={() => handlePull(10)}
              disabled={isPulling}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-extrabold text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>10 Giros</span>
              <span className="font-mono-numbers bg-slate-950/20 px-1.5 py-0.5 rounded text-slate-950">
                💎 35
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
