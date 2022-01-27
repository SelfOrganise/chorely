import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { completeAssignment, sendReminder, undoAssignment } from 'srcRootDir/services/chores';
import {
  Box,
  Menu,
  MenuItem,
  Paper,
  IconButton,
  LinearProgress,
  Typography,
  Fab,
  darken,
  lighten,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import CheckIcon from '@mui/icons-material/Check';
import { formatDistance, parseISO } from 'date-fns';

const cardColors = [
  { background: '#ff6f75', color: 'white' },
  { background: '#46c2a6', color: 'white' },
  { background: '#ff70a8', color: 'white' },
  { background: '#dd8d7f', color: 'white' },
  { background: '#ff875d', color: 'white' },
  { background: '#4bb7dd', color: 'white' },
  { background: '#ffe162', color: '#867734' },
  { background: '#9ccc65', color: 'white' },
  { background: '#ba68c8', color: 'white' },
].map(c => ({
  ...c,
  fabBackground: lighten(c.background, 0.85),
  fabColor: darken(c.background, 0.3),
}));

export const ChoreListItem = React.forwardRef(
  (
    {
      chore,
      onComplete,
      isDone,
      style,
    }: { chore: Assignment; onComplete?: () => void; isDone: boolean; style?: React.CSSProperties },
    ref: any
  ) => {
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
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
          const result = await completeAssignment(chore.id);
          if (result) {
            toast.success(result);
          } else {
            toast.success(`Task completed`);
          }
          onComplete && onComplete();
        } catch (ex: any) {
          toast.error(`Could not complete chore (${ex?.statusText})`);
        } finally {
          setIsLoading(false);
        }
      },
      [chore]
    );

    const handleUndoClick = useCallback(
      async (e: React.MouseEvent<HTMLElement>, chore: Assignment) => {
        setIsLoading(true);
        handleMenuClose(e);
        try {
          await undoAssignment(chore.id);
          toast.info(`Undo complete`);
          onComplete && onComplete();
        } catch (ex: any) {
          const message = await ex?.text();
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      },
      [chore]
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
      [chore]
    );

    const colors = cardColors[chore.id % cardColors.length];

    return (
      <Paper
        style={style}
        ref={ref}
        elevation={1}
        sx={{
          height: '6rem',
          background: colors.background,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontSize: 24 }} fontWeight={800} color={colors.color} paddingLeft={1} paddingTop={1}>
          {chore.title}
        </Typography>
        <Box display="flex" justifyContent="center">
          <Typography sx={{ fontSize: 12 }} fontWeight={300} color={colors.color} paddingBottom={1}>
            last done {formatDistance(parseISO(chore.due_by_utc), new Date())} ago
          </Typography>
        </Box>
        <IconButton
          sx={{ position: 'absolute', bottom: 0, left: 0 }}
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        >
          {open ? <MenuOpenIcon sx={{ color: colors.color }} /> : <MenuIcon sx={{ color: colors.color }} />}
          <Menu open={open} onClose={handleMenuClose} anchorEl={anchorEl}>
            <MenuItem disabled={isLoading} onClick={(e: React.MouseEvent<HTMLElement>) => handleUndoClick(e, chore)}>
              ⏪ Undo
            </MenuItem>
            <MenuItem
              disabled={!isDone || isLoading}
              onClick={(e: React.MouseEvent<HTMLElement>) => handleSendReminderClick(e, chore)}
            >
              🔔 Send reminder
            </MenuItem>
          </Menu>
        </IconButton>
        <Fab
          onClick={(e: React.MouseEvent<HTMLElement>) => handleCompleteClick(e, chore)}
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
          <CheckIcon />
        </Fab>
        {isLoading && <LinearProgress />}
      </Paper>
    );
  }
);

// function convertCompletionSemaphoreToCount(completionSemaphore: number) {
//   const alignment = completionSemaphore >= 0 ? 1 : 0;
//
//   const count = Math.abs(completionSemaphore) + alignment;
//   return count > 1 ? `(${count})` : '';
// }
