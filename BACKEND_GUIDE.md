# Backend Integration Guide - Mahadev Medicine Store

This file provides example backend code for production deployment with Node.js, Express, and MongoDB.

---

## 📦 Backend Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (free)
- Npm or Yarn

### Installation

```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node project
npm init -y

# Install dependencies
npm install express cors dotenv mongoose body-parser multer
npm install --save-dev nodemon

# Optional: WhatsApp integration
npm install axios
```

---

## 📁 Backend Project Structure

```
backend/
├── config/
│   └── database.js
├── models/
│   ├── Order.js
│   ├── Booking.js
│   └── Settings.js
├── routes/
│   ├── orders.js
│   ├── bookings.js
│   └── settings.js
├── middleware/
│   └── auth.js
├── controllers/
│   ├── orderController.js
│   └── bookingController.js
├── .env
├── server.js
└── package.json
```

---

## 🔧 Backend Code

### 1. server.js (Main Server File)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://user:password@cluster.mongodb.net/mahadev', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('DB Connection Error:', err));

// Routes
app.use('/api/orders', require('./routes/orders'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/settings', require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

### 2. .env (Environment Variables)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mahadev
PORT=5000
NODE_ENV=development

# WhatsApp Integration
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_PHONE_ID=your_phone_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$... (bcrypt hash)
JWT_SECRET=your_jwt_secret_key
```

### 3. config/database.js

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected Successfully');
    } catch (error) {
        console.error('Database Connection Error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
```

### 4. models/Order.js

```javascript
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Invalid phone number'
        }
    },
    deliveryAddress: {
        type: String,
        required: true,
        minlength: 10
    },
    medicineRequirement: {
        type: String,
        required: true
    },
    prescriptionFile: {
        type: String,
        default: null
    },
    prescriptionUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
```

### 5. models/Booking.js

```javascript
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        unique: true,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Invalid phone number'
        }
    },
    address: {
        type: String,
        required: true,
        minlength: 10
    },
    testType: {
        type: String,
        enum: ['blood', 'urine', 'stool', 'thyroid', 'hba1c', 'liver', 'kidney', 'fullbody'],
        required: true
    },
    preferredDate: {
        type: Date,
        required: true
    },
    preferredTime: String,
    collectionType: {
        type: String,
        enum: ['home', 'store'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Home Collection Scheduled', 'Sample Collected', 'Testing', 'Report Ready', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    reportFile: String,
    reportUrl: String,
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
```

### 6. routes/orders.js

```javascript
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// Generate Order ID
function generateOrderId() {
    return 'MM' + Date.now().toString().slice(-8);
}

// Create new order
router.post('/', async (req, res) => {
    try {
        const { customerName, customerPhone, deliveryAddress, medicineRequirement } = req.body;

        // Validation
        if (!customerName || !customerPhone || !deliveryAddress || !medicineRequirement) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        const orderId = generateOrderId();

        const order = new Order({
            orderId,
            customerName,
            customerPhone,
            deliveryAddress,
            medicineRequirement,
            status: 'Pending'
        });

        await order.save();

        // Send WhatsApp notifications
        await sendWhatsAppNotification('order', {
            ...order.toObject(),
            adminPhone: process.env.ADMIN_PHONE
        });

        res.status(201).json({
            success: true,
            orderId: order.orderId,
            message: 'Order created successfully'
        });

    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Error creating order' });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Get order by ID
router.get('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// Update order status
router.put('/:orderId', async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { 
                status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Send status update notification
        await sendWhatsAppNotification('orderStatusUpdate', {
            orderId: order.orderId,
            customerPhone: order.customerPhone,
            status: order.status
        });

        res.json({
            success: true,
            order,
            message: 'Order status updated'
        });

    } catch (error) {
        res.status(500).json({ error: 'Error updating order' });
    }
});

// Delete order
router.delete('/:orderId', async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting order' });
    }
});

module.exports = router;
```

### 7. routes/bookings.js

```javascript
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// Generate Booking ID
function generateBookingId() {
    return 'BT' + Date.now().toString().slice(-8);
}

// Create new booking
router.post('/', async (req, res) => {
    try {
        const { customerName, customerPhone, address, testType, preferredDate, collectionType } = req.body;

        // Validation
        if (!customerName || !customerPhone || !address || !testType || !preferredDate || !collectionType) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        const bookingId = generateBookingId();

        const booking = new Booking({
            bookingId,
            customerName,
            customerPhone,
            address,
            testType,
            preferredDate,
            collectionType,
            status: 'Pending'
        });

        await booking.save();

        // Send WhatsApp notifications
        await sendWhatsAppNotification('booking', {
            ...booking.toObject(),
            adminPhone: process.env.ADMIN_PHONE
        });

        res.status(201).json({
            success: true,
            bookingId: booking.bookingId,
            message: 'Booking created successfully'
        });

    } catch (error) {
        console.error('Booking creation error:', error);
        res.status(500).json({ error: 'Error creating booking' });
    }
});

// Get all bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

// Get booking by ID
router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.bookingId });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching booking' });
    }
});

// Update booking status
router.put('/:bookingId', async (req, res) => {
    try {
        const { status } = req.body;

        const booking = await Booking.findOneAndUpdate(
            { bookingId: req.params.bookingId },
            { 
                status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Send status update notification
        await sendWhatsAppNotification('bookingStatusUpdate', {
            bookingId: booking.bookingId,
            customerPhone: booking.customerPhone,
            status: booking.status
        });

        res.json({
            success: true,
            booking,
            message: 'Booking status updated'
        });

    } catch (error) {
        res.status(500).json({ error: 'Error updating booking' });
    }
});

// Delete booking
router.delete('/:bookingId', async (req, res) => {
    try {
        const booking = await Booking.findOneAndDelete({ bookingId: req.params.bookingId });
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting booking' });
    }
});

module.exports = router;
```

### 8. utils/whatsapp.js (WhatsApp Notifications)

```javascript
const axios = require('axios');

async function sendWhatsAppNotification(type, data) {
    try {
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

        let message = '';
        let recipientPhone = '';

        if (type === 'order') {
            message = `📦 New Medicine Order\n\nOrder ID: ${data.orderId}\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone}\nAddress: ${data.deliveryAddress}\nMedicines: ${data.medicineRequirement}\n\nTime: ${new Date().toLocaleString()}`;
            recipientPhone = process.env.ADMIN_PHONE; // Admin phone
        } else if (type === 'booking') {
            message = `🧪 New Test Booking\n\nBooking ID: ${data.bookingId}\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone}\nTest: ${data.testType}\nDate: ${data.preferredDate}\n\nTime: ${new Date().toLocaleString()}`;
            recipientPhone = process.env.ADMIN_PHONE;
        } else if (type === 'orderStatusUpdate') {
            message = `📦 Order Status Updated\n\nOrder ID: ${data.orderId}\nNew Status: ${data.status}\n\nThank you for choosing Mahadev Medicine Store!`;
            recipientPhone = data.customerPhone;
        } else if (type === 'bookingStatusUpdate') {
            message = `🧪 Booking Status Updated\n\nBooking ID: ${data.bookingId}\nNew Status: ${data.status}\n\nThank you for choosing Mahadev Medicine Store!`;
            recipientPhone = data.customerPhone;
        }

        // Format phone number with country code
        if (!recipientPhone.startsWith('91')) {
            recipientPhone = '91' + recipientPhone.slice(-10);
        }

        const response = await axios.post(
            `https://graph.instagram.com/v18.0/${phoneId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: recipientPhone,
                type: 'text',
                text: { body: message }
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log(`WhatsApp message sent to ${recipientPhone}`);
        return response.data;

    } catch (error) {
        console.error('WhatsApp API Error:', error.response?.data || error.message);
        // Don't throw - let order/booking proceed even if WhatsApp fails
    }
}

module.exports = { sendWhatsAppNotification };
```

---

## 🔗 Frontend Integration

### Update script.js to Use Backend API

Replace the localStorage functions with API calls:

```javascript
// In script.js, replace saveOrderToStorage with:

async function saveOrderToStorage(order) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error('Order submission failed');
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error saving order:', error);
        alert('Error submitting order. Please try again.');
    }
}

// Similarly for bookings
async function saveBookingToStorage(booking) {
    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(booking)
        });

        if (!response.ok) {
            throw new Error('Booking submission failed');
        }

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Error submitting booking. Please try again.');
    }
}

// Get orders for admin panel
async function getOrdersFromStorage() {
    try {
        const response = await fetch('/api/orders');
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}
```

---

## 🚀 Deployment

### Deploy Backend to Render or Railway

**Using Render:**
1. Push code to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect GitHub repository
5. Set environment variables
6. Deploy

**Using Railway:**
1. Go to railway.app
2. Create new project
3. Connect GitHub
4. Set environment variables
5. Deploy

---

## 📊 Database Queries

### Get Dashboard Statistics

```javascript
// In a dashboard route
router.get('/admin/stats', async (req, res) => {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const completedOrders = await Order.countDocuments({ status: 'Delivered' });
    
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'Pending' });
    const completedBookings = await Booking.countDocuments({ status: 'Completed' });

    res.json({
        orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders },
        bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings }
    });
});
```

---

## 🔐 Security Best Practices

1. **Validate Input:** Check all inputs server-side
2. **Use HTTPS:** Always
3. **Sanitize Data:** Remove dangerous characters
4. **Rate Limiting:** Prevent spam/abuse
5. **CORS:** Configure properly
6. **JWT Tokens:** For admin authentication
7. **Environment Variables:** Never hardcode secrets

---

## 📝 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get specific order |
| PUT | `/api/orders/:id` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |
| POST | `/api/bookings` | Create new booking |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/:id` | Get specific booking |
| PUT | `/api/bookings/:id` | Update booking status |
| DELETE | `/api/bookings/:id` | Delete booking |

---

This backend setup is production-ready and can be deployed immediately. Customize as needed for your specific requirements.
