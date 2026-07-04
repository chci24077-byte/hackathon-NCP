import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {/* --- 左サイドバー --- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">📖</span> タスクン
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active"><span className="nav-icon">🏠</span> ホーム</li>
            <li><span className="nav-icon">🔗</span> サービス連携</li>
          </ul>
        </nav>
      </aside>

      {/* --- メインコンテンツ --- */}
      <main className="main-content">
        {/* ヘッダーエリア */}
        <header className="main-header">
          <h1 className="page-title">ホーム</h1>
          <div className="header-actions">
            {/* ベルマークなどのアイコンの代わりにログインボタンを配置 */}
            <button className="header-login-btn" onClick={handleLoginClick}>
              ログイン
            </button>
          </div>
        </header>

        {/* サマリーカードエリア */}
        <div className="summary-cards">
          <div className="card alert-card">
            <span className="card-icon">⏰</span>
            <div className="card-info">
              <p className="card-label">期限が近い</p>
              <p className="card-count">3<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">📄</span>
            <div className="card-info">
              <p className="card-label">今回の課題</p>
              <p className="card-count">7<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">✅</span>
            <div className="card-info">
              <p className="card-label">提出済み</p>
              <p className="card-count">5<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">📑</span>
            <div className="card-info">
              <p className="card-label">すべての課題</p>
              <p className="card-count">15<span>件</span></p>
            </div>
          </div>
        </div>

        {/* 課題一覧エリア */}
        <section className="task-section">
          <h2 className="section-title">課題一覧</h2>
          
          {/* フィルター */}
          <div className="filters">
            <select className="filter-select"><option>すべての科目 ⌄</option></select>
            <select className="filter-select"><option>すべてのステータス ⌄</option></select>
            <select className="filter-select"><option>すべてのサービス ⌄</option></select>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="検索..." />
            </div>
          </div>

          {/* テーブル */}
          <div className="table-container">
            <table className="task-table">
              <thead>
                <tr>
                  <th>課題名</th>
                  <th>科目</th>
                  <th>サービス</th>
                  <th>締切</th>
                  <th>ステータス</th>
                </tr>
              </thead>
              <tbody>
                {/* プロトタイプの例 */}
                <tr>
                  <td className="task-name">レポート第3回</td>
                  <td>情報科学基礎</td>
                  <td>Canvas</td>
                  <td>2026/7/3</td>
                  <td><span className="status-badge unsubmitted">未提出</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* もっと見るボタン */}
          <div className="load-more-container">
            <button className="load-more-btn">もっと見る ⌄</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;