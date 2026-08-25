'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '@/design-system';
import { useAppDispatch, setCredentials, notifySuccess, notifyError, notifyInfo } from '@/store';
import { useLoginMutation, useDirectorPinLoginMutation, type ApiEnvelope, type AuthResultData } from '@/store/services/api';
import { useGetDirectorAccessGatewayInfoQuery } from '@/store/services/api';

function extractErrorMessage(err: unknown, fallback: string): string {
  const body = (err as { data?: Partial<ApiEnvelope<unknown>> } | undefined)?.data;
  return body?.message || fallback;
}

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
  id, label, type = 'text', value, onChange, onBlur, error, placeholder, autoComplete, autoFocus, suffix, disabled,
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <label htmlFor={id} style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
        {label}
      </label>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--input-bg)',
          border: `1.5px solid ${error ? 'var(--status-danger)' : focused ? 'var(--accent-indigo)' : 'var(--border-default)'}`,
          borderRadius: '12px',
          boxShadow: error
            ? '0 0 0 4px var(--status-danger-bg)'
            : focused
              ? '0 0 0 4px var(--accent-indigo-dim)'
              : 'none',
          transform: focused && !error ? 'translateY(-1px)' : 'none',
          transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
          overflow: 'hidden',
          animation: error ? 'step-shake 350ms ease-in-out' : undefined,
        }}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          style={{
            flex: 1,
            minWidth: 0,
            height: '52px',
            padding: '0 16px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--text-primary)',
          }}
        />
        {suffix}
      </div>
    </div>
  );
};

interface DirectorKeypadProps {
  value: string;
  onChange: (val: string) => void;
  onComplete: (val: string) => void;
  masked?: boolean;
  error?: string;
}

const DirectorKeypad: React.FC<DirectorKeypadProps> = ({ value, onChange, onComplete, masked = false, error }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 4 }, (_, i) => value[i] || '');

  const handleDigitChange = (index: number, digitVal: string) => {
    const cleaned = digitVal.replace(/\D/g, '');
    if (!cleaned && digitVal !== '') return;
    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    const newValue = newDigits.join('');
    onChange(newValue);
    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newValue.length === 4) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.length >= 4) onComplete(value);
    } else if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 3);
    inputRefs.current[targetIdx]?.focus();
    if (pasted.length === 4) {
      onComplete(pasted);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'clamp(8px, 3vw, 16px)', margin: '10px 0', width: '100%', maxWidth: '100%' }}>
        {digits.map((digit, idx) => {
          const isFilled = Boolean(digit);
          return (
            <input
              key={idx}
              ref={(el) => { inputRefs.current[idx] = el; }}
              type={masked && isFilled ? 'password' : 'text'}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              aria-label={`PIN Digit ${idx + 1}`}
              style={{
                width: 'clamp(46px, 14vw, 62px)',
                height: 'clamp(54px, 16vw, 68px)',
                flexShrink: 1,
                minWidth: '42px',
                textAlign: 'center',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 'clamp(22px, 6vw, 28px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                background: isFilled ? 'var(--surface-3)' : 'var(--input-bg)',
                border: `1.5px solid ${error ? 'var(--status-danger)' : isFilled ? 'var(--accent-indigo)' : 'var(--border-default)'}`,
                borderRadius: '16px',
                boxShadow: error ? '0 0 0 4px var(--status-danger-bg)' : isFilled ? '0 0 0 3px var(--accent-indigo-dim)' : 'var(--shadow-sm)',
                outline: 'none',
                transition: 'all 150ms ease',
                boxSizing: 'border-box',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Short link: /?d=[token]
  const directorShortToken = searchParams?.get('d') || '';

  // Fetch gateway info when a director token is present in the URL
  const { data: gatewayInfoRes } = useGetDirectorAccessGatewayInfoQuery(directorShortToken, {
    skip: !directorShortToken,
  });
  const gatewayInfo = gatewayInfoRes?.data;

  // Derived values from gateway info — used to show candidate context on the PIN face
  const targetCandidateName = gatewayInfo?.candidateName || '';
  const targetCandidateCode = gatewayInfo?.candidateCode || '';
  const targetVacancyTitle = gatewayInfo?.vacancyTitle || '';
  const redirectParam = gatewayInfo?.candidateId ? `/dashboard/candidates/${gatewayInfo.candidateId}` : '';
  const isDirectorLink = Boolean(directorShortToken);
  const isLinkExpired = gatewayInfo?.isExpired ?? false;
  const linkRemainingMinutes = gatewayInfo?.remainingMinutes ?? 0;

  const [login] = useLoginMutation();
  const [directorPinLogin] = useDirectorPinLoginMutation();
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<AuthMode>(isDirectorLink ? 'director' : 'standard');

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

  // Auto-flip to director tab when short token is in URL
  useEffect(() => {
    if (isDirectorLink) setMode('director');
  }, [isDirectorLink]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mode === 'director') switchMode('standard');
      if (typeof e.getModifierState === 'function') setCapsLock(e.getModifierState('CapsLock'));
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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    try {
      const res = await login({ email: email.value, password: password.value }).unwrap();
      dispatch(
        setCredentials({
          token: res.data.accessToken,
          refreshToken: res.data.refreshToken,
          user: {
            id: res.data.user?.id,
            name: `${res.data.user?.firstName || ''} ${res.data.user?.lastName || ''}`.trim(),
            email: res.data.user?.email || '',
            role: res.data.user?.role || '',
            employeeCode: res.data.user?.employeeCode || '',
          },
        })
      );
      dispatch(notifySuccess({ title: 'Welcome back', description: 'Redirecting to your workspace…' }));
      router.push(redirectParam || '/dashboard');
    } catch (err) {
      triggerShake();
      dispatch(notifyError({ title: 'Authentication Failed', description: extractErrorMessage(err, 'Invalid email or password.') }));
    } finally {
      setLoading(false);
    }
  };

  const handlePinComplete = useCallback(
    async (v: string) => {
      if (v.length < 4) {
        triggerShake();
        dispatch(notifyError({ title: 'Invalid PIN', description: 'Please enter your 4-digit security PIN.' }));
        return;
      }
      setLoading(true);
      try {
        const res = await directorPinLogin({ pin: v }).unwrap();
        dispatch(
          setCredentials({
            token: res.data.accessToken,
            refreshToken: res.data.refreshToken,
            user: {
              id: res.data.user?.id,
              name: `${res.data.user?.firstName || ''} ${res.data.user?.lastName || ''}`.trim(),
              email: res.data.user?.email || '',
              role: res.data.user?.role || '',
              employeeCode: res.data.user?.employeeCode || '',
            },
          })
        );
        dispatch(notifySuccess({
          title: 'Director login verified',
          description: redirectParam ? 'Opening candidate review workspace…' : 'Opening candidate review workspace…',
        }));
        router.push(redirectParam || '/dashboard');
      } catch (err) {
        triggerShake();
        dispatch(notifyError({ title: 'Invalid PIN', description: extractErrorMessage(err, 'Invalid Director security PIN (e.g. 1234).') }));
      } finally {
        setLoading(false);
      }
    },
    [dispatch, router, directorPinLogin, redirectParam]
  );

  const handleForgot = () => {
    dispatch(notifyInfo({ title: 'Contact IT Support', description: 'Ask your system administrator to reset your credentials.' }));
  };

  const keyframes = `
    @keyframes grid-flow { 0% { transform: translate(0,0); } 100% { transform: translate(40px,40px); } }
    @keyframes pulse-glow { 0% { transform: translate(-50%,-50%) scale(0.92); opacity:0.6; } 100% { transform: translate(-50%,-50%) scale(1.15); opacity:1; } }
    @keyframes flip-shake { 0%,100%{transform:rotateY(0deg) translateX(0);} 20%{transform:rotateY(0deg) translateX(-8px);} 40%{transform:rotateY(0deg) translateX(8px);} 60%{transform:rotateY(0deg) translateX(-4px);} 80%{transform:rotateY(0deg) translateX(4px);} }
    @keyframes flip-shake-back { 0%,100%{transform:rotateY(180deg) translateX(0);} 20%{transform:rotateY(180deg) translateX(-8px);} 40%{transform:rotateY(180deg) translateX(8px);} 60%{transform:rotateY(180deg) translateX(-4px);} 80%{transform:rotateY(180deg) translateX(4px);} }
  `;

  const flipInnerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    transformStyle: 'preserve-3d',
    transition: 'transform 650ms cubic-bezier(0.34,1.25,0.64,1)',
    willChange: 'transform',
    transform: mode === 'director' ? 'rotateY(180deg)' : 'rotateY(0deg)',
    animation: shake
      ? mode === 'director'
        ? 'flip-shake-back 440ms cubic-bezier(0.36,0.07,0.19,0.97) both'
        : 'flip-shake 440ms cubic-bezier(0.36,0.07,0.19,0.97) both'
      : undefined,
  };

  const faceBase: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--surface-1)',
    border: '1px solid var(--border-default)',
    borderRadius: '24px',
    boxShadow: 'var(--shadow-xl)',
    padding: 'clamp(24px, 5vw, 44px) clamp(16px, 5vw, 48px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  const btnStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '52px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
    color: '#ffffff',
    fontFamily: 'inherit',
    fontSize: '15.5px',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    border: 'none',
    boxShadow: '0 4px 14px rgba(99,102,241,0.28)',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 180ms ease',
    marginTop: '6px',
    overflow: 'hidden',
    opacity: loading ? 0.7 : 1,
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--canvas, #f7f8fb)',
        color: 'var(--text-primary, #0f172a)',
        padding: '40px 20px',
        overflowY: 'auto',
        userSelect: 'none',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
      }}
    >
      <style>{keyframes}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
        <div style={{
          position: 'absolute', inset: '-140px',
          backgroundImage: 'linear-gradient(to right,rgba(99,102,241,0.06) 1px,transparent 1px),linear-gradient(to bottom,rgba(99,102,241,0.06) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
          animation: 'grid-flow 25s linear infinite',
          maskImage: 'radial-gradient(ellipse 85% 80% at 50% 45%,#000 40%,transparent 100%)',
        }} />
        <div style={{
          position: 'absolute', top: '35%', left: '50%',
          width: '750px', height: '750px',
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,rgba(99,102,241,0.015) 50%,transparent 70%)',
          animation: 'pulse-glow 6s ease-in-out infinite alternate',
        }} />
        <div style={{
          position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle at center,rgba(99,102,241,0.06) 0%,transparent 70%)',
          transform: 'translate(-50%,-50%)',
          left: `${spotlightPos.x}px`, top: `${spotlightPos.y}px`,
          transition: 'opacity 300ms ease',
          willChange: 'transform',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '640px', perspective: '1400px' }}>
        <div style={flipInnerStyle}>

          {/* FRONT FACE */}
          <main
            style={{ ...faceBase, position: 'relative', zIndex: 2, transform: 'rotateY(0deg)' }}
            role="main"
          >
            <header style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 900, color: '#ffffff', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>S</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>STEP</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.04em' }}>Sthapatya Talent Excellence Platform</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.15, margin: 0 }}>Welcome back.</h1>
                <p style={{ fontSize: '15.5px', fontWeight: 400, color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>Sign in to continue to your workspace.</p>
              </div>
            </header>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '22px' }} onSubmit={handleSubmit} noValidate>
              <StepLoginFieldHero id={emailId} label="Corporate Email" type="email" value={email.value}
                onChange={(v) => setEmail((s) => ({ ...s, value: v, error: s.touched ? (EMAIL_RE.test(v) ? '' : 'Enter a valid email address.') : '' }))}
                onBlur={() => setEmail((s) => ({ ...s, error: validateEmail(), touched: true }))}
                error={email.error} placeholder="you@sthapatya.com" autoComplete="email" autoFocus={mode === 'standard'} />

              <StepLoginFieldHero id={passwordId} label="Password" type={showPassword ? 'text' : 'password'} value={password.value}
                onChange={(v) => setPassword((s) => ({ ...s, value: v, error: s.touched ? (v.length >= 6 ? '' : 'Must be at least 6 characters.') : '' }))}
                onBlur={() => setPassword((s) => ({ ...s, error: validatePassword(), touched: true }))}
                error={password.error} placeholder="••••••••••••" autoComplete="current-password"
                suffix={
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ paddingRight: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(15,23,42,0.4)', display: 'flex', alignItems: 'center', transition: 'color 120ms ease' }}>
                    <Icon name={showPassword ? 'unlock' : 'lock'} size="sm" />
                  </button>
                } />

              {capsLock && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[#d97706]">
                  <Icon name="alert-triangle" size="xs" /><span>Caps Lock is on</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button type="button" role="checkbox" aria-checked={remember}
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${remember ? 'bg-[var(--accent-indigo)] border-[var(--accent-indigo)] text-white' : 'border-[var(--border-strong)] bg-white'}`}
                    onClick={() => setRemember((v) => !v)}>
                    {remember && <Icon name="check" size="xs" className="text-white" />}
                  </button>
                  <span>Remember session</span>
                </label>
                <button type="button" className="hover:text-[var(--text-primary)] font-semibold transition-colors" onClick={handleForgot}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading} style={btnStyle}>
                {loading ? (<><Icon name="loader" size="sm" className="animate-spin" /><span>Signing in…</span></>) : <span>Continue</span>}
              </button>

              <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(148,163,184,0.2)', display: 'flex', justifyContent: 'center' }}>
                <button type="button" onClick={() => switchMode('director')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 18px', borderRadius: '9999px', fontSize: '13.5px', fontWeight: 600, color: '#4f46e5', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.22)', cursor: 'pointer', transition: 'all 180ms ease', boxShadow: '0 2px 6px rgba(99,102,241,0.1)' }}>
                  <Icon name="shield" size="xs" /><span>Director PIN Access</span>
                </button>
              </div>
            </form>
          </main>

          {/* BACK FACE */}
          <main
            style={{ ...faceBase, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, transform: 'rotateY(180deg)' }}
            role="main"
          >
            <header style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid var(--border-soft)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'linear-gradient(135deg,#4f46e5 0%,#6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', fontWeight: 900, color: '#ffffff', boxShadow: '0 2px 8px rgba(99,102,241,0.25)' }}>S</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1 }}>STEP</span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', background: 'var(--surface-2)', padding: '4px 10px', borderRadius: '9999px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Director Mode</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.035em', lineHeight: 1.15, margin: 0 }}>Director access.</h1>
                <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>Enter your 4-digit security PIN to continue.</p>
              </div>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              {targetCandidateName && (
                <div
                  style={{
                    width: '100%',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'var(--accent-indigo-dim)',
                        color: 'var(--accent-indigo)',
                        fontWeight: 700,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(99,102,241,0.25)',
                      }}
                    >
                      {targetCandidateName.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Review Candidate: {targetCandidateName}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {targetCandidateCode} {targetVacancyTitle ? `• ${targetVacancyTitle}` : ''}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: isLinkExpired ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                      color: isLinkExpired ? '#ef4444' : '#10b981',
                      border: `1px solid ${isLinkExpired ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      flexShrink: 0,
                    }}
                  >
                    {isLinkExpired ? 'Expired' : `${linkRemainingMinutes < 60 ? `${linkRemainingMinutes}m` : `${Math.round(linkRemainingMinutes / 60)}h`} left`}
                  </span>
                </div>
              )}
              {isLinkExpired && (
                <div
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(239,68,68,0.07)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    fontSize: '12px',
                    color: '#ef4444',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ This Director access link has expired. Please ask HR to generate a new one.
                </div>
              )}

              <button className="self-start inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                onClick={() => switchMode('standard')}>
                <Icon name="arrow-left" size="xs" /><span>Standard Sign In</span>
              </button>

              <div style={{ width: '100%' }}>
                <DirectorKeypad value={pin} onChange={setPin} onComplete={handlePinComplete} masked={pinMasked} />
              </div>

              <div className="flex items-center justify-between w-full text-xs text-[var(--text-tertiary)]">
                <button type="button" className="hover:text-[var(--text-secondary)] font-medium transition-colors inline-flex items-center gap-1.5"
                  onClick={() => setPinMasked((v) => !v)}>
                  <Icon name={pinMasked ? 'unlock' : 'lock'} size="xs" />
                  <span>{pinMasked ? 'Show digits' : 'Mask digits'}</span>
                </button>
                {pin.length > 0 && (
                  <button type="button" className="hover:text-[var(--text-secondary)] font-medium transition-colors" onClick={() => setPin('')}>
                    Clear digits
                  </button>
                )}
              </div>

              <button type="button" disabled={loading} style={btnStyle} onClick={() => handlePinComplete(pin)}>
                {loading ? (<><Icon name="loader" size="sm" className="animate-spin" /><span>Verifying clearance…</span></>) : <span>Verify Security PIN</span>}
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
