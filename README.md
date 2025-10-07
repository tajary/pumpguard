# PumpGuard AI - Trading Agent - Pump/Dump Detection

A full-stack MVP for detecting pump and dump schemes on Polygon using QuickSwap pair monitoring, wallet authentication, and real-time alerting.

## Features

- 🔐 Wallet authentication via MetaMask (SIWE-style)
- 📊 Real-time swap monitoring on Polygon
- 🚨 Automated alert generation for suspicious activity
- 📈 Visual dashboard with charts and statistics
- ⚡ REST API for data access

## Tech Stack

**Backend:**
- PHP 8.x with Composer
- MySQL database
- Ethereum signature verification (Keccak + Elliptic)
- JWT authentication

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- ethers.js v6
- Recharts for visualizations

**Blockchain:**
- Polygon network
- QuickSwap DEX integration
- eth_getLogs for event monitoring

## Prerequisites

- PHP 8.0 or higher
- MySQL 5.7+ or PostgreSQL
- Node.js 16+ and npm
- Composer
- MetaMask browser extension

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd pump-guard-ai
```

### 2. Backend Setup

```bash
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp ../.env.example ../.env

# Edit .env with your configuration
nano ../.env
```

**Configure .env:**
```env
DB_DSN=mysql:host=localhost;dbname=trading_agent
DB_USER=root
DB_PASS=your_password
POLYGON_RPC=https://polygon-rpc.com
PAIR_ADDRESS=0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827  # Example QuickSwap pair
APP_URL=http://localhost:8000
JWT_SECRET=secret-key
```

### 3. Database Setup

```bash
# Create database and tables
mysql -u root -p < ../schema.sql

# Or for PostgreSQL (adjust schema.sql for PostgreSQL syntax):
psql -U postgres -f ../schema.sql
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Start Backend Server

```bash
cd ../backend

# Start PHP development server
php -S localhost:8000 -t public

# Or use the main directory as root:
cd ..
php -S localhost:8000 -t backend/public
```

### 6. Setup Cron Jobs (Production)

Add to your crontab (`crontab -e`):

```cron
# Fetch new swaps every minute
*/1 * * * * cd /path/to/pump-guard-ai/backend && php fetch_swaps.php >> /var/log/fetch_swaps.log 2>&1

# Analyze swaps every 5 minutes
*/5 * * * * cd /path/to/pump-guard-ai/backend && php analyze_swaps.php >> /var/log/analyze_swaps.log 2>&1
```

**For development/testing**, run manually:
```bash
# Terminal 1: Fetch swaps
php backend/fetch_swaps.php

# Terminal 2: Analyze swaps
php backend/analyze_swaps.php
```

## Running the Application

1. **Start Backend** (Terminal 1):
   ```bash
   php -S localhost:8000 -t backend/public
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

4. **Run Data Collection** (Terminal 3 & 4):
   ```bash
   # Fetch swaps
   php backend/fetch_swaps.php
   
   # Analyze swaps
   php backend/analyze_swaps.php
   ```

## Usage

### 1. Connect Wallet

- Open http://localhost:3000
- Click "Connect Wallet"
- MetaMask will prompt you to connect
- Sign the authentication message
- Dashboard will load with your address

### 2. Monitor Swaps

The system automatically:
- Fetches swap events from the configured QuickSwap pair
- Analyzes trading patterns every 5 minutes
- Generates alerts based on detection rules

### 3. View Alerts

Alerts are displayed in the dashboard with:
- Alert type (PumpWarning, Manipulation, LiquidityWarning)
- Description of the detected pattern
- Risk score (0-1)
- Timestamp

## API Endpoints

### Authentication

**GET /api/nonce**
```bash
curl "http://localhost:8000/api/nonce?address=0x..."
```
Response: `{ "nonce": "abc123..." }`

**POST /api/auth/verify**
```bash
curl -X POST http://localhost:8000/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x...",
    "message": "Sign this message...",
    "signature": "0x..."
  }'
```
Response: `{ "success": true, "token": "jwt_token", "address": "0x..." }`

### Data Endpoints

**GET /api/alerts**
```bash
curl "http://localhost:8000/api/alerts?limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**GET /api/stats**
```bash
curl "http://localhost:8000/api/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**GET /api/swaps**
```bash
curl "http://localhost:8000/api/swaps?limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Detection Rules (MVP)

The system implements three basic detection rules:

### 1. Pump Warning
- **Trigger**: More than 30 swaps in 10 minutes
- **Score**: Proportional to swap count (max at 50+ swaps)
- **Indicates**: Sudden high trading activity

### 2. Manipulation Alert
- **Trigger**: Less than 5 unique traders with 20+ swaps
- **Score**: Based on trader diversity
- **Indicates**: Coordinated trading by few addresses

### 3. Liquidity Warning
- **Trigger**: Multiple large swaps detected
- **Score**: 0.7 fixed (simplified for MVP)
- **Indicates**: Potential liquidity manipulation

## Project Structure

```
pump-guard-ai/
├── backend/
│   ├── composer.json           # PHP dependencies
│   ├── config.php              # Configuration loader
│   ├── fetch_swaps.php         # Cron: Fetch swap events
│   ├── analyze_swaps.php       # Cron: Analyze and alert
│   ├── lib/
│   │   ├── Database.php        # Database wrapper
│   │   ├── PolygonClient.php   # RPC client
│   │   └── SignatureVerifier.php # Wallet auth
│   └── public/
│       └── index.php           # API router
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── components/         # UI components
│   │   └── utils/api.js        # API client
│   ├── package.json
│   └── vite.config.js
├── schema.sql                  # Database schema
├── .env.example               # Environment template
└── README.md
```

## Database Schema

### swaps
- Stores all detected swap transactions
- Indexed by block_number, sender, created_at

### alerts
- Stores generated alerts
- Indexed by alert_type, created_at

### nonces
- Temporary storage for authentication nonces
- Auto-cleaned (10-minute expiry)

## Security Notes

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use environment variables (never commit .env)
- [ ] Enable HTTPS for API endpoints
- [ ] Set proper CORS origins (remove `*`)
- [ ] Use prepared statements (already implemented)
- [ ] Add rate limiting to API endpoints
- [ ] Validate all user inputs
- [ ] Use a production RPC provider (Alchemy/QuickNode)
- [ ] Setup proper logging and monitoring
- [ ] Regular database backups

## Troubleshooting

### Backend Issues

**Signature verification fails:**
- Ensure `kornrunner/keccak` and `simplito/elliptic-php` are installed
- Check that the message format matches exactly
- Verify MetaMask is signing with the correct account

**Database connection fails:**
- Check MySQL is running: `sudo systemctl status mysql`
- Verify credentials in .env
- Ensure database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**No swaps being fetched:**
- Verify PAIR_ADDRESS is correct
- Check RPC endpoint is responding: `curl -X POST <RPC_URL> -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`
- Review logs: `php backend/fetch_swaps.php` for errors

### Frontend Issues

**Wallet won't connect:**
- Install MetaMask extension
- Ensure you're on a supported network (Polygon)
- Check browser console for errors

**API calls fail:**
- Verify backend is running on port 8000
- Check CORS headers in backend/public/index.php
- Ensure token is being sent in Authorization header

**Charts not displaying:**
- Verify swap data exists: `curl http://localhost:8000/api/swaps`
- Check browser console for React errors

## Extending the System

### Adding ML Detection

We should replace the simple rules in `analyze_swaps.php` with ML predictions:

```php
// Current: Simple rules
if ($swapCount > 30) { /* alert */ }

// Future: ML microservice
$mlEndpoint = 'http://localhost:5000/predict';
$response = file_get_contents($mlEndpoint, false, stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => json_encode(['swaps' => $recentSwaps])
    ]
]));
$predictions = json_decode($response, true);
```


### Adding More Trading Pairs

Modify `config.php` to support multiple pairs:

```php
'pairs' => [
    '0x6e7a5FAFcec6BB1e78bAE2A1F0B612012BF14827', // USDC-ETH
    '0x...',  // Another pair
]
```

Update `fetch_swaps.php` to loop through pairs.

## Performance Optimization

- **Batch inserts**: Group multiple swaps in single INSERT
- **Database indexing**: Already configured in schema.sql
- **Caching**: Add Redis for alert caching
- **Rate limiting**: Implement in API router
- **WebSocket**: Replace polling with real-time updates

## Testing

### Manual Testing

1. **Test wallet auth:**
   ```bash
   # Get nonce
   curl "http://localhost:8000/api/nonce?address=0xYourAddress"
   
   # Sign in MetaMask and verify
   curl -X POST http://localhost:8000/api/auth/verify -d '{"address":"...","message":"...","signature":"..."}'
   ```

2. **Test data collection:**
   ```bash
   php backend/fetch_swaps.php
   mysql -u root -p -e "SELECT COUNT(*) FROM trading_agent.swaps;"
   ```

3. **Test analysis:**
   ```bash
   php backend/analyze_swaps.php
   curl "http://localhost:8000/api/alerts"
   ```

### Load Testing

Use Apache Bench:
```bash
ab -n 1000 -c 10 http://localhost:8000/api/stats
```

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Check troubleshooting section
- Review logs in browser console and PHP error logs
- Verify all dependencies are installed correctly

## Credits

Built with:
- PHP 8.x
- React 18
- ethers.js
- Tailwind CSS
- Recharts