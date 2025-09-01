// import { Routes, Route, Navigate } from 'react-router-dom';
// import AdminLayout from '../components/admin/AdminLayout';
// import AdminLogin from '../pages/admin/AdminLogin';
// import Dashboard from '../pages/admin/Dashboard';
// import Categories from '../pages/admin/Categories';
// import Products from '../pages/admin/Products';
// import Users from '../pages/admin/Users';
// import Orders from '../pages/admin/Orders';
// import { useAuth } from '../context/AuthContext';

// export default function AdminRoutes() {
//     const { user } = useAuth();

//     return (
//         <Routes>
//             <Route path="/login" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <AdminLogin />} />

//             <Route path="/" element={<AdminLayout />}>
//                 <Route index element={user?.role === 'admin' ? <Dashboard /> : <Navigate to="/admin/login" />} />
//                 <Route path="categories" element={user?.role === 'admin' ? <Categories /> : <Navigate to="/admin/login" />} />
//                 <Route path="products" element={user?.role === 'admin' ? <Products /> : <Navigate to="/admin/login" />} />
//                 <Route path="users" element={user?.role === 'admin' ? <Users /> : <Navigate to="/admin/login" />} />
//                 <Route path="orders" element={user?.role === 'admin' ? <Orders /> : <Navigate to="/admin/login" />} />
//             </Route>
//         </Routes>
//     );
// }
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import AdminLogin from '../pages/admin/AdminLogin';
import Dashboard from '../pages/admin/Dashboard';
import Categories from '../pages/admin/Categories';
import Products from '../pages/admin/Products';
import Users from '../pages/admin/Users';
import Orders from '../pages/admin/Orders';
import EditProduct from "../pages/admin/EditProduct";
import EditCategory from "../pages/admin/EditCategory";



import { useAuth } from '../context/AuthContext';

export default function AdminRoutes() {
    const { user, loading, initialized } = useAuth();

    if (!initialized || loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/login" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <AdminLogin />} />
            <Route path="/" element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/admin/login" />}>
                <Route index element={<Dashboard />} />
                <Route path="categories" element={<Categories />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="categories/edit/:id" element={<EditCategory />} />
            </Route>
        </Routes>
    );
}
