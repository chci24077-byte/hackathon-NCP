import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractAssignmentsFromEmails } from '../services/OpenRouter';
import { mockRawEmailInbox } from '../types/assignment';
import '../styles/home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [assignments, setAssignments] = useState([
    {
      id: '1',
      title: '第3回レポート',
      courseName: '情報科学基礎',
      submitTo: 'Canvas',
      dueDate: '2026-07-05',
      status: '未提出',
    },
  ]);
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleFetchAssignments = async () => {
    console.log('取得開始');
    setLoading(true);
    const result = await extractAssignmentsFromEmails(mockRawEmailInbox);
    console.log('AI result', result);
    setLoading(false);
    if (result.length > 0) {
      setAssignments(result.map((item, index) => ({
        id: item.id || String(index + 1),
        title: item.title || 'タイトル不明',
        courseName: item.courseName || '不明',
        submitTo: item.submitTo || '不明',
        dueDate: item.dueDate || '未設定',
        status: item.isMerged ? 'マージ済み' : '未提出',
      })));
      setMessage(`✅ ${result.length}件取得しました！`);
    }
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
          <div style={{ marginBottom: "20px" }}>
            <button
              className="gmail-button"
              onClick={handleFetchAssignments}
            >
              📩 Gmailから課題を取得
            </button>
            {loading && <p>⏳ AIがメールを解析しています...</p>}
            {message && <p>{message}</p>}
          </div>
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
                {assignments.map((task) => (
                  <tr key={task.id}>
                    <td className="task-name">{task.title}</td>
                    <td>{task.courseName}</td>
                    <td>{task.submitTo}</td>
                    <td>{task.dueDate}</td>
                    <td>{task.status}</td>
                  </tr>
                ))}
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