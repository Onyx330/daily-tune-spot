import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SongCard } from "./SongCard";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogOut, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Recommendation {
  id: string;
  track_name: string;
  artist_name: string;
  album_name?: string;
  album_image_url?: string;
  spotify_url: string;
  preview_url?: string;
}

export const Recommendations = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchRecommendations = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      
      // Check if we have today's recommendations
      const { data: existing } = await supabase
        .from('daily_recommendations')
        .select('*')
        .eq('recommendation_date', today)
        .order('created_at', { ascending: true });

      if (existing && existing.length > 0 && !refresh) {
        setRecommendations(existing);
        setLoading(false);
        return;
      }

      // Fetch new recommendations
      const { data, error } = await supabase.functions.invoke('spotify-recommendations');

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast({
          title: "Recommendations updated!",
          description: `Discovered ${data.recommendations.length} new tracks for you.`,
        });
      }
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch recommendations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your daily tunes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DailyTune
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => fetchRecommendations(true)}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Your Daily Mix</h2>
          <p className="text-muted-foreground text-lg">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No recommendations yet</p>
            <Button onClick={() => fetchRecommendations(true)}>
              Generate Recommendations
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {recommendations.map((song) => (
              <SongCard
                key={song.id}
                trackName={song.track_name}
                artistName={song.artist_name}
                albumName={song.album_name}
                albumImageUrl={song.album_image_url}
                spotifyUrl={song.spotify_url}
                previewUrl={song.preview_url}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};