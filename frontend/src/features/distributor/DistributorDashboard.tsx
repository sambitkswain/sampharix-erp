import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, AlertTriangle, Plus, Search, X, Edit3 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import API from "../../api/axios";

interface InventoryItem {
  id: number;
  medicineName: string;
  manufacturer: string;
  batchNumber: string;
  purchasePrice: number;
  mrp: number;
  quantity: number;
  expiryDate: string;
}

const DistributorDashboard = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create New Batch Modal State
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: "", manufacturer: "", gstPercentage: "12", batchNumber: "", purchasePrice: "", mrp: "", quantity: "", expiryDate: ""
  });

  // RESTOCK / EDIT MODAL STATE
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<InventoryItem | null>(null);
  const [restockForm, setRestockForm] = useState({
    addedQty: "",
    purchasePrice: "",
    mrp: "",
    expiryDate: ""
  });

  const fetchInventory = async () => {
    try {
      const response = await API.get("/inventory/all");
      setInventory(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory", error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/inventory/add", {
        ...newMedicine,
        gstPercentage: parseFloat(newMedicine.gstPercentage),
        purchasePrice: parseFloat(newMedicine.purchasePrice),
        mrp: parseFloat(newMedicine.mrp),
        quantity: parseInt(newMedicine.quantity, 10)
      });
      alert("New Batch Added Successfully!");
      setIsAddBatchModalOpen(false);
      setNewMedicine({ name: "", manufacturer: "", gstPercentage: "12", batchNumber: "", purchasePrice: "", mrp: "", quantity: "", expiryDate: "" });
      fetchInventory(); 
    } catch (error) {
      alert("Error adding batch.");
    }
  };

  // OPEN MODAL AND PRE-FILL CURRENT VALUES
  const openUpdateModal = (item: InventoryItem) => {
    setSelectedStock(item);
    setRestockForm({
      addedQty: "",
      purchasePrice: item.purchasePrice.toString(),
      mrp: item.mrp.toString(),
      expiryDate: item.expiryDate || ""
    });
    setIsUpdateModalOpen(true);
  };

  // SUBMIT RESTOCK & PRICE UPDATE
  const handleUpdateStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    try {
      await API.put(`/inventory/stock/${selectedStock.id}/update`, { 
        addedQty: restockForm.addedQty ? parseInt(restockForm.addedQty, 10) : 0,
        purchasePrice: restockForm.purchasePrice ? parseFloat(restockForm.purchasePrice) : null,
        mrp: restockForm.mrp ? parseFloat(restockForm.mrp) : null,
        expiryDate: restockForm.expiryDate || null
      });
      alert(`Batch ${selectedStock.batchNumber} updated successfully!`);
      setIsUpdateModalOpen(false);
      fetchInventory(); 
    } catch (error) {
      alert("Failed to update stock details.");
    }
  };

  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(m => m.quantity < 500).length;
  const filteredInventory = inventory.filter(m => 
    m.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <Navbar />

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-slate-800">Distributor Operations</h2>
              <p className="text-slate-500 mt-1">Manage warehouse stock and market pricing.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-l-4 border-blue-500"><CardContent className="flex items-center gap-4 p-6"><div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Package size={28} /></div><div><p className="text-sm font-semibold text-slate-500">Unique Batches</p><h3 className="text-3xl font-bold">{totalItems}</h3></div></CardContent></Card>
            <Card className="border-l-4 border-amber-500"><CardContent className="flex items-center gap-4 p-6"><div className="p-4 bg-amber-50 rounded-xl text-amber-600"><AlertTriangle size={28} /></div><div><p className="text-sm font-semibold text-slate-500">Low Stock Alerts</p><h3 className="text-3xl font-bold">{lowStockCount}</h3></div></CardContent></Card>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Current Stock & Pricing</h3>
              <div className="flex gap-4">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="Search name or batch..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <Button onClick={() => setIsAddBatchModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Plus size={18} /> Add New Batch
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                  <tr>
                    <th className="p-4 border-b">Medicine Name</th>
                    <th className="p-4 border-b">Batch Number</th>
                    <th className="p-4 border-b text-right">Purchase (₹)</th>
                    <th className="p-4 border-b text-right">Selling (₹)</th>
                    <th className="p-4 border-b text-center">Stock</th>
                    <th className="p-4 border-b">Expiry Date</th>
                    <th className="p-4 border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-4 font-bold">{item.medicineName}<div className="text-sm text-slate-500 font-normal">{item.manufacturer}</div></td>
                      <td className="p-4 font-mono text-sm">{item.batchNumber}</td>
                      <td className="p-4 text-right font-medium">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium text-emerald-600">₹{item.mrp.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.quantity < 500 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600">{item.expiryDate}</td>
                      <td className="p-4">
                        <Button 
                          onClick={() => openUpdateModal(item)} 
                          className="bg-slate-100 hover:bg-slate-200 text-blue-600 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 font-bold w-full transition-colors"
                        >
                          <Edit3 size={16} /> Restock / Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredInventory.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400">No stock found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RESTOCK / PRICE EDIT MODAL --- */}
        <AnimatePresence>
          {isUpdateModalOpen && selectedStock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-5 border-b flex justify-between items-center bg-slate-50">
                  <h3 className="text-xl font-bold flex items-center gap-2"><Edit3 className="text-blue-600"/> Update Batch: {selectedStock.batchNumber}</h3>
                  <button onClick={() => setIsUpdateModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-700" /></button>
                </div>
                <form className="p-6 space-y-4" onSubmit={handleUpdateStockSubmit}>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-2">
                    <p className="text-xs text-slate-500">Medicine</p>
                    <p className="font-bold text-base">{selectedStock.medicineName}</p>
                    <p className="text-xs text-blue-600 mt-1">Current Stock on Shelf: {selectedStock.quantity} Units</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Add Incoming Qty (Leave blank if pricing change only)</label>
                    <input 
                      type="number" 
                      min="0"
                      value={restockForm.addedQty} 
                      onChange={(e) => setRestockForm({...restockForm, addedQty: e.target.value})} 
                      placeholder="e.g. 200"
                      className="w-full border p-3 rounded-xl font-bold" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">New Purchase Price (₹)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={restockForm.purchasePrice} 
                        onChange={(e) => setRestockForm({...restockForm, purchasePrice: e.target.value})} 
                        className="w-full border p-3 rounded-xl" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1">New Selling Price / MRP (₹)</label>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={restockForm.mrp} 
                        onChange={(e) => setRestockForm({...restockForm, mrp: e.target.value})} 
                        className="w-full border p-3 rounded-xl" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Expiry Date</label>
                    <input 
                      type="date" 
                      value={restockForm.expiryDate} 
                      onChange={(e) => setRestockForm({...restockForm, expiryDate: e.target.value})} 
                      className="w-full border p-3 rounded-xl" 
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" onClick={() => setIsUpdateModalOpen(false)} className="bg-slate-100 text-slate-700 px-6">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6">Save Changes</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- ADD NEW BATCH MODAL --- */}
        <AnimatePresence>
          {isAddBatchModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8">
                <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50 rounded-t-3xl">
                  <h3 className="text-2xl font-bold">Add Brand New Batch</h3>
                  <button onClick={() => setIsAddBatchModalOpen(false)}><X size={24} className="text-slate-400" /></button>
                </div>
                <form className="p-8" onSubmit={handleAddStock}>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="col-span-2 md:col-span-1"><label className="block text-sm font-semibold mb-2">Medicine Name</label><input type="text" required value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                    <div className="col-span-2 md:col-span-1"><label className="block text-sm font-semibold mb-2">Manufacturer</label><input type="text" required value={newMedicine.manufacturer} onChange={(e) => setNewMedicine({...newMedicine, manufacturer: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Batch Number</label><input type="text" required value={newMedicine.batchNumber} onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})} className="w-full border p-3 rounded-xl uppercase" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Expiry Date</label><input type="date" required value={newMedicine.expiryDate} onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Purchase Price (₹)</label><input type="number" step="0.01" required value={newMedicine.purchasePrice} onChange={(e) => setNewMedicine({...newMedicine, purchasePrice: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                    <div><label className="block text-sm font-semibold mb-2">Selling Price (₹)</label><input type="number" step="0.01" required value={newMedicine.mrp} onChange={(e) => setNewMedicine({...newMedicine, mrp: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                    <div><label className="block text-sm font-semibold mb-2">GST Percentage (%)</label>
                      <select value={newMedicine.gstPercentage} onChange={(e) => setNewMedicine({...newMedicine, gstPercentage: e.target.value})} className="w-full border p-3 rounded-xl">
                        <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-semibold mb-2">Initial Stock Quantity</label><input type="number" required value={newMedicine.quantity} onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})} className="w-full border p-3 rounded-xl" /></div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <Button type="button" onClick={() => setIsAddBatchModalOpen(false)} className="bg-slate-200 text-slate-700">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 text-white">Save Inventory</Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DistributorDashboard;