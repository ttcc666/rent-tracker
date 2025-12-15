import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calculations";
import { DollarSign, Zap, Droplet } from "lucide-react";

interface SummaryCardsProps {
  monthlyRent: number;
  utilitiesCost?: number;
  totalAmount?: number;
}

export function SummaryCards({
  monthlyRent,
  utilitiesCost = 0,
  totalAmount,
}: SummaryCardsProps) {
  const displayTotal = totalAmount ?? monthlyRent + utilitiesCost;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">月租金</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(monthlyRent)}</div>
          <p className="text-xs text-muted-foreground mt-1">固定租金</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">水电费</CardTitle>
          <div className="flex gap-1">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(utilitiesCost)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {utilitiesCost > 0 ? "本月水电费" : "暂无记录"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">总计</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(displayTotal)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">租金 + 水电费</p>
        </CardContent>
      </Card>
    </div>
  );
}
