/* ===============================================
   RoadMap DX - Data Configuration
   Characters, Courses, and Checkpoints
   =============================================== */

// Course/Checkpoint definitions with positions on the map
// Positions are percentages relative to the map container
const CHECKPOINTS = [
    {
        id: 0,
        name: "Start",
        course: null,
        x: 80,
        y: 59,
        label: "S"
    },
    {
        id: 1,
        name: "Onboarding Basics",
        course: "Onboarding Basics",
        x: 72,
        y: 68,
        label: "1"
    },
    {
        id: 2,
        name: "Safety Training",
        course: "Safety Training",
        x: 44,
        y: 77,
        label: "2"
    },
    {
        id: 3,
        name: "Quality Control",
        course: "Quality Control",
        x: 24,
        y: 75,
        label: "3"
    },
    {
        id: 4,
        name: "Equipment Operation",
        course: "Equipment Operation",
        x: 23,
        y: 55,
        label: "4"
    },
    {
        id: 5,
        name: "Process Optimization",
        course: "Process Optimization",
        x: 50,
        y: 47,
        label: "5"
    },
    {
        id: 6,
        name: "Advanced Manufacturing",
        course: "Advanced Manufacturing",
        x: 57,
        y: 40,
        label: "6"
    }
];

// Character definitions
const DEFAULT_CHARACTERS = [
    {
        id: 1,
        name: "Player 1",
        avatar: "Users/1.png",
        currentCheckpoint: 0,
        completedCourses: [],
        certificates: [],
        pendingCertificate: null
    },
    {
        id: 2,
        name: "Player 2",
        avatar: "Users/2.png",
        currentCheckpoint: 0,
        completedCourses: [],
        certificates: [],
        pendingCertificate: null
    },
    {
        id: 3,
        name: "Player 3",
        avatar: "Users/3.png",
        currentCheckpoint: 0,
        completedCourses: [],
        certificates: [],
        pendingCertificate: null
    },
    {
        id: 4,
        name: "Player 4",
        avatar: "Users/4.png",
        currentCheckpoint: 0,
        completedCourses: [],
        certificates: [],
        pendingCertificate: null
    },
    {
        id: 5,
        name: "Player 5",
        avatar: "Users/5.png",
        currentCheckpoint: 0,
        completedCourses: [],
        certificates: [],
        pendingCertificate: null
    }
];

// Approval history structure
const DEFAULT_HISTORY = [];

// Data Manager - handles localStorage persistence
const DataManager = {
    STORAGE_KEY: 'roadmap_dx_data',

    // Load data from localStorage or return defaults
    load() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    characters: data.characters || [...DEFAULT_CHARACTERS],
                    history: data.history || [...DEFAULT_HISTORY]
                };
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return {
            characters: JSON.parse(JSON.stringify(DEFAULT_CHARACTERS)),
            history: []
        };
    },

    // Save data to localStorage
    save(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    },

    // Reset all data to defaults
    reset() {
        localStorage.removeItem(this.STORAGE_KEY);
        return this.load();
    }
};

// Global state
let appData = DataManager.load();

// Helper functions
function getCharacterById(id) {
    return appData.characters.find(c => c.id === id);
}

function getCheckpointById(id) {
    return CHECKPOINTS.find(cp => cp.id === id);
}

function getNextCourse(character) {
    const nextCheckpoint = CHECKPOINTS[character.currentCheckpoint + 1];
    return nextCheckpoint ? nextCheckpoint.course : null;
}

function calculateProgress(character) {
    // Progress is based on completed courses (excluding start)
    const totalCourses = CHECKPOINTS.filter(cp => cp.course).length;
    const completed = character.completedCourses.length;
    return Math.round((completed / totalCourses) * 100);
}

function calculateLevel(character) {
    const progress = calculateProgress(character);
    if (progress >= 100) return { level: 6, title: "Master" };
    if (progress >= 80) return { level: 5, title: "Expert" };
    if (progress >= 60) return { level: 4, title: "Advanced" };
    if (progress >= 40) return { level: 3, title: "Intermediate" };
    if (progress >= 20) return { level: 2, title: "Beginner" };
    return { level: 1, title: "Novice" };
}

// Save helper
function saveData() {
    DataManager.save(appData);
}
