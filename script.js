// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const selectedPage = document.getElementById(pageId + '-page');
    if (selectedPage) {
        selectedPage.classList.add('active');
        window.scrollTo(0, 0);
    }

    // Close mobile menu
    closeNavMenu();
}

// ==================== MOBILE MENU ====================
const navToggle = document.getElementById('navToggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', function() {
    navMenu.classList.toggle('active');
});

function closeNavMenu() {
    navMenu.classList.remove('active');
}

// ==================== FORM VALIDATION ====================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
}

function showError(element, message) {
    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        element.parentElement.classList.add('error');
    }
}

function clearError(element) {
    const errorElement = element.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.classList.remove('show');
        element.parentElement.classList.remove('error');
    }
}

// ==================== MEDICINE ORDER FORM ====================
const medicineOrderForm = document.getElementById('medicineOrderForm');

medicineOrderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form elements
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const addressInput = document.getElementById('deliveryAddress');
    const medicineInput = document.getElementById('medicineRequirement');
    const prescriptionInput = document.getElementById('prescription');

    // Validate fields
    let isValid = true;

    // Name validation
    if (!nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name');
        isValid = false;
    } else if (nameInput.value.trim().length < 3) {
        showError(nameInput, 'Name must be at least 3 characters');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    // Phone validation
    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Please enter your phone number');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid 10-digit phone number');
        isValid = false;
    } else {
        clearError(phoneInput);
    }

    // Address validation
    if (!addressInput.value.trim()) {
        showError(addressInput, 'Please enter your delivery address');
        isValid = false;
    } else if (addressInput.value.trim().length < 10) {
        showError(addressInput, 'Address must be at least 10 characters');
        isValid = false;
    } else {
        clearError(addressInput);
    }

    // Medicine validation
    if (!medicineInput.value.trim()) {
        showError(medicineInput, 'Please enter medicine requirements');
        isValid = false;
    } else {
        clearError(medicineInput);
    }

    if (isValid) {
        // Create order object
        const orderId = generateOrderId();
        const order = {
            orderId: orderId,
            customerName: nameInput.value.trim(),
            customerPhone: phoneInput.value.trim(),
            deliveryAddress: addressInput.value.trim(),
            medicineRequirement: medicineInput.value.trim(),
            prescriptionFile: prescriptionInput.files[0] ? prescriptionInput.files[0].name : 'None',
            status: 'Pending',
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        saveOrderToStorage(order);

        // Show success popup
        showSuccessModal(
            'Order Submitted Successfully!',
            `Your Order ID: <strong>${orderId}</strong><br>We will contact you shortly at ${phoneInput.value}.`,
            orderId
        );

        // Send WhatsApp notifications (integrate with backend)
        sendWhatsAppNotification('order', order);

        // Reset form
        medicineOrderForm.reset();
        document.getElementById('filePreview').innerHTML = '';
    }
});

// ==================== BOOK DIAGNOSTIC TEST FORM ====================
const bookTestForm = document.getElementById('bookTestForm');

bookTestForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get form elements
    const nameInput = document.getElementById('testFullName');
    const phoneInput = document.getElementById('testPhone');
    const addressInput = document.getElementById('testAddress');
    const testInput = document.getElementById('testType');
    const dateInput = document.getElementById('testDate');
    const collectionInput = document.getElementById('collectionType');

    // Validate fields
    let isValid = true;

    // Name validation
    if (!nameInput.value.trim()) {
        showError(nameInput, 'Please enter your name');
        isValid = false;
    } else if (nameInput.value.trim().length < 3) {
        showError(nameInput, 'Name must be at least 3 characters');
        isValid = false;
    } else {
        clearError(nameInput);
    }

    // Phone validation
    if (!phoneInput.value.trim()) {
        showError(phoneInput, 'Please enter your phone number');
        isValid = false;
    } else if (!validatePhone(phoneInput.value)) {
        showError(phoneInput, 'Please enter a valid 10-digit phone number');
        isValid = false;
    } else {
        clearError(phoneInput);
    }

    // Address validation
    if (!addressInput.value.trim()) {
        showError(addressInput, 'Please enter your address');
        isValid = false;
    } else if (addressInput.value.trim().length < 10) {
        showError(addressInput, 'Address must be at least 10 characters');
        isValid = false;
    } else {
        clearError(addressInput);
    }

    // Test selection validation
    if (!testInput.value) {
        showError(testInput, 'Please select a test');
        isValid = false;
    } else {
        clearError(testInput);
    }

    // Date validation
    if (!dateInput.value) {
        showError(dateInput, 'Please select a date');
        isValid = false;
    } else {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(dateInput, 'Please select a future date');
            isValid = false;
        } else {
            clearError(dateInput);
        }
    }

    // Collection type validation
    if (!collectionInput.value) {
        showError(collectionInput, 'Please select collection type');
        isValid = false;
    } else {
        clearError(collectionInput);
    }

    if (isValid) {
        // Create booking object
        const bookingId = generateBookingId();
        const booking = {
            bookingId: bookingId,
            customerName: nameInput.value.trim(),
            customerPhone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            test: testInput.value,
            preferredDate: dateInput.value,
            collectionType: collectionInput.value,
            status: 'Pending',
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        saveBookingToStorage(booking);

        // Show success popup
        showSuccessModal(
            'Booking Confirmed Successfully!',
            `Your Booking ID: <strong>${bookingId}</strong><br>Our team will contact you shortly at ${phoneInput.value}.`,
            bookingId
        );

        // Send WhatsApp notifications
        sendWhatsAppNotification('booking', booking);

        // Reset form
        bookTestForm.reset();
    }
});

// ==================== FILE UPLOAD HANDLING ====================
const prescriptionInput = document.getElementById('prescription');
const filePreview = document.getElementById('filePreview');

prescriptionInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            prescriptionInput.value = '';
            filePreview.innerHTML = '';
            return;
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG, or PDF files are allowed');
            prescriptionInput.value = '';
            filePreview.innerHTML = '';
            return;
        }

        // Display file preview
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(event) {
                filePreview.innerHTML = `
                    <div style="text-align: center;">
                        <img src="${event.target.result}" alt="Preview" style="max-width: 150px; border-radius: 8px;">
                        <p style="color: var(--success); margin-top: 10px;">✓ ${file.name}</p>
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            filePreview.innerHTML = `
                <div style="text-align: center;">
                    <i class="fas fa-file-pdf" style="font-size: 50px; color: var(--primary-blue);"></i>
                    <p style="color: var(--success); margin-top: 10px;">✓ ${file.name}</p>
                </div>
            `;
        }
    }
});

// ==================== FAQ TOGGLE ====================
function toggleFAQ(element) {
    const faqItem = element.parentElement;
    const allFAQs = document.querySelectorAll('.faq-item');

    allFAQs.forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('active');
        }
    });

    faqItem.classList.toggle('active');
}

// ==================== MODAL FUNCTIONS ====================
function showSuccessModal(title, message, id, phoneNumber = '919938591914') {
    const modal = document.getElementById('successModal');
    const titleElement = document.getElementById('successTitle');
    const messageElement = document.getElementById('successMessage');
    const detailsElement = document.getElementById('modalDetails');
    const whatsappBtn = document.getElementById('whatsappNotifyBtn');

    titleElement.textContent = title;
    messageElement.innerHTML = message;

    // Add additional details
    detailsElement.innerHTML = `
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p style="margin-bottom: 0;"><strong>Next Steps:</strong> Our team will contact you shortly.</p>
    `;

    // Set WhatsApp notification link
    const whatsappMessage = `Hello, I have placed an order/booking. My ID is: ${id}. Please confirm.`;
    whatsappBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

    modal.classList.add('show');
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    if (event.target === modal) {
        modal.classList.remove('show');
    }
});

// ==================== FLOATING ACTION BUTTONS ====================
const backToTopButton = document.getElementById('backToTop');

// Show/hide back to top button
window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==================== DATA STORAGE FUNCTIONS ====================
function generateOrderId() {
    return 'MM' + Date.now().toString().slice(-8);
}

function generateBookingId() {
    return 'BT' + Date.now().toString().slice(-8);
}

function saveOrderToStorage(order) {
    let orders = JSON.parse(localStorage.getItem('medicineOrders')) || [];
    orders.push(order);
    localStorage.setItem('medicineOrders', JSON.stringify(orders));
}

function saveBookingToStorage(booking) {
    let bookings = JSON.parse(localStorage.getItem('diagnosticBookings')) || [];
    bookings.push(booking);
    localStorage.setItem('diagnosticBookings', JSON.stringify(bookings));
}

function getOrdersFromStorage() {
    return JSON.parse(localStorage.getItem('medicineOrders')) || [];
}

function getBookingsFromStorage() {
    return JSON.parse(localStorage.getItem('diagnosticBookings')) || [];
}

function updateOrderStatus(orderId, newStatus) {
    let orders = getOrdersFromStorage();
    orders = orders.map(order => {
        if (order.orderId === orderId) {
            order.status = newStatus;
            order.lastUpdated = new Date().toISOString();
        }
        return order;
    });
    localStorage.setItem('medicineOrders', JSON.stringify(orders));
}

function updateBookingStatus(bookingId, newStatus) {
    let bookings = getBookingsFromStorage();
    bookings = bookings.map(booking => {
        if (booking.bookingId === bookingId) {
            booking.status = newStatus;
            booking.lastUpdated = new Date().toISOString();
        }
        return booking;
    });
    localStorage.setItem('diagnosticBookings', JSON.stringify(bookings));
}

// ==================== WHATSAPP NOTIFICATIONS ====================
function sendWhatsAppNotification(type, data) {
    // This function should be integrated with your backend API
    // For now, we're logging the notification that would be sent
    
    if (type === 'order') {
        const adminMessage = `
📦 New Medicine Order

Order ID: ${data.orderId}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Address: ${data.deliveryAddress}
Medicines: ${data.medicineRequirement}
Prescription: ${data.prescriptionFile}
Time: ${new Date(data.timestamp).toLocaleString()}
        `;
        
        const customerMessage = `
Thank you for choosing Mahadev Medicine Store! 

Your Order ID: ${data.orderId}
We have received your request.
Our team will contact you shortly.

Business Hours: 8:00 AM - 10:30 PM Daily
        `;

        // Log for demo purposes
        console.log('Admin WhatsApp:', adminMessage);
        console.log('Customer WhatsApp:', customerMessage);

        // Integrate with your WhatsApp API:
        // sendToWhatsApp(adminPhone, adminMessage);
        // sendToWhatsApp(data.customerPhone, customerMessage);
    }

    if (type === 'booking') {
        const adminMessage = `
🧪 New Diagnostic Test Booking

Booking ID: ${data.bookingId}
Customer: ${data.customerName}
Phone: ${data.customerPhone}
Test: ${data.test}
Date: ${data.preferredDate}
Collection: ${data.collectionType}
Time: ${new Date(data.timestamp).toLocaleString()}
        `;

        const customerMessage = `
Booking Confirmation - Mahadev Medicine Store

Booking ID: ${data.bookingId}
Test: ${data.test}
Preferred Date: ${data.preferredDate}
Collection Type: ${data.collectionType}

Our team will contact you shortly to confirm.
        `;

        console.log('Admin WhatsApp:', adminMessage);
        console.log('Customer WhatsApp:', customerMessage);
    }
}

// ==================== ADMIN PANEL ====================
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123'; // In production, use secure authentication

function goToAdmin() {
    // Check if admin is logged in
    if (isAdminLoggedIn()) {
        showAdminPanel();
    } else {
        showAdminLogin();
    }
}

function isAdminLoggedIn() {
    return localStorage.getItem('adminLoggedIn') === 'true';
}

function showAdminLogin() {
    // Create admin login page
    const loginHTML = `
    <section id="admin-login-page" class="page active" style="padding: 60px 20px;">
        <div class="admin-login-container">
            <div class="admin-login-box">
                <div style="text-align: center; margin-bottom: 30px;">
                    <i class="fas fa-shield-alt" style="font-size: 50px; color: var(--primary-blue);"></i>
                    <h1 style="color: var(--primary-blue); margin-top: 15px;">Admin Panel</h1>
                </div>
                
                <form id="adminLoginForm">
                    <div class="form-field">
                        <label for="adminUsername">Username</label>
                        <input type="text" id="adminUsername" required placeholder="Enter username">
                    </div>
                    
                    <div class="form-field">
                        <label for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" required placeholder="Enter password">
                    </div>
                    
                    <button type="submit" class="btn btn-primary full-width">Login</button>
                    <button type="button" class="btn btn-secondary full-width" style="margin-top: 10px;" onclick="showPage('home')">Back to Home</button>
                </form>
                
                <p style="text-align: center; margin-top: 20px; color: var(--text-grey);">
                    Demo Credentials:<br>Username: admin<br>Password: admin123
                </p>
            </div>
        </div>
    </section>
    `;

    // Replace main content with login
    const main = document.querySelector('main');
    main.innerHTML = loginHTML + main.innerHTML;

    // Handle login form
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            location.reload();
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });
}

function showAdminPanel() {
    // Store current page
    const currentPages = document.querySelectorAll('.page');
    currentPages.forEach(page => page.classList.remove('active'));

    // Create admin panel HTML
    const adminHTML = `
    <section id="admin-panel" class="page active">
        <div class="admin-header">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 style="color: var(--white);">Admin Dashboard</h1>
                    <button class="btn btn-secondary" onclick="adminLogout()">Logout</button>
                </div>
            </div>
        </div>

        <div class="container" style="padding: 40px 0;">
            <div class="admin-tabs">
                <button class="admin-tab-button active" onclick="switchAdminTab('dashboard')">Dashboard</button>
                <button class="admin-tab-button" onclick="switchAdminTab('orders')">Medicine Orders</button>
                <button class="admin-tab-button" onclick="switchAdminTab('bookings')">Test Bookings</button>
                <button class="admin-tab-button" onclick="switchAdminTab('settings')">Settings</button>
            </div>

            <!-- Dashboard Tab -->
            <div id="dashboard-tab" class="admin-tab-content active">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number" id="totalOrders">0</div>
                        <div class="stat-label">Total Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="pendingOrders">0</div>
                        <div class="stat-label">Pending Orders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="totalBookings">0</div>
                        <div class="stat-label">Total Bookings</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number" id="pendingBookings">0</div>
                        <div class="stat-label">Pending Bookings</div>
                    </div>
                </div>

                <h3 style="margin-top: 40px; margin-bottom: 20px; color: var(--primary-blue);">Recent Orders</h3>
                <div id="recentOrders" style="background: white; border-radius: 8px; overflow: auto;"></div>

                <h3 style="margin-top: 40px; margin-bottom: 20px; color: var(--primary-blue);">Recent Bookings</h3>
                <div id="recentBookings" style="background: white; border-radius: 8px; overflow: auto;"></div>
            </div>

            <!-- Orders Tab -->
            <div id="orders-tab" class="admin-tab-content">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <input type="text" id="orderSearch" placeholder="Search by Order ID or Customer Name" style="flex: 1; padding: 10px; border: 2px solid var(--light-blue); border-radius: 8px;">
                    <button class="btn btn-primary" onclick="searchOrders()">Search</button>
                </div>
                <div id="ordersTable" style="background: white; border-radius: 8px; overflow: auto;"></div>
            </div>

            <!-- Bookings Tab -->
            <div id="bookings-tab" class="admin-tab-content">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <input type="text" id="bookingSearch" placeholder="Search by Booking ID or Customer Name" style="flex: 1; padding: 10px; border: 2px solid var(--light-blue); border-radius: 8px;">
                    <button class="btn btn-primary" onclick="searchBookings()">Search</button>
                </div>
                <div id="bookingsTable" style="background: white; border-radius: 8px; overflow: auto;"></div>
            </div>

            <!-- Settings Tab -->
            <div id="settings-tab" class="admin-tab-content">
                <div class="settings-form">
                    <h3 style="color: var(--primary-blue); margin-bottom: 20px;">Store Settings</h3>
                    
                    <div class="form-row">
                        <div class="form-field">
                            <label>Store Name</label>
                            <input type="text" id="storeName" value="Mahadev Medicine Store">
                        </div>
                        <div class="form-field">
                            <label>Phone</label>
                            <input type="tel" id="storePhone" value="+91 99385 91914">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>WhatsApp Number</label>
                            <input type="tel" id="whatsappNumber" value="+91 99385 91914">
                        </div>
                        <div class="form-field">
                            <label>Business Hours</label>
                            <input type="text" id="businessHours" value="8:00 AM – 10:30 PM">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field full">
                            <label>Address</label>
                            <textarea id="storeAddress">7WJ2+J7, Dhabalahar, Odisha 752101</textarea>
                        </div>
                    </div>

                    <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
                </div>
            </div>
        </div>
    </section>
    `;

    // Replace current content
    const main = document.querySelector('main');
    const firstPage = main.querySelector('.page');
    firstPage.insertAdjacentHTML('beforebegin', adminHTML);

    // Hide all pages except admin panel
    const allPages = main.querySelectorAll('.page');
    allPages.forEach(page => page.classList.remove('active'));
    document.getElementById('admin-panel').classList.add('active');

    // Load and display data
    loadAdminData();
}

function loadAdminData() {
    const orders = getOrdersFromStorage();
    const bookings = getBookingsFromStorage();

    // Update stats
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('pendingOrders').textContent = orders.filter(o => o.status === 'Pending').length;
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'Pending').length;

    // Display recent orders
    const recentOrders = orders.slice(-5).reverse();
    if (recentOrders.length > 0) {
        let ordersHTML = '<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        recentOrders.forEach(order => {
            ordersHTML += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.customerName}</td>
                    <td>${order.customerPhone}</td>
                    <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="admin-btn" onclick="editOrder('${order.orderId}')">Edit</button>
                        <button class="admin-btn" onclick="viewOrderDetails('${order.orderId}')">View</button>
                    </td>
                </tr>
            `;
        });
        ordersHTML += '</tbody></table>';
        document.getElementById('recentOrders').innerHTML = ordersHTML;
    } else {
        document.getElementById('recentOrders').innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-grey);">No orders yet</p>';
    }

    // Display recent bookings
    const recentBookings = bookings.slice(-5).reverse();
    if (recentBookings.length > 0) {
        let bookingsHTML = '<table class="admin-table"><thead><tr><th>Booking ID</th><th>Customer</th><th>Phone</th><th>Test</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        recentBookings.forEach(booking => {
            bookingsHTML += `
                <tr>
                    <td>${booking.bookingId}</td>
                    <td>${booking.customerName}</td>
                    <td>${booking.customerPhone}</td>
                    <td>${booking.test}</td>
                    <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                    <td>
                        <button class="admin-btn" onclick="editBooking('${booking.bookingId}')">Edit</button>
                        <button class="admin-btn" onclick="viewBookingDetails('${booking.bookingId}')">View</button>
                    </td>
                </tr>
            `;
        });
        bookingsHTML += '</tbody></table>';
        document.getElementById('recentBookings').innerHTML = bookingsHTML;
    } else {
        document.getElementById('recentBookings').innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-grey);">No bookings yet</p>';
    }

    // Display all orders table
    displayAllOrders(orders);

    // Display all bookings table
    displayAllBookings(bookings);
}

function displayAllOrders(orders) {
    if (orders.length > 0) {
        let ordersHTML = '<table class="admin-table"><thead><tr><th>Order ID</th><th>Customer</th><th>Phone</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        orders.reverse().forEach(order => {
            const date = new Date(order.timestamp).toLocaleDateString();
            ordersHTML += `
                <tr>
                    <td>${order.orderId}</td>
                    <td>${order.customerName}</td>
                    <td>${order.customerPhone}</td>
                    <td>${date}</td>
                    <td><span class="status-badge status-${order.status.toLowerCase()}">${order.status}</span></td>
                    <td>
                        <button class="admin-btn" onclick="editOrder('${order.orderId}')">Edit</button>
                        <button class="admin-btn" onclick="deleteOrder('${order.orderId}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        ordersHTML += '</tbody></table>';
        document.getElementById('ordersTable').innerHTML = ordersHTML;
    } else {
        document.getElementById('ordersTable').innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-grey);">No orders found</p>';
    }
}

function displayAllBookings(bookings) {
    if (bookings.length > 0) {
        let bookingsHTML = '<table class="admin-table"><thead><tr><th>Booking ID</th><th>Customer</th><th>Phone</th><th>Test</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        bookings.reverse().forEach(booking => {
            const date = new Date(booking.timestamp).toLocaleDateString();
            bookingsHTML += `
                <tr>
                    <td>${booking.bookingId}</td>
                    <td>${booking.customerName}</td>
                    <td>${booking.customerPhone}</td>
                    <td>${booking.test}</td>
                    <td>${date}</td>
                    <td><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
                    <td>
                        <button class="admin-btn" onclick="editBooking('${booking.bookingId}')">Edit</button>
                        <button class="admin-btn" onclick="deleteBooking('${booking.bookingId}')">Delete</button>
                    </td>
                </tr>
            `;
        });
        bookingsHTML += '</tbody></table>';
        document.getElementById('bookingsTable').innerHTML = bookingsHTML;
    } else {
        document.getElementById('bookingsTable').innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-grey);">No bookings found</p>';
    }
}

function switchAdminTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.admin-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from buttons
    const buttons = document.querySelectorAll('.admin-tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
}

function editOrder(orderId) {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        const statuses = ['Pending', 'Accepted', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
        
        let statusOptions = '<option value="">-- Select Status --</option>';
        statuses.forEach(status => {
            const selected = status === order.status ? 'selected' : '';
            statusOptions += `<option value="${status}" ${selected}>${status}</option>`;
        });

        const updateHTML = `
            <div class="status-update-modal">
                <h3>Update Order Status</h3>
                <p>Order ID: <strong>${orderId}</strong></p>
                <label>New Status:</label>
                <select id="newStatus" style="width: 100%; padding: 10px; border: 2px solid var(--primary-blue); border-radius: 8px; margin: 15px 0; font-size: 16px;">
                    ${statusOptions}
                </select>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="confirmOrderStatusUpdate('${orderId}')">Update</button>
                    <button class="btn btn-secondary" onclick="cancelStatusUpdate()">Cancel</button>
                </div>
            </div>
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'statusUpdateModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg);">
                ${updateHTML}
            </div>
        `;
        document.body.appendChild(modal);
    }
}

function confirmOrderStatusUpdate(orderId) {
    const newStatus = document.getElementById('newStatus').value;
    
    if (!newStatus) {
        alert('Please select a status');
        return;
    }

    updateOrderStatus(orderId, newStatus);
    alert('Order status updated successfully!');
    
    // Close modal
    const modal = document.getElementById('statusUpdateModal');
    if (modal) modal.remove();
    
    loadAdminData();
}

function cancelStatusUpdate() {
    const modal = document.getElementById('statusUpdateModal');
    if (modal) modal.remove();
}

function editBooking(bookingId) {
    const bookings = getBookingsFromStorage();
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        const statuses = ['Pending', 'Confirmed', 'Home Collection Scheduled', 'Sample Collected', 'Testing', 'Report Ready', 'Completed', 'Cancelled'];
        
        let statusOptions = '<option value="">-- Select Status --</option>';
        statuses.forEach(status => {
            const selected = status === booking.status ? 'selected' : '';
            statusOptions += `<option value="${status}" ${selected}>${status}</option>`;
        });

        const updateHTML = `
            <div class="status-update-modal">
                <h3>Update Booking Status</h3>
                <p>Booking ID: <strong>${bookingId}</strong></p>
                <label>New Status:</label>
                <select id="newStatus" style="width: 100%; padding: 10px; border: 2px solid var(--primary-blue); border-radius: 8px; margin: 15px 0; font-size: 16px;">
                    ${statusOptions}
                </select>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="confirmBookingStatusUpdate('${bookingId}')">Update</button>
                    <button class="btn btn-secondary" onclick="cancelStatusUpdate()">Cancel</button>
                </div>
            </div>
        `;

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'statusUpdateModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%; box-shadow: var(--shadow-lg);">
                ${updateHTML}
            </div>
        `;
        document.body.appendChild(modal);
    }
}

function confirmBookingStatusUpdate(bookingId) {
    const newStatus = document.getElementById('newStatus').value;
    
    if (!newStatus) {
        alert('Please select a status');
        return;
    }

    updateBookingStatus(bookingId, newStatus);
    alert('Booking status updated successfully!');
    
    // Close modal
    const modal = document.getElementById('statusUpdateModal');
    if (modal) modal.remove();
    
    loadAdminData();
}

function viewOrderDetails(orderId) {
    const orders = getOrdersFromStorage();
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        alert(`Order ID: ${order.orderId}\n\nCustomer: ${order.customerName}\nPhone: ${order.customerPhone}\nAddress: ${order.deliveryAddress}\n\nMedicines: ${order.medicineRequirement}\n\nStatus: ${order.status}\n\nDate: ${new Date(order.timestamp).toLocaleString()}`);
    }
}

function viewBookingDetails(bookingId) {
    const bookings = getBookingsFromStorage();
    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (booking) {
        alert(`Booking ID: ${booking.bookingId}\n\nCustomer: ${booking.customerName}\nPhone: ${booking.customerPhone}\nAddress: ${booking.address}\n\nTest: ${booking.test}\nPreferred Date: ${booking.preferredDate}\nCollection: ${booking.collectionType}\n\nStatus: ${booking.status}\n\nDate: ${new Date(booking.timestamp).toLocaleString()}`);
    }
}

function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        let orders = getOrdersFromStorage();
        orders = orders.filter(o => o.orderId !== orderId);
        localStorage.setItem('medicineOrders', JSON.stringify(orders));
        alert('Order deleted successfully!');
        loadAdminData();
    }
}

function deleteBooking(bookingId) {
    if (confirm('Are you sure you want to delete this booking?')) {
        let bookings = getBookingsFromStorage();
        bookings = bookings.filter(b => b.bookingId !== bookingId);
        localStorage.setItem('diagnosticBookings', JSON.stringify(bookings));
        alert('Booking deleted successfully!');
        loadAdminData();
    }
}

function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    const orders = getOrdersFromStorage();
    
    const filtered = orders.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm) ||
        order.customerName.toLowerCase().includes(searchTerm)
    );
    
    displayAllOrders(filtered);
}

function searchBookings() {
    const searchTerm = document.getElementById('bookingSearch').value.toLowerCase();
    const bookings = getBookingsFromStorage();
    
    const filtered = bookings.filter(booking => 
        booking.bookingId.toLowerCase().includes(searchTerm) ||
        booking.customerName.toLowerCase().includes(searchTerm)
    );
    
    displayAllBookings(filtered);
}

function saveSettings() {
    const settings = {
        storeName: document.getElementById('storeName').value,
        storePhone: document.getElementById('storePhone').value,
        whatsappNumber: document.getElementById('whatsappNumber').value,
        businessHours: document.getElementById('businessHours').value,
        storeAddress: document.getElementById('storeAddress').value
    };
    
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
}

function adminLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.setItem('adminLoggedIn', 'false');
        location.reload();
    }
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', function() {
    // Show home page by default
    showPage('home');

    // Add CSS for admin panel
    const adminCSS = `
        .admin-header {
            background: linear-gradient(135deg, var(--primary-blue), var(--dark-blue));
            color: white;
            padding: 30px 0;
            margin-bottom: 30px;
        }

        .admin-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 2px solid var(--border-grey);
        }

        .admin-tab-button {
            padding: 12px 20px;
            background: white;
            border: none;
            cursor: pointer;
            font-weight: 600;
            color: var(--text-grey);
            border-bottom: 3px solid transparent;
            transition: var(--transition);
        }

        .admin-tab-button:hover {
            color: var(--primary-blue);
        }

        .admin-tab-button.active {
            color: var(--primary-blue);
            border-bottom-color: var(--primary-blue);
        }

        .admin-tab-content {
            display: none;
        }

        .admin-tab-content.active {
            display: block;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stat-card {
            background: linear-gradient(135deg, var(--light-blue), var(--light-green));
            padding: 30px;
            border-radius: 12px;
            text-align: center;
        }

        .stat-number {
            font-size: 36px;
            font-weight: bold;
            color: var(--primary-blue);
        }

        .stat-label {
            color: var(--text-grey);
            font-weight: 600;
            margin-top: 10px;
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
        }

        .admin-table thead {
            background: var(--light-blue);
        }

        .admin-table th {
            padding: 15px;
            text-align: left;
            color: var(--primary-blue);
            font-weight: 600;
        }

        .admin-table td {
            padding: 12px 15px;
            border-bottom: 1px solid var(--border-grey);
        }

        .admin-table tbody tr:hover {
            background: var(--light-grey);
        }

        .status-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
        }

        .status-pending {
            background: #FFF3CD;
            color: #856404;
        }

        .status-accepted {
            background: #D1ECF1;
            color: #0C5460;
        }

        .status-completed {
            background: #D4EDDA;
            color: #155724;
        }

        .status-cancelled {
            background: #F8D7DA;
            color: #721C24;
        }

        .admin-btn {
            padding: 6px 12px;
            margin: 0 3px;
            background: var(--primary-blue);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: var(--transition);
        }

        .admin-btn:hover {
            background: var(--dark-blue);
        }

        .admin-login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 60vh;
        }

        .admin-login-box {
            background: white;
            padding: 50px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            max-width: 400px;
            width: 100%;
        }

        .settings-form .form-field {
            margin-bottom: 20px;
        }
    `;

    const style = document.createElement('style');
    style.textContent = adminCSS;
    document.head.appendChild(style);
});
