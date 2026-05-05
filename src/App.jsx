import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Creator from './pages/Creator';
import Viewer from './pages/Viewer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Creator />} />
        <Route path="/tape/:id" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}
