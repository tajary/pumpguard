# Polygon Whale Detector
**Ultimate On-Chain Whale Tracking Tool for Polygon**

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue)](https://python.org)
[![Polygon](https://img.shields.io/badge/Chain-Polygon-purple)](https://polygon.technology)

**Polygon Buildathon Wave 3 Submission**  

## The Problem
Every week, millions of dollars are lost to **rug pulls, honeypots, and coordinated pump & dumps** on Polygon.  
Retail traders jump in late — right when whales are exiting.

Most "anti-rug" tools only check:
- Liquidity lock? 
- Ownership renounced? 
- Honeypot status?

They miss the **real danger**: silent whale accumulation followed by mass dumping.

## The Solution: PumpGuard AI
**PumpGuard AI** uses **on-chain whale detection + AI behavior analysis** to identify dangerous tokens **before** they pump — and warns users in real time.


## What It Does
This script finds **real whales** (holders owning ≥ X% of total supply) on Polygon by:
1. Pulling all `Transfer` events in a block range via **Etherscan/PolygonScan V2 API**
2. Extracting unique sender/receiver addresses
3. Batch-checking current balances using **Multicall + Infura**
4. Sorting and displaying whales (both EOA wallets and smart contracts)
5. Exporting full report to JSON

Perfect for tracking USDT, USDC, WMATIC, RETRO, meme coins, and any ERC-20 on Polygon.

## Key Features
- Full wallet addresses (no shortening)
- Shows both **EOA wallets** and **smart contracts**
- Direct PolygonScan links
- Accurate percentage of total supply
- Smart labeling (Tether Treasury, Binance wallets, etc.)
- Clean JSON export with timestamp
- No paid APIs required

## How to Use
```bash
# 1. Install dependencies
pip install web3 requests

# 2. Edit config (top of file)
TOKEN_ADDRESS = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"  # USDT
WHALE_THRESHOLD_PERCENT = 0.1
START_BLOCK = 60000000
END_BLOCK = 65000000

# 3. Run
python whale-detector.py
```

## Example Output (USDT on Polygon)
```
#   Type     Label / Name              Address                                      Balance         % Supply Link
------------------------------------------------------------------------------------------------------------------
1   EOA      Wallet              0xe7804c37c13166fF0b37F5aE0BB07A3aEbb6e245     192,514,296.72   20.8381% → https://polygonscan.com/address/...
2   Contract Contract            0x290275e3db66394C52272398959845170E4DCb88     10,379,227.46    1.1235% →  https://polygonscan.com/address/...
3   Contract Contract            0x6d0b9c5a...                                  67,890,445.00    7.35%   →  https://polygonscan.com/address/...
```

## Logic Behind It
1. **Why Transfer events?**  
   Only addresses that moved tokens in your range are checked → fast and relevant.
2. **Why Multicall?**  
   Reduces thousands of RPC calls to ~30–50 → super fast and Infura-friendly.
3. **Why show contracts too?**  
   Aave, Curve, QuickSwap, and exchange bridges are massive holders — important for market analysis.

## Best Use Cases
- Spot new whales accumulating before pumps
- Track exchange inflows/outflows
- Monitor treasury and team wallets
- Detect smart money rotation
- Find hidden gem tokens with concentrated holders

## Tech Stack
- PolygonScan V2 API (free)
- Infura + Multicall (free tier)
- Python + Web3.py
