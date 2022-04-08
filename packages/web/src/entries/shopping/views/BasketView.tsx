import React from 'react';
import { GroceryItem } from 'srcRootDir/entries/shopping/manage/ManageGroceriesPage/components/GroceryItem';
import { createNewBasket, deleteFromBasket } from 'srcRootDir/entries/shopping/services/shopping';
import { Button } from 'srcRootDir/common/components';
import { useNavigate } from 'react-router-dom';
import { useLiveBasket } from 'srcRootDir/entries/shopping/hooks';

export function BasketView(): JSX.Element {
  const currentBasket = useLiveBasket(state => state.basket);
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <Button onClick={() => createNewBasket()}>Create new basket</Button>
      <Button onClick={() => navigate('/shopping/basket/solve')}>🧠 Solve</Button>

      {currentBasket?.items.map((g: Grocery, i: number) => (
        <GroceryItem
          key={`${g.id}-${i}`}
          item={g}
          onDelete={async () => {
            if (confirm(`Are you sure you want to remove "${g.name}"?`)) {
              await deleteFromBasket({ groceryId: g.id });
            }
          }}
        />
      ))}
    </React.Fragment>
  );
}
