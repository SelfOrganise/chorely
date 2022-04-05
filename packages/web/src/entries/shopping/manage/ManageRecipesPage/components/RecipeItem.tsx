import { Button } from 'srcRootDir/common/components';
import React from 'react';

interface RecipeItemProps {
  recipe: Recipe;
  onClick?: () => void;
  onDelete?: () => void;
}

export function RecipeItem({ recipe, onClick, onDelete }: RecipeItemProps): JSX.Element {
  return (
    <div className="flex justify-between w-full bg-blue-200 rounded mb-2 p-4" key={recipe.id}>
      <span>{recipe.name}</span>
      {onClick && <Button onClick={onClick}>Open</Button>}
      {onDelete && <Button onClick={onDelete}>Delete</Button>}
    </div>
  );
}
