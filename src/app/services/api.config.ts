export const API_BASE_URL = (() => {
  const isAngularDevServer =
    typeof window !== 'undefined' && window.location.port === '4200';

  return isAngularDevServer
    ? 'http://127.0.0.1:8000/api'
    : 'https://book-house-backend-1.onrender.com/api';
})();