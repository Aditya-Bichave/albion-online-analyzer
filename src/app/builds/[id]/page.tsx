import { Metadata } from 'next';
import { getBuild } from '@/lib/builds-service';
import { BuildView } from './BuildView';
import { getTranslations } from 'next-intl/server';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const build = await getBuild(id);
    const t = await getTranslations('BuildView');

    if (!build) {
        return {
            title: `${t('notFound')} | Albion Online Analyzer`,
            description: t('notFoundDesc'),
        };
    }

    // Extract YouTube ID for thumbnail if available
    let images = ['https://aditya-bichave.github.io/albion-online-analyzer/og-image.jpg'];
    if (build.youtubeLink) {
        const videoIdMatch = build.youtubeLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch && videoIdMatch[1]) {
            images = [`https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`, ...images];
        }
    }

    const description = build.description || t('checkoutBuild', { author: build.authorName || 'Unknown' });

    return {
        title: `${build.title} | Albion Online Analyzer`,
        description: description,
        alternates: {
            canonical: `https://aditya-bichave.github.io/albion-online-analyzer/builds/${id}`,
        },
        openGraph: {
            title: build.title,
            description: description,
            type: 'article',
            url: `https://aditya-bichave.github.io/albion-online-analyzer/builds/${id}`,
            images: images.map(url => ({ url })),
            authors: [build.authorName || 'Unknown'],
        },
        twitter: {
            card: 'summary_large_image',
            title: build.title,
            description: description,
            images: images,
        }
    };
}

export default async function BuildPage({ params }: PageProps) {
    const resolvedParams = await params;
    const build = await getBuild(resolvedParams.id);

    const jsonLd = build ? {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: build.title,
      description: build.description,
      author: {
        '@type': 'Person',
        name: build.authorName || 'Unknown'
      },
      datePublished: new Date().toISOString(),
      image: 'https://aditya-bichave.github.io/albion-online-analyzer/og-image.jpg',
      publisher: {
        '@type': 'Organization',
        name: 'Albion Online Analyzer',
        logo: {
          '@type': 'ImageObject',
          url: 'https://aditya-bichave.github.io/albion-online-analyzer/logo.png'
        }
      }
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <BuildView id={resolvedParams.id} />
        </>
    );
}
