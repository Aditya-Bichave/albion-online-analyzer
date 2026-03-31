'use client';

import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/PageShell';
import { WEAPONS_DATABASE, META_RATINGS, CONTENT_TYPES } from '@/data/weapons-database';
import { 
  Sword, Crosshair, Zap, Shield, Star, Clock, Target, TrendingUp, 
  AlertCircle, CheckCircle2, XCircle, ChevronLeft, Award, Heart,
  Flame, Droplets, Leaf
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Props {
  weaponId: string;
}

export default function WeaponDetailClient({ weaponId }: Props) {
  const t = useTranslations('WeaponDetail');
  const weapon = WEAPONS_DATABASE.find(w => w.id === weaponId);

  if (!weapon) {
    return <div>Weapon not found</div>;
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'melee': return <Sword className="h-5 w-5" />;
      case 'ranged': return <Crosshair className="h-5 w-5" />;
      case 'staff': return <Zap className="h-5 w-5" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  const getMetaColor = (rating: string) => {
    switch (rating) {
      case 'S': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'A': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'B': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'C': return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-success bg-success/10';
      case 'medium': return 'text-warning bg-warning/10';
      case 'hard': return 'text-destructive bg-destructive/10';
      default: return 'text-gray-500';
    }
  };

  const getStatColor = (value: number) => {
    if (value >= 80) return 'text-success';
    if (value >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <PageShell
      title={`${weapon.name} - ${t('guide')}`}
      description={`${weapon.name} ${t('guide')} - ${weapon.type}`}
    >
      <div className="space-y-8">
        {/* Back Button */}
        <Link href="/guides/combat/weapons">
          <Button variant="outline" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            {t('backToWeapons')}
          </Button>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/20">
                {getCategoryIcon(weapon.category)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{weapon.name}</h1>
                <p className="text-muted-foreground">{weapon.type} • {weapon.tier}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getMetaColor(weapon.metaRating)}>{weapon.metaRating}-Tier</Badge>
              <Badge variant="outline" className={getDifficultyColor(weapon.difficulty)}>
                {t(weapon.difficulty)}
              </Badge>
            </div>
          </div>

          {/* Roles */}
          <div className="flex flex-wrap gap-2">
            {weapon.role.map((role, index) => (
              <Badge key={index} variant="secondary">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-5 w-5 text-destructive" />
              <span className="text-sm text-muted-foreground">{t('burstDamage')}</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(weapon.stats.burstDamage)}`}>
              {weapon.stats.burstDamage}/100
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-warning" />
              <span className="text-sm text-muted-foreground">{t('sustainedDamage')}</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(weapon.stats.sustainedDamage)}`}>
              {weapon.stats.sustainedDamage}/100
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-info" />
              <span className="text-sm text-muted-foreground">{t('mobility')}</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(weapon.stats.mobility)}`}>
              {weapon.stats.mobility}/100
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-success" />
              <span className="text-sm text-muted-foreground">{t('survivability')}</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(weapon.stats.survivability)}`}>
              {weapon.stats.survivability}/100
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">{t('range')}</span>
            </div>
            <div className={`text-2xl font-bold ${getStatColor(weapon.stats.range)}`}>
              {weapon.stats.range}/100
            </div>
          </div>
        </div>

        {/* Abilities & Rotation */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Abilities */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('abilities')}
            </h2>
            <div className="space-y-4">
              {weapon.abilities.map((ability) => (
                <div key={ability.key} className="bg-muted/30 rounded-lg p-4 border border-border">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                      {ability.key}
                    </Badge>
                    <div>
                      <h3 className="font-bold text-foreground">{ability.name}</h3>
                      <p className="text-sm text-muted-foreground">{ability.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    {ability.cooldown && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('cooldown')}: {ability.cooldown}s
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rotation */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {weapon.rotation.name}
            </h2>
            <ol className="space-y-3 mb-6">
              {weapon.rotation.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <div className="bg-info/5 rounded-lg p-4 border border-info/20">
              <h3 className="font-bold text-info mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {t('tips')}
              </h3>
              <ul className="space-y-2">
                {weapon.rotation.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Best For / Counters / Weak Against */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              {t('bestFor')}
            </h2>
            <ul className="space-y-2">
              {weapon.bestFor.map((use, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-success">•</span>
                  {use}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Sword className="h-5 w-5 text-destructive" />
              {t('counters')}
            </h2>
            <ul className="space-y-2">
              {weapon.counters.map((target, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-destructive">•</span>
                  {target}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-warning" />
              {t('weakAgainst')}
            </h2>
            <ul className="space-y-2">
              {weapon.weakAgainst.map((target, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-warning">•</span>
                  {target}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Gear Recommendations */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {t('gearRecommendations')}
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {weapon.gearRecommendations.armor && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t('armor')}</div>
                <div className="text-sm font-bold text-foreground">{weapon.gearRecommendations.armor}</div>
              </div>
            )}
            {weapon.gearRecommendations.shoes && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t('shoes')}</div>
                <div className="text-sm font-bold text-foreground">{weapon.gearRecommendations.shoes}</div>
              </div>
            )}
            {weapon.gearRecommendations.cape && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t('cape')}</div>
                <div className="text-sm font-bold text-foreground">{weapon.gearRecommendations.cape}</div>
              </div>
            )}
            {weapon.gearRecommendations.food && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t('food')}</div>
                <div className="text-sm font-bold text-foreground">{weapon.gearRecommendations.food}</div>
              </div>
            )}
            {weapon.gearRecommendations.potion && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">{t('potion')}</div>
                <div className="text-sm font-bold text-foreground">{weapon.gearRecommendations.potion}</div>
              </div>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border border-primary/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">{t('metaInfo')}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t('metaRating')}</div>
              <div className="font-bold text-foreground">
                {META_RATINGS[weapon.metaRating as keyof typeof META_RATINGS]}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t('lastUpdated')}</div>
              <div className="font-bold text-foreground">{weapon.lastUpdated}</div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
