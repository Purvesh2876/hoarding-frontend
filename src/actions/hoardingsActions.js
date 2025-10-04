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
export const getAllHoardings = async (page, search, itemsPerPage) => {
    try {
        const params = {
            page: page,
            search: search,
            itemsPerPage: itemsPerPage
        }
        const response = await instance.get('/getAllHoardings', { params });
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

export const getAllEnquiries = async (page, search, itemsPerPage) => {
    try {
        const params = {
            page: page,
            search: search,
            itemsPerPage: itemsPerPage
        }
        const { data } = await instance.get('/enquiries', { params });
        return data;
    } catch (error) {
        console.error('Error fetching enquiries:', error);
        throw error.response?.data?.message || error.message;
    }
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

export const getUserForOrder = async () => {
    try {
        const { data } = await instance.get('/getUserForOrder');
        return data.data;
    } catch (error) {
        console.error(error);
        throw error.response?.data?.message || error.message;
    }
}

export const createUserByAdmin = async (payload) => {
    const { data } = await instance.post('/createUserByAdmin', payload);
    return data;
};

export const updateUserRole = async (id, role) => {
    const { data } = await instance.put(`/user/${id}/role`, { role });
    return data;
};

// customer api's
// ===============================
// 🧠 CUSTOMER ACTIONS
// ===============================

// ✅ Create new customer
export const createCustomer = async (payload) => {
    try {
        const { data } = await instance.post('/customer', payload);
        return data;
    } catch (error) {
        console.error(error);
        const msg = error.response?.data?.message || 'Failed to create customer';
        throw msg;
    }
};

// ✅ Get all customers (with optional filters: search, city, segment)
export const getAllCustomers = async (filters = {}) => {
    try {
        const params = new URLSearchParams(filters).toString();
        const { data } = await instance.get(`/customer${params ? `?${params}` : ''}`);
        return data.data; // returning only array for ease
    } catch (error) {
        console.error('Error fetching customers:', error);
        const msg = error.response?.data?.message || 'Failed to fetch customers';
        throw msg;
    }
};

// ✅ Get single customer by ID
export const getCustomerById = async (id) => {
    try {
        const { data } = await instance.get(`/customer/${id}`);
        return data.data;
    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to fetch customer details';
        throw msg;
    }
};

// ✅ Update customer
export const updateCustomer = async (id, updates) => {
    try {
        const { data } = await instance.put(`/customer/${id}`, updates);
        return data.data;
    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to update customer';
        throw msg;
    }
};

// ✅ Deactivate / delete customer
export const deactivateCustomer = async (id) => {
    try {
        const { data } = await instance.delete(`/customer/${id}`);
        return data;
    } catch (error) {
        const msg = error.response?.data?.message || 'Failed to deactivate customer';
        throw msg;
    }
};


// ORDER API's

// 🧾 CREATE ORDER
export const createOrder = async (orderData) => {
    try {
        const { data } = await instance.post('/orders', orderData);
        return data;
    } catch (error) {
        console.error('error submitting order', error);
        throw error.response?.data?.message || error.message;
    }
};

// 📋 GET ALL ORDERS
export const getAllOrders = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const { data } = await instance.get(`/orders${queryString ? `?${queryString}` : ''}`);
        console.log('data', data)
        return data.data; // assuming controller returns {success, count, data: [...]}
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// 🔍 GET SINGLE ORDER BY ID
export const getOrderById = async (id) => {
    try {
        const { data } = await instance.get(`/orders/${id}`);
        return data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// ✏️ UPDATE ORDER
export const updateOrder = async (id, payload) => {
    try {
        const { data } = await instance.put(`/orders/${id}`, payload);
        return data.data;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};

// 🗑 DELETE / CANCEL ORDER
export const deleteOrder = async (id) => {
    try {
        const { data } = await instance.delete(`/orders/${id}`);
        return data.message;
    } catch (error) {
        throw error.response?.data?.message || error.message;
    }
};