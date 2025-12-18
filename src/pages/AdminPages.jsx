import { adminService, counselorService } from '../services/mockApi';

export function AdminUserManagement() {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) adminService.uploadUserList(file).then(() => alert("Users uploaded!"));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <h3 className="font-semibold mb-4">Bulk User Registration</h3>
        <p className="text-sm text-gray-600 mb-4">Upload an Excel file (.xlsx) containing student details.</p>
        <input type="file" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
      </div>
    </div>
  );
}

export function CounselorTools() {
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) counselorService.uploadMCQ(file).then(() => alert("MCQ CSV uploaded!"));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Counselor Tools</h2>
      <div className="bg-white p-6 rounded shadow max-w-xl">
        <h3 className="font-semibold mb-4">Upload MCQ Data</h3>
        <p className="text-sm text-gray-600 mb-4">Upload a CSV file for the student MCQ system.</p>
        <input type="file" accept=".csv" onChange={handleCSVUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
      </div>
    </div>
  );
}