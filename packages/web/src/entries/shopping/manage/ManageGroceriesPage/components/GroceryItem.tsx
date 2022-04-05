import React from 'react';
import { Button } from 'srcRootDir/common/components';

interface GroceryItemProps {
  item: Grocery;
  onAdd?: () => void;
  onDelete?: () => void;
}

export function GroceryItem({ item, onAdd, onDelete }: GroceryItemProps) {
  return (
    <div className="flex flex-row justify-between bg-teal-500 rounded px-2 py-2 drop-shadow relative mb-4">
      <span className="text-white text-lg font-black">{item.name}</span>
      {onAdd && <Button onClick={onAdd}>Add</Button>}
      {onDelete && <Button onClick={onDelete}>Delete</Button>}
    </div>
  );
}
