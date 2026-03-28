import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import SwipeView from './pages/SwipeView';
import BigScreen from './pages/BigScreen';
import MapResult from './pages/MapResult';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:code" element={<Lobby />} />
        <Route path="/swipe/:code" element={<SwipeView />} />
        <Route path="/bigscreen/:code" element={<BigScreen />} />
        <Route path="/results/:code" element={<MapResult />} />
      </Routes>
    </BrowserRouter>
  );
}
