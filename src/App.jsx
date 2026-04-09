import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dealers from './pages/Dealers';
import DealerDetail from './pages/dealer/DealerDetail';
import DealerLogs from './pages/dealer/DealerLogs';
import Analytics from './pages/Analytics';
import Playground from './pages/Playground';
import Skills from './pages/Skills';
import KnowledgeBase from './pages/KnowledgeBase';
import Channels from './pages/Channels';
import APIs from './pages/APIs';
import AssistantHub from './pages/AssistantHub';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="/dealers" replace />} />
                <Route path="dealers" element={<Dealers />} />
                <Route path="dealer/:id" element={<DealerDetail />} />
                <Route path="dealer/:id/logs" element={<DealerLogs />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="channels" element={<Channels />} />
                <Route path="apis" element={<APIs />} />
                {/* Legacy redirect */}
                <Route path="skills" element={<Navigate to="/assistant/skills" replace />} />
                <Route path="playground" element={<Navigate to="/assistant/playground" replace />} />
                {/* Asistente section */}
                <Route path="assistant/playground" element={<Playground />} />
                <Route path="assistant/skills" element={<Skills />} />
                <Route path="assistant/knowledge" element={<KnowledgeBase />} />
                <Route path="assistant" element={<AssistantHub />} />
                <Route path="*" element={<Navigate to="/dealers" replace />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
