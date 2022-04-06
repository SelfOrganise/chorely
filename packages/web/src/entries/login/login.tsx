import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button, TextField } from 'srcRootDir/common/components';

import { login } from './services/auth';

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
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col w-64">
        <TextField
          className="w-full"
          placeholder="email@domain.com"
          required={true}
          onChange={v => setUsername(v.target.value?.toLowerCase())}
          value={username}
        />
        <Button
          disabled={!username}
          onClick={handleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 disabled:bg-gray-400 rounded"
        >
          Login
        </Button>
      </div>
    </div>
  );
}
