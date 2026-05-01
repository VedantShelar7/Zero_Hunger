import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Volunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const openChat = (vol) => {
    setSelectedChat(vol);
    setChatMessages([
      { from: 'me', text: `Hey ${vol.name.split(' ')[0]}, are you available for a pickup at Koramangala?` },
      { from: 'them', text: 'Yes, I can be there in 15 mins!' }
    ]);
    setChatInput('');
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { from: 'me', text: chatInput }]);
    setChatInput('');
    // Simulate a reply after 1 second
    setTimeout(() => {
      setChatMessages(prev => [...prev, { from: 'them', text: 'Got it, on my way! 🚲' }]);
    }, 1000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getVolunteers();
        setVolunteers(data || []);
      } catch (err) { console.error(err); }
    };
    load();
  }, []);

  const handleRecruit = async () => {
    try {
      const newVol = await api.addVolunteer({});
      setVolunteers([newVol, ...volunteers]);
    } catch (err) { console.error(err); }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.vehicle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#007751]/10 flex items-center justify-center text-[#007751]">
            <span className="material-symbols-outlined text-[24px]">group</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Volunteers Fleet</h2>
            <p className="text-slate-500">Manage and view active platform volunteers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Active</h3>
          <p className="text-4xl font-black text-slate-900 dark:text-white">{volunteers.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">En Route</h3>
          <p className="text-4xl font-black text-[#fea619]">{volunteers.filter(v => v.status === 'En Route').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Available</h3>
          <p className="text-4xl font-black text-[#007751]">{volunteers.filter(v => v.status === 'Available').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
          <button onClick={handleRecruit} className="bg-primary/10 text-primary font-bold px-6 py-3 rounded-lg hover:bg-primary/20 transition-colors w-full flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            Recruit
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Volunteer Directory</h3>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search volunteers..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Vehicle</th>
                <th className="py-4 px-6 text-center">Rating</th>
                <th className="py-4 px-6 text-center">Deliveries</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredVolunteers.map(vol => (
                <tr key={vol.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                      {vol.name.charAt(0)}
                    </div>
                    {vol.name}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-slate-400">
                      {vol.vehicle.includes('2-Wheeler') ? 'two_wheeler' : vol.vehicle.includes('Bicycle') ? 'pedal_bike' : 'directions_car'}
                    </span>
                    {vol.vehicle}
                  </td>
                  <td className="py-4 px-6 text-center font-semibold flex justify-center items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-yellow-500" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                    {vol.rating}
                  </td>
                  <td className="py-4 px-6 text-center font-medium text-slate-600">
                    {vol.deliveries}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                      vol.status === 'Available' ? 'bg-green-100 text-green-800' : 
                      vol.status === 'En Route' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${vol.status === 'Available' ? 'bg-green-500' : vol.status === 'En Route' ? 'bg-yellow-500' : 'bg-slate-400'}`}></span>
                      {vol.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button onClick={() => openChat(vol)} className="text-primary hover:text-primary-container p-2 rounded-full hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedChat && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                  {selectedChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{selectedChat.name}</h3>
                  <p className="text-xs text-slate-500">{selectedChat.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">call</span>
                </button>
                <button onClick={() => setSelectedChat(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-[#F8F6F0] dark:bg-slate-950 flex flex-col gap-3">
              <div className="self-center bg-slate-200 dark:bg-slate-800 text-slate-500 text-xs px-3 py-1 rounded-full mb-2">Today</div>
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`${msg.from === 'me' ? 'self-end bg-primary text-white rounded-2xl rounded-tr-sm' : 'self-start bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl rounded-tl-sm'} px-4 py-2 max-w-[80%] text-sm shadow-sm`}>
                  {msg.text}
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button className="text-slate-400 hover:text-primary p-2 transition-colors">
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
              </button>
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message..." 
                className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
              />
              <button onClick={sendMessage} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-sm hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
