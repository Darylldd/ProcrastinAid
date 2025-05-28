const db = require('./db');

class Task {
  static async create(userId, title, description = '') {
    const [result] = await db.execute(
      'INSERT INTO tasks (user_id, title, description, completed) VALUES (?, ?, ?, ?)',
      [userId, title, description, false]
    );
    return result.insertId;
  }

  static async findByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, userId, fields) {
    // fields: { title?, description?, completed? }
    const keys = Object.keys(fields);
    const values = keys.map((k) => fields[k]);
    const setString = keys.map((k) => `${k} = ?`).join(', ');

    if (!setString) return false;

    values.push(id, userId);

    const [result] = await db.execute(
      `UPDATE tasks SET ${setString} WHERE id = ? AND user_id = ?`,
      values
    );

    return result.affectedRows === 1;
  }

   static async getAll(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }
  
  static async delete(id, userId) {
    const [result] = await db.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows === 1;
  }
}

module.exports = Task;
