import React from 'react';
import { Activity, Users, AlertTriangle } from 'lucide-react';

function StatsPanel({ stats, alertCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Swaps</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.swaps}</p>
            <p className="text-gray-500 text-xs mt-1">Last update: {stats.updated || 'N/A'}</p>
          </div>
          <Activity className="w-12 h-12 text-purple-400" />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Unique Traders</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.traders}</p>
            <p className="text-gray-500 text-xs mt-1">All time</p>
          </div>
          <Users className="w-12 h-12 text-blue-400" />
        </div>
      </div>
      
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium">Active Alerts</p>
            <p className="text-3xl font-bold text-white mt-1">{alertCount}</p>
            <p className="text-gray-500 text-xs mt-1">Monitoring</p>
          </div>
          <AlertTriangle className="w-12 h-12 text-yellow-400" />
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;