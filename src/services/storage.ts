import { GameSaveData, CharacterRarity } from '../types/game';
import { INITIAL_CHARACTERS, GACHA_PROBABILITIES } from '../data/characters';

const STORAGE_KEY = 'anime_wave_save_v1';
const CURRENT_SAVE_VERSION = 1;

// Probabilidades configuráveis para o sorteio do personagem inicial gratuito
export const STARTER_ROLL_PROBABILITIES: Record<CharacterRarity, number> = {
  Raro: 60,
  Épico: 28,
  Lendário: 10,
  Mítico: 2,
};

/**
 * Realiza o sorteio do primeiro personagem aleatório do jogador
 */
export function rollRandomCharacter(
  probabilities: Record<CharacterRarity, number> = GACHA_PROBABILITIES
): string {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let targetRarity: CharacterRarity = 'Raro';

  if (rand < (cumulative += probabilities['Mítico'])) {
    targetRarity = 'Mítico';
  } else if (rand < (cumulative += probabilities['Lendário'])) {
    targetRarity = 'Lendário';
  } else if (rand < (cumulative += probabilities['Épico'])) {
    targetRarity = 'Épico';
  } else {
    targetRarity = 'Raro';
  }

  // Filtrar personagens desta raridade
  const candidates = INITIAL_CHARACTERS.filter((c) => c.rarity === targetRarity);
  if (candidates.length === 0) {
    return INITIAL_CHARACTERS[0].id;
  }
  const picked = candidates[Math.floor(Math.random() * candidates.length)];
  return picked.id;
}

/**
 * Cria um novo estado inicial para novos jogadores
 */
export function createInitialSaveData(): { data: GameSaveData; starterCharacterId: string } {
  // Sorteia um personagem inicial aleatório gratuitamente
  const starterId = rollRandomCharacter(STARTER_ROLL_PROBABILITIES);

  const initialSave: GameSaveData = {
    saveVersion: CURRENT_SAVE_VERSION,
    gems: 20, // 20 gemas de boas-vindas para permitir 1 giro ou testar a loja!
    ownedCharacters: [starterId],
    selectedCharacterId: starterId,
    characterLevels: {
      [starterId]: 1,
    },
    characterShards: {
      [starterId]: 0,
    },
    equippedAccessories: {},
    ownedAccessories: [],
    activeBlessingId: null,
    progress: {
      completedStages: 0,
      totalDefeated: 0,
      recentLosses: 0,
      recentWins: 0,
    },
  };

  return { data: initialSave, starterCharacterId: starterId };
}

/**
 * Carrega os dados do LocalStorage ou inicializa um novo save
 */
export function loadGameSave(): { data: GameSaveData; isFirstPlay: boolean; newStarterId?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const { data, starterCharacterId } = createInitialSaveData();
      saveGameData(data);
      return { data, isFirstPlay: true, newStarterId: starterCharacterId };
    }

    const parsed = JSON.parse(raw) as Partial<GameSaveData>;
    if (!parsed.ownedCharacters || parsed.ownedCharacters.length === 0) {
      const { data, starterCharacterId } = createInitialSaveData();
      saveGameData(data);
      return { data, isFirstPlay: true, newStarterId: starterCharacterId };
    }

    // Mesclar com segurança com valores padrão caso campos novos tenham sido adicionados
    const safeData: GameSaveData = {
      saveVersion: parsed.saveVersion ?? CURRENT_SAVE_VERSION,
      gems: typeof parsed.gems === 'number' ? parsed.gems : 20,
      ownedCharacters: Array.isArray(parsed.ownedCharacters) ? parsed.ownedCharacters : [INITIAL_CHARACTERS[0].id],
      selectedCharacterId: parsed.selectedCharacterId || parsed.ownedCharacters[0] || INITIAL_CHARACTERS[0].id,
      characterLevels: parsed.characterLevels || {},
      characterShards: parsed.characterShards || {},
      equippedAccessories: parsed.equippedAccessories || {},
      ownedAccessories: Array.isArray(parsed.ownedAccessories) ? parsed.ownedAccessories : [],
      activeBlessingId: parsed.activeBlessingId || null,
      progress: {
        completedStages: parsed.progress?.completedStages ?? 0,
        totalDefeated: parsed.progress?.totalDefeated ?? 0,
        recentLosses: parsed.progress?.recentLosses ?? 0,
        recentWins: parsed.progress?.recentWins ?? 0,
      },
    };

    return { data: safeData, isFirstPlay: false };
  } catch (err) {
    console.warn('Erro ao carregar dados locais, reinicializando save com segurança:', err);
    const { data, starterCharacterId } = createInitialSaveData();
    saveGameData(data);
    return { data, isFirstPlay: true, newStarterId: starterCharacterId };
  }
}

/**
 * Salva o estado atual no LocalStorage
 */
export function saveGameData(data: GameSaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Falha ao persistir save no LocalStorage:', err);
  }
}

/**
 * Apaga o progresso com segurança
 */
export function resetGameSave(): GameSaveData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Erro ao remover save:', err);
  }
  const { data } = createInitialSaveData();
  saveGameData(data);
  return data;
}
