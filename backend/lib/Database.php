<?php
namespace App;

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct($config) {
        $this->pdo = new \PDO(
            $config['db']['dsn'],
            $config['db']['user'],
            $config['db']['pass'],
            [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]
        );
    }

    public static function getInstance($config) {
        if (self::$instance === null) {
            self::$instance = new self($config);
        }
        return self::$instance;
    }

    public function query($sql, $params = []) {
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll(\PDO::FETCH_ASSOC);
    }

    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch(\PDO::FETCH_ASSOC);
    }

    public function insert($sql, $params = []) {
        $this->query($sql, $params);
        return $this->pdo->lastInsertId();
    }

    public function getLastBlock() {
        $result = $this->fetchOne("SELECT MAX(block_number) as last_block FROM swaps");
        return $result['last_block'] ?? 0;
    }
}
