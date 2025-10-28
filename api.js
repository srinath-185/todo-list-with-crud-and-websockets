// api.js
const express = require("express");
const dotenv = require("dotenv");
const Database = require("./database");
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create database pool
const db = new Database(dbConfig);

// Create table if it doesn’t exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS task_mst (
    task_id INT AUTO_INCREMENT PRIMARY KEY,
    task_name VARCHAR(255),
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    is_deleted TINYINT DEFAULT 0,
    created_on DATETIME DEFAULT NOW(),
    updated_on DATETIME DEFAULT NULL
  );
`;

const initializeDB = async () => {
  try {
    await db.query(createTableQuery);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    process.exit(1);
  }
};

// -------------------- CRUD FUNCTIONS --------------------

// Create a new task
const createTask = async (req, res) => {
  const { task_name, task_title, task_description } = req.body;

  if (!task_title || task_title.trim() === "") {
    return res.status(400).json({
      code: 400,
      status: false,
      data: "Task title cannot be empty.",
    });
  }

  db.pool.getConnection(async (err, conn) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ code: 500, status: false, data: "Database connection error" });
    }

    const promiseConn = conn.promise();

    try {
      const insertQuery = `
        INSERT INTO task_mst (task_name, task_title, task_description)
        VALUES (?, ?, ?)
      `;
      await promiseConn.query(insertQuery, [task_name, task_title, task_description]);

      if (global.broadcast) {
        global.broadcast({ type: "create", message: "New task created", data: { task_title } });
      }

      res.status(200).json({ code: 200, status: true, data: "Task created successfully." });
    } catch (error) {
      console.error("Error while creating task:", error);
      res.status(500).json({ code: 500, status: false, data: error.message });
    } finally {
      conn.release();
    }
  });
};

// Update a task
const editTask = async (req, res) => {
  const { task_id, task_name, task_title, task_description } = req.body;

  if (!task_title || task_title.trim() === "") {
    return res.status(400).json({
      code: 400,
      status: false,
      data: "Task title cannot be empty.",
    });
  }

  db.pool.getConnection(async (err, conn) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ code: 500, status: false, data: "Database connection error" });
    }

    const promiseConn = conn.promise();

    try {
      const updateQuery = `
        UPDATE task_mst 
        SET task_name = ?, task_title = ?, task_description = ?, updated_on = NOW()
        WHERE task_id = ? AND is_deleted = 0
      `;
      const [result] = await promiseConn.query(updateQuery, [task_name, task_title, task_description, task_id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ code: 404, status: false, data: "Task not found." });
      }

      if (global.broadcast) {
        global.broadcast({ type: "update", message: "Task updated", data: { task_id } });
      }

      res.status(200).json({ code: 200, status: true, data: "Task updated successfully." });
    } catch (error) {
      console.error("Error while updating task:", error);
      res.status(500).json({ code: 500, status: false, data: error.message });
    } finally {
      conn.release();
    }
  });
};

// View all active tasks, sorted by latest update
const viewTasks = async (req, res) => {
  db.pool.getConnection(async (err, conn) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ code: 500, status: false, data: "Database connection error" });
    }

    const promiseConn = conn.promise();

    try {
      const selectQuery = `
        SELECT * FROM task_mst 
        WHERE is_deleted = 0
        ORDER BY updated_on DESC, created_on DESC
      `;
      const [rows] = await promiseConn.query(selectQuery);
      res.status(200).json({ code: 200, status: true, data: rows });
    } catch (error) {
      console.error("Error while viewing tasks:", error);
      res.status(500).json({ code: 500, status: false, data: error.message });
    } finally {
      conn.release();
    }
  });
};

// Delete a task (soft delete)
const deleteTask = async (req, res) => {
  const { task_id } = req.body;

  db.pool.getConnection(async (err, conn) => {
    if (err) {
      console.error("Database connection error:", err);
      return res.status(500).json({ code: 500, status: false, data: "Database connection error" });
    }

    const promiseConn = conn.promise();

    try {
      const deleteQuery = `
        UPDATE task_mst 
        SET is_deleted = 1, updated_on = NOW()
        WHERE task_id = ?
      `;
      const [result] = await promiseConn.query(deleteQuery, [task_id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ code: 404, status: false, data: "Task not found." });
      }

      if (global.broadcast) {
        global.broadcast({ type: "delete", message: "Task deleted", data: { task_id } });
      }

      res.status(200).json({ code: 200, status: true, data: "Task deleted successfully." });
    } catch (error) {
      console.error("Error while deleting task:", error);
      res.status(500).json({ code: 500, status: false, data: error.message });
    } finally {
      conn.release();
    }
  });
};

// -------------------- ROUTES --------------------
const router = express.Router();

router.post("/createTask", createTask);
router.put("/editTask", editTask);
router.get("/viewTasks", viewTasks);
router.delete("/deleteTask", deleteTask);

module.exports = { initializeDB, router };
