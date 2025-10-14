import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";

interface HeroProps {
  onConnect: () => void;
}

export const Hero = ({ onConnect }: HeroProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />
      <div 
        className="absolute top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ background: 'var(--gradient-primary)' }}
      />
      <div 
        className="absolute bottom-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ 
          background: 'var(--gradient-primary)',
          animationDelay: '1s'
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
          <Music className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Powered by Spotify</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-glow bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          DailyTune
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          Discover 20 fresh songs every day, tailored to your unique taste
        </p>

        <Button
          onClick={onConnect}
          size="lg"
          className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
        >
          <Music className="mr-2 h-5 w-5" />
          Connect Spotify
        </Button>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
          {[
            { title: "Personalized", desc: "Based on your listening history" },
            { title: "Daily Updates", desc: "Fresh recommendations every day" },
            { title: "Discover More", desc: "Expand your musical horizons" }
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};