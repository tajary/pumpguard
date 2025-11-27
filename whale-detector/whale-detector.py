import time
import requests
import json
from web3 import Web3
from web3.middleware import geth_poa_middleware

# ============================ CONFIG ============================
POLYSCAN_API_KEY = "---API-KEY---"
INFURA_URL = "https://polygon-mainnet.infura.io/v3/---API-KEY---"

# Choose your target token
TOKEN_ADDRESS = "0xc2132d05d31c914a87c6611c10748aeb04b58e8f"      # USDT (Tether)
# TOKEN_ADDRESS = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"  # USDC
# TOKEN_ADDRESS = "0xbfa765d19d9d08f73be12afd9f35de826aaf30e1f".lower()  # RETRO

WHALE_THRESHOLD_PERCENT = 0.1        # Minimum % of supply to show
START_BLOCK = 60000000
END_BLOCK = 65000000


# ============================ MAIN CLASS ============================
class WhaleDetector:
    def __init__(self):
        print("Connecting to Polygon Mainnet...")
        self.w3 = Web3(Web3.HTTPProvider(INFURA_URL))
        self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)

        addr = Web3.to_checksum_address(TOKEN_ADDRESS.lower())
        self.token = self.w3.eth.contract(address=addr, abi=[
            {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "symbol", "outputs": [{"name": "", "type": "string"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "totalSupply", "outputs": [{"name": "", "type": "uint256"}], "type": "function"}
        ])

        self.decimals = self.token.functions.decimals().call()
        self.symbol = self.safe_call(self.token.functions.symbol)
        print(f"Token: {self.symbol} | Address: {TOKEN_ADDRESS} | Decimals: {self.decimals}")

    def safe_call(self, func):
        try: return func().call()
        except: return "UNKNOWN"

    def get_transfer_events(self):
        print(f"Fetching Transfer events (blocks {START_BLOCK:,} → {END_BLOCK:,})...")
        url = "https://api.etherscan.io/v2/api"
        params = {
            "chainid": 137,
            "module": "logs",
            "action": "getLogs",
            "fromBlock": START_BLOCK,
            "toBlock": END_BLOCK,
            "address": TOKEN_ADDRESS.lower(),
            "topic0": "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "apikey": POLYSCAN_API_KEY
        }
        try:
            r = requests.get(url, params=params, timeout=40).json()
            if r.get("status") != "1":
                print("API Error:", r.get("message"))
                return set()

            holders = set()
            for log in r["result"]:
                if len(log["topics"]) >= 3:
                    from_addr = "0x" + log["topics"][1][-40:]
                    to_addr = "0x" + log["topics"][2][-40:]
                    holders.add(Web3.to_checksum_address(from_addr))
                    holders.add(Web3.to_checksum_address(to_addr))
            print(f"Found {len(holders):,} unique addresses with activity")
            return holders
        except Exception as e:
            print("Failed to fetch events:", e)
            return set()

    def get_balances(self, addresses):
        print(f"Checking current balances of {len(addresses):,} addresses...")
        balances = {}
        multicall = self.w3.eth.contract(
            address="0xcA11bde05977b3631167028862bE2a173976CA11",
            abi=[{"inputs":[{"components":[{"name":"target","type":"address"},{"name":"callData","type":"bytes"}],"name":"calls","type":"tuple[]"}],"name":"aggregate","outputs":[{"name":"blockNumber","type":"uint256"},{"name":"returnData","type":"bytes[]"}],"stateMutability":"view","type":"function"}]
        )

        batch = list(addresses)
        for i in range(0, len(batch), 30):
            calls = []
            for addr in batch[i:i+30]:
                try:
                    call_data = self.token.encodeABI(fn_name="balanceOf", args=[addr])
                    calls.append((self.token.address, call_data))
                except: continue

            if calls:
                try:
                    _, results = multicall.functions.aggregate(calls).call()
                    for addr, data in zip(batch[i:i+30], results):
                        bal = int.from_bytes(data, "big")
                        if bal > 0:
                            balances[addr] = bal
                except: pass
            time.sleep(0.05)
        return balances

    def is_contract(self, addr):
        try:
            return len(self.w3.eth.get_code(addr)) > 2
        except:
            return False

    def get_label(self, addr):
        addr_lower = addr.lower()
        return "Contract" if self.is_contract(addr) else "Wallet"

    def run(self):
        print("\n" + "="*100)
        print("ULTIMATE POLYGON WHALE DETECTION — EOA + CONTRACTS")
        print("="*100)

        total_supply_raw = self.safe_call(self.token.functions.totalSupply)
        total_supply = total_supply_raw / (10 ** self.decimals) if total_supply_raw else 0
        print(f"Total Circulating Supply: {total_supply:,.2f} {self.symbol}\n")

        holders = self.get_transfer_events()
        if not holders:
            print("No activity found in this range.")
            return

        balances = self.get_balances(holders)

        whales = []
        min_amount = (total_supply * WHALE_THRESHOLD_PERCENT) / 100

        for addr, bal_raw in balances.items():
            amount = bal_raw / (10 ** self.decimals)
            if amount >= min_amount:
                whales.append({
                    "address": addr,
                    "amount": amount,
                    "percentage": (amount / total_supply) * 100,
                    "type": "Contract" if self.is_contract(addr) else "EOA",
                    "label": self.get_label(addr),
                    "explorer": f"https://polygonscan.com/address/{addr}"
                })

        whales.sort(key=lambda x: x["amount"], reverse=True)

        print(f"WHALES ≥ {WHALE_THRESHOLD_PERCENT}% OF TOTAL SUPPLY ({len(whales)} found)\n")
        print(f"{'#':<3} {'Type':<8} {'Label / Name':<25} {'Address':<44} {'Balance':>20} {'% Supply':>12} {'Link'}")
        print("-" * 150)
        for i, w in enumerate(whales[:100], 1):
            print(f"{i:<3} {w['type']:<8} {w['label'][:24]:<25} {w['address']:<44} "
                  f"{w['amount']:>18,.2f} {w['percentage']:>10.4f}% → {w['explorer']}")

        # Save full report
        filename = f"ultimate_whales_{self.symbol}_{int(time.time())}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump({
                "token": self.symbol,
                "contract": TOKEN_ADDRESS,
                "total_supply": total_supply,
                "threshold_percent": WHALE_THRESHOLD_PERCENT,
                "total_whales_found": len(whales),
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "whales": whales
            }, f, indent=2, ensure_ascii=False, default=str)

        print(f"\nFull report saved: {filename}")
        print("="*100)

# ============================ RUN ============================
if __name__ == "__main__":
    WhaleDetector().run()
