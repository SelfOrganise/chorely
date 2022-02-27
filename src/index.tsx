import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { Login } from 'srcRootDir/pages/login';
import { ChoresPage } from 'srcRootDir/pages/chores';
import { ProviderConfiguration, SWRConfiguration } from 'swr/dist/types';
import { SWRConfig } from 'swr';
import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';

const theme = createTheme({
  typography: {
    fontSize: 14,
  },
});

function Root(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <HashRouter>
        <CssBaseline />
        <RouteDefinitions />
      </HashRouter>
    </ThemeProvider>
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
        {/*<Route path="/shopping" element={}*/}
      </Routes>
    </SWRConfig>
  );
}

ReactDOM.render(<Root />, document.getElementById('root'));
