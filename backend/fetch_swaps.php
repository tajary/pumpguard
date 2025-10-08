<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Database;
use App\PolygonClient;

$config = require __DIR__ . '/config.php';
$db = Database::getInstance($config);

echo "Fetching new swaps from multiple pairs...\n";

// CHANGED: Loop through all enabled pairs
foreach ($config['polygon']['pairs'] as $pairConfig) {
    if (!$pairConfig['enabled']) {
        echo "Skipping disabled pair: {$pairConfig['name']}\n";
        continue;
    }
    
    echo "\n--- Processing pair: {$pairConfig['name']} ({$pairConfig['address']}) ---\n";
    
    $client = new PolygonClient(
        $config['polygon']['rpc'],
        $pairConfig['address']
    );
    
    // Get last processed block for this specific pair
    $lastBlock = $db->fetchOne(
        "SELECT MAX(block_number) as last_block FROM swaps WHERE pair_address = ?",
        [$pairConfig['address']]
    );
    $lastBlock = $lastBlock['last_block'] ?? 0;
    
    $startBlock = $lastBlock > 0 ? $lastBlock + 1 : $client->getBlockNumber() - 1000;
    $currentBlock = $client->getBlockNumber();
    
    echo "Scanning blocks {$startBlock} to {$currentBlock}\n";
    
    // Fetch logs
    $logs = $client->getLogs($startBlock, $currentBlock);
    echo "Found " . count($logs) . " swap events for {$pairConfig['name']}\n";
    
    // Process each log
    foreach ($logs as $log) {
        $txHash = $log['transactionHash'];
        $blockNumber = hexdec($log['blockNumber']);
        $sender = $client->decodeSenderFromLog($log);
        $amounts = $client->decodeAmountsFromData($log['data']);
        
        // Check if already exists
        $exists = $db->fetchOne(
            "SELECT id FROM swaps WHERE tx_hash = ?",
            [$txHash]
        );
        
        if ($exists) {
            continue;
        }
        
        // CHANGED: Insert swap with pair info
        $db->insert(
            "INSERT INTO swaps (tx_hash, block_number, sender, amount0_in, amount1_out, pair_address, pair_name, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [
                $txHash,
                $blockNumber,
                $sender,
                $amounts['amount0In'],
                $amounts['amount1Out'],
                $pairConfig['address'],
                $pairConfig['name']
            ]
        );
        
        echo "Inserted swap {$txHash} for {$pairConfig['name']} at block {$blockNumber}\n";
    }
    
    // Update pair statistics
    updatePairStats($db, $pairConfig);
}

echo "\nDone fetching all pairs!\n";

function updatePairStats($db, $pairConfig) {
    $stats = $db->fetchOne(
        "SELECT 
            COUNT(*) as total_swaps,
            COUNT(DISTINCT sender) as unique_traders
         FROM swaps 
         WHERE pair_address = ?",
        [$pairConfig['address']]
    );
    
    $db->query(
        "INSERT INTO pair_stats (pair_address, pair_name, total_swaps, unique_traders, last_updated)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE
            total_swaps = VALUES(total_swaps),
            unique_traders = VALUES(unique_traders),
            last_updated = NOW()",
        [
            $pairConfig['address'],
            $pairConfig['name'],
            $stats['total_swaps'],
            $stats['unique_traders']
        ]
    );
}
