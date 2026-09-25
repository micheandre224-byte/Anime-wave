import { AccessoryDef } from '../types/game';

export const ACCESSORIES_CATALOG: AccessoryDef[] = [
  {
    id: 'ring_of_power',
    name: 'Anel do Poder',
    description: 'Forjado em chamas místicas, canaliza energia bruta para golpes devastadores.',
    priceInGems: 40,
    iconType: 'ring',
    statBonus: {
      damagePercent: 10,
    },
  },
  {
    id: 'necklace_of_agility',
    name: 'Colar da Agilidade',
    description: 'Engastado com plumas de falcão celestial, acelera a cadência de golpes do usuário.',
    priceInGems: 35,
    iconType: 'necklace',
    statBonus: {
      attackSpeedPercent: 8,
    },
  },
  {
    id: 'mystic_eye',
    name: 'Olho Místico',
    description: 'Permite vislumbrar os pontos fracos e estender a projeção de energia à distância.',
    priceInGems: 35,
    iconType: 'eye',
    statBonus: {
      rangePercent: 15,
    },
  },
  {
    id: 'amulet_of_vitality',
    name: 'Amuleto da Vitalidade',
    description: 'Pulsa com a força vital ancestral, expandindo a resistência máxima em combate.',
    priceInGems: 30,
    iconType: 'amulet',
    statBonus: {
      maxHpPercent: 15,
    },
  },
  {
    id: 'shadow_cloak',
    name: 'Capa das Sombras',
    description: 'Tecida com essência das trevas, torna os passos leves e rápidos no campo de batalha.',
    priceInGems: 40,
    iconType: 'cloak',
    statBonus: {
      moveSpeedPercent: 10,
    },
  },
];
