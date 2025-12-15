import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownCard } from "@/components/dashboard/countdown-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RecordsTable } from "@/components/dashboard/records-table";
import { getSettings } from "@/app/actions/settings";
import { getRecords, getCurrentMonthRecord } from "@/app/actions/records";
import { getCurrentYearMonth } from "@/lib/date-utils";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  // 获取设置
  const settingsResult = await getSettings();
  const settings = settingsResult.data;

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>配置缺失</CardTitle>
            <CardDescription>请先完成租金设置</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full">前往设置</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取当月记录
  const currentYearMonth = getCurrentYearMonth();
  const currentMonthResult = await getCurrentMonthRecord(currentYearMonth);
  const currentMonthRecord = currentMonthResult.data;

  // 获取所有记录（最多显示 10 条）
  const recordsResult = await getRecords();
  const allRecords = recordsResult.data || [];
  const recentRecords = allRecords.slice(0, 10);

  // 计算当月水电费
  const utilitiesCost = currentMonthRecord
    ? currentMonthRecord.electricityCost +
      currentMonthRecord.coldWaterCost +
      currentMonthRecord.hotWaterCost
    : 0;

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来，查看您的租金和水电费记录
          </p>
        </div>
        <Link href="/records/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建记录
          </Button>
        </Link>
      </div>

      {/* 倒计时卡片 */}
      <CountdownCard paymentDay={settings.paymentDay} />

      {/* 汇总卡片 */}
      <SummaryCards
        monthlyRent={settings.monthlyRent}
        utilitiesCost={utilitiesCost}
        totalAmount={currentMonthRecord?.totalAmount}
      />

      {/* 当月记录提示 */}
      {!currentMonthRecord && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">本月尚未记录</CardTitle>
            <CardDescription className="text-yellow-700">
              您还没有记录本月的水电使用量，点击下方按钮立即记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/records/new">
              <Button variant="default">
                <Plus className="h-4 w-4 mr-2" />
                立即记录
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>最近记录</CardTitle>
              <CardDescription>最近 10 条租金记录</CardDescription>
            </div>
            {allRecords.length > 10 && (
              <Link href="/records">
                <Button variant="outline" size="sm">
                  查看全部
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <RecordsTable records={recentRecords} />
        </CardContent>
      </Card>
    </div>
  );
}
