const express = require("express");
const mysql = require("mysql2/promise"); // Use promise version
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// 📌 Database Configuration
// ===============================
const dbConfig = {
  host: process.env.DB_HOST || "database",
  user: process.env.MYSQL_USER || "todo_user",
  password: process.env.MYSQL_PASSWORD || "todo_password",
  database: process.env.MYSQL_DATABASE || "todo_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // This fixes MySQL 8.0 authentication issue
  authPlugins: {
    mysql_clear_password: () => () => Buffer.from(process.env.MYSQL_PASSWORD + '\0')
  }
};

let pool;

// Retry connection until MySQL is ready
async function connectWithRetry() {
  let retries = 10;
  
  while (retries) {
    try {
      // Create connection pool
      pool = mysql.createPool(dbConfig);
      
      // Test the connection
      const connection = await pool.getConnection();
      console.log("✅ Connected to MySQL successfully");
      
      // Test if tasks table exists, create if not
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Tasks table ready");
      
      connection.release();
      return pool;
    } catch (err) {
      console.log(`⏳ MySQL not ready, retrying in 5 seconds... (${retries} attempts left)`);
      console.log('Error details:', err.message);
      retries -= 1;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  console.error("❌ Failed to connect to MySQL after multiple retries");
  process.exit(1);
}

// Initialize connection
connectWithRetry();

// ===============================
// 📌 Health Check (important for Docker)
// ===============================
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ===============================
// 📌 CRUD Routes
// ===============================

// ✅ CREATE
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)",
      [title, description || null, status || "todo"]
    );
    
    res.status(201).json({ message: "Task created", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ READ ALL
app.get("/tasks", async (req, res) => {
  try {
    const [results] = await pool.execute("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ READ ONE
app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await pool.execute("SELECT * FROM tasks WHERE id = ?", [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE
app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const [result] = await pool.execute(
      "UPDATE tasks SET title=?, description=?, status=? WHERE id=?",
      [title, description, status, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ DELETE
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM tasks WHERE id=?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
