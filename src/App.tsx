import { useEffect, useState } from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import { AVVForm } from './components/AVVForm';
import { useAVVStore } from './store/avvStore';
import { Layout, Plus } from 'lucide-react';
import { initDB } from './db/schema';
import { Offcanvas } from './components/Offcanvas';
import { Notifications } from './components/Notifications';
import { LoadingScreen } from './components/LoadingScreen';
import { useNotificationStore } from './store/notificationStore';

const Header = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layout className="h-8 w-8 text-indigo-600 transition-transform hover:rotate-90 duration-300" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
              Suivi des Avant-Ventes
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Notifications />
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              Nouvel AVV
            </button>
          </div>
        </div>
      </div>

      <Offcanvas
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Nouvel avant-projet"
      >
        <AVVForm onSuccess={() => setIsFormOpen(false)} />
      </Offcanvas>
    </header>
  );
};

const MainContent = () => (
  <main className="flex-1 bg-gray-50 p-6">
    <div className="max-w-[1920px] mx-auto">
      <KanbanBoard />
    </div>
  </main>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { fetchAVVs } = useAVVStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    const init = async () => {
      await initDB();
      await Promise.all([
        fetchAVVs(),
        fetchNotifications()
      ]);
      setIsLoading(false);
    };
    init();
  }, [fetchAVVs, fetchNotifications]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <MainContent />
    </div>
  );
}

export default App;