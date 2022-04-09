import React, { useMemo } from 'react';
import { GroceryItem } from 'srcRootDir/entries/shopping/manage/ManageGroceriesPage/components/GroceryItem';
import { createNewBasket, deleteFromBasket } from 'srcRootDir/entries/shopping/services/shopping';
import { Button } from 'srcRootDir/common/components';
import { useNavigate } from 'react-router-dom';
import { useLiveBasket } from 'srcRootDir/entries/shopping/hooks';

export function BasketView(): JSX.Element {
  const currentBasket = useLiveBasket(state => state.basket);
  const navigate = useNavigate();

  const groupedGroceries: Array<Array<BasketItem>> = useMemo(() => {
    if (!currentBasket) {
      return [];
    }

    const result: Record<number, Array<BasketItem>> = {};
    for (const item of currentBasket.items) {
      if (result[item.id]) {
        result[item.id].push(item);
      } else {
        result[item.id] = [item];
      }
    }

    return Object.values(result);
  }, [currentBasket]);

  return (
    <div className="basket-view">
      <Button
        onClick={() => {
          if (confirm('Are you sure you want to create a new basket?')) {
            return createNewBasket();
          }
        }}
      >
        Create new basket
      </Button>
      <Button onClick={() => navigate('/shopping/basket/solve')}>🧠 Solve</Button>

      <div className="w-full grid grid-cols-[1fr_1fr]">
        {groupedGroceries.map((group: Array<Grocery>, i: number) => (
          <GroceryItem
            key={`${group[0].id}-${i}`}
            item={group[0]}
            count={group.length}
            deleteLabel="Remove"
            onDelete={async () => {
              if (confirm(`Are you sure you want to remove "${group[0].name}"?`)) {
                await deleteFromBasket({ groceryId: group[0].id });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
