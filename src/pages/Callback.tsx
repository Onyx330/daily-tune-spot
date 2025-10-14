import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Callback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (!code) {
        toast({
          title: "Error",
          description: "No authorization code received",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        // Exchange code for tokens
        const { data: authData, error: authError } = await supabase.functions.invoke(
          'spotify-auth',
          {
            body: { code },
            method: 'POST',
          }
        );

        if (authError) throw authError;

        const { access_token, refresh_token, expires_in } = authData;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user');
        }

        // Store tokens
        const { error: dbError } = await supabase
          .from('user_spotify_tokens')
          .upsert({
            user_id: user.id,
            access_token,
            refresh_token,
            expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
          });

        if (dbError) throw dbError;

        toast({
          title: "Connected!",
          description: "Successfully connected to Spotify",
        });

        navigate('/dashboard');
      } catch (error: any) {
        console.error('Callback error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to connect Spotify",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Connecting to Spotify...</p>
      </div>
    </div>
  );
};

export default Callback;