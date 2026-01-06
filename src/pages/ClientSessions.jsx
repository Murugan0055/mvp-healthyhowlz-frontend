import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon, Clock,
  ChevronLeft, ChevronRight, User, Info
} from 'lucide-react';
import api from '../utils/api';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const ClientSessions = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [selectedDate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const start = format(startOfWeek(selectedDate), 'yyyy-MM-dd');
      const end = format(endOfWeek(selectedDate), 'yyyy-MM-dd');
      const res = await api.get(`/me/sessions?start_date=${start}&end_date=${end}`);
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const dailySessions = sessions.filter(s => isSameDay(new Date(s.session_date), selectedDate));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-32">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Sessions</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em]">
                {dailySessions.length} {dailySessions.length === 1 ? 'Slot' : 'Slots'}
              </p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
            <CalendarIcon size={24} className="text-white" />
          </div>
        </div>

        {/* Premium Date Selector */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <CalendarIcon size={18} className="text-white opacity-80" />
            <h2 className="font-black text-white text-lg tracking-tight capitalize">{format(selectedDate, 'MMMM yyyy')}</h2>
          </div>
          <div className="flex bg-white/10 backdrop-blur-md rounded-xl p-0.5 border border-white/10">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar -mx-4 px-4">
          <div className="flex justify-start gap-2 pb-4">
            {weekDays.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`flex-none flex flex-col items-center py-4 px-2 rounded-[2.5rem] min-w-[50px] transition-all duration-300 ${isSelected
                    ? 'bg-white text-indigo-600 shadow-2xl shadow-indigo-900/40 scale-105'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <span className={`text-[9px] font-black uppercase mb-1.5 tracking-widest ${isSelected ? 'text-indigo-600/60' : 'text-white/40'}`}>
                    {format(day, 'EEE')}
                  </span>
                  <span className={`text-xl font-black tabular-nums transition-transform ${isSelected ? 'text-indigo-900' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {isToday && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-indigo-600' : 'bg-white'}`}></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* New Glassmorphism Info Box inside Header */}
        <div className="mt-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex gap-4 items-start shadow-inner">
          <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
            <Info size={20} className="text-white" />
          </div>
          <p className="text-[11px] text-white font-semibold leading-relaxed opacity-90">
            Only your assigned trainer can mark sessions as complete or reschedule slots. Please contact them for changes.
          </p>
        </div>
      </div>

      {/* Daily Sessions List */}
      <div className="px-5 mt-4 space-y-6 relative z-10">

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 h-40 animate-pulse"></div>
          ))
        ) : dailySessions.length > 0 ? (
          dailySessions.map((session, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all border-l-8 border-l-indigo-500">
              <div className="p-6 flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden border border-indigo-50">
                  {session.trainer_image ? (
                    <img src={session.trainer_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-400">
                      {session.trainer_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black text-gray-900 truncate tracking-tight mb-2">
                    {session.trainer_name}
                  </h4>

                  <div className="flex flex-col gap-2">
                    <div className="flex">
                      <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-wider ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        session.status === 'cancelled' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          session.status === 'skipped_by_trainer' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            session.status === 'skipped_by_client' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                              'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                        {session.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock size={12} className="text-indigo-500" />
                      <span className="text-xs font-bold tracking-tight text-gray-600 tabular-nums">
                        {session.start_time.slice(0, 5)} - {session.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {session.notes && (
                <div className="px-6 pb-6 pt-0">
                  <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-600 font-medium leading-relaxed border border-gray-100">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mb-1">Trainer's Notes</span>
                    {session.notes}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-gray-50/50 rounded-[3rem] p-12 text-center border-2 border-dashed border-gray-200 mt-4">
            <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2 tracking-tight">No Sessions</h3>
            <p className="text-gray-400 text-xs italic font-medium uppercase tracking-widest">No training slots for this day</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSessions;
