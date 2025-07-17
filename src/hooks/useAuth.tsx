
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const createProfileIfNeeded = async (user: User) => {
    try {
      console.log('🔍 createProfileIfNeeded called for user:', user.id, user.email);
      
      // First try to fetch existing profile
      console.log('📋 Attempting to fetch existing profile...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('📋 Fetch result:', { existingProfile, fetchError });

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', fetchError);
        return null;
      }

      if (existingProfile) {
        console.log('✅ Found existing profile:', existingProfile);
        return existingProfile;
      }

      // Create profile if it doesn't exist
      console.log('📝 No existing profile found, creating new one...');
      const role: 'admin' | 'user' = user.email === 'lucasrmorais2006@gmail.com' ? 'admin' : 'user';
      console.log('👤 User role determined:', role, 'for email:', user.email);
      
      const profileData = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        role: role
      };
      console.log('📝 Creating profile with data:', profileData);

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      console.log('📝 Create result:', { newProfile, createError });

      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return null;
      }

      console.log('✅ Successfully created profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('💥 Unexpected error in createProfileIfNeeded:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile creation/fetching to avoid blocking the auth callback
          setTimeout(async () => {
            try {
              const profileData = await createProfileIfNeeded(session.user);
              setProfile(profileData);
            } catch (error) {
              console.error('Profile creation/fetch failed:', error);
              setProfile(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        createProfileIfNeeded(session.user)
          .then(profileData => {
            setProfile(profileData);
            setLoading(false);
          })
          .catch(error => {
            console.error('Initial profile fetch failed:', error);
            setProfile(null);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error: error.message };
      }

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo à Copa Paizão",
        });
      }

      return {};
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { error: 'Erro inesperado ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        return { error: error.message };
      }

      if (data.user) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
        });
      }

      return {};
    } catch (err) {
      console.error('Unexpected sign up error:', err);
      return { error: 'Erro inesperado ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
