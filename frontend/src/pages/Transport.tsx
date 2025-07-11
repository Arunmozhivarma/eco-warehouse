
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WarehouseSimulation } from "@/components/warehouse/WarehouseSimulation";

const Transport = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    
    if (!userType) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleBackToDashboard = () => {
    const userType = localStorage.getItem("userType");
    if (userType === "manager") {
      navigate("/manager-dashboard");
    } else {
      navigate("/worker-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <Button 
            onClick={handleBackToDashboard} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-foreground">Smart Warehouse Forklift Router</h1>
            <p className="text-lg text-muted-foreground">Eco-friendly logistics optimization with real-time routing</p>
          </div>
        </div>
        <WarehouseSimulation />
      </div>
    </div>
  );
};

export default Transport;
