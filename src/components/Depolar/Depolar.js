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
  const [depolar, setDepolar] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [depolarToEdit, setDepolarToEdit] = useState(null);

  // 1) Veri çekme fonksiyonu
  const fetchDepolar = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/depolar/list");
       const filtered = response.data.filter(item => item.firma_id === userFirmaId);
      setDepolar(filtered);
    } catch (error) {
      console.error("API error:", error);
    }
  }, [userFirmaId]);

  useEffect(() => {
    fetchDepolar();
  }, [fetchDepolar]);


  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Depo Kodu",
      "Depo Adı",
      "Kart Durumu",
    ];

    const formattedData = depolar.map(
      ({
        depo_id,
        depo_kodu,
        depo_adi,
        kart_durumu,
      }) => ({
        "ID": depo_id,
        "Depo Kodu": depo_kodu,
        "Depo Adı": depo_adi,
        "Kart Durumu": kart_durumu,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Depolar");
    XLSX.writeFile(workbook, "Depolar.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Depolar", 14, 10);
    doc.autoTable({
      head: [
       [
          "ID",
          "Depo Kodu",
          "Depo Adı",
          "Kart Durumu",
        ]
      ],
      body: depolar.map(
        ({
          depo_id,
        depo_kodu,
        depo_adi,
        kart_durumu,
        }) => [
          depo_id,
          depo_kodu,
          depo_adi,
          kart_durumu,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Depolar.pdf");
  };

  const filteredDepolar = searchTerm
    ? depolar.filter((depo) => {
      return (
        (depo.depo_kodu && depo.depo_kodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (depo.depo_adi && depo.depo_adi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (depo.kart_durumu && depo.kart_durumu.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : depolar;

  const totalPages = Math.ceil(filteredDepolar.length / recordsPerPage);
  const currentDepolar = filteredDepolar.slice(
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

  const handleDelete = async (depo_kodu,firma_id) => {
    const isConfirmed = window.confirm(`${depo_kodu} numaralı depo silinecek. Bu işlemi yapmak istediğinizden emin misiniz?`);
    if (!isConfirmed) return; // Kullanıcı silme işlemini onaylamazsa işlem yapılmaz
  
    try {
      const response = await axios.delete(`http://localhost:5127/api/depolar/delete`, {
        params: { depoKodu: depo_kodu, firma_id: firma_id },
      });
      if (response.status === 200) {
        setDepolar(depolar.filter((depo) => depo.depo_kodu !== depo_kodu));
        window.alert("Depo başarıyla silindi.");
      } else {
        console.error("Silme işlemi başarısız oldu:", response.data);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };  

  const handleEdit = (depo_id) => {
    const depoToEdit = depolar.find((depo) => depo.depo_id === depo_id);
    setDepolarToEdit(depoToEdit);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setAddModalOpen(true);
  };

   // 3) AddModal’a callback olarak veriyoruz
   const handleAddSuccess = () => {
    window.alert("Depo başarıyla eklendi.");
    fetchDepolar();
    setAddModalOpen(false);
  };

  // 4) EditModal’da da benzer bir callback kullanabilirsiniz:
  const handleEditSuccess = () => {
    window.alert("Depo başarıyla güncellendi.");
    fetchDepolar();
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
                Depolar
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
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Depo Kodu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Depo Adı</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Kart Durumu</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {currentDepolar.length > 0 ? (
                  currentDepolar.map((depo) => (
                    <tr key={depo.depo_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{depo.depo_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{depo.depo_kodu}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{depo.depo_adi}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{depo.kart_durumu}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(depo.depo_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(depo.depo_kodu, depo.firma_id)}
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
                      Depo bulunamadı.
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
                  {Math.min(currentPage * recordsPerPage, filteredDepolar.length)} of {filteredDepolar.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                      currentPage === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {"<"}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                      currentPage === totalPages
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium shadow-sm transition-colors ${
                      currentPage === totalPages
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

      <AddModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onAddSuccess={handleAddSuccess}/>
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} depo={depolarToEdit}  onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
