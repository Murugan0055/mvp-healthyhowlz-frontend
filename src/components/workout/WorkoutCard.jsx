import React, { useState, useRef } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, Camera, Upload } from 'lucide-react';

const WorkoutCard = ({ exercise, onToggle }) => {
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef(null);

  const handleToggleClick = (e) => {
    e.stopPropagation();

    // If it's a CARDIO exercise and not completed, trigger file upload
    if (exercise.category === 'CARDIO' && !exercise.is_completed) {
      fileInputRef.current?.click();
    } else {
      // Otherwise just toggle
      onToggle();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onToggle(file);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  return (
    <div
      className={`bg-white p-4 rounded-2xl shadow-sm border transition-all active:scale-[0.99] ${exercise.is_completed ? 'border-green-200 bg-green-50/30' : 'border-gray-100'
        }`}
    >
      <div className="flex gap-4 items-center">
        {/* Checkbox / Toggle */}
        <button
          onClick={handleToggleClick}
          className="flex-shrink-0 focus:outline-none relative group"
        >
          {exercise.is_completed ? (
            <CheckCircle size={32} className="text-green-500 fill-green-100" />
          ) : (
            <>
              <Circle size={32} className={`text-gray-300 group-hover:text-gray-400 ${exercise.category === 'CARDIO' ? 'text-blue-300' : ''}`} />
              {exercise.category === 'CARDIO' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Camera size={14} className="text-gray-400" />
                </div>
              )}
            </>
          )}
        </button>

        {/* Hidden File Input for Cardio */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-base ${exercise.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {exercise.name}
            </h4>
            {exercise.category === 'CARDIO' && (
              <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Cardio
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-1 text-sm text-gray-600">
            {exercise.sets && (
              <span className="font-medium">{exercise.sets} Sets</span>
            )}
            {exercise.reps && (
              <span className="font-medium">{exercise.reps} Reps</span>
            )}
            {exercise.duration && (
              <span className="font-medium">{exercise.duration}</span>
            )}
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-300 p-2 -mr-2"
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
          {exercise.notes && (
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-2">
              {exercise.notes}
            </p>
          )}
          {exercise.category === 'CARDIO' && !exercise.is_completed && (
            <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded-lg flex items-center gap-2">
              <Camera size={14} />
              <span>Photo proof of dashboard required to complete.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkoutCard;
