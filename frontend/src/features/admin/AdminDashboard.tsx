import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Clock, CheckCircle, ShieldCheck, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import API from "../../api/axios";

interface User {
  id: number;
  businessName: string;
  email: string;
  contactNumber: string;
  role: string;
  approvalStatus: "PENDING" | "APPROVED";
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    try {
      const response = await API.get("/admin/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await API.put(`/admin/users/${id}/approve`);
      fetchUsers();
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Error approving user.");
    }
  };

  // NEW: Handle Delete
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to permanently delete this partner?")) {
      try {
        await API.delete(`/admin/users/${id}`);
        fetchUsers(); // Refresh the table after deletion
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Error deleting user.");
      }
    }
  };

  const totalUsers = users.length;
  const pendingUsers = users.filter((u) => u.approvalStatus === "PENDING").length;
  const activeUsers = users.filter((u) => u.approvalStatus === "APPROVED").length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />

        <div className="p-8 max-w-7xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Admin Overview</h2>
            <p className="text-slate-500 mt-1">Manage platform access and network participants.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Users size={28} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Total Registrations</p>
                  <h3 className="text-3xl font-bold">{totalUsers}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-4 bg-amber-50 rounded-xl text-amber-600"><Clock size={28} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Pending Approvals</p>
                  <h3 className="text-3xl font-bold">{pendingUsers}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle size={28} /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Active Partners</p>
                  <h3 className="text-3xl font-bold">{activeUsers}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold">Network Participants</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4 border-b">Business Name</th>
                    <th className="p-4 border-b">Contact</th>
                    <th className="p-4 border-b">Role</th>
                    <th className="p-4 border-b">Status</th>
                    <th className="p-4 border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-800">{user.businessName}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </td>
                      <td className="p-4 font-medium">{user.contactNumber || "N/A"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'DISTRIBUTOR' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'RETAILER' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center gap-1.5 text-sm font-bold ${
                          user.approvalStatus === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {user.approvalStatus === 'APPROVED' ? <CheckCircle size={16}/> : <Clock size={16}/>}
                          {user.approvalStatus}
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-end gap-2">
                        {user.approvalStatus === "PENDING" ? (
                          <Button 
                            onClick={() => handleApprove(user.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2"
                          >
                            <ShieldCheck size={16} /> Approve
                          </Button>
                        ) : (
                          <span className="text-slate-400 text-sm font-medium px-4">Authorized</span>
                        )}
                        
                        <Button 
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No users found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;