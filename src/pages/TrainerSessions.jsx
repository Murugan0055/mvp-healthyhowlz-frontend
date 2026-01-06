import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar as CalendarIcon, Clock,
  ChevronLeft, ChevronRight, Trash2, Check,
  SkipForward, AlertCircle, X, User
} from 'lucide-react';
import api from '../utils/api';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const TrainerSessions = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [sessionToSkip, setSessionToSkip] = useState(null);

  useEffect(() => {
    fetchSessions();
  }, [selectedDate]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const start = format(startOfWeek(selectedDate), 'yyyy-MM-dd');
      const end = format(endOfWeek(selectedDate), 'yyyy-MM-dd');
      const res = await api.get(`/trainer/sessions?start_date=${start}&end_date=${end}`);
      setSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (sessionId, status) => {
    try {
      await api.patch(`/trainer/sessions/${sessionId}`, { status });
      fetchSessions();
    } catch (err) {
      console.error('Update session error:', err);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await api.delete(`/trainer/sessions/${sessionToDelete}`);
      setSessionToDelete(null);
      fetchSessions();
    } catch (err) {
      console.error('Delete session error:', err);
    }
  };

  const handleSkipSession = async (skippedBy) => {
    if (!sessionToSkip) return;
    try {
      const status = skippedBy === 'trainer' ? 'skipped_by_trainer' : 'skipped_by_client';
      await api.patch(`/trainer/sessions/${sessionToSkip}`, { status });
      setSessionToSkip(null);
      fetchSessions();
    } catch (err) {
      console.error('Skip session error:', err);
    }
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate),
    end: endOfWeek(selectedDate)
  });

  const dailySessions = sessions.filter(s => isSameDay(new Date(s.session_date), selectedDate));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-28">
      {/* Header with Gradient */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-6 pt-6 pb-24 rounded-b-[3rem] shadow-xl relative">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Schedule</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-[0.2em]">{dailySessions.length} Sessions</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/trainer/sessions/add?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg active:scale-95 transition-all group"
          >
            <Plus size={24} className="text-white group-hover:rotate-90 transition-transform" />
          </button>
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

        <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
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
      </div>

      {/* Daily Sessions List */}
      <div className="px-4 -mt-20 space-y-6 relative z-10">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-100 h-40 animate-pulse"></div>
          ))
        ) : dailySessions.length > 0 ? (
          dailySessions.map((session, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] shadow-lg border border-gray-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all border-l-8 border-l-indigo-500">
              <div className="p-6 flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex-shrink-0 flex items-center justify-center shadow-inner overflow-hidden border border-indigo-50">
                  {session.client_image ? (
                    <img src={session.client_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-indigo-400">
                      {session.client_name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black text-gray-900 truncate tracking-tight mb-2">
                    {session.client_name}
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

              {/* Actions Footer row */}
              <div className="flex border-t border-gray-50 bg-gray-50/50 p-2 gap-2">
                {session.status === 'scheduled' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(session.id, 'completed')}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-emerald-600 font-bold text-xs rounded-2xl border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      <Check size={16} className="stroke-[3]" />
                      Done
                    </button>
                    <button
                      onClick={() => setSessionToSkip(session.id)}
                      className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-amber-600 font-bold text-xs rounded-2xl border border-amber-100 hover:bg-amber-600 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      <SkipForward size={16} className="stroke-[3]" />
                      Skip
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSessionToDelete(session.id)}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-white text-rose-500 font-bold text-xs rounded-2xl border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-sm"
                >
                  <Trash2 size={16} className="stroke-[3]" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-gray-50/50 rounded-[3rem] p-12 text-center border-2 border-dashed border-gray-200 mt-4">
            <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl text-gray-200">
              <CalendarIcon size={40} />
            </div>
            <h3 className="text-lg font-black text-gray-800 mb-2 tracking-tight">Open Schedule</h3>
            <p className="text-gray-400 text-xs italic font-medium uppercase tracking-widest">No sessions booked</p>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Delete Session?</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                This will permanently remove the training slot. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setSessionToDelete(null)}
                  className="flex-1 h-14 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSession}
                  className="flex-1 h-14 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Skip Modal */}
      {sessionToSkip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Skip Session</h3>
                <button onClick={() => setSessionToSkip(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => handleSkipSession('trainer')}
                  className="w-full flex items-center gap-4 p-5 bg-blue-50 border-2 border-blue-100 rounded-3xl hover:bg-blue-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover:scale-110">
                    <User size={24} className="stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-blue-900">Skip by Trainer</p>
                    <p className="text-xs text-blue-600 font-bold opacity-70">Trainer was unavailable</p>
                  </div>
                </button>

                <button
                  onClick={() => handleSkipSession('client')}
                  className="w-full flex items-center gap-4 p-5 bg-purple-50 border-2 border-purple-100 rounded-3xl hover:bg-purple-100 transition-all group"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 shadow-sm transition-transform group-hover:scale-110">
                    <User size={24} className="stroke-[2.5]" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-purple-900">Skip by Client</p>
                    <p className="text-xs text-purple-600 font-bold opacity-70">Client could not attend</p>
                  </div>
                </button>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => setSessionToSkip(null)}
                  className="w-full h-14 rounded-2xl bg-gray-50 text-gray-500 font-bold hover:bg-gray-100 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAB - Add Session */}
      <button
        onClick={() => navigate(`/trainer/sessions/add?date=${format(selectedDate, 'yyyy-MM-dd')}`)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 group"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </button>
    </div>
  );
};

export default TrainerSessions;
