import React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { ChoreListItem } from 'srcRootDir/pages/choresPage/choreListItem';

interface ChoreListProps {
  chores: Array<Chore> | undefined;
  onComplete?: () => void;
}

export function ChoreList({ chores, onComplete }: ChoreListProps) {
  if (!chores || chores.length === 0) {
    return <span>🎉 All your chores are done!</span>;
  }

  return (
    <List dense={true} style={{ width: '100%' }}>
      {chores.map(ch => {
        return (
          <React.Fragment key={ch.id}>
            <ChoreListItem chore={ch} onComplete={onComplete} />
            <Divider />
          </React.Fragment>
        );
      })}
    </List>
  );
}

