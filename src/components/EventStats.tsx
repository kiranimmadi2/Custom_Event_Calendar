
import React from 'react';
import { Card } from '@/components/ui/card';
import { Event } from '../types/calendar';
import { getEventStats } from '../utils/eventUtils';
import { Calendar, Clock, TrendingUp } from 'lucide-react';

interface EventStatsProps {
  events: Event[];
}

const EventStats: React.FC<EventStatsProps> = ({ events }) => {
  const stats = getEventStats(events);

  const getCategoryColor = (category: string) => {
    const colors = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      health: 'bg-red-100 text-red-800',
      social: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Clock className="h-8 w-8 text-green-600" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.todayCount}</div>
            <div className="text-sm text-gray-600">Today's Events</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div>
            <div className="text-2xl font-bold text-gray-900">{stats.upcomingEvents.length}</div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
        </div>
      </Card>
      
      {Object.keys(stats.categories).length > 0 && (
        <Card className="p-4 md:col-span-3">
          <h3 className="font-medium text-gray-900 mb-3">Events by Category</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.categories).map(([category, count]) => (
              <span
                key={category}
                className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(category)}`}
              >
                {category}: {count}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default EventStats;
