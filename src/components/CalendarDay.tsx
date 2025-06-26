
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import EventItem from './EventItem';
import { Event } from '../types/calendar';
import { cn } from '@/lib/utils';

interface CalendarDayProps {
  date: Date;
  events: Event[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
  onEventClick: (event: Event) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  events,
  isToday,
  isCurrentMonth,
  onClick,
  onEventClick
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: date.toISOString()
  });

  const dayNumber = date.getDate();
  const visibleEvents = events.slice(0, 3);
  const hiddenEventsCount = events.length - 3;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-all duration-200 hover:bg-gray-50",
        isCurrentMonth ? "bg-white" : "bg-gray-50",
        isOver && "bg-blue-50 border-blue-300",
        "relative"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "text-sm font-medium mb-1",
        isToday && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center",
        !isToday && isCurrentMonth && "text-gray-800",
        !isToday && !isCurrentMonth && "text-gray-400"
      )}>
        {dayNumber}
      </div>
      
      <div className="space-y-1">
        {visibleEvents.map(event => (
          <EventItem
            key={event.id}
            event={event}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(event);
            }}
          />
        ))}
        
        {hiddenEventsCount > 0 && (
          <div className="text-xs text-gray-500 px-1">
            +{hiddenEventsCount} more
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
