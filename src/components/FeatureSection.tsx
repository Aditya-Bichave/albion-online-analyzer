'use client';

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface FeatureSectionProps {
  title: string;
  description: string;
  link: string;
  linkText?: string;
  backgroundImage: string;
  previewImageLight: string;
  previewImageDark: string;
  reverse?: boolean;
}

export function FeatureSection({
  title,
  description,
  link,
  linkText = "Try it now",
  backgroundImage,
  previewImageLight,
  previewImageDark,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <section className="relative w-full min-h-[250px] flex items-center overflow-hidden border-2 border-background rounded-2xl group">
      {/* Albion Background Image Layer */}
      <div
        className="absolute inset-0 z-0 rounded-2xl"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center top',
          backgroundSize: 'cover',
        }}
      />

      {/* Gradient Overlay Layer */}
      <div className="absolute inset-0 z-10 rounded-2xl bg-gradient-to-r from-background via-background/90 to-background/70 dark:from-background dark:via-background/85 dark:to-background/60" />

      {/* Screenshot Overlay Layer
      <div
        className="absolute inset-0 z-0 rounded-2xl opacity-50"
        style={{
          backgroundImage: `url(${previewImageLight})`,
          backgroundPosition: 'center right',
          backgroundSize: 'cover',
        }}
      /> */}

      {/* Dark Mode Screenshot */}
      {/* <div
        className="absolute inset-0 z-0 hidden dark:block rounded-2xl opacity-80"
        style={{
          backgroundImage: `url(${previewImageDark})`,
          backgroundPosition: 'center right',
          backgroundSize: 'cover',
        }}
      /> */}

      <div className="container relative z-20 px-6 md:px-8 py-12">
        <div className="max-w-2xl space-y-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            {title}
          </h2>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
          
          {/* CTA Button */}
          <div className="pt-2">
            <Link
              href={link}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-amber-600 hover:from-amber-600 hover:to-primary text-primary-foreground rounded-2xl font-bold transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/20 shadow-lg"
            >
              {linkText}
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
