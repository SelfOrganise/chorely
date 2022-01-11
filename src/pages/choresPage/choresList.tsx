import React, { useMemo } from 'react';
import List from '@mui/material/List';
import { ChoreListItem } from 'srcRootDir/pages/choresPage/choreListItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { parseISO, isAfter } from 'date-fns';

interface ChoreListProps {
  chores: Array<Chore> | undefined;
  onComplete?: () => void;
  areDone: boolean;
}

export function ChoreList({ chores, onComplete, areDone }: ChoreListProps) {
  const sortedChores = useMemo(() => {
    return (
      chores &&
      chores.sort((first, second) => {
        if (first.isLate && !second.isLate) {
          return -1;
        } else if (!first.isLate && second.isLate) {
          return 1;
        } else {
          const order = isAfter(parseISO(first.modifiedOnUTC), parseISO(second.modifiedOnUTC)) ? 1 : -1;
          const areDoneMod = areDone ? -1 : 1;

          return order * areDoneMod;
        }
      })
    );
  }, [chores]);

  if (!sortedChores) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" margin="2rem">
        <CircularProgress />
        <Typography variant="body1" marginTop="2rem">
          Loading...
        </Typography>
      </Box>
    );
  }

  if (sortedChores.length === 0) {
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
      {sortedChores.map(ch => {
        return (
          <React.Fragment key={ch.id}>
            <ChoreListItem chore={ch} onComplete={onComplete} isDone={areDone} />
          </React.Fragment>
        );
      })}
    </List>
  );
}
