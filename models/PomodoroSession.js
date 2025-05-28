const db = require('./db'); // should be a pg.Pool instance or similar

class PomodoroSession {
  static async create(userId, taskId, duration, startTime, endTime = null, status = 'active') {
    const sql = `
      INSERT INTO pomodoro_sessions
      (user_id, task_id, duration, start_time, end_time, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [userId, taskId, duration, startTime, endTime, status];
    const { rows } = await db.query(sql, values);
    return rows[0].id;
  }

  static async updateStatus(id, userId, status, endTime = null) {
    let sql = `UPDATE pomodoro_sessions SET status = $1`;
    const params = [status];
    if (endTime) {
      sql += `, end_time = $2 WHERE id = $3 AND user_id = $4`;
      params.push(endTime, id, userId);
    } else {
      sql += ` WHERE id = $2 AND user_id = $3`;
      params.push(id, userId);
    }

    const result = await db.query(sql, params);
    return result.rowCount === 1;
  }

  static async findByUser(userId, limit = 10) {
    const sql = `
      SELECT ps.*, t.title AS task_title
      FROM pomodoro_sessions ps
      LEFT JOIN tasks t ON ps.task_id = t.id
      WHERE ps.user_id = $1
      ORDER BY ps.start_time DESC
      LIMIT $2
    `;
    const values = [userId, limit];
    const { rows } = await db.query(sql, values);
    return rows;
  }

  static async findAllByUser(userId) {
    const sql = `
      SELECT * FROM pomodoro_sessions
      WHERE user_id = $1
      ORDER BY start_time ASC
    `;
    const { rows } = await db.query(sql, [userId]);
    return rows;
  }

  static async getByUser(userId) {
    const sql = `
      SELECT ps.*, t.title AS task_title
      FROM pomodoro_sessions ps
      LEFT JOIN tasks t ON ps.task_id = t.id
      WHERE ps.user_id = $1
      ORDER BY ps.start_time DESC
    `;
    const { rows } = await db.query(sql, [userId]);
    return rows;
  }

  static async getInsightsByUser(userId) {
    // PostgreSQL equivalents:
    // EXTRACT(HOUR FROM timestamp) for hour
    // TO_CHAR(timestamp, 'Day') for day name (but note it returns padded string)
    // Use TRIM to clean day name

    const sql = `
      SELECT
        task_id,
        EXTRACT(HOUR FROM start_time) AS hour,
        TRIM(TO_CHAR(start_time, 'Day')) AS day,
        SUM(duration) AS total_minutes
      FROM pomodoro_sessions
      WHERE user_id = $1
      GROUP BY task_id, hour, day
    `;
    const { rows } = await db.query(sql, [userId]);
    return rows;
  }

  static async findActiveByUserAndTask(userId, taskId) {
    const sql = `
      SELECT * FROM pomodoro_sessions
      WHERE user_id = $1 AND task_id = $2 AND status = 'active'
      LIMIT 1
    `;
    const { rows } = await db.query(sql, [userId, taskId]);
    return rows[0];
  }
}

module.exports = PomodoroSession;
