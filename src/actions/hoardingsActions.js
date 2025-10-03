import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/hoardings`;
// const baseURL = 'http://localhost:5000/api';

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

// ✅ Get All Hoardings
export const getAllHoardings = async () => {
    try {
        const response = await instance.get('/getAllHoardings');
        return response.data; // backend returns { success, count, data: [...] }
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// ✅ Create Hoarding
export const createHoarding = async (hoardingData) => {
    try {
        const response = await axios.post('http://localhost:5000/api/hoardings/createHoarding', hoardingData);
        return response.data; // new hoarding object
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

export const updateHoarding = async (id, status) => {
    try {
        const response = await instance.post(`/updateHoarding/${id}`, {
            status
        })
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
}

// /**
//  * @desc    Create a new enquiry
//  * @param   {Object} payload - enquiry data
//  */
// export const createEnquiry = async (payload) => {
//     try {
//         const { data } = await instance.post('/enquiries', payload);
//         return data.data; // returns created enquiry object
//     } catch (error) {
//         throw error.response?.data?.message || error.message;
//     }
// };

// /**
//  * @desc    Get all enquiries (optionally filter by status/search)
//  * @param   {Object} filters - e.g. { status: 'pending', search: 'john' }
//  */
// export const getAllEnquiries = async (filters = {}) => {
//     try {
//         const params = new URLSearchParams(filters).toString();
//         // const url = params ? `/?${params}` : '/enquiries';

//         const { data } = await instance.get('/enquiries');
//         return data.data; // returns array of enquiries
//     } catch (error) {
//         throw error.response?.data?.message || error.message;
//     }
// };
// import axios from 'axios';

// const baseURL = `${process.env.REACT_APP_IP}/api/hoardings/enquiries`;

// const instance = axios.create({
//     baseURL,
//     withCredentials: true,
// });

// // Global 401 redirect
// instance.interceptors.response.use(
//     (res) => res,
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

export const createEnquiry = async (payload) => {
    const { data } = await instance.post('/enquiries', payload);
    return data.data;
};

export const getAllEnquiries = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await instance.get('/enquiries');
    return data.data;
};

export const updateEnquiry = async (id, payload) => {
    const { data } = await instance.put(`/enquiries/${id}`, payload);
    return data.data;
};

// users api's
export const getAllUsers = async () => {
    const { data } = await instance.get('/getAllUsers');
    return data.data;
};

export const createUserByAdmin = async (payload) => {
    const { data } = await instance.post('/createUserByAdmin', payload);
    return data;
};

export const updateUserRole = async (id, role) => {
    const { data } = await instance.put(`/user/${id}/role`, { role });
    return data;
};

