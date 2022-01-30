import React, { useMemo } from 'react';
import { ChoreListItem } from 'srcRootDir/pages/choresPage/choreListItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { parseISO, isAfter } from 'date-fns';
import Fade from '@mui/material/Fade';
import Masonry from '@mui/lab/Masonry';
import { useMediaQuery, useTheme } from '@mui/material';

interface ChoreListProps {
  chores: Array<Assignment> | undefined;
  onComplete?: () => void;
  areDone: boolean;
}

export function ChoreList({ chores, onComplete, areDone }: ChoreListProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('md'));

  const sortedChores = useMemo(() => {
    return (
      chores &&
      chores.sort((first, second) => {
        if (!first.due_by_utc && second.due_by_utc) {
          return 1;
        }

        if (first.due_by_utc && !second.due_by_utc) {
          return -1;
        }

        if (first.due_by_utc && second.due_by_utc) {
          return isAfter(parseISO(first.due_by_utc), parseISO(second.due_by_utc)) ? 1 : -1;
        }

        return isAfter(parseISO(first.assigned_at_utc), parseISO(second.assigned_at_utc)) ? -1 : 1;
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
    <Box display="flex" width="100%" justifyContent="center" padding="1rem 0.5rem 1rem 0.5rem">
      <Masonry columns={matches ? 3 : 1} spacing={3}>
        {sortedChores.map(ch => {
          return (
            <Fade timeout={800} key={ch.id} in={true}>
              <ChoreListItem assignment={ch} onComplete={onComplete} isDone={areDone} />
            </Fade>
          );
        })}
      </Masonry>
    </Box>
  );
}
