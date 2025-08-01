import React, { useState,useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const AddModal = ({ isOpen, onClose,onAddSuccess  }) => {
    const { user } = useContext(AuthContext);            // ← buradan alıyoruz
    const firmaId = user?.firma_id;
  const [depo_kodu, setdepo_kodu] = useState("");
  const [depo_adi, setdepo_adi] = useState("");
  const [kart_durumu, setkart_durumu] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newPersonel = {
        Depo_kodu: depo_kodu,
        Depo_adi: depo_adi,
        Kart_durumu: kart_durumu,
        firma_id: firmaId, 
      };

      const response = await axios.post("http://localhost:5127/api/depolar/add", newPersonel);

      if (onAddSuccess) {
        onAddSuccess(response.data);
      }

      setdepo_kodu("");
      setdepo_adi("");
      setkart_durumu("");
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
        <h2 className="text-xl font-bold mb-4 text-center" style={{ pointerEvents: 'none' }}>Depo Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Depo Kodu</label>
              <input
                type="text"
                value={depo_kodu}
                onChange={(e) => setdepo_kodu(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Depo Adı</label>
              <input
                type="text"
                value={depo_adi}
                onChange={(e) => setdepo_adi(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Kart Durumu</label>
              <select
                value={kart_durumu}
                onChange={(e) => setkart_durumu(e.target.value)}
                className="w-full border px-3 py-2 mt-1 rounded"
                required
              >
                <option value="" disabled>Seçiniz…</option>
                <option value="A">A</option>
                <option value="P">P</option>
              </select>
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
