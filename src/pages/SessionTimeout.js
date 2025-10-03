import React, { useEffect, useCallback, useRef } from 'react';
import { logout } from '../actions/userActions';
import { useNavigate } from 'react-router-dom';

const SessionTimeout = ({ timeoutDuration = 18 }) => { // Default is 1 hour
    const timeoutRef = useRef(null);
    const Navigate = useNavigate();
    const removeCookie = async() => {
        await logout();
        Navigate('/login');
    };

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            alert('Your session has expired due to inactivity. Please log in again.');
            // Clear session data, e.g., remove token from localStorage
            //   localStorage.removeItem('token'); 
            removeCookie();
        }, timeoutDuration);
    }, [timeoutDuration]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

        const reset = () => resetTimeout();

        events.forEach((event) => window.addEventListener(event, reset));

        resetTimeout(); // Set the initial timeout

        return () => {
            events.forEach((event) => window.removeEventListener(event, reset));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resetTimeout]);

    return null;
};

export default SessionTimeout;
