import { Plus, Search, Filter, User, Calendar, Clock, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Button } from '../components/ui/Button';

const TrainerClients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchClients();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filter, searchQuery]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/trainer/clients?filter=${filter}&search=${searchQuery}`);
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = () => {
    setFilter(prev => prev === 'active' ? 'all' : 'active');
  };

  const activeCount = clients.filter(c => c.status === 'Active').length;
  const totalCount = clients.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-6 pb-20 rounded-b-[2.5rem] shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">My Clients</h1>
            <p className="text-indigo-100 text-sm font-medium">
              Manage your athletes and their progress
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg ml-3">
            <User size={16} className="fill-white" />
            {activeCount} Active
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-indigo-200 border border-white/20 focus:outline-none focus:bg-white/20 transition-all"
            />
          </div>
          <button
            onClick={toggleFilter}
            className={`h-12 px-4 rounded-xl backdrop-blur-md border border-white/20 flex items-center gap-2 font-semibold transition-all ${filter === 'active'
              ? 'bg-white text-indigo-600 shadow-lg'
              : 'bg-white/10 text-white hover:bg-white/20'
              }`}
          >
            <Filter size={18} />
            {filter === 'active' ? 'Active' : 'All'}
          </button>
        </div>
      </div>

      {/* Client List */}
      <div className="px-4 -mt-12 space-y-4 relative z-10">
        {loading ? (
          // Skeleton Loading
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : clients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User size={36} className="text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No clients found</h3>
            <p className="text-gray-500 text-sm mb-6">
              Add your first client to start tracking their journey.
            </p>
          </div>
        ) : (
          clients.map(client => (
            <div
              key={client.id}
              onClick={() => navigate(`/trainer/clients/${client.id}`)}
              className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 flex gap-4 items-center active:scale-[0.98] hover:shadow-lg cursor-pointer transition-all group"
            >
              {/* Client Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden border border-indigo-50">
                {client.profile_image_url ? (
                  <img src={client.profile_image_url} alt={client.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-indigo-400">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Client Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-gray-900 text-lg truncate">{client.name}</h3>
                  {client.status === 'Active' && (
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm ring-2 ring-white"></span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                    <span>{client.completed_sessions} Completed</span>
                    <span>{client.total_sessions - client.completed_sessions} Remaining</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${(client.completed_sessions / client.total_sessions) * 100}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                    <Calendar size={12} />
                    <span>Expires: {client.validity_expires_at
                      ? new Date(client.validity_expires_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'No Expiry'}</span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-500" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB - Add Client */}
      <button
        onClick={() => navigate('/trainer/clients/add')}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

export default TrainerClients;
