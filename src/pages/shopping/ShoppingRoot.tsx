import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import MapIcon from '@mui/icons-material/Map';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import CategoryIcon from '@mui/icons-material/Category';
import styled from '@emotion/styled';

export function ShoppingWrapper() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState(location.pathname);

  return (
    <RootWrapper>
      <Outlet />
      <BottomNavigation
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          boxShadow:
            'rgba(0, 0, 0, 0.2) 0px 3px 3px -2px, rgba(0, 0, 0, 0.14) 0px 3px 4px 0px, rgba(0, 0, 0, 0.12) 0px 1px 8px 0px',
        }}
        showLabels
        value={selectedRoute}
        onChange={(event, newValue) => {
          setSelectedRoute(newValue);
          navigate(newValue);
        }}
      >
        <BottomNavigationAction value="/shopping" label="Cart" icon={<LocalGroceryStoreIcon />} />
        <BottomNavigationAction value="/shopping/groceries" label="Groceries" icon={<CategoryIcon />} />
        <BottomNavigationAction value="/shopping/recipes" label="Recipes" icon={<TextSnippetIcon />} />
        <BottomNavigationAction value="/shopping/map" label="Map" icon={<MapIcon />} />
      </BottomNavigation>
    </RootWrapper>
  );
}

const RootWrapper = styled.div`
  min-height: calc(100vh - 3.5rem);
  margin-bottom: 3.5rem;
`;
