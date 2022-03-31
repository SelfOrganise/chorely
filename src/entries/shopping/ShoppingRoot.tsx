import React, { Fragment } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Button } from 'srcRootDir/common/components';
import { Tab } from '@headlessui/react';

export function ShoppingWrapper() {
  const navigate = useNavigate();

  return (
    <div className="h-screen">
      <div>
        <Tab.Group>
          <Tab.List className="flex p-1 m-2 space-x-1 rounded justify-center">
            <Tab as={Fragment}>
              <Button onClick={() => navigate('/shopping')}>Cart</Button>
            </Tab>
            <Tab as={Fragment}>
              <Button onClick={() => navigate('/shopping/recipes')}>Recipes</Button>
            </Tab>
            <Tab as={Fragment}>
              <Button onClick={() => navigate('/shopping/groceries')}>Groceries</Button>
            </Tab>
            <Tab as={Fragment}>
              <Button onClick={() => navigate('/shopping/map')}>Map</Button>
            </Tab>
          </Tab.List>
        </Tab.Group>
      </div>
      <Outlet />
    </div>
  );
}
