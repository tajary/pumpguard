# PumpGuard AI - Multi-Pair Pump/Dump Detection

> Real-time AI-powered fraud detection for DeFi trading on Polygon

[![Polygon](https://img.shields.io/badge/Polygon-Mainnet-8247E5?logo=polygon)](https://polygon.technology/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?logo=php)](https://php.net)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)

---

## 🎯 Overview

**PumpGuard AI** is a comprehensive security platform that monitors multiple QuickSwap trading pairs simultaneously, detecting pump & dump schemes, coordinated manipulation, and liquidity attacks in real-time. Built specifically for the Polygon ecosystem with enterprise-grade architecture.

### Key Features

- 🔐 **Wallet Authentication** - MetaMask integration with SIWE-style signing
- 📊 **Multi-Pair Monitoring** - Track USDC/WETH, MATIC/USDC, QUICK/USDC simultaneously
- 🤖 **AI Detection Engine** - Real-time pattern recognition for fraud detection
- 🚨 **Smart Alerts** - Context-aware notifications with risk scoring
- 📈 **Visual Analytics** - Interactive charts and comprehensive statistics
- ⚡ **REST API** - Easy integration for third-party applications
- 🎨 **Modern UI** - Tabbed interface with dark theme and glass morphism

---

## 🏗️ Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  React Frontend │ ◄─────► │   PHP Backend    │ ◄─────► │  Polygon RPC    │
│  (Vite + Tabs)  │         │  (Multi-Pair)    │         │  (QuickSwap)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
         │                           │
         │                           ▼
         │                  ┌──────────────────┐
         └─────────────────►│  MySQL Database  │
                            │  (Pair-Specific) │
                            └──────────────────┘
```

### Tech Stack

**Backend**
- PHP 8.x with Composer
- MySQL 5.7+ for data persistence
- Ethereum signature verification (Keccak, Elliptic)
- JWT authentication
- RESTful API architecture

**Frontend**
- React 18 with Hooks
- Vite for fast builds
- Tailwind CSS for styling
- ethers.js v6 for Web3 integration
- Recharts for data visualization
- Lucide React for icons

**Blockchain**
- Polygon network (low fees, fast finality)
- QuickSwap DEX integration
- eth_getLogs for event monitoring
- Multi-pair contract monitoring

---

## 📦 Installation

### Prerequisites

- **PHP** 8.0 or higher
- **MySQL** 5.7+ or PostgreSQL 12+
- **Node.js** 16+ and npm
- **Composer** 2.x
- **MetaMask** browser extension (for frontend)

### 1. Clone Repository

```bash
git clone https://github.com/tajary/pumpguard.git
cd pumpguard
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment configuration
cp ../.env.example ../.env

# Edit configuration with your settings
nano ../.env
```

**Configure `.env`:**
```env
# Database
DB_DSN=mysql:host=localhost;dbname=trading_agent
DB_USER=root
DB_PASS=your_secure_password

# Blockchain
POLYGON_RPC=https://polygon-rpc.com
# Or use premium RPC for better performance:
# POLYGON_RPC=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY

# Application
APP_URL=http://localhost:8000
JWT_SECRET=your-random-secret-key-min-32-chars
```

### 3. Database Setup

```bash
# Create database and tables
mysql -u root -p < ../schema.sql

# Verify tables were created
mysql -u root -p trading_agent -e "SHOW TABLES;"
```

**Expected output:**
```
+-------------------------+
| Tables_in_trading_agent |
+-------------------------+
| alerts                  |
| nonces                  |
| pair_stats              |
| swaps                   |
+-------------------------+
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install Node dependencies
npm install

# Verify installation
npm list react ethers
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1: Start Backend**
```bash
cd backend
php -S localhost:8000 -t public
```

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 3: Fetch Swap Data**
```bash
cd backend
php fetch_swaps.php
```

**Terminal 4: Run Analysis**
```bash
cd backend
php analyze_swaps.php
```

### Access Points

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: See [API Endpoints](#api-endpoints) section

---

## ⚙️ Configuration

### Monitored Trading Pairs

Edit `backend/config.php` to customize monitored pairs:

```php
'pairs' => [
    [
        'name' => 'USDC/WETH',
        'address' => '0x853ee4b2a13f8a742d64c8f088be7ba2131f670d',
        'token0' => 'USDC',
        'token1' => 'WETH',
        'token0_address' => '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
        'token1_address' => '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        'enabled' => true,
        'priority' => 1  // Higher priority = processed first
    ],
    // Add more pairs here...
]
```

**Finding Pair Addresses:**
- Visit [QuickSwap Analytics](https://info.quickswap.exchange/)
- Or use [PolygonScan](https://polygonscan.com/) to find pair contracts
- Or query the QuickSwap Factory contract

### Adding New Pairs

```bash
# 1. Add to config.php
# 2. Restart backend
# 3. Run fetch_swaps.php to start collecting data
php backend/fetch_swaps.php
```

---

## 🔄 Production Deployment

### 1. Setup Cron Jobs

```bash
crontab -e
```

Add the following entries:

```cron
# Fetch swaps every minute from all pairs
*/1 * * * * cd /var/www/pumpguard-ai/backend && php fetch_swaps.php >> /var/log/pumpguard/fetch.log 2>&1

# Analyze patterns every 5 minutes
*/5 * * * * cd /var/www/pumpguard-ai/backend && php analyze_swaps.php >> /var/log/pumpguard/analyze.log 2>&1

# Clean old nonces every hour
0 * * * * mysql -u root -p'password' trading_agent -e "DELETE FROM nonces WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR);" >> /var/log/pumpguard/cleanup.log 2>&1
```

### 2. Build Frontend for Production

```bash
cd frontend
npm run build

# Serve with nginx or Apache
# Build output: frontend/dist/
```

### 3. Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name pumpguard.yourdomain.com;

    # Frontend (React build)
    location / {
        root /var/www/pumpguard-ai/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Security Hardening

```bash
# Set proper permissions
chmod 600 .env
chmod 755 backend/public
chmod 644 backend/public/index.php

# Disable directory listing
# Add to .htaccess or nginx config

# Enable HTTPS (use Let's Encrypt)
sudo certbot --nginx -d pumpguard.yourdomain.com
```

---

## 📡 API Endpoints

### Authentication

#### Get Nonce
```http
GET /api/nonce?address=0x...
```

**Response:**
```json
{
  "nonce": "a1b2c3d4e5f6..."
}
```

#### Verify Signature
```http
POST /api/auth/verify
Content-Type: application/json

{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "message": "Sign this message to authenticate...",
  "signature": "0xabcd..."
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

### Data Endpoints

#### Get Monitored Pairs
```http
GET /api/pairs
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "pairs": [
    {
      "name": "USDC/WETH",
      "address": "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
      "token0": "USDC",
      "token1": "WETH",
      "total_swaps": 247,
      "unique_traders": 42,
      "last_updated": "2025-10-08 14:30:00"
    }
  ]
}
```

#### Get Alerts
```http
GET /api/alerts?limit=20&pair=0x853ee4b2a13f8a742d64c8f088be7ba2131f670d
Authorization: Bearer YOUR_TOKEN
```

**Parameters:**
- `limit` (optional): Number of alerts to return (default: 20)
- `pair` (optional): Filter by pair address (omit for all pairs)

**Response:**
```json
{
  "alerts": [
    {
      "id": 1,
      "pair_address": "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
      "pair_name": "USDC/WETH",
      "alert_type": "PumpWarning",
      "description": "High swap activity detected (35 swaps in 10 min)",
      "score": "0.7500",
      "created_at": "2025-10-08 14:25:00"
    }
  ]
}
```

#### Get Statistics
```http
GET /api/stats?pair=0x853ee4b2a13f8a742d64c8f088be7ba2131f670d
Authorization: Bearer YOUR_TOKEN
```

**Parameters:**
- `pair` (optional): Filter by pair address (omit for aggregate stats)

**Response:**
```json
{
  "swaps": 247,
  "traders": 42,
  "alerts": 3,
  "updated": "2025-10-08 14:30:00"
}
```

#### Get Swaps
```http
GET /api/swaps?limit=50&pair=0x853ee4b2a13f8a742d64c8f088be7ba2131f670d
Authorization: Bearer YOUR_TOKEN
```

**Parameters:**
- `limit` (optional): Number of swaps to return (default: 50)
- `pair` (optional): Filter by pair address (omit for all pairs)

**Response:**
```json
{
  "swaps": [
    {
      "id": 1,
      "tx_hash": "0xabcd...",
      "block_number": 50000123,
      "sender": "0x742d35Cc...",
      "amount0_in": "1000.500000000000000000",
      "amount1_out": "2.500000000000000000",
      "pair_address": "0x853ee4b2a13f8a742d64c8f088be7ba2131f670d",
      "pair_name": "USDC/WETH",
      "created_at": "2025-10-08 14:20:00"
    }
  ]
}
```

---

## 🧪 Testing

### Manual Testing

**1. Test Wallet Authentication**
```bash
# Terminal 1: Start backend
php -S localhost:8000 -t backend/public

# Terminal 2: Test nonce generation
curl "http://localhost:8000/api/nonce?address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"

# Use MetaMask to sign, then test verification
# (Use frontend or Postman for signature testing)
```

**2. Test Data Collection**
```bash
# Fetch swaps manually
php backend/fetch_swaps.php

# Verify data in database
mysql -u root -p trading_agent -e "SELECT pair_name, COUNT(*) FROM swaps GROUP BY pair_name;"
```

**3. Test Analysis**
```bash
# Run analysis
php backend/analyze_swaps.php

# Check alerts were generated
curl "http://localhost:8000/api/alerts?limit=5"
```

### Automated Testing

```bash
# Backend unit tests (if implemented)
cd backend
./vendor/bin/phpunit tests/

# Frontend tests
cd frontend
npm test
```

### Load Testing

```bash
# Test API performance
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:8000/api/stats

# Expected: <100ms response time for 1000 requests
```

---

## 🚨 Detection Rules

### Current Rules (MVP)

#### 1. Pump Warning
**Trigger:** More than 30 swaps in 10 minutes on a single pair
```php
if ($swapCount > 30) {
    $score = min(1.0, $swapCount / 50);
    // Alert: PumpWarning
}
```
**Risk Score:** 0.6 - 1.0 (proportional to swap count)

#### 2. Manipulation Alert
**Trigger:** Less than 5 unique traders with 20+ swaps
```php
if ($uniqueTraders < 5 && $swapCount > 20) {
    $score = 1.0 - ($uniqueTraders / 10);
    // Alert: Manipulation
}
```
**Risk Score:** 0.5 - 1.0 (inverse of trader diversity)

#### 3. Liquidity Warning
**Trigger:** More than 5 large swaps (>1000 tokens) in 10 minutes
```php
$largeSwaps = count(array_filter($swaps, fn($s) => 
    ($s['amount0_in'] + $s['amount1_out']) > 1000
));
if ($largeSwaps > 5) {
    // Alert: LiquidityWarning
}
```
**Risk Score:** 0.7 (fixed for MVP)

## 🧠 AI Anomaly Detection (Experimental)

> This module introduces machine learning–based anomaly detection to identify subtle pump-and-dump behavior that may not be captured by rule-based methods.

### Overview

The ML engine analyzes aggregated swap statistics per time window, such as:

* `tx_count`: number of swaps in the time window
* `total_in` / `total_out`: total token inflow/outflow
* `unique_senders`: number of distinct traders
* `avg_price_ratio`: average price ratio movement

The model is trained in an **unsupervised** manner using the [`IsolationForest`](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html) algorithm from `scikit-learn`.
It isolates rare behaviors (outliers) that differ from normal trading activity.

---

### 🧩 Architecture Flow

```mermaid
flowchart TD

A[MySQL swaps table] --> B[Data Export<br>to JSON (swaps_features.json)]
B --> C[Python AI Module]
C --> D[Data Cleaning<br>and Feature Scaling]
D --> E[Isolation Forest Model]
E --> F[Anomaly Detection<br>(-1 = suspicious)]
F --> G[Results Output<br>pumpguard_ai_output.json]
G --> H[Backend Integration<br>AI-based Alerts in analyze_swaps.php]
```

---

### 🧠 Python Module

```python
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# Step 1: Read JSON data
df = pd.read_json('swaps_features.json')

# Step 2: Clean data
df = df.dropna()
df = df[df['total_in'] > 0]
df = df[df['total_out'] > 0]

# Step 3: Define features
features = ['tx_count', 'total_in', 'total_out', 'unique_senders', 'avg_price_ratio']
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[features])

# Step 4: Train Isolation Forest
model = IsolationForest(contamination=0.01, random_state=42)
df['anomaly_score'] = model.fit_predict(X_scaled)

# Step 5: Filter anomalies
pumps = df[df['anomaly_score'] == -1]

# Step 6: Output suspicious entries
pumps.to_json('pumpguard_ai_output.json', orient='records', indent=2)
```

---

### 🔍 Visualization

The module also plots swap activity with anomaly points in red.

```python
for pair in df['pair_name'].unique():
    subset = df[df['pair_name'] == pair]
    plt.figure(figsize=(10,4))
    plt.title(f"Transaction count over time - {pair}")
    plt.plot(subset['time_window'], subset['tx_count'], label='tx_count', alpha=0.7)
    plt.scatter(pumps[pumps['pair_name']==pair]['time_window'],
                pumps[pumps['pair_name']==pair]['tx_count'],
                color='red', label='anomaly', s=30)
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()
```

---

### ⚡ Integration Points

To integrate the AI module with the PHP backend:

```php
$mlOutput = json_decode(file_get_contents('pumpguard_ai_output.json'), true);

foreach ($mlOutput as $entry) {
    if ($entry['anomaly_score'] == -1) {
        createAlert([
            'pair_name' => $entry['pair_name'],
            'alert_type' => 'AIAnomaly',
            'description' => 'Anomalous swap behavior detected by ML model',
            'score' => 0.9,
        ]);
    }
}
```

---

### 🧠 Future Enhancements

* Add **temporal models (LSTM, GRU)** for sequence-based anomaly detection
* Use **autoencoders** for unsupervised embeddings
* Add **labelled dataset** to transition toward supervised detection
* Deploy as a **Flask microservice** accessible via `/api/ml/predict`

---

## 🎨 User Interface

### Dashboard Views

#### All Pairs View
- Aggregate statistics across all monitored pairs
- Combined alert stream
- Overview chart showing total activity

#### Single Pair View
- Pair-specific statistics
- Filtered alerts for selected pair
- Pair-specific swap volume chart
- Token pair information

### Components

```
frontend/src/components/
├── Header.jsx          # Wallet connection, navigation
├── LoginModal.jsx      # MetaMask authentication flow
├── PairTabs.jsx        # Multi-pair tab navigation
├── StatsPanel.jsx      # Statistics cards (swaps, traders, alerts)
├── AlertList.jsx       # Alert cards with risk scores
└── SwapChart.jsx       # Volume chart with Recharts
```

---

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues

**Problem: Signature verification fails**
```bash
# Solution: Check dependencies
composer require kornrunner/keccak simplito/elliptic-php

# Verify message format matches exactly
# Ethereum prefix must be: "\x19Ethereum Signed Message:\n" + length
```

**Problem: Database connection fails**
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p -e "SELECT 1;"

# Verify credentials in .env
cat .env | grep DB_
```

**Problem: No swaps being fetched**
```bash
# Verify RPC endpoint
curl -X POST $POLYGON_RPC \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check pair address is correct
# Visit QuickSwap to verify: https://quickswap.exchange/

# Check logs
php backend/fetch_swaps.php 2>&1 | tee debug.log
```

#### Frontend Issues

**Problem: Wallet won't connect**
```bash
# Solution:
# 1. Install MetaMask extension
# 2. Switch to Polygon network in MetaMask
# 3. Clear browser cache and localStorage
# 4. Check console for errors (F12)
```

**Problem: API calls fail (CORS)**
```bash
# Solution: Verify CORS headers in backend/public/index.php
# Should include:
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

**Problem: Charts not displaying**
```bash
# Check data exists
curl http://localhost:8000/api/swaps?limit=10

# Verify Recharts is installed
npm list recharts

# Check browser console for React errors
```

### Debug Mode

Enable verbose logging:

```php
// In backend/config.php
'debug' => true,

// In backend code
if ($config['debug']) {
    error_log("Debug: " . json_encode($data));
}
```

```javascript
// In frontend
// Add to .env.local
VITE_DEBUG=true

// In code
if (import.meta.env.VITE_DEBUG) {
    console.log('Debug:', data);
}
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Add compound indexes for common queries
CREATE INDEX idx_pair_created ON swaps(pair_address, created_at);
CREATE INDEX idx_alert_pair_created ON alerts(pair_address, created_at);

-- Analyze query performance
EXPLAIN SELECT * FROM swaps 
WHERE pair_address = '0x...' 
AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE);
```

### Caching Strategy

```php
// Add Redis for alert caching
$redis = new Redis();
$redis->connect('127.0.0.1', 6379);

// Cache alerts for 30 seconds
$cacheKey = "alerts:{$pairAddress}";
$cached = $redis->get($cacheKey);
if ($cached) {
    return json_decode($cached, true);
}

// If not cached, fetch and store
$alerts = $db->fetchAll(...);
$redis->setex($cacheKey, 30, json_encode($alerts));
```

### Frontend Optimization

```javascript
// Use React.memo for expensive components
export default React.memo(AlertList);

// Debounce API calls
import { debounce } from 'lodash';
const debouncedFetch = debounce(fetchAlerts, 300);

// Lazy load components
const SwapChart = React.lazy(() => import('./components/SwapChart'));
```

---

## 🔐 Security Best Practices

### Production Checklist

- [x] Change `JWT_SECRET` to cryptographically secure random value (32+ chars)
- [x] Use environment variables (never commit `.env`)
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Set specific CORS origins (remove `*`)
- [ ] Implement rate limiting on API endpoints
- [ ] Add request validation and sanitization
- [ ] Use prepared statements (already implemented)
- [ ] Set up Web Application Firewall (WAF)
- [ ] Enable database backups (daily)
- [ ] Implement logging and monitoring
- [ ] Use premium RPC provider (Alchemy/QuickNode)
- [ ] Add API key authentication for B2B integrations

### Environment Variables

```bash
# Generate secure JWT secret
openssl rand -hex 32

# Add to .env
JWT_SECRET=yo
