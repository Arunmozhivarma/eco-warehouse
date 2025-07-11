
import { useState, useCallback, useMemo } from "react";
import { Item, ForkliftPosition } from "@/components/warehouse/WarehouseSimulation";

interface PathNode {
  x: number;
  y: number;
  distance: number;
}

export const useForkliftOptimizer = (items: Item[], forkliftPosition: ForkliftPosition) => {
  const [currentPath, setCurrentPath] = useState<PathNode[]>([]);

  // Calculate Manhattan distance between two points
  const calculateDistance = useCallback((from: ForkliftPosition, to: ForkliftPosition): number => {
    return Math.abs(from.x - to.x) + Math.abs(from.y - to.y);
  }, []);

  // Calculate energy score for an item
  const calculateEnergyScore = useCallback((item: Item, currentPosition: ForkliftPosition): number => {
    const distance = calculateDistance(currentPosition, item.dropZone);
    return item.weight * distance;
  }, [calculateDistance]);

  // Group items by aisle and sort by priority
  const optimizedQueue = useMemo(() => {
    const undeliveredItems = items.filter(item => !item.delivered);
    
    // Calculate energy scores for all items
    const itemsWithScores = undeliveredItems.map(item => ({
      ...item,
      energyScore: calculateEnergyScore(item, forkliftPosition)
    }));

    // Group by aisle
    const groupedByAisle = itemsWithScores.reduce((groups, item) => {
      if (!groups[item.aisle]) {
        groups[item.aisle] = [];
      }
      groups[item.aisle].push(item);
      return groups;
    }, {} as Record<string, Item[]>);

    // Sort each aisle group by energy score (ascending for efficiency)
    Object.values(groupedByAisle).forEach(aisleItems => {
      aisleItems.sort((a, b) => (a.energyScore || 0) - (b.energyScore || 0));
    });

    // Flatten and return optimized queue
    const optimizedItems: Item[] = [];
    const aisleKeys = Object.keys(groupedByAisle).sort();
    
    for (const aisle of aisleKeys) {
      optimizedItems.push(...groupedByAisle[aisle]);
    }

    return optimizedItems;
  }, [items, forkliftPosition, calculateEnergyScore]);

  // Generate path to next delivery location
  const generatePath = useCallback((from: ForkliftPosition, to: ForkliftPosition): PathNode[] => {
    const path: PathNode[] = [];
    let current = { ...from };
    let distance = 0;

    // Simple A* style pathfinding (Manhattan distance heuristic)
    while (current.x !== to.x || current.y !== to.y) {
      if (current.x < to.x) {
        current.x++;
      } else if (current.x > to.x) {
        current.x--;
      } else if (current.y < to.y) {
        current.y++;
      } else if (current.y > to.y) {
        current.y--;
      }
      
      distance++;
      path.push({ ...current, distance });
    }

    return path;
  }, []);

  // Recalculate route based on current state
  const recalculateRoute = useCallback(() => {
    if (optimizedQueue.length > 0) {
      const nextItem = optimizedQueue[0];
      const path = generatePath(forkliftPosition, nextItem.dropZone);
      setCurrentPath(path);
      console.log(`Route calculated to ${nextItem.aisle} - Energy Score: ${nextItem.energyScore}`);
    } else {
      setCurrentPath([]);
    }
  }, [optimizedQueue, forkliftPosition, generatePath]);

  return {
    optimizedQueue,
    currentPath,
    recalculateRoute
  };
};
