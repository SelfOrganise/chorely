import React, { useMemo } from 'react';
import { isAfter, parseISO } from 'date-fns';
import { ChoreListItem } from 'srcRootDir/entries/chores/ChoreListItem';
import { spinnerIcon } from 'srcRootDir/common/icons';

interface ChoreListProps {
  chores: Array<Assignment> | undefined;
  onComplete?: () => void;
  areDone: boolean;
}

export function ChoreList({ chores, onComplete, areDone }: ChoreListProps) {
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
      <div className="flex flex-col items-center justify-center m-8">
        {spinnerIcon}
        <h4 className="mt-4">Loading...</h4>
      </div>
    );
  }

  if (sortedChores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center m-8">
        <h2 className="mt-4 text-5xl">🎉</h2>
        <h4 className="mt-4">All your chores are done!</h4>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full md:w-[500px] p-6">
      {sortedChores.map(ch => {
        return <ChoreListItem key={ch.id} assignment={ch} onComplete={onComplete} isDone={areDone} />;
      })}
    </div>
  );
}
