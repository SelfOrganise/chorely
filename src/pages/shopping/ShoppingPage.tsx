import { styled, Tabs, Tab } from '@mui/material';
import React, { useState } from 'react';
import { GroceryItem } from 'srcRootDir/pages/shopping/GroceryItem';

export function ShoppingPage() {
  const [shoppingList, setShoppingList] = useState<Array<Grocery>>([
    { id: 1, name: 'Potato' },
    { id: 2, name: 'Eggu' },
    { id: 3, name: 'Watercress' },
    {
      id: 4,
      name: 'Water',
    },
    {
      id: 5,
      name: 'Broccoli',
    },
    {
      id: 6,
      name: 'Salmon',
    },
    {
      id: 7,
      name: 'Spinach',
    },
    {
      id: 8,
      name: 'Onion',
    },
    {
      id: 9,
      name: 'Wine',
    },
    {
      id: 10,
      name: 'Ginger',
    },
    { id: 11, name: 'Gsfasfinger' },
    { id: 12, name: 'Gsfafsinger' },
    { id: 13, name: 'Giasfnger' },
    { id: 14, name: 'Gingasfasfer' },
    { id: 15, name: 'asfasf' },
    { id: 16, name: 'ZZZ' },
    { id: 17, name: 'Giafgsa' },
    { id: 18, name: 'Ginger' },
    { id: 19, name: 'Gisfnger' },
    { id: 20, name: 'Ginav' },
    { id: 21, name: 'asfa' },
    { id: 22, name: 'asfasgf' },
    { id: 23, name: 'asfa' },
    { id: 24, name: 'Ginger' },
    { id: 25, name: 'Giasa' },
    { id: 26, name: 'Gingasca' },
  ]);

  const [addedItems, setAddedItems] = useState<Array<Grocery>>([]);

  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <div>
      <Tabs value={value} onChange={handleChange}>
        <Tab label="List" />
        <Tab label="Basket" />
      </Tabs>
      {value == 0 && (
        <StyledList>
          {shoppingList.map(g => (
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
    </div>
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
