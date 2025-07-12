
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
import React, { useImperativeHandle, forwardRef } from "react";
import { supabase } from '@/lib/supabaseClient';

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

// Add props for CSV upload
interface WarehouseSimulationProps {
  csvItems?: any[];
  setCsvItems?: (items: any[]) => void;
  csvError?: string;
  setCsvError?: (err: string) => void;
  handleCsvUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddCsvItems?: () => void;
}

export const WarehouseSimulation = forwardRef((props: WarehouseSimulationProps, ref) => {
  const [items, setItems] = useState<Item[]>([]);
  const [forkliftPosition, setForkliftPosition] = useState<ForkliftPosition>({ x: 1, y: 1 });
  const [isRunning, setIsRunning] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState<Array<{ item: Item; energy: number }>>([]);
  const [warehouseLayout] = useState(() => initializeWarehouse());

  // Fetch items from DB
  const [dbItems, setDbItems] = useState([]);
  useEffect(() => {
    supabase.from('items').select('*').then(({ data }) => {
      setDbItems(data || []);
    });
  }, []);

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

  // Expose addItemsFromCsv to parent via ref
  useImperativeHandle(ref, () => ({
    addItemsFromCsv: (csvRows: any[]) => {
      const validRows = csvRows.filter(row => row.weight && row.x !== undefined && row.y !== undefined && row.aisle);
      setItems(prev => [
        ...prev,
        ...validRows.map(row => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          weight: parseFloat(row.weight),
          dropZone: { x: parseInt(row.x), y: parseInt(row.y) },
          aisle: row.aisle,
          delivered: false
        }))
      ]);
    }
  }));

  const deliverNextItem = useCallback(async () => {
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

    // Insert into Supabase deliveries table
    const { error } = await supabase.from('deliveries').insert([
      {
        energy_used: energy,
        // delivered_at and delivered are optional, but you can include them if you want:
        // delivered_at: new Date().toISOString(),
        // delivered: true,
        // item_id, delivered_by: only if you have those values
      }
    ]);
    if (error) {
      console.error('Supabase insert error:', error.message);
    }

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

  // State for checklist and quantities
  const [selectedItems, setSelectedItems] = useState<{ [id: string]: number }>({});
  const handleCheck = (id: string, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? { ...prev, [id]: 1 } : Object.fromEntries(Object.entries(prev).filter(([k]) => k !== id))
    );
  };
  const handleQtyChange = (id: string, qty: number) => {
    setSelectedItems(prev => ({ ...prev, [id]: qty }));
  };
  const handleBulkAddFromDb = () => {
    dbItems.forEach((item: any) => {
      const qty = selectedItems[item.id];
      if (qty && qty > 0) {
        for (let i = 0; i < qty; i++) {
          addItem({
            weight: item.weight,
            dropZone: { x: item.drop_zone_x, y: item.drop_zone_y },
            aisle: item.aisle
          });
        }
      }
    });
    setSelectedItems({});
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Optimized Path</span>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                variant={isRunning ? "destructive" : "default"}
                disabled={optimizedQueue.length === 0}
              >
                {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isRunning ? "Pause" : "Show"} Path
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
          {/* Bulk Add Items from DB UI */}
          <Card>
            <CardHeader>
              <CardTitle>Add Items from Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="font-semibold mb-2">Add Items from Database</div>
                <div className="space-y-2">
                  {dbItems.length === 0 && <div className="text-xs text-muted-foreground">No items in database yet.</div>}
                  {dbItems.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems[item.id] !== undefined}
                        onChange={e => handleCheck(item.id, e.target.checked)}
                      />
                      <span className="flex-1 text-xs font-semibold">{item.aisle}</span>
                      {selectedItems[item.id] !== undefined && (
                        <input
                          type="number"
                          min={1}
                          value={selectedItems[item.id]}
                          onChange={e => handleQtyChange(item.id, Number(e.target.value))}
                          className="w-14 border rounded px-2 py-1 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  className="mt-4 w-full"
                  onClick={handleBulkAddFromDb}
                  disabled={Object.keys(selectedItems).length === 0}
                >
                  Add Selected Items
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* CSV Upload UI */}
          {props.handleCsvUpload && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={props.handleCsvUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
                  />
                  {props.csvError && <div className="text-red-600 text-sm">{props.csvError}</div>}
                  {props.csvItems && props.csvItems.length > 0 && (
                    <div className="w-full mt-2">
                      <div className="mb-2 font-semibold">Preview:</div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border">
                          <thead>
                            <tr>
                              {Object.keys(props.csvItems[0]).map((key) => (
                                <th key={key} className="px-2 py-1 border-b bg-muted/50">{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {props.csvItems.map((row, i) => (
                              <tr key={i} className="even:bg-muted/20">
                                {Object.values(row).map((val, j) => (
                                  <td key={j} className="px-2 py-1 border-b">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button onClick={props.handleAddCsvItems} className="mt-4 w-full bg-green-600 hover:bg-green-700">Add Items to Warehouse</Button>
                    </div>
                  )}
                </div>
                {/* Add New Item Form */}
                <ItemForm onAddItem={addItem} warehouseWidth={WAREHOUSE_WIDTH} warehouseHeight={WAREHOUSE_HEIGHT} />
              </CardContent>
            </Card>
          )}

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
});
