import { Card } from "@/components/ui/card";
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SongCardProps {
  trackName: string;
  artistName: string;
  albumName?: string;
  albumImageUrl?: string;
  spotifyUrl: string;
  previewUrl?: string;
}

export const SongCard = ({
  trackName,
  artistName,
  albumName,
  albumImageUrl,
  spotifyUrl,
  previewUrl
}: SongCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => previewUrl ? new Audio(previewUrl) : null);

  const togglePlay = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]">
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
        {albumImageUrl ? (
          <img
            src={albumImageUrl}
            alt={albumName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="w-16 h-16 text-muted-foreground/50" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          {previewUrl && (
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full h-10 w-10 shadow-lg"
              onClick={togglePlay}
            >
              <Play className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full h-10 w-10 shadow-lg"
            asChild
          >
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-1 group-hover:text-primary transition-colors">
          {trackName}
        </h3>
        <p className="text-sm text-muted-foreground truncate">{artistName}</p>
        {albumName && (
          <p className="text-xs text-muted-foreground/70 truncate mt-1">{albumName}</p>
        )}
      </div>
    </Card>
  );
};