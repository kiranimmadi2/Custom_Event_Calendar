
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Event } from '../types/calendar';
import { cn } from '@/lib/utils';

interface EventItemProps {
  event: Event;
  onClick: (e: React.MouseEvent) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: event.id
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      health: 'bg-red-500',
      social: 'bg-purple-500',
      other: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  // Format time safely
  const formatTime = (time: Date | string) => {
    const dateObj = typeof time === 'string' ? new Date(time) : time;
    return dateObj instanceof Date && !isNaN(dateObj.getTime()) 
      ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'Invalid time';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={cn(
        "text-xs p-1 rounded cursor-pointer transition-all duration-200 hover:opacity-80 select-none",
        getCategoryColor(event.category),
        "text-white truncate",
        isDragging && "opacity-50 z-50"
      )}
      title={`${event.title} - ${formatTime(event.startTime)}`}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="opacity-90">
        {formatTime(event.startTime)}
      </div>
    </div>
  );
};

export default EventItem;
