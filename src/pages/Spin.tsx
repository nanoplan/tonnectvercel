import { useState, useEffect } from "react";
import { Gift, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getTelegramUser } from "@/lib/telegram";
import { supabase } from "@/integrations/supabase/client";
import tonnectLogo from "@/assets/tonnect-logo.jpeg";

const Spin = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [balance, setBalance] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const [canSpin, setCanSpin] = useState(true);
  const [nextSpinTime, setNextSpinTime] = useState<Date | null>(null);
  const telegramUser = getTelegramUser();

  const rewards = [10, 15, 25, 30, 50, 60, 75, 100];

  useEffect(() => {
    loadProfile();
    checkSpinEligibility();
  }, []);

  const loadProfile = async () => {
    if (!telegramUser) return;

    const { data } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", telegramUser.id)
      .single();

    if (data) {
      setBalance(data.balance);
    }
  };

  const checkSpinEligibility = async () => {
    if (!telegramUser) return;

    const lastSpin = localStorage.getItem(`lastSpin_${telegramUser.id}`);
    if (lastSpin) {
      const lastSpinDate = new Date(lastSpin);
      const hoursSinceLastSpin = (Date.now() - lastSpinDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastSpin < 24) {
        setCanSpin(false);
        const nextSpin = new Date(lastSpinDate.getTime() + 24 * 60 * 60 * 1000);
        setNextSpinTime(nextSpin);
      }
    }
  };

  const handleSpin = async () => {
    if (!canSpin || !telegramUser) return;

    setIsSpinning(true);
    setLastReward(null);

    setTimeout(async () => {
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      setLastReward(reward);
      
      const { data: currentData } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", telegramUser.id)
        .single();

      if (currentData) {
        await supabase
          .from("profiles")
          .update({
            balance: Number(currentData.balance) + reward,
          })
          .eq("id", telegramUser.id);

        setBalance(Number(currentData.balance) + reward);
        setTotalWon(totalWon + reward);
        localStorage.setItem(`lastSpin_${telegramUser.id}`, new Date().toISOString());
        setCanSpin(false);
        
        const nextSpin = new Date(Date.now() + 24 * 60 * 60 * 1000);
        setNextSpinTime(nextSpin);
      }

      setIsSpinning(false);
      toast.success(`You won ${reward} TONNECT!`);
    }, 2000);
  };

  const getTimeUntilNextSpin = () => {
    if (!nextSpinTime) return "";
    const now = new Date();
    const diff = nextSpinTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Please open this app via Telegram</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-6 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Lucky Spin</h1>
          <p className="text-muted-foreground">Draw to win TONNECT tokens!</p>
        </div>

        <div className="glass-card p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Balance</p>
              <p className="text-2xl font-bold text-primary">{balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Draw</p>
              <p className="text-2xl font-bold text-primary">{canSpin ? "Now!" : getTimeUntilNextSpin()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Won</p>
              <p className="text-2xl font-bold text-secondary">{totalWon.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="grid grid-cols-3 gap-4">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={`glass-card p-4 text-center transition-all ${
                  isSpinning ? "animate-pulse" : ""
                } ${lastReward === reward && !isSpinning ? "ring-2 ring-primary shadow-lg" : ""}`}
              >
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md relative">
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-md"></div>
                  <img 
                    src={tonnectLogo} 
                    alt="TONNECT" 
                    className="w-12 h-12 rounded-full relative z-10"
                  />
                </div>
                <p className="text-sm font-bold text-foreground">TONNECT {reward}</p>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSpin}
          disabled={isSpinning || !canSpin}
          size="lg"
          className="w-full h-16 text-lg font-bold gradient-animate text-white"
        >
          {isSpinning ? (
            <>
              <div className="animate-spin mr-2">⚡</div>
              Drawing...
            </>
          ) : canSpin ? (
            <>
              <Gift className="w-6 h-6 mr-2" />
              Draw Now!
            </>
          ) : (
            <>Next draw in {getTimeUntilNextSpin()}</>
          )}
        </Button>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">How It Works</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Draw once every 24 hours to win TONNECT tokens! Prizes range from 10 to 100 TONNECT.
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Spin;
