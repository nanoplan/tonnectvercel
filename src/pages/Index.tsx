import { useEffect, useState } from "react";
import { Coins, TrendingUp, Percent, CheckCircle2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import MiningButton from "@/components/MiningButton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramUser, getTelegramStartParam } from "@/lib/telegram";
import { toast } from "sonner";
import tonnectLogo from "@/assets/tonnect-logo.png";

const Index = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const telegramUser = getTelegramUser();

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    if (!telegramUser) {
      setLoading(false);
      return;
    }

    try {
      // Check if user exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", telegramUser.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!existingProfile) {
        // Create new user
        const referredBy = getTelegramStartParam();
        const newProfile = {
          id: telegramUser.id,
          username: telegramUser.username || `user${telegramUser.id}`,
          referred_by: referredBy ? parseInt(referredBy) : null,
          balance: 0,
          total_claimed: 0,
        };

        const { data, error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single();

        if (insertError) throw insertError;

        // Give referral bonus
        if (referredBy) {
          const { data: referrerData } = await supabase
            .from("profiles")
            .select("balance")
            .eq("id", parseInt(referredBy))
            .single();

          if (referrerData) {
            await supabase
              .from("profiles")
              .update({ balance: Number(referrerData.balance) + 100 })
              .eq("id", parseInt(referredBy));
          }
        }

        setProfile(data);
        toast.success("Welcome to TONNECT! 🎉");
      } else {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Error initializing user:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!telegramUser) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", telegramUser.id)
      .single();

    if (data) setProfile(data);
  };

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

  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <img
            src={tonnectLogo}
            alt="TONNECT"
            className="w-32 h-32 mx-auto mb-6 rounded-full neon-border"
          />
          <h1 className="text-3xl font-bold neon-text mb-4">TONNECT</h1>
          <p className="text-muted-foreground mb-6">
            Please open this app through Telegram to start mining!
          </p>
        </div>
      </div>
    );
  }

  const totalSupply = 1000000000;
  const claimedPercentage = ((profile?.total_claimed || 0) / totalSupply) * 100;

  return (
    <div className="min-h-screen pb-24 p-6 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with Logo */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
            <img 
              src={tonnectLogo} 
              alt="TONNECT" 
              className="w-20 h-20 rounded-full relative z-10"
            />
          </div>
          <h1 className="text-5xl font-bold text-foreground">TONNECT</h1>
          <p className="text-lg text-primary">Mining Carnival</p>
        </div>

        {/* Total Supply Card */}
        <div className="glass-card p-6 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Total Supply</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live</span>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Claimed</p>
          <div className="mb-3 text-right">
            <span className="text-2xl font-bold text-primary">{claimedPercentage.toFixed(2)}%</span>
          </div>
          <div className="mb-3">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${claimedPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Claimed</p>
              <p className="text-xl font-bold text-primary">{(profile?.total_claimed || 0).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-xl font-bold text-secondary">{(totalSupply - (profile?.total_claimed || 0)).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">Your Balance</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-6xl font-bold text-foreground mb-1">
              {(profile?.balance || 0).toFixed(2)}
            </p>
            <p className="text-muted-foreground">TONNECT</p>
          </div>
          <div className="h-px bg-border my-4"></div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">+{(profile?.balance || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">+{(profile?.balance || 0).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">This Week</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">-</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </div>
          </div>
        </div>

        {/* Mining Button */}
        <MiningButton
          userId={telegramUser.id}
          lastClaimAt={profile?.last_claim_at}
          onClaim={refreshProfile}
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => window.location.href = "/spin"}
            size="lg"
            className="h-32 flex flex-col gap-3 glass-card hover:shadow-md transition-shadow bg-white border-2 border-primary/20"
          >
            <span className="text-5xl">🎰</span>
            <span className="font-bold text-foreground">Spin Now</span>
          </Button>
          <Button
            onClick={() => window.location.href = "/tasks"}
            size="lg"
            className="h-32 flex flex-col gap-3 glass-card hover:shadow-md transition-shadow bg-white border-2 border-primary/20"
          >
            <span className="text-5xl">📋</span>
            <span className="font-bold text-foreground">Tasks</span>
          </Button>
        </div>

        {/* Store Button */}
        <div className="grid grid-cols-1 gap-4">
          <Button
            disabled
            size="lg"
            className="h-32 flex flex-col gap-3 glass-card bg-white border-2 border-primary/20 opacity-60"
          >
            <span className="text-5xl">🏪</span>
            <div>
              <div className="font-bold text-foreground">Store</div>
              <div className="text-xs text-muted-foreground">Coming Soon</div>
            </div>
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Index;

