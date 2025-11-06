import React from 'react';
import { TrendingUp } from 'lucide-react';

function PairTabs({ pairs, selectedPair, onSelectPair }) {
  return (
    <div className="mb-6">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-white font-semibold">Monitored Pairs</h3>
          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs">
            {pairs.length} active
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* All Pairs Tab */}
          <button
            onClick={() => onSelectPair('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedPair === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            All Pairs
          </button>
          
          {/* Individual Pair Tabs */}
          {pairs.map((pair) => (
            <button
              key={pair.address}
              onClick={() => onSelectPair(pair.address)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPair === pair.address
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{pair.name}</span>
                {pair.total_swaps > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {pair.total_swaps}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
        
        {/* Pair Info (when specific pair selected) */}
        {selectedPair !== 'all' && pairs.find(p => p.address === selectedPair) && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {(() => {
              const pair = pairs.find(p => p.address === selectedPair);
              return (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Total Swaps</p>
                    <p className="text-white font-semibold">{pair.total_swaps || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Unique Traders</p>
                    <p className="text-white font-semibold">{pair.unique_traders || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Last Update</p>
                    <p className="text-white font-semibold text-xs">
                      {pair.last_updated ? new Date(pair.last_updated).toLocaleTimeString() : 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export default PairTabs;
