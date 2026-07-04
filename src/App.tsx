import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login'; // 作成したファイルに合わせてパスを調整

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* 他のルート設定 */}
      </Routes>
    </BrowserRouter>
  );
}