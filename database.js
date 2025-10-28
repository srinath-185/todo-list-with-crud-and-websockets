const mysql = require('mysql2');

class Database {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    console.log('Error getting connection from pool:', err);
                    return reject(err);
                }
                connection.query(sql, args, (err, rows) => {
                    connection.release(); // Always release the connection back to the pool
                    if (err) {
                        console.log('Query error:', err);
                        return reject(err);
                    }
                    resolve(rows);
                });
            });
        });
    }
}

module.exports = Database;
