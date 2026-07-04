import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, provider } from '../firebase';
import '../styles/login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  /* --- UI State --- */
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  /* --- Data State --- */
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // トースト表示ヘルパー
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  /* --- Handlers --- */
  // Googleログイン
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/home');
    } catch (error) {
      console.error(error);
      setErrorMsg("Googleログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  // メールアドレス認証 (ログイン/新規登録)
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
      }
      navigate('/home'); // ログイン成功後の遷移先
    } catch (error) {
      console.error(error);
      setErrorMsg("認証に失敗しました。\n入力内容を確認してください。");
    } finally {
      setIsLoading(false);
    }
  };

  // デモログイン (お試し機能)
  const handleDemoLogin = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      // ※事前にFirebaseコンソールでこのユーザーを作成しておくか、
      // 存在しない場合は新規作成するロジックにする必要があります。
      await signInWithEmailAndPassword(auth, "demo@example.com", "demo1234");
      navigate('/home');
    } catch (error) {
      console.error(error);
      setErrorMsg("デモログインに失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  // パスワードリセット
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("リセットメールを送信しました！");
      setIsResetMode(false);
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string };
        if (err.code === 'auth/user-not-found') {
          setErrorMsg('このメールアドレスは登録されていません。');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMsg('メールアドレスの形式が正しくありません。');
        } else {
          setErrorMsg('送信に失敗しました。\nアカウントの登録状況を確認してください。');
        }
      } else {
        setErrorMsg('予期せぬエラーが発生しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /* --- Render --- */
  return (
    <div className="login-container">
      {toastMsg &&
        createPortal(
          <div className="toast-notification">
            <span>{toastMsg}</span>
          </div>,
          document.body
        )}

      {isResetMode ? (
        <div className="fade-in">
          <h2 className="login-subtitle">Reset Password</h2>
          {errorMsg && <div className="error-banner" style={{ color: 'red' }}>{errorMsg}</div>}
          <form onSubmit={handleResetPassword}>
            <input type="email" placeholder="Email Address" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>
          <div className="toggle-area">
            <span onClick={() => setIsResetMode(false)} style={{ cursor: 'pointer', color: 'blue' }}>ログインに戻る</span>
          </div>
        </div>
      ) : (
        <div className="fade-in">
          <h2 className="login-subtitle">{isLoginMode ? 'Welcome Back' : 'Create Account'}</h2>

          <button onClick={handleGoogleLogin} className="google-btn" disabled={isLoading}>
            <span>{isLoginMode ? 'Log in with Google' : 'Sign up with Google'}</span>
          </button>

          <div className="separator"><span>or</span></div>
          {errorMsg && <div className="error-banner" style={{ color: 'red' }}>{errorMsg}</div>}

          <form onSubmit={handleEmailAuth}>
            {!isLoginMode && (
              <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                <input type="text" placeholder="Username" className="login-input" value={username} onChange={(e) => setUsername(e.target.value)} maxLength={10} required style={{ marginBottom: '5px' }} />
                <p className="input-warning" style={{ fontSize: '12px', color: '#666' }}>※最大10文字</p>
              </div>
            )}

            <input type="email" placeholder="Email Address" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} required />

            <div className="password-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="login-input password-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} style={{ marginLeft: '5px' }}>
                {showPassword ? '隠す' : '表示'}
              </button>
            </div>

            {isLoginMode && (
              <div style={{ textAlign: 'right', marginBottom: '10px' }}>
                <span onClick={() => setIsResetMode(true)} style={{ color: '#888', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>パスワードを忘れた場合</span>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="toggle-area" style={{ marginTop: '20px' }}>
            <p className="toggle-text">{isLoginMode ? 'アカウントを持っていませんか？' : 'すでに登録済みですか？'}</p>
            <button onClick={() => setIsLoginMode(!isLoginMode)} style={{ cursor: 'pointer', color: 'blue', background: 'none', border: 'none' }}>
              {isLoginMode ? '新規登録はこちら' : 'ログイン画面へ戻る'}
            </button>
          </div>

          <div className="demo-section" style={{ marginTop: '20px' }}>
            <button onClick={handleDemoLogin} className="demo-btn" disabled={isLoading}>
              登録せずに試してみる ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
