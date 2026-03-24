'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUserProfile, UserProfile } from '../lib/user-profile';
import { notifyUser } from '../lib/notification-service';
import { sendVerificationEmail, updateLoginStreakAction } from '@/app/actions/auth';
import { toast } from 'sonner';
import { Flame } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithTwitter: async () => {},
  signInWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      if (isMounted.current) {
        setProfile(userProfile);
      }
    }
  };

  const ensureProfileExists = async (user: User) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    // Resolve Email (check providerData if user.email is null)
    let email = user.email;
    if (!email && user.providerData && user.providerData.length > 0) {
        for (const profile of user.providerData) {
            if (profile.email) {
                email = profile.email;
                break;
            }
        }
    }

    // Prepare default values from Provider
    let defaultDisplayName = user.displayName;
    if (!defaultDisplayName && email) {
      defaultDisplayName = email.split('@')[0];
    }

    let defaultPhotoURL = user.photoURL;
    if (!defaultPhotoURL && defaultDisplayName) {
      defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(defaultDisplayName)}&background=random`;
    }

    if (!docSnap.exists()) {
      // Create new profile ONLY if it truly doesn't exist
      await setDoc(docRef, {
        uid: user.uid,
        email: email,
        displayName: defaultDisplayName || 'Anonymous',
        photoURL: defaultPhotoURL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        locale: locale,
        preferences: {
          emailNotifications: true,
          publicProfile: true,
          showPrices: true,
          reducedMotion: false
        }
      }, { merge: true }); // Use merge to avoid overwriting if doc was created concurrently

      // Send Welcome Notification
      // Pass email explicitly to ensure it sends even if DB read is delayed
      notifyUser(user.uid, 'welcome', undefined, email || undefined).catch(console.error);
    } else {
      // Update existing profile ONLY for missing fields
      // CRITICAL: NEVER overwrite these protected fields:
      // - createdAt (join date)
      // - displayName (user's chosen name)
      // - photoURL (user's chosen avatar)
      // - characterName, characterId (Albion character linkage)
      // - guildName, guildId (guild affiliation)
      const data = docSnap.data();
      const updates: any = {};
      let needsUpdate = false;

      // Only update photoURL if:
      // 1. It's missing in Firestore AND
      // 2. User doesn't have a custom one (check if it's a ui-avatars URL from previous default)
      if (!data.photoURL && defaultPhotoURL) {
        updates.photoURL = defaultPhotoURL;
        needsUpdate = true;
      }

      // Only update displayName if:
      // 1. It's missing/empty in Firestore AND
      // 2. We have a default from provider
      // NEVER overwrite a custom displayName that the user set
      if (!data.displayName && defaultDisplayName) {
        updates.displayName = defaultDisplayName;
        needsUpdate = true;
      }

      // Backfill email if missing in Firestore but available now
      if (!data.email && email) {
        updates.email = email;
        needsUpdate = true;
      }

      // Update lastLoginAt (but NEVER createdAt!)
      updates.lastLoginAt = new Date().toISOString();
      needsUpdate = true;

      // Update locale if missing
      if (!data.locale && locale) {
        updates.locale = locale;
        needsUpdate = true;
      }

      if (needsUpdate) {
        // CRITICAL: Explicitly exclude protected fields from updates
        const safeUpdates: any = {};
        const protectedFields = ['createdAt', 'characterName', 'characterId', 'guildName', 'guildId', 'allianceName', 'allianceId'];
        
        for (const [key, value] of Object.entries(updates)) {
          if (!protectedFields.includes(key)) {
            safeUpdates[key] = value;
          }
        }
        
        await setDoc(docRef, safeUpdates, { merge: true });
      }
    }
  };

  useEffect(() => {
    // Check for redirect result (e.g. from Twitter login)
    getRedirectResult(auth).catch((error) => {
      console.error("Error getting redirect result", error);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isMounted.current) {
        setUser(firebaseUser);
      }

      if (firebaseUser) {
        // Don't block navigation on profile load
        ensureProfileExists(firebaseUser).catch(console.error);
        
        // Fetch profile in background
        getUserProfile(firebaseUser.uid)
          .then(userProfile => {
            if (isMounted.current) {
              setProfile(userProfile);
            }
          })
          .catch(console.error);

        // Update Login Streak - Only if it's a fresh login or a new day
        updateLoginStreakAction(firebaseUser.uid).then(result => {
          if (isMounted.current && result.success && result.isNewDay) {
            toast(t('Common.Notifications.streakNotification.title', { count: result.currentStreak }), {
              icon: <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />,
              description: result.currentStreak > 1 ? t('Common.Notifications.streakNotification.keepGoing') : t('Common.Notifications.streakNotification.welcome'),
            });
            // Re-fetch profile to get updated streak fields
            getUserProfile(firebaseUser.uid).then(updated => {
              if (isMounted.current) setProfile(updated);
            });
          }
        });
      } else {
        if (isMounted.current) setProfile(null);
      }

      if (isMounted.current) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw error;
      }
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error("Error signing in with Twitter", error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in with Email", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendVerificationEmail(email);
    } catch (error) {
      console.error("Error registering with Email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signInWithGoogle, 
      signInWithTwitter,
      signInWithEmail,
      registerWithEmail,
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
