<<<<<<< HEAD
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Plan from './pages/Plan';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/plan" element={<Plan />} />
      </Routes>
    </BrowserRouter>
  );
=======
function
App () {
  return <div></div>
>>>>>>> 889c2eb6bf5dbac6ff75577a3b745c348357b5d7
}
export default App