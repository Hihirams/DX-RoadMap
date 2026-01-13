/* ===============================================
   RoadMap DX - Dashboard
   Skills Summary and Analytics
   =============================================== */

// ===============================================
// Dashboard Rendering
// ===============================================
function renderDashboard() {
    updateStats();
    renderCharacterCards();
    renderSkillsMatrix();
    renderLeaderboard();
}

// ===============================================
// Stats Overview
// ===============================================
function updateStats() {
    const totalMembers = appData.characters.length;
    const totalCourses = CHECKPOINTS.filter(cp => cp.course).length;

    let completedTotal = 0;
    appData.characters.forEach(char => {
        completedTotal += char.completedCourses.length;
    });

    const maxCompletions = totalMembers * totalCourses;
    const teamProgress = maxCompletions > 0
        ? Math.round((completedTotal / maxCompletions) * 100)
        : 0;

    document.getElementById('total-members').textContent = totalMembers;
    document.getElementById('total-courses').textContent = totalCourses;
    document.getElementById('completed-courses').textContent = completedTotal;
    document.getElementById('team-progress').textContent = `${teamProgress}%`;
}

// ===============================================
// Character Cards
// ===============================================
function renderCharacterCards() {
    const container = document.getElementById('dashboard-characters');
    container.innerHTML = '';

    appData.characters.forEach(character => {
        const progress = calculateProgress(character);
        const levelInfo = calculateLevel(character);
        const nextCourse = getNextCourse(character);

        const card = document.createElement('div');
        card.className = 'character-card glass';
        card.id = `char-card-${character.id}`;

        // Generate skill tags
        const courses = CHECKPOINTS.filter(cp => cp.course);
        const skillTags = courses.map(cp => {
            const completed = character.completedCourses.includes(cp.course);
            return `<span class="skill-tag ${completed ? '' : 'pending'}">${cp.name}</span>`;
        }).join('');

        card.innerHTML = `
            <div class="character-card-header">
                <img src="${character.avatar}" alt="${character.name}" class="card-avatar">
                <div class="character-card-info">
                    <h4>${character.name}</h4>
                    <span class="character-level">
                        Level ${levelInfo.level} - ${levelInfo.title}
                    </span>
                </div>
            </div>
            <div class="character-card-progress">
                <div class="progress-header">
                    <span class="progress-label">
                        ${nextCourse ? `Next: ${nextCourse}` : 'Completed'}
                    </span>
                    <span class="progress-value">${progress}%</span>
                </div>
                <div class="progress-bar-large">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
            </div>
            <div class="character-card-skills">
                ${skillTags}
            </div>
        `;

        container.appendChild(card);
    });
}

// ===============================================
// Skills Matrix
// ===============================================
function renderSkillsMatrix() {
    const container = document.getElementById('skills-matrix');
    const courses = CHECKPOINTS.filter(cp => cp.course);

    // Build table header
    let headerCells = '<th>Participant</th>';
    courses.forEach((course, i) => {
        headerCells += `<th>${i + 1}</th>`;
    });

    // Build table rows
    let rows = '';
    appData.characters.forEach(character => {
        let cells = `<td>
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${character.avatar}" style="width: 24px; height: 32px; object-fit: contain;">
                ${character.name}
            </div>
        </td>`;

        courses.forEach(course => {
            const completed = character.completedCourses.includes(course.course);
            cells += `<td>
                <span class="skill-status ${completed ? 'completed' : 'pending'}">
                    ${completed ? 'Y' : '-'}
                </span>
            </td>`;
        });

        rows += `<tr>${cells}</tr>`;
    });

    container.innerHTML = `
        <table class="skills-table">
            <thead><tr>${headerCells}</tr></thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}

// ===============================================
// Leaderboard
// ===============================================
function renderLeaderboard() {
    const container = document.getElementById('leaderboard');

    // Sort characters by progress
    const sorted = [...appData.characters].sort((a, b) => {
        const progressA = calculateProgress(a);
        const progressB = calculateProgress(b);
        return progressB - progressA;
    });

    container.innerHTML = sorted.map((character, index) => {
        const progress = calculateProgress(character);
        const completedCount = character.completedCourses.length;
        const totalCourses = CHECKPOINTS.filter(cp => cp.course).length;

        return `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${index === 0 ? 'first' : ''}">
                    ${index + 1}
                </div>
                <img src="${character.avatar}" alt="${character.name}" class="leaderboard-avatar">
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${character.name}</div>
                    <div class="leaderboard-courses">${completedCount}/${totalCourses} courses completed</div>
                </div>
                <div class="leaderboard-progress">${progress}%</div>
            </div>
        `;
    }).join('');
}

// Expose for global access
window.renderDashboard = renderDashboard;
