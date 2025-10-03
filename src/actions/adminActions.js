import axios from 'axios';
import { MdQrCode } from 'react-icons/md';

const baseURL = `${process.env.REACT_APP_IP}/api/admin`;
// const baseURL = 'http://localhost:5000/api/admin';

const instance = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

// instance.interceptors.response.use(
//   response => {
//     // If the response is successful, just return the response
//     return response;
//   },x
//   error => {
//     // If the response has a status code of 401, redirect to the login page
//     if (error.response && error.response.status === 401) {
//       window.location.href = '/'; // Replace with your login route
//     }
//     // Otherwise, reject the promise with the error object
//     return Promise.reject(error);
//   }
// );

export const getAllUsers = async (page, search, limit) => {
  try {
    const params = { page, search, limit };
    const response = await instance.get('/getAllUsers', {
      params: params,
    });
    // console.log("response", response);
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const getAllEmsUsers = async (page, search, limit) => {
  try {
    const params = { page, search };
    console.log('params', params);
    const response = await instance.get('/getAllEmsUsers', {
      params: params,
    });
    // console.log("response", response);
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const updateEmsUser = async (role, id) => {
  try {
    const response = await instance.put('/updateEmsUser', {
      role,
      id
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error?.response?.data?.message || 'Something went wrong'
    };
  }
};

export const deleteEmsUser = async (userId) => {
  try {
    const response = await instance.delete(`/deleteEmsUser/${userId}`);
    return response.data;
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Error deleting user' };
  }
};



export const getDashboardData = async () => {
  try {
    const response = await instance.get('/getDashboardData');
    return response;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const createUser = async (name, email, mobile, password) => {
  try {
    const response = await instance.post('/createEmsUser', {
      name: name,
      email: email,
      mobile: mobile,
      password: password,
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const createRequirement = async (employeeName, employeeEmail, comments) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_IP}/api/reqs/createGenerateReq`, {
      employeeName: employeeName,
      employeeEmail: employeeEmail,
      comments: comments,
    })
    return response.data;
  } catch (error) {
    return { success: false, message: error.response.data.message };
  }
}

export const deleteUser = async (id) => {
  try {
    const response = await instance.post(`/deleteUser/${id}`);
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const getUserCameras = async (page, deviceId, limit) => {
  try {
    const params = { page, deviceId, limit };
    const response = await instance.get(`/getCameras`, {
      params: params,
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const addCameraToUser = async (name, email, deviceId) => {
  try {
    const response = await instance.post(`/addCameraToUser`, {
      name: name,
      email: email,
      deviceId: deviceId,
      username: 'admin',
      password: ''
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export async function bulkAddCameraToUser(formData) {
  // const token = localStorage.getItem('token');
  // console.log('formData2',formData);
  try {
    const response = await instance.post('/bulkAddCameraToUser',
      formData,
    );
    return response;
  } catch (error) {
    throw error;
  }
}

export const updateUserCamera = async (name, deviceId, email, isp2p, productType, plan, remotePortRtsp) => {
  try {
    const response = await instance.post(`/updateUserCamera`, {
      name: name,
      deviceId: deviceId,
      email: email,
      isp2p: isp2p,
      productType: productType,
      plan: plan,
      remotePortRtsp: remotePortRtsp,
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const handleDeleteCameraFromUser = async (deviceId) => {
  try {
    const response = await instance.post(`/deleteCameraFromUser`, {
      deviceId: deviceId,
    });
    return response.data;
  } catch (error) {
    // Handle errors, and include an error message in the response
    return { success: false, message: error.response.data.message };
  }
};

export const handleGetChatgptPrompt = async (page) => {
  try {
    const params = {
      page: page
    }
    const response = await axios.get(`${process.env.REACT_APP_IP}/api/admin/getAllChatgptPrompts`, {
      params: params
    });
    return response.data;
  } catch (error) {
    return { success: false, message: error.response.data.message };
  }
}

export const handleUpdateChatgptReaction = async (id, reaction) => {
  try {
    // Sending `id` and `reaction` as query parameters
    const response = await instance.put(`${process.env.REACT_APP_IP}/api/admin/updateReactionInGpt`, null, {
      params: { id, reaction }, // Query parameters
    });
    console.log('rekha2', response.data);
    return response.data;
  } catch (error) {
    // Handle errors and return a proper error message
    return {
      success: false,
      message: error.response?.data?.message || 'An error occurred',
    };
  }
};
