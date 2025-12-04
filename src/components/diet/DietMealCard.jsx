import React, { useState } from 'react';
import { Apple, ChevronDown, ChevronUp, Coffee, Dumbbell, Flame, Moon, Utensils, UtensilsCrossed } from 'lucide-react';

const DietMealCard = ({ meal }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper to get icon based on meal type
  const getMealIcon = (type) => {
    const t = type?.toLowerCase() || '';
    const iconProps = { size: 24, className: "text-indigo-600" };

    if (t.includes('breakfast')) return <Coffee {...iconProps} />;
    if (t.includes('lunch')) return <Utensils {...iconProps} />;
    if (t.includes('dinner')) return <UtensilsCrossed {...iconProps} />;
    if (t.includes('snack')) return <Apple {...iconProps} />;
    if (t.includes('workout')) return <Dumbbell {...iconProps} />;
    return <Utensils {...iconProps} />;
  };

  return (
    <div
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 transition-all active:scale-[0.99]"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex gap-4 items-start">
        {/* Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0">
          {getMealIcon(meal.meal_type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-gray-900 text-base">{meal.meal_type}</h4>
            {meal.calories_kcal > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                <Flame size={12} className="fill-orange-600" />
                {meal.calories_kcal}
              </div>
            )}
          </div>

          <p className="text-sm font-medium text-gray-800 mt-0.5">{meal.name}</p>

          {/* Macros Line */}
          <div className="flex gap-2 mt-2 text-xs text-gray-500 font-medium">
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">P: {meal.protein_g}g</span>
            <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">C: {meal.carbs_g}g</span>
            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">F: {meal.fat_g}g</span>
          </div>
        </div>

        {/* Expand Toggle */}
        <div className="text-gray-300 mt-1">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && meal.description && (
        <div className="mt-3 pt-3 border-t border-gray-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {meal.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default DietMealCard;
