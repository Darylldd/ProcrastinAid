const db = require('./db'); // assumed to be a pg.Pool or pg.Client instance

class Task {
  static async create(userId, title, description = '') {
    const sql = `
      INSERT INTO tasks (user_id, title, description, completed)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [userId, title, description, false];
    const { rows } = await db.query(sql, values);
    return rows[0].id;
  }

  static async findByUser(userId) {
    const sql = `
      SELECT * FROM tasks WHERE user_id = $1 ORDER BY id DESC
    `;
    const { rows } = await db.query(sql, [userId]);
    return rows;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM tasks WHERE id = $1';
    const { rows } = await db.query(sql, [id]);
    return rows[0];
  }

  static async update(id, userId, fields) {
    // fields: { title?, description?, completed? }
    const keys = Object.keys(fields);
    if (keys.length === 0) return false;

    // Build SET clause dynamically with parameter indexes
    // PostgreSQL requires numbered placeholders $1, $2, ...
    // We'll map fields to $1... then append id and userId at the end

    const setClauses = keys.map((key, idx) => `${key} = $${idx + 1}`);
    const values = keys.map(key => fields[key]);

    // Add id and userId as last parameters
    const idParamIndex = keys.length + 1;
    const userIdParamIndex = keys.length + 2;

    const sql = `
      UPDATE tasks SET ${setClauses.join(', ')}
      WHERE id = $${idParamIndex} AND user_id = $${userIdParamIndex}
    `;

    values.push(id, userId);

    const result = await db.query(sql, values);
    return result.rowCount === 1;
  }

  static async getAll(userId) {
    const sql = `
      SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC
    `;
    const { rows } = await db.query(sql, [userId]);
    return rows;
  }

  static async delete(id, userId) {
    const sql = `
      DELETE FROM tasks WHERE id = $1 AND user_id = $2
    `;
    const result = await db.query(sql, [id, userId]);
    return result.rowCount === 1;
  }
}

module.exports = Task;
