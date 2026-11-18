<?php
/**
 * Create License Key
 * Requires ADMIN_PASS environment variable.
 */

$admin_pass = getenv("ADMIN_PASS") ?: "";

if (empty($admin_pass) || !isset($_GET["pass"]) || !hash_equals($admin_pass, (string)$_GET["pass"])) {
    http_response_code(403);
    die("Access Denied");
}

$folder = strtolower(trim($_POST["folder"] ?? ""));
$days = (int)($_POST["days"] ?? 0);
$username = trim($_POST["username"] ?? "");

if (empty($folder) || $days <= 0 || empty($username)) {
    die("❌ Sab fields bhar do bhai!");
}

$key = "VX-" . strtoupper($folder) . "-" . $days . "D-" . strtoupper(substr(str_shuffle("ABCDEFGHJKLMNPQRSTUVWXYZ23456789"), 0, 8));

$data = [
    "folder" => $folder,
    "expiry" => date("Y-m-d H:i:s", strtotime("+$days days")),
    "user" => $username,
    "redeemed" => false,
    "redeemed_by" => null,
    "redeemed_time" => null
];

$file = "licenses.json";
$current = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
if (!is_array($current)) $current = [];
$current[$key] = $data;

file_put_contents($file, json_encode($current, JSON_PRETTY_PRINT));

echo "<h1 style='color:lime;text-align:center;margin-top:80px'>✅ KEY GENERATED SUCCESSFULLY!</h1>";
echo "<h2 style='text-align:center;color:cyan;font-size:28px'>" . htmlspecialchars($key) . "</h2>";
echo "<p style='text-align:center'><a href='admin.php?pass=" . htmlspecialchars(urlencode($_GET["pass"])) . "' style='color:orange;font-size:22px'>← Back to Admin Panel</a></p>";
?>
