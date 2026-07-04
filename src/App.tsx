import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';   // 今作ったダッシュボード
import Login from './pages/Login'; // 先ほど作ったログイン画面

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;