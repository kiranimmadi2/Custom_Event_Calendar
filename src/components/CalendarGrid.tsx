
import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import CalendarDay from './CalendarDay';
import { Event } from '../types/calendar';
import { getMonthDays, isSameDay } from '../utils/dateUtils';

interface CalendarGridProps {
  currentDate: Date;
  events: Event[];
  onDateClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onEventDrop: (eventId: string, newDate: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onDateClick,
  onEventClick,
  onEventDrop
}) => {
  const days = getMonthDays(currentDate);
  const today = new Date();
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const eventId = active.id as string;
      const newDateStr = over.id as string;
      const newDate = new Date(newDateStr);
      onEventDrop(eventId, newDate);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-3 text-sm font-semibold text-gray-600 text-center bg-gray-50 rounded-t-lg">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const isToday = isSameDay(date, today);
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          
          return (
            <CalendarDay
              key={`${date.toISOString()}-${index}`}
              date={date}
              events={dayEvents}
              isToday={isToday}
              isCurrentMonth={isCurrentMonth}
              onClick={() => onDateClick(date)}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </DndContext>
  );
};

export default CalendarGrid;
