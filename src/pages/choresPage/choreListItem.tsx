import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { completeChore } from 'srcRootDir/services/chores';
import styled from '@emotion/styled';

export function ChoreListItem({ chore, onComplete }: { chore: Chore; onComplete?: () => void }) {
  const [showSecondaryText, setShowSecondaryText] = useState(false);

  const handleCompleteClick = useCallback(async (chore: Chore) => {
    toast.success(`Completed « ${chore.title} »`);
    await completeChore(chore.id);
    onComplete && onComplete();
  }, []);

  const title = useMemo(() => {
    const description = chore.description ? '…' : '';
    const count = convertCompletionSemaphoreToCount(chore.completionSemaphore);
    if (count > 1) {
      return `${chore.title}${description} (${count})`;
    } else {
      return `${chore.title}${description}`;
    }
  }, [chore]);

  return (
    <ListItem
      onClick={() => setShowSecondaryText(!showSecondaryText)}
      secondaryAction={
        <IconButton onClick={() => handleCompleteClick(chore)}>
          <CheckIcon />
        </IconButton>
      }
    >
      <ListItemText
        primary={title}
        secondary={showSecondaryText && chore.description ? <Description>{chore.description}</Description> : undefined}
      />
    </ListItem>
  );
}

function convertCompletionSemaphoreToCount(completionSemaphore: number) {
  const alignment = completionSemaphore >= 0 ? 1 : 0;

  return Math.abs(completionSemaphore) + alignment;
}

const Description = styled.span`
  white-space: pre;
`;
