import { useState, useEffect } from 'react';
import { GameSaveData, CharacterDef } from './types/game';
import { INITIAL_CHARACTERS, RARITY_BADGE_STYLE } from './data/characters';
import { ACCESSORIES_CATALOG } from './data/accessories';
import { AUTHORIZED_BLESSINGS } from './data/blessings';
import { loadGameSave, saveGameData, resetGameSave } from './services/storage';
import { TopNav } from './components/TopNav';
import { GameCanvas } from './game/GameCanvas';
import { GachaModal } from './components/GachaModal';
import { RosterModal } from './components/RosterModal';
import { AccessoriesModal } from './components/AccessoriesModal';
import { BlessingsModal } from './components/BlessingsModal';
import { SettingsModal } from './components/SettingsModal';
import { StageResultModal } from './components/StageResultModal';
import { StarterRevealModal } from './components/StarterRevealModal';
import { soundManager } from './services/audio';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modais
  const [showGacha, setShowGacha] = useState<boolean>(false);
  const [showRoster, setShowRoster] = useState<boolean>(false);
  const [showAccessories, setShowAccessories] = useState<boolean>(false);
  const [showBlessings, setShowBlessings] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [starterModalChar, setStarterModalChar] = useState<CharacterDef | null>(null);

  // Resultado de combate
  const [stageResult, setStageResult] = useState<{
    isOpen: boolean;
    isVictory: boolean;
    waveReached: number;
    defeatedCount: number;
    gemsEarned: number;
  }>({
    isOpen: false,
    isVictory: false,
    waveReached: 1,
    defeatedCount: 0,
    gemsEarned: 0,
  });

  // Carregar progresso na inicialização
  useEffect(() => {
    const { data, isFirstPlay, newStarterId } = loadGameSave();
    setSaveData(data);

    if (isFirstPlay && newStarterId) {
      const char = INITIAL_CHARACTERS.find((c) => c.id === newStarterId);
      if (char) {
        setStarterModalChar(char);
      }
    }
  }, []);

  const handleUpdateSave = (newSave: GameSaveData) => {
    setSaveData(newSave);
    saveGameData(newSave);
  };

  const handleResetProgress = () => {
    const freshData = resetGameSave();
    setSaveData(freshData);
    setIsPlaying(false);
    const starterChar = INITIAL_CHARACTERS.find((c) => c.id === freshData.selectedCharacterId);
    if (starterChar) {
      setStarterModalChar(starterChar);
    }
  };

  if (!saveData) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="font-display font-bold text-sm tracking-wider text-amber-400">
            Carregando Anime Wave...
          </span>
        </div>
      </div>
    );
  }

  // Guerreiro selecionado ativo
  const activeCharacter =
    INITIAL_CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || INITIAL_CHARACTERS[0];
  const activeLevel = saveData.characterLevels[activeCharacter.id] || 1;
  const activeAccessoryId = saveData.equippedAccessories[activeCharacter.id];
  const activeAccessory = ACCESSORIES_CATALOG.find((a) => a.id === activeAccessoryId);
  const activeBlessing = AUTHORIZED_BLESSINGS.find((b) => b.id === saveData.activeBlessingId);
  const charBadge = RARITY_BADGE_STYLE[activeCharacter.rarity];

  // Iniciar Batalha
  const handleStartBattle = () => {
    soundManager.playClick();
    setStageResult((prev) => ({ ...prev, isOpen: false }));
    setIsPlaying(true);
  };

  // Vitória: Exatamente 50 Gemas ao concluir as 4 Waves
  const handleVictory = (defeatedCount: number) => {
    const gemsAward = 50; // Requisito do documento: exatamente 50 gemas por vitória!
    const updated: GameSaveData = {
      ...saveData,
      gems: saveData.gems + gemsAward,
      progress: {
        ...saveData.progress,
        completedStages: saveData.progress.completedStages + 1,
        totalDefeated: saveData.progress.totalDefeated + defeatedCount,
        recentLosses: 0,
        recentWins: saveData.progress.recentWins + 1,
      },
    };
    handleUpdateSave(updated);

    setStageResult({
      isOpen: true,
      isVictory: true,
      waveReached: 4,
      defeatedCount,
      gemsEarned: gemsAward,
    });
    setIsPlaying(false);
  };

  // Derrota
  const handleDefeat = (waveReached: number) => {
    const updated: GameSaveData = {
      ...saveData,
      progress: {
        ...saveData.progress,
        recentLosses: saveData.progress.recentLosses + 1,
        recentWins: 0,
      },
    };
    handleUpdateSave(updated);

    setStageResult({
      isOpen: true,
      isVictory: false,
      waveReached,
      defeatedCount: 0,
      gemsEarned: 0,
    });
    setIsPlaying(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* 1. Barra de Navegação Superior */}
      <TopNav
        saveData={saveData}
        activeCharacter={activeCharacter}
        onOpenGacha={() => setShowGacha(true)}
        onOpenRoster={() => setShowRoster(true)}
        onOpenAccessories={() => setShowAccessories(true)}
        onOpenBlessings={() => setShowBlessings(true)}
        onOpenSettings={() => setShowSettings(true)}
        onStartBattle={handleStartBattle}
        isPlaying={isPlaying}
      />

      {/* 2. Área Central: Jogo Ativo ou Menu Principal */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {isPlaying ? (
          <GameCanvas
            character={activeCharacter}
            saveData={saveData}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onBackToMenu={() => setIsPlaying(false)}
          />
        ) : (
          /* MENU PRINCIPAL */
          <div className="flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full flex flex-col justify-between gap-6 pb-20 md:pb-6">
            {/* Banner de Destaque Goku Black Rosé & Boas-Vindas */}
            <div className="relative rounded-2xl overflow-hidden border border-rose-500/40 bg-gradient-to-r from-slate-950 via-rose-950/30 to-indigo-950/40 p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700/60 font-bold">
                      Edição Mítica
                    </span>
                    <span className="text-xs text-rose-400 font-semibold">
                      Goku Black Rosé Disponível no Gacha!
                    </span>
                  </div>

                  <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide mt-1.5">
                    ANIME WAVE: COMBATE 2D
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1 leading-relaxed">
                    Derrote as 4 ondas de inimigos, enfrente o temido Mini-Boss na onda final e garanta <strong>+50 Gemas</strong> por vitória para invocar guerreiros míticos!
                  </p>
                </div>

                <button
                  onClick={() => setShowGacha(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-display font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 active:scale-95 transition-all whitespace-nowrap self-start sm:self-center"
                >
                  Ver Invocação
                </button>
              </div>
            </div>

            {/* Painel do Guerreiro Ativo & Bônus */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Cartão do Herói em Uso */}
              <div className={`md:col-span-7 rounded-2xl border p-5 flex flex-col justify-between shadow-xl ${charBadge.bg} ${charBadge.border} ${charBadge.glow}`}>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${charBadge.border} ${charBadge.text}`}>
                        {activeCharacter.rarity}
                      </span>
                      <span className="text-xs text-slate-300 font-medium">
                        {activeCharacter.animeSource}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-300 font-mono-numbers bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                      Nível {activeLevel}
                    </span>
                  </div>

                  <div className="my-4 flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-white text-3xl shadow-lg border border-white/20 shrink-0"
                      style={{ backgroundColor: activeCharacter.outfitColor }}
                    >
                      {activeCharacter.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-display font-black text-2xl text-white tracking-wide">
                        {activeCharacter.name}
                      </h2>
                      <p className="text-xs italic text-slate-300 mt-0.5">
                        «{activeCharacter.quote}»
                      </p>
                    </div>
                  </div>

                  {/* Atributos Básicos + Bônus */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Dano</span>
                      <div className="font-display font-bold text-base text-rose-400 font-mono-numbers">
                        ⚔️ {Math.round(activeCharacter.baseDamage * (1 + (activeLevel - 1) * 0.12))}
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Vida Máx</span>
                      <div className="font-display font-bold text-base text-emerald-400 font-mono-numbers">
                        ❤️ {Math.round(activeCharacter.baseHp * (1 + (activeLevel - 1) * 0.12))}
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Velocidade</span>
                      <div className="font-display font-bold text-base text-sky-400 font-mono-numbers">
                        ⚡ {activeCharacter.attackSpeed}x
                      </div>
                    </div>
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Alcance</span>
                      <div className="font-display font-bold text-base text-violet-400 font-mono-numbers">
                        🎯 {activeCharacter.attackRange}px
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-slate-300">
                    Acessório: <strong className="text-amber-400">{activeAccessory ? activeAccessory.name : 'Nenhum'}</strong>
                  </span>
                  <button
                    onClick={() => setShowRoster(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold underline"
                  >
                    Trocar Guerreiro →
                  </button>
                </div>
              </div>

              {/* Coluna Direita: Bênção Ativa & Progresso de Fases */}
              <div className="md:col-span-5 flex flex-col justify-between gap-4">
                {/* Cartão de Bênção Adaptativa */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        Bênção para Próxima Fase
                      </span>
                      <button
                        onClick={() => setShowBlessings(true)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        Alterar
                      </button>
                    </div>

                    {activeBlessing ? (
                      <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/60">
                        <div className="font-display font-bold text-sm text-emerald-300">
                          ✦ {activeBlessing.name}
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          {activeBlessing.description}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
                        <span className="text-xs text-slate-400 italic">
                          Nenhuma bênção ativa. Visite o Santuário para obter vantagens adaptativas!
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas Rápidas & Botão Primário Gigante de Jogar */}
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3 shadow-lg">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Fases Concluídas:</span>
                    <span className="font-mono-numbers font-bold text-amber-400 text-sm">
                      {saveData.progress.completedStages}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total de Inimigos Vencidos:</span>
                    <span className="font-mono-numbers font-bold text-rose-400 text-sm">
                      {saveData.progress.totalDefeated}
                    </span>
                  </div>

                  <button
                    onClick={handleStartBattle}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
                  >
                    <span>⚔️</span>
                    <span>INICIAR BATALHA (4 ONDAS)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Acesso rápido às funcionalidades principais */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setShowGacha(true)}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all active:scale-95 group"
              >
                <div className="text-2xl mb-1">🔮</div>
                <div className="font-display font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  Invocar (Gacha)
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  1 Giro = 10 💎 · 10 Giros = 35 💎
                </div>
              </button>

              <button
                onClick={() => setShowRoster(true)}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all active:scale-95 group"
              >
                <div className="text-2xl mb-1">👥</div>
                <div className="font-display font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  Personagens
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  10 Guerreiros · Subir Nível
                </div>
              </button>

              <button
                onClick={() => setShowAccessories(true)}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all active:scale-95 group"
              >
                <div className="text-2xl mb-1">💍</div>
                <div className="font-display font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  Acessórios
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Anéis, Colares e Amuletos
                </div>
              </button>

              <button
                onClick={() => setShowBlessings(true)}
                className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all active:scale-95 group"
              >
                <div className="text-2xl mb-1">✨</div>
                <div className="font-display font-bold text-xs text-white group-hover:text-amber-400 transition-colors">
                  Bênçãos
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Regras Adaptativas Balanceadas
                </div>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 3. Barra de Navegação Inferior para Mobile (Bottom Tab Bar) */}
      {!isPlaying && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-5 items-center h-16 pb-safe">
          <button
            onClick={() => {
              soundManager.playClick();
              setShowRoster(true);
            }}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-lg">👥</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Heróis</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowGacha(true);
            }}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-lg">🔮</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Gacha</span>
          </button>

          {/* Botão Central Batalhar */}
          <button
            onClick={handleStartBattle}
            className="flex flex-col items-center justify-center text-amber-400 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xl shadow-lg shadow-amber-500/30 border-2 border-slate-950">
              ⚔️
            </div>
            <span className="text-[10px] font-display font-bold uppercase tracking-tight text-amber-400 mt-0.5">
              Lutar
            </span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowAccessories(true);
            }}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-lg">💍</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Arsenal</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setShowSettings(true);
            }}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[10px] font-medium tracking-tight mt-0.5">Ajustes</span>
          </button>
        </div>
      )}

      {/* 4. MODAIS DO SISTEMA */}
      <GachaModal
        isOpen={showGacha}
        onClose={() => setShowGacha(false)}
        saveData={saveData}
        onUpdateSave={handleUpdateSave}
      />

      <RosterModal
        isOpen={showRoster}
        onClose={() => setShowRoster(false)}
        saveData={saveData}
        onUpdateSave={handleUpdateSave}
      />

      <AccessoriesModal
        isOpen={showAccessories}
        onClose={() => setShowAccessories(false)}
        saveData={saveData}
        onUpdateSave={handleUpdateSave}
      />

      <BlessingsModal
        isOpen={showBlessings}
        onClose={() => setShowBlessings(false)}
        saveData={saveData}
        onUpdateSave={handleUpdateSave}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onResetProgress={handleResetProgress}
      />

      <StageResultModal
        isOpen={stageResult.isOpen}
        isVictory={stageResult.isVictory}
        waveReached={stageResult.waveReached}
        defeatedCount={stageResult.defeatedCount}
        gemsEarned={stageResult.gemsEarned}
        onPlayAgain={handleStartBattle}
        onReturnToMenu={() => setStageResult((prev) => ({ ...prev, isOpen: false }))}
        onOpenBlessings={() => {
          setStageResult((prev) => ({ ...prev, isOpen: false }));
          setShowBlessings(true);
        }}
      />

      {starterModalChar && (
        <StarterRevealModal
          character={starterModalChar}
          onClaim={() => setStarterModalChar(null)}
        />
      )}
    </div>
  );
}
