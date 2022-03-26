import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { toast } from 'react-toastify';
import { getCurrentUserId } from 'srcRootDir/services/auth';
import { ChoreList } from 'srcRootDir/pages/chores/ChoresList';
import { Alert, Box, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export function ChoresPage() {
  const userId = useMemo(getCurrentUserId, []);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const response = useSWR<Array<Assignment>>('/assignments/current', fetcher);

  useEffect(() => {
    if (response.isValidating) {
      toast.loading('Refreshing chores...', { toastId: 'loadingChores' });
    }

    return () => toast.dismiss('loadingChores');
  }, [response.isValidating]);

  if (response.error) {
    return (
      <React.Fragment>
        <Alert severity="error">The API server is down. ({response.error.toString()})</Alert>
        <Box height="60vh" display="flex" alignItems="center" justifyContent="center">
          <Button onClick={() => location.reload()} startIcon={<RefreshIcon />} variant="contained">
            Reload
          </Button>
        </Box>
      </React.Fragment>
    );
  }

  return (
    <Box alignItems="center" display="flex" flexDirection="column">
      <ChoreList
        chores={response.data?.filter(ch => ch.assigned_to_user_id == userId)}
        areDone={false}
        onComplete={response.mutate}
      />
      <Button
        onClick={() => setShowCompletedTasks(!showCompletedTasks)}
        sx={{ color: 'text.secondary', opacity: 0.6, marginBottom: '2rem', marginTop: '2rem' }}
      >
        {showCompletedTasks ? 'Hide' : 'Show'} completed tasks
      </Button>
      {/*<Slide direction="right" in={showCompletedTasks}>*/}
      {showCompletedTasks && (
        <ChoreList
          chores={response.data?.filter(ch => ch.assigned_to_user_id != userId)}
          areDone={true}
          onComplete={response.mutate}
        />
      )}
    </Box>
  );
}
