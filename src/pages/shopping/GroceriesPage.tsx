import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Button, TextField } from '@mui/material';
import { addGrocery } from 'srcRootDir/pages/shopping/services/shopping';

export function GroceriesPage() {
  const [name, setName] = useState('');

  const handleAddGrocery = useCallback(async () => {
    try {
      await addGrocery({ name });
      toast.success(`Added new grocery '${name}'.`);
      setName('');
    } catch (ex: any) {
      toast.error(`Could not add '${name}'. Reason: ${await ex?.text()}`);
    }
  }, [name]);

  return (
    <Box
      alignItems="center"
      display="flex"
      flexDirection="column"
      height="calc(100vh - 3.5rem)"
      justifyContent="center"
    >
      <TextField value={name} onChange={c => setName(c.target.value)} />
      <Button disabled={name.length === 0} variant="contained" onClick={handleAddGrocery}>
        Add
      </Button>
    </Box>
  );
}
