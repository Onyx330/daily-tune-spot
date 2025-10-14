import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "@/components/Hero";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const checkSpotifyConnection = async () => {
      if (user) {
        const { data: tokens } = await supabase
          .from('user_spotify_tokens')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (tokens) {
          navigate('/dashboard');
        }
      }
    };

    checkSpotifyConnection();
  }, [user, navigate]);

  const handleConnect = async () => {
    try {
      // First, sign up anonymously if not logged in
      if (!user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `user-${Date.now()}@dailytune.app`,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        });

        if (signUpError) throw signUpError;
        
        // Wait a bit for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Get auth URL
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'get-auth-url' }
      });

      if (error) throw error;

      if (data?.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to connect to Spotify",
        variant: "destructive",
      });
    }
  };

  return <Hero onConnect={handleConnect} />;
};

export default Index;
