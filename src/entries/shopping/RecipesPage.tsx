import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { Button, TextField } from 'srcRootDir/common/components';
import { addRecipe } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export function RecipesPage() {
  const navigate = useNavigate();
  const [recipeName, setRecipeName] = useState('');

  const recipes = useSWR<Array<Grocery>>('/shopping/recipes', {
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
      <div className="flex w-[400px] justify-center flex-col">
        <TextField value={recipeName} onChange={e => setRecipeName(e.target.value)} />
        <Button disabled={recipeName.length < 3} onClick={handleAddRecipe}>
          Add recipe
        </Button>
      </div>

      <div className="flex flex-col w-full mt-4">
        {recipes?.data?.map(recipe => (
          <div className="flex justify-between w-full bg-blue-200 rounded mb-2 p-4" key={recipe.id}>
            <span>{recipe.name}</span>
            <Button onClick={() => navigate(`/shopping/recipes/${recipe.id}`)}>Open</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
