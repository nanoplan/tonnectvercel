import { useEffect, useState } from "react";
import { Wallet, Users, TrendingUp, Gift, Copy } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramUser } from "@/lib/telegram";
import { toast } from "sonner";
import tonnectLogo from "@/assets/tonnect-logo.png";

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [earnedRewards, setEarnedRewards] = useState(0);
  const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
  const telegramUser = getTelegramUser();

  const referralLink = `https://t.me/Tonnect_carnival_bot?start=${telegramUser?.id || ''}`;

  useEffect(() => {
    loadProfile();
    loadReferralCount();
  }, []);

  const loadProfile = async () => {
    if (!telegramUser) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", telegramUser.id)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const loadReferralCount = async () => {
    if (!telegramUser) return;

    const { data: referrals, count } = await supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .eq("referred_by", telegramUser.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setReferralCount(count || 0);
    setRecentReferrals(referrals || []);
    setEarnedRewards((count || 0) * 100);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };


  if (!telegramUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="text-muted-foreground">
            Please open this app through Telegram to access your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 p-6 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account</p>
        </div>

        {/* Profile Card */}
        <div className="glass-card p-6 text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center relative z-10">
              <img 
                src={tonnectLogo} 
                alt="Profile" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-1 text-foreground">
            {telegramUser.first_name || "User"}
          </h2>
          <p className="text-muted-foreground mb-2">{telegramUser.username ? `@${telegramUser.username}` : ""}</p>
        </div>

        {/* TON Wallet Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">TON Wallet</h3>
          </div>
          <Button 
            className="w-full"
            variant="outline"
            disabled
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect TON Wallet - Coming Soon
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-primary">{(profile?.balance || 0).toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">TONNECT</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-sm text-muted-foreground mb-1">Referrals</p>
            <p className="text-3xl font-bold text-foreground">{referralCount}</p>
            <p className="text-xs text-muted-foreground">Friends</p>
          </div>
        </div>

        {/* Referral Program Header */}
        <div className="text-center space-y-2 pt-4">
          <h2 className="text-2xl font-bold text-foreground">Referral Program</h2>
          <p className="text-muted-foreground">Invite friends and earn together</p>
        </div>

        {/* Referral Rewards Info */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Referral Rewards</h3>
          </div>
          
          <div className="space-y-3">
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">One-Time Bonus</p>
                  <p className="text-sm text-muted-foreground">Get 100 TONNECT when friend signs up</p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-bold">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">Passive Income</p>
                  <p className="text-sm text-muted-foreground">Earn 5% from all their mining forever</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-foreground mb-4">Your Referral Link</h3>
          
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-muted/50 rounded-xl px-4 py-3 text-sm text-muted-foreground overflow-hidden">
              <span className="truncate block">{referralLink}</span>
            </div>
            <Button 
              onClick={copyReferralLink}
              size="icon"
              className="bg-primary hover:bg-primary/90 flex-shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your Code</p>
            <p className="text-2xl font-bold text-primary">TONNECT-{telegramUser?.id}</p>
          </div>
        </div>

        {/* Recent Referrals */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-foreground mb-4">Recent Referrals</h3>
          
          {recentReferrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-1">No referrals yet</p>
              <p className="text-sm text-muted-foreground">Share your referral link to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReferrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {referral.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{referral.username || 'User'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">+100</p>
                    <p className="text-xs text-muted-foreground">TONNECT</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
