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
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="flex flex-col w-64">
        <input
          className="input"
          type="text"
          placeholder="email@domain.com"
          required={true}
          onChange={v => setUsername(v.target.value?.toLowerCase())}
          value={username}
        />
        <button disabled={!username} onClick={handleLogin} className="button">
          Login
        </button>
      </div>
    </div>
  );
}
