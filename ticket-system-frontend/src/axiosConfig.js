import axios from 'axios';

axios.defaults.baseURL = 'http://127.0.0.1:8080';
axios.defaults.withCredentials = true;

const setupAxios = async () => {
  try {
    const response = await axios.get('/api/get-csrf/');
    console.log('CSRF token received:', response.data.csrfToken);
    axios.defaults.headers.common['X-CSRFToken'] = response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error.response?.data || error.message);
  }
};

setupAxios();

export default axios;