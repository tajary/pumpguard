import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function SwapChart({ swaps }) {
  const chartData = useMemo(() => {
    if (!swaps || swaps.length === 0) return [];
    
    // Group swaps by 5-minute intervals using local time
    const intervalData = {};
    
    swaps.forEach(swap => {
      const date = new Date(swap.created_at);
      
      // Round to 5-minute intervals in local time
      const timestamp = date.getTime();
      const roundedTimestamp = Math.floor(timestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);
      
      // Format as local time
      const localDate = new Date(roundedTimestamp);
      const key = localDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Store both display time and timestamp for proper sorting
      if (!intervalData[roundedTimestamp]) {
        intervalData[roundedTimestamp] = { 
          timestamp: roundedTimestamp, 
          displayTime: key, 
          volume: 0 
        };
      }
      intervalData[roundedTimestamp].volume += 1;
    });
    
    // Sort by timestamp and take last 12 intervals
    return Object.values(intervalData)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-12)
      .map(({ displayTime, volume }) => ({ 
        time: displayTime, 
        volume 
      }));
  }, [swaps]);

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Swap Volume</h3>
      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          No swap data available yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Line type="monotone" dataKey="volume" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default SwapChart;