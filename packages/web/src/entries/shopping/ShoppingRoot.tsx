import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'srcRootDir/common/components';
import { useLiveBasket } from 'srcRootDir/entries/shopping/services/shopping';
// import create from 'zustand';
//
// const shoppingStore = create(set => ({
//   basketCount: 0,
//   setBasketCount: (basketCount: number) => set(state => ({ basketCount: state.basketCount + 1 })),
// }));

export function ShoppingRoot() {
  const navigate = useNavigate();
  const basket = useLiveBasket();

  return (
    <div className="grid grid-rows-[1fr_auto] min-h-screen">
      <div className="flex flex-col items-center p-4 ">
        <div className="w-full md:w-[500px] overflow-auto h-full">
          <Outlet />
        </div>
      </div>
      <div className="flex p-1 space-x-1 rounded justify-start w-full text-sm bg-white sticky bottom-0">
        <Button className="p-0 m-0" onClick={() => navigate('/shopping')}>
          🥦 Groceries
        </Button>
        <Button onClick={() => navigate('/shopping/recipes')}>🗒️ Recipes</Button>
        <Button onClick={() => navigate('/shopping/basket')}>🧺 Basket ({basket?.items.length || 0})</Button>
        <Dropdown
          className="flex !ml-auto text-xl px-2"
          buttons={[
            {
              label: '🥦 Manage groceries',
              onClick: () => navigate('/shopping/manage/groceries'),
            },
            {
              label: '🗒️ Manage recipes',
              onClick: () => navigate('/shopping/manage/recipes'),
            },
            {
              label: '🗺️ Configure store map',
              onClick: () => navigate('/shopping/manage/map'),
            },
          ]}
        >
          ⚙️
        </Dropdown>
      </div>
    </div>
  );
}
