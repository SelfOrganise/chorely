import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { completeChore, undoChore } from 'srcRootDir/services/chores';
import styled from '@emotion/styled';
import { Box, Button, Menu, MenuItem, Paper, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const open = Boolean(anchorEl);

  const handleCompleteClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Chore) => {
      e.stopPropagation();
      await completeChore(chore.id);
      toast.success(`${chore.title}`);
      onComplete && onComplete();
    },
    [chore]
  );

  const handleUndoClick = useCallback(
    async (e: React.MouseEvent<HTMLElement>, chore: Chore) => {
      e.stopPropagation();
      await undoChore(chore.id);
      toast.warn(`Undo « ${chore.title} »`);
      onComplete && onComplete();
    },
    [chore]
  );

  return (
    <Paper elevation={3} sx={{ margin: 2 }}>
      <Box
        display="flex"
        marginTop={1}
        height="100px"
        style={{
          backgroundImage: ` linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),url(/images/${chore.id}.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        <Box paddingLeft={1.2} paddingRight={1.2} paddingTop={1.2}>
          <Title>{chore.title}</Title>
        </Box>
        <Box marginTop={0.5} display="flex" flexDirection="row" justifyContent="space-between">
          <Box>{/*<TimeLeft>nothing</TimeLeft>*/}</Box>
        </Box>
        <Box position="absolute" top="0.3rem" right="0.5rem">
          <LastModified>last done {formatDistance(parseISO(chore.modifiedOnUTC), new Date())}</LastModified>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center" paddingBottom={0.2}>
        <Button
          variant="text"
          onClick={(e: React.MouseEvent<HTMLElement>) => handleCompleteClick(e, chore)}
          startIcon={<CheckIcon />}
          style={{
            color: isDone ? 'gray' : undefined,
          }}
        >
          Complete
        </Button>
        <IconButton
          sx={{ position: 'absolute', right: '0.5rem' }}
          onClick={(e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
        >
          <MoreVertIcon />
          <Menu
            open={open}
            onClose={(e: React.MouseEvent<HTMLElement>) => {
              e.stopPropagation();
              setAnchorEl(null);
            }}
            anchorEl={anchorEl}
          >
            <MenuItem onClick={(e: React.MouseEvent<HTMLElement>) => handleUndoClick(e, chore)}>Undo</MenuItem>
            <MenuItem disabled>Send reminder</MenuItem>
          </Menu>
        </IconButton>
      </Box>
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
  color: lightgray;
`;

// const TimeLeft = styled.span`
//   font-size: 0.8rem;
//   color: gray;
// `;

// function convertCompletionSemaphoreToCount(completionSemaphore: number) {
//   const alignment = completionSemaphore >= 0 ? 1 : 0;
//
//   return Math.abs(completionSemaphore) + alignment;
// }
