import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient?: boolean;
}

const StatsCard = ({ icon: Icon, label, value, gradient = false }: StatsCardProps) => {
  return (
    <div className={`glass-card p-4 ${gradient ? 'gradient-animate' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold neon-text">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;

