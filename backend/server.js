
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
import nodemailer from "nodemailer";
import Sentiment from 'sentiment';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
app.use(cookieParser());
function createNewPool() {
    return mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "aa",
        database: process.env.DB_NAME || "ShopNestaa",

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,

        // 🔥 Increased timeouts
        connectTimeout: 20000,   // 20 seconds
        acquireTimeout: 20000,   // 20 seconds
    });
}

// ------------------------------
// GLOBAL POOL INSTANCE
// ------------------------------
let pool = createNewPool();

// ------------------------------
// AUTO-RECONNECT LOGIC
// ------------------------------
pool.on("error", (err) => {
    console.error("💥 MySQL Pool Error:", err.code);

    if (
        err.code === "PROTOCOL_CONNECTION_LOST" ||
        err.code === "ECONNRESET" ||
        err.code === "ETIMEDOUT" ||
        err.code === "ERR_SOCKET_BAD_PORT"
    ) {
        console.log("♻️ Recreating MySQL pool...");
        pool = createNewPool();
    }
});

// ------------------------------
// SAFE QUERY WRAPPER (GLOBAL)
// ------------------------------
export async function safeQuery(sql, params = []) {
    const MAX_RETRY = 3;
    for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
        try {
            return await pool.query(sql, params);
        } catch (err) {
            console.error(`Query error (attempt ${attempt}/${MAX_RETRY}):`, err.code || err.message);

            if (
                err.code === "PROTOCOL_CONNECTION_LOST" ||
                err.code === "ECONNRESET" ||
                err.code === "ETIMEDOUT"
            ) {
                console.log("Recreating MySQL pool...");
                pool = createNewPool();
            }

            if (attempt === MAX_RETRY) throw err;

            await new Promise(res => setTimeout(res, 1000));
        }
    }
}/* inline safeQuery removed - using global safeQuery */

const sentiment = new Sentiment();
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
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-strong-secret';
const ACCESS_EXP = process.env.JWT_ACCESS_EXP || '15m';
const REFRESH_EXP = process.env.JWT_REFRESH_EXP || '7d';
function signAccessToken(user) {
    // include minimal user info
    const payload = { id: user.id, username: user.username, role: user.role, email: user.email };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXP });
}

function signRefreshToken(user) {
    const payload = { id: user.id };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXP });
}
async function storeRefreshToken(userId, token, expiresAt) {
    // Example: store token in table refresh_tokens
    await safeQuery('INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE token = ?, expires_at = ?',
        [userId, token, expiresAt, token, expiresAt]);
}

async function revokeRefreshToken(userId) {
    await safeQuery('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

async function getStoredRefreshToken(userId) {
    const [[row]] = await safeQuery('SELECT token FROM refresh_tokens WHERE user_id = ?', [userId]);
    return row?.token || null;
}

// Middleware to read access token either from Bearer header or cookie
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[0] === 'Bearer'
        ? authHeader.split(' ')[1]
        : (req.cookies?.accessToken);

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.user = payload;
        next();
    });
}

function isAdminJWT(req, res, next) {
    if (req.user && req.user.role === 'admin') return next();
    return res.status(403).json({ message: 'Forbidden' });
}
// Database connection

app.use(passport.initialize());
app.use(passport.session())
// Passport
passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const [users] = await safeQuery('SELECT * FROM users WHERE email = ?', [username]);
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
        const [users] = await safeQuery('SELECT * FROM users WHERE id = ?', [id]);
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

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, role = 'customer' } = req.body;

        // hash password for DB
        const hashedPassword = await bcrypt.hash(password, 10);

        await safeQuery(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, hashedPassword, role]
        );

        // Send welcome mail with original (unhashed) password
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ShopNest Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `🎉 Welcome to ShopNest, ${username}!`,
            html: `
            <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
              <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background:#0d6efd; color:#ffffff; padding:20px; text-align:center;">
                  <h1 style="margin:0; font-size:22px;">Welcome to ShopNest 🛒</h1>
                </div>

                <!-- Body -->
                <div style="padding:25px; color:#333;">
                  <h2 style="margin-bottom:10px; font-size:20px;">Hello, ${username} 👋</h2>
                  <p style="font-size:15px; margin-bottom:15px;">
                    Thanks for joining <b>ShopNest</b>. Your account has been created successfully.  
                  </p>

                  <div style="background:#fafafa; border:1px solid #eee; border-radius:10px; padding:15px; margin-bottom:20px;">
                    <p style="margin:6px 0;">📧 <b>Email:</b> ${email}</p>
                    <p style="margin:6px 0;">🔑 <b>Password:</b> ${password}</p>
                  </div>

                  <p style="margin:15px 0; font-size:15px;">
                    You can now log in and start exploring amazing deals!
                  </p>

                  <!-- CTA Button -->
                  <div style="text-align:center; margin:20px 0;">
                    <a href="https://shopnest.com/login" 
                       style="background:#0d6efd; color:#ffffff; padding:12px 24px; text-decoration:none; 
                              border-radius:8px; font-size:16px; font-weight:bold; display:inline-block;">
                       🔑 Login Now
                    </a>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background:#f1f1f1; color:#555; padding:15px; font-size:13px; text-align:center;">
                  <p style="margin:0;">Need help? <a href="https://shopnest.com/support" style="color:#0d6efd; text-decoration:none;">Contact Support</a></p>
                </div>
              </div>
            </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: 'User registered successfully & welcome email sent' });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username or email already exists' });
        }
        console.error('Register error:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});


app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await safeQuery('SELECT * FROM users WHERE email = ?', [username]); // keep same query as before
        if (users.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const user = users[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

        const accessToken = signAccessToken(user);
        const refreshToken = signRefreshToken(user);

        // Optionally store refresh token server-side
        const refreshExpSeconds = (process.env.JWT_REFRESH_EXP_SECONDS && parseInt(process.env.JWT_REFRESH_EXP_SECONDS)) || (7 * 24 * 60 * 60);
        const expiresAt = new Date(Date.now() + refreshExpSeconds * 1000);
        await storeRefreshToken(user.id, refreshToken, expiresAt);

        // Set cookies (HttpOnly)
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days for refresh token
        };

        // access token cookie shorter
        res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 15 }); // 15m
        res.cookie('refreshToken', refreshToken, cookieOptions);

        const safeUser = { id: user.id, username: user.username, email: user.email, role: user.role };
        return res.json({ success: true, message: 'Logged in', user: safeUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Login failed' });
    }
});

app.post('/api/auth/logout', authenticateJWT, async (req, res) => {
    try {
        await revokeRefreshToken(req.user.id);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.json({ success: true, message: 'Logged out' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Logout failed' });
    }
});
app.post('/api/auth/refresh', async (req, res) => {
    try {
        const token = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!token) return res.status(401).json({ message: 'No refresh token' });

        jwt.verify(token, JWT_SECRET, async (err, payload) => {
            if (err) return res.status(401).json({ message: 'Invalid refresh token' });
            const stored = await getStoredRefreshToken(payload.id);
            if (!stored || stored !== token) return res.status(401).json({ message: 'Refresh token revoked' });

            // Fetch user to create new access token payload (or use payload)
            const [users] = await safeQuery('SELECT id, username, email, role FROM users WHERE id = ?', [payload.id]);
            if (users.length === 0) return res.status(404).json({ message: 'User not found' });
            const user = users[0];

            const newAccess = signAccessToken(user);
            res.cookie('accessToken', newAccess, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 15
            });

            res.json({ success: true, accessToken: newAccess });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Refresh failed' });
    }
});

app.get('/api/auth/user', authenticateJWT, (req, res) => {
    res.json({ user: { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role } });
});

app.get('/api/productss', async (req, res) => {
    try {
        const [products] = await safeQuery(`
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

        const [products] = await safeQuery(query, params);
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});


app.get('/api/products/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        // Fetch product
        const [productRows] = await safeQuery(
            `SELECT * FROM products WHERE id = ?`,
            [productId]
        );

        if (productRows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = productRows[0];

        // Fetch average rating and review count
        const [reviewStatsRows] = await safeQuery(
            `SELECT 
                COALESCE(AVG(review_star), 0) AS average_rating, 
                COUNT(*) AS review_count 
             FROM product_reviews 
             WHERE product_id = ?`,
            [productId]
        );

        const reviewStats = reviewStatsRows[0];

        // Merge review info into product
        product.average_rating = Number(reviewStats.average_rating) || 0;
        product.review_count = Number(reviewStats.review_count) || 0;

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const [products] = await safeQuery('delete FROM products WHERE id = ?', [req.params.id]);
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
    const { name, description, price, base_price, category_id, image_url, stock_quantity } = req.body;

    try {
        const [result] = await safeQuery(
            `UPDATE products 
       SET name = ?, description = ?,price=?, base_price = ?, category_id = ?, image_url = ?, stock_quantity = ?
       WHERE id = ?`,
            [name, description, price, base_price, category_id, image_url, stock_quantity, id]
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
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await safeQuery('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.get('/api/categories/:categoryId', async (req, res) => {
    try {
        const [categories] = await safeQuery('SELECT * FROM categories WHERE id = ?', [req.params.categoryId]);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});
app.get('/api/products/categories/:categoryId', async (req, res) => {
    try {
        const [products] = await safeQuery('SELECT * FROM products WHERE category_id = ?', [req.params.categoryId]);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products by category' });
    }
});

// Cart Routes
app.get('/api/cart', isAuthenticated, async (req, res) => {
    try {
        const [carts] = await safeQuery('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);

        let cart;
        if (carts.length === 0) {
            const [result] = await safeQuery('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
            cart = { id: result.insertId, user_id: req.user.id };
        } else {
            cart = carts[0];
        }

        const [items] = await safeQuery(`
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
    const [items] = await safeQuery(`
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

        const [carts] = await safeQuery('SELECT * FROM carts WHERE user_id = ?', [req.user.id]);
        let cartId;

        if (carts.length === 0) {
            const [result] = await safeQuery('INSERT INTO carts (user_id) VALUES (?)', [req.user.id]);
            cartId = result.insertId;
        } else {
            cartId = carts[0].id;
        }

        const [existingItems] = await safeQuery(
            'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
            [cartId, productId]
        );

        if (existingItems.length > 0) {
            await safeQuery(
                'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
                [quantity, existingItems[0].id]
            );
        } else {
            await safeQuery(
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
        await safeQuery('UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
            [quantity, req.params.itemId, req.user.id]);
        res.json({ message: 'Cart item updated' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating cart item' });
    }
});

app.delete('/api/cart/remove/:itemId', isAuthenticated, async (req, res) => {
    try {
        await safeQuery('DELETE FROM cart_items WHERE id = ? AND cart_id IN (SELECT id FROM carts WHERE user_id = ?)',
            [req.params.itemId, req.user.id]);
        res.json({ message: 'Item removed from cart' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing item from cart' });
    }
});

// Wishlist Routes
app.get('/api/wishlist', isAuthenticated, async (req, res) => {
    try {
        const [items] = await safeQuery(`
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
        await safeQuery('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)',
            [req.user.id, productId]);
        res.json({ message: 'Product added to wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
});




app.delete('/api/wishlist/remove/:productId', isAuthenticated, async (req, res) => {
    try {
        await safeQuery('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]);
        res.json({ message: 'Product removed from wishlist' });
    } catch (err) {
        res.status(500).json({ message: 'Error removing from wishlist' });
    }
});

app.post('/api/orders/create', isAuthenticated, async (req, res) => {
    const { name, email, address, city, state, zip, paymentMethod, redeemPoints = 0, paymentStatus = 'pending' } = req.body;

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

        for (const item of cartItems) {
            if (item.quantity > item.stock_quantity) {
                return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
            }
        }

        const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;

        await conn.query('START TRANSACTION');

        if (redeemPoints > 0) {
            const [[reward]] = await conn.query("SELECT points FROM user_rewards WHERE user_id=?", [req.user.id]);

            if (!reward || reward.points < redeemPoints) {
                await conn.query("ROLLBACK");
                return res.status(400).json({ message: "Not enough reward points" });
            }

            discount = redeemPoints;
            await conn.query("UPDATE user_rewards SET points = points - ? WHERE user_id=?", [redeemPoints, req.user.id]);
            await conn.query(
                "INSERT INTO reward_transactions (user_id, points, type, description) VALUES (?, ?, 'redeem', 'Redeemed at checkout')",
                [req.user.id, -redeemPoints]
            );
        }

        const finalAmount = Math.max(totalAmount - discount, 0);

        // 🔹 INSERT ORDER with payment status
        const [orderResult] = await conn.query(
            `INSERT INTO orders (user_id, total_amount, discount_amount, final_amount, shipping_address, payment_method, payment_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, totalAmount, discount, finalAmount,
            `${name}, ${address}, ${city}, ${state} ${zip}`,
                paymentMethod, paymentStatus]
        );
        const orderId = orderResult.insertId;

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

        await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

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
            paymentStatus,
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
        const [orders] = await safeQuery(
            `SELECT id, user_id, total_amount, discount_amount, final_amount, status, shipping_address, payment_method, created_at, processing_at, shipped_at, delivered_at
             FROM orders
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        const ordersWithItems = await Promise.all(
            orders.map(async order => {
                const [items] = await safeQuery(
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
        const [orders] = await safeQuery(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orders.length === 0) {
            return res.status(403).json({ message: 'Order not found or you do not have permission to delete it.' });
        }

        // Delete the order (order_items will be deleted automatically due to ON DELETE CASCADE)
        await safeQuery('DELETE FROM orders WHERE id = ?', [orderId]);

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

        await safeQuery(updateQuery, params);
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
        const [categories] = await safeQuery('SELECT * FROM categories');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.post('/api/admin/categories', isAdmin, async (req, res) => {
    try {
        const { name, description } = req.body;
        const [result] = await safeQuery(
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
        await safeQuery(
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
        await safeQuery('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting category' });
        console.log(err);

    }
});
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const [[{ totalProducts }]] = await safeQuery('SELECT COUNT(*) AS totalProducts FROM products');
        const [[{ totalCategories }]] = await safeQuery('SELECT COUNT(*) AS totalCategories FROM categories');
        const [[{ totalUsers }]] = await safeQuery('SELECT COUNT(*) AS totalUsers FROM users');
        const [[{ totalOrders }]] = await safeQuery('SELECT COUNT(*) AS totalOrders FROM orders');
        const [[{ totalEarnings }]] = await safeQuery('SELECT IFNULL(SUM(total_amount), 0) AS totalEarnings FROM orders');


        const [recentOrders] = await safeQuery(`
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
        const [products] = await safeQuery('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id');
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.post('/api/admin/products', isAdmin, async (req, res) => {
    try {
        const { name, description, price, category_id, image_url, stock_quantity } = req.body;
        const [result] = await safeQuery(
            'INSERT INTO products (name, description, price, base_price, category_id, image_url, stock_quantity) VALUES (?, ?, ?,?, ?, ?, ?)',
            [name, description, price, price, category_id, image_url, stock_quantity]
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
        await safeQuery(
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
        await safeQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product' });
        console.log(err);

    }
});

// Users Management
app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
        const [users] = await safeQuery('SELECT id, username, email, role, created_at FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

app.put('/api/admin/users/:id/role', isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await safeQuery('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'User role updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating user role' });
    }
});

app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
        await safeQuery('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
        console.log(err);

    }
});

// Orders Management
app.get('/api/admin/orders', isAdmin, async (req, res) => {
    try {
        const [orders] = await safeQuery(`
      SELECT o.*, u.username 
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);

        const ordersWithItems = await Promise.all(orders.map(async order => {
            const [items] = await safeQuery(`
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
            await safeQuery(
                `UPDATE orders SET status = ?, ${timestampColumn} = NOW() WHERE id = ?`,
                [status, req.params.id]
            );
        } else {
            await safeQuery(
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
    const [[reward]] = await safeQuery(
        "SELECT points FROM user_rewards WHERE user_id = ?",
        [req.user.id]
    );
    res.json({ points: reward?.points || 0 });
});

// Get reward history
app.get("/api/rewards/history", isAuthenticated, async (req, res) => {
    const [rows] = await safeQuery(
        "SELECT * FROM reward_transactions WHERE user_id = ? ORDER BY created_at DESC",
        [req.user.id]
    );
    res.json(rows);
});

// Earn points (after purchase etc.)
app.post("/api/rewards/earn", isAuthenticated, async (req, res) => {
    const { points, description } = req.body;

    await safeQuery(
        `INSERT INTO user_rewards (user_id, points)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
        [req.user.id, points]
    );

    await safeQuery(
        `INSERT INTO reward_transactions (user_id, points, type, description)
     VALUES (?, ?, 'earn', ?)`,
        [req.user.id, points, description || "Points earned"]
    );

    res.json({ message: "Points added successfully!" });
});

// Redeem points
app.post("/api/rewards/redeem", isAuthenticated, async (req, res) => {
    const { points, description } = req.body;

    const [[reward]] = await safeQuery(
        "SELECT points FROM user_rewards WHERE user_id = ?",
        [req.user.id]
    );

    if (!reward || reward.points < points) {
        return res.status(400).json({ message: "Not enough points" });
    }

    await safeQuery(
        "UPDATE user_rewards SET points = points - ? WHERE user_id = ?",
        [points, req.user.id]
    );

    await safeQuery(
        `INSERT INTO reward_transactions (user_id, points, type, description)
     VALUES (?, ?, 'redeem', ?)`,
        [req.user.id, -points, description || "Redeemed points"]
    );

    res.json({ message: "Points redeemed!" });
});

app.post("/api/rewards/spin", isAuthenticated, async (req, res) => {
    try {
        // Check daily spin limit
        const [[lastSpin]] = await safeQuery(
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
        await safeQuery(
            "INSERT INTO spin_rewards (user_id, reward_type, reward_value) VALUES (?, ?, ?)",
            [req.user.id, reward.type, reward.value]
        );

        // If points, add to user account
        if (reward.type === "points") {
            await safeQuery(
                `INSERT INTO user_rewards (user_id, points)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE points = points + VALUES(points)`,
                [req.user.id, reward.value]
            );

            await safeQuery(
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
        const [totalSpend] = await safeQuery(
            `SELECT IFNULL(SUM(final_amount),0) AS total_spend
             FROM orders WHERE user_id = ?`,
            [userId]
        );

        // 2. Monthly Spend (YYYY-MM)
        const [monthlySpend] = await safeQuery(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
                    CAST(SUM(final_amount) AS DECIMAL(10,2)) AS amount
             FROM orders
             WHERE user_id = ?
             GROUP BY month
             ORDER BY month ASC`,
            [userId]
        );

        // 3. Top Categories (force numeric qty)
        const [categories] = await safeQuery(
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
        const [discountSavings] = await safeQuery(
            `SELECT IFNULL(SUM(discount_amount),0) AS discount_savings
             FROM orders WHERE user_id = ?`,
            [userId]
        );

        const [redeemed] = await safeQuery(
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
        const [[existing]] = await safeQuery(
            'SELECT * FROM price_alerts WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );

        if (existing) {
            return res.status(400).json({ message: 'Price alert already exists for this product' });
        }

        // Insert new alert
        await safeQuery(
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


        const [alerts] = await safeQuery(
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
        const [result] = await safeQuery(
            'UPDATE price_alerts SET target_price = ? WHERE id = ?',
            [target_price, alertId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Price alert not found' });
        }

        // Return updated alert
        const [rows] = await safeQuery('SELECT * FROM price_alerts WHERE id = ?', [alertId]);
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/price-alerts/:id', async (req, res) => {
    const alertId = req.params.id;

    try {
        const [result] = await safeQuery(
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


// cron.schedule("*/5 * * * *", async () => {
//     console.log("⏰ Checking price alerts...");

//     const [products] = await pool.query("SELECT id FROM products");
//     for (let product of products) {
//         await checkPriceAlerts(product.id);
//     }
// });
cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Checking price alerts...");

    // ---------- CONFIG ----------
    const QUERY_TIMEOUT = 20000;  // 20s timeout
    const RETRY_DELAY = 2000;     // retry after 2s
    const MAX_RETRY = 3;          // retry 3 times
    // ----------------------------

    // 🔒 Safe Query Wrapper (with timeout + retries)
    async /* inline safeQuery removed - using global safeQuery */


    try {
        // 1️⃣ KEEP-ALIVE: avoid idle connection drops
        try {
            await safeQuery("SELECT 1");
            console.log("🔗 MySQL Keep-alive OK");
        } catch (err) {
            console.error("⚠ MySQL Keep-alive failed:", err.code || err);
        }

        // 2️⃣ Read products with timeout + retry
        const [products] = await safeQuery("SELECT id FROM products");

        console.log(`📦 Found ${products.length} products`);

        // 3️⃣ Process each product safely
        for (let product of products) {
            try {
                await checkPriceAlerts(product.id);
            } catch (err) {
                console.error(`⚠ Error running checkPriceAlerts for product ${product.id}:`, err);
            }
        }

        console.log("✅ Price alert cron finished.");

    } catch (err) {
        console.error("🚨 CRON FAILED:", err);
    }
});
const sendNotification = async (email, productName, currentPrice, targetPrice) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // your Gmail
                pass: process.env.EMAIL_PASS  // your App Password
            }
        });

        // Email content
        const mailOptions = {
            from: `"ShopNest Alerts" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `📉 Price Alert: ${productName} is now ₹${currentPrice}!`,
            html: `
    <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:#0d6efd; color:#ffffff; padding:20px; text-align:center;">
          <h1 style="margin:0; font-size:22px;">ShopNest Price Alert 🔔</h1>
        </div>

        <!-- Body -->
        <div style="padding:25px; text-align:center; color:#333;">
          <h2 style="margin-bottom:10px; font-size:20px;">Good News! 🎉</h2>
          <p style="font-size:16px; margin-bottom:20px;">
            The price of <b style="color:#0d6efd;">${productName}</b> has dropped!
          </p>

          <div style="display:inline-block; padding:15px 25px; border:1px solid #eee; border-radius:10px; background:#fafafa; margin-bottom:20px;">
            <p style="margin:8px 0; font-size:16px;">💰 Current Price: <b style="color:green;">₹${currentPrice}</b></p>
            <p style="margin:8px 0; font-size:16px;">🎯 Your Target Price: <b>₹${targetPrice}</b></p>
          </div>

          <p style="margin:20px 0; font-size:15px;">
            Don’t miss this deal — act fast before the price changes again!
          </p>

        </div>
      </div>
    </div>
    `
        };


        // Send mail
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${email}: ${info.messageId}`);
    } catch (err) {
        console.error("❌ Error sending email:", err);
    }
};

// Function to check price alerts for a product
const checkPriceAlerts = async (productId) => {
    try {
        const [productRows] = await safeQuery('SELECT price, name FROM products WHERE id = ?', [productId]);
        const product = productRows[0];
        if (!product) return;

        const [alerts] = await safeQuery(`
            SELECT pa.id, pa.user_id, pa.target_price, u.email
            FROM price_alerts pa
            JOIN users u ON pa.user_id = u.id
            WHERE pa.product_id = ? AND pa.notified = 0
        `, [productId]);

        for (let alert of alerts) {
            if (product.price <= alert.target_price) {
                await sendNotification(alert.email, product.name, product.price, alert.target_price);
                await safeQuery('UPDATE price_alerts SET notified = 1 WHERE id = ?', [alert.id]);
            }
        }
    } catch (err) {
        console.error('Error checking price alerts:', err);
    }
};

// Cron job: runs every minute
cron.schedule('*/4 * * * *', async () => {
    try {
        const [products] = await safeQuery('SELECT id, price, base_price FROM products');

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
            await safeQuery('UPDATE products SET price = ? WHERE id = ?', [newPrice, product.id]);

            // Check price alerts for this product
            await checkPriceAlerts(product.id);
        }

        console.log('Prices updated and alerts checked successfully');
    } catch (err) {
        console.error('Error updating prices:', err);
    }
});
app.get('/api/products/:id/reviews', async (req, res) => {
    const productId = req.params.id;

    try {
        const [reviews] = await safeQuery(
            `SELECT r.id, r.review_star, r.review_text, r.created_at, 
              r.sentiment_score, u.username AS user_name
       FROM product_reviews r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json(reviews);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new review with automatic sentiment scoring
app.post('/api/products/:id/reviews', isAuthenticated, async (req, res) => {
    const productId = req.params.id;
    const { star, text } = req.body;
    const userId = req.user.id;

    if (!star || star < 1 || star > 5) {
        return res.status(400).json({ message: 'Star rating must be between 1 and 5' });
    }

    try {
        // 1️⃣ Analyze sentiment of the review text
        let sentimentScore = 0;
        if (text && text.trim()) {
            const analysis = sentiment.analyze(text);
            sentimentScore = Math.max(-1, Math.min(1, analysis.comparative)); // normalize
        }

        // 2️⃣ Insert review and sentiment score
        await safeQuery(
            `INSERT INTO product_reviews (product_id, user_id, review_star, review_text, sentiment_score)
       VALUES (?, ?, ?, ?, ?)`,
            [productId, userId, star, text, sentimentScore]
        );

        res.status(201).json({
            message: 'Review submitted successfully',
            sentiment: sentimentScore,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ===================== SENTIMENT-BASED RECOMMENDATIONS =====================

app.get('/api/recommendations/sentiment-based/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        // 1️⃣ Find category of the current product
        const [prodCat] = await safeQuery('SELECT category_id FROM products WHERE id = ?', [productId]);
        if (!prodCat.length) return res.json([]);

        const category = prodCat[0].category_id;

        // 2️⃣ Find other products in same category with high positive sentiment
        const [recommended] = await safeQuery(`
      SELECT p.id, p.name, p.price, p.image_url,
             AVG(r.review_star) AS avg_rating,
             AVG(r.sentiment_score) AS avg_sentiment
      FROM products p
      JOIN product_reviews r ON p.id = r.product_id
      WHERE p.category_id = ? AND p.id != ?
      GROUP BY p.id
      HAVING avg_rating >= 4 AND avg_sentiment > 0.3
      ORDER BY avg_sentiment DESC
      LIMIT 10;
    `, [category, productId]);

        res.json(recommended);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching sentiment-based recommendations' });
    }
});

// ================= USER ACTIVITY + HISTORY + RECOMMENDATIONS =================

// Track when a logged-in user views a product
app.post('/api/user/track-view', isAuthenticated, async (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: "Product ID required" });

    try {
        await safeQuery(
            "INSERT INTO user_activity (user_id, product_id, action) VALUES (?, ?, 'view')",
            [req.user.id, product_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error tracking view:", err);
        res.status(500).json({ message: "Error tracking view" });
    }
});
app.post('/api/user/track-cart', isAuthenticated, async (req, res) => {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: "Product ID required" });

    try {
        await safeQuery(
            "INSERT INTO user_activity (user_id, product_id, action) VALUES (?, ?, 'add_to_cart')",
            [req.user.id, product_id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("Error tracking view:", err);
        res.status(500).json({ message: "Error tracking view" });
    }
});

// Get recently viewed products
app.get('/api/user/history', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await safeQuery(`
      SELECT p.id, p.name, p.price, p.image_url, c.name AS category_name, MAX(ua.created_at) AS last_viewed
      FROM user_activity ua
      JOIN products p ON ua.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ua.user_id = ? AND ua.action = 'view'
      GROUP BY p.id
      ORDER BY last_viewed DESC
      LIMIT 10
    `, [req.user.id]);

        res.json(rows);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ message: "Error fetching history" });
    }
});

// Recommend products based on viewed categories
app.get('/api/recommendations', isAuthenticated, async (req, res) => {
    try {
        // Find top 3 most-viewed categories for the user
        const [cats] = await safeQuery(`
      SELECT p.category_id, COUNT(*) AS views
      FROM user_activity ua
      JOIN products p ON ua.product_id = p.id
      WHERE ua.user_id = ? AND ua.action = 'view'
      GROUP BY p.category_id
      ORDER BY views DESC
      LIMIT 3
    `, [req.user.id]);

        if (cats.length === 0) {
            const [recent] = await safeQuery("SELECT * FROM products ORDER BY created_at DESC LIMIT 10");
            return res.json(recent);
        }

        const categoryIds = cats.map(c => c.category_id);
        const placeholders = categoryIds.map(() => '?').join(',');
        const [recommended] = await safeQuery(`
      SELECT p.id, p.name, p.price, p.image_url, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id IN (${placeholders})
      ORDER BY RAND()
      LIMIT 10
    `, categoryIds);

        res.json(recommended);
    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
});


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});
