import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { RecipeItem } from 'srcRootDir/entries/shopping/manage/ManageRecipesPage/components/RecipeItem';
import { addToBasket, deleteRecipe } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';
import React from 'react';

export function RecipesView(): JSX.Element {
  const recipes = useSWR<Array<Recipe>>('/shopping/recipes', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });

  return (
    <React.Fragment>
      {recipes?.data?.map(recipe => (
        <RecipeItem
          key={recipe.id}
          recipe={recipe}
          onClick={async () => {
            await addToBasket({ recipeId: recipe.id });
            toast.success(`added '${recipe.name}'`, { autoClose: 1500, position: 'bottom-center' });
          }}
          onDelete={async () => {
            if (confirm(`Are you sure you want to remove "${recipe.name}"?`)) {
              await deleteRecipe(recipe.id);
              await recipes.mutate();
            }
          }}
        />
      ))}
    </React.Fragment>
  );
}
