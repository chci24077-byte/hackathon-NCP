import { useState } from 'react';
import { mockRawEmailInbox, Assignment } from './types/assignment'; 
import { extractAssignmentsFromEmails } from './services/OpenRouter';

function App() {
  const [results, setResults] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const handleTestAI = async () => {
    setLoading(true);
    // AIを叩いて、返ってきたデータをそのままセットするだけ
    const assignments = await extractAssignmentsFromEmails(mockRawEmailInbox);
    setResults(assignments);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>AIテスト画面</h1>
      
      <button onClick={handleTestAI} disabled={loading}>
        {loading ? '解析中...' : 'メールから課題を探す'}
      </button>

      <hr />

      <h2>結果一覧</h2>
      {results.length === 0 ? (
        <p>ボタンを押すと、AIが見つけた課題が表示されます。</p>
      ) : (
        results.map((task, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h3>📌 課題名: {task.title}</h3>
            <p>授業: {task.courseName}</p>
            <p>締切: {task.dueDate}</p>
            <p>提出先: {task.submitTo}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default App;