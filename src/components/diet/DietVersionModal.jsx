import React from 'react';
import { Check, Clock, X } from 'lucide-react';

const DietVersionModal = ({ isOpen, onClose, versions, currentVersionId, onSelectVersion }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-full duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Diet Plan History</h3>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-2">
          {versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No history available.</p>
            </div>
          ) : (
            versions.map((version) => {
              const isSelected = version.id === currentVersionId;
              const isCurrent = version.is_current;

              return (
                <button
                  key={version.id}
                  onClick={() => onSelectVersion(version)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3
                    ${isSelected
                      ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                      : 'border-gray-100 hover:bg-gray-50 hover:border-gray-200'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${isCurrent ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}
                  `}>
                    {isCurrent ? <Check size={20} /> : <Clock size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {version.title}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(version.followed_from).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' - '}
                      {version.followed_till
                        ? new Date(version.followed_till).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Now'
                      }
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DietVersionModal;
