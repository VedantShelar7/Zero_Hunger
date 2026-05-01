import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({ food: '', quantity: '', type: 'Cooked Meals' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [billingFile, setBillingFile] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api.getOrders();
        setOrders(data || []);
      } catch (err) { console.error(err); }
    };
    loadOrders();
    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleListSurplus = async () => {
    if (!formData.food || !formData.quantity) return;
    try {
      const newOrder = await api.addOrder({
        food: formData.food,
        quantity: formData.quantity,
        type: formData.type,
        source: user?.name || 'Anonymous Donor'
      });
      setOrders([newOrder, ...orders]);
      setFormData({ food: '', quantity: '', type: 'Cooked Meals' });
      setBillingFile(null);
      
      // Show success popup
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err) { console.error(err); }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all donation history?')) return;
    try {
      await api.clearOrders();
      setOrders([]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-12 max-w-7xl mx-auto w-full font-['Inter']">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[#141b2b] mb-2">Good afternoon, Meghana's Kitchen 🙏</h1>
        <p className="text-[#3e4949] font-medium">Here is your impact and current activity summary.</p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <div className="bg-white rounded-[20px] p-6 shadow-lg border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#0d7377] bg-teal-50 p-2 rounded-lg">local_dining</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#0d7377]">142</h2>
            <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider mt-1">Meals Donated</p>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-lg border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#fea619] bg-amber-50 p-2 rounded-lg">recycling</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#fea619]">38kg</h2>
            <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider mt-1">Waste Prevented</p>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-lg border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#007751] bg-[#007751]/10 p-2 rounded-lg">group</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#007751]">312</h2>
            <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider mt-1">People Fed</p>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-6 shadow-lg border-l-4 border-l-[#ba1a1a] border border-slate-100 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-[#ba1a1a] bg-[#ba1a1a]/10 p-2 rounded-lg">warning</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#ba1a1a]">2</h2>
            <p className="text-[10px] font-bold text-[#3e4949] uppercase tracking-wider mt-1">Urgent Pickups</p>
          </div>
        </div>
      </div>

      {/* Row 2: List New Surplus Box (Expanded) */}
      <div className="mb-12">
        <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#fea619] to-[#0d7377]"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Form Section */}
            <div className="lg:col-span-7 p-10 border-r border-slate-50">
              <h3 className="text-2xl font-black text-[#141b2b] mb-8 flex items-center gap-3">
                <span className="material-symbols-outlined text-[#fea619]">add_circle</span>
                List New Surplus
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="text-[11px] font-black text-[#3e4949] uppercase tracking-widest block mb-3">Food Item Name</label>
                  <input 
                    value={formData.food}
                    onChange={(e) => setFormData({...formData, food: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d7377]/20 transition-all font-medium"
                    placeholder="e.g. Mixed Vegetable Curry" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[11px] font-black text-[#3e4949] uppercase tracking-widest block mb-3">Quantity</label>
                    <input 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm focus:outline-none font-medium"
                      placeholder="Meals/Kg" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-[#3e4949] uppercase tracking-widest block mb-3">Category</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-sm appearance-none font-medium"
                    >
                      <option>Cooked Meals</option>
                      <option>Raw Produce</option>
                      <option>Packaged</option>
                    </select>
                  </div>
                </div>

                {/* Billing Section - New Requirement */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <label className="text-[11px] font-black text-[#3e4949] uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                    Billing & Documentation Section
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer">
                      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 flex items-center gap-3 hover:bg-slate-100 transition-all">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        {billingFile ? billingFile.name : 'Upload Billing PDF / Invoice'}
                      </div>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        className="hidden" 
                        onChange={(e) => setBillingFile(e.target.files[0])}
                      />
                    </label>
                    {billingFile && (
                      <button onClick={() => setBillingFile(null)} className="text-red-500 text-xs font-bold underline">Remove</button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={handleListSurplus}
                    className="w-full bg-[#fea619] text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(254,166,25,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                  >
                    Calculate TRL + List Surplus
                  </button>
                  
                  {/* Success Popup - New Requirement */}
                  {showSuccess && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 animate-bounce shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">check</span>
                      </div>
                      <span className="text-green-800 font-bold text-sm italic">Successfully created! Listing is now live.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sustainability & Impact Section - New Concept */}
            <div className="lg:col-span-5 bg-teal-50/30 p-10 flex flex-col justify-center">
              <h4 className="text-xs font-black text-[#0d7377] uppercase tracking-[0.2em] mb-8">Sustainability Scorecard</h4>
              
              <div className="space-y-8">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-[#0d7377] flex flex-col items-center justify-center text-white shadow-[0_10px_25px_rgba(13,115,119,0.25)]">
                    <span className="material-symbols-outlined text-3xl">eco</span>
                    <span className="text-[10px] font-bold uppercase mt-1">Impact</span>
                  </div>
                  <div>
                    <p className="text-lg font-black text-[#141b2b]">Live Carbon Offset</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Your donations have prevented <span className="text-[#0d7377] font-bold">4.2kg of CO2</span> emissions today.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <span className="material-symbols-outlined text-[#fea619] mb-3">water_drop</span>
                    <p className="text-sm font-black text-[#141b2b]">840 L</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Water Saved</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <span className="material-symbols-outlined text-[#007751] mb-3">account_balance_wallet</span>
                    <p className="text-sm font-black text-[#141b2b]">₹1,240</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Tax Credit Est.</p>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-teal-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                  <p className="text-[10px] font-black text-[#0d7377] uppercase tracking-widest mb-2">Next Milestone</p>
                  <p className="text-sm font-bold mb-4 text-[#141b2b]">Feed 500 People</p>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#007751] w-[64%] rounded-full shadow-[0_0_8px_rgba(0,119,81,0.2)]"></div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-3 italic font-medium">312 / 500 fed. Keep it up!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="bg-white rounded-[20px] shadow-lg border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="text-xl font-bold text-[#141b2b]">Recent Donations</h3>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleClearHistory}
              className="text-red-500 text-sm font-bold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Clear History
            </button>
            <button className="text-[#0d7377] text-sm font-bold hover:underline flex items-center gap-1">
              View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-[#3e4949] uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-8">Date</th>
                <th className="py-4 px-8">Item</th>
                <th className="py-4 px-8">Qty</th>
                <th className="py-4 px-8 text-center">TRL</th>
                <th className="py-4 px-8">Status</th>
                <th className="py-4 px-8">Volunteer</th>
              </tr>
            </thead>
            <tbody className="text-sm text-[#141b2b] divide-y divide-slate-50">
              {orders.slice(0, 5).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-8 text-[#3e4949] font-medium">{new Date(row.timestamp).toLocaleDateString()}</td>
                  <td className="py-4 px-8 font-bold">{row.food}</td>
                  <td className="py-4 px-8 font-medium">{row.quantity}</td>
                  <td className="py-4 px-8 text-center font-bold text-[#fea619]">{row.trl}</td>
                  <td className="py-4 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold ${row.status === 'Delivered' ? 'bg-[#007751]/10 text-[#007751] border border-[#007751]/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 px-8 text-[#3e4949] font-bold flex items-center gap-2">
                    {row.volunteer ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center text-[10px] text-[#0d7377]">{row.volunteer.name.split(' ').map(n=>n[0]).join('')}</div>
                        {row.volunteer.name}
                      </>
                    ) : (
                      <span className="text-slate-400 italic font-medium">Pending...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
