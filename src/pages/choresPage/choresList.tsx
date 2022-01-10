import React from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { ChoreListItem } from 'srcRootDir/pages/choresPage/choreListItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

interface ChoreListProps {
  chores: Array<Chore> | undefined;
  onComplete?: () => void;
}

export function ChoreList({ chores, onComplete }: ChoreListProps) {
  if (!chores) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" margin="2rem">
        <CircularProgress />
        <Typography variant="body1" marginTop="2rem">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (chores.length === 0) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" margin="2rem">
        <Typography variant="h2" marginBottom="1rem">
          🎉
        </Typography>
        <Typography variant="body1">All your chores are done!</Typography>
      </Box>
    );
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
