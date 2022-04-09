import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Dropdown } from 'srcRootDir/common/components';
import { useListenToLiveBasket, useLiveBasket } from 'srcRootDir/entries/shopping/hooks';
import classNames from 'classnames';

export function ShoppingRoot() {
  const navigate = useNavigate();
  useListenToLiveBasket();
  const [connected, basketCount] = useLiveBasket(state => [state.connected, state.basket?.items.length] || null);

  return (
    <div className="grid grid-rows-[1fr_auto] min-h-screen">
      <div className="flex flex-col items-center p-4 ">
        <div className="w-full md:w-[500px] overflow-auto h-full">
          <Outlet />
        </div>
      </div>
      <div className="flex p-1 space-x-1 rounded justify-start w-full text-sm bg-white sticky bottom-0">
        <Button className="bg-green-600 hover:bg-green-600" onClick={() => navigate('/shopping')}>
          🥦 Groceries
        </Button>
        <Button className="bg-orchid-500 hover:bg-orchid-600" onClick={() => navigate('/shopping/recipes')}>
          🗒️ Recipes
        </Button>
        <span className="relative">
          <span
            className={classNames('inline-block w-3 h-3 rounded-full absolute -top-0.5 -right-0.5', {
              'bg-red-600': !connected,
              'bg-green-400': connected,
            })}
          ></span>
          <Button className="bg-cyan-500 hover:bg-cyan-600" onClick={() => navigate('/shopping/basket')}>
            🧺 Basket ({basketCount})
          </Button>
        </span>
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
