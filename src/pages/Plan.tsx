import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';

const Plan: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">📘</span> タスクン
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><span className="nav-icon">🏠</span> <button className="link-button" onClick={() => navigate('/')}>ホーム</button></li>
            <li className="active"><span className="nav-icon">🗂️</span> プラン</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <h1 className="page-title">プランページ</h1>
          <div className="header-actions">
            <button className="header-login-btn" onClick={() => navigate('/')}>ホームへ戻る</button>
          </div>
        </header>

        <section className="task-section">
          <h2 className="section-title">Firebaseログイン成功後の遷移先</h2>
          <p>このページはログイン後に表示される計画ページです。</p>
          <p>ここでユーザーの予定や課題を表示する UI を実装できます。</p>
          <div style={{ marginTop: 20 }}>
            <button className="gmail-button" onClick={() => navigate('/')}>ホームに戻る</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Plan;
