
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import { Event, RecurrenceType } from '../types/calendar';
import { toast } from '@/hooks/use-toast';
import { generateRecurringEvents, checkEventConflict } from '../utils/calendarUtils';

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load events from localStorage on component mount
  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        date: new Date(event.date)
      }));
      setEvents(parsedEvents);
    }
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: selectedEvent?.id || Date.now().toString()
    };

    // Check for conflicts
    if (checkEventConflict(newEvent, events.filter(e => e.id !== newEvent.id))) {
      toast({
        title: "Event Conflict",
        description: "This event conflicts with an existing event at the same time.",
        variant: "destructive"
      });
      return;
    }

    if (selectedEvent) {
      // Update existing event
      setEvents(prev => prev.map(e => e.id === selectedEvent.id ? newEvent : e));
      toast({
        title: "Event Updated",
        description: "Your event has been successfully updated."
      });
    } else {
      // Add new event
      const eventsToAdd = eventData.recurrence && eventData.recurrence.type !== 'none'
        ? generateRecurringEvents(newEvent, eventData.recurrence)
        : [newEvent];
      
      setEvents(prev => [...prev, ...eventsToAdd]);
      toast({
        title: "Event Created",
        description: `${eventsToAdd.length > 1 ? `${eventsToAdd.length} recurring events` : 'Event'} created successfully.`
      });
    }

    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    setIsModalOpen(false);
    setSelectedEvent(null);
    toast({
      title: "Event Deleted",
      description: "The event has been removed from your calendar."
    });
  };

  const handleEventDrop = (eventId: string, newDate: Date) => {
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        const timeDiff = event.endTime.getTime() - event.startTime.getTime();
        const newStartTime = new Date(newDate);
        newStartTime.setHours(event.startTime.getHours(), event.startTime.getMinutes());
        const newEndTime = new Date(newStartTime.getTime() + timeDiff);
        
        const updatedEvent = {
          ...event,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime
        };

        // Check for conflicts
        if (checkEventConflict(updatedEvent, prev.filter(e => e.id !== eventId))) {
          toast({
            title: "Cannot Move Event",
            description: "Moving this event would create a conflict with an existing event.",
            variant: "destructive"
          });
          return event;
        }

        return updatedEvent;
      }
      return event;
    }));
    
    toast({
      title: "Event Moved",
      description: "Your event has been rescheduled successfully."
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Event Calendar</h1>
        <p className="text-gray-600">Manage your schedule with ease</p>
      </div>
      
      <Card className="p-6 shadow-lg">
        <CalendarHeader 
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />
        <CalendarGrid
          currentDate={currentDate}
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      </Card>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
          setSelectedDate(null);
        }}
        selectedDate={selectedDate}
        selectedEvent={selectedEvent}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default CalendarApp;
