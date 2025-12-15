import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordsTable } from "@/components/dashboard/records-table";
import { getRecords } from "@/app/actions/records";
import { Plus } from "lucide-react";

export default async function RecordsPage() {
  const result = await getRecords();
  const records = result.data || [];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">记录管理</h1>
          <p className="text-muted-foreground mt-1">
            查看和管理所有租金记录
          </p>
        </div>
        <Link href="/records/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新建记录
          </Button>
        </Link>
      </div>

      {/* 记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle>所有记录</CardTitle>
          <CardDescription>
            共 {records.length} 条记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordsTable records={records} />
        </CardContent>
      </Card>
    </div>
  );
}
