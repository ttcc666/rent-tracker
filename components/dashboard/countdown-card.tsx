import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDaysUntilPayment } from "@/lib/date-utils";
import { Calendar } from "lucide-react";

interface CountdownCardProps {
  paymentDay: number;
}

export function CountdownCard({ paymentDay }: CountdownCardProps) {
  const daysRemaining = calculateDaysUntilPayment(paymentDay);

  // 根据剩余天数设置颜色
  const getColorClass = () => {
    if (daysRemaining <= 3) return "text-red-600 bg-red-50";
    if (daysRemaining <= 7) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">付款倒计时</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getColorClass()} p-4 rounded-lg text-center`}>
          {daysRemaining === 0 ? (
            <span>今天到期</span>
          ) : (
            <span>还有 {daysRemaining} 天</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          每月 {paymentDay} 号付款
        </p>
      </CardContent>
    </Card>
  );
}
