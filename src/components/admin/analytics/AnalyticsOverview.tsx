
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, CheckCircle, MessageSquare, BarChart, PieChart } from "lucide-react";
import { OverviewMetrics } from "@/services/analyticsService";

interface AnalyticsOverviewProps {
  metrics: OverviewMetrics;
  isLoading: boolean;
}

export function AnalyticsOverview({ metrics, isLoading }: AnalyticsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: metrics.totalUsers,
      description: "Total registered users",
      icon: <Users className="h-6 w-6 text-blue-500" />
    },
    {
      title: "New Users",
      value: metrics.newUsers,
      description: "New signups in selected period",
      icon: <Users className="h-6 w-6 text-green-500" />
    },
    {
      title: "Daily Active Users",
      value: metrics.dailyActiveUsers,
      description: "Users active today",
      icon: <Activity className="h-6 w-6 text-yellow-500" />
    },
    {
      title: "Conversion Rate",
      value: `${metrics.conversionRate}%`,
      description: "Email confirmation rate",
      icon: <CheckCircle className="h-6 w-6 text-purple-500" />
    },
    {
      title: "Total Issues",
      value: metrics.issuesCount,
      description: "Issues created by users",
      icon: <BarChart className="h-6 w-6 text-red-500" />
    },
    {
      title: "Total Positions",
      value: metrics.positionsCount,
      description: "Positions taken by users",
      icon: <MessageSquare className="h-6 w-6 text-indigo-500" />
    }
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
              {card.icon}
            </div>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
