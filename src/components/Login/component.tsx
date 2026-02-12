import { useState } from 'react';
import { User, Lock, Navigation } from 'lucide-react';
import type { LoginProps } from './types';
import styles from './styles.module.scss';

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  const handleQuickLogin = () => {
    onLogin('Demo User');
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <Navigation />
          </div>
          <h1 className={styles.title}>Car Navigation</h1>
          <p className={styles.subtitle}>Sign in to start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className={styles.fieldLabel}>Username</label>
            <div className={styles.inputWrapper}>
              <User />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={styles.input}
              />
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            Sign In
          </button>
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine}>
            <div className={styles.dividerBorder}>
              <div className={styles.dividerBorderInner} />
            </div>
            <div className={styles.dividerText}>
              <span className={styles.dividerTextInner}>Or</span>
            </div>
          </div>

          <button onClick={handleQuickLogin} className={styles.guestButton}>
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
