
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UsageStatisticsProps {
  chatTokens: number;
  documentTokens: number;
  dailyChatTokens: number;
  dailyDocumentTokens: number;
  dailyLimit: number;
}

export const UsageStatisticsCharts = ({
  chatTokens,
  documentTokens,
  dailyChatTokens,
  dailyDocumentTokens,
  dailyLimit,
}: UsageStatisticsProps) => {
  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const total = chatTokens + documentTokens;
  const calculatePercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getDailyUsagePercentage = () => {
    const dailyTotal = dailyChatTokens + dailyDocumentTokens;
    return dailyLimit > 0 ? Math.round((dailyTotal / dailyLimit) * 100) : 0;
  };

  return (
    <div className="grid gap-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-foreground">Token Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-muted/40 dark:hover:bg-muted/20">
                <TableHead className="text-muted-foreground">Usage Type</TableHead>
                <TableHead className="text-right text-muted-foreground">Total Tokens</TableHead>
                <TableHead className="text-right text-muted-foreground">Today's Usage</TableHead>
                <TableHead className="text-right text-muted-foreground">Percentage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="hover:bg-muted/40 dark:hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">Chat Usage</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(chatTokens)}</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(dailyChatTokens)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary/20">
                    {calculatePercentage(chatTokens)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/40 dark:hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">Document Processing</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(documentTokens)}</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(dailyDocumentTokens)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary/20">
                    {calculatePercentage(documentTokens)}%
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-muted/40 dark:hover:bg-muted/20">
                <TableCell className="font-medium text-foreground">Daily Limit</TableCell>
                <TableCell className="text-right text-foreground">-</TableCell>
                <TableCell className="text-right text-foreground">{formatNumber(dailyLimit)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-primary/10 text-primary dark:bg-primary/20">
                    {getDailyUsagePercentage()}% used
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
