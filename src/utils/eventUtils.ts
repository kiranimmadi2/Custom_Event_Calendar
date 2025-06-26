
import { Event } from '../types/calendar';

export const filterEvents = (
  events: Event[],
  searchTerm: string,
  categoryFilter: string
): Event[] => {
  return events.filter(event => {
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
};

export const sortEventsByTime = (events: Event[]): Event[] => {
  return [...events].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

export const getEventStats = (events: Event[]) => {
  const total = events.length;
  const categories = events.reduce((acc, event) => {
    acc[event.category] = (acc[event.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const today = new Date();
  const todayEvents = events.filter(event => 
    event.date.toDateString() === today.toDateString()
  );
  
  const upcomingEvents = events.filter(event => 
    event.date > today
  ).slice(0, 5);
  
  return {
    total,
    categories,
    todayCount: todayEvents.length,
    upcomingEvents
  };
};
