const API_BASE = 'https://pumpguard.buildlabz.xyz/api';

export async function getNonce(address) {
  const response = await fetch(`${API_BASE}/nonce?address=${address}`);
  if (!response.ok) throw new Error('Failed to get nonce');
  return response.json();
}

export async function verifySignature(address, message, signature) {
  const response = await fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, message, signature }),
  });
  if (!response.ok) throw new Error('Failed to verify signature');
  return response.json();
}

export async function getPairs(token) {
  const response = await fetch(`${API_BASE}/pairs`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch pairs');
  return response.json();
}

export async function getAlerts(token, limit = 20, pairAddress = null) {
  const url = pairAddress 
    ? `${API_BASE}/alerts?limit=${limit}&pair=${pairAddress}`
    : `${API_BASE}/alerts?limit=${limit}`;
  
  const response = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
}

export async function getStats(token, pairAddress = null) {
  const url = pairAddress 
    ? `${API_BASE}/stats?pair=${pairAddress}`
    : `${API_BASE}/stats`;
  
  const response = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function getSwaps(token, limit = 50, pairAddress = null) {
  const url = pairAddress 
    ? `${API_BASE}/swaps?limit=${limit}&pair=${pairAddress}`
    : `${API_BASE}/swaps?limit=${limit}`;
  
  const response = await fetch(url, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch swaps');
  return response.json();
}