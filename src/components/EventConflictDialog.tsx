
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '../types/calendar';
import { formatTime } from '../utils/dateUtils';
import { AlertTriangle } from 'lucide-react';

interface EventConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingEvents: Event[];
  newEvent: Omit<Event, 'id'>;
  onForceCreate: () => void;
}

const EventConflictDialog: React.FC<EventConflictDialogProps> = ({
  isOpen,
  onClose,
  conflictingEvents,
  newEvent,
  onForceCreate
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <span>Event Conflict Detected</span>
          </DialogTitle>
          <DialogDescription>
            The event "{newEvent.title}" conflicts with existing events at the same time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Conflicting Events:</h4>
            <div className="space-y-2">
              {conflictingEvents.map(event => (
                <div key={event.id} className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="font-medium text-red-800">{event.title}</div>
                  <div className="text-sm text-red-600">
                    {formatTime(event.startTime)} - {formatTime(event.endTime)}
                  </div>
                  {event.description && (
                    <div className="text-sm text-red-600 mt-1">{event.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onForceCreate}>
              Create Anyway
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventConflictDialog;
