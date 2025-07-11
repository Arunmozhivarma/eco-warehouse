
import { Item, ForkliftPosition } from "./WarehouseSimulation";
import { cn } from "@/lib/utils";

interface PathNode {
  x: number;
  y: number;
  distance: number;
}

interface WarehouseGridProps {
  layout: string[][];
  forkliftPosition: ForkliftPosition;
  items: Item[];
  currentPath: PathNode[];
  width: number;
  height: number;
}

export const WarehouseGrid = ({
  layout,
  forkliftPosition,
  items,
  currentPath,
  width,
  height
}: WarehouseGridProps) => {
  const getCellClass = (x: number, y: number) => {
    const cellType = layout[y][x];
    let baseClass = "w-6 h-6 border border-border flex items-center justify-center text-xs font-bold ";
    
    switch (cellType) {
      case 'dock':
        baseClass += "bg-blue-200 text-blue-800";
        break;
      case 'rack':
        baseClass += "bg-gray-300 text-gray-700";
        break;
      case 'path':
      default:
        baseClass += "bg-background";
        break;
    }
    
    return baseClass;
  };

  const isForkliftPosition = (x: number, y: number) => {
    return forkliftPosition.x === x && forkliftPosition.y === y;
  };

  const isItemLocation = (x: number, y: number) => {
    return items.some(item => item.dropZone.x === x && item.dropZone.y === y);
  };

  const isOnPath = (x: number, y: number) => {
    return currentPath.some(node => node.x === x && node.y === y);
  };

  const getItemAtLocation = (x: number, y: number) => {
    return items.find(item => item.dropZone.x === x && item.dropZone.y === y);
  };

  return (
    <div className="grid gap-0 border-2 border-border p-4 bg-muted/20 rounded-lg overflow-auto">
      <div 
        className="grid gap-0"
        style={{ 
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => {
            const isForklift = isForkliftPosition(x, y);
            const hasItem = isItemLocation(x, y);
            const onPath = isOnPath(x, y);
            const item = getItemAtLocation(x, y);
            
            return (
              <div
                key={`${x}-${y}`}
                className={cn(
                  getCellClass(x, y),
                  onPath && !isForklift && "bg-yellow-200",
                  isForklift && "bg-green-500 text-white animate-pulse",
                  hasItem && !isForklift && "bg-red-200"
                )}
                title={
                  isForklift 
                    ? "Forklift" 
                    : hasItem 
                      ? `Item: ${item?.aisle} (${item?.weight}kg)` 
                      : layout[y][x]
                }
              >
                {isForklift ? "🚜" : hasItem ? "📦" : layout[y][x] === 'dock' ? "D" : layout[y][x] === 'rack' ? "R" : ""}
              </div>
            );
          })
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 border border-border"></div>
          <span>Forklift 🚜</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 border border-border"></div>
          <span>Items 📦</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 border border-border"></div>
          <span>Planned Route</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-200 border border-border"></div>
          <span>Docks (D)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 border border-border"></div>
          <span>Racks (R)</span>
        </div>
      </div>
    </div>
  );
};
