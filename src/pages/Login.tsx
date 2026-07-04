import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
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
    if (!auth || !provider) {
      setErrorMsg('Firebase が正しく初期化されていません。環境変数を確認してください。');
      return;
    }
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;
      console.log('Google accessToken:', accessToken);
      if (!accessToken) {
        setErrorMsg('Googleのアクセストークンを取得できませんでした。');
        return;
      }
      localStorage.setItem('gmail_access_token', accessToken);
      navigate('/');
    } catch (error: unknown) {
      console.error('Google login error', error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string; message?: string };
        setErrorMsg(`Googleログインに失敗しました: ${err.code ?? ''} ${err.message ?? ''}`.trim());
      } else {
        setErrorMsg('Googleログインに失敗しました。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // メールアドレス認証 (ログイン/新規登録)
  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    if (!auth) {
      setErrorMsg('Firebase 認証が初期化されていません。環境変数を確認してください。');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
      }
      navigate('/'); // チームメンバーの修正を採用
    } catch (error: unknown) {
      console.error(error);
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const err = error as { code?: string };
        if (err.code === 'auth/email-already-in-use') {
          setErrorMsg('このメールアドレスはすでに使われています。');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMsg('メールアドレスの形式が正しくありません。');
        } else if (err.code === 'auth/weak-password') {
          setErrorMsg('パスワードは6文字以上にしてください。');
        } else {
          setErrorMsg('認証に失敗しました。入力内容を確認してください。');
        }
      } else {
        setErrorMsg('認証に失敗しました。入力内容を確認してください。');
      }
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

          <button 
  className="gsi-material-button" 
  onClick={handleGoogleLogin} 
  disabled={isLoading}
  style={{ width: '100%', marginBottom: '20px' }} // コンテナに合わせるための調整
>
  <div className="gsi-material-button-state"></div>
  <div className="gsi-material-button-content-wrapper">
    <div className="gsi-material-button-icon">
      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{ display: 'block' }}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
      </svg>
    </div>
    <span className="gsi-material-button-contents">
      {isLoginMode ? 'Google in with Google' : 'Google up with Google'}
    </span>
    <span style={{ display: 'none' }}>
      {isLoginMode ? 'Google in with Google' : 'Google up with Google'}
    </span>
  </div>
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

        </div>
      )}
    </div>
  );
};

export default Login;