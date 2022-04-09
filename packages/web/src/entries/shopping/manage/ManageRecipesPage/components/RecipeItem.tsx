import { Button } from 'srcRootDir/common/components';
import React from 'react';

interface RecipeItemProps {
  recipe: Recipe;
  clickLabel?: string;
  onClick?: () => void;
  deleteLabel?: string;
  onDelete?: () => void;
}

export function RecipeItem({ recipe, onClick, onDelete, clickLabel, deleteLabel }: RecipeItemProps): JSX.Element {
  return (
    <div className="flex justify-between w-full bg-orchid-200 rounded mb-2 p-4" key={recipe.id}>
      <span>{recipe.name}</span>
      {onClick && <Button onClick={onClick}>{clickLabel || 'Open'}</Button>}
      {onDelete && <Button onClick={onDelete}>{deleteLabel || 'Delete'}</Button>}
    </div>
  );
}
