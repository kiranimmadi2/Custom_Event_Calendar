import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Event, RecurrenceType, RecurrencePattern } from '../types/calendar';
import { toast } from '@/hooks/use-toast';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  selectedEvent: Event | null;
  onSave: (event: Omit<Event, 'id'>) => void;
  onDelete: (eventId: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedEvent,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    category: 'personal',
    recurrenceType: 'none' as RecurrenceType,
    recurrenceInterval: 1,
    recurrenceWeekDays: [] as number[],
    recurrenceEndDate: ''
  });

  useEffect(() => {
    if (selectedEvent) {
      // Safely handle date conversion
      const formatDateForInput = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj instanceof Date && !isNaN(dateObj.getTime()) 
          ? dateObj.toISOString().split('T')[0] 
          : '';
      };

      const formatTimeForInput = (date: Date | string) => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj instanceof Date && !isNaN(dateObj.getTime()) 
          ? dateObj.toTimeString().slice(0, 5) 
          : '';
      };

      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description || '',
        date: formatDateForInput(selectedEvent.date),
        startTime: formatTimeForInput(selectedEvent.startTime),
        endTime: formatTimeForInput(selectedEvent.endTime),
        category: selectedEvent.category,
        recurrenceType: selectedEvent.recurrence?.type || 'none',
        recurrenceInterval: selectedEvent.recurrence?.interval || 1,
        recurrenceWeekDays: selectedEvent.recurrence?.weekDays || [],
        recurrenceEndDate: selectedEvent.recurrence?.endDate 
          ? formatDateForInput(selectedEvent.recurrence.endDate)
          : ''
      });
    } else if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        date: dateStr,
        startTime: '09:00',
        endTime: '10:00'
      }));
    }
  }, [selectedEvent, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Event title is required.",
        variant: "destructive"
      });
      return;
    }

    const eventDate = new Date(formData.date);
    const [startHour, startMinute] = formData.startTime.split(':').map(Number);
    const [endHour, endMinute] = formData.endTime.split(':').map(Number);
    
    const startTime = new Date(eventDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(eventDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (endTime <= startTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
        variant: "destructive"
      });
      return;
    }

    const recurrence: RecurrencePattern | undefined = 
      formData.recurrenceType !== 'none' ? {
        type: formData.recurrenceType,
        interval: formData.recurrenceInterval,
        weekDays: formData.recurrenceWeekDays,
        endDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate) : undefined
      } : undefined;

    const eventData: Omit<Event, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: eventDate,
      startTime,
      endTime,
      category: formData.category,
      recurrence
    };

    onSave(eventData);
  };

  const handleWeekDayToggle = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurrenceWeekDays: prev.recurrenceWeekDays.includes(day)
        ? prev.recurrenceWeekDays.filter(d => d !== day)
        : [...prev.recurrenceWeekDays, day]
    }));
  };

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select value={formData.recurrenceType} onValueChange={(value: RecurrenceType) => setFormData(prev => ({ ...prev, recurrenceType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.recurrenceType !== 'none' && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="interval">Repeat every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="interval"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.recurrenceInterval}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: parseInt(e.target.value) || 1 }))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">
                    {formData.recurrenceType === 'daily' && 'day(s)'}
                    {formData.recurrenceType === 'weekly' && 'week(s)'}
                    {formData.recurrenceType === 'monthly' && 'month(s)'}
                    {formData.recurrenceType === 'custom' && 'day(s)'}
                  </span>
                </div>
              </div>

              {formData.recurrenceType === 'weekly' && (
                <div>
                  <Label>Repeat on</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {weekDays.map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={formData.recurrenceWeekDays.includes(index)}
                          onCheckedChange={() => handleWeekDayToggle(index)}
                        />
                        <Label htmlFor={`day-${index}`} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.recurrenceEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, recurrenceEndDate: e.target.value }))}
                  min={formData.date}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {selectedEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(selectedEvent.id)}
                >
                  Delete Event
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedEvent ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
