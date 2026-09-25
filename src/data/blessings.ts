import { BlessingDef, StageProgress } from '../types/game';

export const AUTHORIZED_BLESSINGS: BlessingDef[] = [
  {
    id: 'blessing_of_strength',
    name: 'Bênção da Força',
    description: 'Concede +10% de poder de ataque durante a próxima fase inteira.',
    effect: {
      damageMultiplier: 1.10,
    },
    conditionHint: 'Ideal para finalizar ondas mais rapidamente quando você domina a esquiva.',
  },
  {
    id: 'blessing_of_agility',
    name: 'Bênção da Agilidade',
    description: 'Aumenta em +8% a velocidade de ataque durante a próxima fase.',
    effect: {
      attackSpeedMultiplier: 1.08,
    },
    conditionHint: 'Recomendada para personagens velozes gerarem combos contínuos.',
  },
  {
    id: 'blessing_of_protection',
    name: 'Bênção da Proteção',
    description: 'Aumenta em +8% a vida máxima do guerreiro na próxima fase.',
    effect: {
      maxHpMultiplier: 1.08,
    },
    conditionHint: 'Excelente para resistir aos golpes mais pesados do mini-boss.',
  },
  {
    id: 'blessing_of_recovery',
    name: 'Bênção da Recuperação',
    description: 'Restaura imediatamente +25% de vida ao iniciar cada onda de inimigos.',
    effect: {
      healingPercent: 25,
    },
    conditionHint: 'Perfeita caso tenha sofrido derrotas recentes na onda final.',
  },
];

/**
 * Motor Adaptativo de Bênçãos:
 * Avalia o histórico de combate do jogador e recomenda uma bênção adequada
 * conforme regras estritas e balanceadas.
 */
export function recommendAdaptiveBlessing(
  progress: StageProgress,
  currentHpRatio: number = 1.0
): { recommended: BlessingDef; reason: string } {
  // Se o jogador sofreu derrotas recentes ou está com pouca vida
  if (progress.recentLosses > 0 || currentHpRatio < 0.4) {
    const recovery = AUTHORIZED_BLESSINGS.find((b) => b.id === 'blessing_of_recovery')!;
    return {
      recommended: recovery,
      reason: 'Detectamos desafios recentes nas ondas finais. Esta bênção irá restaurar seu fôlego vital entre cada onda.',
    };
  }

  // Se o jogador estiver com derrotas moderadas
  if (progress.recentLosses === 1) {
    const protection = AUTHORIZED_BLESSINGS.find((b) => b.id === 'blessing_of_protection')!;
    return {
      recommended: protection,
      reason: 'O mini-boss exige maior resistência física para absorver as ondas de impacto.',
    };
  }

  // Se estiver com sequência de vitórias, sugere força ou agilidade
  if (progress.recentWins >= 2) {
    const strength = AUTHORIZED_BLESSINGS.find((b) => b.id === 'blessing_of_strength')!;
    return {
      recommended: strength,
      reason: 'Seu domínio em combate é exemplar! Potencialize seu dano para eliminar as hordas mais depressa.',
    };
  }

  // Padrão equilibrado
  const agility = AUTHORIZED_BLESSINGS.find((b) => b.id === 'blessing_of_agility')!;
  return {
    recommended: agility,
    reason: 'Maior cadência de golpes oferece um equilíbrio seguro entre pressão ofensiva e mobilidade.',
  };
}
