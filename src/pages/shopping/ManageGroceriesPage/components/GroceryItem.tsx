import { Fab, Paper, Typography } from '@mui/material';
import React from 'react';
import { cardColors } from 'srcRootDir/services/cardColors';
import AddIcon from '@mui/icons-material/Add';

interface GroceryItemProps {
  item: Grocery;
  onAdd: (item: Grocery) => void;
}

export function GroceryItem({ item, onAdd }: GroceryItemProps) {
  const colors = cardColors[item.id % cardColors.length];

  return (
    <Paper
      elevation={1}
      sx={{
        minHeight: '4rem',
        background: colors.background,
        position: 'relative',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        pl: 1.5,
        pr: 1.5,
      }}
    >
      <Typography sx={{ fontSize: 24 }} flexGrow={1} fontWeight={800} color={colors.color}>
        {item.name}
      </Typography>
      <Fab
        onClick={(e: React.MouseEvent<HTMLElement>) => onAdd(item)}
        size="small"
        sx={{
          color: colors.fabColor,
          background: `linear-gradient(0, ${colors.fabBackground} 0%, white 100%)`,
          boxShadow: '0px 2px 2px -1px rgb(0 0 0 / 20%)',
        }}
        aria-label="like"
      >
        <AddIcon />
      </Fab>
    </Paper>
  );
}
