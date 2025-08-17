import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
  icon: LucideIcon;
  color: "green" | "blue" | "yellow" | "purple" | "red";
}

const colorClasses = {
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    accent: "text-green-600",
  },
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    accent: "text-blue-600",
  },
  yellow: {
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    accent: "text-yellow-600",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    accent: "text-purple-600",
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    accent: "text-red-600",
  },
};

export default function KPICard({ title, value, change, subtitle, icon: Icon, color }: KPICardProps) {
  const colors = colorClasses[color];
  const isPositiveChange = change && change.startsWith("+");
  const isNegativeChange = change && change.startsWith("-");

  return (
    <Card className="luxury-shadow hover-lift transition-all" data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-navy-900" data-testid={`kpi-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
            <Icon className={`${colors.text} text-xl`} />
          </div>
        </div>
        
        {change && (
          <div className="flex items-center text-sm">
            {isPositiveChange && <TrendingUp className="text-green-600 mr-1" size={14} />}
            {isNegativeChange && <TrendingDown className="text-red-600 mr-1" size={14} />}
            <span className={isPositiveChange ? "text-green-600" : isNegativeChange ? "text-red-600" : "text-gray-600"}>
              {change}
            </span>
            <span className="text-gray-500 ml-2">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
