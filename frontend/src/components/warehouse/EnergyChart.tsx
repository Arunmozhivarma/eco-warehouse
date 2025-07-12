
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Item } from "./WarehouseSimulation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EnergyChartProps {
  deliveryHistory: Array<{ item: Item; energy: number }>;
}

export const EnergyChart = ({ deliveryHistory }: EnergyChartProps) => {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    supabase
      .from('deliveries')
      .select('energy_used')
      .then(({ data, error }) => {
        if (!error) {
          setDeliveries(data || []);
          console.log("Fetched energy data:", data);
        }
      });
  }, []);

  const totalDeliveries = deliveries.length;
  const totalEnergy = deliveries.reduce((sum, d) => sum + (d.energy_used || 0), 0);
  const avgEnergy = totalDeliveries > 0 ? totalEnergy / totalDeliveries : 0;

  const chartData = deliveryHistory.map((delivery, index) => ({
    delivery: `#${index + 1}`,
    energy: delivery.energy,
    aisle: delivery.item.aisle,
    weight: delivery.item.weight
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-primary">{totalDeliveries}</div>
          <div className="text-sm text-muted-foreground">Total Deliveries</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{totalEnergy.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Total Energy Used</div>
        </div>
        <div className="bg-muted/50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{avgEnergy.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Average Energy/Delivery</div>
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="delivery" />
              <YAxis />
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)} energy units`,
                  `Aisle ${props.payload.aisle} (${props.payload.weight}kg)`
                ]}
                labelFormatter={(label) => `Delivery ${label}`}
              />
              <Bar
                dataKey="energy"
                fill="hsl(var(--primary))"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-border rounded-lg">
          No delivery data yet. Start the simulation to see energy usage.
        </div>
      )}
    </div>
  );
};
