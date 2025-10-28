# Todo List (Backend)

This is a simple backend project for managing tasks using CRUD operations.

Users can create, view, update, and delete tasks. The app also supports real-time updates through WebSockets so all connected clients get instant notifications when any task changes.

The API is documented using Swagger for easy testing and integration.

## Getting started

1. Create a `.env` file in the project root with your database details:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todo_db
PORT=3000
```
2. Install dependencies:
```
npm install
```

3. Import the database (tables and sample data if provided):
```
mysql -u root -p < todo_db.sql
```

4. Start the server:
```
node server
```

Once it’s running, open the API docs in your browser:  
```
http://localhost:3000/api-docs
```
You can also connect to the WebSocket at:  
```
ws://localhost:3000
```

## Notes
I’ve run this project locally to verify the CRUD flow and WebSocket functionality.  
The database schema for the `task_mst` table is included in `todo_db.sql`.  
If you import that file into MySQL, you’ll have all the necessary structures ready.

## API Endpoints

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/task/createTask` | Create a new task |
| PUT | `/api/task/editTask` | Update an existing task |
| GET | `/api/task/viewTasks` | View all active tasks |
| DELETE | `/api/task/deleteTask` | Soft delete a task |

For full request and response schemas, see the Swagger docs at:  
http://localhost:3000/api-docs

## Tech Stack

| Component | Technology |
|------------|-------------|
| Backend | Node.js, Express |
| Database | MySQL |
| Real-time | WebSocket (ws) |
| Documentation | Swagger (OpenAPI) |
| Config | dotenv |

## Author
**Srinath S**  
Software Developer  
📧 srinathsri185@gmail.com  
🌐 https://github.com/srinath-185

## License
This project is licensed under the MIT License.
