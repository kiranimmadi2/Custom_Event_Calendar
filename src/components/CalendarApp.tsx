import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import WeeklyView from './WeeklyView';
import EventModal from './EventModal';
import EventFilters from './EventFilters';
import EventStats from './EventStats';
import EventConflictDialog from './EventConflictDialog';
import { Event, RecurrenceType } from '../types/calendar';
import { toast } from '@/hooks/use-toast';
import { generateRecurringEvents, checkEventConflict } from '../utils/calendarUtils';
import { filterEvents } from '../utils/eventUtils';
import { Calendar, CalendarDays } from 'lucide-react';

const CalendarApp = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [conflictDialog, setConflictDialog] = useState<{
    isOpen: boolean;
    conflictingEvents: Event[];
    newEvent: Omit<Event, 'id'> | null;
  }>({
    isOpen: false,
    conflictingEvents: [],
    newEvent: null
  });

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

  const filteredEvents = filterEvents(events, searchTerm, categoryFilter);

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
    const conflictingEvents = events.filter(e => 
      e.id !== newEvent.id && checkEventConflict(newEvent, [e])
    );

    if (conflictingEvents.length > 0) {
      setConflictDialog({
        isOpen: true,
        conflictingEvents,
        newEvent: eventData
      });
      return;
    }

    saveEventWithoutConflictCheck(eventData);
  };

  const saveEventWithoutConflictCheck = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: selectedEvent?.id || Date.now().toString()
    };

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

  const handleForceCreateEvent = () => {
    if (conflictDialog.newEvent) {
      saveEventWithoutConflictCheck(conflictDialog.newEvent);
    }
    setConflictDialog({ isOpen: false, conflictingEvents: [], newEvent: null });
    toast({
      title: "Event Created",
      description: "Event created despite conflicts.",
      variant: "destructive"
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    console.log('Deleting event:', eventId);
    
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) {
      console.log('Event not found:', eventId);
      return;
    }

    // Check if this is a recurring event
    // Recurring events have IDs like "baseId_1", "baseId_2", etc.
    const isRecurringEvent = eventId.includes('_') || 
      events.some(e => e.id.startsWith(eventId + '_'));

    if (isRecurringEvent) {
      // Get the base ID (before the underscore)
      const baseId = eventId.includes('_') ? eventId.split('_')[0] : eventId;
      
      // Find all events in the recurring series
      const recurringEvents = events.filter(e => 
        e.id === baseId || e.id.startsWith(baseId + '_')
      );

      console.log('Found recurring events:', recurringEvents.length, recurringEvents.map(e => e.id));

      if (recurringEvents.length > 1) {
        // Delete all events in the recurring series
        setEvents(prev => prev.filter(e => 
          e.id !== baseId && !e.id.startsWith(baseId + '_')
        ));
        
        toast({
          title: "Recurring Event Series Deleted",
          description: `Deleted ${recurringEvents.length} events from the recurring series.`
        });
      } else {
        // Single event, delete normally
        setEvents(prev => prev.filter(e => e.id !== eventId));
        toast({
          title: "Event Deleted",
          description: "The event has been removed from your calendar."
        });
      }
    } else {
      // Single non-recurring event
      setEvents(prev => prev.filter(e => e.id !== eventId));
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar."
      });
    }

    setIsModalOpen(false);
    setSelectedEvent(null);
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

      <EventStats events={events} />
      
      <Card className="p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <CalendarHeader 
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="flex items-center space-x-1"
            >
              <Calendar className="h-4 w-4" />
              <span>Month</span>
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
              className="flex items-center space-x-1"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Week</span>
            </Button>
          </div>
        </div>

        <EventFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />

        {viewMode === 'month' ? (
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onEventDrop={handleEventDrop}
          />
        ) : (
          <WeeklyView
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
          />
        )}
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

      <EventConflictDialog
        isOpen={conflictDialog.isOpen}
        onClose={() => setConflictDialog({ isOpen: false, conflictingEvents: [], newEvent: null })}
        conflictingEvents={conflictDialog.conflictingEvents}
        newEvent={conflictDialog.newEvent || {} as Omit<Event, 'id'>}
        onForceCreate={handleForceCreateEvent}
      />
    </div>
  );
};

export default CalendarApp;
