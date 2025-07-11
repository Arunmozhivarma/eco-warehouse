
import { Item } from "./WarehouseSimulation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Weight } from "lucide-react";

interface DeliveryQueueProps {
  items: Item[];
}

export const DeliveryQueue = ({ items }: DeliveryQueueProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Delivery Queue ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No items in queue</p>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  index === 0 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <span className="font-medium">Aisle {item.aisle}</span>
                    {index === 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Next
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono">
                    Score: {item.energyScore?.toFixed(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    <span>{item.weight}kg</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>({item.dropZone.x}, {item.dropZone.y})</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
