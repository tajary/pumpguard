<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Database;
use App\PolygonClient;

$config = require __DIR__ . '/config.php';
$db = Database::getInstance($config);
$client = new PolygonClient(
    $config['polygon']['rpc'],
    $config['polygon']['pair_address']
);

echo "Fetching new swaps...\n";

// Get last processed block
$lastBlock = $db->getLastBlock();
$startBlock = $lastBlock > 0 ? $lastBlock + 1 : $client->getBlockNumber() - 2000;
$currentBlock = $client->getBlockNumber();

echo "Scanning blocks {$startBlock} to {$currentBlock}\n";

// Fetch logs
$logs = $client->getLogs($startBlock, $currentBlock);
echo "Found " . count($logs) . " swap events\n";

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
    
    // Insert swap
    $db->insert(
        "INSERT INTO swaps (tx_hash, block_number, sender, amount0_in, amount1_out, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())",
        [
            $txHash,
            $blockNumber,
            $sender,
            $amounts['amount0In'],
            $amounts['amount1Out']
        ]
    );
    
    echo "Inserted swap {$txHash} at block {$blockNumber}\n";
}

echo "Done!\n";
