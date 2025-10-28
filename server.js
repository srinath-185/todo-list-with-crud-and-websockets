const express = require("express");
const dotenv = require("dotenv");
const { initializeDB, router } = require("./api");
const { WebSocketServer } = require("ws");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

dotenv.config();

const app = express();
app.use(express.json());

// Load Swagger documentation
const swaggerDocument = YAML.load("./swagger.yaml");

// Initialize database once during server start
(async () => {
  try {
    await initializeDB();
    global.dbInitialized = true;
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
    process.exit(1);
  }
})();

// Use task routes
app.use("/api/task", router);

// Serve Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 3000;

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/api-docs`);
});

// WebSocket setup
const wss = new WebSocketServer({ server });

// Function to send messages to all connected WebSocket clients
function broadcast(message) {
  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
}

// When a new WebSocket client connects
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");

  ws.send(
    JSON.stringify({
      type: "connected",
      message: "WebSocket connection established",
    })
  );

  // When a WebSocket client disconnects
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});

// Make broadcast function available globally
global.broadcast = broadcast;
