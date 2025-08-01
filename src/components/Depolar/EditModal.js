import React, { useState, useEffect,useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const EditModal = ({ isOpen, onClose, onSave, depo }) => {
      const { user } = useContext(AuthContext);            // ← buradan alıyoruz
      const firmaId = user?.firma_id;
  const [editeddepo, setEditeddepo] = useState(depo || {});

  useEffect(() => {
    if (isOpen && depo) {
      setEditeddepo(depo);
    }
  }, [isOpen, depo]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditeddepo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      Depo_kodu: editeddepo.depo_kodu,
      Depo_adi: editeddepo.depo_adi,
      Kart_durumu: editeddepo.kart_durumu,
      firma_id: firmaId, 
    };

    try {
      const response = await fetch(
        "http://localhost:5127/api/depolar/update",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      // Başarılıysa üst componente bildirip modalı kapat
      onSave(payload);
      onClose();
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Depo güncellenemedi: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Depo Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="depo_kodu" value={editeddepo.depo_kodu} />

          {/* Meslek */}
          <div className="mb-4">
            <label className="block text-gray-700">Depo Adı</label>
            <input
              type="text"
              name="depo_adi"
              value={editeddepo.depo_adi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Kart Durumu</label>
            <select
              name="kart_durumu"
              value={editeddepo.kart_durumu || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            >
              <option value="A">A</option>
              <option value="P">P</option>
            </select>
          </div>

          {/* Butonlar */}
          <div className="col-span-2 flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Geri
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Düzenle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
