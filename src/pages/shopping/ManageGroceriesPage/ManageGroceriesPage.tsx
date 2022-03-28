import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Button, TextField } from '@mui/material';
import { addGrocery } from 'srcRootDir/pages/shopping/services/shopping';

export function ManageGroceriesPage() {
  const [name, setName] = useState('');
  const [size, setSize] = useState(2);

  const handleAddGrocery = useCallback(async () => {
    try {
      await addGrocery({ name, size });
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
      <input type="range" min="1" max="3" value={size} onChange={r => setSize(parseInt(r.target.value) || 2)} />
      <span>{size === 1 ? 'small' : size === 2 ? 'medium' : 'large'}</span>
      <Button disabled={name.length === 0} variant="contained" onClick={handleAddGrocery}>
        Add
      </Button>
    </Box>
  );
}
