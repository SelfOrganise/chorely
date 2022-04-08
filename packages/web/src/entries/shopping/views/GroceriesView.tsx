import useSWR from 'swr';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { GroceryItem } from 'srcRootDir/entries/shopping/manage/ManageGroceriesPage/components/GroceryItem';
import { addToBasket } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';
import React from 'react';

export function GroceriesView(): JSX.Element {
  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <React.Fragment>
      {groceriesResponse.data?.map(g => (
        <GroceryItem
          key={g.id}
          item={g}
          onAdd={async () => {
            await addToBasket({ groceryId: g.id });
            toast.success(`added '${g.name}'`, { autoClose: 1500, position: 'bottom-center' });
          }}
        />
      ))}
    </React.Fragment>
  );
}
