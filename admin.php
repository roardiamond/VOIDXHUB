<?php
$admin_pass = "9873987036yash";

if (!isset($_GET['pass']) || $_GET['pass'] !== $admin_pass) {
    die("<h1 style='color:red;text-align:center;margin-top:100px'>❌ Wrong Password! Access Denied.</h1>");
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
    body { background: #05050a; color: #e0e0ff; font-family: 'Orbitron', sans-serif; }
    .card { background: rgba(20,20,40,0.95); border: 2px solid #67e8f9; }
  </style>
</head>
<body class="p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-6xl font-black text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">
      VOIDXHUB ADMIN PANEL
    </h1>
    <p class="text-center text-red-400 mb-10">One Time Redeem System</p>

    <div class="card p-10 rounded-3xl mb-10">
      <h2 class="text-3xl font-bold mb-6 text-cyan-300">Create New License Key</h2>
      <form action="create_key.php?pass=9873987036yash" method="POST" class="space-y-5">
        <input type="text" name="folder" placeholder="Folder Name (hologram, magic, zombie...)" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <input type="number" name="days" placeholder="Days (30, 90, 365)" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <input type="text" name="username" placeholder="@username" class="w-full p-5 bg-black rounded-2xl border border-cyan-500" required>
        <button type="submit" class="w-full py-6 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl font-bold text-xl">GENERATE KEY 🔥</button>
      </form>
    </div>

    <div class="card p-10 rounded-3xl">
      <h2 class="text-3xl font-bold mb-6 text-emerald-300">Upload Hack File</h2>
      <form action="upload.php?pass=9873987036yash" method="POST" enctype="multipart/form-data">
        <input type="file" name="file" class="w-full p-5 bg-black rounded-2xl border border-emerald-500" required>
        <button type="submit" class="w-full mt-6 py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-3xl font-bold text-xl">UPLOAD FILE</button>
      </form>
    </div>
  </div>
</body>
</html>