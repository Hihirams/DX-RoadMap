/* ===============================================
   RoadMap DX - Main Application
   Map View and Navigation
   =============================================== */

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const views = document.querySelectorAll('.view');
const mapContainer = document.getElementById('map-container');
const mapBg = document.getElementById('map-bg');
const imageOverlay = document.getElementById('image-overlay');
const checkpointsContainer = document.getElementById('checkpoints-container');
const charactersContainer = document.getElementById('characters-container');
const tooltip = document.getElementById('character-tooltip');

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMap();
});

// ===============================================
// Navigation
// ===============================================
function initNavigation() {
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.dataset.view;
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    // Update tabs
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.view === viewId);
    });

    // Update views
    views.forEach(view => {
        view.classList.toggle('active', view.id === `${viewId}-view`);
    });

    // Refresh view-specific content
    if (viewId === 'dashboard') {
        renderDashboard();
    } else if (viewId === 'admin') {
        renderAdminPanel();
    }
}

// ===============================================
// Map Initialization
// ===============================================
function initMap() {
    // Wait for map image to load to get dimensions
    if (mapBg.complete) {
        renderMap();
    } else {
        mapBg.onload = renderMap;
    }

    // Handle window resize
    window.addEventListener('resize', debounce(renderMap, 250));
}

function renderMap() {
    updateImageOverlay();
    renderCheckpoints();
    renderCharacters();
}

// ===============================================
// Image Overlay Positioning
// ===============================================
function updateImageOverlay() {
    if (!mapContainer || !mapBg || !imageOverlay || !mapBg.complete) return;

    const containerW = mapContainer.clientWidth;
    const containerH = mapContainer.clientHeight;
    const imgW = mapBg.naturalWidth;
    const imgH = mapBg.naturalHeight;

    const imgAspect = imgW / imgH;
    const containerAspect = containerW / containerH;

    let displayedW, displayedH, offsetX, offsetY;

    if (imgAspect > containerAspect) {
        // Image is wider - fits width
        displayedW = containerW;
        displayedH = containerW / imgAspect;
        offsetX = 0;
        offsetY = (containerH - displayedH) / 2;
    } else {
        // Image is taller - fits height
        displayedH = containerH;
        displayedW = containerH * imgAspect;
        offsetX = (containerW - displayedW) / 2;
        offsetY = 0;
    }

    imageOverlay.style.width = `${displayedW}px`;
    imageOverlay.style.height = `${displayedH}px`;
    imageOverlay.style.left = `${offsetX}px`;
    imageOverlay.style.top = `${offsetY}px`;
}

// ===============================================
// Checkpoints Rendering
// ===============================================
function renderCheckpoints() {
    checkpointsContainer.innerHTML = '';

    CHECKPOINTS.forEach(checkpoint => {
        const el = document.createElement('div');
        el.className = 'checkpoint';
        el.style.left = `${checkpoint.x}%`;
        el.style.top = `${checkpoint.y}%`;

        // Determine state based on characters
        const hasCompleted = appData.characters.some(c =>
            c.completedCourses.includes(checkpoint.course)
        );
        const isCurrent = appData.characters.some(c =>
            c.currentCheckpoint === checkpoint.id
        );

        let stateClass = '';
        if (hasCompleted) stateClass = 'completed';
        else if (isCurrent) stateClass = 'current';

        el.innerHTML = `
            <div class="checkpoint-marker ${stateClass}">
                ${checkpoint.label}
            </div>
            <div class="checkpoint-label">${checkpoint.name}</div>
        `;

        el.addEventListener('click', () => showCheckpointInfo(checkpoint));

        checkpointsContainer.appendChild(el);
    });
}

function showCheckpointInfo(checkpoint) {
    // Could show a modal with checkpoint details
    console.log('Checkpoint clicked:', checkpoint);
}

// ===============================================
// Characters Rendering
// ===============================================
function renderCharacters() {
    charactersContainer.innerHTML = '';

    // Group characters by checkpoint for offset positioning
    const charactersByCheckpoint = {};
    appData.characters.forEach(char => {
        const cpId = char.currentCheckpoint;
        if (!charactersByCheckpoint[cpId]) {
            charactersByCheckpoint[cpId] = [];
        }
        charactersByCheckpoint[cpId].push(char);
    });

    appData.characters.forEach(character => {
        const checkpoint = getCheckpointById(character.currentCheckpoint);
        if (!checkpoint) return;

        // Calculate offset for multiple characters at same checkpoint
        const charsAtSamePoint = charactersByCheckpoint[character.currentCheckpoint];
        const index = charsAtSamePoint.indexOf(character);
        const offsetX = (index - (charsAtSamePoint.length - 1) / 2) * 1.5;

        const el = document.createElement('div');
        el.className = 'character';
        el.id = `character-${character.id}`;
        el.style.left = `${checkpoint.x + offsetX}%`;
        el.style.top = `${checkpoint.y}%`;

        el.innerHTML = `
            <img src="${character.avatar}" alt="${character.name}" class="character-avatar">
            <div class="character-name">${character.name}</div>
        `;

        // Events
        el.addEventListener('mouseenter', () => showTooltip(character));
        el.addEventListener('mouseleave', hideTooltip);
        el.addEventListener('click', () => showCharacterDetail(character));

        charactersContainer.appendChild(el);
    });
}

// ===============================================
// Tooltip
// ===============================================
function showTooltip(character) {
    const tooltipAvatar = document.getElementById('tooltip-avatar');
    const tooltipName = document.getElementById('tooltip-name');
    const tooltipCourse = document.getElementById('tooltip-course');
    const tooltipProgress = document.getElementById('tooltip-progress');
    const tooltipPercent = document.getElementById('tooltip-percent');

    const nextCourse = getNextCourse(character);
    const progress = calculateProgress(character);

    tooltipAvatar.src = character.avatar;
    tooltipName.textContent = character.name;
    tooltipCourse.textContent = nextCourse
        ? `Next: ${nextCourse}`
        : 'Completed';
    tooltipProgress.style.width = `${progress}%`;
    tooltipPercent.textContent = `${progress}%`;

    tooltip.classList.remove('hidden');
}

function hideTooltip() {
    tooltip.classList.add('hidden');
}

function showCharacterDetail(character) {
    // Switch to dashboard and highlight character
    switchView('dashboard');

    // Scroll to character card
    setTimeout(() => {
        const card = document.getElementById(`char-card-${character.id}`);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'pulse 0.5s ease 3';
        }
    }, 100);
}

// ===============================================
// Character Movement Animation
// ===============================================
function moveCharacter(characterId, newCheckpointId) {
    const character = getCharacterById(characterId);
    const newCheckpoint = getCheckpointById(newCheckpointId);

    if (!character || !newCheckpoint) return;

    const charEl = document.getElementById(`character-${characterId}`);
    if (charEl) {
        // Animate to new position
        charEl.style.left = `${newCheckpoint.x}%`;
        charEl.style.top = `${newCheckpoint.y}%`;

        // Add celebration effect
        charEl.classList.add('celebrating');
        setTimeout(() => {
            charEl.classList.remove('celebrating');
        }, 1000);
    }

    // Update data
    const currentCheckpoint = getCheckpointById(character.currentCheckpoint);
    if (currentCheckpoint && currentCheckpoint.course) {
        if (!character.completedCourses.includes(currentCheckpoint.course)) {
            character.completedCourses.push(currentCheckpoint.course);
        }
    }

    character.currentCheckpoint = newCheckpointId;
    saveData();

    // Re-render to update checkpoint states
    renderCheckpoints();
}

// ===============================================
// Utility Functions
// ===============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Expose global functions
window.moveCharacter = moveCharacter;
window.renderMap = renderMap;
window.switchView = switchView;
