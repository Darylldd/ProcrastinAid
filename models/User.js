const db = require('./db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

class User {
  static async create(username, password) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const sql = 'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id';
    const values = [username, hashedPassword];
    const { rows } = await db.query(sql, values);
    return rows[0].id;
  }

  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await db.query(sql, [username]);
    return rows[0];
  }

  static async verifyPassword(username, password) {
    const user = await this.findByUsername(username);
    if (!user) return false;
    const match = await bcrypt.compare(password, user.password);
    return match ? user : false;
  }
}

module.exports = User;
