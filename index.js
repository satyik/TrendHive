const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const connect_flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware Setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}


// Session & Flash Messages
app.use(
    session({
        secret: process.env.JWT_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        },
    })
);
app.use(connect_flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
const indexRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const ecomRoutes = require('./routes/ecom');

app.use('/', indexRoutes);
app.use('/user', userRoutes);
app.use('/', ecomRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌', err.stack);
    res.status(500).send('Internal Server Error');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
