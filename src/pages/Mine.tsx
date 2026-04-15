import { useEffect, useState } from "react";
import { Zap, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramUser } from "@/lib/telegram";
import { toast } from "sonner";
import tonnectLogo from "@/assets/tonnect-logo.png";

const Mine = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState("");
  const telegramUser = getTelegramUser();

  useEffect(() => {
    loadProfile();
    const interval = setInterval(updateProgress, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadProfile = async () => {
    if (!telegramUser) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", telegramUser.id)
      .single();

    if (data) {
      setProfile(data);
      updateProgress(data);
    }
    setLoading(false);
  };

  const updateProgress = (profileData?: any) => {
    const currentProfile = profileData || profile;
    if (!currentProfile) return;

    const lastClaim = currentProfile.last_claim_at
      ? new Date(currentProfile.last_claim_at)
      : null;
    const now = new Date();

    if (!lastClaim) {
      setProgress(100);
      setCanClaim(true);
      setTimeUntilClaim("");
      return;
    }

    const fourHours = 4 * 60 * 60 * 1000;
    const timeSinceClaim = now.getTime() - lastClaim.getTime();
    const progressPercent = Math.min((timeSinceClaim / fourHours) * 100, 100);

    setProgress(progressPercent);
    setCanClaim(progressPercent >= 100);

    if (progressPercent < 100) {
      const timeLeft = fourHours - timeSinceClaim;
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      setTimeUntilClaim(`${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeUntilClaim("");
    }
  };

  const handleClaim = async () => {
    if (!canClaim || !telegramUser) return;

    setClaiming(true);
    try {
      const reward = 40;

      const { data: currentData } = await supabase
        .from("profiles")
        .select("balance, total_claimed")
        .eq("id", telegramUser.id)
        .single();

      if (!currentData) throw new Error("Profile not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          balance: Number(currentData.balance) + reward,
          total_claimed: Number(currentData.total_claimed) + reward,
          last_claim_at: new Date().toISOString(),
        })
        .eq("id", telegramUser.id);

      if (error) throw error;

      toast.success(`Claimed ${reward} TONNECT!`);
      await loadProfile();
    } catch (error) {
      console.error("Claim error:", error);
      toast.error("Failed to claim. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">
            Please open this app through Telegram to access mining.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-6 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Mining</h1>
          <p className="text-primary">Farm TONNECT every hour</p>
        </div>

        {/* Mining Card */}
        <div className="glass-card p-6 border-2 border-primary/20">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 p-1">
                <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center">
                  <img 
                    src={tonnectLogo} 
                    alt="TONNECT" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="w-full space-y-2">
              <p className="text-center text-sm text-muted-foreground">Mining Progress</p>
              <div className="text-center">
                <span className="text-4xl font-bold text-foreground">{progress.toFixed(2)}</span>
                <span className="text-muted-foreground"> / 40 TONNECT</span>
              </div>
              <Progress value={progress} className="h-2" />
              {canClaim ? (
                <p className="text-center text-sm text-primary flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Ready to claim!
                </p>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Next claim: {timeUntilClaim}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Balance</p>
            </div>
            <p className="text-3xl font-bold text-primary">
              {Number(profile?.balance || 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">TONNECT</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-foreground" />
              <p className="text-sm text-muted-foreground">Total Mined</p>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {Number(profile?.total_claimed || 0).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">TONNECT</p>
          </div>
        </div>

        {/* Claim Button */}
        <Button
          onClick={handleClaim}
          disabled={!canClaim || claiming}
          size="lg"
          className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 disabled:opacity-50"
        >
          {claiming ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Claiming...</span>
            </div>
          ) : canClaim ? (
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Claim Now</span>
            </div>
          ) : (
            <span>Not Ready</span>
          )}
        </Button>

        {/* Boost Farm (Coming Soon) */}
        <Button
          disabled
          size="lg"
          variant="outline"
          className="w-full h-14 text-lg font-bold"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          Boost Farm (Coming Soon)
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Mine;
