import { useState } from 'react';
// 💡 あなたのフォルダ構造（src/types/assignment.ts）に合わせてインポート
import { mockRawEmailInbox, Assignment } from './types/assignment'; 
// 💡 あなたのフォルダ構造（src/services/OpenRouter.ts）に合わせてインポート
import { extractAssignmentsFromEmails } from './services/OpenRouter';

function App() {
  const [results, setResults] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTestAI = async () => {
    setLoading(true);
    console.log("🚀 AIに仮のメールデータを送信中...");
    
    try {
      // OpenRouterの関数を実行して、assignment.tsにあるぐちゃぐちゃなメールデータを渡す
      const assignments = await extractAssignmentsFromEmails(mockRawEmailInbox);
      console.log("🔥 AIからの返却結果:", assignments);
      setResults(assignments);
    } catch (error) {
      console.error("エラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#333' }}>🤖 AI課題アシスタント - MVPテスト画面</h1>
      <p style={{ color: '#666' }}>
        `src/types/assignment.ts` に入っている仮のメールデータ（Amazon、就活、大学の課題が混ざったもの）から、
        AIが課題だけを正しく見つけ出せるか実験します。
      </p>
      
      <button 
        onClick={handleTestAI} 
        disabled={loading}
        style={{ 
          padding: '12px 24px', 
          fontSize: '16px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: loading ? '#ccc' : '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? 'AIが仕分け中...' : 'AIテストを実行（メールを解析）'}
      </button>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #eee' }} />

      <h2>✨ AIが「課題」と判定した結果</h2>
      {results.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>ボタンを押すと、ここにAIの解析結果がカードで表示されます。</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {results.map((task, index) => (
            <div key={index} style={{ border: '1px solid #E5E7EB', padding: '20px', borderRadius: '8px', backgroundColor: '#F9FAFB' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#DC2626' }}>📌 課題名: {task.title}</h3>
              <p style={{ margin: '5px 0' }}><strong>📚 授業名:</strong> {task.courseName}</p>
              <p style={{ margin: '5px 0' }}><strong>⏳ 締切日時:</strong> {task.dueDate}</p>
              <p style={{ margin: '5px 0' }}><strong>📥 提出先:</strong> {task.submitTo}</p>
              <span style={{ inlineSize: 'fit-content', display: 'inline-block', backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '12px', padding: '2px 8px', borderRadius: '4px', marginTop: '10px' }}>
                ソース: {task.source}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;