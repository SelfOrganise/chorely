import React from 'react';
import { Button } from 'srcRootDir/common/components';
import { toProductImageUrl } from 'srcRootDir/entries/shopping/services';

interface GroceryItemProps {
  item: Grocery | RecipeGrocery;
  onAdd?: () => void;
  onDelete?: () => void;
}

// todo: improve this??
function isFromRecipe(item: any): item is RecipeGrocery {
  return !!item.description;
}

export function GroceryItem({ item, onAdd, onDelete }: GroceryItemProps) {
  return (
    <div className="flex flex-col items-center rounded px-2 py-2 relative mb-4">
      <img className="h-20" alt={item.name} src={toProductImageUrl(item.name)} />
      <span className="text-black text-lg font-black">{item.name}</span>
      {isFromRecipe(item) && <span className="text-black text-lg font-italic">{item?.description}</span>}
      {onAdd && (
        <Button className="w-full" onClick={onAdd}>
          Add
        </Button>
      )}
      {onDelete && (
        <Button className="w-full" onClick={onDelete}>
          Delete
        </Button>
      )}
    </div>
  );
}
