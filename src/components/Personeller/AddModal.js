import React, { useState,useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const AddModal = ({ isOpen, onClose,onAddSuccess  }) => {
    const { user } = useContext(AuthContext);            // ← buradan alıyoruz
    const firmaId = user?.firma_id;
  const [ad_soyad, setad_soyad] = useState("");
  const [meslek, setmeslek] = useState("");
  const [maas, setmaas] = useState("");
  const [telefon, settelefon] = useState("");
  const [mail, setmail] = useState("");
  const [giris, setgiris] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPersonel = {
        Personel_ad_soyad: ad_soyad,
        Personel_meslek: meslek,
        Personel_maas: maas,
        Personel_telefon: telefon,
        Personel_mail: mail,
        Personel_giris_tarihi: giris,
        firma_id: firmaId,  
      };

      const response = await axios.post("http://localhost:5127/api/personeller/add", newPersonel);

      if (onAddSuccess) {
        onAddSuccess(response.data);
      }

      setad_soyad("");
      setmeslek("");
      setmaas("");
      settelefon("");
      setmail("");
      setgiris("");
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
        <h2 className="text-xl font-bold mb-4 text-center" style={{ pointerEvents: 'none' }}>Personel Ekle</h2>
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
              <label className="block text-gray-700">Meslek</label>
              <input
                type="text"
                value={meslek}
                onChange={(e) => setmeslek(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Maaş</label>
              <input
                type="text"
                value={maas}
                onChange={(e) => setmaas(e.target.value)}
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
                type="email"
                value={mail}
                onChange={(e) => setmail(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Giriş Tarihi</label>
              <input
                type="date"
                value={giris}
                onChange={(e) => setgiris(e.target.value)}
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
