// swagger.js
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

// Load the swagger.yaml file
const swaggerDocument = YAML.load("./swagger.yaml");

// Middleware for serving Swagger UI
const swaggerDocs = swaggerUi.setup(swaggerDocument);

module.exports = {
  swaggerUi,
  swaggerDocs,
};
