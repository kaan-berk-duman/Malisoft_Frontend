import React, { useState, useEffect, useContext } from "react";
import Header from "./Header";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";

const Main = () => {
  const [dovizler, setDovizler] = useState([]);
  const [personelCount, setPersonelCount] = useState(0);
  const [temsilciCount, setTemsilciCount] = useState(0);
  const [faturaCount, setFaturaCount] = useState(0);
  const [aktifDepoCount, setAktifDepoCount] = useState(0);
  const [totalMaas, setTotalMaas] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  const { user } = useContext(AuthContext);
  const storedFirmaId = localStorage.getItem('firma_id');
  const firmaId = user?.firma_id ?? (storedFirmaId ? +storedFirmaId : 0);

  useEffect(() => {
    if (firmaId === 0) return;

    // Dövizler
    axios.get("http://localhost:5127/api/currency/get-dovizler")
      .then(({ data }) => setDovizler(data))
      .catch((error) => {
        console.error("Döviz kurları çekilirken hata:", error);
        setDovizler([
          { doviz_adi: "ABD Doları", alis: "0,00", satis: "0,00", doviz_kodu: "USD" },
          { doviz_adi: "Euro", alis: "0,00", satis: "0,00", doviz_kodu: "EUR" },
          { doviz_adi: "İngiliz Sterlini", alis: "0,00", satis: "0,00", doviz_kodu: "GBP" },
          { doviz_adi: "Rus Rublesi", alis: "0,00", satis: "0,00", doviz_kodu: "RUB" },
        ]);
      });

    // Diğer metrikler
    const fetchMetrics = async () => {
      try {
        const [personelRes, temsilciRes, faturaRes, depoRes, firmaRes, cariRes] = await Promise.all([
          axios.get("http://localhost:5127/api/personeller/list"),
          axios.get("http://localhost:5127/api/satistemsilcisi/list"),
          axios.get("http://localhost:5127/api/faturalar/list"),
          axios.get("http://localhost:5127/api/depolar/list"),
          axios.get("http://localhost:5127/api/firmalar/list"),
          axios.get("http://localhost:5127/api/cariler/list"),
        ]);

        // Firma bazlı filtreleme
        const personeller = personelRes.data.filter(p => p.firma_id === firmaId);
        const temsilciler = temsilciRes.data.filter(t => t.firma_id === firmaId);
        const faturalar = faturaRes.data.filter(f => f.firma_id === firmaId);
        const depolar = depoRes.data.filter(d => d.firma_id === firmaId);
        const firmalar = firmaRes.data;
        const cariler = cariRes.data;

        setPersonelCount(personeller.length);
        const maasToplam = personeller.reduce((sum, p) => {
          const val = parseFloat(p.personel_maas?.toString().replace(',', '.')) || 0;
          return sum + val;
        }, 0);
        setTotalMaas(maasToplam);

        setTemsilciCount(temsilciler.length);
        setFaturaCount(faturalar.length);
        setAktifDepoCount(depolar.length);

        const firma = firmalar.find(f => f.firma_id === firmaId);
        if (firma) {
          const cari = cariler.find(c =>
            c.cari_kod === firma.firma_kodu
          );
          setCurrentBalance(cari ? parseFloat(cari.bakiye) || 0 : 0);
        }
      } catch (err) {
        console.error("Metrikler çekilirken hata:", err);
      }
    };

    fetchMetrics();
  }, [firmaId]);

  if (firmaId === 0) {
    return (
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
        <Header />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-lg p-10 w-3/4 text-center">
            <h2 className="text-2xl font-bold mb-4">Admin Paneli</h2>
            <p className="text-gray-700">
              Hoşgeldin Admin! Eğer yeni bir adminsen sana kısa bir özet geçeyim...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
      <Header />
      <main className="flex-1 p-8">
        {/* Metri̇k Kartlari */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-blue-500">Güncel Bakiye</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{currentBalance.toLocaleString('tr-TR')} TL</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-green-500">Kesilen Fatura Sayısı</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{faturaCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-red-500">Temsilci Sayısı</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{temsilciCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-purple-500">Çalışan Personel</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{personelCount}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-orange-500">Personel Maaş</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalMaas.toLocaleString('tr-TR')} TL</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h3 className="text-sm font-bold text-teal-500">Aktif Depo</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">{aktifDepoCount}</p>
          </div>
        </div>

        {/* Döviz Kurlari */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {dovizler.map((d, index) => (
            <div key={index} className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">{d.doviz_adi}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-green-200 pb-2">
                  <p className="text-sm font-medium">Alış</p>
                  <p className="text-sm font-semibold">{d.alis} {d.doviz_kodu}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm font-medium">Satış</p>
                  <p className="text-sm font-semibold">{d.satis} {d.doviz_kodu}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Main;
