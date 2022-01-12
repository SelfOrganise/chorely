import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { completeChore, sendReminder, undoChore } from 'srcRootDir/services/chores';
import styled from '@emotion/styled';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Paper,
  IconButton,
  Chip,
  LinearProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { formatDistance, parseISO } from 'date-fns';

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

  return (
    <Paper elevation={3} sx={{ margin: 4 }}>
      <Box
        display="flex"
        height="80px"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 34%, rgba(0,0,0,0.2) 43%, rgba(0,0,0,0.8) 100%), url(images/${chore.id}.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        alignItems="flex-end"
        justifyContent="start"
        position="relative"
      >
        <Box paddingLeft={1} paddingBottom={1}>
          <Title>{chore.title}</Title>
        </Box>
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
        <Box position="absolute" top="0.3rem" right="0.5rem">
          <LastModified>last done {formatDistance(parseISO(chore.modifiedOnUTC), new Date())} ago</LastModified>
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between">
        <IconButton onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}>
          {open ? <MenuOpenIcon /> : <MenuIcon />}
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
        <Button
          disabled={isLoading}
          variant="text"
          onClick={(e: React.MouseEvent<HTMLElement>) => handleCompleteClick(e, chore)}
          style={{
            color: isDone ? 'gray' : undefined,
          }}
        >
          ✔ Complete {convertCompletionSemaphoreToCount(chore.completionSemaphore)}
        </Button>
      </Box>
      {isLoading && <LinearProgress />}
    </Paper>
  );
}

const Title = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
`;

const LastModified = styled.span`
  font-size: 0.8rem;
  color: #ededed;
`;

function convertCompletionSemaphoreToCount(completionSemaphore: number) {
  const alignment = completionSemaphore >= 0 ? 1 : 0;

  const count = Math.abs(completionSemaphore) + alignment;
  return count > 1 ? `(${count})` : '';
}
