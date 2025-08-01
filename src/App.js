import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from "./context/AuthContext";
import Login from './components/login';
import Main from './components/main';
import Sidebar from './components/Sidebar';
import Profil from './components/Profil/profil';
import Cariler from './components/Cariler/Cariler';
import Depolar from './components/Depolar/Depolar';
import Faturalar from './components/Faturalar/Faturalar';
import Firmalar from './components/Firmalar/Firmalar';
import Kasalar from './components/Kasalar/Kasalar';
import Stoklar from './components/Stoklar/Stoklar';
import Takvim from './components/takvim';
import SatisTemsilcileri from './components/SatisTemsilcileri/SatisTemsilci';
import FirmaHareketleri from './components/Firmalar/FirmaHareketleri/FirmaHareketleri';
import StokBakiyeleri from './components/Stoklar/StokBakiyeleri/StokBakiyeleri';
import FaturaKalemleri from './components/Faturalar/FaturaKalemleri/FaturaKalemleri';
import Personeller from './components/Personeller/Personeller';
import Kullanicilar from './components/Kullanicilar/Kullanicilar';
import Print from './components/Faturalar/print';

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="flex">
      <AuthProvider>
      {location.pathname !== '/' && <Sidebar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Anasayfa" element={<Main />} />
          <Route path="/Profil" element={<Profil />} />
          <Route path="/Cariler" element={<Cariler />} />
          <Route path="/Depolar" element={<Depolar />} />
          <Route path="/Faturalar" element={<Faturalar />} />
          <Route path="/Firmalar" element={<Firmalar />} />
          <Route path="/Kasalar" element={<Kasalar />} />
          <Route path="/Stoklar" element={<Stoklar />} />
          <Route path="/Takvim" element={<Takvim />} />
          <Route path="/SatisTemsilcileri" element={<SatisTemsilcileri />} />
          <Route path="/FirmaHareketleri" element={<FirmaHareketleri />} />
          <Route path="/StokBakiyeleri" element={<StokBakiyeleri />} />
          <Route path="/FaturaKalemleri" element={<FaturaKalemleri />} />
          <Route path="/Personeller" element={<Personeller />} />
          <Route path="/Kullanicilar" element={<Kullanicilar />} />
          <Route path="/Print/:id" element={<Print />} />
        </Routes>
      </div>
      </AuthProvider>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;


