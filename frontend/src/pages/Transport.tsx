
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { WarehouseSimulation } from "@/components/warehouse/WarehouseSimulation";
import Papa from 'papaparse';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import type { WarehouseSimulation as WarehouseSimulationType } from '@/components/warehouse/WarehouseSimulation';

const Transport = () => {
  const navigate = useNavigate();
  const [csvItems, setCsvItems] = useState([]);
  const [csvError, setCsvError] = useState('');
  const warehouseSimRef = useRef<any>(null);

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

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length) {
          setCsvError('CSV parsing error. Please check your file.');
          setCsvItems([]);
        } else {
          setCsvError('');
          setCsvItems(results.data);
        }
      },
      error: () => setCsvError('CSV parsing error. Please check your file.'),
    });
  };

  const handleAddCsvItems = () => {
    if (warehouseSimRef.current && warehouseSimRef.current.addItemsFromCsv) {
      warehouseSimRef.current.addItemsFromCsv(csvItems);
      setCsvItems([]);
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
            <h1 className="text-4xl font-bold mb-2 text-foreground">Smart Warehouse Machine Router</h1>
            <p className="text-lg text-muted-foreground">Eco-friendly logistics optimization with real-time routing</p>
          </div>
        </div>
        <WarehouseSimulation
          ref={warehouseSimRef}
          csvItems={csvItems}
          setCsvItems={setCsvItems}
          csvError={csvError}
          setCsvError={setCsvError}
          handleCsvUpload={handleCsvUpload}
          handleAddCsvItems={handleAddCsvItems}
        />
      </div>
    </div>
  );
};

export default Transport;
