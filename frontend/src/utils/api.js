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

export async function getAlerts(token, limit = 20) {
  const response = await fetch(`${API_BASE}/alerts?limit=${limit}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch alerts');
  return response.json();
}

export async function getStats(token) {
  const response = await fetch(`${API_BASE}/stats`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function getSwaps(token, limit = 50) {
  const response = await fetch(`${API_BASE}/swaps?limit=${limit}`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  });
  if (!response.ok) throw new Error('Failed to fetch swaps');
  return response.json();
}
