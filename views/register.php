<?php
// register.php

// Start session if you want to store messages
session_start();

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Collect and sanitize form data
    $name     = htmlspecialchars(trim($_POST["name"]));
    $email    = htmlspecialchars(trim($_POST["email"]));
    $username = htmlspecialchars(trim($_POST["username"]));
    $password = $_POST["password"];
    $confirm  = $_POST["confirm"];

    // Simple validation
    if (empty($name) || empty($email) || empty($username) || empty($password) || empty($confirm)) {
        die("⚠️ All fields are required.");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("⚠️ Invalid email format.");
    }

    if ($password !== $confirm) {
        die("⚠️ Passwords do not match.");
    }

    // Hash password before saving (important for security)
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // ---- Database connection ----
    // Adjust these settings to your database
    $servername = "localhost";
    $db_username = "root";
    $db_password = "";
    $dbname = "test_db";

    // Create connection
    $conn = new mysqli($servername, $db_username, $db_password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("❌ Connection failed: " . $conn->connect_error);
    }

    // Insert data into database
    $sql = "INSERT INTO users (name, email, username, password) 
            VALUES ('$name', '$email', '$username', '$hashedPassword')";

    if ($conn->query($sql) === TRUE) {
        echo "✅ Registration successful!";
    } else {
        echo "❌ Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}
?>
