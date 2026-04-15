import { useEffect, useState } from "react";
import { Trophy, Medal } from "lucide-react";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { getTelegramUser } from "@/lib/telegram";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<any[]>([]);
  const telegramUser = getTelegramUser();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("balance", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLeaders(data);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
  };

  return (
    <div className="min-h-screen pb-24 p-6 bg-background">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">Top miners worldwide</p>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-3">
          {leaders.map((leader, index) => {
            const isCurrentUser = telegramUser?.id === leader.id;
            return (
              <div
                key={leader.id}
                className={`glass-card p-4 flex items-center gap-4 ${
                  isCurrentUser ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="text-2xl font-bold w-12 text-center text-foreground">
                  {getRankIcon(index + 1)}
                </div>

                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    {leader.username || "Anonymous User"}
                    {isCurrentUser && (
                      <span className="text-primary ml-2">(You)</span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-primary">
                    {Number(leader.balance).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">TONNECT</p>
                </div>
              </div>
            );
          })}

          {leaders.length === 0 && (
            <div className="glass-card p-12 text-center text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No miners yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default Leaderboard;
