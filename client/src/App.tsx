import { Routes, Route } from 'react-router-dom';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from '@/components/ui/toaster';
import { HomePage } from '@/pages/HomePage';
import { JoinPage } from '@/pages/JoinPage';
import { RoomPage } from '@/pages/RoomPage';

function App() {
  return (
    <SocketProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join/:roomId" element={<JoinPage />} />
        <Route path="/room/:roomId" element={<RoomPage />} />
      </Routes>
      <Toaster />
    </SocketProvider>
  );
}

export default App;
