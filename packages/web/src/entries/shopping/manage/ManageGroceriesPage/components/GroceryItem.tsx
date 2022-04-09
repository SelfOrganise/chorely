import React from 'react';
import { Button } from 'srcRootDir/common/components';
import { toProductImageUrl } from 'srcRootDir/entries/shopping/services';

interface GroceryItemProps {
  item: Grocery | RecipeGrocery;
  onClick?: () => void;
  onDelete?: () => void;
  count?: number;
  deleteLabel?: string;
  clickLabel?: string;
}

// todo: improve this??
function isFromRecipe(item: any): item is RecipeGrocery {
  return !!item.description;
}

export function GroceryItem({ item, onClick, onDelete, count, deleteLabel, clickLabel }: GroceryItemProps) {
  return (
    <div className="flex flex-col items-center rounded px-2 py-2 relative mb-4">
      <img className="h-20" alt={item.name} src={toProductImageUrl(item.name)} />
      <span className="text-black text-lg font-black">{item.name}</span>
      {count && count > 1 && (
        <span className="absolute top-2 right-4 px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
          x{count}
        </span>
      )}
      {isFromRecipe(item) && <span className="text-black text-lg font-italic">{item?.description}</span>}
      {onClick && (
        <Button className="w-full" onClick={onClick}>
          {clickLabel || 'Add'}
        </Button>
      )}
      {onDelete && (
        <Button className="w-full" onClick={onDelete}>
          {deleteLabel || 'Delete'}
        </Button>
      )}
    </div>
  );
}
