import React, { useState, useEffect, useCallback, useContext } from "react";
import Header from "../Header";
import EditModal from "./EditModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../assets/fonts/Roboto-Regular";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

const Tablo = () => {
    const { user } = useContext(AuthContext);
    const userFirmaId = user?.firma_id;
  const [stoklar, setstoklar] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [stokToEdit, setstokToEdit] = useState(null);
  const navigate = useNavigate();
  // 1) Veri çekme fonksiyonu
  const fetchStoklar = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/stoklar/list");
      const filtered = response.data.filter(item => item.firma_id === userFirmaId);
      setstoklar(filtered);
    } catch (error) {
      console.error("API error:", error);
    }
  }, [userFirmaId]);

  // 2) İlk yüklemede ve fetchPersoneller değiştiğinde çağır
  useEffect(() => {
    fetchStoklar();
  }, [fetchStoklar]);


  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Stok Adı",
      "Stok Kodu",
      "Birim",
      "Kredi Kartı?",
      "İskonto?",
      "KDV Oranı",
      "Kart Durumu",
    ];

    const formattedData = stoklar.map(
      ({
        stok_id,
        stok_adi,
        stok_kodu,
        stok_birimi,
        kredi_karti_var_mi,
        iskonto_var_mi,
        kdv_orani,
        kart_durumu,
      }) => ({
        "ID": stok_id,
        "Stok Adı": stok_adi,
        "Stok Kodu": stok_kodu,
        "Birim": stok_birimi,
        "Kredi Kartı?": kredi_karti_var_mi,
        "İskonto?": iskonto_var_mi,
        "KDV Oranı": kdv_orani,
        "Kart Durumu": kart_durumu,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stoklar");
    XLSX.writeFile(workbook, "Stoklar.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Stoklar", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "Stok Adı",
          "Stok Kodu",
          "Birim",
          "Kredi Kartı?",
          "İskonto?",
          "KDV Oranı",
          "Kart Durumu",
        ],
      ],
      body: stoklar.map(
        ({
          stok_id,
          stok_adi,
          stok_kodu,
          stok_birimi,
          kredi_karti_var_mi,
          iskonto_var_mi,
          kdv_orani,
          kart_durumu,
        }) => [
            stok_id,
            stok_adi,
            stok_kodu,
            stok_birimi,
            kredi_karti_var_mi,
            iskonto_var_mi,
            kdv_orani,
            kart_durumu,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Stoklar.pdf");
  };

  const filteredStoklar = searchTerm
    ? stoklar.filter((stok) => {
      return (
        (stok.stok_adi && stok.stok_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stok.stok_kodu && stok.stok_kodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stok.stok_birimi && stok.stok_birimi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stok.kredi_karti_var_mi && stok.kredi_karti_var_mi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stok.iskonto_var_mi && stok.iskonto_var_mi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stok.kart_durumu && stok.kart_durumu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : stoklar;

  const totalPages = Math.ceil(filteredStoklar.length / recordsPerPage);
  const currentPersoneller = filteredStoklar.slice(
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

  const handleEdit = (stok_id) => {
    const stokToEdit = stoklar.find((stok) => stok.stok_id === stok_id);
    setstokToEdit(stokToEdit);
    setEditModalOpen(true);
  };

  // 4) EditModal’da da benzer bir callback kullanabilirsiniz:
  const handleEditSuccess = () => {
    window.alert("Stok başarıyla güncellendi.");
    fetchStoklar();
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
                Stoklar
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
                  onClick={() => navigate("/StokBakiyeleri")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded"
                >
                  Stok Bakiyeleri
                </button>
              </div>
            </div>
            <table className="min-w-full bg-white border-collapse printable-area">
              <thead>
                <tr>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>ID</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Stok Adı</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Stok Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Stok Birimi</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Kredi Kartı?</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>İskonto?</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>KDV Oranı</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Kart Durumu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {currentPersoneller.length > 0 ? (
                  currentPersoneller.map((stok) => (
                    <tr key={stok.stok_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.stok_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.stok_adi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.stok_kodu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.stok_birimi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.kredi_karti_var_mi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.iskonto_var_mi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.kdv_orani}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{stok.kart_durumu}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(stok.stok_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-gray-500" style={{ pointerEvents: "none" }}>
                      Stoklar bulunamadı.
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
                  {Math.min(currentPage * recordsPerPage, filteredStoklar.length)} of {filteredStoklar.length}
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
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} stok={stokToEdit} onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
