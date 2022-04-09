import useSWR from 'swr';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { RecipeItem } from 'srcRootDir/entries/shopping/manage/ManageRecipesPage/components/RecipeItem';
import { addToBasket } from 'srcRootDir/entries/shopping/services/shopping';
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
    <div className="recipes-view">
      {recipes?.data?.map(recipe => (
        <RecipeItem
          key={recipe.id}
          recipe={recipe}
          clickLabel="Add"
          onClick={async () => {
            await addToBasket({ recipeId: recipe.id });
            toast.success(`added '${recipe.name}'`, { autoClose: 1500, position: 'bottom-center' });
          }}
        />
      ))}
    </div>
  );
}
