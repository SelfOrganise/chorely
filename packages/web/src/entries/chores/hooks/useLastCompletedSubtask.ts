import { useCallback, useState } from 'react';

const key = `completed_subtasks_v0`;

const storageData = window.localStorage.getItem(key);
const completedSubtasks = storageData ? JSON.parse(storageData) : {};

function getLastCompletedIndex(assignmentId: number): number {
  return completedSubtasks[assignmentId] || 0;
}

function completeSubtask(assignmentId: number, index: number) {
  completedSubtasks[assignmentId] = index;
  window.localStorage.setItem(key, JSON.stringify(completedSubtasks));
}

function clearSubtasks(assignmentId: number) {
  completedSubtasks[assignmentId] = undefined;
  delete completedSubtasks[assignmentId];
  window.localStorage.setItem(key, JSON.stringify(completedSubtasks));
}

export function useLastCompletedSubtask(assignmentId: number) {
  const [lastIndex, setIndex] = useState(() => getLastCompletedIndex(assignmentId));

  const complete = useCallback((index?: number) => {
    setIndex(old => {
      const newIndex = index === undefined ? old + 1 : index;
      completeSubtask(assignmentId, newIndex);
      return newIndex;
    });
  }, []);

  const clear = useCallback(() => {
    setIndex(old => {
      clearSubtasks(assignmentId);
      return 0;
    });
  }, []);

  return { lastIndex, complete, clear };
}
