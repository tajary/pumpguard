# Demo Script - PumpGuard AI Trading Agent

A step-by-step demo scenario to showcase the PumpGuard AI Trading Agent functionality.

## Prerequisites

- Backend and frontend running
- MetaMask installed
- Database initialized

## Demo Scenario

### Step 1: Connect Wallet (2 minutes)

1. Open http://localhost:3000
2. Click "Connect Wallet" button
3. MetaMask popup appears
4. Select an account and click "Connect"
5. Sign the authentication message when prompted
6. Dashboard loads showing your connected address

**Expected Result:** 
- Header shows truncated wallet address (0x1234...5678)
- Green dot indicator shows "Connected" status

### Step 2: View Initial State (1 minute)

Dashboard displays:
- Total Swaps: 0
- Unique Traders: 0
- Active Alerts: 0
- Empty chart with "No swap data available"
- "No alerts detected. System is stable." message

### Step 3: Fetch Real Swaps (3 minutes)

```bash
# In a new terminal
cd backend
php fetch_swaps.php
```

**What happens:**
- Script connects to Polygon RPC
- Fetches recent Swap events from QuickSwap pair
- Decodes transaction data
- Inserts swaps into database
- Prints progress to console

**Expected Output:**
```
Fetching new swaps...
Scanning blocks 50000000 to 50001000
Found 15 swap events
Inserted swap 0x123... at block 50000234
Inserted swap 0x456... at block 50000456
...
Done!
```

### Step 4: View Updated Dashboard (1 minute)

Return to browser (http://localhost:3000):
- Stats panel updates automatically (10-second polling)
- Swap count increases (e.g., 15)
- Unique traders count updates (e.g., 8)
- Chart displays swap volume over time

### Step 5: Simulate High Activity Period (5 minutes)

To trigger alerts, we'll insert fake high-volume data:

```bash
mysql -u root -p trading_agent
```

```sql
-- Insert 40 swaps from only 3 addresses in last 5 minutes
INSERT INTO swaps (tx_hash, block_number, sender, amount0_in, amount1_out, created_at)
SELECT 
    CONCAT('0x', MD5(CONCAT('fake', n))),
    50001000 + n,
    CASE MOD(n, 3)
        WHEN 0 THEN '0x1111111111111111111111111111111111111111'
        WHEN 1 THEN '0x2222222222222222222222222222222222222222'
        ELSE '0x3333333333333333333333333333333333333333'
    END,
    100.0 + (n * 10),
    50.0 + (n * 5),
    DATE_SUB(NOW(), INTERVAL MOD(n, 10) MINUTE)
FROM (
    SELECT @row := @row + 1 AS n
    FROM information_schema.columns c1, 
         information_schema.columns c2,
         (SELECT @row := 0) r
    LIMIT 40
) numbers;
```

**What this does:**
- Creates 40 fake swaps
- Only 3 unique senders (low diversity)
- Timestamps within last 10 minutes
- Will trigger both PumpWarning and Manipulation alerts

### Step 6: Run Analysis (2 minutes)

```bash
cd backend
php analyze_swaps.php
```

**Expected Output:**
```
Analyzing swaps for anomalies...
Last 10 min: 55 swaps, 11 unique traders
Alert: PumpWarning (score: 1.0)
Alert: Manipulation (score: 0.5)
Analysis complete. Generated 2 new alerts.
```

### Step 7: View Alerts (1 minute)

Return to browser:
- Active Alerts count increases to 2
- Alert cards appear with:
  - **PumpWarning**: "High swap activity detected (55 swaps in 10 min)"
  - **Manipulation**: "Low trader diversity with high volume (11 traders, 55 swaps)"
- Each alert shows:
  - Colored gradient icon
  - Risk score percentage
  - Timestamp

### Step 8: Test API Directly (Optional, 2 minutes)

```bash
# Get your JWT token from browser localStorage
# Then test API:

TOKEN="your_jwt_token_here"

# Get alerts
curl "http://localhost:8000/api/alerts?limit=5" \
  -H "Authorization: Bearer $TOKEN"

# Get stats
curl "http://localhost:8000/api/stats" \
  -H "Authorization: Bearer $TOKEN"

# Get recent swaps
curl "http://localhost:8000/api/swaps?limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Step 9: Real-time Updates (2 minutes)

Keep browser open and observe:
- Stats update every 10 seconds
- Alerts refresh every 5 seconds
- Chart updates automatically
- No page refresh needed

### Step 10: Disconnect Wallet (30 seconds)

1. Click "Disconnect" button in header
2. Dashboard returns to login screen
3. LocalStorage cleared
4. Ready for next demo session

## Demo Tips

### For Impressive Demo:

1. **Pre-populate data** before the demo:
   ```bash
   php backend/fetch_swaps.php
   # Run SQL insert script
   php backend/analyze_swaps.php
   ```

2. **Use multiple browser windows:**
   - Window 1: Dashboard view
   - Window 2: Terminal with fetch_swaps.php running
   - Window 3: Terminal with analyze_swaps.php running

3. **Explain while running:**
   - "This is fetching real-time swap data from Polygon..."
   - "Now analyzing for pump and dump patterns..."
   - "See how the ML rules detected unusual activity..."

### Talking Points:

- **Blockchain Integration**: Real eth_getLogs calls to Polygon
- **Security**: Wallet signature verification, no passwords
- **Real-time**: Automatic polling, instant alerts
- **Scalability**: Can monitor multiple pairs, add ML models
- **Production-ready**: JWT auth, prepared statements, proper indexing

## Clean Up After Demo

```bash
# Clear all data
mysql -u root -p -e "TRUNCATE trading_agent.swaps; TRUNCATE trading_agent.alerts; TRUNCATE trading_agent.nonces;"

# Or drop and recreate
mysql -u root -p < schema.sql
```

## Common Demo Issues

**Issue**: No swaps fetched
- **Solution**: Check PAIR_ADDRESS in .env has recent activity
- **Workaround**: Use the SQL insert script to create demo data

**Issue**: Alerts not appearing
- **Solution**: Ensure swaps are within last 10 minutes
- **Fix**: Update created_at timestamps in SQL

**Issue**: MetaMask not signing
- **Solution**: Refresh page, clear cache, reconnect wallet
- **Check**: Browser console for errors

## Extended Demo (20 minutes)

For a longer presentation:

1. Show code architecture (5 min)
2. Explain detection algorithms (3 min)
3. Live wallet connection (2 min)
4. Data collection process (5 min)
5. Alert generation (3 min)
6. API demonstration (2 min)

## Questions to Anticipate

**Q: How does signature verification work?**
A: SIWE-style - user signs a message with nonce, backend recovers address using ECDSA, verifies match.

**Q: Can this detect real pump and dumps?**
A: MVP uses rule-based detection. Production would use ML models trained on historical pump/dump patterns.

**Q: How scalable is this?**
A: Current: Single pair. Scale by adding worker queues, multiple pairs, database sharding, caching layer.

**Q: What's the latency?**
A: Fetch runs every minute, analysis every 5 minutes. Can reduce to real-time with WebSocket + event streams.

**Q: Security concerns?**
A: JWT tokens, signature verification, prepared statements, input validation. Production needs rate limiting, HTTPS, secrets management.