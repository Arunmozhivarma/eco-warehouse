
import { useState, useEffect, useCallback } from "react";
import { WarehouseGrid } from "./WarehouseGrid";
import { DeliveryQueue } from "./DeliveryQueue";
import { EnergyChart } from "./EnergyChart";
import { ProgressTracker } from "./ProgressTracker";
import { ItemForm } from "./ItemForm";
import { useForkliftOptimizer } from "@/hooks/useForkliftOptimizer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export interface Item {
  id: string;
  weight: number;
  dropZone: { x: number; y: number };
  aisle: string;
  delivered: boolean;
  energyScore?: number;
}

export interface ForkliftPosition {
  x: number;
  y: number;
}

const WAREHOUSE_WIDTH = 20;
const WAREHOUSE_HEIGHT = 15;

// Initialize warehouse layout with docks, racks, and paths
const initializeWarehouse = () => {
  const layout = Array(WAREHOUSE_HEIGHT).fill(null).map(() => 
    Array(WAREHOUSE_WIDTH).fill('path')
  );
  
  // Add racks (R) and docks (D)
  for (let y = 2; y < WAREHOUSE_HEIGHT - 2; y += 4) {
    for (let x = 2; x < WAREHOUSE_WIDTH - 2; x += 4) {
      layout[y][x] = 'rack';
      layout[y][x + 1] = 'rack';
      layout[y + 1][x] = 'rack';
      layout[y + 1][x + 1] = 'rack';
    }
  }
  
  // Add docks on the left side
  for (let y = 1; y < WAREHOUSE_HEIGHT; y += 2) {
    layout[y][0] = 'dock';
  }
  
  return layout;
};

export const WarehouseSimulation = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [forkliftPosition, setForkliftPosition] = useState<ForkliftPosition>({ x: 1, y: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState<Array<{ item: Item; energy: number }>>([]);
  const [warehouseLayout] = useState(() => initializeWarehouse());

  const {
    optimizedQueue,
    currentPath,
    recalculateRoute
  } = useForkliftOptimizer(items, forkliftPosition);

  const addItem = useCallback((newItem: Omit<Item, 'id' | 'delivered'>) => {
    const item: Item = {
      ...newItem,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      delivered: false
    };
    setItems(prev => [...prev, item]);
  }, []);

  const deliverNextItem = useCallback(() => {
    if (optimizedQueue.length === 0) return;
    
    const nextItem = optimizedQueue[0];
    const energy = nextItem.energyScore || 0;
    
    // Move forklift to delivery location
    setForkliftPosition(nextItem.dropZone);
    
    // Mark item as delivered
    setItems(prev => prev.map(item => 
      item.id === nextItem.id ? { ...item, delivered: true } : item
    ));
    
    // Add to delivery history
    setDeliveryHistory(prev => [...prev, { item: nextItem, energy }]);
    
    console.log(`Delivered item ${nextItem.id} with energy score: ${energy}`);
  }, [optimizedQueue]);

  const resetSimulation = () => {
    setItems([]);
    setForkliftPosition({ x: 1, y: 1 });
    setDeliveryHistory([]);
    setIsRunning(false);
  };

  // Auto-delivery simulation
  useEffect(() => {
    if (!isRunning || optimizedQueue.length === 0) return;
    
    const interval = setInterval(() => {
      deliverNextItem();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isRunning, deliverNextItem, optimizedQueue.length]);

  // Recalculate route when items change
  useEffect(() => {
    recalculateRoute();
  }, [items, recalculateRoute]);

  const undeliveredItems = items.filter(item => !item.delivered);
  const deliveredItems = items.filter(item => item.delivered);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Simulation Controls</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
                disabled={optimizedQueue.length === 0}
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Pause" : "Start"} Simulation
              </Button>
              <Button onClick={resetSimulation} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Warehouse Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Layout</CardTitle>
            </CardHeader>
            <CardContent>
              <WarehouseGrid
                layout={warehouseLayout}
                forkliftPosition={forkliftPosition}
                items={undeliveredItems}
                currentPath={currentPath}
                width={WAREHOUSE_WIDTH}
                height={WAREHOUSE_HEIGHT}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dashboard */}
        <div className="space-y-6">
          {/* Add Item Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemForm onAddItem={addItem} warehouseWidth={WAREHOUSE_WIDTH} warehouseHeight={WAREHOUSE_HEIGHT} />
            </CardContent>
          </Card>

          {/* Progress Tracker */}
          <ProgressTracker
            totalItems={items.length}
            deliveredItems={deliveredItems.length}
          />

          {/* Delivery Queue */}
          <DeliveryQueue items={optimizedQueue} />
        </div>
      </div>

      {/* Energy Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Energy Usage Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <EnergyChart deliveryHistory={deliveryHistory} />
        </CardContent>
      </Card>
    </div>
  );
};
