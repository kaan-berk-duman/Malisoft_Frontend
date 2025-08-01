import React, { useState, useEffect, useCallback, useContext } from "react";
import Header from "../Header";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../assets/fonts/Roboto-Regular";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const Tablo = () => {
  const { user } = useContext(AuthContext);
  const userFirmaId = user?.firma_id;
  const [temsilci, setTemsilci] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [temsilciToEdit, setTemsilciToEdit] = useState(null);

  // 1) Veri çekme fonksiyonu
  const fetchTemsilciler = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/satistemsilcisi/list");
      const filtered = response.data.filter(item => item.firma_id === userFirmaId);
      setTemsilci(filtered);
    } catch (error) {
      console.error("API error:", error);
    }
  }, [userFirmaId]);

  // 2) İlk yüklemede ve fetchPersoneller değiştiğinde çağır
  useEffect(() => {
    fetchTemsilciler();
  }, [fetchTemsilciler]);

  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Temsilci Kodu",
      "Temsilci Adı",
      "Kart Durumu",
      "Mail",
      "Telefon",
      "Şube",
    ];

    const formattedData = temsilci.map(
      ({
        satis_temsilci_id,
        satis_temsilci_kodu,
        satis_temsilci_adi,
        kart_durumu,
        satis_temsilci_mail,
        satis_temsilci_telefon,
        satis_temsilci_sube,
      }) => ({
        "ID": satis_temsilci_id,
        "Temsilci Kodu": satis_temsilci_kodu,
        "Temsilci Adı": satis_temsilci_adi,
        "Kart Durumu": kart_durumu,
        "Mail": satis_temsilci_mail,
        "Telefon": satis_temsilci_telefon,
        "Şube": satis_temsilci_sube,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SatışTemsilciler");
    XLSX.writeFile(workbook, "SatışTemsilciler.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("SatışTemsilciler", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "Temsilci Kodu",
          "Temsilci Adı",
          "Kart Durumu",
          "Mail",
          "Telefon",
          "Şube",
        ],
      ],
      body: temsilci.map(
        ({
          satis_temsilci_id,
          satis_temsilci_kodu,
          satis_temsilci_adi,
          kart_durumu,
          satis_temsilci_mail,
          satis_temsilci_telefon,
          satis_temsilci_sube,
        }) => [
            satis_temsilci_id,
            satis_temsilci_kodu,
            satis_temsilci_adi,
            kart_durumu,
            satis_temsilci_mail,
            satis_temsilci_telefon,
            satis_temsilci_sube,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("SatışTemsilciler.pdf");
  };

  const filteredPersoneller = searchTerm
    ? temsilci.filter((temsilcisi) => {
      return (
        (temsilcisi.satis_temsilci_kodu && temsilcisi.satis_temsilci_kodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (temsilcisi.satis_temsilci_adi && temsilcisi.satis_temsilci_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (temsilcisi.kart_durumu && temsilcisi.kart_durumu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (temsilcisi.satis_temsilci_mail && temsilcisi.satis_temsilci_mail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (temsilcisi.satis_temsilci_telefon && temsilcisi.satis_temsilci_telefon.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (temsilcisi.satis_temsilci_sube && temsilcisi.satis_temsilci_sube.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : temsilci;

  const totalPages = Math.ceil(filteredPersoneller.length / recordsPerPage);
  const currentPersoneller = filteredPersoneller.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleRecordsPerPageChange = (event) => {
    setRecordsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleDelete = async (satis_temsilci_kodu,firma_id) => {
    const isConfirmed = window.confirm(`${satis_temsilci_kodu} numaralı satış temsilcisi silinecek. Bu işlemi yapmak istediğinizden emin misiniz?`);
    if (!isConfirmed) return; // Kullanıcı silme işlemini onaylamazsa işlem yapılmaz
    console.log(satis_temsilci_kodu);
    try {
      const response = await axios.delete(`http://localhost:5127/api/satistemsilcisi/delete`, {
        params: { Satis_temsilci_kodu: satis_temsilci_kodu, firma_id:firma_id },
      });
      if (response.status === 200) {
        window.alert("Temsilci başarıyla silindi.");
        setTemsilci(temsilci.filter((temsilci) => temsilci.satis_temsilci_kodu !== satis_temsilci_kodu));

      } else {
        console.error("Silme işlemi başarısız oldu:", response.data);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };

  const handleEdit = (satis_temsilci_id) => {
    const temsilciToEdit = temsilci.find((temsilci) => temsilci.satis_temsilci_id === satis_temsilci_id);
    setTemsilciToEdit(temsilciToEdit);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setAddModalOpen(true);
  };

  // 3) AddModal’a callback olarak veriyoruz
  const handleAddSuccess = () => {
    window.alert("Temsilci başarıyla eklendi.");
    fetchTemsilciler();
    setAddModalOpen(false);
  };

  // 4) EditModal’da da benzer bir callback kullanabilirsiniz:
  const handleEditSuccess = () => {
    window.alert("Temsilci başarıyla güncellendi.");
    fetchTemsilciler();
    setEditModalOpen(false);
  };

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
        <Header />
        <div className="p-6 flex flex-col justify-center items-center">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl">
            <div className="bg-blue-500 text-white flex justify-between items-center py-4 px-6 rounded-t-lg">
              <h1 className="text-xl font-bold" style={{ pointerEvents: "none" }}>
                Satış Temsilcileri
              </h1>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border rounded px-2 py-1 text-black"
                />
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 text-white hover:bg-blue-700 rounded-full p-2 flex items-center justify-center"
                  title="Add New"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>
            <table className="min-w-full bg-white border-collapse printable-area">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>ID</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Temsilci Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Temsilci Adı</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Kart Durumu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Mail</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Telefon</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Şube</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {currentPersoneller.length > 0 ? (
                  currentPersoneller.map((temsilci) => (
                    <tr key={temsilci.satis_temsilci_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_kodu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_adi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.kart_durumu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_mail}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_telefon}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{temsilci.satis_temsilci_sube}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(temsilci.satis_temsilci_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(temsilci.satis_temsilci_kodu, temsilci.firma_id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-1 12a2 2 0 01-2 2H8a2 2 0 01-2-2L5 7m5 4v6m4-6v6m1-11V4a2 2 0 00-2-2H9a2 2 0 00-2 2v2m12 0H5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500" style={{ pointerEvents: "none" }}>
                      Satış temsilcisi bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center p-4 border-t">
              <div className="flex items-center gap-3">
                <label htmlFor="recordsPerPage" className="text-sm font-medium text-gray-700">
                  Sayfa başına gösterilecek satır sayısı:
                </label>
                <select
                  id="recordsPerPage"
                  value={recordsPerPage}
                  onChange={handleRecordsPerPageChange}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out shadow-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600"
                >
                  Excel'e Aktar
                </button>
                <button
                  onClick={exportToPDF}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
                >
                  PDF'ye Aktar
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700" style={{ pointerEvents: "none" }}>
                  {currentPage * recordsPerPage - recordsPerPage + 1}-
                  {Math.min(currentPage * recordsPerPage, filteredPersoneller.length)} of {filteredPersoneller.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAddSuccess={handleAddSuccess} />
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} temsilci={temsilciToEdit} onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
