-- Database schema for AI Trading Agent

CREATE DATABASE IF NOT EXISTS pump_guard;
USE pump_guard;

-- Swaps table
CREATE TABLE IF NOT EXISTS swaps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    block_number BIGINT NOT NULL,
    sender VARCHAR(42) NOT NULL,
    amount0_in DECIMAL(38, 18) NULL,
    amount1_out DECIMAL(38, 18) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_block_number (block_number),
    INDEX idx_sender (sender),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token_pair VARCHAR(42) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    score DECIMAL(6,4) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_type (alert_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Nonces table for SIWE authentication
CREATE TABLE IF NOT EXISTS nonces (
    id INT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(42) NOT NULL,
    nonce VARCHAR(64) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_address (address),
    INDEX idx_nonce (nonce),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
