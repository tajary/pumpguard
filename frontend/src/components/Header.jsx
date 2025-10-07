import React from 'react';
import { Activity, Wallet } from 'lucide-react';

function Header({ isConnected, address, onConnect, onDisconnect }) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">PumpGuard AI</h1>
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white backdrop-blur-sm">
              Polygon Network
            </span>
          </div>
          {!isConnected ? (
            <button
              onClick={onConnect}
              className="flex items-center space-x-2 px-6 py-2.5 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-mono text-sm">
                  {address.substring(0, 6)}...{address.substring(38)}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="px-4 py-2 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all backdrop-blur-md"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
