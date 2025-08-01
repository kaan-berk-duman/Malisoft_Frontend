import React, { useState } from "react";
import axios from "axios";

const AddModal = ({ isOpen, onClose,onAddSuccess  }) => {
  const [cari_kod, setcari_kodu] = useState("");
  const [unvan, setunvan] = useState("");
  const [yetkili_ad_soyad, setyetkili_ad_soyad] = useState("");
  const [telefon, settelefon] = useState("");
  const [mail, setmail] = useState("");
  const [adres, setadres] = useState("");
  const [vergi_dairesi, setvergi_dairesi] = useState("");
  const [vergi_no, setvergi_no] = useState("");
  const [tc_kimlik_no, settc_kimlik_no] = useState("");
  const [banka_bilgileri, setbanka_bilgileri] = useState("");
  const [doviz_tipi, setdoviz_tipi] = useState("");
  const [bakiye, setbakiye] = useState("");
  const [tarih, settarih] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPersonel = {
        cari_kod: cari_kod,
        unvan: unvan,
        yetkili_ad_soyad: yetkili_ad_soyad,
        telefon: telefon,
        mail: mail,
        adres: adres,
        vergi_dairesi: vergi_dairesi,
        vergi_no: vergi_no,
        tc_kimlik_no: tc_kimlik_no,
        banka_bilgileri: banka_bilgileri,
        doviz_tipi: doviz_tipi,
        bakiye: bakiye,
        tarih: tarih,
      };

      const response = await axios.post("http://localhost:5127/api/cariler/add", newPersonel);

      if (onAddSuccess) {
        onAddSuccess(response.data);
      }

      setcari_kodu("");
      setunvan("");
      setyetkili_ad_soyad("");
      settelefon("");
      setmail("");
      setadres("");
      setvergi_dairesi("");
      setvergi_no("");
      settc_kimlik_no("");
      setbanka_bilgileri("");
      setdoviz_tipi("");
      setbakiye("");
      settarih("");
      setError("");
      onClose();
    } catch (err) {
      console.error("API error:", err);
      setError("Eklenirken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4 text-center" style={{ pointerEvents: 'none' }}>Cari Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Cari Kodu</label>
              <input
                type="text"
                value={cari_kod}
                onChange={(e) => setcari_kodu(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Unvan</label>
              <input
                type="text"
                value={unvan}
                onChange={(e) => setunvan(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Yetkili Kişi</label>
              <input
                type="text"
                value={yetkili_ad_soyad}
                onChange={(e) => setyetkili_ad_soyad(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Telefon</label>
              <input
                type="text"
                value={telefon}
                onChange={(e) => settelefon(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Mail</label>
              <input
                type="email"
                value={mail}
                onChange={(e) => setmail(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Adres</label>
              <input
                type="text"
                value={adres}
                onChange={(e) => setadres(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Vergi Dairesi</label>
              <input
                type="text"
                value={vergi_dairesi}
                onChange={(e) => setvergi_dairesi(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Vergi Numarası</label>
              <input
                type="text"
                value={vergi_no}
                onChange={(e) => setvergi_no(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">TC Kimlik Numarası</label>
              <input
                type="text"
                value={tc_kimlik_no}
                onChange={(e) => settc_kimlik_no(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Banka Bilgileri</label>
              <input
                type="text"
                value={banka_bilgileri}
                onChange={(e) => setbanka_bilgileri(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Döviz Tipi</label>
              <input
                type="number"
                value={doviz_tipi}
                onChange={(e) => setdoviz_tipi(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Bakiye</label>
              <input
                type="number"
                value={bakiye}
                onChange={(e) => setbakiye(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Tarih</label>
              <input
                type="date"
                value={tarih}
                onChange={(e) => settarih(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              className="px-4 py-2 bg-gray-500 text-white rounded"
              onClick={onClose}
            >
              Geri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddModal;
