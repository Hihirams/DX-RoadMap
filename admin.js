/* ===============================================
   RoadMap DX - Admin Panel
   Certificate Management and Approvals
   =============================================== */

// DOM Elements
const selectCharacter = document.getElementById('select-character');
const selectCourse = document.getElementById('select-course');
const uploadArea = document.getElementById('upload-area');
const certificateUpload = document.getElementById('certificate-upload');
const certificatePreview = document.getElementById('certificate-preview');
const submitBtn = document.getElementById('submit-certificate');
const pendingApprovals = document.getElementById('pending-approvals');
const approvalHistory = document.getElementById('approval-history');
const modal = document.getElementById('certificate-modal');
const modalClose = document.getElementById('modal-close');
const approveBtn = document.getElementById('approve-btn');
const rejectBtn = document.getElementById('reject-btn');

// Current certificate image data
let currentCertificateData = null;
let currentPendingId = null;

// ===============================================
// Admin Panel Initialization
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    initAdminPanel();
});

function initAdminPanel() {
    // Populate character select
    populateCharacterSelect();

    // Upload area events
    uploadArea.addEventListener('click', () => certificateUpload.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    certificateUpload.addEventListener('change', handleFileSelect);

    // Character select change
    selectCharacter.addEventListener('change', updateCourseOptions);

    // Submit button
    submitBtn.addEventListener('click', submitCertificate);

    // Modal events
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    approveBtn.addEventListener('click', approveCertificate);
    rejectBtn.addEventListener('click', rejectCertificate);
}

// ===============================================
// Admin Panel Rendering
// ===============================================
function renderAdminPanel() {
    populateCharacterSelect();
    renderPendingApprovals();
    renderApprovalHistory();
}

function populateCharacterSelect() {
    selectCharacter.innerHTML = '<option value="">Select a participant...</option>';

    appData.characters.forEach(character => {
        const nextCourse = getNextCourse(character);
        const option = document.createElement('option');
        option.value = character.id;
        option.textContent = character.name;
        option.disabled = !nextCourse; // Disable if no next course
        selectCharacter.appendChild(option);
    });

    updateCourseOptions();
}

function updateCourseOptions() {
    const characterId = parseInt(selectCharacter.value);
    selectCourse.innerHTML = '<option value="">Select a course...</option>';

    if (!characterId) {
        selectCourse.disabled = true;
        return;
    }

    const character = getCharacterById(characterId);
    if (!character) return;

    const nextCourse = getNextCourse(character);
    if (nextCourse) {
        const option = document.createElement('option');
        option.value = nextCourse;
        option.textContent = nextCourse;
        option.selected = true;
        selectCourse.appendChild(option);
        selectCourse.disabled = false;
    } else {
        selectCourse.disabled = true;
    }

    validateForm();
}

// ===============================================
// File Upload Handling
// ===============================================
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        currentCertificateData = e.target.result;
        certificatePreview.src = currentCertificateData;
        certificatePreview.classList.remove('hidden');

        // Hide upload text when preview is shown
        uploadArea.querySelector('.upload-icon').style.display = 'none';
        uploadArea.querySelector('p').style.display = 'none';

        validateForm();
    };
    reader.readAsDataURL(file);
}

function validateForm() {
    const hasCharacter = selectCharacter.value !== '';
    const hasCourse = selectCourse.value !== '';
    const hasImage = currentCertificateData !== null;

    submitBtn.disabled = !(hasCharacter && hasCourse && hasImage);
}

// ===============================================
// Certificate Submission
// ===============================================
function submitCertificate() {
    const characterId = parseInt(selectCharacter.value);
    const courseName = selectCourse.value;

    if (!characterId || !courseName || !currentCertificateData) return;

    const character = getCharacterById(characterId);
    if (!character) return;

    // Create pending certificate
    character.pendingCertificate = {
        id: Date.now(),
        course: courseName,
        image: currentCertificateData,
        submittedAt: new Date().toISOString()
    };

    saveData();

    // Reset form
    resetUploadForm();

    // Show success message
    showNotification('Certificate submitted for approval');

    // Refresh admin panel
    renderAdminPanel();
}

function resetUploadForm() {
    selectCharacter.value = '';
    selectCourse.innerHTML = '<option value="">Select a course...</option>';
    selectCourse.disabled = true;
    certificateUpload.value = '';
    certificatePreview.src = '';
    certificatePreview.classList.add('hidden');
    uploadArea.querySelector('.upload-icon').style.display = '';
    uploadArea.querySelector('p').style.display = '';
    currentCertificateData = null;
    submitBtn.disabled = true;
}

// ===============================================
// Pending Approvals
// ===============================================
function renderPendingApprovals() {
    const pending = appData.characters.filter(c => c.pendingCertificate);

    if (pending.length === 0) {
        pendingApprovals.innerHTML = `
            <div class="empty-state glass">
                <span class="empty-icon">—</span>
                <p>No pending certificates</p>
            </div>
        `;
        return;
    }

    pendingApprovals.innerHTML = pending.map(character => {
        const cert = character.pendingCertificate;
        const date = new Date(cert.submittedAt).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="pending-card glass" data-character-id="${character.id}">
                <img src="${character.avatar}" alt="${character.name}" class="pending-avatar">
                <div class="pending-info">
                    <div class="pending-name">${character.name}</div>
                    <div class="pending-course">${cert.course}</div>
                    <div class="pending-date">${date}</div>
                </div>
                <div class="pending-actions">
                    <button class="btn btn-success btn-sm" onclick="openApprovalModal(${character.id})">
                        Review
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===============================================
// Approval Modal
// ===============================================
function openApprovalModal(characterId) {
    const character = getCharacterById(characterId);
    if (!character || !character.pendingCertificate) return;

    currentPendingId = characterId;

    document.getElementById('modal-avatar').src = character.avatar;
    document.getElementById('modal-character-name').textContent = character.name;
    document.getElementById('modal-course-name').textContent = character.pendingCertificate.course;
    document.getElementById('modal-certificate').src = character.pendingCertificate.image;

    modal.classList.remove('hidden');
}

function closeModal() {
    modal.classList.add('hidden');
    currentPendingId = null;
}

function approveCertificate() {
    if (!currentPendingId) return;

    const character = getCharacterById(currentPendingId);
    if (!character || !character.pendingCertificate) return;

    const cert = character.pendingCertificate;

    // Add to certificates
    character.certificates.push({
        course: cert.course,
        image: cert.image,
        approvedAt: new Date().toISOString()
    });

    // Add to history
    appData.history.unshift({
        id: Date.now(),
        characterId: character.id,
        characterName: character.name,
        course: cert.course,
        status: 'approved',
        date: new Date().toISOString()
    });

    // Move character to next checkpoint
    const nextCheckpoint = character.currentCheckpoint + 1;
    if (nextCheckpoint < CHECKPOINTS.length) {
        moveCharacter(character.id, nextCheckpoint);
    }

    // Clear pending
    character.pendingCertificate = null;

    saveData();
    closeModal();
    renderAdminPanel();

    showNotification(`${character.name} advanced on the map`);
}

function rejectCertificate() {
    if (!currentPendingId) return;

    const character = getCharacterById(currentPendingId);
    if (!character || !character.pendingCertificate) return;

    const cert = character.pendingCertificate;

    // Add to history
    appData.history.unshift({
        id: Date.now(),
        characterId: character.id,
        characterName: character.name,
        course: cert.course,
        status: 'rejected',
        date: new Date().toISOString()
    });

    // Clear pending
    character.pendingCertificate = null;

    saveData();
    closeModal();
    renderAdminPanel();

    showNotification(`Certificate for ${character.name} rejected`);
}

// ===============================================
// Approval History
// ===============================================
function renderApprovalHistory() {
    if (appData.history.length === 0) {
        approvalHistory.innerHTML = `
            <div class="empty-state glass" style="padding: 24px;">
                <p style="color: var(--text-tertiary);">No approval history</p>
            </div>
        `;
        return;
    }

    approvalHistory.innerHTML = appData.history.slice(0, 10).map(item => {
        const date = new Date(item.date).toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });

        const isApproved = item.status === 'approved';

        return `
            <div class="history-item">
                <div class="history-status ${item.status}">
                    ${isApproved ? 'Y' : 'N'}
                </div>
                <div class="history-info">
                    <div class="history-title">
                        ${item.characterName} - ${item.course}
                    </div>
                    <div class="history-date">${date}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ===============================================
// Notifications
// ===============================================
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 16px 24px;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        font-weight: 500;
        font-size: 0.9rem;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        color: #1D1D1F;
        border: 1px solid rgba(0,0,0,0.08);
    `;
    notification.textContent = message;

    // Add animation keyframes
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Expose functions globally
window.renderAdminPanel = renderAdminPanel;
window.openApprovalModal = openApprovalModal;
