import React, { useState } from "react";
import axios from "axios";

const AddModal = ({ isOpen, onClose,onAddSuccess  }) => {
  const [ad_soyad, setad_soyad] = useState("");
  const [gorev, setgorev] = useState("");
  const [sifre, setsifre] = useState("");
  const [telefon, settelefon] = useState("");
  const [mail, setmail] = useState("");
  const [firma_id, setfirma_id] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPersonel = {
        Kullanici_ad_soyad: ad_soyad,
        Kullanici_telefon: telefon,
        Kullanici_mail: mail,
        Kullanici_sifre: sifre,
        Kullanici_gorev: gorev,
        Firma_id: firma_id,
      };

      const response = await axios.post("http://localhost:5127/api/kullanicilar/add", newPersonel);

      if (onAddSuccess) {
        onAddSuccess(response.data);
      }

      setad_soyad("");
      setgorev("");
      setsifre("");
      settelefon("");
      setmail("");
      setfirma_id("");
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
        <h2 className="text-xl font-bold mb-4 text-center" style={{ pointerEvents: 'none' }}>Kullanıcı Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Ad Soyad</label>
              <input
                type="text"
                value={ad_soyad}
                onChange={(e) => setad_soyad(e.target.value)}
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
            <div>
              <label className="block text-gray-700">Mail</label>
              <input
                type="mail"
                value={mail}
                onChange={(e) => setmail(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Şifre</label>
              <input
                type="text"
                value={sifre}
                onChange={(e) => setsifre(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Görev</label>
              <input
                type="text"
                value={gorev}
                onChange={(e) => setgorev(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Firma ID</label>
              <input
                type="number"
                value={firma_id}
                onChange={(e) => setfirma_id(e.target.value)}
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
