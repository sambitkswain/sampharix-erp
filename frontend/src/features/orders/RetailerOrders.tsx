import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, X, CheckCircle2, Truck, Trash2, Filter } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { Button } from "../../components/ui/button";
import API from "../../api/axios";

interface OrderItem { medicineName: string; batchNumber: string; quantity: number; price: number; }
interface DistributorOrder { orderId: number; retailerName: string; retailerPhone: string; totalAmount: number; status: string; orderDate: string; items: OrderItem[]; }

const RetailerOrders = () => {
  const [orders, setOrders] = useState<DistributorOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DistributorOrder | null>(null);
  const [filter, setFilter] = useState<"ALL" | "CREATED" | "SHIPPED">("ALL");

  const fetchOrders = async () => {
    try {
      const response = await API.get("/orders/distributor");
      setOrders(response.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) { alert("Failed to update status."); }
  };

  const handleClearShipped = async () => {
    if(!window.confirm("Are you sure you want to clear all shipped orders?")) return;
    try {
      await API.put("/orders/clear-shipped");
      alert("Shipped orders cleared from view.");
      fetchOrders();
    } catch (error) { alert("Failed to clear orders."); }
  };

 // const pendingOrdersCount = orders.filter(o => o.status === "CREATED").length;
  const displayedOrders = orders.filter(o => filter === "ALL" ? true : o.status === filter);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        <Navbar />

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3"><ClipboardList className="text-blue-600" size={32} />Retailer Orders</h2>
              <p className="text-slate-500 mt-1">Review and fulfill purchase orders.</p>
            </motion.div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <Filter size={18} className="text-slate-400 mr-2" />
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-transparent outline-none font-bold text-slate-700">
                  <option value="ALL">All Orders</option>
                  <option value="CREATED">Pending Only</option>
                  <option value="SHIPPED">Shipped Only</option>
                </select>
              </div>
              <Button onClick={handleClearShipped} className="bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2 font-bold px-4 py-2 rounded-xl">
                <Trash2 size={18} /> Clear Shipped
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {displayedOrders.map((order) => (
              <div key={order.orderId} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">Order #{order.orderId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'CREATED' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{order.status}</span>
                  </div>
                  <p className="text-slate-500 font-medium">Buyer: <span className="text-slate-900 font-bold">{order.retailerName}</span></p>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="text-right flex-1 md:flex-none">
                    <p className="text-sm text-slate-500 font-semibold">Order Total</p>
                    <p className="text-2xl font-black text-slate-800">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <Button onClick={() => setSelectedOrder(order)} className="bg-slate-900 hover:bg-slate-800 text-white px-6">View Details</Button>
                </div>
              </div>
            ))}
            {displayedOrders.length === 0 && <div className="text-center py-20 text-slate-400 font-semibold text-lg bg-white rounded-2xl border border-slate-100 shadow-sm">No orders match this filter.</div>}
          </div>
        </div>

        <AnimatePresence>
          {selectedOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden">
                <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
                  <div><h3 className="text-2xl font-bold">Order #{selectedOrder.orderId} Details</h3><p className="text-slate-500">Buyer: {selectedOrder.retailerName}</p></div>
                  <button onClick={() => setSelectedOrder(null)}><X size={24} className="text-slate-400" /></button>
                </div>
                <div className="p-8">
                  <table className="w-full text-left border-collapse mb-8">
                    <thead className="border-b text-slate-500 uppercase text-xs"><tr><th className="pb-3">Medicine (Batch)</th><th className="pb-3 text-center">Qty</th><th className="pb-3 text-right">Price</th><th className="pb-3 text-right">Total</th></tr></thead>
                    <tbody className="divide-y">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-4"><p className="font-bold">{item.medicineName}</p><p className="text-xs text-slate-500">{item.batchNumber}</p></td>
                          <td className="py-4 text-center font-semibold">{item.quantity}</td>
                          <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                          <td className="py-4 text-right font-bold text-emerald-600">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center pt-6 border-t">
                    <div className="text-3xl font-black">Total: ₹{selectedOrder.totalAmount.toFixed(2)}</div>
                    {selectedOrder.status === 'CREATED' ? (
                      <Button onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, 'SHIPPED')} className="bg-blue-600 text-white flex gap-2 px-8 py-6 text-lg rounded-xl shadow-md"><Truck size={20} /> Mark as Shipped</Button>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100"><CheckCircle2 size={24} /> Order Shipped</div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default RetailerOrders;