import mysql from'mysql';
const {HOST, USER, PASSWORD, DATABASE} = process.env

export const connection = mysql.createConnection({
  host     : "127.0.0.1",
  user     : "root",
  password : "password",
  database : "king-james"
});
 
connection.connect();