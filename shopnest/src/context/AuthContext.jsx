// // import { createContext, useContext, useEffect, useState } from 'react';
// // import axios from 'axios';
// // import { useNavigate } from 'react-router-dom';

// // const AuthContext = createContext();

// // export function AuthProvider({ children }) {
// //     const [user, setUser] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const navigate = useNavigate();

// //     useEffect(() => {
// //         const checkAuth = async () => {
// //             try {
// //                 const res = await axios.get('/api/auth/user', { withCredentials: true });
// //                 setUser(res.data.user);
// //             } catch (err) {
// //                 setUser(null);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         checkAuth();
// //     }, []);

// //     const login = async (username, password) => {
// //         try {
// //             await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
// //             const res = await axios.get('/api/auth/user', { withCredentials: true });
// //             setUser(res.data.user);
// //             return { success: true };
// //         } catch (err) {
// //             return { success: false, message: err.response?.data?.message || 'Login failed' };
// //         }
// //     };

// //     const register = async (username, email, password) => {
// //         try {
// //             await axios.post('/api/auth/register', { username, email, password }, { withCredentials: true });
// //             return { success: true };
// //         } catch (err) {
// //             return { success: false, message: err.response?.data?.message || 'Registration failed' };
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await axios.post('/api/auth/logout', {}, { withCredentials: true });
// //             setUser(null);
// //             navigate('/');
// //         } catch (err) {
// //             console.error('Logout failed:', err);
// //         }
// //     };

// //     return (
// //         <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // }

// // export function useAuth() {
// //     return useContext(AuthContext);
// // }
// // src/context/AuthContext.jsx
// // // src/context/AuthContext.jsx
// // import { createContext, useContext, useState, useEffect } from 'react';
// // import axios from 'axios';

// // const AuthContext = createContext();

// // export function AuthProvider({ children }) {
// //     const [user, setUser] = useState(null);
// //     const [loading, setLoading] = useState(true);

// //     useEffect(() => {
// //         const checkAuth = async () => {
// //             try {
// //                 const res = await axios.get('/api/auth/user', { withCredentials: true });
// //                 setUser(res.data.user);
// //             } catch (err) {
// //                 setUser(null);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         };
// //         checkAuth();
// //     }, []);

// //     const login = async (username, password) => {
// //         try {
// //             await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
// //             const res = await axios.get('/api/auth/user', { withCredentials: true });
// //             setUser(res.data.user);
// //             return { success: true };
// //         } catch (err) {
// //             return { success: false, message: err.response?.data?.message || 'Login failed' };
// //         }
// //     };

// //     const register = async (username, email, password) => {
// //         try {
// //             await axios.post('/api/auth/register', { username, email, password }, { withCredentials: true });
// //             return { success: true };
// //         } catch (err) {
// //             return { success: false, message: err.response?.data?.message || 'Registration failed' };
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await axios.post('/api/auth/logout', {}, { withCredentials: true });
// //             setUser(null);
// //             // Return a success status instead of navigating directly
// //             return { success: true };
// //         } catch (err) {
// //             console.error('Logout failed:', err);
// //             return { success: false, message: 'Logout failed' };
// //         }
// //     };

// //     return (
// //         <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // }

// // export function useAuth() {
// //     const context = useContext(AuthContext);
// //     if (!context) {
// //         throw new Error('useAuth must be used within an AuthProvider');
// //     }
// //     return context;
// // }
// // src/context/AuthContext.jsx
// //     import { createContext, useContext, useState, useEffect } from 'react';
// //     import axios from 'axios';

// //     const AuthContext = createContext();

// //     export function AuthProvider({ children }) {
// //         const [user, setUser] = useState(null);
// //         const [loading, setLoading] = useState(true);
// //         const [initialized, setInitialized] = useState(false); // Track initialization
// //         const [error, setError] = useState(null);

// //         const checkAuth = async () => {
// //             try {
// //                 const res = await axios.get('/api/auth/user', {
// //                     withCredentials: true,
// //                     headers: {
// //                         'Content-Type': 'application/json',
// //                     },
// //                 });
// //                 setUser(res.data?.user || null);
// //                 setError(null);
// //             } catch (err) {
// //                 // 401 is expected for unauthenticated users
// //                 if (err.response?.status !== 401) {
// //                     setError(err.response?.data?.message || 'Failed to check authentication');
// //                 }
// //                 setUser(null);
// //             } finally {
// //                 setLoading(false);
// //                 setInitialized(true); // Mark as initialized
// //             }
// //         };

// //         useEffect(() => {
// //             checkAuth();
// //         }, []);

// //     const login = async (username, password) => {
// //         try {
// //             await axios.post(
// //                 '/api/auth/login',
// //                 { username, password },
// //                 { withCredentials: true }
// //             );
// //             await checkAuth(); // Re-check auth status after login
// //             return { success: true };
// //         } catch (err) {
// //             return {
// //                 success: false,
// //                 message: err.response?.data?.message || 'Login failed',
// //             };
// //         }
// //     };

// //     const register = async (username, email, password) => {
// //         try {
// //             await axios.post(
// //                 '/api/auth/register',
// //                 { username, email, password },
// //                 { withCredentials: true }
// //             );
// //             await checkAuth();
// //             return { success: true };
// //         } catch (err) {
// //             return {
// //                 success: false,
// //                 message: err.response?.data?.message || 'Registration failed',
// //             };
// //         }
// //     };

// //     const logout = async () => {
// //         try {
// //             await axios.post('/api/auth/logout', {}, { withCredentials: true });
// //             setUser(null);
// //             return { success: true };
// //         } catch (err) {
// //             return {
// //                 success: false,
// //                 message: err.response?.data?.message || 'Logout failed',
// //             };
// //         }
// //     };

// //     return (
// //         <AuthContext.Provider
// //             value={{
// //                 user,
// //                 loading,
// //                 initialized,
// //                 error,
// //                 login,
// //                 register,
// //                 logout,
// //                 checkAuth,
// //                 setUser,
// //             }}
// //         >
// //             {children}
// //         </AuthContext.Provider>
// //     );
// // }

// // export function useAuth() {
// //     const context = useContext(AuthContext);
// //     if (!context) {
// //         throw new Error('useAuth must be used within an AuthProvider');
// //     }
// //     return context;
// // }
// import { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//     const [authState, setAuthState] = useState({
//         user: null,
//         loading: true,
//         initialized: false,
//         error: null
//     });

//     const checkAuth = useCallback(async () => {
//         try {
//             const res = await axios.get('/api/auth/user', {
//                 withCredentials: true,
//                 headers: { 'Content-Type': 'application/json' },
//             });

//             setAuthState(prev => ({
//                 ...prev,
//                 user: res.data?.user || null,
//                 loading: false,
//                 initialized: true,
//                 error: null
//             }));
//         } catch (err) {
//             setAuthState(prev => ({
//                 ...prev,
//                 user: null,
//                 loading: false,
//                 initialized: true,
//                 error: err.response?.status !== 401
//                     ? err.response?.data?.message || 'Failed to check authentication'
//                     : null
//             }));
//         }
//     }, []);

//     useEffect(() => {
//         checkAuth();
//     }, [checkAuth]);

//     const login = async (username, password) => {
//         try {
//             setAuthState(prev => ({ ...prev, loading: true }));

//             await axios.post(
//                 '/api/auth/login',
//                 { username, password },
//                 { withCredentials: true }
//             );

//             await checkAuth();
//             return { success: true };
//         } catch (err) {
//             setAuthState(prev => ({
//                 ...prev,
//                 loading: false,
//                 error: err.response?.data?.message || 'Login failed'
//             }));
//             return { success: false };
//         }
//     };

//     const register = async (username, email, password) => {
//         try {
//             setAuthState(prev => ({ ...prev, loading: true }));

//             await axios.post(
//                 '/api/auth/register',
//                 { username, email, password },
//                 { withCredentials: true }
//             );

//             await checkAuth();
//             return { success: true };
//         } catch (err) {
//             setAuthState(prev => ({
//                 ...prev,
//                 loading: false,
//                 error: err.response?.data?.message || 'Registration failed'
//             }));
//             return { success: false };
//         }
//     };

//     const logout = async () => {
//         try {
//             setAuthState(prev => ({ ...prev, loading: true }));

//             await axios.post('/api/auth/logout', {}, { withCredentials: true });

//             setAuthState(prev => ({
//                 user: null,
//                 loading: false,
//                 initialized: true,
//                 error: null
//             }));

//             return { success: true };
//         } catch (err) {
//             setAuthState(prev => ({
//                 ...prev,
//                 loading: false,
//                 error: err.response?.data?.message || 'Logout failed'
//             }));
//             return { success: false };
//         }
//     };

//     return (
//         <AuthContext.Provider
//             value={{
//                 user: authState.user,
//                 loading: authState.loading,
//                 initialized: authState.initialized,
//                 error: authState.error,
//                 login,
//                 register,
//                 logout,
//                 checkAuth,
//                 setUser: (user) => setAuthState(prev => ({ ...prev, user }))
//             }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// }

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [authState, setAuthState] = useState({
        user: null,
        loading: true,
        initialized: false,
        error: null
    });




    const checkAuth = useCallback(async () => {
        try {
            const res = await api.get('/api/auth/user', {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' },
            });

            setAuthState({
                user: res.data?.user || null,
                loading: false,
                initialized: true,
                error: null
            });
            return res.data?.user || null;
        } catch (err) {
            setAuthState({
                user: null,
                loading: false,
                initialized: true,
                error: err.response?.status !== 401
                    ? err.response?.data?.message || 'Failed to check authentication'
                    : null
            });
            return null;
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (username, password) => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));

            const res = await api.post(
                '/api/auth/login',
                { username, password },
                { withCredentials: true }
            );

            const user = await checkAuth();
            return { success: true, user, message: res.data?.message || 'Login successful' };
        } catch (err) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || 'Login failed'
            }));
            return { success: false, message: err.response?.data?.message || 'Login failed' };
        }
    };

    const register = async (username, email, password) => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));

            const res = await api.post(
                '/api/auth/register',
                { username, email, password },
                { withCredentials: true }
            );

            const user = await checkAuth();
            return { success: true, user, message: res.data?.message || 'Registration successful' };
        } catch (err) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || 'Registration failed'
            }));
            return { success: false, message: err.response?.data?.message || 'Registration failed' };
        }
    };

    const logout = async () => {
        try {
            setAuthState(prev => ({ ...prev, loading: true }));

            await api.post('/api/auth/logout', {}, { withCredentials: true });

            setAuthState({
                user: null,
                loading: false,
                initialized: true,
                error: null
            });

            return { success: true };
        } catch (err) {
            setAuthState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || 'Logout failed'
            }));
            return { success: false, message: err.response?.data?.message || 'Logout failed' };
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user: authState.user,
                loading: authState.loading,
                initialized: authState.initialized,
                error: authState.error,
                login,
                register,
                logout,
                checkAuth,
                setUser: (user) => setAuthState(prev => ({ ...prev, user }))
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
