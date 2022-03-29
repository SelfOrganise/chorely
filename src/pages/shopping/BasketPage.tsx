import { styled, Tabs, Tab, Box, Button } from '@mui/material';
import React, { useRef, useState } from 'react';
import { GroceryItem } from 'srcRootDir/pages/shopping/ManageGroceriesPage/components/GroceryItem';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { Types } from 'srcRootDir/pages/shopping/services/constants';
import { getAllRoutes } from 'srcRootDir/pages/shopping/services/utils';
import {
  addToBasket,
  createNewBasket,
  solveShopping,
  useLiveBasket,
} from 'srcRootDir/pages/shopping/services/shopping';
import { StoreMap } from 'srcRootDir/pages/shopping/services/StoreMap';
import { toast } from 'react-toastify';

export function BasketPage() {
  const canvasElement = useRef<HTMLCanvasElement | null>(null);
  const storeMap = useRef<StoreMap>();
  const currentBasket = useLiveBasket();

  const [selectedTab, setSelectedTab] = useState(0);
  const [result, setResult] = useState<Array<Array<Grocery>>>();

  const groceriesResponse = useSWR<Array<Grocery>>('/shopping/groceries', {
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

    if (!groceriesResponse?.data || !groceriesResponse?.data.length) {
      alert('groceries not loaded');
      return;
    }

    if (!canvasElement.current) {
      throw Error('canvasElement.current is null');
    }

    if (!storeMap.current) {
      storeMap.current = new StoreMap(canvasElement.current);
    }

    const mapDefinition: MapDefinition = JSON.parse(mapResponse.data[0].data);

    const productOrder: Array<Grocery> = [{ id: -1, name: 'start', size: 0 }];
    const filteredMapData = mapDefinition.filter(p => {
      if (p.type === Types.product && currentBasket) {
        const item = currentBasket.items.find((a: BasketItem) => a.name === p.name);
        if (item) {
          productOrder.push(item);
        }

        return item;
      } else {
        return true;
      }
    });
    productOrder.push({ id: -1, name: 'finish', size: 0 });

    storeMap.current?.import(filteredMapData);

    // note: getAllRoutes maintains order of passed in products
    const routes = getAllRoutes(filteredMapData);
    const weights = routes.map(a => a.map(b => b.route?.length));
    const response = await solveShopping({ weights, sizes: productOrder.map(p => p.size) });

    const productRoutes = response.map(user => user.map(p => productOrder[p]));

    storeMap.current?.drawRoutes(response, routes);

    setResult(productRoutes);
  }

  const handleChange = (event: any, newValue: any) => {
    setSelectedTab(newValue);
  };

  if (groceriesResponse.isValidating) {
    return <span>loading</span>;
  }

  if (groceriesResponse.error) {
    return <span>{JSON.stringify(groceriesResponse.error)}</span>;
  }

  return (
    <Box alignItems="center" display="flex" flexDirection="column">
      <StyledTabs value={selectedTab} onChange={handleChange}>
        <Tab label="List" />
        <Tab label={`Basket (${currentBasket?.items.length})`} />
        <Tab label={`Solve`} />
      </StyledTabs>
      {selectedTab == 0 && (
        <StyledList>
          {groceriesResponse.data?.map(g => (
            <GroceryItem
              key={g.id}
              item={g}
              onAdd={async item => {
                await addToBasket(item.id);
                toast.success('added to basket');
              }}
            />
          ))}
        </StyledList>
      )}
      {selectedTab == 1 && (
        <StyledList>
          <Button variant="contained" onClick={() => createNewBasket()}>
            Create new basket
          </Button>
          {currentBasket?.items.map((g, i) => (
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
                  <div>
                    {v?.name} - {v?.size}
                  </div>
                ))}
              </div>
              <div>
                {result[1].map(v => (
                  <div>
                    {v?.name} - {v?.size}
                  </div>
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
