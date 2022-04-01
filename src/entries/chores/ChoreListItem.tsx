import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { toast } from 'react-toastify';
import { Transition } from '@headlessui/react';

import { completeAssignment, sendReminder, undoAssignment } from 'srcRootDir/services/chores';
import { useLastCompletedSubtask } from 'srcRootDir/hooks/useLastCompletedSubtask';
import { parseDueDate } from 'srcRootDir/services/parseDueDate';
import { menuIcon, checkIcon, chevronDoubleDownIcon } from 'srcRootDir/common/icons';
import { Dropdown } from 'srcRootDir/common/components';

interface ChoreListItemProps {
  assignment: Assignment;
  onComplete?: () => void;
  isDone: boolean;
  style?: React.CSSProperties;
}

export const ChoreListItem = ({ assignment, onComplete, isDone }: ChoreListItemProps) => {
  // todo: show loader
  const [, setIsLoading] = useState(false);
  const subtasks = useLastCompletedSubtask(assignment.id);
  const hasSubtasks = assignment.subtasks && assignment.subtasks.length > 0;
  const allSubtasksCompleted = hasSubtasks ? subtasks.lastIndex >= (assignment.subtasks?.length ?? -1) : true;
  const [subtasksVisible, setSubtasksVisible] = useState(subtasks.lastIndex > 0);
  const showExpandSubtasksButton = hasSubtasks && !subtasksVisible;
  const showCompleteTasksButton = !hasSubtasks || allSubtasksCompleted;

  const handleCompleteClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Assignment) => {
      setIsLoading(true);
      try {
        if (showExpandSubtasksButton) {
          setSubtasksVisible(true);
          return;
        }

        if (allSubtasksCompleted) {
          if (
            isDone &&
            !confirm(`"${assignment.title}" is not assigned to you. Are you sure you want to complete it?`)
          ) {
            return;
          }

          const result = await completeAssignment(chore.id);
          if (result) {
            toast.success(result);
          } else {
            toast.success(`Task completed`);
          }
          subtasks.clear();
          onComplete && onComplete();
        } else {
          subtasks.complete();
        }
      } catch (ex: any) {
        toast.error(`Could not complete chore (${ex?.statusText})`);
      } finally {
        setIsLoading(false);
      }
    },
    [allSubtasksCompleted, assignment, subtasksVisible]
  );

  const handleUndoClick = useCallback(
    async (chore: Assignment) => {
      setIsLoading(true);
      try {
        await undoAssignment(chore.id);
        toast.info(`Undo complete`);
        subtasks.clear();
        onComplete && onComplete();
      } catch (ex: any) {
        const message = await ex?.text();
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [assignment]
  );

  const handleSendReminderClick = useCallback(
    async (chore: Assignment) => {
      setIsLoading(true);
      await sendReminder(chore.id);
      setIsLoading(false);
      toast.success(`Reminder sent`);
      onComplete && onComplete();
    },
    [assignment]
  );

  const { dueString, isLate } = useMemo(() => parseDueDate(assignment), [assignment]);

  const buttons = useMemo(
    () => [
      {
        label: '⏪ Undo',
        onClick: () => handleUndoClick(assignment),
      },
      {
        label: '🔔 Send reminder',
        onClick: () => handleSendReminderClick(assignment),
      },
      {
        label: '🧽 Clear subtasks',
        onClick: () => {
          subtasks.clear();
          setSubtasksVisible(false);
        },
      },
    ],
    [handleUndoClick, handleSendReminderClick, subtasks, setSubtasksVisible]
  );

  return (
    <div className="flex flex-col justify-between min-h-[6rem] bg-teal-500 rounded px-2 py-2 drop-shadow relative mb-4">
      <span className="text-white text-2xl font-black">{assignment.title}</span>
      <Transition
        as="div"
        className="mt-3 ml-1 overflow-hidden"
        show={subtasksVisible}
        enter="transition-all duration-300"
        enterFrom="max-h-0"
        enterTo="max-h-56"
        leave="transition-all duration-300"
        leaveFrom="max-h-56"
        leaveTo="max-h-0"
      >
        {assignment?.subtasks?.map((subtask, i) => {
          return (
            <div
              className="flex items-center pb-[0.4rem] cursor-pointer"
              key={subtask}
              onClick={() => subtasks.complete(i >= subtasks.lastIndex ? i + 1 : i)}
            >
              <input type="checkbox" readOnly checked={i < subtasks.lastIndex} className="rounded w-4 h-4" />
              <span className="text-white ml-1">{subtask}</span>
            </div>
          );
        })}
      </Transition>
      <span
        className={classNames('text-white self-center rounded px-2 py-1', {
          'bg-rose-500 shadow font-bold': isLate,
          'opacity-80': !isLate,
        })}
      >
        {dueString}
      </span>
      <Dropdown className="absolute top-0 right-0 mr-2 mt-2 z-20" buttons={buttons}>
        {menuIcon}
      </Dropdown>
      <div
        onClick={(e: React.MouseEvent<HTMLElement>) => handleCompleteClick(e, assignment)}
        className="absolute text-teal-500 bottom-0 right-0 mr-2 mb-2 bg-white hover:opacity-80 rounded-full shadow px-2 py-2 hover:cursor-pointer"
      >
        {showExpandSubtasksButton ? (
          chevronDoubleDownIcon
        ) : showCompleteTasksButton ? (
          checkIcon
        ) : (
          <span>
            {subtasks.lastIndex}/{assignment.subtasks!.length}
          </span>
        )}
      </div>
    </div>
  );
};
