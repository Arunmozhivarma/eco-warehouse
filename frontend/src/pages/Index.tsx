
import { WarehouseSimulation } from "@/components/warehouse/WarehouseSimulation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Smart Warehouse Forklift Router</h1>
          <p className="text-lg text-muted-foreground">Eco-friendly logistics optimization with real-time routing</p>
        </div>
        <WarehouseSimulation />
      </div>
    </div>
  );
};

export default Index;
