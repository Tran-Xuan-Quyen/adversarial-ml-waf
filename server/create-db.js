const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8',
  port: process.env.DB_PORT,
  connectionLimit: 10,
});

connection.connect((err) => {
  if (err) {
    console.error('Connect DB failed ' + err.stack);
    return;
  }
  console.log('Connect db successfully ID connection:' + connection.threadId);
});

connection.query(
  `DROP DATABASE IF EXISTS authentication`,
  (err, results, fields) => {
    if (err) {
      console.error('Execute query failed ' + err.stack);
      return;
    }
  },
);
connection.query(`CREATE DATABASE authentication`, (err, results, fields) => {
  if (err) {
    console.error('Execute query failed ' + err.stack);
    return;
  }

  // Hiển thị kết quả
  console.log('Create new authentication');
});

// Đóng kết nối
connection.end((err) => {
  if (err) {
    console.error('Error when closing connection ' + err.stack);
    return;
  }
  console.log('Connection closed!');
});
