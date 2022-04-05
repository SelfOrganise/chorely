import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ProviderConfiguration, SWRConfiguration } from 'swr/dist/types';
import { SWRConfig } from 'swr';
import { ToastContainer, toast, Zoom } from 'react-toastify';

import { Login } from 'srcRootDir/entries/login';
import { ChoresPage } from 'srcRootDir/entries/chores';
import { ShoppingRoot } from 'srcRootDir/entries/shopping/ShoppingRoot';
import { ManageGroceriesPage } from 'srcRootDir/entries/shopping/manage/ManageGroceriesPage';
import { ManageRecipesPage } from 'srcRootDir/entries/shopping/manage/ManageRecipesPage/ManageRecipesPage';
import { ManageStoreMapPage } from 'srcRootDir/entries/shopping/manage/ManageStoreMapPage';
import { ManageRecipePage } from 'srcRootDir/entries/shopping/manage';
import { GroceriesView } from 'srcRootDir/entries/shopping/views/GroceriesView';
import { RecipesView } from 'srcRootDir/entries/shopping/views/RecipesView';
import { SolvePage } from 'srcRootDir/entries/shopping/views/SolvePage';
import { BasketView } from 'srcRootDir/entries/shopping/views/BasketView';

function Root(): JSX.Element {
  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={3500}
        hideProgressBar={true}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        transition={Zoom}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <HashRouter>
        <RouteDefinitions />
      </HashRouter>
    </div>
  );
}

function RouteDefinitions() {
  const navigate = useNavigate();

  const swrConfig: SWRConfiguration & Partial<ProviderConfiguration> = {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    onError: er => {
      if (er.status === 401) {
        toast.error('Unauthorized', { toastId: 'authError' });
        navigate('/');
      }
    },
  };

  return (
    <SWRConfig value={swrConfig}>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/chores" element={<ChoresPage />} />
        <Route path="/shopping" element={<ShoppingRoot />}>
          <Route index element={<GroceriesView />} />
          <Route path="basket" element={<BasketView />} />
          <Route path="basket/solve" element={<SolvePage />} />
          <Route path="recipes" element={<RecipesView />} />
          <Route path="manage/groceries" element={<ManageGroceriesPage />} />
          <Route path="manage/recipes" element={<ManageRecipesPage />} />
          <Route path="manage/recipes/:id" element={<ManageRecipePage />} />
          <Route path="manage/map" element={<ManageStoreMapPage />} />
        </Route>
      </Routes>
    </SWRConfig>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
