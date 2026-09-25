import React, { useState } from 'react';
import { CharacterDef, GameSaveData } from '../types/game';
import { INITIAL_CHARACTERS, RARITY_BADGE_STYLE } from '../data/characters';
import { ACCESSORIES_CATALOG } from '../data/accessories';
import { soundManager } from '../services/audio';

interface RosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveData: GameSaveData;
  onUpdateSave: (newSave: GameSaveData) => void;
}

export const RosterModal: React.FC<RosterModalProps> = ({
  isOpen,
  onClose,
  saveData,
  onUpdateSave,
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(
    saveData.selectedCharacterId || INITIAL_CHARACTERS[0].id
  );
  const [upgradeMsg, setUpgradeMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const charDef = INITIAL_CHARACTERS.find((c) => c.id === selectedCharId) || INITIAL_CHARACTERS[0];
  const isOwned = saveData.ownedCharacters.includes(selectedCharId);
  const isSelected = saveData.selectedCharacterId === selectedCharId;
  const currentLevel = saveData.characterLevels[selectedCharId] || 1;
  const shards = saveData.characterShards[selectedCharId] || 0;

  // Custo de evolução em Gemas (ex: 15 gemas * nível)
  const upgradeCost = currentLevel * 15;
  const canUpgrade = isOwned && saveData.gems >= upgradeCost;

  // Acessório equipado neste personagem
  const equippedAccessoryId = saveData.equippedAccessories[selectedCharId];
  const equippedAccessory = ACCESSORIES_CATALOG.find((a) => a.id === equippedAccessoryId);

  // Atributos escalados com o nível
  const levelMult = 1 + (currentLevel - 1) * 0.12;
  const calculatedDamage = Math.round(charDef.baseDamage * levelMult);
  const calculatedHp = Math.round(charDef.baseHp * levelMult);

  const handleSelectCharacter = () => {
    if (!isOwned) return;
    soundManager.playClick();
    onUpdateSave({
      ...saveData,
      selectedCharacterId: selectedCharId,
    });
  };

  const handleUpgrade = () => {
    if (!canUpgrade) return;
    soundManager.playVictory();

    const updatedLevels = {
      ...saveData.characterLevels,
      [selectedCharId]: currentLevel + 1,
    };

    onUpdateSave({
      ...saveData,
      gems: saveData.gems - upgradeCost,
      characterLevels: updatedLevels,
    });

    setUpgradeMsg(`Subiu para Nível ${currentLevel + 1}! Dano e Vida aumentados.`);
    setTimeout(() => setUpgradeMsg(null), 3000);
  };

  const badge = RARITY_BADGE_STYLE[charDef.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex flex-col">
            <h2 className="font-display font-bold text-lg text-white tracking-wide flex items-center gap-2">
              <span>Coleção de Guerreiros</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono-numbers">
                {saveData.ownedCharacters.length} / {INITIAL_CHARACTERS.length} Desbloqueados
              </span>
            </h2>
            <span className="text-xs text-slate-400">
              Gerencie seus heróis, suba níveis e selecione o guerreiro para a batalha.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Mensagem de Upgrade */}
        {upgradeMsg && (
          <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-xs text-emerald-200">
            {upgradeMsg}
          </div>
        )}

        {/* Grade dividida em Lista de Personagens + Detalhes */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
          {/* Coluna Esquerda: Roster Grid */}
          <div className="md:col-span-5 grid grid-cols-2 gap-2.5 max-h-[380px] md:max-h-none overflow-y-auto pr-1">
            {INITIAL_CHARACTERS.map((char) => {
              const owned = saveData.ownedCharacters.includes(char.id);
              const isCurrent = char.id === selectedCharId;
              const isHeroActive = saveData.selectedCharacterId === char.id;
              const lvl = saveData.characterLevels[char.id] || 1;
              const charBadge = RARITY_BADGE_STYLE[char.rarity];

              return (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharId(char.id)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all relative ${
                    isCurrent
                      ? 'border-amber-400 bg-slate-800 shadow-md ring-1 ring-amber-400'
                      : owned
                      ? 'border-slate-800 bg-slate-900/90 hover:bg-slate-800/80'
                      : 'border-slate-800/50 bg-slate-950/40 opacity-40 grayscale hover:opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold ${charBadge.text}`}>
                      {char.rarity}
                    </span>
                    {isHeroActive && (
                      <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/90 px-1 rounded border border-emerald-700">
                        EM USO
                      </span>
                    )}
                  </div>

                  <div className="my-2 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0"
                      style={{ backgroundColor: char.outfitColor }}
                    >
                      {char.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-display font-bold text-xs text-white truncate">
                        {char.name}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate">
                        {char.animeSource}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-numbers">
                    <span>{owned ? `Nível ${lvl}` : 'Bloqueado'}</span>
                    {owned && (
                      <span className="text-amber-400">⚔️ {Math.round(char.baseDamage * (1 + (lvl - 1) * 0.12))}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coluna Direita: Detalhes do Personagem Selecionado */}
          <div className="md:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header do Personagem */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${badge.bg} ${badge.border} ${badge.text}`}>
                      {charDef.rarity}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {charDef.animeSource}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white tracking-wide mt-1">
                    {charDef.name}
                  </h3>
                  <p className="text-xs italic text-slate-400 mt-0.5">
                    «{charDef.quote}»
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">Nível</span>
                  <div className="font-display font-bold text-2xl text-amber-400 font-mono-numbers">
                    {currentLevel}
                  </div>
                </div>
              </div>

              {/* Status Numéricos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Dano</span>
                  <div className="font-display font-bold text-base text-rose-400 font-mono-numbers">
                    ⚔️ {calculatedDamage}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Vida (HP)</span>
                  <div className="font-display font-bold text-base text-emerald-400 font-mono-numbers">
                    ❤️ {calculatedHp}
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Vel. Ataque</span>
                  <div className="font-display font-bold text-base text-sky-400 font-mono-numbers">
                    ⚡ {charDef.attackSpeed}x
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Alcance</span>
                  <div className="font-display font-bold text-base text-violet-400 font-mono-numbers">
                    🎯 {charDef.attackRange}px
                  </div>
                </div>
              </div>

              {/* Habilidade Especial e Suprema */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
                    <span className="font-display">✦ Especial: {charDef.specialSkill.name}</span>
                    <span className="font-mono-numbers">{charDef.specialSkill.cooldown}s CD · {charDef.specialSkill.damageMultiplier}x Dano</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">
                    {charDef.specialSkill.description}
                  </p>
                </div>

                {charDef.ultimateSkill && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span className="font-display">⚡ Suprema: {charDef.ultimateSkill.name}</span>
                      <span className="font-mono-numbers">{charDef.ultimateSkill.cooldown}s CD · {charDef.ultimateSkill.damageMultiplier}x Dano</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      {charDef.ultimateSkill.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Acessório Equipado */}
              <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Acessório Equipado:</span>
                {equippedAccessory ? (
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    💍 {equippedAccessory.name}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Nenhum acessório equipado</span>
                )}
              </div>
            </div>

            {/* Ações: Selecionar para Batalha & Melhorar Nível */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              {isOwned ? (
                <>
                  <button
                    onClick={handleSelectCharacter}
                    disabled={isSelected}
                    className={`flex-1 w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wide transition-all shadow ${
                      isSelected
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-600/60 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                    }`}
                  >
                    {isSelected ? '✓ Guerreiro em Uso' : 'Equipar Guerreiro'}
                  </button>

                  <button
                    onClick={handleUpgrade}
                    disabled={!canUpgrade}
                    className={`flex-1 w-full py-2.5 px-4 rounded-xl font-display font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow ${
                      canUpgrade
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95'
                        : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                    }`}
                  >
                    <span>Subir Nível</span>
                    <span className="font-mono-numbers">💎 {upgradeCost}</span>
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-2 text-xs text-slate-400 italic bg-slate-900/70 rounded-xl border border-slate-800">
                  Guerreiro não desbloqueado. Invoque-o no Portal de Gacha!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
