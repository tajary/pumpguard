import React, { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { getNonce, verifySignature } from '../utils/api';

function LoginModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError('');

      // Check for MetaMask
      if (!window.ethereum) {
        throw new Error('Please install MetaMask to continue');
      }

      // Request account access
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // Get nonce from backend
      const nonceData = await getNonce(address);
      const nonce = nonceData.nonce;

      // Create SIWE-style message
      const message = `Sign this message to authenticate with AI Trading Agent\n\nAddress: ${address}\nNonce: ${nonce}`;

      // Sign message
      const signature = await signer.signMessage(message);

      // Verify signature with backend
      const verifyData = await verifySignature(address, message, signature);

      if (verifyData.success) {
        onSuccess(address, verifyData.token);
      } else {
        throw new Error('Signature verification failed');
      }

    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-300 mb-6">
          Sign a message to verify wallet ownership and access the dashboard.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Sign Message'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;