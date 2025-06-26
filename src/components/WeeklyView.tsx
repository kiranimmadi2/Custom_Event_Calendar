
import React from 'react';
import { Event } from '../types/calendar';
import { formatDate, formatTime } from '../utils/dateUtils';
import EventItem from './EventItem';

interface WeeklyViewProps {
  currentDate: Date;
  events: Event[];
  onEventClick: (event: Event) => void;
  onDateClick: (date: Date) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick
}) => {
  const getWeekDays = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentDate);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="grid grid-cols-7 gap-2 h-96">
      {weekDays.map((date, index) => {
        const dayEvents = getEventsForDate(date);
        const isToday = date.toDateString() === new Date().toDateString();
        
        return (
          <div
            key={date.toISOString()}
            className={`border rounded-lg p-2 cursor-pointer hover:bg-gray-50 ${
              isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
            }`}
            onClick={() => onDateClick(date)}
          >
            <div className="text-center mb-2">
              <div className="text-xs text-gray-500">{dayNames[index]}</div>
              <div className={`text-sm font-medium ${
                isToday ? 'text-blue-600' : 'text-gray-800'
              }`}>
                {date.getDate()}
              </div>
            </div>
            
            <div className="space-y-1 overflow-y-auto max-h-60">
              {dayEvents.map(event => (
                <EventItem
                  key={event.id}
                  event={event}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyView;
