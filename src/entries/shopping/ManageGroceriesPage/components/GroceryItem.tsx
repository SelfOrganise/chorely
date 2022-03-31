import React from 'react';
import { Button } from 'srcRootDir/common/components';

interface GroceryItemProps {
  item: Grocery;
  onAdd: (item: Grocery) => void;
}

export function GroceryItem({ item, onAdd }: GroceryItemProps) {
  return (
    <div className="flex flex-row justify-between min-h-[6rem] bg-teal-500 rounded px-2 py-2 drop-shadow relative mb-4">
      <span className="text-white text-2xl font-black">{item.name}</span>
      <Button onClick={(e: React.MouseEvent<HTMLElement>) => onAdd(item)}>Add</Button>
    </div>
  );
}
