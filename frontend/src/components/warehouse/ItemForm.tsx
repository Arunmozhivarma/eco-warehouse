
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ItemFormProps {
  onAddItem: (item: {
    weight: number;
    dropZone: { x: number; y: number };
    aisle: string;
  }) => void;
  warehouseWidth: number;
  warehouseHeight: number;
}

export const ItemForm = ({ onAddItem, warehouseWidth, warehouseHeight }: ItemFormProps) => {
  const [weight, setWeight] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [aisle, setAisle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const weightNum = parseFloat(weight);
    const xNum = parseInt(x);
    const yNum = parseInt(y);
    
    // Validation
    if (!weightNum || weightNum <= 0) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    if (!aisle.trim()) {
      toast({
        title: "Invalid Aisle",
        description: "Please enter an aisle identifier",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(xNum) || isNaN(yNum) || xNum < 0 || yNum < 0 || xNum >= warehouseWidth || yNum >= warehouseHeight) {
      toast({
        title: "Invalid Coordinates",
        description: `Coordinates must be between (0,0) and (${warehouseWidth-1},${warehouseHeight-1})`,
        variant: "destructive"
      });
      return;
    }
    
    onAddItem({
      weight: weightNum,
      dropZone: { x: xNum, y: yNum },
      aisle: aisle.trim()
    });
    
    // Reset form
    setWeight("");
    setX("");
    setY("");
    setAisle("");
    
    toast({
      title: "Item Added",
      description: `New item added to aisle ${aisle} with weight ${weightNum}kg`,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="10.5"
            required
          />
        </div>
        <div>
          <Label htmlFor="aisle">Aisle</Label>
          <Input
            id="aisle"
            type="text"
            value={aisle}
            onChange={(e) => setAisle(e.target.value)}
            placeholder="A1"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="x">X Coordinate</Label>
          <Input
            id="x"
            type="number"
            min="0"
            max={warehouseWidth - 1}
            value={x}
            onChange={(e) => setX(e.target.value)}
            placeholder="5"
            required
          />
        </div>
        <div>
          <Label htmlFor="y">Y Coordinate</Label>
          <Input
            id="y"
            type="number"
            min="0"
            max={warehouseHeight - 1}
            value={y}
            onChange={(e) => setY(e.target.value)}
            placeholder="3"
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Item to Warehouse
      </Button>
    </form>
  );
};
