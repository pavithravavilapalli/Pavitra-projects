// ============================================
// BUS PASS VALIDATOR - Database & Logic
// ============================================

// ============================================
// ROUTES DATABASE
// ============================================
const routesDatabase = {
    'ROUTE_A1': {
        name: 'Metro Line A1',
        stops: ['Central Station', 'City Center', 'Airport', 'Tech Park'],
        status: 'active'
    },
    'ROUTE_B2': {
        name: 'City Bus B2',
        stops: ['Main Terminal', 'School District', 'Shopping Mall', 'Residential Area'],
        status: 'active'
    },
    'ROUTE_C3': {
        name: 'Suburban Express C3',
        stops: ['Downtown', 'University', 'Medical Center', 'Outskirts'],
        status: 'active'
    },
    'ROUTE_D4': {
        name: 'Night Route D4',
        stops: ['City Center', 'Entertainment District', 'Residential', 'Hospital'],
        status: 'active'
    },
    'ROUTE_INVALID': {
        name: 'Invalid Route',
        stops: [],
        status: 'inactive'
    }
};

// ============================================
// BUS PASS DATABASE
// ============================================
const passDatabase = {
    'PASS001': {
        passId: 'PASS001',
        passengerName: 'Aditya Kumar',
        age: 18,
        passengerId: 'STU20240001',
        mobile: '+91-9876543210',
        route: 'ROUTE_A1',
        passType: 'Student',
        issueDate: new Date(2026, 3, 1),  // April 1, 2026
        validDays: 'Weekdays (Mon-Fri)',
        travelerCategory: 'School Student',
        status: 'active'
    },
    'PASS002': {
        passId: 'PASS002',
        passengerName: 'Priya Sharma',
        age: 20,
        passengerId: 'COL20240002',
        mobile: '+91-9876543211',
        route: 'ROUTE_B2',
        passType: 'College',
        issueDate: new Date(2026, 2, 15),  // March 15, 2026
        validDays: 'Weekdays + Weekends',
        travelerCategory: 'College Student',
        status: 'active'
    },
    'PASS003': {
        passId: 'PASS003',
        passengerName: 'Rajesh Patel',
        age: 35,
        passengerId: 'EMP20240003',
        mobile: '+91-9876543212',
        route: 'ROUTE_C3',
        passType: 'Regular',
        issueDate: new Date(2026, 2, 1),  // March 1, 2026 (expired)
        validDays: 'Weekdays (Mon-Fri)',
        travelerCategory: 'Working Professional',
        status: 'expired'
    },
    'PASS004': {
        passId: 'PASS004',
        passengerName: 'Sophia Johnson',
        age: 22,
        passengerId: 'UNI20240004',
        mobile: '+91-9876543213',
        route: 'ROUTE_INVALID',
        passType: 'Student',
        issueDate: new Date(2026, 3, 5),  // April 5, 2026
        validDays: 'Weekdays (Mon-Fri)',
        travelerCategory: 'University Student',
        status: 'active'
    }
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validates if a pass exists in the database
 */
function validatePassExists(passId) {
    return passDatabase.hasOwnProperty(passId);
}

/**
 * Validates if the pass is still valid (monthly validity)
 * A pass is valid for exactly 30 days from issue date
 */
function validatePassExpiry(pass) {
    const today = new Date();
    const issueDate = new Date(pass.issueDate);
    const expirationDate = new Date(issueDate);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    return {
        isValid: today <= expirationDate,
        expirationDate: expirationDate,
        daysRemaining: Math.max(0, Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24)))
    };
}

/**
 * Validates if the route exists and is active
 */
function validateRoute(routeId) {
    if (!routesDatabase.hasOwnProperty(routeId)) {
        return {
            isValid: false,
            error: 'Route not found in the system'
        };
    }
    
    const route = routesDatabase[routeId];
    return {
        isValid: route.status === 'active',
        route: route,
        error: route.status !== 'active' ? 'Route is inactive' : null
    };
}

/**
 * Validates pass type rules (weekday/weekend restrictions)
 */
function validatePassType(pass) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (pass.validDays === 'Weekdays (Mon-Fri)' && isWeekend) {
        return {
            isValid: false,
            error: 'Pass is only valid on weekdays. Today is a weekend.'
        };
    }
    
    return {
        isValid: true,
        error: null
    };
}

/**
 * Validates passenger eligibility based on age and category
 */
function validatePassEligibility(pass) {
    const errors = [];
    
    // Age validation
    if (pass.passType === 'Student' && (pass.age < 5 || pass.age > 25)) {
        errors.push('Student pass holder must be between 5 and 25 years old');
    }
    
    if (pass.passType === 'College' && (pass.age < 18 || pass.age > 28)) {
        errors.push('College pass holder must be between 18 and 28 years old');
    }
    
    if (pass.passType === 'Regular' && pass.age < 18) {
        errors.push('Regular pass holder must be 18 years or older');
    }
    
    // Mobile validation (basic format check)
    if (!pass.mobile || !/^\+91-\d{10}$/.test(pass.mobile)) {
        errors.push('Invalid mobile number format');
    }
    
    // Passenger ID validation
    if (!pass.passengerId || pass.passengerId.length < 5) {
        errors.push('Invalid passenger ID');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * Main validation function that orchestrates all checks
 */
function validatePass(passId) {
    const result = {
        isValid: false,
        pass: null,
        route: null,
        errors: [],
        checks: {}
    };
    
    // Check 1: Pass exists
    if (!validatePassExists(passId)) {
        result.errors.push('Pass ID not found in the system');
        return result;
    }
    
    const pass = passDatabase[passId];
    result.pass = pass;
    
    // Check 2: Pass expiry
    const expiryCheck = validatePassExpiry(pass);
    result.checks.expiry = expiryCheck;
    if (!expiryCheck.isValid) {
        result.errors.push(`Pass has expired on ${formatDate(expiryCheck.expirationDate)}`);
    }
    
    // Check 3: Route validity
    const routeCheck = validateRoute(pass.route);
    result.checks.route = routeCheck;
    if (!routeCheck.isValid) {
        result.errors.push(routeCheck.error);
    } else {
        result.route = routeCheck.route;
    }
    
    // Check 4: Pass type (weekday/weekend rules)
    const typeCheck = validatePassType(pass);
    result.checks.type = typeCheck;
    if (!typeCheck.isValid) {
        result.errors.push(typeCheck.error);
    }
    
    // Check 5: Passenger eligibility
    const eligibilityCheck = validatePassEligibility(pass);
    result.checks.eligibility = eligibilityCheck;
    if (!eligibilityCheck.isValid) {
        result.errors.push(...eligibilityCheck.errors);
    }
    
    // Overall validity
    result.isValid = result.errors.length === 0;
    
    return result;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Formats a date to DD-MMM-YYYY format
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

/**
 * Shows error alert
 */
function showError(message) {
    const errorAlert = document.getElementById('errorAlert');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorAlert.classList.remove('hidden');
    
    setTimeout(() => {
        errorAlert.classList.add('hidden');
    }, 5000);
}

/**
 * Displays validation results on the UI
 */
function displayResults(validationResult) {
    const resultsSection = document.getElementById('resultsSection');
    
    if (!validationResult.pass) {
        showError('❌ ' + validationResult.errors.join(' | '));
        resultsSection.classList.add('hidden');
        return;
    }
    
    const pass = validationResult.pass;
    const route = validationResult.route;
    const expiryCheck = validationResult.checks.expiry;
    
    // Display validation status
    const validationStatus = document.getElementById('validationStatus');
    if (validationResult.isValid) {
        validationStatus.innerHTML = '<div class="status-badge valid">✓ PASS VALID</div>';
        validationStatus.className = 'validation-status valid-bg';
    } else {
        validationStatus.innerHTML = '<div class="status-badge invalid">✗ PASS INVALID</div>';
        validationStatus.className = 'validation-status invalid-bg';
    }
    
    // Passenger details
    document.getElementById('passengerName').textContent = pass.passengerName;
    document.getElementById('passengerAge').textContent = pass.age + ' years';
    document.getElementById('passengerId').textContent = pass.passengerId;
    document.getElementById('passengerMobile').textContent = pass.mobile;
    
    // Route information
    if (route) {
        document.getElementById('routeName').textContent = route.name;
        document.getElementById('routeStatus').innerHTML = '<span class="status-good">✓ Active</span>';
    } else {
        document.getElementById('routeName').textContent = 'N/A';
        document.getElementById('routeStatus').innerHTML = '<span class="status-bad">✗ Inactive</span>';
    }
    
    // Pass validity
    document.getElementById('passType').textContent = pass.passType;
    document.getElementById('issueDate').textContent = formatDate(new Date(pass.issueDate));
    document.getElementById('expirationDate').textContent = formatDate(expiryCheck.expirationDate);
    
    if (expiryCheck.daysRemaining > 0) {
        document.getElementById('daysRemaining').innerHTML = 
            `<span class="days-positive">${expiryCheck.daysRemaining} days</span>`;
    } else {
        document.getElementById('daysRemaining').innerHTML = 
            `<span class="days-expired">Expired</span>`;
    }
    
    // Allowed travel
    document.getElementById('validDays').textContent = pass.validDays;
    document.getElementById('travelerCategory').textContent = pass.travelerCategory;
    
    // Error messages
    const errorMessagesDiv = document.getElementById('errorMessagesDiv');
    const errorMessages = document.getElementById('errorMessages');
    
    if (validationResult.errors.length > 0) {
        errorMessages.innerHTML = validationResult.errors
            .map(err => `<div class="error-item">• ${err}</div>`)
            .join('');
        errorMessagesDiv.classList.remove('hidden');
    } else {
        errorMessagesDiv.classList.add('hidden');
    }
    
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================
// EVENT LISTENERS & UI LOGIC
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const qrInput = document.getElementById('qrInput');
    const scanBtn = document.getElementById('scanBtn');
    const passIdInput = document.getElementById('passIdInput');
    const manualLookupBtn = document.getElementById('manualLookupBtn');
    const clearBtn = document.getElementById('clearBtn');
    const closeErrorBtn = document.getElementById('closeErrorBtn');
    
    // Scan button click handler
    scanBtn.addEventListener('click', () => {
        const passId = qrInput.value.trim().toUpperCase();
        
        if (!passId) {
            showError('Please scan a QR code or enter a pass ID');
            return;
        }
        
        const result = validatePass(passId);
        displayResults(result);
        qrInput.value = '';
    });
    
    // Enter key in QR input
    qrInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scanBtn.click();
        }
    });
    
    // Manual lookup button click handler
    manualLookupBtn.addEventListener('click', () => {
        const passId = passIdInput.value.trim().toUpperCase();
        
        if (!passId) {
            showError('Please enter a pass ID');
            return;
        }
        
        const result = validatePass(passId);
        displayResults(result);
        passIdInput.value = '';
    });
    
    // Enter key in manual lookup input
    passIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            manualLookupBtn.click();
        }
    });
    
    // Clear results button
    clearBtn.addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('hidden');
        qrInput.focus();
    });
    
    // Close error alert
    closeErrorBtn.addEventListener('click', () => {
        document.getElementById('errorAlert').classList.add('hidden');
    });
    
    // Focus on QR input on page load
    qrInput.focus();
});