import axios from 'axios';
import CryptoJS from "crypto-js";

const baseURL = `${process.env.REACT_APP_IP}/api/users`;
// const baseURL = 'http://localhost:5000/api/users';

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

export const login = async (email, password) => {
  try {
    // Encrypt the password using AES
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(password), CryptoJS.enc.Utf8.parse(process.env.REACT_APP_SECRET_KEY), {
      iv: CryptoJS.enc.Utf8.parse(process.env.REACT_APP_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString();
    const response = await instance.post('/login', {
      email: email,
      password: password,
    });
    localStorage.setItem('userRole', JSON.stringify(response.data.role)); // Save user role(s)
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    console.error('Login Error:', error);
    return { success: false, message: error.response.data.message };
  }
};

export const logout = async () => {
  try {
    const response = await instance.get('/logout', {

    });

    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const createEmsUser = async (name, email, mobile, password, role, parentId) => {
  console.log('Creating EMS user with:', { name, email, mobile, password });
  try {
    const response = await instance.post('/createEmsUser', {
      name,
      email,
      mobile,
      password,
      role,
      parentId
    });
    return response.data;
  } catch (error) {
    console.log('Error response:', error.response);
    return { success: false, message: error.response.data.message };
  }
}

export const getUsersByRole = async (role) => {
  try {
    const response = await instance.get('/getUsersByRole', { params: { role } });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch users by role' };
  }
};

export const getChildrenByUserId = async (userId) => {
  try {
    const response = await instance.get('/getChildrenByUserId', { params: { userId } });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch children' };
  }
};

export const getMyChildren = async () => {
  try {
    const response = await instance.get('/getMyChildren');
    return response;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch my children' };
  }
};

export const getMe = async () => {
  try {
    const response = await instance.get('/me');
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch current user' };
  }
};


export const getSalesUsers = async () => {
  try {
    const response = await instance.get('/getSalesUsers');
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};