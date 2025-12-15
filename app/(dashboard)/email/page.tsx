"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Check, X, AlertCircle, Send, RefreshCw, History } from "lucide-react";

import {
  getEmailHistory,
  sendPaymentReminder,
  getEmailServiceStatus
} from "@/app/actions/email";
import { EmailType, EmailStatus } from "@prisma/client";

export default function EmailPage() {
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 邮件历史
  const [emailHistory, setEmailHistory] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 服务状态
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [history, status] = await Promise.all([
          getEmailHistory(1, 10),
          getEmailServiceStatus(),
        ]);

        setEmailHistory(history);
        setServiceStatus(status);
      } catch (err) {
        setError("加载数据失败");
      } finally {
        setHistoryLoading(false);
      }
    };
    loadData();
  }, []);

  // 刷新邮件历史
  const refreshHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await getEmailHistory(currentPage, 10);
      setEmailHistory(history);
      setError("");
    } catch (err) {
      setError("刷新失败");
    } finally {
      setHistoryLoading(false);
    }
  };

  // 发送付款提醒
  const handleSendPaymentReminder = async () => {
    setSendLoading(true);
    setError("");
    setSuccess("");

    try {
      const result = await sendPaymentReminder();
      if (result.success) {
        setSuccess(result.message);
        refreshHistory(); // 刷新历史记录
      } else {
        setError(result.message || "发送失败");
      }
    } catch (err) {
      setError("发送失败，请检查邮件配置");
    } finally {
      setSendLoading(false);
    }
  };

  // 翻页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadHistoryPage(page);
  };

  const loadHistoryPage = async (page: number) => {
    setHistoryLoading(true);
    try {
      const history = await getEmailHistory(page, 10);
      setEmailHistory(history);
    } catch (err) {
      setError("加载失败");
    } finally {
      setHistoryLoading(false);
    }
  };

  // 邮件类型标签
  const getEmailTypeBadge = (type: EmailType) => {
    const config = {
      [EmailType.PAYMENT_REMINDER]: { label: "付款提醒", variant: "default" as const },
      [EmailType.OVERDUE_REMINDER]: { label: "逾期提醒", variant: "destructive" as const },
      [EmailType.MONTHLY_BILL]: { label: "月度账单", variant: "secondary" as const },
      [EmailType.SYSTEM_NOTIFICATION]: { label: "系统通知", variant: "outline" as const },
      [EmailType.TEST_EMAIL]: { label: "测试邮件", variant: "outline" as const },
    };

    const { label, variant } = config[type] || { label: "未知", variant: "outline" as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // 邮件状态标签
  const getEmailStatusBadge = (status: EmailStatus) => {
    const config = {
      [EmailStatus.SENT]: { label: "已发送", variant: "default" as const, icon: Check },
      [EmailStatus.FAILED]: { label: "发送失败", variant: "destructive" as const, icon: X },
      [EmailStatus.PENDING]: { label: "待发送", variant: "secondary" as const, icon: Loader2 },
      [EmailStatus.RETRYING]: { label: "重试中", variant: "outline" as const, icon: RefreshCw },
    };

    const { label, variant, icon: Icon } = config[status] || { label: "未知", variant: "outline" as const, icon: AlertCircle };
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Mail className="w-8 h-8" />
          邮件管理
        </h1>
        <p className="text-muted-foreground mt-1">
          查看邮件历史和发送提醒
        </p>
      </div>

      {/* 服务状态和快速操作 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 服务状态 */}
        <Card>
          <CardHeader>
            <CardTitle>服务状态</CardTitle>
            <CardDescription>邮件服务当前状态</CardDescription>
          </CardHeader>
          <CardContent>
            {serviceStatus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>邮件配置</span>
                  <Badge variant={serviceStatus.hasConfig ? "default" : "secondary"}>
                    {serviceStatus.hasConfig ? "已配置" : "未配置"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>用户邮箱</span>
                  <Badge variant={serviceStatus.hasUserEmail ? "default" : "secondary"}>
                    {serviceStatus.hasUserEmail ? "已设置" : "未设置"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>连接状态</span>
                  <Badge variant={serviceStatus.canConnect ? "default" : "destructive"}>
                    {serviceStatus.canConnect ? "正常" : "异常"}
                  </Badge>
                </div>
                {serviceStatus.userEmail && (
                  <div className="text-sm text-muted-foreground pt-2 border-t">
                    接收邮箱: {serviceStatus.userEmail}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                加载中...
              </div>
            )}
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>手动发送邮件提醒</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleSendPaymentReminder}
              disabled={sendLoading || !serviceStatus?.isConfigured}
              className="w-full"
            >
              {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              发送付款提醒
            </Button>

            <div className="text-sm text-muted-foreground">
              <p>💡 提示:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>付款提醒会在付款日前发送</li>
                <li>逾期提醒会在付款日后发送</li>
                <li>月度账单在每月1号发送</li>
              </ul>
            </div>

            {!serviceStatus?.isConfigured && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  请先在设置中配置邮件服务
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 邮件历史 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              邮件历史
            </CardTitle>
            <CardDescription>最近发送的邮件记录</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHistory}
            disabled={historyLoading}
          >
            {historyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">加载邮件历史...</p>
            </div>
          ) : emailHistory?.logs && emailHistory.logs.length > 0 ? (
            <div className="space-y-4">
              {/* 邮件列表 */}
              <div className="space-y-3">
                {emailHistory.logs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getEmailTypeBadge(log.type)}
                        {getEmailStatusBadge(log.status)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(log.sentAt)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">收件人: </span>
                        <span className="text-sm">{log.toEmail}</span>
                      </div>
                      <div>
                        <span className="font-medium">主题: </span>
                        <span className="text-sm">{log.subject}</span>
                      </div>
                      {log.errorMessage && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          错误: {log.errorMessage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 分页 */}
              {emailHistory.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    上一页
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    第 {currentPage} 页，共 {emailHistory.totalPages} 页
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === emailHistory.totalPages}
                  >
                    下一页
                  </Button>
                </div>
              )}

              <div className="text-sm text-muted-foreground pt-4 border-t">
                共 {emailHistory.total} 条记录
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto" />
              <p className="mt-2 text-muted-foreground">暂无邮件记录</p>
              <p className="text-sm text-muted-foreground mt-1">
                发送的第一封邮件将显示在这里
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 错误和成功提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}