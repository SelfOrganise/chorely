import useSWR from 'swr';
import { fetcher } from 'srcRootDir/common/services/fetcher';
import { GroceryItem } from 'srcRootDir/entries/shopping/manage/ManageGroceriesPage/components/GroceryItem';
import { addToBasket } from 'srcRootDir/entries/shopping/services/shopping';
import { toast } from 'react-toastify';
import React, { useMemo } from 'react';
import { useLiveBasket } from 'srcRootDir/entries/shopping/hooks';

export function GroceriesView(): JSX.Element {
  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
  });

  const { basket } = useLiveBasket();

  const groceries = useMemo(() => {
    return groceriesResponse.data?.map(g => (
      <GroceryItem
        key={g.id}
        item={g}
        count={basket?.items.filter(b => b.id === g.id).length || 0}
        onClick={async () => {
          await addToBasket({ groceryId: g.id });
          toast.success(`added '${g.name}'`, { autoClose: 1500, position: 'bottom-center' });
        }}
      />
    ));
  }, [basket, groceriesResponse]);

  return <div className="groceries-view w-full h-full grid grid-cols-[1fr_1fr]">{groceries}</div>;
}
