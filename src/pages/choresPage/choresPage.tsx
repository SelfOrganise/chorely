import React, { useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { toast } from 'react-toastify';
import { getCurrentUserId } from 'srcRootDir/services/auth';
import { completeChore } from 'srcRootDir/services/chores';

interface Chore {
  id: number;
  title: string;
  description: string;
  completionSemaphore: number;
}

export function ChoresPage() {
  const userId = useMemo(getCurrentUserId, []);
  const response = useSWR<Array<Chore>>('/chores/current', fetcher);

  useEffect(() => {
    if (response.isValidating) {
      toast.info('Refreshing chores...', { toastId: 'loadingChores', position: 'bottom-center' });
    }
  }, [response.isValidating]);

  useEffect(() => {
    if (!response.isValidating) {
      toast.dismiss('loadingChores');
    }
  }, [!response.isValidating]);

  const handleCompleteClick = useCallback(async (chore: Chore) => {
    toast.success(`Completed '${chore.title}'`);
    await completeChore(chore.id);
    await response.mutate();
  }, []);

  if (response.error) {
    return <span>{response.error.toString()}</span>;
  }

  return (
    <Box>
      <List dense={true}>
        {response.data
          ?.filter(ch => (userId > 0 ? ch.completionSemaphore < 0 : ch.completionSemaphore >= 0))
          .map(ch => {
            return (
              <React.Fragment key={ch.id}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={() => handleCompleteClick(ch)}>
                      <CheckIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={ch.title + ' ' + ch.completionSemaphore} secondary={ch.description} />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
      </List>
      <List dense={true}>
        {response.data
          ?.filter(ch => (userId > 0 ? ch.completionSemaphore >= 0 : ch.completionSemaphore < 0))
          .map(ch => {
            return (
              <React.Fragment key={ch.id}>
                <ListItem
                  secondaryAction={
                    <IconButton onClick={() => handleCompleteClick(ch)}>
                      <CheckIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={ch.title + ' ' + ch.completionSemaphore} secondary={ch.description} />
                </ListItem>
                <Divider />
              </React.Fragment>
            );
          })}
      </List>
    </Box>
  );
}
