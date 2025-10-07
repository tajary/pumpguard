<?php
namespace App;

class PolygonClient {
    private $rpcUrl;
    private $pairAddress;

    public function __construct($rpcUrl, $pairAddress) {
        $this->rpcUrl = $rpcUrl;
        $this->pairAddress = $pairAddress;
    }

    public function getLogs($fromBlock, $toBlock = 'latest') {
        // Swap event signature: Swap(address,uint256,uint256,uint256,uint256,address)
        $swapTopic = '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822';
        
        $params = [[
            'address' => strtolower($this->pairAddress),
            'topics' => [$swapTopic],
            'fromBlock' => '0x' . dechex($fromBlock),
            'toBlock' => $toBlock === 'latest' ? 'latest' : '0x' . dechex($toBlock)
        ]];

        $response = $this->rpcCall('eth_getLogs', $params);
        
        var_dump($params, $response);
        
        return $response['result'] ?? [];
    }

    public function getBlockNumber() {
        $response = $this->rpcCall('eth_blockNumber', []);
        return hexdec($response['result'] ?? '0');
    }

    private function rpcCall($method, $params) {
        $payload = json_encode([
            'jsonrpc' => '2.0',
            'method' => $method,
            'params' => $params,
            'id' => 1
        ]);

        $ch = curl_init($this->rpcUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }

    public function decodeSenderFromLog($log) {
        // topics[1] is sender address (padded to 32 bytes)
        if (isset($log['topics'][1])) {
            return '0x' . substr($log['topics'][1], -40);
        }
        return null;
    }

    public function decodeAmountsFromData($data) {
        // Simple decode - data contains 4 uint256 values
        // For MVP: amount0In, amount1In, amount0Out, amount1Out
        $data = substr($data, 2); // Remove 0x
        $chunks = str_split($data, 64);
        
        return [
            'amount0In' => isset($chunks[0]) ? hexdec($chunks[0]) / 1e18 : 0,
            'amount1In' => isset($chunks[1]) ? hexdec($chunks[1]) / 1e18 : 0,
            'amount0Out' => isset($chunks[2]) ? hexdec($chunks[2]) / 1e18 : 0,
            'amount1Out' => isset($chunks[3]) ? hexdec($chunks[3]) / 1e18 : 0,
        ];
    }
}
