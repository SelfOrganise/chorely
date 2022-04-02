import React from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { useParams } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import { Button } from 'srcRootDir/common/components';
import { GroceryItem } from 'srcRootDir/entries/shopping/ManageGroceriesPage/components/GroceryItem';
import { addGroceryToRecipe } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';

export function RecipePage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const cacheKey = `/shopping/recipes/${id}`;

  const recipe = useSWR<Recipe>(cacheKey, {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const handleAddGroceryToRecipe = async (grocery: Grocery) => {
    if (!id) {
      return;
    }

    await addGroceryToRecipe(id, grocery.id);
    toast.success(`Added "${grocery.name}".`);
    await mutate(cacheKey);
  };

  return (
    <div className="flex flex-col justify-center w-full items-center p-4">
      <Tab.Group>
        <Tab.List>
          <Tab>
            <Button>Recipe details</Button>
          </Tab>
          <Tab>
            <Button>Add groceries</Button>
          </Tab>
        </Tab.List>
        <Tab.Panels className="flex flex-col w-full">
          <Tab.Panel>
            {recipe.data?.groceries?.map((grocery, i) => (
              <GroceryItem key={`${grocery.id}${i}`} item={grocery} onAdd={() => null} />
            ))}
          </Tab.Panel>
          <Tab.Panel>
            {groceriesResponse.data?.map(grocery => (
              <GroceryItem key={grocery.id} item={grocery} onAdd={() => handleAddGroceryToRecipe(grocery)} />
            ))}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
