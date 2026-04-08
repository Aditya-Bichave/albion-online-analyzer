'use client';

import { useTranslations } from 'next-intl';
import { Coffee, Github, Heart, Sparkles, Shield, Users, Zap } from 'lucide-react';

export default function DonateClient() {
  const t = useTranslations('DonatePage');

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Main Donate Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {/* Buy Me a Coffee */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75" />
            <div className="relative bg-card border border-amber-500/30 rounded-3xl p-8 hover:border-amber-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-4 rounded-2xl shadow-lg">
                  <Coffee className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{t('bmcTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('bmcSubtitle')}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('bmcDescription')}
              </p>

              <a
                href="https://buymeacoffee.com/albionkit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Coffee className="h-5 w-5" />
                <span>{t('bmcButton')}</span>
              </a>
            </div>
          </div>

          {/* GitHub Sponsors */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75" />
            <div className="relative bg-card border border-pink-500/30 rounded-3xl p-8 hover:border-pink-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-600 to-purple-600 p-4 rounded-2xl shadow-lg">
                  <Github className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{t('githubTitle')}</h3>
                  <p className="text-sm text-muted-foreground">{t('githubSubtitle')}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-6 leading-relaxed">
                {t('githubDescription')}
              </p>

              <a
                href="https://github.com/sponsors/cosmic-fi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/25 hover:shadow-xl hover:-translate-y-0.5"
              >
                <Github className="h-5 w-5" />
                <span>{t('githubButton')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="bg-card border border-border rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-center mb-4">{t('impactTitle')}</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              {t('impactSubtitle')}
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <ImpactCard
                icon={Shield}
                title={t('impact1Title')}
                description={t('impact1Desc')}
                color="text-blue-500"
                bg="bg-blue-500/10"
              />
              <ImpactCard
                icon={Zap}
                title={t('impact2Title')}
                description={t('impact2Desc')}
                color="text-amber-500"
                bg="bg-amber-500/10"
              />
              <ImpactCard
                icon={Users}
                title={t('impact3Title')}
                description={t('impact3Desc')}
                color="text-green-500"
                bg="bg-green-500/10"
              />
            </div>
          </div>
        </div>

        {/* Other Ways to Support */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold mb-8">{t('otherWaysTitle')}</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OtherWayCard
              icon={Sparkles}
              title={t('way1Title')}
              description={t('way1Desc')}
              color="text-purple-500"
            />
            <OtherWayCard
              icon={Heart}
              title={t('way2Title')}
              description={t('way2Desc')}
              color="text-red-500"
            />
            <OtherWayCard
              icon={Github}
              title={t('way3Title')}
              description={t('way3Desc')}
              color="text-foreground"
            />
            <OtherWayCard
              icon={Coffee}
              title={t('way4Title')}
              description={t('way4Desc')}
              color="text-amber-500"
            />
          </div>
        </div>

        {/* Thank You Section */}
        <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <Heart className="h-12 w-12 text-red-500 fill-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold mb-4">{t('thankYouTitle')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('thankYouDesc')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ImpactCard({ icon: Icon, title, description, color, bg }: {
  icon: any;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="text-center p-6">
      <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function OtherWayCard({ icon: Icon, title, description, color }: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all duration-300">
      <Icon className={`h-8 w-8 ${color} mx-auto mb-3`} />
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
