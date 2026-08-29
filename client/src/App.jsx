import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginView } from './views/LoginView';
import { SecretaryDashboard } from './views/SecretaryDashboard';
import { PastorDashboard } from './views/PastorDashboard';
import { AdminDashboard } from './views/AdminDashboard';

const MainApp = () => {
  const { user, isSecretary, isPastor, isAdmin } = useAuth();

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      <Header />
      
      <main className="flex-1 pb-12">
        {isAdmin && <AdminDashboard />}
        {isPastor && <PastorDashboard />}
        {isSecretary && <SecretaryDashboard />}
      </main>

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <MainApp />
      </SyncProvider>
    </AuthProvider>
  );
}
