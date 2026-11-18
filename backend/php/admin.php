<?php
/**
 * VOIDXHUB Admin Panel
 *
 * SECURITY: Password must be set via environment variable ADMIN_PASS
 * or a secure config file that is NOT committed to git.
 *
 * Example (local / server):
 *   putenv("ADMIN_PASS=your-strong-password-here");
 * or in .htaccess / server env.
 */

$admin_pass = getenv("ADMIN_PASS") ?: "";

if (empty($admin_pass) || !isset($_GET["pass"]) || !hash_equals($admin_pass, (string)$_GET["pass"])) {
    http_response_code(403);
    die("<h1 style='color:red;text-align:center;margin-top:100px'>❌ Access Denied</h1>");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VOIDXHUB ADMIN PANEL</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #05050a; color: #e0e0ff; font-family: system-ui, sans-serif; }
    .card { background: rgba(20,20,40,0.95); border: 2px solid #67e8f9; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-5xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
      VOIDXHUB ADMIN PANEL
    </h1>
    <p class="text-center text-red-400 mb-10">Secure admin area · Password from environment</p>

    <div class="card p-10 rounded-3xl mb-10">
      <h2 class="text-3xl font-bold mb-6 text-cyan-300">Create New License Key</h2>
      <form action="create_key.php?pass=<?= htmlspecialchars(urlencode($_GET['pass'])) ?>" method="POST" class="space-y-5">
        <input type="text" name="folder" placeholder="Folder Name (hologram, magic, zombie...)" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <input type="number" name="days" placeholder="Days (30, 90, 365)" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <input type="text" name="username" placeholder="@username" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <button type="submit" class="w-full py-6 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl font-bold text-xl">GENERATE KEY 🔥</button>
      </form>
    </div>

    <div class="card p-10 rounded-3xl">
      <h2 class="text-3xl font-bold mb-6 text-emerald-300">Upload File</h2>
      <form action="upload.php?pass=<?= htmlspecialchars(urlencode($_GET['pass'])) ?>" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" class="w-full p-5 bg-black rounded-2xl border border-emerald-500" required>
        <button type="submit" class="w-full mt-6 py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl font-bold text-xl">UPLOAD FILE</button>
      </form>
    </div>
  </div>
</body>
</html>
