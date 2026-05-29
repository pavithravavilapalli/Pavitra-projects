/* ======================================
   BUS PASS TRANSPORT MANAGEMENT SYSTEM
   JavaScript File
   ====================================== */

// Global Variables
let currentFilter = 'all';
let allPasses = [];
let notificationCount = 0;

// Initialize on Page Load
document.addEventListener('DOMContentLoaded', function () {
    initializePage();
    loadPasses();
    updateStats();
    attachEventListeners();
});

// ========== INITIALIZATION ==========

/**
 * Initialize the page with necessary setup
 */
function initializePage() {
    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }

    // Load passes from localStorage
    loadPasses();

    // Attach form event listener
    const passForm = document.getElementById('passForm');
    if (passForm) {
        passForm.addEventListener('submit', handleFormSubmit);
    }
}

/**
 * Attach event listeners to various elements
 */
function attachEventListeners() {
    // File input change
    const fileInput = document.getElementById('idProof');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Mobile menu toggle (for smaller screens)
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

// ========== SECTION NAVIGATION ==========

/**
 * Show a specific section and hide others
 * @param {string} sectionId - The ID of the section to show
 */
function showSection(sectionId) {
    // Prevent navigation if form is active with changes
    const passForm = document.getElementById('passForm');
    if (passForm && !passForm.style.display === false) {
        // Continue navigation
    }

    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Add active class to corresponding nav link
    const selectedNavLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (selectedNavLink) {
        selectedNavLink.classList.add('active');
    }

    // Update page title
    updatePageTitle(sectionId);

    // Execute section-specific code
    if (sectionId === 'admin') {
        updateStats();
        displayPasses('all');
    } else if (sectionId === 'view') {
        document.getElementById('searchInput').focus();
    }
}

/**
 * Update page title based on current section
 * @param {string} sectionId - The current section ID
 */
function updatePageTitle(sectionId) {
    const titles = {
        'home': { title: 'Bus Pass Management', subtitle: 'Manage your bus passes efficiently' },
        'apply': { title: 'Apply for Bus Pass', subtitle: 'Fill out the form to get your digital pass' },
        'view': { title: 'View Your Bus Pass', subtitle: 'Search and view your existing passes' },
        'admin': { title: 'Admin Panel', subtitle: 'Manage all bus passes and view statistics' }
    };

    const titleObj = titles[sectionId] || titles['home'];
    document.getElementById('page-title').textContent = titleObj.title;
    document.getElementById('page-subtitle').textContent = titleObj.subtitle;
}

// ========== DARK MODE ==========

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    showNotification('Dark mode ' + (isDarkMode ? 'enabled' : 'disabled'), 'success');
}

// ========== FORM VALIDATION ==========

/**
 * Validate a single field
 * @param {string} fieldId - The ID of the field to validate
 * @returns {boolean} - Whether the field is valid
 */
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    let isValid = true;
    let errorMessage = '';

    if (!field) return true;

    const value = field.value.trim();

    // Empty field validation
    if (field.hasAttribute('required') && !value && fieldId !== 'idProof') {
        isValid = false;
        errorMessage = 'This field is required';
    }

    // Specific field validations
    switch (fieldId) {
        case 'fullName':
            if (value && value.length < 3) {
                isValid = false;
                errorMessage = 'Name must be at least 3 characters';
            } else if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Name can only contain letters and spaces';
            }
            break;

        case 'age':
            if (value && (value < 10 || value > 100)) {
                isValid = false;
                errorMessage = 'Age must be between 10 and 100';
            }
            break;

        case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
            break;

        case 'mobile':
            if (value && !/^[0-9]{10}$/.test(value)) {
                isValid = false;
                errorMessage = 'Mobile number must be exactly 10 digits';
            }
            break;

        case 'source':
        case 'destination':
            if (value && value.length < 2) {
                isValid = false;
                errorMessage = 'Location must be at least 2 characters';
            }
            break;

        case 'address':
            if (value && value.length < 10) {
                isValid = false;
                errorMessage = 'Address must be at least 10 characters';
            }
            break;

        case 'idProof':
            if (field.files.length === 0) {
                isValid = false;
                errorMessage = 'Please upload ID Proof';
            } else {
                const file = field.files[0];
                const validExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
                const fileExtension = file.name.split('.').pop().toLowerCase();
                if (!validExtensions.includes(fileExtension)) {
                    isValid = false;
                    errorMessage = 'Only PDF, JPG, and PNG files are allowed';
                } else if (file.size > 5 * 1024 * 1024) {
                    isValid = false;
                    errorMessage = 'File size must be less than 5MB';
                }
            }
            break;
    }

    // Display error message
    if (errorElement) {
        if (!isValid) {
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
            field.style.borderColor = 'var(--danger-color)';
        } else {
            errorElement.classList.remove('show');
            field.style.borderColor = '';
        }
    }

    return isValid;
}

/**
 * Validate the entire form
 * @returns {boolean} - Whether the form is valid
 */
function validateForm() {
    const fields = ['fullName', 'age', 'gender', 'mobile', 'email', 'address', 'source', 'destination', 'idProof'];
    let isFormValid = true;

    fields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isFormValid = false;
        }
    });

    // Validate pass type selection
    const passTypeSelected = document.querySelector('input[name="passType"]:checked');
    const passTypeError = document.getElementById('passTypeError');
    if (!passTypeSelected) {
        isFormValid = false;
        if (passTypeError) {
            passTypeError.textContent = 'Please select a pass type';
            passTypeError.classList.add('show');
        }
    } else {
        if (passTypeError) {
            passTypeError.classList.remove('show');
        }
    }

    return isFormValid;
}

// ========== FORM SUBMISSION ==========

/**
 * Handle form submission
 * @param {Event} event - The form submission event
 */
function handleFormSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
        showNotification('Please fix the errors in the form', 'error');
        return;
    }

    // Show loading spinner
    showLoadingSpinner(true);

    // Simulate processing delay
    setTimeout(() => {
        showLoadingSpinner(false);

        // Collect form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            age: parseInt(document.getElementById('age').value),
            gender: document.getElementById('gender').value,
            mobile: document.getElementById('mobile').value.trim(),
            email: document.getElementById('email').value.trim(),
            address: document.getElementById('address').value.trim(),
            source: document.getElementById('source').value.trim(),
            destination: document.getElementById('destination').value.trim(),
            passType: document.querySelector('input[name="passType"]:checked').value,
            passId: generatePassId(),
            issueDate: new Date().toLocaleDateString(),
            validityDate: getValidityDate(),
            status: 'Active',
            applicationDate: new Date()
        };

        // Save to localStorage
        savePasses(formData);

        // Hide form and show generated pass
        document.getElementById('passForm').style.display = 'none';
        document.getElementById('generatedPassContainer').style.display = 'block';

        // Display the generated pass
        displayGeneratedPass(formData);

        // Show success notification
        showNotification('Bus pass application submitted successfully!', 'success');

        // Update stats
        updateStats();
    }, 2000);
}

/**
 * Handle file upload
 */
function handleFileUpload() {
    const fileInput = document.getElementById('idProof');
    if (fileInput.files.length > 0) {
        const fileName = fileInput.files[0].name;
        const fileLabel = document.querySelector('.file-upload-label');
        fileLabel.innerHTML = `
            <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
            <span>${fileName}</span>
            <small>File uploaded successfully</small>
        `;
    }
}

// ========== PASS GENERATION ==========

/**
 * Generate a unique Pass ID
 * @returns {string} - The generated pass ID
 */
function generatePassId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BP${timestamp}${random}`;
}

/**
 * Get validity date (30 days from today)
 * @returns {string} - The validity date
 */
function getValidityDate() {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString();
}

/**
 * Display the generated pass
 * @param {Object} passData - The pass data to display
 */
function displayGeneratedPass(passData) {
    document.getElementById('passTypeDisplay').textContent = passData.passType;
    document.getElementById('passName').textContent = passData.fullName;
    document.getElementById('passId').textContent = passData.passId;
    document.getElementById('passRoute').textContent = `${passData.source} → ${passData.destination}`;
    document.getElementById('passValidity').textContent = passData.validityDate;
    document.getElementById('passAge').textContent = passData.age + ' years';
    document.getElementById('passMobile').textContent = passData.mobile;

    // Generate QR Code
    generateQRCode(passData.passId);
}

/**
 * Generate QR Code
 * @param {string} data - The data to encode in QR code
 */
function generateQRCode(data) {
    const qrContainer = document.getElementById('qrCodeContainer');
    qrContainer.innerHTML = ''; // Clear previous QR code
    new QRCode(qrContainer, {
        text: data,
        width: 120,
        height: 120,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// ========== LOCALSTORAGE OPERATIONS ==========

/**
 * Save a pass to localStorage
 * @param {Object} passData - The pass data to save
 */
function savePasses(passData) {
    let passes = JSON.parse(localStorage.getItem('busses')) || [];
    passes.push(passData);
    localStorage.setItem('busses', JSON.stringify(passes));
    allPasses = passes;
}

/**
 * Load all passes from localStorage
 */
function loadPasses() {
    allPasses = JSON.parse(localStorage.getItem('busses')) || [];
}

/**
 * Delete a pass from localStorage
 * @param {string} passId - The ID of the pass to delete
 */
function deletePass(passId) {
    if (confirm('Are you sure you want to delete this pass?')) {
        allPasses = allPasses.filter(pass => pass.passId !== passId);
        localStorage.setItem('busses', JSON.stringify(allPasses));
        displayPasses(currentFilter);
        updateStats();
        showNotification('Pass deleted successfully', 'success');
    }
}

/**
 * Approve a pass
 * @param {string} passId - The ID of the pass to approve
 */
function approvePass(passId) {
    const passIndex = allPasses.findIndex(pass => pass.passId === passId);
    if (passIndex !== -1) {
        allPasses[passIndex].status = 'Approved';
        localStorage.setItem('busses', JSON.stringify(allPasses));
        displayPasses(currentFilter);
        updateStats();
        showNotification('Pass approved successfully', 'success');
    }
}

/**
 * Reject a pass
 * @param {string} passId - The ID of the pass to reject
 */
function rejectPass(passId) {
    const passIndex = allPasses.findIndex(pass => pass.passId === passId);
    if (passIndex !== -1) {
        allPasses[passIndex].status = 'Rejected';
        localStorage.setItem('busses', JSON.stringify(allPasses));
        displayPasses(currentFilter);
        updateStats();
        showNotification('Pass rejected', 'warning');
    }
}

// ========== SEARCH FUNCTIONALITY ==========

/**
 * Update search placeholder based on search type
 */
function updateSearchPlaceholder() {
    const searchType = document.getElementById('searchType').value;
    const placeholders = {
        'passId': 'Enter Pass ID',
        'mobile': 'Enter Mobile Number',
        'name': 'Enter Passenger Name'
    };
    document.getElementById('searchInput').placeholder = placeholders[searchType];
}

/**
 * Search for passes
 */
function searchPass() {
    const searchType = document.getElementById('searchType').value;
    const searchValue = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!searchValue) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    let filteredPasses = [];

    switch (searchType) {
        case 'passId':
            filteredPasses = allPasses.filter(pass =>
                pass.passId.toLowerCase().includes(searchValue)
            );
            break;
        case 'mobile':
            filteredPasses = allPasses.filter(pass =>
                pass.mobile.includes(searchValue)
            );
            break;
        case 'name':
            filteredPasses = allPasses.filter(pass =>
                pass.fullName.toLowerCase().includes(searchValue)
            );
            break;
    }

    displaySearchResults(filteredPasses, searchValue);
}

/**
 * Display search results
 * @param {Array} passes - The passes to display
 * @param {string} searchValue - The search value
 */
function displaySearchResults(passes, searchValue) {
    const resultsContainer = document.getElementById('searchResults');

    if (passes.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No passes found for "${searchValue}"</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = passes.map(pass => `
        <div class="pass-result-card" onclick="showPassDetails('${pass.passId}')">
            <div class="pass-id">${pass.passId}</div>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${pass.fullName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Mobile:</span>
                <span class="detail-value">${pass.mobile}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Pass Type:</span>
                <span class="detail-value">${pass.passType}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Route:</span>
                <span class="detail-value">${pass.source} → ${pass.destination}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Validity:</span>
                <span class="detail-value">${pass.validityDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                    <span class="status-badge ${pass.status === 'Active' ? 'active' : pass.status === 'Rejected' ? 'inactive' : ''}">
                        ${pass.status}
                    </span>
                </span>
            </div>
        </div>
    `).join('');
}

/**
 * Show pass details in modal
 * @param {string} passId - The ID of the pass to show
 */
function showPassDetails(passId) {
    const pass = allPasses.find(p => p.passId === passId);
    if (!pass) return;

    const modalContent = document.getElementById('modalPassDetails');
    modalContent.innerHTML = `
        <h2>Pass Details</h2>
        <div style="padding: 20px 0;">
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Pass ID:</strong>
                    <span>${pass.passId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Name:</strong>
                    <span>${pass.fullName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Age:</strong>
                    <span>${pass.age} years</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Gender:</strong>
                    <span>${pass.gender}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Mobile:</strong>
                    <span>${pass.mobile}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Email:</strong>
                    <span>${pass.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Address:</strong>
                    <span>${pass.address}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Route:</strong>
                    <span>${pass.source} → ${pass.destination}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Pass Type:</strong>
                    <span>${pass.passType}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Issue Date:</strong>
                    <span>${pass.issueDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <strong>Validity Date:</strong>
                    <span>${pass.validityDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <strong>Status:</strong>
                    <span class="status-badge ${pass.status === 'Active' ? 'active' : pass.status === 'Rejected' ? 'inactive' : ''}">
                        ${pass.status}
                    </span>
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 25px; border-top: 1px solid var(--border-color); padding-top: 20px;">
            <button class="btn btn-secondary" onclick="downloadPassDetails('${pass.passId}')">
                <i class="fas fa-download"></i> Download
            </button>
            <button class="btn btn-primary" onclick="closePassModal()" style="margin-left: auto;">
                Close
            </button>
        </div>
    `;

    const modal = document.getElementById('passModal');
    modal.classList.add('active');
}

/**
 * Close the pass details modal
 */
function closePassModal() {
    const modal = document.getElementById('passModal');
    modal.classList.remove('active');
}

// ========== ADMIN PANEL ==========

/**
 * Filter passes by type
 * @param {string} filter - The filter type
 */
function filterPasses(filter) {
    currentFilter = filter;

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Display filtered passes
    displayPasses(filter);
}

/**
 * Display passes in admin table
 * @param {string} filter - The filter type
 */
function displayPasses(filter) {
    let filteredPasses = allPasses;

    if (filter !== 'all') {
        filteredPasses = allPasses.filter(pass => pass.passType === filter);
    }

    const tableBody = document.getElementById('passTableBody');
    const emptyMessage = document.getElementById('emptyTableMessage');

    if (filteredPasses.length === 0) {
        tableBody.innerHTML = '';
        emptyMessage.style.display = 'block';
        return;
    }

    emptyMessage.style.display = 'none';
    tableBody.innerHTML = filteredPasses.map(pass => `
        <tr>
            <td><strong>${pass.passId}</strong></td>
            <td>${pass.fullName}</td>
            <td>${pass.mobile}</td>
            <td><span style="background-color: rgba(99, 102, 241, 0.1); padding: 4px 8px; border-radius: 4px; font-size: 12px;">${pass.passType}</span></td>
            <td>${pass.source.substring(0, 15)}</td>
            <td>${pass.validityDate}</td>
            <td>
                <span class="status-badge ${pass.status === 'Active' ? 'active' : pass.status === 'Rejected' ? 'inactive' : ''}">
                    ${pass.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-secondary" onclick="showPassDetails('${pass.passId}')" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${pass.status !== 'Approved' ? `
                        <button class="btn btn-small btn-success" onclick="approvePass('${pass.passId}')" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${pass.status !== 'Rejected' ? `
                        <button class="btn btn-small btn-warning" onclick="rejectPass('${pass.passId}')" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn btn-small btn-danger" onclick="deletePass('${pass.passId}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update statistics
 */
function updateStats() {
    const totalPasses = allPasses.length;
    const activePasses = allPasses.filter(pass => pass.status === 'Active').length;
    const uniqueUsers = new Set(allPasses.map(pass => pass.mobile)).size;
    const expiredPasses = 0; // You can add logic to check expiry dates

    document.getElementById('totalPasses').textContent = totalPasses;
    document.getElementById('activePasses').textContent = activePasses;
    document.getElementById('totalUsers').textContent = uniqueUsers;
    document.getElementById('expiredPasses').textContent = expiredPasses;
}

// ========== NOTIFICATIONS ==========

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, warning)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-warning',
        'info': 'fa-info-circle'
    };

    notification.innerHTML = `
        <i class="fas ${icon[type] || icon['info']}"></i>
        <span style="margin-left: 10px;">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Update notification count
    notificationCount++;
    updateNotificationCount();
}

/**
 * Show notifications panel
 */
function showNotifications() {
    // Placeholder for notifications panel
    showNotification('You have no new notifications', 'info');
}

/**
 * Update notification count badge
 */
function updateNotificationCount() {
    const badge = document.querySelector('.notification-count');
    if (badge) {
        badge.textContent = notificationCount > 9 ? '9+' : notificationCount;
    }
}

// ========== PRINT & DOWNLOAD ==========

/**
 * Download pass as PDF
 */
function downloadPassPDF() {
    window.print();
    showNotification('Opening print dialog...', 'info');
}

/**
 * Print pass
 */
function printPass() {
    window.print();
    showNotification('Opening print dialog...', 'info');
}

/**
 * Download pass details
 * @param {string} passId - The ID of the pass to download
 */
function downloadPassDetails(passId) {
    const pass = allPasses.find(p => p.passId === passId);
    if (!pass) return;

    const csvContent = `
Pass ID,${pass.passId}
Passenger Name,${pass.fullName}
Age,${pass.age}
Gender,${pass.gender}
Mobile,${pass.mobile}
Email,${pass.email}
Address,${pass.address}
Route,"${pass.source} → ${pass.destination}"
Pass Type,${pass.passType}
Issue Date,${pass.issueDate}
Validity Date,${pass.validityDate}
Status,${pass.status}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `Pass_${pass.passId}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification('Pass details downloaded', 'success');
    closePassModal();
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Show loading spinner
 * @param {boolean} show - Whether to show or hide the spinner
 */
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.add('active');
    } else {
        spinner.classList.remove('active');
    }
}

/**
 * Apply for another pass
 */
function applyAnother() {
    // Reset form
    document.getElementById('passForm').reset();
    document.getElementById('passForm').style.display = 'block';
    document.getElementById('generatedPassContainer').style.display = 'none';

    // Reset file upload label
    const fileLabel = document.querySelector('.file-upload-label');
    fileLabel.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <span>Click to upload or drag ID Proof</span>
        <small>PDF, JPG or PNG (Max 5MB)</small>
        <input type="file" id="idProof" accept=".pdf,.jpg,.jpeg,.png" required>
    `;

    // Reattach file event listener
    const fileInput = document.getElementById('idProof');
    fileInput.addEventListener('change', handleFileUpload);

    // Focus on first field
    document.getElementById('fullName').focus();

    showNotification('Form reset. Ready to apply for another pass!', 'success');
}

/**
 * Close sidebar (for mobile)
 */
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('active');
}

// ========== ADVANCED FEATURES ==========

/**
 * Export all passes to CSV
 */
function exportToCSV() {
    if (allPasses.length === 0) {
        showNotification('No passes to export', 'warning');
        return;
    }

    let csvContent = 'Pass ID,Name,Age,Mobile,Email,Pass Type,Route,Issue Date,Validity Date,Status\n';
    csvContent += allPasses.map(pass =>
        `${pass.passId},"${pass.fullName}",${pass.age},${pass.mobile},${pass.email},${pass.passType},"${pass.source} → ${pass.destination}",${pass.issueDate},${pass.validityDate},${pass.status}`
    ).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `Bus_Passes_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showNotification('All passes exported successfully', 'success');
}

/**
 * Clear all data (with confirmation)
 */
function clearAllData() {
    if (confirm('Are you sure you want to delete all passes? This action cannot be undone.')) {
        if (confirm('This will permanently delete all data. Are you absolutely sure?')) {
            localStorage.removeItem('busses');
            allPasses = [];
            displayPasses('all');
            updateStats();
            showNotification('All data cleared successfully', 'success');
        }
    }
}

// ========== PAGE UNLOAD WARNING ==========

/**
 * Warn user about unsaved changes
 */
window.addEventListener('beforeunload', function (e) {
    const passForm = document.getElementById('passForm');
    const hasChanges = passForm && passForm.style.display !== 'none';

    if (hasChanges) {
        const form = passForm;
        let isEmpty = true;

        const fieldsToCheck = ['fullName', 'mobile', 'email', 'address'];
        fieldsToCheck.forEach(fieldId => {
            if (document.getElementById(fieldId).value.trim() !== '') {
                isEmpty = false;
            }
        });

        if (!isEmpty) {
            e.preventDefault();
            e.returnValue = '';
        }
    }
});

// ========== INITIAL SETUP ==========

// Show home section by default
showSection('home');
