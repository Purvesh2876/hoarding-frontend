import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/crmSales`;
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

export const getAllProducts = async () => {
    try {
        const response = await instance.get('/getProducts');

        return response.data; // Axios automatically parses JSON
    } catch (error) {
        console.error("Create Lead Error:", error.response?.data || error.message);
        throw error.response?.data || error; // Send meaningful error
    }
};
export const createLead = async (leadData) => {
    try {
        const response = await instance.post('/createLead', leadData, {
            headers: { "Content-Type": "application/json" },
        });

        return response.data; // Axios automatically parses JSON
    } catch (error) {
        console.error("Create Lead Error:", error.response?.data || error.message);
        throw error.response?.data || error; // Send meaningful error
    }
};




export async function createRequest(data) {
    try {
        const response = await instance.post(
            '/createRequest',
            data,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function updateRequest(data) {
    try {
        const { id, ...updateData } = data;
        const response = await instance.put(
            `/updateRequest/${id}`,
            updateData,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response;
    } catch (error) {
        throw error;
    }
}


export async function deleteRequest(data) {
    try {
        const { id } = data;
        const response = await instance.delete(
            `/deleteRequest/${id}`,
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getAllRequests(data) {
    try {
        const response = await instance.get('/getAllRequests');
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getApprovedRequests() {
    try {
        const response = await instance.get('/getApprovedRequests');
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getMyChildren() {
    try {
        const response = await axios.get(`${process.env.REACT_APP_IP}/api/users/getMyChildren`, { withCredentials: true });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function createOrder(data) {
    try {
        const response = await instance.post('/createOrder', data, { headers: { 'Content-Type': 'application/json' } });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getMyOrders() {
    try {
        const response = await instance.get('/getMyOrders');
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getMyRequests() {
    try {
        const response = await instance.get('/getMyRequests');
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getParentStocks(page = 1, limit = 50) {
    try {
        const response = await instance.get('/getParentStocks', {
            withCredentials: true,
            params: { page, limit }
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getAllLeads(page, email) {
    try {
        const params = {
            page: page,
            search: email
        };
        const response = await instance.get('/getAllLeads', {
            params
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function deleteLead(id) {
    try {
        const response = await instance.delete('/deleteLead', {
            params: {
                id: id
            }
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const updateLead = async (leadId, updatedData) => {
    try {
        const response = await instance.put(
            `/updateLead?id=${leadId}`,
            updatedData,
            { headers: { "Content-Type": "application/json" } }
        );
        // response.data contains the updated lead from backend
        return response.data;
    } catch (err) {
        console.error("Error updating lead:", err);
        throw err;
    }
};

// Bulk upload leads (Excel JSON)
export const bulkUploadLeads = async (excelJsonData) => {
    try {
        const response = await instance.post(
            "/createBulkUpload",
            { data: excelJsonData },
            { headers: { "Content-Type": "application/json" } }
        );

        // Return full response object, not just response.data
        return response;
    } catch (err) {
        console.error("Error bulk uploading leads:", err);
        throw err;
    }
};

export const getAllStocks = async () => {
    try {
        // Use the configured axios instance so baseURL (REACT_APP_IP) is respected
        const response = await instance.get('/getAllStocks');
        return response.data;
    } catch (error) {
        throw error;
    }
}