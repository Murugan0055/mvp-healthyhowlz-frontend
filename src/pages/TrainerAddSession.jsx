import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft, Calendar as CalendarIcon, Clock,
  User, Save, Loader2, Plus, Trash2, Info, X
} from 'lucide-react';
import api from '../utils/api';
import { format } from 'date-fns';
import { Button } from '../components/ui/Button';

const TrainerAddSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const urlDate = queryParams.get('date');

  const [clientId, setClientId] = useState('');
  const [sessionSlots, setSessionSlots] = useState([
    {
      id: Date.now(),
      date: urlDate || '',
      start_time: '10:00',
      end_time: '11:00',
      notes: ''
    }
  ]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await api.get('/trainer/clients');
      setClients(res.data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const addSlot = () => {
    setSessionSlots([
      ...sessionSlots,
      {
        id: Date.now(),
        date: '',
        start_time: '10:00',
        end_time: '11:00',
        notes: ''
      }
    ]);
  };

  const removeSlot = (id) => {
    if (sessionSlots.length > 1) {
      setSessionSlots(sessionSlots.filter(s => s.id !== id));
    }
  };

  const updateSlot = (id, field, value) => {
    setSessionSlots(sessionSlots.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setError('Please select a client');
      return;
    }

    const invalidSlot = sessionSlots.find(s => !s.date || !s.start_time);
    if (invalidSlot) {
      setError('Please provide date and time for all sessions');
      return;
    }

    setLoading(true);
    setError(null);

    const sessions = sessionSlots.map(slot => ({
      client_id: clientId,
      session_date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      notes: slot.notes
    }));

    try {
      await api.post('/trainer/sessions', sessions);
      navigate('/trainer/sessions');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule sessions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <div className="px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/trainer/sessions')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 truncate">Schedule Session</h1>
            <p className="text-[11px] text-gray-500 font-medium truncate">Plan multiple slots at once</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
            <CalendarIcon size={20} />
          </div>
        </div>
      </div>

      <div className="p-4 relative z-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 text-sm rounded-xl border border-rose-100 flex items-center gap-2">
              <Info size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Client Selection */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest pl-1">Client Profile</h3>
              <div className="relative">
                <select
                  required
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-gray-900"
                >
                  <option value="">Choose a client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <User size={20} />
                </div>
              </div>
            </div>

            {/* Session Slots Area */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Training Slots</h3>
                <button
                  type="button"
                  onClick={addSlot}
                  className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                >
                  <Plus size={14} />
                  Add Session
                </button>
              </div>

              <div className="space-y-4">
                {sessionSlots.map((slot, index) => (
                  <div key={slot.id} className="relative group bg-gray-50/50 p-5 rounded-2xl border-2 border-gray-100 space-y-4 animate-in slide-in-from-bottom-2">
                    {sessionSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.id)}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white text-rose-500 hover:bg-rose-50 rounded-full shadow-md flex items-center justify-center border border-rose-100 transition-all active:scale-90"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Session Date</label>
                      <div className="relative">
                        <input
                          required
                          type="date"
                          value={slot.date}
                          min={format(new Date(), 'yyyy-MM-dd')}
                          onChange={e => updateSlot(slot.id, 'date', e.target.value)}
                          className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Start Time</label>
                        <input
                          required
                          type="time"
                          value={slot.start_time}
                          onChange={e => updateSlot(slot.id, 'start_time', e.target.value)}
                          className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">End Time</label>
                        <input
                          required
                          type="time"
                          value={slot.end_time}
                          onChange={e => updateSlot(slot.id, 'end_time', e.target.value)}
                          className="w-full h-14 rounded-xl border-2 border-gray-200 bg-white px-4 text-base font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Slot Notes</label>
                      <textarea
                        value={slot.notes}
                        onChange={e => updateSlot(slot.id, 'notes', e.target.value)}
                        className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                        rows="2"
                        placeholder="Focus area for this session..."
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Action Buttons */}
            <div className="pt-6 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/trainer/sessions')}
                className="flex-1 h-16 rounded-2xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-2 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {loading ? 'Scheduling...' : 'Confirm All'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerAddSession;
