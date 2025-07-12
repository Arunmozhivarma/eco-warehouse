
import { WarehouseSimulation } from "@/components/warehouse/WarehouseSimulation";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-4xl font-bold mb-6 text-foreground">Welcome to Smart Warehouse</h1>
      <div className="flex gap-4">
        <Button onClick={() => navigate('/login')}>Sign In</Button>
        <Button variant="outline" onClick={() => navigate('/signup')}>Sign Up</Button>
      </div>
    </div>
  );
};

export default Index;
