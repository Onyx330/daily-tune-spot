import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Recommendations } from "@/components/Recommendations";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      // Check if user has Spotify connected
      const { data: tokens } = await supabase
        .from('user_spotify_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!tokens) {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate]);

  return <Recommendations />;
};

export default Dashboard;