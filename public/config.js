window.API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000' 
  : `http://${window.location.hostname}:3000`;
