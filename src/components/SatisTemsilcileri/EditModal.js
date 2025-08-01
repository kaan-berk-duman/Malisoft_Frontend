import React, { useState, useEffect,useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
const EditModal = ({ isOpen, onClose, onSave, temsilci }) => {
    const { user } = useContext(AuthContext);            // ← buradan alıyoruz
    const firmaId = user?.firma_id;
  const [editedtemsilci, setEditedtemsilci] = useState(temsilci || {});

  useEffect(() => {
    if (isOpen && temsilci) {
      setEditedtemsilci(temsilci);
    }
  }, [isOpen, temsilci]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedtemsilci((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Burada payload'u açıkça oluşturup id'yi de ekliyoruz
    const payload = {
      satis_temsilci_kodu: editedtemsilci.satis_temsilci_kodu,
      satis_temsilci_adi: editedtemsilci.satis_temsilci_adi,
      kart_durumu: editedtemsilci.kart_durumu,
      satis_temsilci_mail: editedtemsilci.satis_temsilci_mail,
      satis_temsilci_telefon: editedtemsilci.satis_temsilci_telefon,
      satis_temsilci_sube: editedtemsilci.satis_temsilci_sube,
       firma_id: firmaId,  
    };

    try {
      const response = await fetch(
        "http://localhost:5127/api/satistemsilcisi/update",
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
      alert("Temsilci güncellenemedi: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4">Temsilci Düzenle</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {/* gizli id alanı */}
          <input type="hidden" name="satis_temsilci_kodu" value={editedtemsilci.satis_temsilci_kodu} />

          {/* Meslek */}
          <div className="mb-4">
            <label className="block text-gray-700">Temsilci Adı</label>
            <input
              type="text"
              name="satis_temsilci_adi"
              value={editedtemsilci.satis_temsilci_adi || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Kart Durumu</label>
            <select
              name="kart_durumu"
              value={editedtemsilci.kart_durumu || ""}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 mt-1 rounded"
            >
              <option value="A">A</option>
              <option value="P">P</option>
            </select>
          </div>


          {/* Telefon */}
          <div className="mb-4">
            <label className="block text-gray-700">Mail</label>
            <input
              type="email"
              name="satis_temsilci_mail"
              value={editedtemsilci.satis_temsilci_mail || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Telefon</label>
            <input
              type="text"
              name="satis_temsilci_telefon"
              value={editedtemsilci.satis_temsilci_telefon || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Şube</label>
            <input
              type="text"
              name="satis_temsilci_sube"
              value={editedtemsilci.satis_temsilci_sube || ""}
              onChange={handleChange}
              className="w-full border px-3 py-2 mt-1 rounded"
            />
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
