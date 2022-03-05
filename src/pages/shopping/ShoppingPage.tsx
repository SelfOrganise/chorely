import { styled, Tabs, Tab, Box, AppBar } from '@mui/material';
import React, { useState } from 'react';
import { GroceryItem } from 'srcRootDir/pages/shopping/GroceryItem';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';

export function ShoppingPage() {
  const response = useSWR<Array<Grocery>>('/shopping/groceries', {
    fetcher,
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [addedItems, setAddedItems] = useState<Array<Grocery>>([]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  if (response.isValidating) {
    return <span>loading</span>;
  }

  if (response.error) {
    return <span>{JSON.stringify(response.error)}</span>;
  }

  return (
    <Box alignItems="center" display="flex" flexDirection="column">
      <AppBar position="sticky">
        <Tabs sx={{ color: 'white' }} value={value} onChange={handleChange}>
          <Tab sx={{ color: 'white' }} label="List" />
          <Tab label={`Basket (${addedItems.length})`} />
        </Tabs>
      </AppBar>
      {value == 0 && (
        <StyledList>
          {response.data?.map(g => (
            <GroceryItem key={g.id} item={g} onAdd={item => setAddedItems(old => [...old, item])} />
          ))}
        </StyledList>
      )}
      {value == 1 && (
        <StyledList>
          {addedItems.map(g => (
            <GroceryItem key={g.id} item={g} onAdd={() => null} />
          ))}
        </StyledList>
      )}
    </Box>
  );
}

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
