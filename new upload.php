<?php
$admin_pass = "9873987036yash";

if (!isset($_GET['pass']) || $_GET['pass'] !== $admin_pass) {
    die("Access Denied");
}

if (isset($_FILES['file']) && $_FILES['file']['error'] == 0) {
    $target_file = basename($_FILES["file"]["name"]);
    
    if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
        echo "<h1 style='color:lime;text-align:center;margin-top:100px'>✅ File Uploaded Successfully!</h1>";
        echo "<p style='text-align:center'>File: <b>" . htmlspecialchars($target_file) . "</b></p>";
    } else {
        echo "<h1 style='color:red;text-align:center'>❌ Upload Failed</h1>";
    }
} else {
    echo "<h1 style='color:red;text-align:center'>❌ No file selected</h1>";
}

echo "<p style='text-align:center;margin-top:40px'><a href='admin.php?pass=9873987036yash' style='color:cyan;font-size:22px'>← Back to Admin Panel</a></p>";
?>