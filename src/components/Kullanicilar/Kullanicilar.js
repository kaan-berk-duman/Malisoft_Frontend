import React, { useState, useEffect, useCallback } from "react";
import Header from "../Header";
import AddModal from "./AddModal";
import EditModal from "./EditModal";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import robotoFont from "../../assets/fonts/Roboto-Regular";
import axios from "axios";

const Tablo = () => {
  const [kullanicilar, setkullanicilar] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [kullaniciToEdit, setkullaniciToEdit] = useState(null);

  // 1) Veri çekme fonksiyonu
  const fetchkullanicilar = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5127/api/kullanicilar/list");
      setkullanicilar(response.data);
    } catch (error) {
      console.error("API error:", error);
    }
  }, []);

  // 2) İlk yüklemede ve fetchPersoneller değiştiğinde çağır
  useEffect(() => {
    fetchkullanicilar();
  }, [fetchkullanicilar]);


  // Excel ve PDF dışa aktarma fonksiyonları (aynı kalabilir)
  const exportToExcel = () => {
    const headers = [
      "ID",
      "Ad Soyad",
      "Telefon",
      "Mail",
      "Şifre",
      "Görev",
      "Firma ID"
    ];

    const formattedData = kullanicilar.map(
      ({
        kullanici_id,
        kullanici_ad_soyad,
        kullanici_telefon,
        kullanici_mail,
        kullanici_sifre,
        kullanici_gorev,
        firma_id,
      }) => ({
        "ID": kullanici_id,
        "Ad Soyad": kullanici_ad_soyad,
        "Telefon": kullanici_telefon,
        "Mail": kullanici_mail,
        "Şifre": kullanici_sifre,
        "Görev": kullanici_gorev,
        "Firma ID": firma_id,
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Kullanıcılar");
    XLSX.writeFile(workbook, "Kullanıcılar.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    doc.text("Kullanıcılar", 14, 10);
    doc.autoTable({
      head: [
        [
          "ID",
      "Ad Soyad",
      "Telefon",
      "Mail",
      "Şifre",
      "Görev",
      "Firma ID",
        ],
      ],
      body: kullanicilar.map(
        ({
          kullanici_id,
        kullanici_ad_soyad,
        kullanici_telefon,
        kullanici_mail,
        kullanici_sifre,
        kullanici_gorev,
        firma_id,
        }) => [
          kullanici_id,
          kullanici_ad_soyad,
          kullanici_telefon,
          kullanici_mail,
          kullanici_sifre,
          kullanici_gorev,
          firma_id,
          ]
      ),
      styles: { font: "Roboto" },
    });

    doc.save("Kullanıcılar.pdf");
  };

  const filteredkullanicilar = searchTerm
    ? kullanicilar.filter((kullanici) => {
      return (
        (kullanici.kullanici_ad_soyad && kullanici.kullanici_ad_soyad.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kullanici.kullanici_telefon && kullanici.kullanici_telefon.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kullanici.kullanici_mail && kullanici.kullanici_mail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (kullanici.kullanici_gorev && kullanici.kullanici_gorev.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    })
    : kullanicilar;

  const totalPages = Math.ceil(filteredkullanicilar.length / recordsPerPage);
  const currentPersoneller = filteredkullanicilar.slice(
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

  const handleDelete = async (kullanici_id) => {
    const isConfirmed = window.confirm(`${kullanici_id} numaralı kullanicilar silinecek. Bu işlemi yapmak istediğinizden emin misiniz?`);
    if (!isConfirmed) return; // Kullanıcı silme işlemini onaylamazsa işlem yapılmaz
  
    try {
      const response = await axios.delete(`http://localhost:5127/api/kullanicilar/delete`, {
        params: { kullaniciId: kullanici_id },
      });
      if (response.status === 200) {
        window.alert("Kullanıcı başarıyla silindi.");
        setkullanicilar(kullanicilar.filter((kullanici) => kullanici.kullanici_id !== kullanici_id));

      } else {
        console.error("Silme işlemi başarısız oldu:", response.data);
      }
    } catch (error) {
      console.error("API error:", error);
    }
  };  

  const handleEdit = (kullanici_id) => {
    const kullaniciToEdit = kullanicilar.find((kullanici) => kullanici.kullanici_id === kullanici_id);
    setkullaniciToEdit(kullaniciToEdit);
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setAddModalOpen(true);
  };

   // 3) AddModal’a callback olarak veriyoruz
   const handleAddSuccess = () => {
    window.alert("Kullanıcı başarıyla eklendi.");
    fetchkullanicilar();
    setAddModalOpen(false);
  };

  // 4) EditModal’da da benzer bir callback kullanabilirsiniz:
  const handleEditSuccess = () => {
    window.alert("Kullanıcı başarıyla güncellendi.");
    fetchkullanicilar();
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
                Kullanıcılar
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
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Ad Soyad</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Telefon</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Mail</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Şifre</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Görev</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold" style={{ pointerEvents: "none" }}>Firma ID</th>
                  <th className="text-left py-2 px-4 border-b-2 border-gray-200 text-gray-600 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {currentPersoneller.length > 0 ? (
                  currentPersoneller.map((kullanici) => (
                    <tr key={kullanici.kullanici_id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_ad_soyad}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_telefon}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_mail}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_sifre}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.kullanici_gorev}</td>
                      <td className="py-2 px-4 border-b border-gray-200" style={{ pointerEvents: "none" }}>{kullanici.firma_id}</td>
                      <td className="py-2 px-4 border-b border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEdit(kullanici.kullanici_id)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M16 3l5 5m-5-5L8.5 15.5m0 0L7 19l3.5-1.5" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(kullanici.kullanici_id)}
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
                      Kullanıcı bulunamadı.
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
                  {Math.min(currentPage * recordsPerPage, filteredkullanicilar.length)} of {filteredkullanicilar.length}
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
      <EditModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} kullanici={kullaniciToEdit}  onSave={handleEditSuccess} />
    </>
  );
};

export default Tablo;
