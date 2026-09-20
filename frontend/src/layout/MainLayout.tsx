import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF9', color: '#1A1614' }}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
