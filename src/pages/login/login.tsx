import styled from '@emotion/styled';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from 'srcRootDir/services/auth';
import { toast } from 'react-toastify';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  const handleLogin = useCallback(async () => {
    if (await login(username)) {
      navigate('/chores');
    } else {
      toast.error('Could not login', { toastId: 'couldNotLogin' });
    }
  }, [username]);

  return (
    <Box display="flex" height="100vh" alignItems="center" justifyContent="center">
      <Centered>
        <StyledTextField
          label="Username"
          required={true}
          onChange={v => setUsername(v.target.value)}
          value={username}
        />
        <Button disabled={!username} variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </Centered>
    </Box>
  );
}

const Centered = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 1rem;
`;
