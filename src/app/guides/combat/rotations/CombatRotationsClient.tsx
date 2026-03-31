'use client';

import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/PageShell';
import { InfoStrip } from '@/components/InfoStrip';
import Link from 'next/link';
import { 
  Sword, 
  Target, 
  Zap, 
  Shield,
  Skull,
  Flame,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface WeaponRotation {
  id: string;
  name: string;
  icon: any;
  difficulty: 'easy' | 'medium' | 'hard';
  burstDamage: number;
  sustainedDamage: number;
  mobility: number;
  rotation: string[];
  tips: string[];
  bestFor: string[];
}

const WEAPON_ROTATIONS: WeaponRotation[] = [
  {
    id: 'dagger',
    name: 'Dagger (Solo)',
    icon: Sword,
    difficulty: 'medium',
    burstDamage: 90,
    sustainedDamage: 60,
    mobility: 95,
    rotation: [
      'W (Evasive Strike) - Engage',
      'Q (Assassinate) - Gap closer + damage',
      'E (Shadow Slash) - Main damage + slow',
      'Auto-attack weave between abilities',
      'Use W to disengage or dodge key abilities'
    ],
    tips: [
      'Save W for dodging enemy CC or burst',
      'E applies slow - use to kite',
      'High energy cost - manage carefully',
      'Strong against ranged, weak vs tanks'
    ],
    bestFor: ['Solo PvP', 'Ganking', 'Hit & Run']
  },
  {
    id: 'sword',
    name: 'Sword (All-rounder)',
    icon: Shield,
    difficulty: 'easy',
    burstDamage: 70,
    sustainedDamage: 75,
    mobility: 60,
    rotation: [
      'Q (Slash) - Poke damage',
      'W (Deadly Spin) - Clear + damage',
      'E (Crescent Swipe) - Engage + slow',
      'Auto-attack between cooldowns',
      'Repeat rotation'
    ],
    tips: [
      'Balanced stats - good for beginners',
      'E provides gap close and escape',
      'Good sustain with passive heal',
      'Versatile for most content'
    ],
    bestFor: ['Beginners', 'Solo Content', 'Small Scale']
  },
  {
    id: 'fire-staff',
    name: 'Fire Staff (Ranged DPS)',
    icon: Flame,
    difficulty: 'hard',
    burstDamage: 95,
    sustainedDamage: 85,
    mobility: 30,
    rotation: [
      'W (Fireball) - Long range poke',
      'Q (Flamestrike) - AoE damage',
      'E (Immolate) - Self-buff + damage over time',
      'Auto-attack weave',
      'Reposition with E if needed'
    ],
    tips: [
      'Very squishy - position carefully',
      'High burst combo: E → W → Q',
      'Kite with W while moving',
      'Weak against melee engage'
    ],
    bestFor: ['Group PvP', 'ZvZ', 'Ranged DPS']
  },
  {
    id: 'bow',
    name: 'Bow (Ranged Physical)',
    icon: Target,
    difficulty: 'medium',
    burstDamage: 80,
    sustainedDamage: 70,
    mobility: 50,
    rotation: [
      'W (Poison Arrow) - DoT + slow',
      'Q (Aimed Shot) - High damage single target',
      'E (Multi-Shot) - AoE + knockback',
      'Auto-attack between abilities',
      'Use E to create distance'
    ],
    tips: [
      'W applies poison - stack for max damage',
      'E is your only defensive tool',
      'Strong kiting potential',
      'Good against melee classes'
    ],
    bestFor: ['Solo PvP', 'Kiting', 'Open World']
  },
  {
    id: 'axe',
    name: 'Battle Axe (Melee Bruiser)',
    icon: Skull,
    difficulty: 'easy',
    burstDamage: 75,
    sustainedDamage: 80,
    mobility: 40,
    rotation: [
      'Q (Cleave) - AoE damage',
      'W (Rending Strike) - Armor shred',
      'E (Terror Cry) - Fear + damage buff',
      'Auto-attack with passive stacks',
      'Use E before burst combo'
    ],
    tips: [
      'W reduces enemy armor significantly',
      'E fear can turn fights',
      'Good sustain with passive',
      'Strong duelist'
    ],
    bestFor: ['1v1 Duels', 'Small Scale', 'Sustained Fights']
  },
  {
    id: 'nature-staff',
    name: 'Nature Staff (Healer)',
    icon: Zap,
    difficulty: 'medium',
    burstDamage: 30,
    sustainedDamage: 40,
    mobility: 50,
    rotation: [
      'W (Rejuvenating Seeds) - HoT',
      'Q (Wild Growth) - AoE heal',
      'E (Entangling Roots) - CC + heal',
      'Auto-attack when not healing',
      'Prioritize W uptime on tanks'
    ],
    tips: [
      'Your job is to keep team alive',
      'E provides peel for squishies',
      'Position safely in backline',
      'Manage mana carefully'
    ],
    bestFor: ['Group Content', 'Healer Role', 'ZvZ']
  }
];

export default function CombatRotationsClient() {
  const t = useTranslations('CombatRotations');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10 border-success/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'hard': return 'text-destructive bg-destructive/10 border-destructive/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <PageShell
      title={t('title')}
      description={t('description')}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-info/10 border border-info/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-info mb-1">{t('practiceTitle')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('practiceDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/guides/combat/positioning"
            className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {t('positioningGuide')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('positioningDesc')}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/guides/combat/positioning"
            className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
          >
            <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                {t('positioningGuide')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('positioningDesc')}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Weapon Rotations Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">{t('weaponRotations')}</h2>
          
          {WEAPON_ROTATIONS.map((weapon) => {
            const Icon = weapon.icon;
            return (
              <div
                key={weapon.id}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{weapon.name}</h3>
                        <Badge className={getDifficultyColor(weapon.difficulty)}>
                          {t(weapon.difficulty)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('burstDamage')}</div>
                      <div className={`text-lg font-bold ${getStatColor(weapon.burstDamage)}`}>
                        {weapon.burstDamage}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('sustainedDamage')}</div>
                      <div className={`text-lg font-bold ${getStatColor(weapon.sustainedDamage)}`}>
                        {weapon.sustainedDamage}/100
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">{t('mobility')}</div>
                      <div className={`text-lg font-bold ${getStatColor(weapon.mobility)}`}>
                        {weapon.mobility}/100
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 grid md:grid-cols-2 gap-6">
                  {/* Rotation */}
                  <div>
                    <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {t('rotation')}
                    </h4>
                    <ol className="space-y-2">
                      {weapon.rotation.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="font-bold text-primary shrink-0">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div>
                    <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      {t('tips')}
                    </h4>
                    <ul className="space-y-2">
                      {weapon.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary shrink-0">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Best For */}
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-muted-foreground">{t('bestFor')}:</span>
                    {weapon.bestFor.map((use, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <InfoStrip currentPage="home" />
      </div>
    </PageShell>
  );
}
