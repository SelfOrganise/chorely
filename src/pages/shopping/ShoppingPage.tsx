import { styled, Tabs, Tab, Box, Button } from '@mui/material';
import React, { useRef, useState } from 'react';
import { GroceryItem } from 'srcRootDir/pages/shopping/GroceryItem';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { Types } from 'srcRootDir/pages/shopping/services/constants';
import { getAllRoutes } from 'srcRootDir/pages/shopping/services/utils';
import { solveShopping } from 'srcRootDir/pages/shopping/services/shopping';
import { StoreMap } from 'srcRootDir/pages/shopping/services/StoreMap';

export function ShoppingPage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();

  const [addedItems, setAddedItems] = useState<Array<Grocery>>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [result, setResult] = useState<Array<Array<string>>>();

  const response = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const mapResponse = useSWR<Array<MapData>>('/shopping/maps', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateOnMount: true,
  });

  async function solve() {
    if (!mapResponse?.data?.[0]) {
      alert('map data not loaded');
      return;
    }

    if (!canvasElement.current) {
      throw Error('canvasElement.current is null');
    }

    if (!storeMap.current) {
      storeMap.current = new StoreMap(canvasElement.current);
    }

    const addedNames = addedItems.map(a => a.name);
    const mapDefinition: MapDefinition = JSON.parse(mapResponse.data[0].data);
    const filteredMapData = mapDefinition.filter(p => {
      if (p.type === Types.product) {
        return addedNames.includes(p.name);
      } else {
        return true;
      }
    });

    storeMap.current?.import(filteredMapData);

    const routes = getAllRoutes(filteredMapData);
    const weights = routes.map(a => a.map(b => b.route?.length));
    const response = await solveShopping(weights);

    const productOrder = response.map(user =>
      user.map(p => {
        return routes[p][0].products?.[0][2].name;
      })
    );

    storeMap.current?.drawRoutes(response, routes);

    setResult(productOrder);
  }

  const handleChange = (event: any, newValue: any) => {
    setSelectedTab(newValue);
  };

  if (response.isValidating) {
    return <span>loading</span>;
  }

  if (response.error) {
    return <span>{JSON.stringify(response.error)}</span>;
  }

  return (
    <Box alignItems="center" display="flex" flexDirection="column">
      <StyledTabs value={selectedTab} onChange={handleChange}>
        <Tab label="List" />
        <Tab label={`Basket (${addedItems.length})`} />
        <Tab label={`Solve`} />
      </StyledTabs>
      {selectedTab == 0 && (
        <StyledList>
          {response.data?.map(g => (
            <GroceryItem key={g.id} item={g} onAdd={item => setAddedItems(old => [...old, item])} />
          ))}
        </StyledList>
      )}
      {selectedTab == 1 && (
        <StyledList>
          {addedItems.map((g, i) => (
            <GroceryItem key={`${g.id}-${i}`} item={g} onAdd={() => null} />
          ))}
        </StyledList>
      )}
      {selectedTab === 2 && (
        <Box display="flex" flexDirection="column">
          <Button variant="contained" onClick={solve}>
            Solve
          </Button>
          <CanvasWrapper>
            <canvas ref={canvasElement} />
          </CanvasWrapper>
          {result && (
            <Box display="flex" justifyContent="space-around">
              <div>
                {result[0].map(v => (
                  <div>{v}</div>
                ))}
              </div>
              <div>
                {result[1].map(v => (
                  <div>{v}</div>
                ))}
              </div>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

const StyledTabs = styled(Tabs)`
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  background-color: #ffeee8;
`;

const StyledList = styled('div')`
  display: flex;
  flex-direction: column;
  width: 500px;
  padding: 1.5rem;

  & > * {
    margin-bottom: 1rem;
  }

  @media (max-width: 700px) {
    width: 100%;
  }
`;

const CanvasWrapper = styled('div')`
  width: 100vw;
  height: 330px;
  overflow: hidden;
  border: 1px solid black;
`;
