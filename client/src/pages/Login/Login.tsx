import { type FormEvent, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);

      const { data } = await axios.post(`${BACKEND_URL}/api/users/login`, {
        email: email.trim(),
        password,
      });

      const token =
        data?.token ||
        data?.accessToken ||
        data?.access_token ||
        data?.user?.token ||
        data?.user?.accessToken;

      if (typeof token !== 'string' || !token) {
        setError('Login succeeded, but no authentication token was returned.');
        return;
      }

      localStorage.setItem('token', token);
      signIn(data);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Login failed. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="brand" aria-label="Spoonful">
          <span>Spoonful</span>
        </div>

        <header className="login-heading">
          <h1 id="login-title">Welcome Back!</h1>
          <p>Log in to your account to continue</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <div className="password-label-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button className="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link className="signup-button" to="/signup">
          Create an Account
        </Link>

        <Link className="guest-explore-link" to="/explore">
          Explore Recipes without Logging In
        </Link>

        <Link className="guest-explore-link" to="/ai-assistant">
          Ask the AI Assistant
        </Link>
      </section>
    </main>
  );
}
