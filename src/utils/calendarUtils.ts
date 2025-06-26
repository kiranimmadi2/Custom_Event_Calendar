
import { Event, RecurrencePattern } from '../types/calendar';
import { isSameDay } from './dateUtils';

export const generateRecurringEvents = (baseEvent: Event, recurrence: RecurrencePattern): Event[] => {
  const events: Event[] = [];
  const startDate = new Date(baseEvent.date);
  const endDate = recurrence.endDate || new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());
  
  let currentDate = new Date(startDate);
  let eventId = 1;
  
  while (currentDate <= endDate) {
    // Create event for current date
    const eventDate = new Date(currentDate);
    const startTime = new Date(eventDate);
    startTime.setHours(baseEvent.startTime.getHours(), baseEvent.startTime.getMinutes());
    
    const endTime = new Date(eventDate);
    endTime.setHours(baseEvent.endTime.getHours(), baseEvent.endTime.getMinutes());
    
    // For weekly recurrence, check if current day is in the selected weekdays
    let shouldCreateEvent = true;
    if (recurrence.type === 'weekly' && recurrence.weekDays && recurrence.weekDays.length > 0) {
      shouldCreateEvent = recurrence.weekDays.includes(currentDate.getDay());
    }
    
    if (shouldCreateEvent) {
      events.push({
        ...baseEvent,
        id: `${baseEvent.id}_${eventId++}`,
        date: eventDate,
        startTime,
        endTime
      });
    }
    
    // Move to next occurrence
    switch (recurrence.type) {
      case 'daily':
      case 'custom':
        currentDate.setDate(currentDate.getDate() + recurrence.interval);
        break;
      case 'weekly':
        if (recurrence.weekDays && recurrence.weekDays.length > 0) {
          // Find next occurrence day
          let daysToAdd = 1;
          let nextDay = (currentDate.getDay() + 1) % 7;
          
          while (!recurrence.weekDays.includes(nextDay)) {
            daysToAdd++;
            nextDay = (nextDay + 1) % 7;
            
            // If we've gone through a full week, move to next interval
            if (daysToAdd > 7) {
              daysToAdd = (recurrence.interval - 1) * 7 + 1;
              break;
            }
          }
          
          currentDate.setDate(currentDate.getDate() + daysToAdd);
        } else {
          currentDate.setDate(currentDate.getDate() + recurrence.interval * 7);
        }
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
        break;
      default:
        return [baseEvent];
    }
    
    // Safety check to prevent infinite loops
    if (events.length > 365) {
      break;
    }
  }
  
  return events.length > 0 ? events : [baseEvent];
};

export const checkEventConflict = (newEvent: Event, existingEvents: Event[]): boolean => {
  return existingEvents.some(event => {
    // Check if events are on the same day
    if (!isSameDay(newEvent.date, event.date)) {
      return false;
    }
    
    // Check time overlap
    const newStart = newEvent.startTime.getTime();
    const newEnd = newEvent.endTime.getTime();
    const existingStart = event.startTime.getTime();
    const existingEnd = event.endTime.getTime();
    
    // Events conflict if they overlap in time
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

export const getEventsForDate = (events: Event[], date: Date): Event[] => {
  return events.filter(event => isSameDay(event.date, date));
};

export const getEventsForMonth = (events: Event[], date: Date): Event[] => {
  return events.filter(event => 
    event.date.getFullYear() === date.getFullYear() &&
    event.date.getMonth() === date.getMonth()
  );
};
