import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/Logo.png';
import { AuthContext } from "../../context/AuthContext";

// More realistic and stylish invoice layout using Tailwind CSS
export default function PrintInvoice() {
  const { user } = useContext(AuthContext);
  const userFirmaId = user?.firma_id;
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);
  const [firmalar, setFirmalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch firmalar
  const fetchFirmalar = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:5127/api/firmalar/list");
      const filtered = data.filter(f => f.firma_id === userFirmaId);
      setFirmalar(filtered);
    } catch (err) {
      console.error("Firma API hatası:", err);
    }
  }, [userFirmaId]);

  useEffect(() => { fetchFirmalar(); }, [fetchFirmalar]);

  // Fetch invoice and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const invRes = await axios.get('http://localhost:5127/api/faturalar/list');
        const found = invRes.data.find(i => i.fatura_id === Number(id));
        if (!found) throw new Error('Fatura bulunamadı.');
        setInvoice(found);

        const itemsRes = await axios.get('http://localhost:5127/api/faturakalemleri/list');
        setItems(itemsRes.data.filter(i => i.fatura_id === Number(id)));

        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Veri alma hatası');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Trigger print
  useEffect(() => {
    if (!loading && invoice && !error) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, invoice, error]);

  const firma = useMemo(() => firmalar.find(f => f.firma_id === userFirmaId) || null, [firmalar, userFirmaId]);

  if (loading) return <p className="text-center mt-8 text-gray-600">Yükleniyor…</p>;
  if (error)   return <p className="text-center mt-8 text-red-600">{error}</p>;

  const belgeBasligi = invoice.belge_turu === 'F' ? 'FATURA' : invoice.belge_turu === 'I' ? 'İRSALİYE' : invoice.belge_turu;

  return (
    <div className="hidden print:block p-4 bg-white printable-area">
      <article className="max-w-screen-lg mx-auto bg-white shadow-lg print:shadow-none rounded-lg overflow-hidden">

        {/* Header */}
        <header className="flex justify-between items-center p-6 bg-indigo-600 text-white print:bg-black print:text-white">
          <div className="flex items-center space-x-4">
            <img src={Logo} alt="Logo" className="h-20 w-auto" />
            <div>
              <h1 className="text-3xl font-bold">{firma?.firma_adi}</h1>
              <p className="text-sm">{firma?.adres}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <h2 className="text-4xl font-extrabold">{belgeBasligi}</h2>
            <p className="text-lg">No: <span className="font-semibold">{invoice.fatura_no}</span></p>
            <p className="text-lg">Tarih: <span className="font-semibold">{new Date(invoice.tarih).toLocaleDateString('tr-TR')}</span></p>
          </div>
        </header>

        {/* Customer & Invoice Info */}
        <section className="grid grid-cols-2 gap-6 p-6">
          <div className="border p-4 rounded-md shadow-sm print:border-none print:shadow-none">
            <h3 className="uppercase text-sm font-semibold mb-2 text-gray-700">Firma Bilgileri</h3>
            {firma ? (
              <>
                <p><span className="font-medium">Vergi No:</span> {firma.vergi_numarasi}</p>
                <p><span className="font-medium">Tel:</span> {firma.telefon || '-'}</p>
                <p><span className="font-medium">E-Posta:</span> {firma.mail || '-'}</p>
              </>
            ) : <p>Firma bilgisi bulunamadı.</p>}
          </div>

          <div className="border p-4 rounded-md shadow-sm print:border-none print:shadow-none">
            <h3 className="uppercase text-sm font-semibold mb-2 text-gray-700">Cari Bilgileri</h3>
            <p><span className="font-medium">Cari ID:</span> {invoice.cari_id}</p>
            <p><span className="font-medium">Ödeme Tipi:</span> {invoice.odeme_tipi === 'A' ? 'Alacak' : invoice.odeme_tipi === 'B' ? 'Borç' : invoice.odeme_tipi}</p>
            <p><span className="font-medium">Döviz:</span> {invoice.doviz_tipi}</p>
          </div>
        </section>

        {/* Items Table */}
        <section className="p-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 print:bg-gray-200">
                <th className="border px-3 py-2 text-left">Açıklama</th>
                <th className="border px-3 py-2 text-right">Miktar</th>
                <th className="border px-3 py-2 text-right">Birim Fiyat</th>
                <th className="border px-3 py-2 text-right">KDV</th>
                <th className="border px-3 py-2 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.fatura_kalem_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border px-3 py-2">{it.aciklama || '-'}</td>
                  <td className="border px-3 py-2 text-right">{it.miktar}</td>
                  <td className="border px-3 py-2 text-right">{it.birim_fiyat.toFixed(2)} TL</td>
                  <td className="border px-3 py-2 text-right">{it.kdv_orani}%</td>
                  <td className="border px-3 py-2 text-right">{it.genel_toplam.toFixed(2)} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Totals */}
        <footer className="p-6 border-t print:border-t-2">
          <div className="flex justify-end space-x-12 text-right">
            <div className="space-y-1">
              <div className="flex justify-between"><span>KDV Tutar:</span><span className="font-medium">{invoice.kdv_tutar.toFixed(2)} TL</span></div>
              <div className="flex justify-between"><span>Genel Toplam: </span><span className="font-medium">{invoice.genel_toplam.toFixed(2)} TL</span></div>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-12 flex justify-between">
            <div className="w-1/3 border-t pt-2 text-center text-sm">Yetkili İmza</div>
            <div className="w-1/3 border-t pt-2 text-center text-sm">Firma Kaşe</div>
          </div>
        </footer>

      </article>
    </div>
  );
}
