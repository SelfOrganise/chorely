import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Menu, MenuItem, Paper, IconButton, LinearProgress, Typography, Fab } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import CheckIcon from '@mui/icons-material/Check';
import CircleIcon from '@mui/icons-material/Circle';
import Collapse from '@mui/material/Collapse';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

import { completeAssignment, sendReminder, undoAssignment } from 'srcRootDir/services/chores';
import { useLastCompletedSubtask } from 'srcRootDir/hooks/useLastCompletedSubtask';
import { parseDueDate } from 'srcRootDir/services/parseDueDate';
import { cardColors } from 'srcRootDir/services/cardColors';

interface ChoreListItemProps {
  assignment: Assignment;
  onComplete?: () => void;
  isDone: boolean;
  style?: React.CSSProperties;
}

export const ChoreListItem = React.forwardRef(
  ({ assignment, onComplete, isDone, style }: ChoreListItemProps, ref: any) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const subtasks = useLastCompletedSubtask(assignment.id);
    const hasSubtasks = assignment.subtasks && assignment.subtasks.length > 0;
    const allSubtasksCompleted = hasSubtasks ? subtasks.lastIndex >= (assignment.subtasks?.length ?? -1) : true;
    const [subtasksVisible, setSubtasksVisible] = useState(subtasks.lastIndex > 0);
    const showExpandSubtasksButton = hasSubtasks && !subtasksVisible;
    const showCompleteTasksButton = !hasSubtasks || allSubtasksCompleted;
    const open = Boolean(anchorEl);

    const handleMenuClose = useCallback((e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      setAnchorEl(null);
    }, []);

    const handleCompleteClick = useCallback(
      async (e: React.MouseEvent<HTMLElement>, chore: Assignment) => {
        setIsLoading(true);
        handleMenuClose(e);
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
      async (e: React.MouseEvent<HTMLElement>, chore: Assignment) => {
        setIsLoading(true);
        handleMenuClose(e);
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
      async (e: React.MouseEvent<HTMLElement>, chore: Assignment) => {
        setIsLoading(true);
        handleMenuClose(e);
        await sendReminder(chore.id);
        setIsLoading(false);
        toast.success(`Reminder sent`);
        onComplete && onComplete();
      },
      [assignment]
    );

    const colors = cardColors[assignment.id % cardColors.length];

    const { dueString, isLate } = useMemo(() => parseDueDate(assignment), [assignment]);

    return (
      <Paper
        style={style}
        ref={ref}
        elevation={1}
        sx={{
          minHeight: '6rem',
          background: colors.background,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 24 }} fontWeight={800} color={colors.color} paddingLeft={1} paddingTop={1}>
          {assignment.title}
        </Typography>
        <Collapse in={subtasksVisible}>
          <Box padding="0.5rem 1rem 0 1rem">
            {assignment.subtasks &&
              assignment.subtasks.map((subtask, i) => {
                return (
                  <Box
                    key={subtask}
                    display="flex"
                    alignItems="center"
                    paddingBottom="0.4rem"
                    onClick={() => subtasks.complete(i >= subtasks.lastIndex ? i + 1 : i)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {i >= subtasks.lastIndex ? (
                      <CircleIcon color="disabled" />
                    ) : (
                      <CheckCircleIcon sx={{ opacity: 0.7, color: 'white' }} />
                    )}
                    <Typography paddingLeft="0.2rem" color={colors.color}>
                      {subtask}
                    </Typography>
                  </Box>
                );
              })}
          </Box>
        </Collapse>
        <Box display="flex" justifyContent="center" paddingBottom={1}>
          <Typography
            padding="0 1rem"
            sx={{ fontSize: isLate ? 16 : 12, backgroundColor: isLate ? 'red' : null }}
            fontWeight={isLate ? 800 : 300}
            color={colors.color}
          >
            {dueString}
          </Typography>
        </Box>
        <IconButton
          sx={{ position: 'absolute', top: 0, right: 0 }}
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        >
          {open ? (
            <MenuOpenIcon sx={{ color: colors.color }} />
          ) : (
            <MenuIcon sx={{ color: colors.color, opacity: 0.7 }} />
          )}
          <Menu open={open} onClose={handleMenuClose} anchorEl={anchorEl}>
            <MenuItem
              disabled={!isDone || isLoading}
              onClick={(e: React.MouseEvent<HTMLElement>) => handleUndoClick(e, assignment)}
            >
              ⏪ Undo
            </MenuItem>
            <MenuItem
              disabled={!isDone || isLoading}
              onClick={(e: React.MouseEvent<HTMLElement>) => handleSendReminderClick(e, assignment)}
            >
              🔔 Send reminder
            </MenuItem>
            <MenuItem
              disabled={!hasSubtasks || isLoading}
              onClick={(e: React.MouseEvent<HTMLElement>) => {
                handleMenuClose(e);
                subtasks.clear();
                setSubtasksVisible(false);
              }}
            >
              🧽 Clear subtasks
            </MenuItem>
          </Menu>
        </IconButton>
        <Fab
          onClick={(e: React.MouseEvent<HTMLElement>) => handleCompleteClick(e, assignment)}
          disabled={isLoading}
          size="small"
          sx={{
            position: 'absolute',
            color: colors.fabColor,
            right: 0,
            bottom: 0,
            marginRight: 1,
            marginBottom: 1,
            background: `linear-gradient(0, ${colors.fabBackground} 0%, white 100%)`,
            boxShadow: '0px 2px 2px -1px rgb(0 0 0 / 20%)',
          }}
          aria-label="like"
        >
          {showExpandSubtasksButton ? (
            <KeyboardDoubleArrowDownIcon />
          ) : showCompleteTasksButton ? (
            <CheckIcon />
          ) : (
            <span>
              {subtasks.lastIndex}/{assignment.subtasks!.length}
            </span>
          )}
        </Fab>
        {isLoading && <LinearProgress />}
      </Paper>
    );
  }
);
