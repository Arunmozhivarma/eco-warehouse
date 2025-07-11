
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";

interface ProgressTrackerProps {
  totalItems: number;
  deliveredItems: number;
}

export const ProgressTracker = ({ totalItems, deliveredItems }: ProgressTrackerProps) => {
  const progressPercentage = totalItems > 0 ? (deliveredItems / totalItems) * 100 : 0;
  const pendingItems = totalItems - deliveredItems;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Delivery Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{deliveredItems}/{totalItems}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-center text-sm text-muted-foreground">
            {progressPercentage.toFixed(1)}% Complete
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{deliveredItems}</div>
            <div className="text-xs text-green-600/80">Delivered</div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{pendingItems}</div>
            <div className="text-xs text-orange-600/80">Pending</div>
          </div>
        </div>
        
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {pendingItems > 0 
                ? `${pendingItems} items remaining` 
                : "All deliveries completed!"
              }
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
