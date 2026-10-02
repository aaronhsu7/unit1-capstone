import { type FormEvent, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(`${BACKEND_URL}/api/users/signup`, {
        email: email.trim(),
        password,
      });

      navigate('/login', { replace: true });
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ||
            'Account creation failed. Please try again.',
        );
      } else {
        setError('Account creation failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <section className="signup-card" aria-labelledby="signup-title">
        <div className="signup-brand">
          <span className="signup-brand-mark">ʃ</span>
          <span>poonful</span>
        </div>

        <h1 id="signup-title">
          Create an
          <br />
          Account
        </h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            placeholder="Email"
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
          />

          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            placeholder="Password"
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <button
          className="cancel-button"
          type="button"
          onClick={() => navigate('/login')}
        >
          Cancel
        </button>
      </section>
    </main>
  );
}
