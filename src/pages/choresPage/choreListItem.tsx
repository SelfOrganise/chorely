import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { completeChore, sendReminder, undoChore } from 'srcRootDir/services/chores';
import {
  Box,
  Menu,
  MenuItem,
  Paper,
  IconButton,
  Chip,
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
  { background: '#ffe162', color: '#857862' },
].map(c => ({
  ...c,
  fabBackground: lighten(c.background, 0.85),
  fabColor: darken(c.background, 0.3),
}));

export function ChoreListItem({
  chore,
  onComplete,
  isDone,
}: {
  chore: Chore;
  onComplete?: () => void;
  isDone: boolean;
}) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuClose = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
  }, []);

  const handleCompleteClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Chore) => {
      setIsLoading(true);
      handleMenuClose(e);
      await completeChore(chore.id);
      setIsLoading(false);
      toast.success(`Task completed`);
      onComplete && onComplete();
    },
    [chore]
  );

  const handleUndoClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Chore) => {
      setIsLoading(true);
      handleMenuClose(e);
      await undoChore(chore.id);
      setIsLoading(false);
      toast.info(`Undo complete`);
      onComplete && onComplete();
    },
    [chore]
  );

  const handleSendReminderClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Chore) => {
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
      <Typography sx={{ fontSize: 24 }} fontWeight={300} color={colors.color} paddingLeft={1} paddingTop={1}>
        {chore.title}
      </Typography>
      {false && chore.isLate && (
        <Box position="absolute" top="0.5rem" left="0.5rem">
          <Chip
            sx={{ fontSize: '0.8rem', height: '1.2rem', opacity: 0.8 }}
            color="error"
            size="small"
            label="Late task warning"
          />
        </Box>
      )}
      <Box display="flex" justifyContent="center">
        <Typography sx={{ fontSize: 12 }} fontWeight={300} color={colors.color} paddingBottom={1}>
          last done {formatDistance(parseISO(chore.modifiedOnUTC), new Date())} ago
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

// function convertCompletionSemaphoreToCount(completionSemaphore: number) {
//   const alignment = completionSemaphore >= 0 ? 1 : 0;
//
//   const count = Math.abs(completionSemaphore) + alignment;
//   return count > 1 ? `(${count})` : '';
// }
