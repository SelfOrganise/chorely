import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { ProviderConfiguration, SWRConfiguration } from 'swr/dist/types';
import { SWRConfig } from 'swr';
import { ToastContainer, toast, Zoom } from 'react-toastify';

import { Login } from 'srcRootDir/entries/login';
import { ChoresPage } from 'srcRootDir/entries/chores';
import { BasketPage } from 'srcRootDir/entries/shopping/BasketPage';
import { ManageGroceriesPage } from 'srcRootDir/entries/shopping/ManageGroceriesPage';
import { RecipesPage } from 'srcRootDir/entries/shopping/RecipesPage';
import { ShoppingWrapper } from 'srcRootDir/entries/shopping/ShoppingRoot';
import { StoreMapPage } from 'srcRootDir/entries/shopping/StoreMapPage';

import './index.css';

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
        <Route path="/shopping" element={<ShoppingWrapper />}>
          <Route index element={<BasketPage />} />
          <Route path="groceries" element={<ManageGroceriesPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="map" element={<StoreMapPage />} />
        </Route>
      </Routes>
    </SWRConfig>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
