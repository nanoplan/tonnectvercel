import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MiningButtonProps {
  userId: number;
  lastClaimAt: string | null;
  onClaim: () => void;
}

const MiningButton = ({ userId, lastClaimAt, onClaim }: MiningButtonProps) => {
  const [isMining, setIsMining] = useState(false);

  const canClaim = () => {
    if (!lastClaimAt) return true;
    const lastClaim = new Date(lastClaimAt);
    const now = new Date();
    const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 4;
  };

  const getTimeUntilNextClaim = () => {
    if (!lastClaimAt) return "";
    const lastClaim = new Date(lastClaimAt);
    const nextClaim = new Date(lastClaim.getTime() + 4 * 60 * 60 * 1000);
    const now = new Date();
    const diff = nextClaim.getTime() - now.getTime();
    
    if (diff <= 0) return "";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleMine = async () => {
    if (!canClaim()) {
      toast.error(`Wait ${getTimeUntilNextClaim()} before mining again`);
      return;
    }

    setIsMining(true);
    try {
      const reward = 40; // Fixed 40 TONNECT per claim

      // First get current balance
      const { data: currentData } = await supabase
        .from("profiles")
        .select("balance, total_claimed")
        .eq("id", userId)
        .single();

      if (!currentData) throw new Error("Profile not found");

      // Then update with calculated values
      const { error } = await supabase
        .from("profiles")
        .update({
          balance: Number(currentData.balance) + reward,
          total_claimed: Number(currentData.total_claimed) + reward,
          last_claim_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Mined ${reward.toFixed(2)} TONNECT!`);
      onClaim();
    } catch (error) {
      console.error("Mining error:", error);
      toast.error("Failed to mine. Please try again.");
    } finally {
      setIsMining(false);
    }
  };

  return (
    <Button
      onClick={handleMine}
      disabled={!canClaim() || isMining}
      size="lg"
      className="w-full h-24 text-lg font-bold glass-card hover:shadow-md transition-shadow bg-white border-2 border-primary/20"
    >
      {isMining ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 animate-spin text-primary">⚡</div>
          <span className="text-foreground">Mining...</span>
        </div>
      ) : canClaim() ? (
        <div className="flex flex-col items-center gap-2">
          <span className="text-5xl">⛏️</span>
          <span className="text-foreground">Start Mining</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">⏰</span>
          <span className="text-foreground text-sm">Next claim: {getTimeUntilNextClaim()}</span>
        </div>
      )}
    </Button>
  );
};

export default MiningButton;
