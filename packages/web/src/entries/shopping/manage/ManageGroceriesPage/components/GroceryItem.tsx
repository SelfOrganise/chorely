import React from 'react';
import { Button } from 'srcRootDir/common/components';
import { toProductImageUrl } from 'srcRootDir/entries/shopping/services';

interface GroceryItemProps {
  item: Grocery;
  onAdd?: () => void;
  onDelete?: () => void;
}

export function GroceryItem({ item, onAdd, onDelete }: GroceryItemProps) {
  return (
    <div className="flex flex-col items-center rounded px-2 py-2 relative mb-4 border-b-2">
      <img className="h-20" alt={item.name} src={toProductImageUrl(item.name)} />
      <span className="text-black text-lg font-black">{item.name}</span>
      {onAdd && (
        <Button className="w-full" onClick={onAdd}>
          Add
        </Button>
      )}
      {onDelete && <Button onClick={onDelete}>Delete</Button>}
    </div>
  );
}
