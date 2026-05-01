import React, { useState } from 'react';

export default function FoodRecycle() {
  const [logs, setLogs] = useState([
    { id: 'W-892', source: 'City Market Organics', weight: 2.4, time: '2h ago', stage: 'fresh' },
    { id: 'W-891', source: 'Northside Cafe Co-op', weight: 0.8, time: '5h ago', stage: 'fresh' },
    { id: 'CELL-A1', source: 'Mixed Batch', weight: 4.1, day: 14, temp: '65°C', moisture: '45%', progress: 65, stage: 'composting' },
    { id: 'BATCH-F102', source: 'Batch #F-102', weight: 4.3, desc: 'Premium Grade NPK blend, cured and screened.', stage: 'ready' }
  ]);

  const [formData, setFormData] = useState({
    source: '',
    category: 'Organic Food Waste',
    weight: '',
    moisture: '',
    cell: 'Cell A-1 (Empty)',
    notes: ''
  });

  const totalIntake = logs.reduce((sum, log) => sum + log.weight, 0).toFixed(1);
  const activeComposting = logs.filter(l => l.stage === 'composting').reduce((sum, l) => sum + l.weight, 0).toFixed(1);
  const fertilizerReady = logs.filter(l => l.stage === 'ready').reduce((sum, l) => sum + l.weight, 0).toFixed(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.source || !formData.weight) return;
    
    const newLog = {
      id: `W-${Math.floor(Math.random() * 900) + 100}`,
      source: formData.source,
      weight: parseFloat(formData.weight),
      time: 'Just now',
      stage: 'fresh'
    };
    
    setLogs([newLog, ...logs]);
    setFormData({
      source: '',
      category: 'Organic Food Waste',
      weight: '',
      moisture: '',
      cell: 'Cell A-1 (Empty)',
      notes: ''
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full font-['Inter'] bg-[#F9FAFB] min-h-screen">
      
      {/* GREEN HEADER SECTION: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#143D2D] p-6 rounded-2xl shadow-lg border border-[#1a3d32] flex justify-between items-start text-white">
          <div>
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-4">Total Intake (This Week)</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{totalIntake}</span>
              <span className="text-emerald-100/60 font-bold">Tons</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold mt-1">↝ +8% from last week</p>
          </div>
          <div className="w-10 h-10 bg-emerald-900/50 rounded-full flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-xl">hourglass_empty</span>
          </div>
        </div>

        <div className="bg-[#143D2D] p-6 rounded-2xl shadow-lg border border-[#1a3d32] flex justify-between items-start text-white">
          <div>
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-4">Active Composting</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{activeComposting}</span>
              <span className="text-emerald-100/60 font-bold">Tons</span>
            </div>
            <p className="text-[11px] text-emerald-200/60 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">thermostat</span> Optimal temp maintained
            </p>
          </div>
          <div className="w-10 h-10 bg-lime-500/20 rounded-full flex items-center justify-center text-lime-400">
            <span className="material-symbols-outlined text-xl">eco</span>
          </div>
        </div>

        <div className="bg-[#143D2D] p-6 rounded-2xl shadow-lg border border-[#1a3d32] flex justify-between items-start text-white">
          <div>
            <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-4">Fertilizer Ready</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{fertilizerReady}</span>
              <span className="text-emerald-100/60 font-bold">Tons</span>
            </div>
            <p className="text-[11px] text-emerald-200/60 font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span> Awaiting distribution
            </p>
          </div>
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-xl">local_shipping</span>
          </div>
        </div>
      </div>

      {/* Log Form Container (White Body, Green Form Header) */}
      <div className="max-w-3xl mx-auto bg-white rounded-[32px] shadow-xl overflow-hidden mb-12 border border-slate-100">
        <div className="h-28 bg-[#143D2D] flex items-center px-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#143D2D] shadow-sm">
              <span className="material-symbols-outlined text-[20px] font-bold">description</span>
            </div>
            <h2 className="text-2xl font-black text-white">Log New Waste Entry</h2>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Source / Vendor</label>
              <input 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                placeholder="e.g. City Market, Farm Alpha"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3.5 text-sm focus:ring-2 focus:ring-[#143D2D]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Waste Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3.5 text-sm appearance-none"
              >
                <option>Organic Food Waste</option>
                <option>Green Waste</option>
                <option>Dry Waste</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Weight (Tons)</label>
              <input 
                type="number"
                value={formData.weight}
                onChange={e => setFormData({...formData, weight: e.target.value})}
                placeholder="0.0"
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3.5 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Moisture Level (%)</label>
              <input 
                placeholder="40-60 optimal"
                value={formData.moisture}
                onChange={e => setFormData({...formData, moisture: e.target.value})}
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3.5 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Cell</label>
              <select 
                value={formData.cell}
                onChange={e => setFormData({...formData, cell: e.target.value})}
                className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-3.5 text-sm appearance-none"
              >
                <option>Cell A-1 (Empty)</option>
                <option>Cell B-2 (Active)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Inspector Notes (Optional)</label>
            <textarea 
              rows="3"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Any visual contamination or anomalies..."
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-4 py-4 text-sm resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={() => setFormData({source: '', category: 'Organic Food Waste', weight: '', moisture: '', cell: 'Cell A-1 (Empty)', notes: ''})}
              className="px-10 py-3.5 rounded-lg border border-slate-300 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Clear
            </button>
            <button 
              type="submit"
              className="px-12 py-3.5 rounded-lg bg-[#143D2D] text-white font-bold text-sm shadow-lg hover:bg-[#0D2B20] transition-all"
            >
              Submit Entry
            </button>
          </div>
        </form>
      </div>

      {/* Pipeline Status Section (White Theme) */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-800">Pipeline Status</h2>
        <button className="text-slate-500 font-bold text-sm flex items-center gap-1 hover:underline">
          View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fresh Waste Column */}
        <div className="bg-[#E5E7EB]/40 p-6 rounded-3xl min-h-[400px]">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="font-bold text-slate-700">Fresh Waste</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">3 logs</span>
          </div>
          <div className="space-y-4">
            {logs.filter(l => l.stage === 'fresh').map((l, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded tracking-widest">ID: {l.id}</span>
                  <span className="text-[10px] font-bold text-slate-400">{l.time}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{l.source}</h4>
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                  <span className="text-sm font-bold">{l.weight} Tons</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Composting Column */}
        <div className="bg-[#E5E7EB]/40 p-6 rounded-3xl min-h-[400px]">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-lime-500 rounded-full shadow-[0_0_8px_rgba(132,204,22,0.6)]"></div>
              <span className="font-bold text-slate-700">Composting</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">2 Cells</span>
          </div>
          <div className="space-y-4">
            {logs.filter(l => l.stage === 'composting').map((l, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-lime-500">
                <div className="flex justify-between items-center mb-3">
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-1 rounded tracking-widest">{l.id}</span>
                  <span className="text-[10px] font-bold text-slate-400 tracking-wider font-black">Day {l.day}</span>
                </div>
                <h4 className="font-bold text-slate-800 mb-4">{l.source}</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                    <span className="text-xs font-bold">{l.temp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="material-symbols-outlined text-[16px]">water_drop</span>
                    <span className="text-xs font-bold">{l.moisture}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-600 rounded-full" style={{width: `${l.progress}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fertilizer Ready Column */}
        <div className="bg-[#E5E7EB]/40 p-6 rounded-3xl min-h-[400px]">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-800 rounded-full"></div>
              <span className="font-bold text-slate-700">Fertilizer Ready</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">1 Batch</span>
          </div>
          <div className="space-y-4">
            {logs.filter(l => l.stage === 'ready').map((l, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="mb-4">
                  <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 w-fit">
                    <span className="material-symbols-outlined text-[12px]">verified</span> Tested
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 mb-2">{l.source}</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">{l.desc}</p>
                <button className="w-full py-2.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all">
                  Schedule Dispatch
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
