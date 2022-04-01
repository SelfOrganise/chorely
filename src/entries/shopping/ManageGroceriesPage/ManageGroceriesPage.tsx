import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { addGrocery } from 'srcRootDir/entries/shopping/services/shopping';
import { Button, TextField } from 'srcRootDir/common/components';

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
    <div className="flex flex-col items-center justify-center h-100">
      <TextField value={name} onChange={c => setName(c.target.value)} />
      <input type="range" min="1" max="3" value={size} onChange={r => setSize(parseInt(r.target.value) || 2)} />
      <span>{size === 1 ? 'small' : size === 2 ? 'medium' : 'large'}</span>
      <Button disabled={name.length === 0} onClick={handleAddGrocery}>
        Add
      </Button>
    </div>
  );
}
