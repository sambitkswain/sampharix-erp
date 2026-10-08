import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Wallet, PackageOpen, CreditCard, Search, Plus, Minus, Trash2 } from "lucide-react";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import API from "../../api/axios";

interface MarketplaceItem {
  stockId: number;
  medicineName: string;
  manufacturer: string;
  batchNumber: string;
  distributorId: number;
  distributorName: string;
  price: number;
  mrp: number;
  availableQuantity: number;
  expiryDate: string;
}

interface CartItem extends MarketplaceItem {
  orderQuantity: number;
}

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

const RetailerDashboard = () => {
  const [activeTab, setActiveTab] = useState<"MARKETPLACE" | "POS" | "MY_ORDERS">("MARKETPLACE");
  const [searchQuery, setSearchQuery] = useState("");
  const [marketStock, setMarketStock] = useState<MarketplaceItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // NEW: Track draft quantities for each product card by stockId (default to 1)
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  // POS State
  const [posSearch, setPosSearch] = useState("");
  const [localStock, setLocalStock] = useState<InventoryItem[]>([]);
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  
  const [creditInfo, setCreditInfo] = useState({ creditLimit: 0, outstandingBalance: 0, availableCredit: 0 });

  useEffect(() => {
    fetchMarketplace();
    fetchLocalInventory();
    fetchCreditStatus();
    fetchMyOrders();
  }, []);

  const fetchMarketplace = async () => { 
    try { 
      const res = await API.get("/inventory/marketplace"); 
      setMarketStock(res.data); 
      // Initialize default quantities to 1 for all items
      const initialQtys: { [key: number]: number } = {};
      res.data.forEach((item: MarketplaceItem) => { initialQtys[item.stockId] = 1; });
      setQuantities(initialQtys);
    } catch (e) { console.error(e); } 
  };

  const fetchLocalInventory = async () => { try { const res = await API.get("/inventory/all"); setLocalStock(res.data); } catch (e) { console.error(e); } };
  const fetchCreditStatus = async () => { try { const res = await API.get("/finance/credit-status"); setCreditInfo(res.data); } catch (e) { console.error(e); } };
  const fetchMyOrders = async () => { try { const res = await API.get("/orders/retailer"); setMyOrders(res.data); } catch (e) { console.error(e); } };

  // --- CARD QUANTITY STEPS ---
  const handleCardQtyChange = (stockId: number, delta: number, max: number) => {
    setQuantities(prev => {
      const current = prev[stockId] || 1;
      const updated = current + delta;
      if (updated < 1) return prev;
      if (updated > max) {
        alert(`Cannot exceed available stock limit of ${max}`);
        return prev;
      }
      return { ...prev, [stockId]: updated };
    });
  };

  // --- ADD TO CART WITH BULK QUANTITY ---
  const handleAddToCart = (item: MarketplaceItem) => {
    const qtyToAdd = quantities[item.stockId] || 1;

    if (qtyToAdd > item.availableQuantity) {
      alert("Requested quantity exceeds available stock!");
      return;
    }

    setCart(prev => {
      const exist = prev.find(c => c.stockId === item.stockId);
      if (exist) {
        const newTotalQty = exist.orderQuantity + qtyToAdd;
        if (newTotalQty > item.availableQuantity) {
          alert("Total quantity in cart exceeds available stock!");
          return prev;
        }
        return prev.map(c => c.stockId === item.stockId ? { ...c, orderQuantity: newTotalQty } : c);
      }
      return [...prev, { ...item, orderQuantity: qtyToAdd }];
    });
  };

  const handleUpdateCartQty = (stockId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.stockId === stockId) {
        const newQty = item.orderQuantity + delta;
        if (newQty <= 0) return null; // will be filtered out
        if (newQty > item.availableQuantity) {
          alert("Cannot exceed available stock limit.");
          return item;
        }
        return { ...item, orderQuantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const handleRemoveFromCart = (stockId: number) => setCart(prev => prev.filter(i => i.stockId !== stockId));

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    try {
      await API.post("/orders/place", { items: cart.map(i => ({ stockId: i.stockId, quantity: i.orderQuantity })) });
      alert("Order placed successfully on Credit!");
      setCart([]); fetchMarketplace(); fetchLocalInventory(); fetchCreditStatus(); fetchMyOrders();
    } catch (e: any) { alert(e.response?.data?.message || "Checkout failed."); }
  };

  // --- POS LOGIC ---
  const handleAddToPos = (item: InventoryItem) => {
    setPosCart(prev => {
      const exist = prev.find(c => c.stockId === item.id);
      if (exist) return prev.map(c => c.stockId === item.id ? { ...c, orderQuantity: c.orderQuantity + 1 } : c);
      return [...prev, { ...item as any, stockId: item.id, price: item.mrp, orderQuantity: 1 }];
    });
  };

  const handlePosCheckout = async () => {
    if (posCart.length === 0) return;
    try {
      await API.post("/pos/checkout", { items: posCart.map(i => ({ stockId: i.stockId, quantity: i.orderQuantity })) });
      alert("Bill Generated!"); setPosCart([]); fetchLocalInventory();
    } catch (e: any) { alert("Failed to generate bill."); }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.orderQuantity), 0);
  const posTotal = posCart.reduce((sum, item) => sum + (item.mrp * item.orderQuantity), 0);
  const filteredMarket = marketStock.filter(i => i.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) || i.distributorName.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredLocal = localStock.filter(i => i.medicineName.toLowerCase().includes(posSearch.toLowerCase()) || i.batchNumber.toLowerCase().includes(posSearch.toLowerCase()));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Navbar />
        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-end mb-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-slate-800">Retailer Operations</h2>
              <p className="text-slate-500 mt-1">Manage B2B purchases and retail billing.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex bg-slate-200 p-1 rounded-xl">
              <button onClick={() => setActiveTab("MARKETPLACE")} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "MARKETPLACE" ? "bg-white text-blue-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>B2B Marketplace</button>
              <button onClick={() => setActiveTab("POS")} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "POS" ? "bg-white text-emerald-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>POS Billing</button>
              <button onClick={() => setActiveTab("MY_ORDERS")} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === "MY_ORDERS" ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-700"}`}>Order History</button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-emerald-500"><CardContent className="flex items-center gap-4 p-6"><div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl"><Wallet size={28} /></div><div><p className="text-sm font-semibold text-slate-500">Available Credit</p><h3 className="text-3xl font-bold">₹{creditInfo.availableCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3></div></CardContent></Card>
            <Card className="border-l-4 border-red-500"><CardContent className="flex items-center gap-4 p-6"><div className="p-4 bg-red-50 text-red-600 rounded-xl"><CreditCard size={28} /></div><div><p className="text-sm font-semibold text-slate-500">Outstanding Balance</p><h3 className="text-3xl font-bold">₹{creditInfo.outstandingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3></div></CardContent></Card>
            <Card className="border-l-4 border-blue-500"><CardContent className="flex items-center gap-4 p-6"><div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><PackageOpen size={28} /></div><div><p className="text-sm font-semibold text-slate-500">Local Inventory</p><h3 className="text-3xl font-bold">{localStock.reduce((acc, curr) => acc + curr.quantity, 0)} Units</h3></div></CardContent></Card>
          </div>

          {activeTab === "MARKETPLACE" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
                <h3 className="text-xl font-bold mb-4">Distributor Network</h3>
                <div className="relative mb-6"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search medicines or distributors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMarket.map(item => {
                    const currentQty = quantities[item.stockId] || 1;
                    return (
                      <div key={item.stockId} className="border border-slate-100 p-5 rounded-xl bg-slate-50 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-lg text-slate-800">{item.medicineName}</h4>
                            <span className="text-emerald-600 font-black text-lg">₹{item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-sm font-semibold text-blue-600 mb-1">{item.distributorName}</p>
                          <div className="flex justify-between text-xs text-slate-500 mb-4">
                            <span>Batch: {item.batchNumber}</span>
                            <span>Stock: {item.availableQuantity}</span>
                          </div>
                        </div>

                        {/* Quantity Stepper & Add Button */}
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">Qty to Order:</span>
                            <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-xs">
                              <button 
                                onClick={() => handleCardQtyChange(item.stockId, -1, item.availableQuantity)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-3 py-1 font-bold text-sm min-w-[36px] text-center">{currentQty}</span>
                              <button 
                                onClick={() => handleCardQtyChange(item.stockId, 1, item.availableQuantity)}
                                className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>

                          <Button 
                            onClick={() => handleAddToCart(item)} 
                            className="bg-slate-900 hover:bg-slate-800 text-white w-full flex justify-center gap-2 rounded-lg font-bold"
                          >
                            <ShoppingCart size={16}/> Add to Order ({currentQty})
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Purchase Order Cart */}
              <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col h-[600px]">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-4 pb-4 border-b"><ShoppingCart className="text-blue-600" /> Purchase Order</h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {cart.map(item => (
                    <div key={item.stockId} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div>
                        <p className="font-bold text-sm">{item.medicineName}</p>
                        <p className="text-xs text-slate-500">₹{item.price} each</p>
                        
                        {/* Cart Item Quantity Stepper */}
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => handleUpdateCartQty(item.stockId, -1)} className="p-1 bg-white border rounded hover:bg-slate-100"><Minus size={12}/></button>
                          <span className="text-xs font-bold px-1">{item.orderQuantity}</span>
                          <button onClick={() => handleUpdateCartQty(item.stockId, 1)} className="p-1 bg-white border rounded hover:bg-slate-100"><Plus size={12}/></button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="font-bold text-emerald-600">₹{(item.price * item.orderQuantity).toFixed(2)}</p>
                        <button onClick={() => handleRemoveFromCart(item.stockId)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                  {cart.length === 0 && <p className="text-center text-slate-400 mt-10">Your cart is empty.</p>}
                </div>
                <div className="pt-6 border-t mt-auto">
                  <div className="flex justify-between items-end mb-6"><span className="text-slate-500 font-semibold">Total Amount</span><span className="text-3xl font-black text-slate-800">₹{cartTotal.toFixed(2)}</span></div>
                  <Button disabled={cart.length === 0} onClick={handlePlaceOrder} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg rounded-xl disabled:opacity-50">Place Order on Credit</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "POS" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6 flex flex-col h-[600px]">
                 <h3 className="text-xl font-bold mb-4">Scan & Add Items</h3>
                 <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Search Local Shelf (Name or Batch)..." value={posSearch} onChange={(e) => setPosSearch(e.target.value)} className="w-full pl-10 p-4 border-2 border-emerald-100 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" autoFocus /></div>
                 <div className="flex-1 overflow-y-auto border rounded-xl">
                   <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b"><tr><th className="p-4">Item</th><th className="p-4 text-center">Shelf Qty</th><th className="p-4 text-right">MRP</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredLocal.map(item => (
                          <tr key={item.id} className="hover:bg-emerald-50 cursor-pointer" onClick={() => handleAddToPos(item)}>
                            <td className="p-4"><p className="font-bold text-slate-800">{item.medicineName}</p><p className="text-xs text-slate-500">Batch: {item.batchNumber}</p></td>
                            <td className="p-4 text-center font-bold text-slate-600">{item.quantity}</td>
                            <td className="p-4 text-right font-black text-emerald-600">₹{item.mrp.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                 </div>
              </div>
              <div className="bg-slate-900 rounded-2xl shadow-lg border-slate-800 text-white p-6 flex flex-col h-[600px]">
                <h3 className="text-xl font-bold border-b border-slate-700 pb-4 mb-4">Customer Bill</h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {posCart.map(item => (
                    <div key={item.stockId} className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                      <div><p className="font-semibold text-slate-200">{item.medicineName}</p><p className="text-xs text-slate-500">{item.orderQuantity} x ₹{item.mrp}</p></div>
                      <span className="font-bold text-emerald-400">₹{(item.mrp * item.orderQuantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-slate-700 mt-auto">
                  <div className="flex justify-between items-end mb-6"><span className="text-slate-400 font-medium">Net Payable</span><span className="text-4xl font-black text-emerald-400">₹{posTotal.toFixed(2)}</span></div>
                  <Button disabled={posCart.length === 0} onClick={handlePosCheckout} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 text-xl rounded-xl">Print Invoice & Checkout</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "MY_ORDERS" && (
            <div className="bg-white rounded-2xl shadow-sm border p-6">
              <h3 className="text-2xl font-bold mb-6">My Purchase Orders</h3>
              <div className="grid grid-cols-1 gap-4">
                {myOrders.map(order => (
                  <div key={order.orderId} className="border p-5 rounded-xl bg-slate-50 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-lg">Order #{order.orderId}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'CREATED' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{order.status}</span>
                      </div>
                      <p className="text-slate-500 text-sm mt-1">Purchased from: <span className="font-bold text-slate-800">{order.sellerName}</span></p>
                      <p className="text-slate-400 text-xs mt-1">{new Date(order.orderDate).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-slate-800">₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {myOrders.length === 0 && <p className="text-slate-400 text-center py-10 text-lg font-semibold">You haven't placed any orders yet.</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;