import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import StatsPanel from './components/StatsPanel';
import AlertList from './components/AlertList';
import SwapChart from './components/SwapChart';
import PairTabs from './components/PairTabs';
import { getPairs, getAlerts, getStats, getSwaps } from './utils/api';
import './index.css'

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [token, setToken] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  
  // NEW: Multi-pair state
  const [pairs, setPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState(null);
  const [showAllPairs, setShowAllPairs] = useState(true);
  
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ swaps: 0, traders: 0, alerts: 0, updated: '' });
  const [swaps, setSwaps] = useState([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedAddress = localStorage.getItem('wallet_address');
    if (savedToken && savedAddress) {
      setToken(savedToken);
      setAddress(savedAddress);
      setIsConnected(true);
    }
  }, []);

  // NEW: Fetch pairs on connect
  useEffect(() => {
    if (!isConnected) return;

    const fetchPairs = async () => {
      try {
        const data = await getPairs(token);
        setPairs(data.pairs || []);
        if (data.pairs && data.pairs.length > 0) {
          setSelectedPair(data.pairs[0].address);
        }
      } catch (error) {
        console.error('Failed to fetch pairs:', error);
      }
    };

    fetchPairs();
  }, [isConnected, token]);

  useEffect(() => {
    if (!isConnected) return;

    const pairToFetch = showAllPairs ? null : selectedPair;

    const alertInterval = setInterval(async () => {
      try {
        const data = await getAlerts(token, 20, pairToFetch);
        setAlerts(data.alerts || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    }, 5000);

    const statsInterval = setInterval(async () => {
      try {
        const data = await getStats(token, pairToFetch);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }, 10000);

    fetchData();

    return () => {
      clearInterval(alertInterval);
      clearInterval(statsInterval);
    };
  }, [isConnected, token, selectedPair, showAllPairs]);

  const fetchData = async () => {
    try {
      const pairToFetch = showAllPairs ? null : selectedPair;
      const [alertData, statsData, swapData] = await Promise.all([
        getAlerts(token, 20, pairToFetch),
        getStats(token, pairToFetch),
        getSwaps(token, 50, pairToFetch)
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

  // NEW: Handle pair selection
  const handlePairSelect = (pairAddress) => {
    if (pairAddress === 'all') {
      setShowAllPairs(true);
      setSelectedPair(null);
    } else {
      setShowAllPairs(false);
      setSelectedPair(pairAddress);
    }
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
            <p className="text-gray-400 text-lg">Connect your wallet to access multi-pair pump/dump detection</p>
          </div>
        ) : (
          <>
            {/* NEW: Pair Tabs */}
            <PairTabs 
              pairs={pairs}
              selectedPair={showAllPairs ? 'all' : selectedPair}
              onSelectPair={handlePairSelect}
            />
            
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