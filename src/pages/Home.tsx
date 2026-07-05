import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getGmailMessages } from '../services/gmail';
import '../styles/home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowUserMenu(false);
    } catch (error) {
      console.error('ログアウトに失敗しました', error);
    }
  };

  const handleFetchAssignments = async () => {
    console.log('取得開始');
    setMessage('');
    setLoading(true);
    try {
      const token = localStorage.getItem('gmail_access_token') || '';
      if (!token) {
        setMessage('⚠️ Googleログインしてアクセストークンを取得してください。');
        setLoading(false);
        return;
      }
      const rawEmails = await getGmailMessages(token);
      const result = await extractAssignmentsFromEmails(rawEmails);
      console.log('AI result', result);
      setLoading(false);
      if (result.length > 0) {
        setAssignments(result as any);
        setMessage(`✅ ${result.length}件取得しました！`);
      } else {
        setMessage('⚠️ 課題が見つかりませんでした');
      }
    } catch (error) {
      console.error('Gmail取得エラー', error);
      setLoading(false);
      setMessage('❌ Gmailの取得に失敗しました。もう一度お試しください');
    }
  };
  

  // ステータスをトグルする (提出済み <-> 未提出)
  const [toast, setToast] = useState('');

  const toggleStatus = (id: string) => {
    setAssignments((prev) => {
      const updated = prev.map((task) => {
        if (task.id !== id) return task;
        const newStatus = (task as any).status === '提出済み' ? '未提出' : '提出済み';
        return { ...task, status: newStatus };
      });

      const changed = prev.find((t) => t.id === id);
      if (changed) {
        const newStatus = (changed as any).status === '提出済み' ? '未提出' : '提出済み';
        if (newStatus === '提出済み') {
          setToast(`✅ ${changed.title}を提出済みにしました！`);
          setTimeout(() => setToast(''), 2000);
        }
      }

      return updated;
    });
  };

  React.useEffect(() => {
    let id: number | undefined;
    if (loading) {
      setProgress(0);
      id = window.setInterval(() => {
        setProgress((p) => Math.min(95, p + Math.floor(Math.random() * 10) + 5));
      }, 600);
    } else {
      // finish animation
      setProgress((p) => (p >= 100 ? p : 100));
    }
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [loading]);

  // サマリーカード用の集計値
  const total = assignments.length;
  const submitted = assignments.filter(a => {
    const s = (a as any).status;
    return typeof s === 'string' && s.includes('提出');
  }).length;
  const upcoming = assignments.filter(a => {
    const dstr = (a as any).dueDate;
    if (!dstr) return false;
    const d = new Date(dstr);
    if (isNaN(d.getTime())) return false;
    const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  const pending = Math.max(0, total - submitted);
  // 締切が近い順にソート（締切未設定は後ろに回す）
  const parseDue = (d: any) => {
    if (!d) return Number.POSITIVE_INFINITY;
    const t = new Date(d).getTime();
    return isNaN(t) ? Number.POSITIVE_INFINITY : t;
  };

  const sortedAssignments = [...assignments].sort((a, b) => {
    return parseDue((a as any).dueDate) - parseDue((b as any).dueDate);
  });

  const formatDate = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
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
            {user ? (
              <div className="user-menu-container" style={{ position: 'relative' }}>
                <button
                  className="header-login-btn"
                  onClick={() => setShowUserMenu((prev) => !prev)}
                >
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      width={32}
                      height={32}
                      alt="avatar"
                      style={{ borderRadius: '50%', marginRight: 8, verticalAlign: 'middle' }}
                    />
                  )}
                  <span style={{ verticalAlign: 'middle' }}>
                    {user.displayName || user.email || 'ユーザー'} ▼
                  </span>
                </button>
                {showUserMenu && (
                  <div
                    className="user-dropdown"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      background: '#fff',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderRadius: 12,
                      zIndex: 20,
                      minWidth: 180,
                      padding: 8,
                    }}
                  >
                    <button className="dropdown-item" onClick={() => { handleLogout(); }}>
                      ログアウト
                    </button>
                    <button className="dropdown-item" onClick={() => { setShowUserMenu(false); handleLoginClick(); }}>
                      別のアカウントでログイン
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="header-login-btn" onClick={handleLoginClick}>
                ログイン
              </button>
            )}
          </div>
        </header>

        {/* サマリーカードエリア */}
        <div className="summary-cards">
          <div className="card alert-card">
            <span className="card-icon">⏰</span>
            <div className="card-info">
              <p className="card-label">期限が近い</p>
              <p className="card-count">{upcoming}<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">📄</span>
            <div className="card-info">
              <p className="card-label">今回の課題</p>
              <p className="card-count">{pending}<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">✅</span>
            <div className="card-info">
              <p className="card-label">提出済み</p>
              <p className="card-count">{submitted}<span>件</span></p>
            </div>
          </div>
          <div className="card">
            <span className="card-icon">📑</span>
            <div className="card-info">
              <p className="card-label">すべての課題</p>
              <p className="card-count">{total}<span>件</span></p>
            </div>
          </div>
        </div>

        {/* 課題一覧エリア */}
        <section className="task-section">
          <div style={{ marginBottom: "20px" }}>
            <button
              className="gmail-button"
              onClick={handleFetchAssignments}
              disabled={loading}
            >
              📩 課題を取得（モック）
            </button>
            {loading && (
              <div className="loading">
                <span>📩 Gmail取得中...</span>
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <span>{progress}%</span>
              </div>
            )}
            {message && (
              <p className={message.startsWith('❌') ? 'message-error' : 'message-success'}>{message}</p>
            )}
            <div style={{ marginTop: 8 }}>
              <button
                className="refresh-btn"
                onClick={() => setLastUpdated(new Date())}
              >
                更新
              </button>
              {lastUpdated && (
                <span style={{ marginLeft: 12 }}>
                  最終更新{formatDate(lastUpdated)}
                </span>
              )}
            </div>
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
            {total === 0 ? (
              <div className="empty-state">🎉 現在課題はありません！</div>
            ) : (
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
                  {sortedAssignments.map((task) => {
                    const dueTs = parseDue((task as any).dueDate);
                    const diffDays = (dueTs - Date.now()) / (1000 * 60 * 60 * 24);
                    const isUrgent = diffDays >= 0 && diffDays <= 1; // 24時間以内
                    return (
                      <tr key={task.id} className={isUrgent ? 'urgent' : undefined}>
                        <td className="task-name">{task.title}</td>
                        <td>{task.courseName}</td>
                        <td>{task.submitTo}</td>
                        <td>{task.dueDate}{isUrgent && <span style={{marginLeft:8}}>（明日締切）</span>}</td>
                        <td>
                          <button
                            className={`status ${((task as any).status === '提出済み') ? 'submitted' : 'unsubmitted'}`}
                            onClick={() => toggleStatus((task as any).id)}
                          >
                            {(task as any).status ?? ((task as any).isMerged ? 'マージ済み' : '未提出')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* もっと見るボタン */}
          <div className="load-more-container">
            <button className="load-more-btn">もっと見る ⌄</button>
          </div>
        </section>
        {toast && <div className="toast">{toast}</div>}
      </main>
    </div>
  );
};

export default Home;