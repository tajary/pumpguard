<?php
namespace App;

use kornrunner\Keccak;
use Elliptic\EC;

class SignatureVerifier {
    
    public function generateNonce() {
        return bin2hex(random_bytes(16));
    }

    public function createMessage($address, $nonce) {
        return "Sign this message to authenticate with AI Trading Agent\n\nAddress: {$address}\nNonce: {$nonce}";
    }

    public function verifySignature($message, $signature, $expectedAddress) {
        try {
            // Remove 0x prefix
            $signature = str_replace('0x', '', $signature);
            
            // Split signature into r, s, v
            if (strlen($signature) !== 130) {
                return false;
            }
            
            $r = substr($signature, 0, 64);
            $s = substr($signature, 64, 64);
            $v = hexdec(substr($signature, 128, 2));
            
            // Normalize v
            if ($v < 27) {
                $v += 27;
            }
            
            // Hash the message with Ethereum prefix
            $hash = $this->hashMessage($message);
            
            // Recover public key
            $ec = new EC('secp256k1');
            $signature_obj = [
                'r' => $r,
                's' => $s,
                'recoveryParam' => $v - 27
            ];
            
            $pubkey = $ec->recoverPubKey($hash, $signature_obj, $signature_obj['recoveryParam']);
            $pubKeyHex = '04' . $pubkey->getX()->toString(16) . $pubkey->getY()->toString(16);
            
            // Derive address from public key
            $pubKeyBin = hex2bin(substr($pubKeyHex, 2));
            $addressHash = Keccak::hash($pubKeyBin, 256);
            $address = '0x' . substr($addressHash, -40);
            
            return strtolower($address) === strtolower($expectedAddress);
            
        } catch (\Exception $e) {
            error_log("Signature verification error: " . $e->getMessage());
            return false;
        }
    }

    private function hashMessage($message) {
        $prefix = "\x19Ethereum Signed Message:\n" . strlen($message);
        $prefixedMsg = $prefix . $message;
        return Keccak::hash($prefixedMsg, 256);
    }
}