import React, { useState, useEffect, useCallback, useContext } from "react";
import Header from "../Header";
import AddModal from "./AddModal";
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
  const [faturalar, setfaturalar] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  // 1) Veri çekme fonksiyonu
  const fetchfaturalar = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/faturalar/list");
      const filtered = response.data.filter(item => item.firma_id === userFirmaId);
      setfaturalar(filtered);
    } catch (error) {
      console.error("API error:", error);
    }
  }, [userFirmaId]);

  // 2) İlk yüklemede ve fetchPersoneller değiştiğinde çağır
  useEffect(() => {
    fetchfaturalar();
  }, [fetchfaturalar]);


  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Fatura No",
      "Cari ID",
      "KDV Tutar",
      "Genel Toplam",
      "Ödeme Tipi",
      "Döviz Tipi",
      "Fatura/İrsaliye",
      "Muhasebe kodu",
      "Tarih",
    ];

    const formattedData = faturalar.map(
      ({
        fatura_id,
        fatura_no,
        cari_id,
        kdv_tutar,
        genel_toplam,
        odeme_tipi,
        doviz_tipi,
        belge_turu,
        durum,
        tarih,
      }) => ({
        "ID": fatura_id,
        "Fatura No": fatura_no,
        "Cari ID": cari_id,
        "KDV Tutar": kdv_tutar,
        "Genel Toplam": genel_toplam,
        "Ödeme Tipi": odeme_tipi,
        "Döviz Tipi": doviz_tipi,
        "Fatura/İrsaliye": belge_turu,
        "Muhasebe kodu": durum,
        "Tarih": formatDate(tarih),
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faturalar");
    XLSX.writeFile(workbook, "Faturalar.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Faturalar", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
          "Fatura No",
          "Cari ID",
          "KDV Tutar",
          "Genel Toplam",
          "Ödeme Tipi",
          "Döviz Tipi",
          "Fatura/İrsaliye",
          "Muhasebe kodu",
          "Tarih",
        ],
      ],
      body: faturalar.map(
        ({
          fatura_id,
          fatura_no,
          cari_id,
          kdv_tutar,
          genel_toplam,
          odeme_tipi,
          doviz_tipi,
          belge_turu,
          durum,
          tarih,
        }) => [
            fatura_id,
            fatura_no,
            cari_id,
            kdv_tutar,
            genel_toplam,
            odeme_tipi,
            doviz_tipi,
            belge_turu,
            durum,
            formatDate(tarih),
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Faturalar.pdf");
  };

  const filteredfaturalar = searchTerm
    ? faturalar.filter((fatura) => {
      return (
        (fatura.fatura_no && fatura.fatura_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fatura.odeme_tipi && fatura.odeme_tipi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fatura.doviz_tipi && fatura.doviz_tipi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fatura.durum && fatura.durum.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (fatura.belge_turu && fatura.belge_turu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : faturalar;

  const totalPages = Math.ceil(filteredfaturalar.length / recordsPerPage);
  const currentPersoneller = filteredfaturalar.slice(
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

  const handleDelete = async (fatura) => {
    const isConfirmed = window.confirm(`${fatura.fatura_no} numaralı fatura silinecek. Bu işlemi yapmak istediğinizden emin misiniz?`);
    if (!isConfirmed) return;
    console.log(fatura)
    try {
      const response = await axios.delete(`http://localhost:5127/api/faturalar/delete`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: fatura, // <-- Burada tüm nesneyi gönderiyoruz
      });
      if (response.status === 200) {
        window.alert("Fatura başarıyla silindi.");
        setfaturalar(faturalar.filter((item) => item.fatura_no !== fatura.fatura_no));
      } else {
        console.error("Silme işlemi başarısız oldu:", response.data);
      }
    } catch (error) {
      console.error("API error:", error);
      window.alert("Fatura silinemedi. Hata: " + error.message);
    }
  };

  const handleAddNew = () => {
    setAddModalOpen(true);
  };

  // 3) AddModal’a callback olarak veriyoruz
  const handleAddSuccess = () => {
    window.alert("Fatura başarıyla eklendi. Carideki bakiye güncellendi ve firma hareketi, stok, stok bakiyesi eklendi.");
    fetchfaturalar();
    setAddModalOpen(false);
  };

  const formatDate = dateStr =>
    dateStr ? new Date(dateStr).toLocaleDateString('tr-TR') : "";

  return (
    <>
      <div className="flex-1 flex flex-col bg-gray-100 ml-64 min-h-screen">
        <Header />
        <div className="p-6 flex flex-col justify-center items-center">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-6xl">
            <div className="bg-blue-500 text-white flex justify-between items-center py-4 px-6 rounded-t-lg">
              <h1 className="text-xl font-bold" style={{ pointerEvents: "none" }}>
                Faturalar
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
                  onClick={() => navigate("/FaturaKalemleri")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-2 rounded"
                >
                  Fatura Kalemleri
                </button>
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
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Fatura No</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Cari ID</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>KDV Tutar</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Genel Toplam</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Ödeme Tipi</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Döviz Tipi</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Fatura/İrsaliye</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Muhasebe Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Tarih</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {currentPersoneller.length > 0 ? (
                  currentPersoneller.map((fatura) => (
                    <tr key={fatura.fatura_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.fatura_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.fatura_no}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.cari_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.kdv_tutar}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.genel_toplam}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.odeme_tipi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.doviz_tipi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.belge_turu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{fatura.durum}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{formatDate(fatura.tarih)}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => navigate(`/Print/${fatura.fatura_id}`)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Yazdır"
                          >
                            {/* Yazdır ikonu (printer) */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round"
                                d="M6 9V2h12v7M6 18h12v-5H6v5zm0 0H4a2 2 0 01-2-2v-3a2
           2 0 012-2h2m12 7h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(fatura)}
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
                      Faturalar bulunamadı.
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
                  {Math.min(currentPage * recordsPerPage, filteredfaturalar.length)} of {filteredfaturalar.length}
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
    </>
  );
};

export default Tablo;
