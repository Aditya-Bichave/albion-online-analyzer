import { Metadata } from 'next';
import UserProfileClient from './UserProfileClient';
import { getUserProfile } from '@/lib/user-profile';

export async function generateMetadata({ params }: { params: Promise<{ userId: string }> }): Promise<Metadata> {
  const { userId } = await params;
  const profile = await getUserProfile(userId);

  if (!profile) {
    return {
      title: 'User Not Found | AlbionKit',
      description: 'The requested user profile could not be found.',
    };
  }

  const title = `${profile.displayName || 'User'} | AlbionKit Profile`;
  const description = profile.signature || `${profile.displayName || 'User'}'s profile on AlbionKit. Check out their builds and stats.`;
  
  const images = [];
  if (profile.photoURL) images.push(profile.photoURL);
  images.push('https://albionkit.com/og-image.jpg');

  const bannerImage = profile.bannerUrl ? [profile.bannerUrl] : images;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      username: profile.displayName,
      images: images.map(url => ({ url })),
    },
    twitter: {
      card: profile.bannerUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: bannerImage,
    }
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <UserProfileClient userId={userId} />;
}
