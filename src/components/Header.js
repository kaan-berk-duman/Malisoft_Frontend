import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitles = {
    "/Anasayfa": { title: "Anasayfa", icon: "🏠" },
    "/Profil": { title: "Profil", icon: "👤" },
    "/Stoklar": { title: "Stoklar", icon: "📦" },
    "/StokBakiyeleri": { title: "Stoklar / Stok Bakiyeleri", icon: "📦" },
    "/Cariler": { title: "Cariler", icon: "📃" },
    "/Depolar": { title: "Depolar", icon: "🏬" },
    "/Faturalar": { title: "Faturalar", icon: "📃" },
    "/FaturaKalemleri": { title: "Faturalar / Fatura Kalemleri", icon: "📃" },
    "/Firmalar": { title: "Firmalar", icon: "🏢" },
    "/FirmaHareketleri": { title: "Firma Hareketleri", icon: "🏢" },
    "/Kasalar": { title: "Kasalar", icon: "💰" },
    "/Takvim": { title: "Takvim", icon: "🗓️" },
    "/SatisTemsilcileri": { title: "Satış Temsilcileri", icon: "🙋" },
    "/Personeller": { title: "Personeller", icon: "👤" },
    "/Kullanicilar": { title: "Kullanıcılar", icon: "👤" },
  };

  const currentPage = pageTitles[location.pathname] || { title: "Sayfa Bulunamadı", icon: "❓" };

  return (
    <header className="bg-white flex justify-between items-center px-6 py-4 shadow-md">
      <div className="flex items-center space-x-3" style={{ pointerEvents: 'none' }}>
        {/* Simge ve başlık */}
        <span className="text-2xl">{currentPage.icon}</span>
        <h1 className="text-lg font-bold text-gray-700">
          {currentPage.title}
        </h1>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate("/Takvim")}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold focus:outline-none text-2xl"
        >
          🗓️
        </button>
        <button
          onClick={() => navigate("/Profil")}
          className="w-8 h-8 rounded-full bg-gray-300 hover:bg-blue-500 flex items-center justify-center text-white font-bold focus:outline-none"
        >
          P
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-gray-700 hover:text-blue-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m0-6h3.75m-3.75 0l1.5-1.5m-1.5 1.5l1.5 1.5"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
