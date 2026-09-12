// Game State
let gameState = {
    edition: 'java',
    currentScreen: 'startScreen',
    difficulty: 'normal',
    aiDifficulty: 'normal',
    aiCompanionEnabled: true,
    volume: 70,
    saved: false
};

let playerState = {
    x: 400,
    y: 300,
    width: 32,
    height: 32,
    health: 10,
    maxHealth: 10,
    hunger: 10,
    maxHunger: 10,
    direction: 'down',
    moving: false,
    moveDirection: null,
    speed: 3,
    inventory: [
        { id: 'wood', name: 'Wood', count: 5 },
        { id: 'stone', name: 'Stone', count: 8 },
        { id: 'pickaxe', name: 'Pickaxe', count: 1 },
        { id: 'sword', name: 'Sword', count: 1 },
        { id: 'dirt', name: 'Dirt', count: 20 },
        { id: 'grass', name: 'Grass', count: 15 }
    ]
};

let aiCompanion = {
    x: 350,
    y: 300,
    width: 32,
    height: 32,
    health: 10,
    maxHealth: 10,
    name: 'Alex',
    status: 'Idle',
    targetX: null,
    targetY: null,
    actionTimer: 0,
    followRange: 150
};

let gameWorld = {
    blocks: [],
    entities: [],
    particles: []
};

let canvas, ctx;
let gameRunning = false;
let lastFrameTime = 0;
let addOns = [
    { id: 'better-ai', name: 'Better AI', description: 'Enhanced AI companion behavior', enabled: false },
    { id: 'mini-games', name: 'Mini Games', description: 'Play mini-games for rewards', enabled: false },
    { id: 'multiplayer', name: 'Multiplayer', description: 'Play with friends online', enabled: false },
    { id: 'custom-skins', name: 'Custom Skins', description: 'Create and use custom skins', enabled: false },
    { id: 'dungeons', name: 'Dungeons', description: 'Explore dangerous dungeons', enabled: false },
    { id: 'farming', name: 'Farming Plus', description: 'Advanced farming mechanics', enabled: false }
];

// Screen Navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showEditionSelect() {
    showScreen('editionScreen');
}

function showAddOns() {
    showScreen('addOnsScreen');
    renderAddOns();
}

function showSettings() {
    showScreen('settingsScreen');
    loadSettingsUI();
}

function backToMenu() {
    if (gameRunning) {
        gameRunning = false;
    }
    showScreen('startScreen');
}

function quitGame() {
    alert('Thanks for playing Minecraft AI Edition!');
    window.close();
}

function startGame(edition) {
    gameState.edition = edition;
    document.getElementById('editionBadge').textContent = edition === 'java' ? 'Java Edition' : 'Bedrock Edition';
    showScreen('gameScreen');
    
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    
    gameRunning = true;
    generateWorld();
    initializeInventory();
    gameLoop();
}

// World Generation
function generateWorld() {
    gameWorld.blocks = [];
    
    // Create simple grid-based world
    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 25; x++) {
            let blockType = 'grass';
            
            // Random terrain
            if (Math.random() > 0.85) {
                blockType = 'tree';
            } else if (Math.random() > 0.9) {
                blockType = 'stone';
            }
            
            gameWorld.blocks.push({
                x: x * 32,
                y: y * 32,
                width: 32,
                height: 32,
                type: blockType
            });
        }
    }
}

function drawBlock(x, y, type) {
    const colors = {
        grass: '#2d5016',
        stone: '#666666',
        tree: '#8b4513',
        water: '#4d9aff',
        dirt: '#5d3a1a'
    };
    
    const borderColors = {
        grass: '#3d6b1f',
        stone: '#888888',
        tree: '#a0522d',
        water: '#2d5aaf',
        dirt: '#7d5a2a'
    };
    
    ctx.fillStyle = colors[type] || '#999';
    ctx.fillRect(x, y, 32, 32);
    ctx.strokeStyle = borderColors[type] || '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, 32, 32);
}

// Player Drawing
function drawPlayer(x, y, isAI = false) {
    const color = isAI ? '#ff69b4' : '#ffcc99';
    
    // Head
    ctx.fillStyle = color;
    ctx.fillRect(x + 8, y, 16, 16);
    
    // Body
    ctx.fillRect(x + 10, y + 16, 12, 12);
    
    // Arms
    ctx.fillRect(x + 2, y + 16, 8, 12);
    ctx.fillRect(x + 22, y + 16, 8, 12);
    
    // Legs
    ctx.fillRect(x + 10, y + 28, 6, 4);
    ctx.fillRect(x + 16, y + 28, 6, 4);
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 11, y + 4, 2, 2);
    ctx.fillRect(x + 19, y + 4, 2, 2);
    
    // Name tag
    if (isAI) {
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Alex', x + 16, y - 5);
    }
}

// Inventory
function initializeInventory() {
    renderInventory();
}

function renderInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';
    
    playerState.inventory.forEach((item, index) => {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.title = `${item.name} (${item.count})`;
        slot.textContent = getItemEmoji(item.id);
        slot.onclick = () => selectInventoryItem(index);
        inventoryDiv.appendChild(slot);
    });
    
    // Empty slots
    for (let i = playerState.inventory.length; i < 9; i++) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        inventoryDiv.appendChild(slot);
    }
}

function getItemEmoji(itemId) {
    const emojis = {
        'wood': '🌳',
        'stone': '◻️',
        'dirt': '🟫',
        'grass': '🟩',
        'pickaxe': '⛏️',
        'sword': '⚔️'
    };
    return emojis[itemId] || '❓';
}

// AI Companion Logic
function updateAICompanion() {
    if (!gameState.aiCompanionEnabled || !gameRunning) return;
    
    aiCompanion.actionTimer++;
    
    // AI follows player
    const distX = playerState.x - aiCompanion.x;
    const distY = playerState.y - aiCompanion.y;
    const distance = Math.sqrt(distX * distX + distY * distY);
    
    if (distance > aiCompanion.followRange) {
        if (distX > 0) aiCompanion.x += 2;
        if (distX < 0) aiCompanion.x -= 2;
        if (distY > 0) aiCompanion.y += 2;
        if (distY < 0) aiCompanion.y -= 2;
        aiCompanion.status = 'Following';
    } else {
        aiCompanion.status = 'Idle';
        
        // AI random actions
        if (aiCompanion.actionTimer % 120 === 0) {
            const actions = ['Mining', 'Exploring', 'Resting', 'Gathering'];
            aiCompanion.status = actions[Math.floor(Math.random() * actions.length)];
        }
    }
    
    updateAIStatus();
}

function updateAIStatus() {
    document.getElementById('aiName').textContent = `Companion: ${aiCompanion.name}`;
    document.getElementById('aiAction').textContent = `Status: ${aiCompanion.status}`;
    document.getElementById('aiHealth').textContent = `Health: ${aiCompanion.health}/${aiCompanion.maxHealth}`;
}

// Player Movement
function movePlayer(direction) {
    playerState.moveDirection = direction;
    playerState.moving = true;
}

function stopMove() {
    playerState.moving = false;
    playerState.moveDirection = null;
}

function updatePlayerPosition() {
    if (!playerState.moving || !playerState.moveDirection) return;
    
    const speed = playerState.speed;
    
    switch(playerState.moveDirection) {
        case 'up':
            if (playerState.y > 80) playerState.y -= speed;
            playerState.direction = 'up';
            break;
        case 'down':
            if (playerState.y < 568) playerState.y += speed;
            playerState.direction = 'down';
            break;
        case 'left':
            if (playerState.x > 0) playerState.x -= speed;
            playerState.direction = 'left';
            break;
        case 'right':
            if (playerState.x < 768) playerState.x += speed;
            playerState.direction = 'right';
            break;
    }
    
    // Hunger depletion
    if (playerState.hunger > 0) {
        playerState.hunger -= 0.001;
    } else if (playerState.health > 1) {
        playerState.health -= 0.01;
    }
}

function playerAction() {
    // Random resource gathering
    const resources = ['wood', 'stone', 'dirt'];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    
    let inventoryItem = playerState.inventory.find(item => item.id === resource);
    if (inventoryItem) {
        inventoryItem.count += Math.floor(Math.random() * 3) + 1;
    } else {
        playerState.inventory.push({
            id: resource,
            name: resource.charAt(0).toUpperCase() + resource.slice(1),
            count: 1
        });
    }
    
    // Damage
    playerState.hunger -= 0.5;
    
    renderInventory();
    createParticle(playerState.x, playerState.y, '✨');
}

function createParticle(x, y, emoji) {
    gameWorld.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * -2 - 1,
        life: 60,
        emoji: emoji
    });
}

// Update particles
function updateParticles() {
    gameWorld.particles = gameWorld.particles.filter(p => p.life > 0);
    gameWorld.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life--;
    });
}

function drawParticles() {
    gameWorld.particles.forEach(p => {
        ctx.globalAlpha = p.life / 60;
        ctx.font = '16px Arial';
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.globalAlpha = 1;
    });
}

// UI Updates
function updateHealthUI() {
    const healthPercent = (playerState.health / playerState.maxHealth) * 100;
    document.getElementById('health').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = `${Math.ceil(playerState.health)}/${playerState.maxHealth}`;
}

function updateHungerUI() {
    const hungerPercent = (playerState.hunger / playerState.maxHunger) * 100;
    document.getElementById('hunger').style.width = hungerPercent + '%';
    document.getElementById('hungerText').textContent = `${Math.ceil(playerState.hunger)}/${playerState.maxHunger}`;
}

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw world
    gameWorld.blocks.forEach(block => {
        drawBlock(block.x, block.y, block.type);
    });
    
    // Update and draw
    updatePlayerPosition();
    updateAICompanion();
    updateParticles();
    
    // Draw player
    drawPlayer(playerState.x, playerState.y);
    
    // Draw AI
    if (gameState.aiCompanionEnabled) {
        drawPlayer(aiCompanion.x, aiCompanion.y, true);
    }
    
    // Draw particles
    drawParticles();
    
    // Update UI
    updateHealthUI();
    updateHungerUI();
    
    // Game over check
    if (playerState.health <= 0) {
        gameRunning = false;
        alert('You died! Game Over.');
        backToMenu();
        return;
    }
    
    requestAnimationFrame(gameLoop);
}

// Add-ons
function renderAddOns() {
    const addonsList = document.getElementById('addonsList');
    addonsList.innerHTML = '';
    
    addOns.forEach(addon => {
        const card = document.createElement('div');
        card.className = 'addon-card';
        card.innerHTML = `
            <h3>${addon.name}</h3>
            <p>${addon.description}</p>
            <button class="addon-toggle ${addon.enabled ? '' : 'disabled'}" 
                    onclick="toggleAddOn('${addon.id}')">
                ${addon.enabled ? 'ENABLED' : 'DISABLED'}
            </button>
        `;
        addonsList.appendChild(card);
    });
}

function toggleAddOn(addonId) {
    const addon = addOns.find(a => a.id === addonId);
    if (addon) {
        addon.enabled = !addon.enabled;
        renderAddOns();
    }
}

// Settings
function loadSettingsUI() {
    document.getElementById('volumeControl').value = gameState.volume;
    document.getElementById('difficultySelect').value = gameState.difficulty;
    document.getElementById('aiDifficultySelect').value = gameState.aiDifficulty;
    document.getElementById('aiCompanion').checked = gameState.aiCompanionEnabled;
    
    // Add event listeners
    document.getElementById('volumeControl').oninput = (e) => {
        gameState.volume = e.target.value;
    };
    
    document.getElementById('difficultySelect').onchange = (e) => {
        gameState.difficulty = e.target.value;
    };
    
    document.getElementById('aiDifficultySelect').onchange = (e) => {
        gameState.aiDifficulty = e.target.value;
    };
    
    document.getElementById('aiCompanion').onchange = (e) => {
        gameState.aiCompanionEnabled = e.target.checked;
        updateAIStatus();
    };
}

// Save Game
function savegame() {
    const saveData = {
        playerState: playerState,
        aiCompanion: aiCompanion,
        gameState: gameState,
        timestamp: new Date().toLocaleString()
    };
    
    localStorage.setItem('minecraftSave', JSON.stringify(saveData));
    alert(`Game saved at ${saveData.timestamp}`);
    gameState.saved = true;
}

// Load Game
function loadGame() {
    const saveData = localStorage.getItem('minecraftSave');
    if (saveData) {
        const data = JSON.parse(saveData);
        playerState = data.playerState;
        aiCompanion = data.aiCompanion;
        gameState = data.gameState;
        return true;
    }
    return false;
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            movePlayer('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            movePlayer('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer('right');
            break;
        case ' ':
            playerAction();
            e.preventDefault();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'].includes(e.key)) {
        stopMove();
    }
});

// Initialize
window.addEventListener('load', () => {
    showScreen('startScreen');
});
