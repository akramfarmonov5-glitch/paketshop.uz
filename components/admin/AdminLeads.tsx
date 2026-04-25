import React, { useState, useEffect } from 'react';
import { Users, Phone, Calendar, Search, MessageSquare, Trash2 } from 'lucide-react';
import { ChatLead } from '../../types';
import { hasSupabaseCredentials, supabase } from '../../lib/supabaseClient';

const AdminLeads: React.FC = () => {
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    
    if (!hasSupabaseCredentials) {
        setLeads([
            { id: '1', name: 'Alisher Valiyev', phone: '90 123 45 67', created_at: new Date().toISOString() },
            { id: '2', name: 'Zarina Karimova', phone: '99 876 54 32', created_at: new Date(Date.now() - 86400000).toISOString() },
        ]);
        setLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLeads(data || []);
    } catch (error) {
        console.error("Error fetching leads:", error);
    } finally {
        setLoading(false);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      console.error("Error deleting lead:", err);
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Mijozlar Bazasi (Chat)</h2>
           <p className="text-gray-400">AI Chat orqali ro'yxatdan o'tgan qiziquvchi mijozlar.</p>
        </div>
        <div className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl flex flex-col items-center">
             <span className="text-xs text-gray-500 uppercase font-bold">Jami</span>
             <span className="text-2xl font-bold text-gold-400">{leads.length}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        <input 
          type="text" 
          placeholder="Ism yoki telefon orqali qidirish..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-gold-400 focus:outline-none"
        />
      </div>

      <div className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/5">
                <tr>
                    <th className="p-4 text-sm font-medium text-gray-400">Mijoz</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Telefon</th>
                    <th className="p-4 text-sm font-medium text-gray-400">Ro'yxatdan o'tgan</th>
                    <th className="p-4 text-sm font-medium text-gray-400 text-right">Harakat</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">Yuklanmoqda...</td>
                    </tr>
                ) : filteredLeads.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">Mijozlar topilmadi.</td>
                    </tr>
                ) : (
                    filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
                                        <Users size={20} />
                                    </div>
                                    <span className="font-bold text-white">{lead.name}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Phone size={14} />
                                    <span>{lead.phone}</span>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar size={14} />
                                    <span>{formatDate(lead.created_at)}</span>
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button className="p-2 text-gold-400 hover:bg-gold-400/10 rounded-lg transition-colors" title="Bog'lanish">
                                        <MessageSquare size={18} />
                                    </button>
                                    <button onClick={() => deleteLead(lead.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title="O'chirish">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeads;
