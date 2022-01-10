import IconButton from '@mui/material/IconButton';
import CheckIcon from '@mui/icons-material/Check';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { completeChore } from 'srcRootDir/services/chores';
import styled from '@emotion/styled';

export function ChoreListItem({ chore, onComplete }: { chore: Chore; onComplete?: () => void }) {
  const [showSecondaryText, setShowSecondaryText] = useState(false);

  const handleCompleteClick = useCallback(async (chore: Chore) => {
    toast.success(`Completed '${chore.title}'`);
    await completeChore(chore.id);
    onComplete && onComplete();
  }, []);

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
        primary={`${chore.title}${chore.description ? '…' : ''}`}
        secondary={showSecondaryText && chore.description ? <Description>{chore.description}</Description> : undefined}
      />
    </ListItem>
  );
}

const Description = styled.span`
  white-space: pre;
`;
