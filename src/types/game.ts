export type CharacterRarity = 'Raro' | 'Épico' | 'Lendário' | 'Mítico';

export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number; // segundos
  damageMultiplier: number;
  effectColor: string;
  range: number;
}

export interface CharacterDef {
  id: string;
  name: string;
  animeSource: string;
  rarity: CharacterRarity;
  baseHp: number;
  baseDamage: number;
  attackSpeed: number; // ataques por segundo (ex: 1.2)
  attackRange: number; // pixels de alcance no combate
  specialSkill: CharacterSkill;
  ultimateSkill?: CharacterSkill;
  quote: string;
  themeColor: string;
  auraColor: string;
  hairColor: string;
  outfitColor: string;
  isPlaceholder?: boolean;
}

export interface OwnedCharacterData {
  characterId: string;
  level: number;
  obtainedAt: number;
  shards: number;
}

export interface AccessoryDef {
  id: string;
  name: string;
  description: string;
  priceInGems: number;
  statBonus: {
    damagePercent?: number;
    attackSpeedPercent?: number;
    rangePercent?: number;
    maxHpPercent?: number;
    moveSpeedPercent?: number;
  };
  iconType: 'ring' | 'necklace' | 'eye' | 'amulet' | 'cloak';
}

export interface BlessingDef {
  id: string;
  name: string;
  description: string;
  effect: {
    damageMultiplier?: number;
    attackSpeedMultiplier?: number;
    maxHpMultiplier?: number;
    healingPercent?: number;
  };
  conditionHint: string;
}

export interface StageProgress {
  completedStages: number;
  totalDefeated: number;
  recentLosses: number;
  recentWins: number;
}

export interface GameSaveData {
  saveVersion: number;
  gems: number;
  ownedCharacters: string[];
  selectedCharacterId: string;
  characterLevels: Record<string, number>;
  characterShards: Record<string, number>;
  equippedAccessories: Record<string, string>; // characterId -> accessoryId
  ownedAccessories: string[];
  activeBlessingId: string | null;
  progress: StageProgress;
}

export type EnemyType = 'basic' | 'armored' | 'ranged' | 'boss';

export interface EnemyDef {
  id: string;
  name: string;
  type: EnemyType;
  maxHp: number;
  hp: number;
  damage: number;
  speed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isGrounded: boolean;
  facing: 1 | -1;
  attackCooldown: number;
  currentCooldown: number;
  color: string;
  isBoss?: boolean;
  specialAttackTimer?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface ParticleEffect {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  damage: number;
  rangeLeft: number;
  fromPlayer: boolean;
  color: string;
  radius: number;
}
