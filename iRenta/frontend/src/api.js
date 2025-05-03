import axios from 'axios';

export const fetchData = async () => {
  const response = await axios.get('https://irenta-production.up.railway.app/');
  return response.data;
};
