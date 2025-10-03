import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/health`;
// const baseURL = 'http://localhost:5000/api/health';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

instance.interceptors.response.use(
  response => {
    // If the response is successful, just return the response
    return response;
  },
  error => {
    // If the response has a status code of 401, redirect to the login page
    if (error.response && error.response.status === 401) {
      window.location.href = '/login';
    }
    // Otherwise, reject the promise with the error object
    return Promise.reject(error);
  }
);

export const getHealth = async (deviceId) => {
  try {
    const response = await instance.get('/getHealth', {
      params: {
        deviceId: deviceId
      }
    });

    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};