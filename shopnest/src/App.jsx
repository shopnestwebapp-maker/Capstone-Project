// // // src/App.jsx
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // import { AuthProvider } from './context/AuthContext';
// // import LandingPage from './pages/LandingPage';
// // import CustomerRoutes from './routes/CustomerRoutes';
// // import AdminRoutes from './routes/AdminRoutes';
// // import ErrorBoundary from './components/ErrorBoundary';

// // function App() {
// //   return (
// //     <AuthProvider>
// //       <ErrorBoundary>
// //         <Router>
// //           <Routes>
// //             <Route path="/" element={<LandingPage />} />
// //             <Route path="/customer/*" element={<CustomerRoutes />} />
// //             <Route path="/admin/*" element={<AdminRoutes />} />
// //           </Routes>

// //         </Router>
// //       </ErrorBoundary>
// //     </AuthProvider>
// //   );
// // }

// // export default App;
// // src/App.jsx
// import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import LandingPage from './pages/LandingPage';
// import CustomerRoutes from './routes/CustomerRoutes';
// import AdminRoutes from './routes/AdminRoutes';
// import { useEffect } from 'react';
// import { useAuth } from './context/AuthContext';

// // Create a component to handle logout redirection
// function LogoutHandler() {
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const performLogout = async () => {
//       const result = await logout();
//       if (result.success) {
//         navigate('/');
//       }
//     };
//     performLogout();
//   }, [logout, navigate]);

//   return <div>Logging out...</div>;
// }

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/customer/*" element={<CustomerRoutes />} />
//           <Route path="/admin/*" element={<AdminRoutes />} />
//           <Route path="/logout" element={<LogoutHandler />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;
// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import CustomerRoutes from './Routes/CustomerRoutes';
import AdminRoutes from './Routes/AdminRoutes';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/customer/*" element={<CustomerRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;