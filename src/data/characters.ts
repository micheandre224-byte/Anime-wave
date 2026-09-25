import { CharacterDef, CharacterRarity } from '../types/game';

export const GACHA_PROBABILITIES: Record<CharacterRarity, number> = {
  Raro: 55,
  Épico: 30,
  Lendário: 12,
  Mítico: 3,
};

// Validação de segurança em tempo de execução para garantir que a soma seja 100%
const totalProbability = Object.values(GACHA_PROBABILITIES).reduce((a, b) => a + b, 0);
if (totalProbability !== 100) {
  console.error(`Atenção: A soma das probabilidades do gacha é ${totalProbability}%, deveria ser 100%!`);
}

export const INITIAL_CHARACTERS: CharacterDef[] = [
  // 1. Tanjiro Kamado (Raro)
  {
    id: 'tanjiro_kamado',
    name: 'Tanjiro Kamado',
    animeSource: 'Demon Slayer',
    rarity: 'Raro',
    baseHp: 180,
    baseDamage: 28,
    attackSpeed: 1.25,
    attackRange: 75,
    quote: 'Não importa o quão doloroso seja, seguirei em frente!',
    themeColor: '#10b981', // Verde esmeralda
    auraColor: '#059669',
    hairColor: '#881337',
    outfitColor: '#047857',
    specialSkill: {
      id: 'tanjiro_water_slash',
      name: 'Respiração da Água: Dança das Correntes',
      description: 'Corta os inimigos com uma rajada d’água contínua causando dano duplo em área.',
      cooldown: 5,
      damageMultiplier: 2.2,
      effectColor: '#0284c7',
      range: 120,
    },
    ultimateSkill: {
      id: 'tanjiro_sun_halo',
      name: 'Hinokami Kagura: Dança do Deus do Fogo',
      description: 'Invoca chamas solares sagradas varrendo toda a linha de inimigos com dano devastador.',
      cooldown: 14,
      damageMultiplier: 4.5,
      effectColor: '#f97316',
      range: 240,
    },
  },

  // 2. Zenitsu Agatsuma (Raro)
  {
    id: 'zenitsu_agatsuma',
    name: 'Zenitsu Agatsuma',
    animeSource: 'Demon Slayer',
    rarity: 'Raro',
    baseHp: 160,
    baseDamage: 32,
    attackSpeed: 1.45,
    attackRange: 70,
    quote: 'Se você só consegue fazer uma coisa, aperfeiçoe-a até o limite!',
    themeColor: '#eab308', // Amarelo raio
    auraColor: '#ca8a04',
    hairColor: '#facc15',
    outfitColor: '#eab308',
    specialSkill: {
      id: 'zenitsu_thunderclap',
      name: 'Primeira Forma: Lampejo do Trovão',
      description: 'Avança instantaneamente como um relâmpago, perfurando e eletrocutando os alvos.',
      cooldown: 4.5,
      damageMultiplier: 2.4,
      effectColor: '#fef08a',
      range: 160,
    },
    ultimateSkill: {
      id: 'zenitsu_godspeed',
      name: 'Sétima Forma: Deus Flamejante do Trovão',
      description: 'Dispara um dragão elétrico à velocidade da luz que oblitera todos à sua frente.',
      cooldown: 13,
      damageMultiplier: 4.8,
      effectColor: '#f59e0b',
      range: 280,
    },
  },

  // 3. Megumi Fushiguro (Épico)
  {
    id: 'megumi_fushiguro',
    name: 'Megumi Fushiguro',
    animeSource: 'Jujutsu Kaisen',
    rarity: 'Épico',
    baseHp: 210,
    baseDamage: 36,
    attackSpeed: 1.3,
    attackRange: 85,
    quote: 'Vou salvar pessoas de acordo com meu próprio senso de justiça.',
    themeColor: '#0284c7', // Azul meia-noite
    auraColor: '#1e3a8a',
    hairColor: '#0f172a',
    outfitColor: '#1e293b',
    specialSkill: {
      id: 'megumi_divine_dog',
      name: 'Cão Divino: Presas Totais',
      description: 'Invoca o shikigami das sombras para dilacerar inimigos próximos com grande impacto.',
      cooldown: 5.5,
      damageMultiplier: 2.6,
      effectColor: '#38bdf8',
      range: 130,
    },
    ultimateSkill: {
      id: 'megumi_chimera_garden',
      name: 'Expansão de Domínio: Jardim de Sombras Quimérico',
      description: 'Cobre o campo com um pântano sombrio que convoca múltiplos ataques das sombras.',
      cooldown: 15,
      damageMultiplier: 5.2,
      effectColor: '#0284c7',
      range: 260,
    },
  },

  // 4. Killua Zoldyck (Épico)
  {
    id: 'killua_zoldyck',
    name: 'Killua Zoldyck',
    animeSource: 'Hunter x Hunter',
    rarity: 'Épico',
    baseHp: 200,
    baseDamage: 38,
    attackSpeed: 1.6,
    attackRange: 75,
    quote: 'Se você ignorar meus avisos, eu vou ter que te matar.',
    themeColor: '#60a5fa', // Azul elétrico
    auraColor: '#3b82f6',
    hairColor: '#f1f5f9',
    outfitColor: '#334155',
    specialSkill: {
      id: 'killua_thunderbolt',
      name: 'Palma do Trovão',
      description: 'Descarga de Nen condensado de alta voltagem que atordoa e danifica em cone.',
      cooldown: 4.8,
      damageMultiplier: 2.7,
      effectColor: '#93c5fd',
      range: 140,
    },
    ultimateSkill: {
      id: 'killua_godspeed',
      name: 'Godspeed (Velocidade Divina)',
      description: 'Transmite impulsos elétricos diretamente aos músculos, liberando uma saraivada ultra-rápida.',
      cooldown: 14,
      damageMultiplier: 5.5,
      effectColor: '#60a5fa',
      range: 250,
    },
  },

  // 5. Yuji Itadori (Lendário)
  {
    id: 'yuji_itadori',
    name: 'Yuji Itadori',
    animeSource: 'Jujutsu Kaisen',
    rarity: 'Lendário',
    baseHp: 270,
    baseDamage: 45,
    attackSpeed: 1.35,
    attackRange: 80,
    quote: 'Não quero me arrepender da forma como vivi!',
    themeColor: '#ef4444', // Vermelho punho
    auraColor: '#b91c1c',
    hairColor: '#f472b6',
    outfitColor: '#1e1b4b',
    specialSkill: {
      id: 'yuji_divergent_fist',
      name: 'Punho Divergente',
      description: 'Ataque concentrado que causa dois impactos sucessivos com atraso de energia amaldiçoada.',
      cooldown: 4.5,
      damageMultiplier: 3.0,
      effectColor: '#f87171',
      range: 120,
    },
    ultimateSkill: {
      id: 'yuji_black_flash',
      name: 'Kokusen (Clarão Negro)',
      description: 'Distorção espacial que amplifica o impacto da energia à potência de 2.5, estilhaçando defesas.',
      cooldown: 12,
      damageMultiplier: 6.2,
      effectColor: '#18181b',
      range: 200,
    },
  },

  // 6. Ichigo Kurosaki (Lendário)
  {
    id: 'ichigo_kurosaki',
    name: 'Ichigo Kurosaki',
    animeSource: 'Bleach',
    rarity: 'Lendário',
    baseHp: 260,
    baseDamage: 48,
    attackSpeed: 1.3,
    attackRange: 90,
    quote: 'Se o destino é uma roda, somos nós que a esmagamos.',
    themeColor: '#f97316', // Laranja shinigami
    auraColor: '#c2410c',
    hairColor: '#f97316',
    outfitColor: '#09090b',
    specialSkill: {
      id: 'ichigo_getsuga',
      name: 'Getsuga Tenshō',
      description: 'Dispara uma foice em meia-lua de reiatsu comprimida que corta à distância.',
      cooldown: 5.0,
      damageMultiplier: 3.2,
      effectColor: '#dc2626',
      range: 200,
    },
    ultimateSkill: {
      id: 'ichigo_bankai_getsuga',
      name: 'Bankai: Tensa Zangetsu Kuroi Getsuga',
      description: 'Libera a Bankai com uma onda negra de energia espiritual que engole o campo de batalha.',
      cooldown: 13,
      damageMultiplier: 6.5,
      effectColor: '#09090b',
      range: 300,
    },
  },

  // 7. Goku Black Rosé (Mítico) - DESTAQUE PRINCIPAL
  {
    id: 'goku_black_rose',
    name: 'Goku Black Rosé',
    animeSource: 'Dragon Ball Super',
    rarity: 'Mítico',
    baseHp: 340,
    baseDamage: 62,
    attackSpeed: 1.5,
    attackRange: 95,
    quote: 'Eis o esplendor do poder divino... contemplem o Super Saiyajin Rosé!',
    themeColor: '#ec4899', // Rosa divino
    auraColor: '#be185d',
    hairColor: '#f472b6',
    outfitColor: '#18181b',
    specialSkill: {
      id: 'black_ki_blade',
      name: 'Lâmina de Ki Violácea',
      description: 'Condensa o Ki divino em uma lâmina de plasma rosado cortando através de todos os inimigos.',
      cooldown: 4.2,
      damageMultiplier: 3.6,
      effectColor: '#f43f5e',
      range: 170,
    },
    ultimateSkill: {
      id: 'black_divine_scythe',
      name: 'Foice da Decomposição Divina',
      description: 'Rasga o tecido do espaço-tempo com uma foice de Ki carmesim, gerando clones que explodem em fúria.',
      cooldown: 11,
      damageMultiplier: 7.8,
      effectColor: '#e11d48',
      range: 320,
    },
  },

  // 8. Cid Kagenou (Shadow) (Mítico)
  {
    id: 'cid_kagenou_shadow',
    name: 'Cid Kagenou (Shadow)',
    animeSource: 'The Eminence in Shadow',
    rarity: 'Mítico',
    baseHp: 330,
    baseDamage: 60,
    attackSpeed: 1.4,
    attackRange: 100,
    quote: 'Nós somos a Shadow Garden... espreitamos nas sombras para caçar as sombras.',
    themeColor: '#a855f7', // Púrpura atômico
    auraColor: '#7e22ce',
    hairColor: '#020617',
    outfitColor: '#0f172a',
    specialSkill: {
      id: 'shadow_slime_blade',
      name: 'Lâmina de Slime Sombria',
      description: 'Manipula o traje de slime em fios cortantes microscópicos com alcance devastador.',
      cooldown: 4.5,
      damageMultiplier: 3.5,
      effectColor: '#c084fc',
      range: 180,
    },
    ultimateSkill: {
      id: 'shadow_i_am_atomic',
      name: 'I AM ATOMIC (Eu Sou Atômico)',
      description: 'Condensa a magia em uma barreira circular que se expande em uma explosão estelar purificadora.',
      cooldown: 12,
      damageMultiplier: 8.0,
      effectColor: '#9333ea',
      range: 360,
    },
  },

  // 9. Sung Jin-Woo (Mítico)
  {
    id: 'sung_jin_woo',
    name: 'Sung Jin-Woo',
    animeSource: 'Solo Leveling',
    rarity: 'Mítico',
    baseHp: 350,
    baseDamage: 58,
    attackSpeed: 1.55,
    attackRange: 85,
    quote: 'Ergam-se!',
    themeColor: '#3b82f6', // Azul Monarca das Sombras
    auraColor: '#1d4ed8',
    hairColor: '#09090b',
    outfitColor: '#172554',
    specialSkill: {
      id: 'jinwoo_shadow_daggers',
      name: 'Adagas da Morte Veloz: Baruka',
      description: 'Ataques consecutivos hiper-velozes que causam sangramento e dano sombrio em massa.',
      cooldown: 4.0,
      damageMultiplier: 3.4,
      effectColor: '#60a5fa',
      range: 150,
    },
    ultimateSkill: {
      id: 'jinwoo_arise_legion',
      name: 'Domínio do Monarca: Ergam-se!',
      description: 'Invoca o exército das sombras (Igris e soldados) varrendo toda a tela em uma maré negra.',
      cooldown: 11.5,
      damageMultiplier: 7.5,
      effectColor: '#2563eb',
      range: 340,
    },
  },

  // 10. Quarto personagem Mítico reservado (conforme instrução)
  {
    id: 'mythic_reserved_slot',
    name: 'Guerreiro Celestial [Reservado]',
    animeSource: 'Universo Desconhecido',
    rarity: 'Mítico',
    baseHp: 320,
    baseDamage: 56,
    attackSpeed: 1.45,
    attackRange: 90,
    quote: 'O selo supremo se romperá no momento oportuno...',
    themeColor: '#06b6d4', // Ciano cósmico
    auraColor: '#0891b2',
    hairColor: '#ecfeff',
    outfitColor: '#164e63',
    isPlaceholder: true,
    specialSkill: {
      id: 'celestial_pulse',
      name: 'Pulso de Energia Celestial',
      description: 'Onda de choque cósmica reservada que afasta e consome as forças inimigas.',
      cooldown: 4.6,
      damageMultiplier: 3.3,
      effectColor: '#22d3ee',
      range: 160,
    },
    ultimateSkill: {
      id: 'celestial_singularity',
      name: 'Singularidade Temporal',
      description: 'Cria uma dobra estelar que colapsa os adversários em um vórtice luminoso.',
      cooldown: 12,
      damageMultiplier: 7.2,
      effectColor: '#06b6d4',
      range: 300,
    },
  },
];

export const RARITY_BADGE_STYLE: Record<CharacterRarity, { text: string; bg: string; border: string; glow: string }> = {
  Raro: {
    text: 'text-sky-400',
    bg: 'bg-sky-950/80',
    border: 'border-sky-700/60',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.3)]',
  },
  Épico: {
    text: 'text-violet-400',
    bg: 'bg-violet-950/80',
    border: 'border-violet-700/60',
    glow: 'shadow-[0_0_15px_rgba(167,139,250,0.35)]',
  },
  Lendário: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/80',
    border: 'border-amber-700/60',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.4)]',
  },
  Mítico: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/80',
    border: 'border-rose-700/60',
    glow: 'shadow-[0_0_25px_rgba(244,63,94,0.5)]',
  },
};
