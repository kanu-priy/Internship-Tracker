/**
 * Centralized API Configuration for DeadlineDesk
 * 
 * In development: defaults to http://localhost:5000
 * In production (unified deployment): defaults to "" (same-origin / relative paths)
 * In separated deployment: reads process.env.REACT_APP_API_URL
 */
export const API_BASE = 
  process.env.REACT_APP_API_URL !== undefined 
    ? process.env.REACT_APP_API_URL 
    : (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

export default API_BASE;
