const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Use a pool so that multiple requests can share the same database connection instead of opening a new one each time.
const pool = mysql.createPool(dbConfig);    

// With .promise, we can use async/await with the database queries.
module.exports = pool.promise();