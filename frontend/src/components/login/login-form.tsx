'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
} from 'react';
import { Icon } from '@/design-system';
import { useAppDispatch, notifySuccess, notifyError, notifyInfo } from '@/store';

type AuthMode = 'standard' | 'director';

interface FieldState {
  value: string;
  error: string;
  touched: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface StepLoginFieldHeroProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

const StepLoginFieldHero: React.FC<StepLoginFieldHeroProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  autoFocus,
  suffix,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="step-field-hero">
      <label htmlFor={id} className="step-label-hero">
        {label}
      </label>
      <div
        className={`step-control-hero${focused ? ' step-control-hero--focused' : ''}${
          error ? ' step-control-hero--error' : ''
        }`}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          className="step-input-hero"
          aria-invalid={Boolean(error)}
        />
        {suffix && suffix}
      </div>
    </div>
  );
};

/**
 * Precision Keypad Component for Director PIN Mode
 */
interface DirectorKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  masked?: boolean;
  error?: string;
}

const DirectorKeypad: React.FC<DirectorKeypadProps> = ({
  value,
  onChange,
  onComplete,
  masked = false,
  error,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleDigitChange = (index: number, digitVal: string) => {
    const cleaned = digitVal.replace(/\D/g, '');
    if (!cleaned && digitVal !== '') return;

    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    const newValue = newDigits.join('');

    onChange(newValue);

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onComplete(value);
    } else if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 5);
    inputRefs.current[targetIdx]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="hero-pin-grid">
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          return (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type={masked && isFilled ? 'password' : 'text'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`PIN Digit ${idx + 1}`}
              className={`hero-pin-cell${isFilled ? ' hero-pin-cell--filled' : ''}${
                error ? ' hero-pin-cell--error' : ''
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();

  // Mouse spotlight coordinates
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<AuthMode>('standard');

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState<FieldState>({ value: '', error: '', touched: false });
  const [password, setPassword] = useState<FieldState>({ value: '', error: '', touched: false });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [capsLock, setCapsLock] = useState(false);

  const [pin, setPin] = useState('');
  const [pinMasked, setPinMasked] = useState(true);

  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    setSpotlightPos({ x: e.clientX, y: e.clientY });
  };

  const switchMode = useCallback((next: AuthMode) => {
    setMode(next);
    if (next === 'standard') setPin('');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'director') switchMode('standard');
      if (typeof e.getModifierState === 'function') {
        setCapsLock(e.getModifierState('CapsLock'));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mode, switchMode]);

  const validateEmail = () => {
    if (!email.value.trim()) return 'Corporate email is required.';
    if (!EMAIL_RE.test(email.value)) return 'Enter a valid corporate email address.';
    return '';
  };

  const validatePassword = () => {
    if (!password.value) return 'Password is required.';
    if (password.value.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 520);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eErr = validateEmail();
    const pErr = validatePassword();
    setEmail((s) => ({ ...s, error: eErr, touched: true }));
    setPassword((s) => ({ ...s, error: pErr, touched: true }));

    if (eErr || pErr) {
      triggerShake();
      dispatch(notifyError({ title: 'Authentication Failed', description: eErr || pErr }));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      dispatch(notifySuccess({ title: 'Welcome back', description: 'Redirecting to your workspace…' }));
    }, 1600);
  };

  const handlePinComplete = useCallback(
    (v: string) => {
      if (v.length < 6) {
        triggerShake();
        dispatch(notifyError({ title: 'Invalid PIN', description: 'Please enter all 6 digits of your security PIN.' }));
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        dispatch(
          notifySuccess({
            title: 'Director clearance verified',
            description: 'Accessing governance workspace…',
          })
        );
      }, 1500);
    },
    [dispatch]
  );

  const handleForgot = () => {
    dispatch(
      notifyInfo({
        title: 'Contact IT Support',
        description: 'Ask your system administrator to reset your credentials.',
      })
    );
  };

  return (
    <div className="step-login-viewport" onMouseMove={handleMouseMove}>
      {/* Animated Grid Background */}
      <div className="step-login-bg" aria-hidden="true">
        <div className="step-animated-grid" />
        <div className="step-grid-pulse" />
        <div
          className="step-login-spotlight"
          style={{ left: `${spotlightPos.x}px`, top: `${spotlightPos.y}px` }}
        />
      </div>

      {/* Anchored Hero Surface (640px Wide) */}
      <div className="flip-scene">
        <div
          className={`flip-card-inner${mode === 'director' ? ' flip-card-inner--flipped' : ''}${
            shake ? ' flip-card-inner--shake' : ''
          }`}
        >
          {/* FRONT FACE: Standard Email & Password Sign In */}
          <main className="flip-face flip-face--front" role="main">
            <header className="step-hero-header">
              <div className="step-status-bar">
                <div className="step-brand-hero">
                  <span className="step-brand-logo-mark" aria-label="STEP">
                    S
                  </span>
                  <span className="step-brand-name-hero">STEP</span>
                </div>
                <span className="step-system-badge">Enterprise Platform</span>
              </div>

              <div className="step-hero-title-group">
                <h1 className="step-hero-title">Welcome back.</h1>
                <p className="step-hero-subtitle">
                  Sign in to continue to your workspace.
                </p>
              </div>
            </header>

            <form className="step-form-hero" onSubmit={handleSubmit} noValidate>
              <StepLoginFieldHero
                id={emailId}
                label="Corporate Email"
                type="email"
                value={email.value}
                onChange={(v) => {
                  setEmail((s) => ({
                    ...s,
                    value: v,
                    error: s.touched ? (EMAIL_RE.test(v) ? '' : 'Enter a valid email address.') : '',
                  }));
                }}
                onBlur={() => setEmail((s) => ({ ...s, error: validateEmail(), touched: true }))}
                error={email.error}
                placeholder="you@sthapatya.com"
                autoComplete="email"
                autoFocus={mode === 'standard'}
              />

              <StepLoginFieldHero
                id={passwordId}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password.value}
                onChange={(v) => {
                  setPassword((s) => ({
                    ...s,
                    value: v,
                    error: s.touched ? (v.length >= 6 ? '' : 'Must be at least 6 characters.') : '',
                  }));
                }}
                onBlur={() => setPassword((s) => ({ ...s, error: validatePassword(), touched: true }))}
                error={password.error}
                placeholder="••••••••••••"
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    className="step-eye-hero"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icon name={showPassword ? 'unlock' : 'lock'} size="sm" />
                  </button>
                }
              />

              {capsLock && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d97706]">
                  <Icon name="alert-triangle" size="xs" />
                  <span>Caps Lock is on</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={remember}
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                      remember
                        ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white'
                        : 'border-[var(--border-strong)] bg-white'
                    }`}
                    onClick={() => setRemember((v) => !v)}
                  >
                    {remember && <Icon name="check" size="xs" className="text-white" />}
                  </button>
                  <span>Remember session</span>
                </label>
                <button
                  type="button"
                  className="hover:text-[var(--text-primary)] font-semibold transition-colors"
                  onClick={handleForgot}
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} className="step-btn-hero">
                {loading ? (
                  <>
                    <Icon name="loader" size="sm" className="animate-spin" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>

              {/* Glowing Shield Pill Badge */}
              <div className="pt-2 border-t border-slate-200/60 flex justify-center">
                <button
                  type="button"
                  className="director-btn-pill"
                  onClick={() => switchMode('director')}
                >
                  <Icon name="shield" size="xs" />
                  <span>Director PIN Access</span>
                </button>
              </div>
            </form>
          </main>

          {/* BACK FACE: Director Security PIN Keypad */}
          <main className="flip-face flip-face--back" role="main">
            <header className="step-hero-header">
              <div className="step-status-bar">
                <div className="step-brand-hero">
                  <span className="step-brand-logo-mark" aria-label="STEP">
                    S
                  </span>
                  <span className="step-brand-name-hero">STEP</span>
                </div>
                <span className="step-system-badge">Director Mode</span>
              </div>

              <div className="step-hero-title-group">
                <h1 className="step-hero-title">Director access.</h1>
                <p className="step-hero-subtitle">
                  Enter your 6-digit security PIN to continue.
                </p>
              </div>
            </header>

            <div className="flex flex-col items-center gap-6">
              <button
                className="self-start inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={() => switchMode('standard')}
              >
                <Icon name="arrow-left" size="xs" />
                <span>Standard Sign In</span>
              </button>

              <div className="w-full">
                <DirectorKeypad
                  value={pin}
                  onChange={setPin}
                  onComplete={handlePinComplete}
                  masked={pinMasked}
                />
              </div>

              <div className="flex items-center justify-between w-full text-xs text-[var(--text-tertiary)]">
                <button
                  type="button"
                  className="hover:text-[var(--text-secondary)] font-medium transition-colors inline-flex items-center gap-1.5"
                  onClick={() => setPinMasked((v) => !v)}
                >
                  <Icon name={pinMasked ? 'unlock' : 'lock'} size="xs" />
                  <span>{pinMasked ? 'Show digits' : 'Mask digits'}</span>
                </button>
                {pin.length > 0 && (
                  <button
                    type="button"
                    className="hover:text-[var(--text-secondary)] font-medium transition-colors"
                    onClick={() => setPin('')}
                  >
                    Clear digits
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={loading}
                className="step-btn-hero"
                onClick={() => handlePinComplete(pin)}
              >
                {loading ? (
                  <>
                    <Icon name="loader" size="sm" className="animate-spin" />
                    <span>Verifying clearance…</span>
                  </>
                ) : (
                  <span>Verify Security PIN</span>
                )}
              </button>

              <p className="text-xs text-slate-400">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] font-semibold text-slate-700">Esc</kbd> to return
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
