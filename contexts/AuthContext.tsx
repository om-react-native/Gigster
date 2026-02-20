import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Platform, Linking } from 'react-native';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

function getRedirectUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.origin;
  }
  const scheme = Constants.expoConfig?.expo?.scheme ?? 'myapp';
  const redirectUrl = `${scheme}://`;
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'AuthContext.tsx:getRedirectUrl',
      message: 'Redirect URL computed',
      data: { platform: Platform.OS, scheme, redirectUrl },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId: 'A',
    }),
  }).catch(() => {});
  // #endregion
  return redirectUrl;
}

function parseOAuthCallbackUrl(
  url: string
): { access_token?: string; refresh_token?: string } | null {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'AuthContext.tsx:parseOAuthCallbackUrl:entry',
        message: 'Parsing callback URL',
        data: { url: url.substring(0, 200), hasHash: url.includes('#') },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    const hashPart = url.includes('#') ? url.split('#')[1] : '';
    if (!hashPart) {
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AuthContext.tsx:parseOAuthCallbackUrl:noHash',
            message: 'No hash part found',
            data: { url: url.substring(0, 200) },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'C',
          }),
        }
      ).catch(() => {});
      // #endregion
      return null;
    }
    const params = new URLSearchParams(hashPart);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'AuthContext.tsx:parseOAuthCallbackUrl:tokens',
        message: 'Token extraction result',
        data: {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token,
          hashPartLength: hashPart.length,
        },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    if (access_token && refresh_token) return { access_token, refresh_token };
    return null;
  } catch (e) {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'AuthContext.tsx:parseOAuthCallbackUrl:error',
        message: 'Parse error',
        data: { error: String(e) },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    return null;
  }
}

async function handleOAuthUrl(url: string): Promise<boolean> {
  const tokens = parseOAuthCallbackUrl(url);
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'AuthContext.tsx:handleOAuthUrl:tokens',
      message: 'Tokens from parse',
      data: { hasTokens: !!tokens },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId: 'D',
    }),
  }).catch(() => {});
  // #endregion
  if (!tokens) return false;
  const { error } = await supabase.auth.setSession({
    access_token: tokens.access_token!,
    refresh_token: tokens.refresh_token!,
  });
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'AuthContext.tsx:handleOAuthUrl:setSession',
      message: 'setSession result',
      data: { hasError: !!error, errorMsg: error?.message },
      timestamp: Date.now(),
      sessionId: 'debug-session',
      hypothesisId: 'D',
    }),
  }).catch(() => {});
  // #endregion
  return !error;
}

type UserType = 'employee' | 'employer' | null;

interface Profile {
  id: string;
  user_type: UserType;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  userType: UserType;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    userType: 'employee' | 'employer'
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setUserType(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const scheme = Constants.expoConfig?.expo?.scheme ?? 'myapp';
    const handleUrl = async (url: string) => {
      if (url.startsWith(`${scheme}://`) && parseOAuthCallbackUrl(url)) {
        await handleOAuthUrl(url);
      }
    };
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });
    const sub = Linking.addEventListener('url', ({ url }) => handleUrl(url));
    return () => sub.remove();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
        setUserType(data.user_type);
      } else {
        // Profile doesn't exist - create one for OAuth users
        await createProfileForOAuthUser(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const createProfileForOAuthUser = async (userId: string) => {
    try {
      // Get user metadata from Supabase auth
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) return;

      const userMeta = authUser.user_metadata;
      const fullName = userMeta?.full_name || userMeta?.name || '';
      const email = authUser.email || userMeta?.email || '';
      const avatarUrl = userMeta?.avatar_url || userMeta?.picture || '';

      // Create profile with OAuth user data (default to employee)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        user_type: 'employee',
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        return;
      }

      // Create employee profile by default
      const { error: employeeError } = await supabase
        .from('employee_profiles')
        .insert({
          id: userId,
          position_type: 'server',
        });

      if (employeeError) {
        console.error('Error creating employee profile:', employeeError);
        return;
      }

      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (newProfile) {
        setProfile(newProfile);
        setUserType(newProfile.user_type);
      }
    } catch (error) {
      console.error('Error creating OAuth profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userType: 'employee' | 'employer'
  ) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: new Error('User creation failed') };

      // Profile and employee/employer profile are created by DB trigger (handle_new_user)
      await fetchProfile(authData.user.id);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserType(null);
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = getRedirectUrl();
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AuthContext.tsx:signInWithGoogle:start',
            message: 'Starting Google sign in',
            data: { redirectTo },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'A',
          }),
        }
      ).catch(() => {});
      // #endregion
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (error) return { error };
      if (!data?.url) return { error: new Error('No OAuth URL returned') };

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.location.href = data.url;
        return { error: null };
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );
      // #region agent log
      fetch(
        'http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'AuthContext.tsx:signInWithGoogle:browserResult',
            message: 'WebBrowser result',
            data: {
              resultType: result.type,
              hasUrl: 'url' in result && !!result.url,
              url: 'url' in result ? result.url?.substring(0, 200) : null,
            },
            timestamp: Date.now(),
            sessionId: 'debug-session',
            hypothesisId: 'B',
          }),
        }
      ).catch(() => {});
      // #endregion
      if (result.type === 'success' && result.url) {
        const handled = await handleOAuthUrl(result.url);
        // #region agent log
        fetch(
          'http://127.0.0.1:7245/ingest/9bac73d8-d3e3-4059-a92e-5e6d82b04247',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'AuthContext.tsx:signInWithGoogle:handled',
              message: 'handleOAuthUrl result',
              data: { handled },
              timestamp: Date.now(),
              sessionId: 'debug-session',
              hypothesisId: 'D',
            }),
          }
        ).catch(() => {});
        // #endregion
        return {
          error: handled ? null : new Error('Failed to complete sign in'),
        };
      }
      if (result.type === 'cancel') return { error: null };
      return { error: new Error('Sign in was cancelled or failed') };
    } catch (error) {
      return { error };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo },
      });
      if (error) return { error };
      if (!data?.url) return { error: new Error('No OAuth URL returned') };

      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined') window.location.href = data.url;
        return { error: null };
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );
      if (result.type === 'success' && result.url) {
        const handled = await handleOAuthUrl(result.url);
        return {
          error: handled ? null : new Error('Failed to complete sign in'),
        };
      }
      if (result.type === 'cancel') return { error: null };
      return { error: new Error('Sign in was cancelled or failed') };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        userType,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
