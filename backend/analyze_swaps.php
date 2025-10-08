<?php
require_once __DIR__ . '/vendor/autoload.php';

use App\Database;

$config = require __DIR__ . '/config.php';
$db = Database::getInstance($config);

echo "Analyzing swaps for anomalies across all pairs...\n";

$timeWindow = 10; // minutes

foreach ($config['polygon']['pairs'] as $pairConfig) {
    if (!$pairConfig['enabled']) {
        continue;
    }
    
    echo "\n--- Analyzing {$pairConfig['name']} ---\n";
    
    // Get recent swaps for this pair
    $recentSwaps = $db->fetchAll(
        "SELECT * FROM swaps 
         WHERE pair_address = ? 
         AND created_at > DATE_SUB(NOW(), INTERVAL ? MINUTE)",
        [$pairConfig['address'], $timeWindow]
    );
    
    $swapCount = count($recentSwaps);
    $uniqueTraders = count(array_unique(array_column($recentSwaps, 'sender')));
    
    echo "Last {$timeWindow} min: {$swapCount} swaps, {$uniqueTraders} unique traders\n";
    
    $alerts = [];
    
    // Rule 1: High swap activity (pump warning)
    if ($swapCount > 30) {
        $score = min(1.0, $swapCount / 50);
        $alerts[] = [
            'type' => 'PumpWarning',
            'description' => "{$pairConfig['name']}: High swap activity detected ({$swapCount} swaps in {$timeWindow} min)",
            'score' => $score
        ];
        echo "Alert: PumpWarning (score: {$score})\n";
    }
    
    // Rule 2: Low trader diversity with high volume (manipulation)
    if ($uniqueTraders < 5 && $swapCount > 20) {
        $score = 1.0 - ($uniqueTraders / 10);
        $alerts[] = [
            'type' => 'Manipulation',
            'description' => "{$pairConfig['name']}: Low trader diversity with high volume ({$uniqueTraders} traders, {$swapCount} swaps)",
            'score' => $score
        ];
        echo "Alert: Manipulation (score: {$score})\n";
    }
    
    // Rule 3: Liquidity warning (simplified - based on large swaps)
    $largeSwaps = array_filter($recentSwaps, function($swap) {
        return ($swap['amount0_in'] + $swap['amount1_out']) > 1000;
    });
    
    if (count($largeSwaps) > 5) {
        $score = 0.7;
        $alerts[] = [
            'type' => 'LiquidityWarning',
            'description' => "{$pairConfig['name']}: Multiple large swaps detected (" . count($largeSwaps) . " large transactions)",
            'score' => $score
        ];
        echo "Alert: LiquidityWarning (score: {$score})\n";
    }
    
    // Insert alerts into database
    foreach ($alerts as $alert) {
        $db->insert(
            "INSERT INTO alerts (pair_address, pair_name, alert_type, description, score, created_at) 
             VALUES (?, ?, ?, ?, ?, NOW())",
            [
                $pairConfig['address'],
                $pairConfig['name'],
                $alert['type'],
                $alert['description'],
                $alert['score']
            ]
        );
    }
}

// Write all alerts to JSON file
$publicAlerts = $db->fetchAll(
    "SELECT * FROM alerts ORDER BY created_at DESC LIMIT 50"
);

$alertsFile = __DIR__ . '/public/alerts.json';
file_put_contents($alertsFile, json_encode($publicAlerts, JSON_PRETTY_PRINT));

echo "\nAnalysis complete!\n";
