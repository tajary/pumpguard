import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import StatsPanel from './components/StatsPanel';
import AlertList from './components/AlertList';
import SwapChart from './components/SwapChart';
import { getAlerts, getStats, getSwaps } from './utils/api';
import './index.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ swaps: 0, traders: 0, updated: '' });
  const [swaps, setSwaps] = useState([]);

  useEffect(() => {
    // Check for existing token
    const savedToken = localStorage.getItem('auth_token');
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    // Poll alerts every 5 seconds
    const alertInterval = setInterval(async () => {
      try {
        const data = await getAlerts(token);
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    }, 5000);

    // Poll stats every 10 seconds
    const statsInterval = setInterval(async () => {
      try {
        const data = await getStats(token);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, 10000);

    // Initial fetch
    fetchData();

    return () => {
      clearInterval(alertInterval);
      clearInterval(statsInterval);
    };
  }, [isConnected, token]);

  const fetchData = async () => {
    try {
      const [alertData, statsData, swapData] = await Promise.all([
        getAlerts(token),
        getStats(token),
        getSwaps(token, 50)
      ]);
      setAlerts(alertData.alerts || []);
      setStats(statsData);
      setSwaps(swapData.swaps || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleConnect = () => {
    setShowLogin(true);
  };

  const handleLoginSuccess = (userAddress, authToken) => {
    setAddress(userAddress);
    setToken(authToken);
    setIsConnected(true);
    setShowLogin(false);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('wallet_address', userAddress);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
    setToken('');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wallet_address');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header 
        isConnected={isConnected}
        address={address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />
      
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isConnected ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to PumpGuard AI</h2>
            <p className="text-gray-400 text-lg">Connect your wallet to access pump/dump detection</p>
          </div>
        ) : (
          <>
            <StatsPanel stats={stats} alertCount={alerts.length} />
            <SwapChart swaps={swaps} />
            <AlertList alerts={alerts} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
