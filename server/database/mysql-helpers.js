import { getDatabase } from './mysql-init.js';

// Helper functions to make MySQL queries easier to use
export const dbQuery = async (query, params = []) => {
  const pool = getDatabase();
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const dbGet = async (query, params = []) => {
  const pool = getDatabase();
  const [rows] = await pool.execute(query, params);
  return rows[0] || null;
};

export const dbRun = async (query, params = []) => {
  const pool = getDatabase();
  const [result] = await pool.execute(query, params);
  return result;
};

export const dbInsert = async (query, params = []) => {
  const pool = getDatabase();
  const [result] = await pool.execute(query, params);
  return result.insertId;
};

export const dbUpdate = async (query, params = []) => {
  const pool = getDatabase();
  const [result] = await pool.execute(query, params);
  return result.affectedRows;
};

export const dbDelete = async (query, params = []) => {
  const pool = getDatabase();
  const [result] = await pool.execute(query, params);
  return result.affectedRows;
};

// Transaction helper
export const dbTransaction = async (callback) => {
  const pool = getDatabase();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
