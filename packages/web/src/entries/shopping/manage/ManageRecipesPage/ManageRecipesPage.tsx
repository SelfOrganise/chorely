import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { Button, TextField } from 'srcRootDir/common/components';
import { addRecipe, deleteRecipe } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { RecipeItem } from 'srcRootDir/entries/shopping/manage/ManageRecipesPage/components/RecipeItem';

export function ManageRecipesPage() {
  const navigate = useNavigate();
  const [recipeName, setRecipeName] = useState('');

  const recipes = useSWR<Array<Recipe>>('/shopping/recipes', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleAddRecipe = async () => {
    setRecipeName('');
    await addRecipe(recipeName);
    toast.success(`Added new recipe "${recipeName}"`);
    await mutate('/shopping/recipes');
  };

  return (
    <div className="flex flex-col justify-center w-full items-center p-4">
      <div className="flex w-full justify-center flex-col">
        <TextField value={recipeName} onChange={e => setRecipeName(e.target.value)} />
        <Button disabled={recipeName.length < 3} onClick={handleAddRecipe}>
          Add recipe
        </Button>
      </div>

      <div className="flex flex-col w-full mt-4">
        {recipes?.data?.map(recipe => (
          <RecipeItem
            key={recipe.id}
            recipe={recipe}
            onClick={() => navigate(`/shopping/manage/recipes/${recipe.id}`)}
            onDelete={async () => {
              if (confirm(`Are you sure you want to remove "${recipe.name}"?`)) {
                await deleteRecipe(recipe.id);
                await recipes.mutate();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
