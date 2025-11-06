import React from 'react';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';

function AlertList({ alerts }) {
  const getAlertColor = (type) => {
    switch(type) {
      case 'PumpWarning': return 'from-yellow-500 to-orange-500';
      case 'Manipulation': return 'from-red-500 to-pink-500';
      case 'LiquidityWarning': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'PumpWarning': return <TrendingUp className="w-5 h-5" />;
      case 'Manipulation': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
      <h3 className="text-xl font-bold text-white mb-4">Recent Alerts</h3>
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-3 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-gray-400">No alerts detected. System is stable.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${getAlertColor(alert.alert_type)}`}>
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-white font-semibold">{alert.alert_type}</h4>
                      {/* NEW: Show pair name badge */}
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {alert.pair_name}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{alert.description}</p>
                    <p className="text-gray-500 text-xs mt-2">{alert.created_at}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                    Score: {(parseFloat(alert.score) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertList;
