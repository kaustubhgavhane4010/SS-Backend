// NO DATABASE - Just to get server starting
let db = null;

export const getDatabase = () => {
  throw new Error('Database not available - server starting without database');
};

export const initDatabase = async () => {
  console.log('🚀 NO DATABASE INITIALIZATION - Server starting without database');
  console.log('⚠️ This is a temporary fix to get the server running');
  console.log('✅ Server will start successfully now');
};
