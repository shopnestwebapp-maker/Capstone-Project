import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import cron from 'node-cron';

dotenv.config();
const app = express();

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'aa',
    database: process.env.DB_NAME || 'ShopNestaa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    exposedHeaders: ['set-cookie']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));
app.use(passport.initialize());
app.use(passport.session())
// Passport
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [username]);
            if (users.length === 0) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            const user = users[0];
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return done(null, false);
        }
        done(null, users[0]);
    } catch (err) {
        done(err);
    }
});

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Unauthorized' });
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).json({ message: 'Forbidden' });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role = 'customer' } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        console.error('Register error:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Auth error:', err);
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ success: false, message: info?.message || 'Invalid credentials' });
        }
        req.login(user, (err) => {
            if (err) {
                console.error('Login error:', err);
                return next(err);
            }
            const safeUser = {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            };
            return res.json({ success: true, message: 'Logged in successfully', user: safeUser });
        });
    })(req, res, next);
});

app.post('/api/auth/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            console.error('Logout error:', err);
            return next(err);
        }
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    res.clearCookie('connect.sid');
                    return res.status(200).json({ success: true, message: 'Logged out (session destroy failed on server)' });
                }
                res.clearCookie('connect.sid');
                return res.json({ success: true, message: 'Logged out successfully' });
            });
        } else {
            res.clearCookie('connect.sid');
            return res.json({ success: true, message: 'Logged out successfully' });
        }
    });
});

app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            user: {
                id: req.user.id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role
            }
        });
    } else {
        res.json({ user: null });
    }
});
app.get('/api/productss', async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.category_id,
                c.name AS category_name,
                p.image_url,
                p.stock_quantity,
                p.created_at
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `);

        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const { categories, minPrice, maxPrice, sort } = req.query;

        // Base query with JOIN
        let query = `
            SELECT p.* 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const params = [];

        // Filter by category name
        if (categories) {
            const categoryList = categories.split(','); // array of names
            const placeholders = categoryList.map(() => '?').join(','); // ?,?,?
            query += ` AND c.name IN (${placeholders})`;
            params.push(...categoryList);
        }

        // Price filter
        if (minPrice) {
            query += ' AND p.price >= ?';
            params.push(Number(minPrice));
        }
        if (maxPrice) {
            query += ' AND p.price <= ?';
            params.push(Number(maxPrice));
        }

        // Sorting
        switch (sort) {
            case 'low-to-high':
                query += ' ORDER BY p.price ASC';
                break;
            case 'high-to-low':
                query += ' ORDER BY p.price DESC';
                break;
            case 'top-rated':
                query += ' ORDER BY p.id DESC'; // no rating column; fallback
                break;
            case 'newest':
            default:
                query += ' ORDER BY p.created_at DESC';
        }

        const [products] = await pool.query(query, params);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});



app.get('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(products[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});
app.delete('/api/products/:id', async (req, res) => {
    try {
        const [products] = await pool.query('delete FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(products[0]);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product' });
    }
});

app.put("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category_id, image_url, stock_quantity } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE products 
       SET name = ?, description = ?, base_price = ?, category_id = ?, image_url = ?, stock_quantity = ?
       WHERE id = ?`,
            [name, description, price, category_id, image_url, stock_quantity, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Server error" });
    }
});
app.get('/api/categories/', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.get('/api/categories/:categoryId', async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.categoryId]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});
app.get('/api/products/categories/:categoryId', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products WHERE category_id = ?', [req.params.categoryId]);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products by category' });
    }
});

// Cart Routes
app.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
        const [carts] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);

        let cart;
        if (carts.length === 0) {
            const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
            cart = { id: result.insertId, user_id: req.user.id };
        } else {
            cart = carts[0];
        }

        const [items] = await pool.query(`
      SELECT ci.*, p.name, p.price, p.image_url 
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cart.id]);

        res.json({ cart, items });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching cart' });
    }
});

app.get('/api/cart/count', isAuthenticated, async (req, res) => {
    const [items] = await pool.query(`
        SELECT ci.quantity 
        FROM cart_items ci
        JOIN carts c ON ci.cart_id = c.id
        WHERE c.user_id = ?
    `, [req.user.id]);
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count: totalCount });
});

app.post('/api/cart/add', isAuthenticated, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        const [carts] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
        let cartId;

        if (carts.length === 0) {
            const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].id;
        }

        const [existingItems] = await pool.query(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );

        if (existingItems.length > 0) {
            await pool.query(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existingItems[0].id]
            );
        } else {
            await pool.query(
                'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                [cartId, productId, quantity]
            );
        }

        res.json({ message: 'Product added to cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to cart' });
    }
});

app.put('/api/cart/update/:itemId', isAuthenticated, async (req, res) => {
    try {
        const { quantity } = req.body;
        await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
            [quantity, req.params.itemId, req.user.id]);
        res.json({ message: 'Cart item updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating cart item' });
    }
});

app.delete('/api/cart/remove/:itemId', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart_items WHERE id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
            [req.params.itemId, req.user.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing item from cart' });
    }
});

// Wishlist Routes
app.get('/api/wishlist', isAuthenticated, async (req, res) => {
    try {
        const [items] = await pool.query(`
      SELECT w.*, p.name, p.price, p.image_url 
      FROM wishlists w
      JOIN products p ON w.product_id = p.id
      WHERE w.user_id = ?
    `, [req.user.id]);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
});

app.post('/api/wishlist/add', isAuthenticated, async (req, res) => {
    try {
        const { productId } = req.body;
        await pool.query('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
            [req.user.id, productId]);
        res.json({ message: 'Product added to wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
});




app.delete('/api/wishlist/remove/:productId', isAuthenticated, async (req, res) => {
    try {
        await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]);
        res.json({ message: 'Product removed from wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing from wishlist' });
    }
});

// Order Routes
// app.post('/api/orders/create', isAuthenticated, async (req, res) => {
//     // Extract data from the request body
//     const { name, email, address, city, state, zip, paymentMethod } = req.body;

//     // Basic validation to ensure all required fields are present
//     if (!name || !email || !address || !city || !state || !zip || !paymentMethod) {
//         return res.status(400).json({ message: 'Missing required shipping or payment information' });
//     }

//     try {
//         const [carts] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
//         if (carts.length === 0) {
//             return res.status(400).json({ message: 'Cart is empty' });
//         }

//         const cartId = carts[0].id;
//         const [cartItems] = await pool.query(`
//             SELECT ci.*, p.price, p.stock_quantity
//             FROM cart_items ci
//             JOIN products p ON ci.product_id = p.id
//             WHERE ci.cart_id = ?
//         `, [cartId]);

//         if (cartItems.length === 0) {
//             return res.status(400).json({ message: 'Cart is empty' });
//         }

//         // Check if any product is out of stock
//         for (const item of cartItems) {
//             if (item.quantity > item.stock_quantity) {
//                 return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
//             }
//         }

//         const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

//         // Start a transaction to ensure all database operations succeed or fail together
//         await pool.query('START TRANSACTION');

//         const [orderResult] = await pool.query(
//             'INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?)',
//             [req.user.id, totalAmount, `${name}, ${address}, ${city}, ${state} ${zip}`, paymentMethod]
//         );
//         const orderId = orderResult.insertId;

//         for (const item of cartItems) {
//             await pool.query(
//                 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
//                 [orderId, item.product_id, item.quantity, item.price]
//             );

//             // Decrease stock quantity
//             await pool.query(
//                 'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
//                 [item.quantity, item.product_id]
//             );
//         }

//         // Clear the user's cart
//         await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

//         // Commit the transaction
//         await pool.query('COMMIT');

//         res.json({ message: 'Order created successfully', orderId });
//     } catch (err) {
//         // Rollback the transaction if any error occurs
//         await pool.query('ROLLBACK');
//         console.error('Error creating order:', err);
//         res.status(500).json({ message: 'Error creating order' });
//     }
// });
app.post('/api/orders/create', isAuthenticated, async (req, res) => {
    const { name, email, address, city, state, zip, paymentMethod, redeemPoints = 0 } = req.body;

    if (!name || !email || !address || !city || !state || !zip || !paymentMethod) {
        return res.status(400).json({ message: 'Missing required shipping or payment information' });
    }

    const conn = await pool.getConnection();
    try {
        const [carts] = await conn.query('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
        if (carts.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const cartId = carts[0].id;
        const [cartItems] = await conn.query(`
            SELECT ci.*, p.price, p.stock_quantity, p.name
            FROM cart_items ci
            JOIN products p ON ci.product_id = p.id
            WHERE ci.cart_id = ?
        `, [cartId]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Check stock
        for (const item of cartItems) {
            if (item.quantity > item.stock_quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
            }
        }

        // Calculate totals
        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;

        await conn.query('START TRANSACTION');

        // 🔹 Check & apply redeem points
        if (redeemPoints > 0) {
            const [[reward]] = await conn.query("SELECT points FROM user_rewards WHERE user_id=?", [req.user.id]);

            if (!reward || reward.points < redeemPoints) {
                await conn.query("ROLLBACK");
                return res.status(400).json({ message: "Not enough reward points" });
            }

            discount = redeemPoints; // 1 point = ₹1
            await conn.query("UPDATE user_rewards SET points = points - ? WHERE user_id=?", [redeemPoints, req.user.id]);
            await conn.query(
                "INSERT INTO reward_transactions (user_id, points, type, description) VALUES (?, ?, 'redeem', 'Redeemed at checkout')",
                [req.user.id, -redeemPoints]
            );
        }

        const finalAmount = Math.max(totalAmount - discount, 0);

        // Insert order
        const [orderResult] = await conn.query(
            'INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, totalAmount, discount, finalAmount, `${name}, ${address}, ${city}, ${state} ${zip}`, paymentMethod]
        );
        const orderId = orderResult.insertId;

        // Insert order items + update stock
        for (const item of cartItems) {
            await conn.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
            await conn.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart
        await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

        // 🔹 Auto-credit points (10% rule)
        const earnedPoints = Math.floor(finalAmount * 0.1);
        if (earnedPoints > 0) {
            await conn.query(
                `INSERT INTO user_rewards (user_id, points)
                 VALUES (?, ?)
                 ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
                [req.user.id, earnedPoints]
            );

            await conn.query(
                "INSERT INTO reward_transactions (user_id, points, type, description) VALUES (?, ?, 'earn', 'Points from order')",
                [req.user.id, earnedPoints]
            );
        }

        await conn.query('COMMIT');

        res.json({
            message: 'Order created successfully',
            orderId,
            earnedPoints,
            discount,
            finalAmount
        });
    } catch (err) {
        await conn.query('ROLLBACK');
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Error creating order' });
    } finally {
        conn.release();
    }
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
        const [orders] = await pool.query(
            `SELECT id, user_id, total_amount, discount_amount, final_amount, status, shipping_address, payment_method, created_at, processing_at, shipped_at, delivered_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        const ordersWithItems = await Promise.all(
            orders.map(async order => {
                const [items] = await pool.query(
                    `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image_url 
                     FROM order_items oi
                     JOIN products p ON oi.product_id = p.id
                     WHERE oi.order_id = ?`,
                    [order.id]
                );

                return {
                    ...order,
                    subtotal: Number(order.total_amount), // before discount
                    discount: Number(order.discount_amount),
                    total: Number(order.final_amount), // after discount / redeemed points
                    items
                };
            })
        );

        res.json(ordersWithItems);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

app.delete('/api/orders/:orderId', isAuthenticated, async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;

    try {
        // Check if the order exists and belongs to the user
        const [orders] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(403).json({ message: 'Order not found or you do not have permission to delete it.' });
        }

        // Delete the order (order_items will be deleted automatically due to ON DELETE CASCADE)
        await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);

        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (err) {
        console.error('Error deleting order:', err);
        res.status(500).json({ message: 'Error deleting order.' });
    }
});

// Profile Routes
app.put('/api/profile', isAuthenticated, async (req, res) => {
    try {
        const { email, password } = req.body;
        let updateQuery = 'UPDATE users SET email = ? WHERE id = ?';
        let params = [email, req.user.id];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = 'UPDATE users SET email = ?, password = ? WHERE id = ?';
            params = [email, hashedPassword, req.user.id];
        }

        await pool.query(updateQuery, params);
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email already exists' });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
});
// Admin Routes
// Categories Management
app.get('/api/admin/categories', isAdmin, async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.post('/api/admin/categories', isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await pool.query(
            'INSERT INTO categories (name, description) VALUES (?, ?)',
            [name, description]
        );
        res.status(201).json({ id: result.insertId, name, description });
    } catch (err) {
        res.status(500).json({ message: 'Error creating category' });
    }
});

app.put('/api/admin/categories/:id', isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        await pool.query(
            'UPDATE categories SET name = ?, description = ? WHERE id = ?',
            [name, description, req.params.id]
        );
        res.json({ message: 'Category updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating category' });
    }
});

app.delete('/api/admin/categories/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting category' });
        console.log(err);

    }
});
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
        const [[{ totalCategories }]] = await pool.query('SELECT COUNT(*) AS totalCategories FROM categories');
        const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
        const [[{ totalEarnings }]] = await pool.query('SELECT IFNULL(SUM(total_amount), 0) AS totalEarnings FROM orders');


        const [recentOrders] = await pool.query(`
        SELECT o.*, u.username 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    LIMIT 5`);

        res.json({
            totalProducts,
            totalCategories,
            totalUsers,
            totalOrders,
            recentOrders, totalEarnings

        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Products Management
app.get('/api/admin/products', isAdmin, async (req, res) => {
    try {
        const [products] = await pool.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.post('/api/admin/products', isAdmin, async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, stock_quantity } = req.body;
        const [result] = await pool.query(
            'INSERT INTO products (name, description, price, category_id, image_url, stock_quantity) VALUES (?, ?, ?, ?, ?, ?)',
            [name, description, price, category_id, image_url, stock_quantity]
        );
        res.status(201).json({
            id: result.insertId,
            name,
            description,
            price,
            category_id,
            image_url,
            stock_quantity
        });
    } catch (err) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

app.put('/api/admin/products/:id', isAdmin, async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, stock_quantity } = req.body;
        await pool.query(
            'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image_url = ?, stock_quantity = ? WHERE id = ?',
            [name, description, price, category_id, image_url, stock_quantity, req.params.id]
        );
        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

app.delete('/api/admin/products/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
        console.log(err);

    }
});

// Users Management
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, username, email, role, created_at FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.put('/api/admin/users/:id/role', isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});

app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
        console.log(err);

    }
});

// Orders Management
app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
        const [orders] = await pool.query(`
      SELECT o.*, u.username 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

        const ordersWithItems = await Promise.all(orders.map(async order => {
            const [items] = await pool.query(`
        SELECT oi.*, p.name, p.image_url 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
            return { ...order, items };
        }));

        res.json(ordersWithItems);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

app.put('/api/admin/orders/:id/status', isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        let timestampColumn = null;

        // Determine which timestamp column to update based on status
        switch (status) {
            case 'processing':
                timestampColumn = 'processing_at';
                break;
            case 'shipped':
                timestampColumn = 'shipped_at';
                break;
            case 'delivered':
                timestampColumn = 'delivered_at';
                break;
            default:
                timestampColumn = null; // No timestamp for other statuses
        }

        if (timestampColumn) {
            await pool.query(
                `UPDATE orders SET status = ?, ${timestampColumn} = NOW() WHERE id = ?`,
                [status, req.params.id]
            );
        } else {
            await pool.query(
                'UPDATE orders SET status = ? WHERE id = ?',
                [status, req.params.id]
            );
        }

        res.json({ message: 'Order status updated successfully' });
    } catch (err) {
        console.error('Error updating order status:', err);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

app.get("/api/rewards/", isAuthenticated, async (req, res) => {
    const [[reward]] = await pool.query(
        "SELECT points FROM user_rewards WHERE user_id = ?",
        [req.user.id]
    );
    res.json({ points: reward?.points || 0 });
});

// Get reward history
app.get("/api/rewards/history", isAuthenticated, async (req, res) => {
    const [rows] = await pool.query(
        "SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
    );
    res.json(rows);
});

// Earn points (after purchase etc.)
app.post("/api/rewards/earn", isAuthenticated, async (req, res) => {
    const { points, description } = req.body;

    await pool.query(
        `INSERT INTO user_rewards (user_id, points)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
        [req.user.id, points]
    );

    await pool.query(
        `INSERT INTO reward_transactions (user_id, points, type, description)
     VALUES (?, ?, 'earn', ?)`,
        [req.user.id, points, description || "Points earned"]
    );

    res.json({ message: "Points added successfully!" });
});

// Redeem points
app.post("/api/rewards/redeem", isAuthenticated, async (req, res) => {
    const { points, description } = req.body;

    const [[reward]] = await pool.query(
        "SELECT points FROM user_rewards WHERE user_id = ?",
        [req.user.id]
    );

    if (!reward || reward.points < points) {
        return res.status(400).json({ message: "Not enough points" });
    }

    await pool.query(
        "UPDATE user_rewards SET points = points - ? WHERE user_id = ?",
        [points, req.user.id]
    );

    await pool.query(
        `INSERT INTO reward_transactions (user_id, points, type, description)
     VALUES (?, ?, 'redeem', ?)`,
        [req.user.id, -points, description || "Redeemed points"]
    );

    res.json({ message: "Points redeemed!" });
});

// Spin-the-wheel
// app.post("/api/rewards/spin", isAuthenticated, async (req, res) => {
//     try {
//         // Check if user has spun today
//         const [[lastSpin]] = await pool.query(
//             "SELECT created_at FROM spin_rewards WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
//             [req.user.id]
//         );

//         if (lastSpin && new Date(lastSpin.created_at).toDateString() === new Date().toDateString()) {
//             return res.status(400).json({ message: "You already used your daily spin!" });
//         }

//         // Define reward pool
//         const rewards = [
//             { type: "points", value: 10 },
//             { type: "points", value: 50 },
//             { type: "discount", value: "10%" },
//             { type: "free_item", value: "Coffee Mug" },
//             { type: "points", value: 100 }
//         ];

//         // Randomly select a reward
//         const reward = rewards[Math.floor(Math.random() * rewards.length)];

//         // Insert spin reward into the database
//         await pool.query(
//             "INSERT INTO spin_rewards (user_id, reward_type, reward_value) VALUES (?, ?, ?)",
//             [req.user.id, reward.type, reward.value]
//         );

//         // Handle points reward
//         if (reward.type === "points") {
//             await pool.query(
//                 `INSERT INTO user_rewards (user_id, points)
//                 VALUES (?, ?)
//                 ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
//                 [req.user.id, reward.value]
//             );

//             await pool.query(
//                 `INSERT INTO reward_transactions (user_id, points, type, description)
//                 VALUES (?, ?, 'bonus', 'Spin-the-Wheel reward')`,
//                 [req.user.id, reward.value]
//             );
//         }

//         // Send response with the reward
//         res.json({ reward });

//     } catch (err) {
//         console.error("Error occurred:", err);
//         return res.status(500).json({ message: "Something went wrong, please try again later." });
//     }
// });
app.post("/api/rewards/spin", isAuthenticated, async (req, res) => {
    try {
        // Check daily spin limit
        const [[lastSpin]] = await pool.query(
            "SELECT created_at FROM spin_rewards WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
            [req.user.id]
        );

        if (lastSpin && new Date(lastSpin.created_at).toDateString() === new Date().toDateString()) {
            return res.status(400).json({ message: "You already used your daily spin!" });
        }

        // Reward pool (only points + better luck option)
        const rewards = [
            { type: "points", value: 10 },
            { type: "points", value: 20 },
            { type: "points", value: 50 },
            { type: "none", value: 0 } // 🎯 Better luck next time
        ];

        // Random reward
        const reward = rewards[Math.floor(Math.random() * rewards.length)];

        // Save spin result
        await pool.query(
            "INSERT INTO spin_rewards (user_id, reward_type, reward_value) VALUES (?, ?, ?)",
            [req.user.id, reward.type, reward.value]
        );

        // If points, add to user account
        if (reward.type === "points") {
            await pool.query(
                `INSERT INTO user_rewards (user_id, points)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
                [req.user.id, reward.value]
            );

            await pool.query(
                `INSERT INTO reward_transactions (user_id, points, type, description)
                VALUES (?, ?, 'bonus', 'Spin-the-Wheel reward')`,
                [req.user.id, reward.value]
            );
        }

        res.json({ reward });

    } catch (err) {
        console.error("Spin error:", err);
        return res.status(500).json({ message: "Something went wrong, please try again later." });
    }
});

app.get('/api/analytics/summary', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Total Spend
        const [totalSpend] = await pool.query(
            `SELECT IFNULL(SUM(final_amount),0) AS total_spend
             FROM orders WHERE user_id = ?`,
            [userId]
        );

        // 2. Monthly Spend (YYYY-MM)
        const [monthlySpend] = await pool.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                    CAST(SUM(final_amount) AS DECIMAL(10,2)) AS amount
             FROM orders
             WHERE user_id = ?
             GROUP BY month
             ORDER BY month ASC`,
            [userId]
        );

        // 3. Top Categories (force numeric qty)
        const [categories] = await pool.query(
            `SELECT c.name AS category,
                    CAST(SUM(oi.quantity) AS UNSIGNED) AS total_qty
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN categories c ON p.category_id = c.id
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = ?
             GROUP BY c.name
             ORDER BY total_qty DESC
             LIMIT 5`,
            [userId]
        );

        // 4. Savings (discounts + redeemed points)
        const [discountSavings] = await pool.query(
            `SELECT IFNULL(SUM(discount_amount),0) AS discount_savings
             FROM orders WHERE user_id = ?`,
            [userId]
        );

        const [redeemed] = await pool.query(
            `SELECT IFNULL(SUM(points),0) AS redeemed_points
             FROM reward_transactions
             WHERE user_id = ? AND type = 'redeem'`,
            [userId]
        );

        res.json({
            totalSpend: Number(totalSpend[0].total_spend),
            monthlySpend: monthlySpend.map(row => ({
                month: row.month,
                amount: Number(row.amount)
            })),
            topCategories: categories.map(row => ({
                category: row.category,
                total_qty: Number(row.total_qty)
            })),
            savings: {
                discounts: Number(discountSavings[0].discount_savings),
                redeemedPoints: Number(redeemed[0].redeemed_points)
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching analytics" });
    }
});

app.post('/api/price-alerts', isAuthenticated, async (req, res) => {
    const { product_id, target_price } = req.body;
    const user_id = req.user.id;

    if (!product_id || !target_price) {
        return res.status(400).json({ message: 'Product ID and target price are required' });
    }

    try {
        // Check if alert already exists
        const [[existing]] = await pool.query(
            'SELECT * FROM price_alerts WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing) {
            return res.status(400).json({ message: 'Price alert already exists for this product' });
        }

        // Insert new alert
        await pool.query(
            'INSERT INTO price_alerts (user_id, product_id, target_price) VALUES (?, ?, ?)',
            [user_id, product_id, target_price]
        );

        res.status(201).json({ message: 'Price alert set successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
app.get('/api/price-alerts', isAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id; // assuming you have user ID in req.user


        const [alerts] = await pool.query(
            `SELECT pa.id, pa.product_id, pa.target_price, pa.notified, pa.created_at, 
                    p.name, p.price AS current_price, p.image_url
             FROM price_alerts pa
             JOIN products p ON pa.product_id = p.id
             WHERE pa.user_id = ?`,
            [userId]
        );


        res.json(alerts); // send array of alerts
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch price alerts' });
    }
});
app.put('/api/price-alerts/:id', isAuthenticated, async (req, res) => {
    const alertId = req.params.id;
    const { target_price } = req.body;

    if (!target_price) {
        return res.status(400).json({ message: 'Target price is required' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE price_alerts SET target_price = ? WHERE id = ?',
            [target_price, alertId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Price alert not found' });
        }

        // Return updated alert
        const [rows] = await pool.query('SELECT * FROM price_alerts WHERE id = ?', [alertId]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/price-alerts/:id', async (req, res) => {
    const alertId = req.params.id;

    try {
        const [result] = await pool.query(
            'DELETE FROM price_alerts WHERE id = ?',
            [alertId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Price alert not found' });
        }

        res.json({ message: 'Price alert deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});



// Function to send notification (console/email)
const sendNotification = async (email, productName, currentPrice, targetPrice) => {
    console.log(`ALERT: ${email} - ${productName} price dropped to ₹${currentPrice} (target was ₹${targetPrice})`);

    // Optional: Use nodemailer to send real emails
    /*
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Price Alert: ${productName}`,
        text: `The price of ${productName} dropped to ₹${currentPrice}. Your target price was ₹${targetPrice}.`
    });
    */
};

// Function to check price alerts for a product
const checkPriceAlerts = async (productId) => {
    try {
        const [productRows] = await pool.query('SELECT price, name FROM products WHERE id = ?', [productId]);
        const product = productRows[0];
        if (!product) return;

        const [alerts] = await pool.query(`
            SELECT pa.id, pa.user_id, pa.target_price, u.email
            FROM price_alerts pa
            JOIN users u ON pa.user_id = u.id
            WHERE pa.product_id = ? AND pa.notified = 0
        `, [productId]);

        for (let alert of alerts) {
            if (product.price <= alert.target_price) {
                await sendNotification(alert.email, product.name, product.price, alert.target_price);
                await pool.query('UPDATE price_alerts SET notified = 1 WHERE id = ?', [alert.id]);
            }
        }
    } catch (err) {
        console.error('Error checking price alerts:', err);
    }
};

// Cron job: runs every minute
cron.schedule('0 0 */12 * * *', async () => {
    try {
        const [products] = await pool.query('SELECT id, price, base_price FROM products');

        for (let product of products) {
            const basePrice = product.base_price;

            const randomFactor = Math.random();
            let changePercent;

            // 30% chance for a small increase (profit), 70% chance for a decrease (sale)
            if (randomFactor < 0.3) {
                // Increase between 0% to +2%
                changePercent = Math.random() * 0.02; // 0 to 0.02
            } else {
                // Decrease between -5% to 0%
                changePercent = -(Math.random() * 0.10); // -0.05 to 0
            }

            // Calculate new price from base_price
            const newPrice = Math.max(1, +(basePrice * (1 + changePercent)).toFixed(2));
            // Update product price
            await pool.query('UPDATE products SET price = ? WHERE id = ?', [newPrice, product.id]);

            // Check price alerts for this product
            await checkPriceAlerts(product.id);
        }

        console.log('Prices updated and alerts checked successfully');
    } catch (err) {
        console.error('Error updating prices:', err);
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});