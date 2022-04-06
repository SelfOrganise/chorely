import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetcher } from 'srcRootDir/services/fetcher';
import { toast } from 'react-toastify';
import { getCurrentUserId } from 'srcRootDir/entries/login/services/auth';
import { ChoreList } from 'srcRootDir/entries/chores/ChoresList';
import { Button } from 'srcRootDir/common/components';

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
        <div className="flex flex-col items-center justify-center h-screen">
          <p className="text-carnation-600 font-bold m-4 bg-carnation-200 bg-opacity-80 p-2 rounded">
            The backend server is down. (Reason: '{response.error?.toString() || 'unknown'}')
          </p>

          <Button onClick={() => location.reload()}>🔃 Reload</Button>
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <ChoreList
        chores={response.data?.filter(ch => ch.assigned_to_user_id == userId)}
        areDone={false}
        onComplete={response.mutate}
      />
      <Button
        className="bg-transparent hover:bg-transparent text-gray-400 border-2 border-gray-300 opacity-80"
        onClick={() => setShowCompletedTasks(!showCompletedTasks)}
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
    </div>
  );
}
