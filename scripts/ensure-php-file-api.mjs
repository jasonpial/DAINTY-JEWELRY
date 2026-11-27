import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'public/api/index.php';
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  text = text.replace("header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS, PUT');", "header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');");
  text = text.replace("$deletedIdsFile = __DIR__ . '/deleted_ids.json';", "$deletedIdsFile = __DIR__ . '/deleted_ids.json';\n$profilesFile = __DIR__ . '/profiles.json';");
  text = text.replace('$pdo = getPdoConnection($dbConfigFile);', '// File Manager JSON files are the single source of truth for this website.\n$pdo = null;');
  const route = `// ROUTE: Account Profiles stored in Hostinger File Manager\nif (preg_match('#^profiles/([^/]+)$#', $endpoint, $matches)) {\n    $profileId = urldecode($matches[1]);\n    $profiles = [];\n    if (file_exists($profilesFile)) { $stored = json_decode(file_get_contents($profilesFile), true); if (is_array($stored)) $profiles = $stored; }\n    if ($method === 'GET') { echo json_encode($profiles[$profileId] ?? null); exit; }\n    if ($method === 'PUT' || $method === 'PATCH') {\n        if (!is_array($body)) { http_response_code(400); echo json_encode(['error' => 'Profile data is required.']); exit; }\n        $profiles[$profileId] = array_merge($profiles[$profileId] ?? [], $body, ['id' => $profileId, 'updated_at' => gmdate('c')]);\n        if (file_put_contents($profilesFile, json_encode($profiles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) { http_response_code(500); echo json_encode(['error' => 'Could not write the profile file.']); exit; }\n        echo json_encode($profiles[$profileId]); exit;\n    }\n    if ($method === 'DELETE') { unset($profiles[$profileId]); file_put_contents($profilesFile, json_encode($profiles, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX); echo json_encode(['success' => true, 'id' => $profileId]); exit; }\n}\n\n`;
  if (!text.includes("ROUTE: Account Profiles stored in Hostinger File Manager")) text = text.replace('// -----------------------------------------------------------------------------\n// ROUTE: Database Status / Connection Test', '// -----------------------------------------------------------------------------\n' + route + '// ROUTE: Database Status / Connection Test');
  writeFileSync(path, text, 'utf8');
}
