import React, { useContext } from 'react';
import Logo from "../assets/Logo.png";
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  // Get user from context (set in login)
  const { user } = useContext(AuthContext);
  // Fallback to localStorage if needed
  const storedFirmaId = localStorage.getItem('firma_id');
  const firmaId = user?.firma_id ?? (storedFirmaId ? +storedFirmaId : 0);

  // Define all sidebar items
  const allItems = [
    { name: 'Anasayfa', icon: 'fas fa-chart-bar', path: '/Anasayfa' },
    { name: 'Cariler', icon: 'fas fa-bell', path: '/Cariler' },
    { name: 'Depolar', icon: 'fas fa-bell', path: '/Depolar' },
    { name: 'Faturalar', icon: 'fas fa-bell', path: '/Faturalar' },
    { name: 'Firmalar', icon: 'fas fa-language', path: '/Firmalar' },
    { name: 'Firma Hareketleri', icon: 'fas fa-language', path: '/FirmaHareketleri' },
    { name: 'Personeller', icon: 'fas fa-file-invoice', path: '/Personeller' },
    { name: 'Satış Temsilcileri', icon: 'fas fa-user', path: '/SatisTemsilcileri' },
    { name: 'Stoklar', icon: 'fas fa-table', path: '/Stoklar' },
    { name: 'Kullanıcılar', icon: 'fas fa-table', path: '/Kullanicilar' },
  ];

  // Filter items based on firmaId
  const itemsToShow = firmaId === 0
    ? allItems.filter(item => ['Anasayfa', 'Cariler', 'Firmalar', 'Kullanıcılar'].includes(item.name))
    : allItems.filter(item => !['Cariler', 'Firmalar', 'Kullanıcılar'].includes(item.name));

  return (
    <aside className="bg-gray-900 text-white w-64 h-screen fixed top-0 left-0">
      <div className="text-center py-4">
        <img
          src={Logo}
          alt="logo"
          className="mx-auto w-24 h-24 object-contain"
        />
      </div>
      <ul className="space-y-1">
        {itemsToShow.map(item => (
          <li key={item.name}>
            <a
              href={item.path}
              className="flex items-center space-x-2 px-6 py-3 hover:bg-gray-700"
            >
              <i className={item.icon}></i>
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
