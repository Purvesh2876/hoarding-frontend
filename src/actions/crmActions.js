import axios from 'axios';

const baseURL = `${process.env.REACT_APP_IP}/api/crmSales`;

const instance = axios.create({
    baseURL,
    withCredentials: true
});

export const getStocksByUserId = async (userId, page = 1, limit = 10) => {
    try {
        const params = { userId, page, limit };
        console.log('[frontend] getStocksByUserId params:', params);
        const response = await instance.get('/getStocksByUserId', { params });
        console.log('[frontend] getStocksByUserId response:', response?.data);
        return response.data;
    } catch (error) {
        console.log('[frontend] getStocksByUserId error:', error?.response?.data || error?.message);
        return { success: false, message: error.response?.data?.message || 'Failed to fetch stock' };
    }
};


