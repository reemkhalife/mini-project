import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(''); // For storing the 2FA token
  const [is2fa, setIs2fa] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpAuthUrl, setOtpAuthUrl] = useState('');  
  const navigate = useNavigate();

  useEffect(() => {
    if (secret) {
      const url = `otpauth://totp/MyApp:${email}?secret=${secret}&issuer=MyApp`;
      setOtpAuthUrl(url);
    }
  }, [secret, email]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:7000/api/auth/login', { email, password, token });
      if (res.data.secret) {
        setIs2fa(true);
        setSecret(res.data.secret);
      } else {
        localStorage.setItem('token', res.data.token);
        navigate('/dashboard'); // or any protected route
      }
    } catch (err) {
      alert(err.response?.data || 'Login failed');
    }
  };

  const handleTwoFactor = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:7000/api/auth/login', { email, password, token });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard'); // or any protected route
    } catch (err) {
      alert(err.response?.data || '2FA verification failed');
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>

      {is2fa && (
        <div>
          <h3>Scan QR in Google Authenticator:</h3>
          {otpAuthUrl && <QRCodeSVG value={otpAuthUrl} size={200} />}
          <form onSubmit={handleTwoFactor}>
            <input
              type="text"
              placeholder="Enter 2FA code"
              value={token}
              onChange={e => setToken(e.target.value)}
              required
            />
            <button type="submit">Verify 2FA</button>
          </form>
        </div>
      )}
    </div>
  );
}
