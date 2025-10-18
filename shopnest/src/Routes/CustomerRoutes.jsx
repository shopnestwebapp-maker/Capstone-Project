// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import Layout from '../components/customer/Layout';
// // import HomePage from '../pages/customer/HomePage';
// // import LoginPage from '../pages/customer/LoginPage';
// // import ProductPage from '../pages/customer/ProductPage';
// // import CategoryPage from '../pages/customer/CategoryPage';
// // import CartPage from '../pages/customer/CartPage';
// // import CheckoutPage from '../pages/customer/CheckoutPage';
// // import ProfilePage from '../pages/customer/ProfilePage';
// // import WishlistPage from '../pages/customer/WishlistPage';
// // import OrdersPage from '../pages/customer/OrdersPage';
// // import { useAuth } from '../context/AuthContext';

// // export default function CustomerRoutes() {
// //     const { user } = useAuth();

// //     return (
// //         <Routes>
// //             <Route path="/" element={<Layout />}>
// //                 <Route index element={<HomePage />} />
// //                 <Route path="login" element={user ? <Navigate to="/customer" /> : <LoginPage />} />
// //                 <Route path="products/:id" element={<ProductPage />} />
// //                 <Route path="categories/:id" element={<CategoryPage />} />
// //                 <Route path="cart" element={<CartPage />} />
// //                 <Route path="checkout" element={<CheckoutPage />} />
// //                 <Route path="profile" element={<ProfilePage />} />
// //                 <Route path="wishlist" element={<WishlistPage />} />
// //                 <Route path="orders" element={<OrdersPage />} />
// //             </Route>
// //         </Routes>
// //     );
// // }
// // src/routes/CustomerRoutes.jsx
// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import Layout from '../components/customer/Layout';
// // import HomePage from '../pages/customer/HomePage';
// // import LoginPage from '../pages/customer/LoginPage';
// // import ProductPage from '../pages/customer/ProductPage';
// // import CategoryPage from '../pages/customer/CategoryPage';
// // import CartPage from '../pages/customer/CartPage';
// // import CheckoutPage from '../pages/customer/CheckoutPage';
// // import ProfilePage from '../pages/customer/ProfilePage';
// // import WishlistPage from '../pages/customer/WishlistPage';
// // import OrdersPage from '../pages/customer/OrdersPage';
// // import { useAuth } from '../context/AuthContext';
// // import RegisterPage from '../pages/customer/RegisterPage';

// // export default function CustomerRoutes() {
// //     const { user, loading } = useAuth();

// //     if (loading) {
// //         return <div className="flex justify-center items-center h-screen">Loading...</div>;
// //     }

// //     return (
// //         <Routes>
// //             <Route path="/" element={<Layout />}>
// //                 <Route index element={<HomePage />} />
// //                 <Route path="login" element={user ? <Navigate to="/customer" /> : <LoginPage />} />
// //                 <Route
// //                     path="register"
// //                     element={
// //                         loading
// //                             ? <div className="flex justify-center items-center h-screen">Loading...</div>
// //                             : user
// //                                 ? <Navigate to="/customer" replace />
// //                                 : <RegisterPage />
// //                     }
// //                 />

// //                 <Route path="products/:id" element={<ProductPage />} />
// //                 <Route path="categories/:id" element={<CategoryPage />} />
// //                 <Route path="cart" element={user ? <CartPage /> : <Navigate to="/customer/login" />} />
// //                 <Route path="checkout" element={user ? <CheckoutPage /> : <Navigate to="/customer/login" />} />
// //                 <Route path="profile" element={user ? <ProfilePage /> : <Navigate to="/customer/login" />} />
// //                 <Route path="wishlist" element={user ? <WishlistPage /> : <Navigate to="/customer/login" />} />
// //                 <Route path="orders" element={user ? <OrdersPage /> : <Navigate to="/customer/login" />} />
// //             </Route>
// //         </Routes>
// //     );
// // }
// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import Layout from '../components/customer/Layout';
// // import HomePage from '../pages/customer/HomePage';
// // import LoginPage from '../pages/customer/LoginPage';
// // import ProductPage from '../pages/customer/ProductPage';
// // import CategoryPage from '../pages/customer/CategoryPage';
// // import CartPage from '../pages/customer/CartPage';
// // import CheckoutPage from '../pages/customer/CheckoutPage';
// // import ProfilePage from '../pages/customer/ProfilePage';
// // import WishlistPage from '../pages/customer/WishlistPage';
// // import OrdersPage from '../pages/customer/OrdersPage';
// // import { useAuth } from '../context/AuthContext';
// // import RegisterPage from '../pages/customer/RegisterPage';

// // export default function CustomerRoutes() {
// //     const { user, loading } = useAuth();

// //     // Block all routing until auth check is done
// //     if (loading) {
// //         return <div className="flex justify-center items-center h-screen">Loading...</div>;
// //     }

// //     return (
// //         <Routes>
// //             <Route path="/" element={<Layout />}>
// //                 {/* Public */}
// //                 <Route index element={<HomePage />} />
// //                 <Route
// //                     path="login"
// //                     element={!user ? <LoginPage /> : <Navigate to="/customer" replace />}
// //                 />
// //                 <Route
// //                     path="register"
// //                     element={!user ? <RegisterPage /> : <Navigate to="/customer" replace />}
// //                 />
// //                 <Route path="products/:id" element={<ProductPage />} />
// //                 <Route path="categories/:id" element={<CategoryPage />} />

// //                 {/* Protected */}
// //                 <Route
// //                     path="cart"
// //                     element={user ? <CartPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="checkout"
// //                     element={user ? <CheckoutPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="profile"
// //                     element={user ? <ProfilePage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="wishlist"
// //                     element={user ? <WishlistPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="orders"
// //                     element={user ? <OrdersPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //             </Route>
// //         </Routes>
// //     );
// // }
// // import { Routes, Route, Navigate } from 'react-router-dom';
// // import Layout from '../components/customer/Layout';
// // import HomePage from '../pages/customer/HomePage';
// // import LoginPage from '../pages/customer/LoginPage';
// // import RegisterPage from '../pages/customer/RegisterPage';
// // import ProductPage from '../pages/customer/ProductPage';
// // import CategoryPage from '../pages/customer/CategoryPage';
// // import CartPage from '../pages/customer/CartPage';
// // import CheckoutPage from '../pages/customer/CheckoutPage';
// // import ProfilePage from '../pages/customer/ProfilePage';
// // import WishlistPage from '../pages/customer/WishlistPage';
// // import OrdersPage from '../pages/customer/OrdersPage';
// // import { useAuth } from '../context/AuthContext';

// // export default function CustomerRoutes() {
// //     const { user, loading, initialized } = useAuth();

// //     // Show loading until auth check completes
// //     if (!initialized || loading) {
// //         return <div className="flex justify-center items-center h-screen">Loading...</div>;
// //     }

// //     return (
// //         <Routes>
// //             <Route path="/" element={<Layout />}>
// //                 {/* Public routes */}
// //                 <Route index element={<HomePage />} />
// //                 <Route
// //                     path="login"
// //                     element={user ? <Navigate to="/customer" replace /> : <LoginPage />}
// //                 />
// //                 {/* <Route
// //                     path="register"
// //                     element={user ? <Navigate to="/customer/" replace /> : <RegisterPage />}
// //                 /> */}
// //                 <Route path="register" element={<RegisterPage />} />

// //                 <Route path="products/:id" element={<ProductPage />} />
// //                 <Route path="categories/:id" element={<CategoryPage />} />

// //                 {/* Protected routes */}
// //                 <Route
// //                     path="cart"
// //                     element={user ? <CartPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="checkout"
// //                     element={user ? <CheckoutPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="profile"
// //                     element={user ? <ProfilePage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="wishlist"
// //                     element={user ? <WishlistPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //                 <Route
// //                     path="orders"
// //                     element={user ? <OrdersPage /> : <Navigate to="/customer/login" replace />}
// //                 />
// //             </Route>
// //         </Routes>
// //     );
// // }
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Layout from '../components/customer/Layout';
// import HomePage from '../pages/customer/HomePage';
// import LoginPage from '../pages/customer/LoginPage';
// import RegisterPage from '../pages/customer/RegisterPage';
// import ProductPage from '../pages/customer/ProductPage';
// import CategoryPage from '../pages/customer/CategoryPage';
// import CartPage from '../pages/customer/CartPage';
// import CheckoutPage from '../pages/customer/CheckoutPage';
// import ProfilePage from '../pages/customer/ProfilePage';
// import WishlistPage from '../pages/customer/WishlistPage';
// import OrdersPage from '../pages/customer/OrdersPage';
// import { useAuth } from '../context/AuthContext';

// export default function CustomerRoutes() {
//     const { user, loading, initialized } = useAuth();

//     if (!initialized || loading) {
//         return <div className="flex justify-center items-center h-screen">Loading...</div>;
//     }

//     return (
//         <Routes>
//             <Route path="/" element={<Layout />}>
//                 {/* Public routes */}
//                 <Route index element={<HomePage />} />
//                 <Route
//                     path="login"
//                     element={user ? <Navigate to="/" replace /> : <LoginPage />}
//                 />
//                 <Route
//                     path="register"
//                     element={user ? <Navigate to="/" replace /> : <RegisterPage />}
//                 />
//                 <Route path="products/:id" element={<ProductPage />} />
//                 <Route path="categories/:id" element={<CategoryPage />} />

//                 {/* Protected routes */}
//                 <Route
//                     path="cart"
//                     element={user ? <CartPage /> : <Navigate to="/login" replace />}
//                 />
//                 <Route
//                     path="checkout"
//                     element={user ? <CheckoutPage /> : <Navigate to="/login" replace />}
//                 />
//                 <Route
//                     path="profile"
//                     element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
//                 />
//                 <Route
//                     path="wishlist"
//                     element={user ? <WishlistPage /> : <Navigate to="/login" replace />}
//                 />
//                 <Route
//                     path="orders"
//                     element={user ? <OrdersPage /> : <Navigate to="/login" replace />}
//                 />
//             </Route>
//         </Routes>
//     );
// }
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/customer/Layout';
import HomePage from '../pages/customer/HomePage';
import ProductsPages from '../pages/customer/products/ProdA';
import LoginPage from '../pages/customer/Auth/LoginPage';
import RegisterPage from '../pages/customer/Auth/RegisterPage';
import ProductPage from '../pages/customer/products/ProductPage';
import CategoryPage from '../pages/customer/Categories/CategoryPage';
import CartPage from '../pages/customer/cart/CartPage';
import CheckoutPage from '../pages/customer/orders/CheckoutPage';
import ProfilePage from '../pages/customer/User/ProfilePage';
import WishlistPage from '../pages/customer/cart/WishlistPage';
import OrdersPage from '../pages/customer/orders/OrdersPage';
import PaymentPage from '../pages/customer/orders/PaymentPage';
import RewardPage from '../pages/customer/Rewards/rewardDasboard';
import Rewardspin from '../pages/customer/Rewards/SpinTheWheel';
import RewardsHistory from '../pages/customer/Rewards/RewardsHistory';
import Anlaytics from '../pages/customer/Analysis/Analytics';
import CatP from '../pages/customer/Categories/catP';
import { useAuth } from '../context/AuthContext';

export default function CustomerRoutes() {
    const { user, loading, initialized } = useAuth();

    if (!initialized || loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={user ? <Navigate to="/customer" replace /> : <LoginPage />} />
                <Route path="register" element={user ? <Navigate to="/customer" replace /> : <RegisterPage />} />
                <Route path="products/:id" element={<ProductPage />} />
                <Route path="categories/:id" element={<CategoryPage />} />


                {/* Protected */}
                <Route path="cart" element={user ? <CartPage /> : <Navigate to="/customer/login" replace />} />
                <Route path="checkout" element={user ? <CheckoutPage /> : <Navigate to="/customer/login" replace />} />
                <Route path="profile" element={user ? <ProfilePage /> : <Navigate to="/customer/login" replace />} />
                <Route path="wishlist" element={user ? <WishlistPage /> : <Navigate to="/customer/login" replace />} />
                <Route path="categories" element={user ? <CatP /> : <Navigate to="/customer/login" replace />} />
                <Route path="orders" element={user ? <OrdersPage /> : <Navigate to="/customer/login" replace />} />
                <Route path="allproducts" element={user ? <ProductsPages /> : <Navigate to="/customer/login" replace />} />
                <Route path="rewards" element={user ? <RewardPage /> : <Navigate to="/customer/login" replace />} />
                <Route path="rewards/spin" element={user ? <Rewardspin /> : <Navigate to="/customer/login" replace />} />
                <Route path="rewards/history" element={user ? <RewardsHistory /> : <Navigate to="/customer/login" replace />} />
                <Route path="Analytics" element={user ? <Anlaytics /> : <Navigate to="/customer/login" replace />} />
                <Route path="/payment" element={user ? <PaymentPage /> : <Navigate to="/customer/login" replace />} />
             

            </Route>
        </Routes>
    );
}
