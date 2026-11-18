<?php
/**
 * File Upload
 * Requires ADMIN_PASS environment variable.
 */

$admin_pass = getenv("ADMIN_PASS") ?: "";

if (empty($admin_pass) || !isset($_GET["pass"]) || !hash_equals($admin_pass, (string)$_GET["pass"])) {
    http_response_code(403);
    die("Access Denied");
}

if (isset($_FILES["file"]) && $_FILES["file"]["error"] == 0) {
    $target_file = basename($_FILES["file"]["name"]);

    // Basic safety: only allow certain extensions
    $allowed = ["zip", "jpg", "jpeg", "png", "gif", "webp"];
    $ext = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        die("<h1 style='color:red;text-align:center'>❌ File type not allowed</h1>");
    }

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo "<h1 style='color:lime;text-align:center;margin-top:100px'>✅ File Uploaded Successfully!</h1>";
        echo "<p style='text-align:center'>File: <b>" . htmlspecialchars($target_file) . "</b></p>";
    } else {
        echo "<h1 style='color:red;text-align:center'>❌ Upload Failed</h1>";
    }
} else {
    echo "<h1 style='color:red;text-align:center'>❌ No file selected</h1>";
}

echo "<p style='text-align:center;margin-top:40px'><a href='admin.php?pass=" . htmlspecialchars(urlencode($_GET["pass"])) . "' style='color:cyan;font-size:22px'>← Back to Admin Panel</a></p>";
?>
