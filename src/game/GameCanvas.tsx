import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CharacterDef,
  EnemyDef,
  FloatingText,
  ParticleEffect,
  Projectile,
  GameSaveData,
} from '../types/game';
import { ACCESSORIES_CATALOG } from '../data/accessories';
import { AUTHORIZED_BLESSINGS } from '../data/blessings';
import { soundManager } from '../services/audio';

interface GameCanvasProps {
  character: CharacterDef;
  saveData: GameSaveData;
  onVictory: (defeatedCount: number) => void;
  onDefeat: (waveReached: number) => void;
  onBackToMenu: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  saveData,
  onVictory,
  onDefeat,
  onBackToMenu,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Estados reativos para o HUD
  const [currentWave, setCurrentWave] = useState<number>(1);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMaxHp, setPlayerMaxHp] = useState<number>(100);
  const [specialCooldownLeft, setSpecialCooldownLeft] = useState<number>(0);
  const [ultimateCooldownLeft, setUltimateCooldownLeft] = useState<number>(0);
  const [bossHp, setBossHp] = useState<{ current: number; max: number; name: string } | null>(null);
  const [waveBanner, setWaveBanner] = useState<string | null>('ONDA 1 / 4: INIMIGOS BÁSICOS');

  // Multiplicadores calculados a partir de Acessórios e Bênçãos
  const level = saveData.characterLevels[character.id] || 1;
  const equippedAccessoryId = saveData.equippedAccessories[character.id];
  const equippedAccessory = ACCESSORIES_CATALOG.find((a) => a.id === equippedAccessoryId);
  const activeBlessing = AUTHORIZED_BLESSINGS.find((b) => b.id === saveData.activeBlessingId);

  // Cálculo de atributos com bônus
  const levelMult = 1 + (level - 1) * 0.12; // +12% por nível
  const accessoryDamageMult = 1 + ((equippedAccessory?.statBonus.damagePercent ?? 0) / 100);
  const accessorySpeedMult = 1 + ((equippedAccessory?.statBonus.attackSpeedPercent ?? 0) / 100);
  const accessoryRangeMult = 1 + ((equippedAccessory?.statBonus.rangePercent ?? 0) / 100);
  const accessoryHpMult = 1 + ((equippedAccessory?.statBonus.maxHpPercent ?? 0) / 100);
  const accessorySpeedMoveMult = 1 + ((equippedAccessory?.statBonus.moveSpeedPercent ?? 0) / 100);

  const blessingDamageMult = activeBlessing?.effect.damageMultiplier ?? 1.0;
  const blessingSpeedMult = activeBlessing?.effect.attackSpeedMultiplier ?? 1.0;
  const blessingHpMult = activeBlessing?.effect.maxHpMultiplier ?? 1.0;

  const totalDamage = Math.round(character.baseDamage * levelMult * accessoryDamageMult * blessingDamageMult);
  const totalMaxHp = Math.round(character.baseHp * levelMult * accessoryHpMult * blessingHpMult);
  const totalAttackRange = Math.round(character.attackRange * accessoryRangeMult);
  const totalAttackSpeed = character.attackSpeed * accessorySpeedMult * blessingSpeedMult;
  const moveSpeed = 4.8 * accessorySpeedMoveMult;

  // Referências para o loop de física e lógica sem recriação
  const gameStateRef = useRef({
    isRunning: true,
    player: {
      x: 100,
      y: 0,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      isGrounded: false,
      facing: 1 as 1 | -1,
      hp: totalMaxHp,
      maxHp: totalMaxHp,
      invincibleTimer: 0,
      isAttacking: false,
      attackTimer: 0,
      attackType: 'basic' as 'basic' | 'special' | 'ultimate',
      specialCooldown: 0,
      ultimateCooldown: 0,
    },
    enemies: [] as EnemyDef[],
    wave: 1,
    waveTotal: 4,
    waveSpawned: 0,
    waveSpawnMax: 3,
    spawnTimer: 0,
    waveCleared: false,
    floatingTexts: [] as FloatingText[],
    particles: [] as ParticleEffect[],
    projectiles: [] as Projectile[],
    boss: null as EnemyDef | null,
    totalDefeated: 0,
    cameraShake: 0,
  });

  // Inputs
  const inputRef = useRef({
    left: false,
    right: false,
    jump: false,
  });

  // Inicializar HP nos estados
  useEffect(() => {
    setPlayerHp(totalMaxHp);
    setPlayerMaxHp(totalMaxHp);
    gameStateRef.current.player.hp = totalMaxHp;
    gameStateRef.current.player.maxHp = totalMaxHp;
  }, [totalMaxHp]);

  // Funções de ataque disparadas pelos botões ou teclas
  const triggerAttack = useCallback(() => {
    const s = gameStateRef.current;
    if (!s.isRunning || s.player.hp <= 0) return;
    if (s.player.isAttacking) return;

    s.player.isAttacking = true;
    s.player.attackTimer = 0.22 / totalAttackSpeed;
    s.player.attackType = 'basic';
    soundManager.playSlash();

    // Spawn partículas de slash
    const slashX = s.player.x + (s.player.facing === 1 ? s.player.width + 10 : -10);
    const slashY = s.player.y + s.player.height / 2;
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: slashX,
        y: slashY + (Math.random() - 0.5) * 40,
        vx: s.player.facing * (2 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 3,
        color: character.auraColor,
        size: 3 + Math.random() * 4,
        alpha: 1,
        life: 0.25,
        maxLife: 0.25,
      });
    }

    // Verificar colisão do ataque básico
    const hitBox = {
      x: s.player.facing === 1 ? s.player.x + s.player.width : s.player.x - totalAttackRange,
      y: s.player.y - 10,
      width: totalAttackRange,
      height: s.player.height + 20,
    };

    let hitAny = false;
    s.enemies.forEach((enemy) => {
      if (
        hitBox.x < enemy.x + enemy.width &&
        hitBox.x + hitBox.width > enemy.x &&
        hitBox.y < enemy.y + enemy.height &&
        hitBox.y + hitBox.height > enemy.y
      ) {
        // Dano
        const variation = 0.9 + Math.random() * 0.2;
        const dmg = Math.round(totalDamage * variation);
        enemy.hp -= dmg;
        hitAny = true;

        // Impulso (knockback)
        enemy.x += s.player.facing * 18;

        // Texto flutuante
        s.floatingTexts.push({
          id: Math.random().toString(),
          x: enemy.x + enemy.width / 2,
          y: enemy.y - 10,
          text: `-${dmg}`,
          color: '#facc15',
          alpha: 1,
          vy: -2,
        });

        // Partículas de hit
        for (let p = 0; p < 6; p++) {
          s.particles.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height / 2,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            color: '#ef4444',
            size: 3 + Math.random() * 3,
            alpha: 1,
            life: 0.3,
            maxLife: 0.3,
          });
        }
      }
    });

    if (hitAny) {
      soundManager.playHit();
      s.cameraShake = 4;
    }
  }, [totalDamage, totalAttackRange, totalAttackSpeed, character.auraColor]);

  // Disparo de Habilidade Especial
  const triggerSpecial = useCallback(() => {
    const s = gameStateRef.current;
    if (!s.isRunning || s.player.hp <= 0) return;
    if (s.player.specialCooldown > 0) return;

    s.player.specialCooldown = character.specialSkill.cooldown;
    s.player.isAttacking = true;
    s.player.attackTimer = 0.4;
    s.player.attackType = 'special';
    soundManager.playSpecial();

    s.cameraShake = 8;

    // Dispara projétil ou golpe de longo alcance
    const skillRange = character.specialSkill.range * accessoryRangeMult;
    const skillDmg = Math.round(totalDamage * character.specialSkill.damageMultiplier);

    // Efeito de projétil / onda de energia
    s.projectiles.push({
      id: Math.random().toString(),
      x: s.player.facing === 1 ? s.player.x + s.player.width : s.player.x,
      y: s.player.y + s.player.height / 2,
      vx: s.player.facing * 11,
      damage: skillDmg,
      rangeLeft: skillRange,
      fromPlayer: true,
      color: character.specialSkill.effectColor,
      radius: 18,
    });

    // Partículas ao redor do personagem
    for (let i = 0; i < 20; i++) {
      s.particles.push({
        x: s.player.x + s.player.width / 2,
        y: s.player.y + s.player.height / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: character.specialSkill.effectColor,
        size: 4 + Math.random() * 5,
        alpha: 1,
        life: 0.45,
        maxLife: 0.45,
      });
    }
  }, [character.specialSkill, accessoryRangeMult, totalDamage]);

  // Disparo de Habilidade Suprema
  const triggerUltimate = useCallback(() => {
    const s = gameStateRef.current;
    if (!character.ultimateSkill) return;
    if (!s.isRunning || s.player.hp <= 0) return;
    if (s.player.ultimateCooldown > 0) return;

    s.player.ultimateCooldown = character.ultimateSkill.cooldown;
    s.player.isAttacking = true;
    s.player.attackTimer = 0.7;
    s.player.attackType = 'ultimate';
    soundManager.playUltimate();

    s.cameraShake = 16;

    const ultDmg = Math.round(totalDamage * character.ultimateSkill.damageMultiplier);

    // Dano massivo a TODOS os inimigos na tela com animação de tela inteira
    s.enemies.forEach((enemy) => {
      enemy.hp -= ultDmg;
      enemy.x += s.player.facing * 35;

      s.floatingTexts.push({
        id: Math.random().toString(),
        x: enemy.x + enemy.width / 2,
        y: enemy.y - 25,
        text: `CRÍTICO! -${ultDmg}`,
        color: '#f43f5e',
        alpha: 1,
        vy: -3,
      });
    });

    // Chuva de partículas cósmicas
    for (let i = 0; i < 45; i++) {
      s.particles.push({
        x: s.player.x + (Math.random() - 0.5) * 400,
        y: s.player.y + (Math.random() - 0.5) * 200,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: character.ultimateSkill.effectColor,
        size: 5 + Math.random() * 8,
        alpha: 1,
        life: 0.6,
        maxLife: 0.6,
      });
    }
  }, [character.ultimateSkill, totalDamage]);

  // Pulo
  const triggerJump = useCallback(() => {
    const s = gameStateRef.current;
    if (!s.isRunning || s.player.hp <= 0) return;
    if (s.player.isGrounded) {
      s.player.vy = -14.5;
      s.player.isGrounded = false;
      soundManager.playJump();

      // Partículas no chão ao pular
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: s.player.x + s.player.width / 2,
          y: s.player.y + s.player.height,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 2,
          color: '#64748b',
          size: 3,
          alpha: 0.8,
          life: 0.25,
          maxLife: 0.25,
        });
      }
    }
  }, []);

  // Escuta de teclado para PC (WASD / Setas / J / K / L / Espaço)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === 'a' || key === 'arrowleft') {
        inputRef.current.left = true;
      } else if (key === 'd' || key === 'arrowright') {
        inputRef.current.right = true;
      } else if (key === 'w' || key === 'arrowup' || key === ' ') {
        inputRef.current.jump = true;
        triggerJump();
      } else if (key === 'j') {
        triggerAttack();
      } else if (key === 'k') {
        triggerSpecial();
      } else if (key === 'l') {
        triggerUltimate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') {
        inputRef.current.left = false;
      } else if (key === 'd' || key === 'arrowright') {
        inputRef.current.right = false;
      } else if (key === 'w' || key === 'arrowup' || key === ' ') {
        inputRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerJump, triggerAttack, triggerSpecial, triggerUltimate]);

  // Função geradora de inimigos por onda
  const spawnEnemyForWave = (wave: number, arenaWidth: number, groundY: number): EnemyDef => {
    const isBoss = wave === 4;
    const x = Math.random() > 0.5 ? arenaWidth + 20 : -40;

    if (isBoss) {
      soundManager.playBossAlert();
      return {
        id: `boss_${Date.now()}`,
        name: 'General da Fenda Sombria',
        type: 'boss',
        maxHp: 850,
        hp: 850,
        damage: 26,
        speed: 1.6,
        x: arenaWidth - 120,
        y: groundY - 96,
        width: 68,
        height: 96,
        isGrounded: true,
        facing: -1,
        attackCooldown: 1.8,
        currentCooldown: 1.0,
        color: '#be123c', // Carmesim ameaçador
        isBoss: true,
        specialAttackTimer: 4.0,
      };
    }

    if (wave === 1) {
      // Inimigos básicos (Demon Slayer Ghoul)
      return {
        id: `enemy_w1_${Date.now()}_${Math.random()}`,
        name: 'Esqueleto Renegado',
        type: 'basic',
        maxHp: 70,
        hp: 70,
        damage: 8,
        speed: 1.8,
        x,
        y: groundY - 56,
        width: 36,
        height: 56,
        isGrounded: true,
        facing: x < arenaWidth / 2 ? 1 : -1,
        attackCooldown: 1.5,
        currentCooldown: 0.5,
        color: '#64748b',
      };
    } else if (wave === 2) {
      // Inimigos reforçados
      return {
        id: `enemy_w2_${Date.now()}_${Math.random()}`,
        name: 'Guerreiro da Sombra',
        type: 'armored',
        maxHp: 130,
        hp: 130,
        damage: 13,
        speed: 2.1,
        x,
        y: groundY - 60,
        width: 40,
        height: 60,
        isGrounded: true,
        facing: x < arenaWidth / 2 ? 1 : -1,
        attackCooldown: 1.3,
        currentCooldown: 0.8,
        color: '#475569',
      };
    } else {
      // Wave 3: Inimigos variados (alguns rápidos, outros atiradores)
      const isRanged = Math.random() > 0.5;
      return {
        id: `enemy_w3_${Date.now()}_${Math.random()}`,
        name: isRanged ? 'Feiticeiro do Vazio' : 'Algoz Sinistro',
        type: isRanged ? 'ranged' : 'armored',
        maxHp: isRanged ? 110 : 170,
        hp: isRanged ? 110 : 170,
        damage: isRanged ? 14 : 17,
        speed: isRanged ? 1.5 : 2.4,
        x,
        y: groundY - 58,
        width: 38,
        height: 58,
        isGrounded: true,
        facing: x < arenaWidth / 2 ? 1 : -1,
        attackCooldown: 1.6,
        currentCooldown: 0.6,
        color: isRanged ? '#7c3aed' : '#334155',
      };
    }
  };

  // LOOP PRINCIPAL DO JOGO (Canvas 2D a 60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    // Redimensionamento responsivo interno
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Posição inicial no chão
    const arenaWidth = canvas.getBoundingClientRect().width;
    const arenaHeight = canvas.getBoundingClientRect().height;
    const groundY = arenaHeight - 65;

    const s = gameStateRef.current;
    s.player.x = 80;
    s.player.y = groundY - s.player.height;
    s.player.isGrounded = true;

    // Configuração da Wave 1
    s.wave = 1;
    s.waveSpawned = 0;
    s.waveSpawnMax = 3;
    s.enemies = [];

    // Loop
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // cap dt em 50ms para evitar saltos
      lastTime = currentTime;

      const currentWidth = canvas.getBoundingClientRect().width;
      const currentHeight = canvas.getBoundingClientRect().height;
      const currentGroundY = currentHeight - 65;

      // 1. Atualizar Cooldowns do Jogador
      if (s.player.specialCooldown > 0) {
        s.player.specialCooldown = Math.max(0, s.player.specialCooldown - dt);
        setSpecialCooldownLeft(Math.ceil(s.player.specialCooldown));
      } else {
        setSpecialCooldownLeft(0);
      }

      if (s.player.ultimateCooldown > 0) {
        s.player.ultimateCooldown = Math.max(0, s.player.ultimateCooldown - dt);
        setUltimateCooldownLeft(Math.ceil(s.player.ultimateCooldown));
      } else {
        setUltimateCooldownLeft(0);
      }

      if (s.player.invincibleTimer > 0) {
        s.player.invincibleTimer = Math.max(0, s.player.invincibleTimer - dt);
      }

      if (s.player.isAttacking) {
        s.player.attackTimer -= dt;
        if (s.player.attackTimer <= 0) {
          s.player.isAttacking = false;
        }
      }

      // 2. Movimentação e Gravidade do Jogador
      if (inputRef.current.left) {
        s.player.vx = -moveSpeed;
        s.player.facing = -1;
      } else if (inputRef.current.right) {
        s.player.vx = moveSpeed;
        s.player.facing = 1;
      } else {
        s.player.vx = 0;
      }

      // Gravidade
      s.player.vy += 32 * dt;
      s.player.x += s.player.vx;
      s.player.y += s.player.vy;

      // Colisão de chão
      if (s.player.y + s.player.height >= currentGroundY) {
        s.player.y = currentGroundY - s.player.height;
        s.player.vy = 0;
        s.player.isGrounded = true;
      } else {
        s.player.isGrounded = false;
      }

      // Limites de tela
      if (s.player.x < 10) s.player.x = 10;
      if (s.player.x + s.player.width > currentWidth - 10) {
        s.player.x = currentWidth - 10 - s.player.width;
      }

      // 3. Sistema de Spawning da Onda Atual
      s.spawnTimer += dt;
      if (s.waveSpawned < s.waveSpawnMax && s.spawnTimer >= 1.6) {
        s.spawnTimer = 0;
        const enemy = spawnEnemyForWave(s.wave, currentWidth, currentGroundY);
        s.enemies.push(enemy);
        s.waveSpawned++;
        if (enemy.isBoss) {
          s.boss = enemy;
        }
      }

      // Atualizar Boss no HUD caso exista
      if (s.boss && s.wave === 4) {
        setBossHp({
          current: Math.max(0, s.boss.hp),
          max: s.boss.maxHp,
          name: s.boss.name,
        });
      } else {
        setBossHp(null);
      }

      // 4. Atualizar Inimigos
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        const enemy = s.enemies[i];

        // Morte do inimigo
        if (enemy.hp <= 0) {
          s.totalDefeated++;
          soundManager.playGemCollect();

          // Partículas de derrota
          for (let p = 0; p < 12; p++) {
            s.particles.push({
              x: enemy.x + enemy.width / 2,
              y: enemy.y + enemy.height / 2,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 5,
              color: enemy.color,
              size: 4 + Math.random() * 4,
              alpha: 1,
              life: 0.4,
              maxLife: 0.4,
            });
          }

          s.enemies.splice(i, 1);
          continue;
        }

        // IA de aproximação
        const playerCenterX = s.player.x + s.player.width / 2;
        const enemyCenterX = enemy.x + enemy.width / 2;
        const dist = Math.abs(playerCenterX - enemyCenterX);

        if (playerCenterX < enemyCenterX) {
          enemy.facing = -1;
        } else {
          enemy.facing = 1;
        }

        // Ataques e Movimentação
        enemy.currentCooldown -= dt;

        if (enemy.type === 'ranged' && dist > 180 && dist < 320) {
          // Inimigo à distância atira projétil sombrio
          if (enemy.currentCooldown <= 0) {
            enemy.currentCooldown = enemy.attackCooldown;
            s.projectiles.push({
              id: Math.random().toString(),
              x: enemy.facing === 1 ? enemy.x + enemy.width : enemy.x,
              y: enemy.y + enemy.height / 2,
              vx: enemy.facing * 5,
              damage: enemy.damage,
              rangeLeft: 300,
              fromPlayer: false,
              color: '#a855f7',
              radius: 9,
            });
          }
        } else if (dist > 35) {
          // Aproximar-se do jogador
          enemy.x += enemy.facing * enemy.speed;
        } else {
          // Alcance corpo-a-corpo: Ataque no jogador
          if (enemy.currentCooldown <= 0 && s.player.hp > 0) {
            enemy.currentCooldown = enemy.attackCooldown;

            // Se jogador não estiver invulnerável
            if (s.player.invincibleTimer <= 0) {
              s.player.hp = Math.max(0, s.player.hp - enemy.damage);
              s.player.invincibleTimer = 0.6; // 600ms invulnerável após hit
              setPlayerHp(s.player.hp);
              soundManager.playHit();
              s.cameraShake = 6;

              // Texto flutuante de dano no jogador
              s.floatingTexts.push({
                id: Math.random().toString(),
                x: s.player.x + s.player.width / 2,
                y: s.player.y - 12,
                text: `-${enemy.damage}`,
                color: '#ef4444',
                alpha: 1,
                vy: -2,
              });

              // Se a vida do jogador zerou
              if (s.player.hp <= 0) {
                s.isRunning = false;
                onDefeat(s.wave);
                return;
              }
            }
          }
        }

        // Ataque especial do Boss (Onda de choque na terra)
        if (enemy.isBoss) {
          enemy.specialAttackTimer = (enemy.specialAttackTimer ?? 4) - dt;
          if (enemy.specialAttackTimer <= 0) {
            enemy.specialAttackTimer = 4.5;
            s.cameraShake = 12;

            // Dispara duas ondas de choque no chão
            [-1, 1].forEach((dir) => {
              s.projectiles.push({
                id: Math.random().toString(),
                x: enemy.x + enemy.width / 2,
                y: currentGroundY - 15,
                vx: dir * 7,
                damage: Math.round(enemy.damage * 1.5),
                rangeLeft: 350,
                fromPlayer: false,
                color: '#e11d48',
                radius: 14,
              });
            });

            // Partículas de fúria do boss
            for (let b = 0; b < 16; b++) {
              s.particles.push({
                x: enemy.x + enemy.width / 2,
                y: currentGroundY,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 6,
                color: '#f43f5e',
                size: 5,
                alpha: 1,
                life: 0.5,
                maxLife: 0.5,
              });
            }
          }
        }
      }

      // 5. Atualizar Projéteis
      for (let pIdx = s.projectiles.length - 1; pIdx >= 0; pIdx--) {
        const proj = s.projectiles[pIdx];
        proj.x += proj.vx;
        proj.rangeLeft -= Math.abs(proj.vx);

        // Se o projétil expirou ou saiu da tela
        if (proj.rangeLeft <= 0 || proj.x < -50 || proj.x > currentWidth + 50) {
          s.projectiles.splice(pIdx, 1);
          continue;
        }

        if (proj.fromPlayer) {
          // Colisão com inimigos
          let hitEnemy = false;
          s.enemies.forEach((enemy) => {
            if (
              proj.x + proj.radius > enemy.x &&
              proj.x - proj.radius < enemy.x + enemy.width &&
              proj.y + proj.radius > enemy.y &&
              proj.y - proj.radius < enemy.y + enemy.height
            ) {
              enemy.hp -= proj.damage;
              hitEnemy = true;
              s.cameraShake = 5;

              s.floatingTexts.push({
                id: Math.random().toString(),
                x: enemy.x + enemy.width / 2,
                y: enemy.y - 15,
                text: `-${proj.damage}`,
                color: proj.color,
                alpha: 1,
                vy: -2.5,
              });
            }
          });
          if (hitEnemy) {
            soundManager.playHit();
            s.projectiles.splice(pIdx, 1);
            continue;
          }
        } else {
          // Projétil inimigo atingindo o jogador
          if (
            proj.x + proj.radius > s.player.x &&
            proj.x - proj.radius < s.player.x + s.player.width &&
            proj.y + proj.radius > s.player.y &&
            proj.y - proj.radius < s.player.y + s.player.height
          ) {
            if (s.player.invincibleTimer <= 0) {
              s.player.hp = Math.max(0, s.player.hp - proj.damage);
              s.player.invincibleTimer = 0.5;
              setPlayerHp(s.player.hp);
              soundManager.playHit();

              s.floatingTexts.push({
                id: Math.random().toString(),
                x: s.player.x + s.player.width / 2,
                y: s.player.y - 10,
                text: `-${proj.damage}`,
                color: '#ef4444',
                alpha: 1,
                vy: -2,
              });

              if (s.player.hp <= 0) {
                s.isRunning = false;
                onDefeat(s.wave);
                return;
              }
            }
            s.projectiles.splice(pIdx, 1);
            continue;
          }
        }
      }

      // 6. Transição de Onda ou Vitória
      if (s.enemies.length === 0 && s.waveSpawned >= s.waveSpawnMax) {
        if (s.wave < s.waveTotal) {
          // Avançar para a próxima onda
          s.wave++;
          setCurrentWave(s.wave);
          s.waveSpawned = 0;
          s.spawnTimer = -1.2; // Pequena pausa dramática entre ondas

          // Configurações das ondas
          if (s.wave === 2) {
            s.waveSpawnMax = 4;
            setWaveBanner('ONDA 2 / 4: INIMIGOS REFORÇADOS');
          } else if (s.wave === 3) {
            s.waveSpawnMax = 5;
            setWaveBanner('ONDA 3 / 4: FORÇAS VARIADAS');
          } else if (s.wave === 4) {
            s.waveSpawnMax = 1; // Mini-boss
            setWaveBanner('⚠️ ALERTA: ONDA 4 — MINI-BOSS FINAL! ⚠️');
          }

          // Se tiver a Bênção da Recuperação ativa, regenera 25% da vida
          if (activeBlessing?.id === 'blessing_of_recovery') {
            const healAmt = Math.round(s.player.maxHp * 0.25);
            s.player.hp = Math.min(s.player.maxHp, s.player.hp + healAmt);
            setPlayerHp(s.player.hp);
            s.floatingTexts.push({
              id: Math.random().toString(),
              x: s.player.x + s.player.width / 2,
              y: s.player.y - 20,
              text: `+${healAmt} HP (BÊNÇÃO)`,
              color: '#34d399',
              alpha: 1,
              vy: -2,
            });
          }

          setTimeout(() => {
            setWaveBanner(null);
          }, 2400);
        } else {
          // Todas as 4 waves concluídas! Vitória!
          s.isRunning = false;
          soundManager.playVictory();
          onVictory(s.totalDefeated);
          return;
        }
      }

      // 7. Atualizar Partículas e Textos Flutuantes
      for (let pIdx = s.particles.length - 1; pIdx >= 0; pIdx--) {
        const p = s.particles[pIdx];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          s.particles.splice(pIdx, 1);
        }
      }

      for (let tIdx = s.floatingTexts.length - 1; tIdx >= 0; tIdx--) {
        const ft = s.floatingTexts[tIdx];
        ft.y += ft.vy;
        ft.alpha -= dt * 1.5;
        if (ft.alpha <= 0) {
          s.floatingTexts.splice(tIdx, 1);
        }
      }

      // 8. RENDERIZAÇÃO NO CANVAS 2D
      ctx.clearRect(0, 0, currentWidth, currentHeight);

      // Tremor de tela
      ctx.save();
      if (s.cameraShake > 0) {
        const shakeX = (Math.random() - 0.5) * s.cameraShake;
        const shakeY = (Math.random() - 0.5) * s.cameraShake;
        ctx.translate(shakeX, shakeY);
        s.cameraShake = Math.max(0, s.cameraShake - dt * 25);
      }

      // Fundo estilizado com gradiente de crepúsculo anime e lua
      const bgGrad = ctx.createLinearGradient(0, 0, 0, currentHeight);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.65, '#1e1b4b');
      bgGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, currentWidth, currentHeight);

      // Lua estilizada com aura luminosa
      ctx.save();
      ctx.beginPath();
      ctx.arc(currentWidth * 0.78, 65, 34, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fde047';
      ctx.shadowBlur = 30;
      ctx.fill();
      ctx.restore();

      // Silhuetas de montanhas / templos ao fundo
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.moveTo(0, currentGroundY);
      ctx.lineTo(currentWidth * 0.2, currentGroundY - 80);
      ctx.lineTo(currentWidth * 0.45, currentGroundY - 40);
      ctx.lineTo(currentWidth * 0.75, currentGroundY - 110);
      ctx.lineTo(currentWidth, currentGroundY - 45);
      ctx.lineTo(currentWidth, currentGroundY);
      ctx.fill();

      // Chão com borda brilhante e textura cyberpunk-anime
      const groundGrad = ctx.createLinearGradient(0, currentGroundY, 0, currentHeight);
      groundGrad.addColorStop(0, '#1e293b');
      groundGrad.addColorStop(0.2, '#0f172a');
      groundGrad.addColorStop(1, '#020617');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, currentGroundY, currentWidth, currentHeight - currentGroundY);

      // Linha do horizonte do chão
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, currentGroundY);
      ctx.lineTo(currentWidth, currentGroundY);
      ctx.stroke();

      // Desenhar Partículas
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Desenhar Inimigos
      s.enemies.forEach((enemy) => {
        ctx.save();

        // Sombra sob o inimigo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(enemy.x + enemy.width / 2, currentGroundY - 2, enemy.width * 0.6, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo do Inimigo estilizado
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

        // Olhos brilhantes na direção que está olhando
        ctx.fillStyle = enemy.isBoss ? '#facc15' : '#ef4444';
        const eyeOffset = enemy.facing === 1 ? enemy.width - 10 : 6;
        ctx.fillRect(enemy.x + eyeOffset, enemy.y + 12, 5, 5);

        // Barra de Vida acima do inimigo comum (o mini-boss tem barra no topo)
        if (!enemy.isBoss) {
          const barW = enemy.width;
          const barH = 5;
          const barX = enemy.x;
          const barY = enemy.y - 10;
          const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(barX, barY, barW, barH);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(barX, barY, barW * hpRatio, barH);
        }

        ctx.restore();
      });

      // Desenhar Projéteis
      s.projectiles.forEach((proj) => {
        ctx.save();
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Desenhar Jogador
      if (s.player.hp > 0) {
        ctx.save();

        // Efeito de piscar durante invulnerabilidade
        if (s.player.invincibleTimer > 0 && Math.floor(currentTime / 60) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }

        // Sombra nos pés
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(s.player.x + s.player.width / 2, currentGroundY - 2, s.player.width * 0.7, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Aura sutil ao redor do herói
        ctx.shadowColor = character.auraColor;
        ctx.shadowBlur = 14;

        // Traje / Corpo principal do personagem
        ctx.fillStyle = character.outfitColor;
        ctx.fillRect(s.player.x + 4, s.player.y + 18, s.player.width - 8, s.player.height - 18);

        // Cabeça e Cabelo com as cores definidas do personagem
        ctx.fillStyle = '#fde68a'; // Tom de pele anime
        ctx.fillRect(s.player.x + 8, s.player.y + 6, s.player.width - 16, 16);

        // Cabelo característico
        ctx.fillStyle = character.hairColor;
        ctx.fillRect(s.player.x + 6, s.player.y, s.player.width - 12, 12);
        // Franja estilizada
        const hairFringeX = s.player.facing === 1 ? s.player.x + s.player.width - 12 : s.player.x + 4;
        ctx.fillRect(hairFringeX, s.player.y + 8, 8, 8);

        // Olhos anime
        ctx.fillStyle = '#0f172a';
        const playerEyeX = s.player.facing === 1 ? s.player.x + s.player.width - 12 : s.player.x + 8;
        ctx.fillRect(playerEyeX, s.player.y + 12, 4, 4);

        // Efeito visual animado de golpe / slash
        if (s.player.isAttacking) {
          ctx.save();
          const arcX = s.player.x + (s.player.facing === 1 ? s.player.width + 12 : -12);
          const arcY = s.player.y + s.player.height / 2;

          ctx.strokeStyle = s.player.attackType === 'special'
            ? character.specialSkill.effectColor
            : s.player.attackType === 'ultimate'
            ? character.ultimateSkill?.effectColor || '#ec4899'
            : character.auraColor;
          ctx.lineWidth = 5;
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 16;

          ctx.beginPath();
          if (s.player.facing === 1) {
            ctx.arc(arcX, arcY, 32, -Math.PI * 0.4, Math.PI * 0.4);
          } else {
            ctx.arc(arcX, arcY, 32, Math.PI * 0.6, Math.PI * 1.4);
          }
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      }

      // Desenhar Textos Flutuantes (Números de dano / cura)
      s.floatingTexts.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.font = 'bold 15px "Chakra Petch", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore(); // Restaura câmera shake

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [character, moveSpeed, onDefeat, onVictory, activeBlessing]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden bg-slate-950 select-none">
      {/* 1. HUD SUPERIOR (Vida do Jogador, Onda Atual, Mini-Boss e Botão Sair) */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 flex flex-col gap-2 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none">
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
          {/* Status do Jogador */}
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-lg border flex items-center justify-center font-display font-bold text-base shadow-sm shrink-0"
              style={{
                borderColor: character.themeColor,
                backgroundColor: `${character.themeColor}22`,
                color: character.themeColor,
              }}
            >
              Nv.{level}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wide text-white truncate max-w-[130px] sm:max-w-[200px]">
                  {character.name}
                </span>
                <span className="text-[11px] font-mono-numbers text-slate-400">
                  {playerHp} / {playerMaxHp} HP
                </span>
              </div>
              {/* Barra de Vida */}
              <div className="w-36 sm:w-56 h-2.5 bg-slate-900/90 rounded-full border border-slate-700/60 overflow-hidden mt-1">
                <div
                  className="h-full transition-all duration-150 rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%`,
                    backgroundColor: playerHp < playerMaxHp * 0.3 ? '#ef4444' : '#10b981',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Indicador de Onda Central */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">ONDA</span>
            <div className="font-display font-bold text-lg text-amber-400 tracking-tight">
              {currentWave} <span className="text-xs text-slate-500 font-normal">/ 4</span>
            </div>
          </div>

          {/* Botão Sair para o Menu */}
          <button
            onClick={onBackToMenu}
            className="pointer-events-auto px-3 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Barra de Vida Especial do Mini-Boss na Wave 4 */}
        {bossHp && (
          <div className="max-w-md mx-auto w-full px-2 pt-1 flex flex-col items-center animate-fade-in">
            <div className="flex items-center justify-between w-full text-xs font-bold text-rose-400 mb-1">
              <span>{bossHp.name}</span>
              <span className="font-mono-numbers">{bossHp.current} / {bossHp.max} HP</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full border border-rose-600/60 overflow-hidden shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-100"
                style={{ width: `${Math.max(0, (bossHp.current / bossHp.max) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. BANNER DE TRANSIÇÃO DE ONDA */}
      {waveBanner && (
        <div className="absolute inset-x-0 top-24 z-20 flex justify-center pointer-events-none animate-bounce">
          <div className="px-6 py-2 rounded-xl bg-slate-900/90 border border-amber-500/50 text-amber-400 font-display font-bold text-sm sm:text-base tracking-wider shadow-lg backdrop-blur-md">
            {waveBanner}
          </div>
        </div>
      )}

      {/* 3. ELEMENTO CANVAS 2D DO JOGO */}
      <canvas ref={canvasRef} className="w-full h-full block touch-none" />

      {/* 4. CONTROLES VIRTUAIS MOBILE (TÁTEIS & RESPONSIVOS NO BOTTOM 40%) */}
      <div className="absolute bottom-3 inset-x-0 z-30 px-4 py-2 flex items-end justify-between pointer-events-none max-w-4xl mx-auto w-full">
        {/* Painel Esquerdo: Andar Esquerda / Direita */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              inputRef.current.left = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              inputRef.current.left = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              inputRef.current.left = false;
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-slate-700/90 border border-slate-700 active:border-cyan-400 flex items-center justify-center text-slate-100 font-bold text-xl shadow-lg backdrop-blur-md active:scale-95 transition-all touch-button"
            aria-label="Andar para Esquerda"
          >
            ◀
          </button>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              inputRef.current.right = true;
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              inputRef.current.right = false;
            }}
            onPointerLeave={(e) => {
              e.preventDefault();
              inputRef.current.right = false;
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/85 active:bg-slate-700/90 border border-slate-700 active:border-cyan-400 flex items-center justify-center text-slate-100 font-bold text-xl shadow-lg backdrop-blur-md active:scale-95 transition-all touch-button"
            aria-label="Andar para Direita"
          >
            ▶
          </button>
        </div>

        {/* Painel Direito: Pulo, Ataque Básico, Especial e Suprema */}
        <div className="flex items-end gap-2.5 pointer-events-auto">
          {/* Botão de Pulo */}
          <button
            onClick={triggerJump}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-slate-900/85 active:bg-slate-700 border border-slate-700 flex flex-col items-center justify-center text-slate-100 font-bold text-xs shadow-lg backdrop-blur-md active:scale-95 transition-all touch-button"
            aria-label="Pular"
          >
            <span className="text-base leading-none">▲</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Pulo</span>
          </button>

          {/* Habilidade Suprema (se disponível) */}
          {character.ultimateSkill && (
            <button
              onClick={triggerUltimate}
              disabled={ultimateCooldownLeft > 0}
              className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border flex flex-col items-center justify-center font-bold text-xs shadow-lg backdrop-blur-md active:scale-95 transition-all touch-button relative overflow-hidden ${
                ultimateCooldownLeft > 0
                  ? 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-950/80 active:bg-rose-900 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.35)]'
              }`}
              aria-label="Habilidade Suprema"
            >
              {ultimateCooldownLeft > 0 ? (
                <span className="font-mono-numbers text-sm font-bold text-rose-400">
                  {ultimateCooldownLeft}s
                </span>
              ) : (
                <>
                  <span className="text-base leading-none">⚡</span>
                  <span className="text-[9px] text-rose-300 mt-0.5 font-display uppercase tracking-tight truncate max-w-[48px]">
                    Suprema
                  </span>
                </>
              )}
            </button>
          )}

          {/* Habilidade Especial */}
          <button
            onClick={triggerSpecial}
            disabled={specialCooldownLeft > 0}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl border flex flex-col items-center justify-center font-bold text-xs shadow-lg backdrop-blur-md active:scale-95 transition-all touch-button relative overflow-hidden ${
              specialCooldownLeft > 0
                ? 'bg-slate-950/80 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-950/80 active:bg-indigo-900 border-indigo-500 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
            }`}
            aria-label="Habilidade Especial"
          >
            {specialCooldownLeft > 0 ? (
              <span className="font-mono-numbers text-sm font-bold text-indigo-400">
                {specialCooldownLeft}s
              </span>
            ) : (
              <>
                <span className="text-base leading-none">✦</span>
                <span className="text-[9px] text-indigo-300 mt-0.5 font-display uppercase tracking-tight truncate max-w-[48px]">
                  Especial
                </span>
              </>
            )}
          </button>

          {/* Ataque Básico (Maior e com mais destaque) */}
          <button
            onClick={triggerAttack}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-3xl bg-amber-500 active:bg-amber-400 border border-amber-300 flex flex-col items-center justify-center text-slate-950 font-extrabold text-base shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all touch-button"
            aria-label="Ataque Básico"
          >
            <span className="text-xl leading-none">⚔️</span>
            <span className="text-[10px] font-display uppercase tracking-wide font-bold mt-0.5">
              Atacar
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
