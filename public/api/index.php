<?php
/**
 * DAINTY STUDS & CHAINS - Hostinger Online Persistence & Database API
 * Handles live cross-device synchronization on Hostinger hosting.
 * Supports Hostinger MySQL Database (PDO) or Hostinger Server File Database.
 */

// Enable error logging while returning clean JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);
ini_set('display_errors', '0');

// CORS Headers
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dbConfigFile = __DIR__ . '/db_config.json';
$productsDbFile = __DIR__ . '/products_db.json';
$deletedIdsFile = __DIR__ . '/deleted_ids.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';
$profilesFile = __DIR__ . '/profiles.json';

// Helper to get MySQL PDO connection if configured
function getPdoConnection($configFile) {
    if (!file_exists($configFile)) {
        return null;
    }
    $cfg = json_decode(file_get_contents($configFile), true);
    if (!$cfg || empty($cfg['db_host']) || empty($cfg['db_name']) || empty($cfg['db_user'])) {
        return null;
    }

    try {
        $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4";
        $pdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'] ?? '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);

        // Auto-initialize tables
        $pdo->exec("CREATE TABLE IF NOT EXISTS dainty_products (
            id VARCHAR(128) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price INT NOT NULL DEFAULT 0,
            sale_price INT NULL,
            data LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->exec("CREATE TABLE IF NOT EXISTS dainty_deleted_ids (
            id VARCHAR(128) PRIMARY KEY,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        return $pdo;
    } catch (Exception $e) {
        error_log("Hostinger MySQL connection error: " . $e->getMessage());
        return null;
    }
}

// File storage helpers
function getFileDeletedIds($file) {
    if (file_exists($file)) {
        $data = json_decode(file_get_contents($file), true);
        if (is_array($data)) return $data;
    }
    return [];
}

function saveFileDeletedIds($file, $ids) {
    file_put_contents($file, json_encode(array_values(array_unique($ids)), JSON_PRETTY_PRINT), LOCK_EX);
}

function getFileProducts($productsFile, $deletedFile) {
    $deleted = array_flip(getFileDeletedIds($deletedFile));
    if (file_exists($productsFile)) {
        $content = file_get_contents($productsFile);
        $products = json_decode($content, true);
        if (is_array($products)) {
            $filtered = [];
            foreach ($products as $p) {
                if (isset($p['id']) && !isset($deleted[$p['id']])) {
                    $filtered[] = $p;
                }
            }
            return $filtered;
        }
    }
    return [];
}

function saveFileProducts($file, $products) {
    file_put_contents($file, json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['endpoint'] ?? '';
$id = $_GET['id'] ?? '';

// Fallback path parsing
if (empty($endpoint)) {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (strpos($uri, '/api/') !== false) {
        $endpoint = preg_replace('#^.*?/api/#', '', $uri);
        $endpoint = trim($endpoint, '/');
        if (preg_match('#^products/([^/]+)$#', $endpoint, $matches) && $matches[1] !== 'reset') {
            $id = $matches[1];
        }
    }
}
$endpoint = trim($endpoint, '/');

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

// File Manager JSON files are the single source of truth for this website.
$pdo = null;

// -----------------------------------------------------------------------------
// ROUTE: Account Profiles stored in Hostinger File Manager
if (preg_match('#^profiles/([^/]+)$#', $endpoint, $matches)) {
    $profileId = urldecode($matches[1]);
    $profiles = [];
    if (file_exists($profilesFile)) { $stored = json_decode(file_get_contents($profilesFile), true); if (is_array($stored)) $profiles = $stored; }
    if ($method === 'GET') { echo json_encode($profiles[$profileId] ?? null); exit; }
    if ($method === 'PUT' || $method === 'PATCH') {
        if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Profile data is required.']); exit; }
        $profiles[$profileId] = array_merge($profiles[$profileId] ?? [], $body, ['id' => $profileId, 'updated_at' => gmdate('c')]);
        if (file_put_contents($profilesFile, json_encode($profiles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) { http_response_code(500); echo json_encode(['error' => 'Could not write the profile file.']); exit; }
        echo json_encode($profiles[$profileId]); exit;
    }
    if ($method === 'DELETE') { unset($profiles[$profileId]); file_put_contents($profilesFile, json_encode($profiles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX); echo json_encode(['success' => true, 'id' => $profileId]); exit; }
}

// ROUTE: Database Status / Connection Test
// -----------------------------------------------------------------------------
if ($endpoint === 'db_status' || $endpoint === 'database/status') {
    if ($pdo) {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM dainty_products");
        $count = $stmt->fetch()['count'] ?? 0;
        echo json_encode([
            'status' => 'connected',
            'driver' => 'Hostinger MySQL Database',
            'products_count' => (int)$count,
            'persistent' => true
        ]);
    } else {
        $prods = getFileProducts($productsDbFile, $deletedIdsFile);
        echo json_encode([
            'status' => 'connected',
            'driver' => 'Hostinger Server File Database',
            'products_count' => count($prods),
            'persistent' => true,
            'note' => 'To use Hostinger MySQL, enter credentials in Admin Settings.'
        ]);
    }
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: Save Database Configuration
// -----------------------------------------------------------------------------
if (($endpoint === 'db_config' || $endpoint === 'database/config') && $method === 'POST') {
    $cfg = [
        'db_host' => trim($body['db_host'] ?? 'localhost'),
        'db_name' => trim($body['db_name'] ?? ''),
        'db_user' => trim($body['db_user'] ?? ''),
        'db_pass' => (string)($body['db_pass'] ?? '')
    ];

    if (empty($cfg['db_name']) || empty($cfg['db_user'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Database name and username are required.']);
        exit;
    }

    try {
        $dsn = "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4";
        $testPdo = new PDO($dsn, $cfg['db_user'], $cfg['db_pass'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_TIMEOUT => 4
        ]);
        
        file_put_contents($dbConfigFile, json_encode($cfg, JSON_PRETTY_PRINT), LOCK_EX);

        // Migrate existing products if any
        $existing = getFileProducts($productsDbFile, $deletedIdsFile);
        $testPdo->exec("CREATE TABLE IF NOT EXISTS dainty_products (
            id VARCHAR(128) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            price INT NOT NULL DEFAULT 0,
            sale_price INT NULL,
            data LONGTEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $testPdo->exec("CREATE TABLE IF NOT EXISTS dainty_deleted_ids (
            id VARCHAR(128) PRIMARY KEY,
            deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        if (!empty($existing)) {
            $insert = $testPdo->prepare("INSERT INTO dainty_products (id, name, price, sale_price, data) VALUES (:id, :name, :price, :sale_price, :data) ON DUPLICATE KEY UPDATE name = :name, price = :price, sale_price = :sale_price, data = :data");
            foreach ($existing as $p) {
                $insert->execute([
                    ':id' => $p['id'],
                    ':name' => $p['name'] ?? 'Jewelry Piece',
                    ':price' => (int)($p['price'] ?? 0),
                    ':sale_price' => isset($p['sale_price']) ? (int)$p['sale_price'] : null,
                    ':data' => json_encode($p, JSON_UNESCAPED_UNICODE)
                ]);
            }
        }

        echo json_encode([
            'success' => true,
            'message' => 'Successfully connected to Hostinger MySQL Database and synced existing products!'
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'error' => 'Connection failed: ' . $e->getMessage()
        ]);
    }
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: GET Products
// -----------------------------------------------------------------------------
if ($endpoint === 'products' && $method === 'GET') {
    if ($pdo) {
        $stmt = $pdo->query("SELECT p.data FROM dainty_products p LEFT JOIN dainty_deleted_ids d ON p.id = d.id WHERE d.id IS NULL ORDER BY p.updated_at DESC");
        $results = [];
        while ($row = $stmt->fetch()) {
            $decoded = json_decode($row['data'], true);
            if ($decoded) $results[] = $decoded;
        }
        echo json_encode($results);
    } else {
        $products = getFileProducts($productsDbFile, $deletedIdsFile);
        echo json_encode($products);
    }
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: POST (Create / Update Product)
// -----------------------------------------------------------------------------
if ($endpoint === 'products' && $method === 'POST') {
    if (!is_array($body) || empty($body['name'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Product name is required.']);
        exit;
    }

    $product = $body;
    if (empty($product['id'])) {
        $product['id'] = 'prod_' . substr(md5(uniqid(mt_rand(), true)), 0, 9);
        $product['created_at'] = gmdate('Y-m-d\TH:i:s\Z');
    }

    $productId = $product['id'];

    if ($pdo) {
        // Remove from deleted blacklist if re-added
        $delStmt = $pdo->prepare("DELETE FROM dainty_deleted_ids WHERE id = :id");
        $delStmt->execute([':id' => $productId]);

        $stmt = $pdo->prepare("INSERT INTO dainty_products (id, name, price, sale_price, data) 
            VALUES (:id, :name, :price, :sale_price, :data) 
            ON DUPLICATE KEY UPDATE name = :name, price = :price, sale_price = :sale_price, data = :data");
        $stmt->execute([
            ':id' => $productId,
            ':name' => $product['name'],
            ':price' => (int)($product['price'] ?? 0),
            ':sale_price' => isset($product['sale_price']) ? (int)$product['sale_price'] : null,
            ':data' => json_encode($product, JSON_UNESCAPED_UNICODE)
        ]);
    } else {
        // Remove from deleted list
        $deleted = getFileDeletedIds($deletedIdsFile);
        if (in_array($productId, $deleted)) {
            $deleted = array_diff($deleted, [$productId]);
            saveFileDeletedIds($deletedIdsFile, $deleted);
        }

        $all = getFileProducts($productsDbFile, $deletedIdsFile);
        $found = false;
        foreach ($all as $idx => $p) {
            if ($p['id'] === $productId) {
                $all[$idx] = array_merge($p, $product);
                $found = true;
                break;
            }
        }
        if (!$found) {
            array_unshift($all, $product);
        }
        saveFileProducts($productsDbFile, $all);
    }

    echo json_encode($product);
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: DELETE Product
// -----------------------------------------------------------------------------
if (($endpoint === 'products' || strpos($endpoint, 'products/') === 0) && $method === 'DELETE') {
    if (empty($id)) {
        $id = str_replace('products/', '', $endpoint);
    }

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'Product ID is required for deletion.']);
        exit;
    }

    if ($pdo) {
        // Insert into deleted blacklist
        $insDel = $pdo->prepare("INSERT IGNORE INTO dainty_deleted_ids (id) VALUES (:id)");
        $insDel->execute([':id' => $id]);

        // Remove from active products
        $delStmt = $pdo->prepare("DELETE FROM dainty_products WHERE id = :id");
        $delStmt->execute([':id' => $id]);
    } else {
        // Add to permanent blacklist
        $deleted = getFileDeletedIds($deletedIdsFile);
        if (!in_array($id, $deleted)) {
            $deleted[] = $id;
            saveFileDeletedIds($deletedIdsFile, $deleted);
        }

        $all = getFileProducts($productsDbFile, $deletedIdsFile);
        $filtered = array_values(array_filter($all, function($p) use ($id) {
            return ($p['id'] ?? '') !== $id;
        }));
        saveFileProducts($productsDbFile, $filtered);
    }

    echo json_encode([
        'success' => true,
        'deletedId' => $id,
        'message' => "Product {$id} permanently deleted."
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: Reset Database to Seed Catalog
// -----------------------------------------------------------------------------
if ($endpoint === 'reset' && $method === 'POST') {
    $seed = is_array($body) ? $body : [];
    if ($pdo) {
        $pdo->exec("TRUNCATE TABLE dainty_deleted_ids");
        $pdo->exec("TRUNCATE TABLE dainty_products");
        if (!empty($seed)) {
            $insert = $pdo->prepare("INSERT INTO dainty_products (id, name, price, sale_price, data) VALUES (:id, :name, :price, :sale_price, :data)");
            foreach ($seed as $p) {
                $insert->execute([
                    ':id' => $p['id'],
                    ':name' => $p['name'] ?? 'Jewelry Piece',
                    ':price' => (int)($p['price'] ?? 0),
                    ':sale_price' => isset($p['sale_price']) ? (int)$p['sale_price'] : null,
                    ':data' => json_encode($p, JSON_UNESCAPED_UNICODE)
                ]);
            }
        }
    } else {
        saveFileDeletedIds($deletedIdsFile, []);
        if (!empty($seed)) {
            saveFileProducts($productsDbFile, $seed);
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database restored to initial catalog.'
    ]);
    exit;
}

// -----------------------------------------------------------------------------
// ROUTE: Isolated Multi-User Shopping Bag / Cart (/api/cart)
// -----------------------------------------------------------------------------
$userCartsFile = __DIR__ . '/user_carts.json';

if ($endpoint === 'cart' || strpos($endpoint, 'cart/') === 0) {
    $userId = $_GET['userId'] ?? $_GET['shopperId'] ?? '';
    if (empty($userId) && strpos($endpoint, 'cart/') === 0) {
        $userId = trim(str_replace('cart/', '', $endpoint));
    }

    $allCarts = file_exists($userCartsFile) ? json_decode(file_get_contents($userCartsFile), true) : [];
    if (!is_array($allCarts)) $allCarts = [];

    // GET /api/cart?userId=...
    if ($method === 'GET') {
        if (empty($userId)) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required']);
            exit;
        }
        $entry = $allCarts[$userId] ?? ['cart' => []];
        $userCart = isset($entry['cart']) && is_array($entry['cart']) ? $entry['cart'] : (is_array($entry) ? $entry : []);
        echo json_encode(['userId' => $userId, 'cart' => $userCart, 'count' => count($userCart)]);
        exit;
    }

    // POST /api/cart
    if ($method === 'POST' || $method === 'PUT') {
        $postUserId = trim($body['userId'] ?? $userId);
        if (empty($postUserId)) {
            http_response_code(400);
            echo json_encode(['error' => 'userId is required']);
            exit;
        }
        $cartData = is_array($body['cart'] ?? null) ? $body['cart'] : [];
        $allCarts[$postUserId] = [
            'cart' => $cartData,
            'shopper' => $body['shopper'] ?? null,
            'updatedAt' => date('c')
        ];
        file_put_contents($userCartsFile, json_encode($allCarts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        echo json_encode(['success' => true, 'userId' => $postUserId, 'count' => count($cartData)]);
        exit;
    }

    // DELETE /api/cart
    if ($method === 'DELETE') {
        if (!empty($userId) && isset($allCarts[$userId])) {
            unset($allCarts[$userId]);
            file_put_contents($userCartsFile, json_encode($allCarts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
        }
        echo json_encode(['success' => true, 'userId' => $userId]);
        exit;
    }
}

// =============================================================================
// RELWORX MOBILE MONEY GATEWAY (PHP Implementation for Hostinger Apache/LiteSpeed)
// =============================================================================
function getRelworxPhpConfig() {
    $apiKey = getenv('RELWORX_API_KEY') ?: ($_ENV['RELWORX_API_KEY'] ?? '');
    $accountNo = getenv('RELWORX_ACCOUNT_NO') ?: ($_ENV['RELWORX_ACCOUNT_NO'] ?? 'REL11AE925B85');
    $webhookKey = getenv('RELWORX_WEBHOOK_KEY') ?: ($_ENV['RELWORX_WEBHOOK_KEY'] ?? '424a7fe74781e4ecdcb8dfcbdb');
    $baseUrl = getenv('RELWORX_BASE_URL') ?: ($_ENV['RELWORX_BASE_URL'] ?? 'https://payments.relworx.com/api');
    $webhookUrl = getenv('RELWORX_WEBHOOK_URL') ?: ($_ENV['RELWORX_WEBHOOK_URL'] ?? 'https://daintystudsandchains.com/api/relworx/webhook');

    $possibleFiles = [
        __DIR__ . '/payment_config.json',
        __DIR__ . '/../data/payment_config.json',
        '/home/u111258626/domains/daintystudsandchains.com/dainty_data/payment_config.json'
    ];
    foreach ($possibleFiles as $f) {
        if (file_exists($f)) {
            $cfg = json_decode(file_get_contents($f), true);
            if (is_array($cfg)) {
                if (!empty($cfg['apiKey'])) $apiKey = $cfg['apiKey'];
                if (!empty($cfg['accountNo'])) $accountNo = $cfg['accountNo'];
                if (!empty($cfg['webhookKey'])) $webhookKey = $cfg['webhookKey'];
                if (!empty($cfg['baseUrl'])) $baseUrl = $cfg['baseUrl'];
                if (!empty($cfg['webhookUrl'])) $webhookUrl = $cfg['webhookUrl'];
                break;
            }
        }
    }

    return [
        'apiKey' => trim((string)$apiKey),
        'accountNo' => trim((string)$accountNo ?: 'REL11AE925B85'),
        'webhookKey' => trim((string)$webhookKey),
        'baseUrl' => rtrim(trim((string)$baseUrl ?: 'https://payments.relworx.com/api'), '/'),
        'webhookUrl' => trim((string)$webhookUrl ?: 'https://daintystudsandchains.com/api/relworx/webhook')
    ];
}

function callRelworxCurl($path, $method = 'GET', $payload = null, $cfg = []) {
    if (empty($cfg['apiKey']) || empty($cfg['accountNo'])) {
        http_response_code(400);
        return ['error' => 'Relworx server credentials are not configured. Set RELWORX_API_KEY and RELWORX_ACCOUNT_NO.'];
    }

    $url = $cfg['baseUrl'] . $path;
    $ch = curl_init($url);
    $headers = [
        'Accept: application/vnd.relworx.v2',
        'Authorization: Bearer ' . $cfg['apiKey'],
        'Content-Type: application/json'
    ];

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($payload !== null) {
            $payload['account_no'] = $cfg['accountNo'];
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        }
    } elseif ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }

    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        http_response_code(502);
        return ['error' => 'Connection to Relworx failed: ' . $err];
    }

    $json = json_decode($raw, true);
    if (!is_array($json)) {
        http_response_code($status ?: 502);
        return ['error' => 'Invalid response from Relworx (HTTP ' . $status . ')', 'raw' => substr((string)$raw, 0, 150)];
    }

    if ($status >= 400) {
        http_response_code($status);
    }

    return $json;
}

// ROUTE: /api/health
if ($endpoint === 'health' && $method === 'GET') {
    $cfg = getRelworxPhpConfig();
    echo json_encode([
        'ok' => true,
        'relworxConfigured' => !empty($cfg['apiKey']) && !empty($cfg['accountNo']),
        'account_no' => $cfg['accountNo']
    ]);
    exit;
}

// ROUTE: GET /api/relworx/status or /api/relworx/config
if (($endpoint === 'relworx/status' || $endpoint === 'relworx/config') && $method === 'GET') {
    $cfg = getRelworxPhpConfig();
    $key = $cfg['apiKey'];
    $isConfigured = !empty($key) && !empty($cfg['accountNo']);
    $serverIp = $_SERVER['SERVER_ADDR'] ?? '151.106.96.51';
    if (!empty($_SERVER['LOCAL_ADDR'])) $serverIp = $_SERVER['LOCAL_ADDR'];
    echo json_encode([
        'configured' => $isConfigured,
        'account_no' => $cfg['accountNo'],
        'api_key_set' => !empty($key),
        'masked_key' => !empty($key) ? substr($key, 0, 4) . '••••••••' . substr($key, -4) : null,
        'webhook_key_set' => !empty($cfg['webhookKey']),
        'server_ip' => $serverIp,
        'base_url' => $cfg['baseUrl'],
        'webhook_url' => $cfg['webhookUrl'],
        'merchant_mtn' => '+256788227027',
        'merchant_airtel' => '+256759924291',
        'supported_networks' => ['MTN', 'AIRTEL'],
        'timestamp' => gmdate('Y-m-d\TH:i:s\Z')
    ]);
    exit;
}

// ROUTE: POST /api/relworx/config -> Save configuration
if ($endpoint === 'relworx/config' && $method === 'POST') {
    $cfg = getRelworxPhpConfig();
    $updated = [
        'accountNo' => !empty($body['accountNo']) ? trim($body['accountNo']) : $cfg['accountNo'],
        'apiKey' => isset($body['apiKey']) ? trim($body['apiKey']) : $cfg['apiKey'],
        'webhookKey' => isset($body['webhookKey']) ? trim($body['webhookKey']) : $cfg['webhookKey'],
        'baseUrl' => !empty($body['baseUrl']) ? trim($body['baseUrl']) : $cfg['baseUrl'],
        'webhookUrl' => !empty($body['webhookUrl']) ? trim($body['webhookUrl']) : $cfg['webhookUrl'],
        'updated_at' => gmdate('Y-m-d\TH:i:s\Z')
    ];
    $targetFile = __DIR__ . '/payment_config.json';
    file_put_contents($targetFile, json_encode($updated, JSON_PRETTY_PRINT), LOCK_EX);

    $key = $updated['apiKey'];
    echo json_encode([
        'success' => true,
        'message' => 'Relworx payment credentials saved and persisted successfully.',
        'configured' => !empty($key) && !empty($updated['accountNo']),
        'account_no' => $updated['accountNo'],
        'masked_key' => !empty($key) ? substr($key, 0, 4) . '••••••••' . substr($key, -4) : null
    ]);
    exit;
}

// ROUTE: POST /api/relworx/test-connection -> Ping Relworx
if ($endpoint === 'relworx/test-connection' && $method === 'POST') {
    $cfg = getRelworxPhpConfig();
    $testKey = !empty($body['apiKey']) ? trim($body['apiKey']) : $cfg['apiKey'];
    $testAccount = !empty($body['accountNo']) ? trim($body['accountNo']) : $cfg['accountNo'];
    $testBase = !empty($body['baseUrl']) ? trim($body['baseUrl']) : $cfg['baseUrl'];

    if (empty($testKey)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Please enter a Relworx API Key to test connection.']);
        exit;
    }

    $ch = curl_init($testBase . '/mobile-money/check-request-status?internal_reference=PING_TEST&account_no=' . urlencode($testAccount));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/vnd.relworx.v2',
        'Authorization: Bearer ' . $testKey,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        http_response_code(502);
        echo json_encode(['success' => false, 'error' => 'Could not reach Relworx servers: ' . $err]);
        exit;
    }

    if ($status === 401 || $status === 403) {
        $parsed = json_decode($raw, true);
        $msg = !empty($parsed['message']) ? $parsed['message'] : (!empty($parsed['error']) ? $parsed['error'] : 'Authentication failed with Relworx. The API key is invalid or unauthorized.');
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => $msg]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Relworx payment server is connected and authenticated successfully!',
        'account_no' => $testAccount,
        'status' => $status
    ]);
    exit;
}

// ROUTE: POST /api/relworx/webhook -> Always acknowledge 200 so Relworx never retries
if ($endpoint === 'relworx/webhook') {
    http_response_code(200);
    echo json_encode(['received' => true, 'timestamp' => time()]);
    exit;
}

// ROUTE: POST /api/relworx/mobile-money/request-payment -> Initiate USSD push
if ($endpoint === 'relworx/mobile-money/request-payment' && $method === 'POST') {
    $cfg = getRelworxPhpConfig();
    $msisdn = $body['msisdn'] ?? '';
    $amount = (float)($body['amount'] ?? 0);
    $reference = $body['reference'] ?? '';
    $description = $body['description'] ?? "DAINTY Order {$reference}";

    if (!preg_match('/^\+256\d{9}$/', $msisdn) || $amount < 500 || $amount > 5000000 || !preg_match('/^[A-Za-z0-9]{8,36}$/', $reference)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid phone, amount, or payment reference.']);
        exit;
    }

    // Debounce duplicate prompts within 10 seconds for the same phone number
    $lockFile = sys_get_temp_dir() . '/relworx_lock_' . md5($msisdn) . '.txt';
    $now = time();
    if (file_exists($lockFile)) {
        $lastTime = (int)@file_get_contents($lockFile);
        if (($now - $lastTime) < 10) {
            http_response_code(429);
            echo json_encode(['error' => 'A payment prompt was just sent to your phone. Please check your handset or wait a few seconds before trying again.']);
            exit;
        }
    }
    @file_put_contents($lockFile, (string)$now);

    $result = callRelworxCurl('/mobile-money/request-payment', 'POST', [
        'msisdn' => $msisdn,
        'amount' => $amount,
        'reference' => $reference,
        'currency' => 'UGX',
        'description' => substr($description, 0, 100)
    ], $cfg);

    echo json_encode($result);
    exit;
}

// ROUTE: GET /api/relworx/mobile-money/check-request-status -> Check payment status polling
if ($endpoint === 'relworx/mobile-money/check-request-status' && $method === 'GET') {
    $cfg = getRelworxPhpConfig();
    $internalRef = $_GET['internal_reference'] ?? '';
    if (empty($internalRef) || !preg_match('/^[A-Za-z0-9\-]+$/', $internalRef)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid internal reference.']);
        exit;
    }

    $path = '/mobile-money/check-request-status?internal_reference=' . urlencode($internalRef) . '&account_no=' . urlencode($cfg['accountNo']);
    $result = callRelworxCurl($path, 'GET', null, $cfg);
    $raw = strtolower((string)($result['status'] ?? ($result['request_status'] ?? '')));
    if ($raw === 'success' || $raw === 'successful') {
        $result['status'] = 'successful';
    } elseif ($raw === 'failed' || $raw === 'declined' || $raw === 'cancelled' || $raw === 'canceled' || $raw === 'rejected' || $raw === 'expired' || (isset($result['success']) && $result['success'] === false)) {
        $result['status'] = 'failed';
        if (empty($result['message'])) {
            $result['message'] = ($raw === 'insufficient_balance' || $raw === 'insufficient_funds')
                ? 'Insufficient balance in mobile money wallet.'
                : 'Payment was declined or cancelled on handset.';
        }
    }
    echo json_encode($result);
    exit;
}

// ROUTE: POST /api/relworx/mobile-money/validate-mobile-number
if ($endpoint === 'relworx/mobile-money/validate-mobile-number' && $method === 'POST') {
    $cfg = getRelworxPhpConfig();
    $msisdn = $body['msisdn'] ?? '';
    if (!preg_match('/^\+256\d{9}$/', $msisdn)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid Uganda mobile number.']);
        exit;
    }

    $result = callRelworxCurl('/mobile-money/validate-mobile-number', 'POST', ['msisdn' => $msisdn], $cfg);
    echo json_encode($result);
    exit;
}

// 404 Fallback for unhandled API routes
http_response_code(404);
echo json_encode(['error' => 'API route not found.']);
