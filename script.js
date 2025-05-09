/**
 * Hexagon Animation
 * @author Feri Murdeni
 * @date 2025-05-09
 */

// Get canvas element and set its dimensions
const canvas = document.getElementById('hexagonCanvas');
const ctx = canvas.getContext('2d');

// Base hexagon dimensions for large screens
const BASE_HEXAGON_WIDTH = 100;
const BASE_HEXAGON_HEIGHT = 110;

// Responsive hexagon dimensions that will adjust based on screen size
let HEXAGON_WIDTH = BASE_HEXAGON_WIDTH;
let HEXAGON_HEIGHT = BASE_HEXAGON_HEIGHT;
let HEXAGON_SIZE = HEXAGON_WIDTH / 2;
let HORIZONTAL_SPACING = HEXAGON_WIDTH + 4; // Add 4px margin (matching CSS margin: 4px 2px)
let VERTICAL_SPACING = HEXAGON_HEIGHT + 8; // Add 8px margin for vertical spacing

// Function to calculate responsive hexagon size based on screen width
function calculateResponsiveHexagonSize() {
    const screenWidth = window.innerWidth;
    
    // Scale factor based on screen width (adjust these breakpoints as needed)
    let scaleFactor = 1;
    
    if (screenWidth < 480) { // Mobile phones
        scaleFactor = 0.5; // 50% of original size
    } else if (screenWidth < 768) { // Tablets
        scaleFactor = 0.7; // 70% of original size
    } else if (screenWidth < 1024) { // Small laptops
        scaleFactor = 0.85; // 85% of original size
    }
    
    // Update hexagon dimensions
    HEXAGON_WIDTH = BASE_HEXAGON_WIDTH * scaleFactor;
    HEXAGON_HEIGHT = BASE_HEXAGON_HEIGHT * scaleFactor;
    HEXAGON_SIZE = HEXAGON_WIDTH / 2;
    
    // Update spacing
    HORIZONTAL_SPACING = HEXAGON_WIDTH + (4 * scaleFactor);
    VERTICAL_SPACING = HEXAGON_HEIGHT + (8 * scaleFactor);
}

// Initialize grid dimensions
let GRID_COLUMNS = 0;
let GRID_ROWS = 0;

// Set canvas to full window size and full device resolution
function resizeCanvas() {
    // Get the device pixel ratio to handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set the canvas size in CSS pixels (visual size)
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '-1'; // Ensure canvas stays behind other content
    canvas.style.pointerEvents = 'none'; // Make canvas transparent to mouse events
    
    // Set actual canvas dimensions accounting for device pixel ratio
    // This ensures the canvas is full resolution on high DPI displays
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    
    // Scale the context to ensure consistent drawing regardless of DPI
    ctx.scale(dpr, dpr);
    
    // Calculate responsive hexagon size based on screen width
    calculateResponsiveHexagonSize();
    
    // Recalculate grid dimensions when canvas size changes
    calculateGridDimensions();
}

// Call resize on load and when window is resized
window.addEventListener('resize', () => {
    resizeCanvas();
    
    // If we have a hexagon manager, update the grid for the new size
    if (typeof hexagonManager !== 'undefined') {
        // Update positions of existing hexagons instead of recreating them
        hexagonManager.updateHexagonPositions();
        
        // Restart continuous ripple
        hexagonManager.startContinuousRipple();
    }
});

// Add scroll event listener for parallax effect
window.addEventListener('scroll', () => {
    if (typeof hexagonManager !== 'undefined') {
        // Update target scroll offset based on window scroll position
        hexagonManager.targetScrollOffset = window.scrollY * hexagonManager.parallaxFactor;
    }
});

resizeCanvas();



// Function to calculate grid dimensions based on current window size
function calculateGridDimensions() {
    // Add extra columns and rows to ensure the canvas is completely filled
    // Even if hexagons get partially cut off at the edges
    GRID_COLUMNS = Math.ceil(window.innerWidth / HORIZONTAL_SPACING) + 3;
    GRID_ROWS = Math.ceil(window.innerHeight / VERTICAL_SPACING) + 3;
}

// Initial calculation
calculateGridDimensions();

// Hexagon class to manage individual hexagons
class Hexagon {
    constructor(row, col) {
        // Calculate position based on grid coordinates
        this.row = row;
        this.col = col;
        this.size = HEXAGON_SIZE;
        
        // Store the original dimensions for recalculation on resize
        this.updatePosition();
        
        this.opacity = 0;
        this.targetOpacity = 0;
        this.animationSpeed = 0.01 + Math.random() * 0.01; // Much slower animation speed (0.01-0.02)
        this.lifespan = 1000 + Math.random() * 1000; // Longer lifespan between 1-2 seconds
        this.birthTime = Date.now();
        this.isHovered = false;
        this.hideAnimationSpeed = 0.01; // Slow hide animation speed (1 second transition)
    }
    
    // Method to update position based on current hexagon dimensions
    // This allows us to recalculate positions when screen size changes
    updatePosition() {
        // Calculate exact position for a true honeycomb pattern
        // In a honeycomb, each row is offset by half the width of a hexagon
        const isOddRow = this.row % 2 === 1;
        
        // Horizontal position - offset odd rows to create honeycomb pattern
        // For odd rows, position hexagons between the hexagons of even rows
        if (isOddRow) {
            // Odd rows are offset by half the horizontal spacing
            this.x = this.col * HORIZONTAL_SPACING + HORIZONTAL_SPACING / 2 + HORIZONTAL_SPACING / 2;
        } else {
            // Even rows are aligned normally
            this.x = this.col * HORIZONTAL_SPACING + HORIZONTAL_SPACING / 2;
        }
        
        // Vertical position - rows are closer together in a honeycomb
        // Use 75% of the vertical spacing to create the interlocking pattern
        this.y = this.row * (VERTICAL_SPACING * 0.75) + VERTICAL_SPACING / 2;
    }

    // Draw the hexagon on the canvas
    draw() {
        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = this.opacity * 0.4; // Reduced opacity to make it less prominent
        
        // Draw a hexagon with the same shape as CSS clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)
        ctx.beginPath();
        
        const width = HEXAGON_WIDTH * 0.9; // Slightly smaller to ensure no overlap
        const height = HEXAGON_HEIGHT * 0.9; // Slightly smaller to ensure no overlap
        
        // Calculate the points based on the clip-path polygon
        const halfWidth = width / 2;
        const x = this.x - halfWidth;
        const y = this.y - height / 2;
        
        // Draw the hexagon path matching the CSS clip-path
        ctx.moveTo(x + width * 0.5, y); // 50% 0%
        ctx.lineTo(x + width, y + height * 0.25); // 100% 25%
        ctx.lineTo(x + width, y + height * 0.75); // 100% 75%
        ctx.lineTo(x + width * 0.5, y + height); // 50% 100%
        ctx.lineTo(x, y + height * 0.75); // 0% 75%
        ctx.lineTo(x, y + height * 0.25); // 0% 25%
        
        ctx.closePath();
        
        // Transparent fill
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fill();
        
        // White border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        ctx.restore();
    }

    // Update the hexagon's state
    update() {
        // Determine which animation speed to use based on whether we're showing or hiding
        const currentAnimationSpeed = (this.targetOpacity > this.opacity) ? 
                                     this.animationSpeed : // For showing
                                     (this.hideAnimationSpeed || this.animationSpeed); // For hiding
        
        // Gradually approach the target opacity with appropriate speed
        this.opacity += (this.targetOpacity - this.opacity) * currentAnimationSpeed;
        
        // Update lifespan if visible
        if (this.opacity > 0.1 && this.lifespan > 0) {
            this.lifespan -= 16.67; // Approximate time for one frame at 60fps
            
            // Start fading out when lifespan is over
            if (this.lifespan <= 0 && !this.isHovered) {
                this.targetOpacity = 0;
            }
        }
        
        // Check if we're close enough to the target to consider it reached
        if (Math.abs(this.opacity - this.targetOpacity) < 0.001) {
            this.opacity = this.targetOpacity;
        }
        
        return this.opacity > 0.01; // Return true if still visible
    }

    // Show the hexagon
    show() {
        this.targetOpacity = 1;
        this.lifespan = Math.random() * 1500 + 1500; // Random lifespan between 1.5-3 seconds
        this.animationSpeed = 0.01 + Math.random() * 0.01; // Very slow appearance (0.01-0.02 range)
        this.hideAnimationSpeed = 0.01; // Slow hide animation speed (1 second transition)
        this.birthTime = Date.now(); // Reset lifespan
    }

    // Set hover state
    setHovered(isHovered) {
        // Handle mouse hover over a hexagon
        if (isHovered && !this.isHovered) {
            // When mouse enters, show it immediately but with a very short lifespan
            this.targetOpacity = 1;
            
            // Very short lifespan for hover effect (show briefly then hide)
            this.lifespan = 400; // Only visible for 400ms
            
            // Faster animation speed for hover show
            this.animationSpeed = 0.1; // Even faster show
            // Faster hide animation speed for hover
            this.hideAnimationSpeed = 0.05; // Faster fade-out (2.5x faster than before)
            
            // Reset birth time to start the short lifespan countdown
            this.birthTime = Date.now();
            
            // Set a timer to start hiding after a shorter delay
            setTimeout(() => {
                if (this.isHovered) {
                    this.targetOpacity = 0; // Start hiding even while still hovering
                }
            }, 200); // Start fading after 200ms (faster)
        }
        
        // Update the hover state
        this.isHovered = isHovered;
    }
}

// HexagonManager to manage all hexagons
class HexagonManager {
    constructor() {
        this.hexagons = [];
        this.hexagonGrid = {}; // To track which grid positions are occupied
        this.mouseX = 0;
        this.mouseY = 0;
        this.lastGroupShowTime = 0;
        this.groupShowInterval = 1500; // Show a new group every 1.5 seconds
        this.isShowingGroup = false;
        this.activeRipples = 0; // Track number of active ripple groups from interval-based ripples
        this.maxActiveRipples = 2; // Maximum number of interval-based active ripple groups
        this.continuousRippleActive = false; // Flag to track if continuous ripple is active
        this.continuousRippleQueue = []; // Queue for continuous ripple points
        
        // Enhanced parallax scrolling effect variables
        this.scrollOffset = 0;
        this.targetScrollOffset = 0; // Target position for smooth scrolling
        this.parallaxFactor = 0.08; // Reduced for slower, more subtle effect
        this.scrollEasing = 0.03; // Reduced for even smoother transitions
        
        // Store the last used hexagon dimensions for comparison during resize
        this.lastHexagonWidth = HEXAGON_WIDTH;
        this.lastHexagonHeight = HEXAGON_HEIGHT;
        
        // Set up mouse move listener on window instead of canvas to detect hover even when elements are above
        window.addEventListener('mousemove', (e) => {
            // Get canvas position to calculate relative mouse position
            const canvasRect = canvas.getBoundingClientRect();
            
            // Calculate mouse position relative to canvas
            this.mouseX = e.clientX - canvasRect.left;
            this.mouseY = e.clientY - canvasRect.top;
        });
        
        // Create the complete honeycomb grid structure immediately
        this.createCompleteHoneycombGrid();
        
        // Start the continuous ripple that will always be active and menjalar
        this.startContinuousRipple();
        
        // Start with a couple of interval-based ripples
        setTimeout(() => this.showRandomHexagonGroup(), 500);
        setTimeout(() => this.showRandomHexagonGroup(), 1000);
    }
    
    // Create the complete honeycomb grid structure
    createCompleteHoneycombGrid() {
        // Clear existing hexagons if any (for resize events)
        this.hexagons = [];
        this.hexagonGrid = {};
        
        // Create all hexagons in the grid at once
        // Start from negative row/col to ensure hexagons extend beyond the edges
        for (let row = -1; row < GRID_ROWS; row++) {
            for (let col = -1; col < GRID_COLUMNS; col++) {
                const gridKey = `${row},${col}`;
                
                // Create a new hexagon at this grid position
                const hexagon = new Hexagon(row, col);
                
                // Initially all hexagons are invisible
                hexagon.opacity = 0;
                hexagon.targetOpacity = 0;
                
                // Store grid coordinates for neighbor calculations
                hexagon.gridRow = row;
                hexagon.gridCol = col;
                
                // Mark this position as occupied
                this.hexagonGrid[gridKey] = hexagon;
                this.hexagons.push(hexagon);
            }
        }
        
        // Store current hexagon dimensions for comparison during resize
        this.lastHexagonWidth = HEXAGON_WIDTH;
        this.lastHexagonHeight = HEXAGON_HEIGHT;
    }
    
    // Update hexagon positions when screen size changes
    updateHexagonPositions() {
        // Check if dimensions have changed significantly
        const dimensionsChanged = 
            Math.abs(this.lastHexagonWidth - HEXAGON_WIDTH) > 1 || 
            Math.abs(this.lastHexagonHeight - HEXAGON_HEIGHT) > 1;
        
        if (dimensionsChanged) {
            // If grid dimensions changed significantly, we need to recreate the grid
            if (GRID_ROWS !== this.hexagons.length || GRID_COLUMNS !== this.hexagons[0]?.length) {
                this.createCompleteHoneycombGrid();
                return;
            }
            
            // Update positions of all existing hexagons
            for (const hexagon of this.hexagons) {
                hexagon.updatePosition();
            }
            
            // Store the new dimensions
            this.lastHexagonWidth = HEXAGON_WIDTH;
            this.lastHexagonHeight = HEXAGON_HEIGHT;
        }
    }
    
    // Get neighbors of a hexagon at given grid coordinates
    getNeighbors(row, col) {
        const neighbors = [];
        const isOddRow = row % 2 === 1;
        
        // Define neighbor directions based on whether the row is odd or even
        // For hexagonal grid, each hexagon has 6 neighbors
        const directions = [
            [-1, isOddRow ? 0 : -1], // top-left
            [-1, isOddRow ? 1 : 0],  // top-right
            [0, -1],                  // left
            [0, 1],                   // right
            [1, isOddRow ? 0 : -1],   // bottom-left
            [1, isOddRow ? 1 : 0]     // bottom-right
        ];
        
        // Check each direction
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            // Check if the neighbor is within grid bounds
            if (newRow >= 0 && newRow < GRID_ROWS && newCol >= 0 && newCol < GRID_COLUMNS) {
                const gridKey = `${newRow},${newCol}`;
                const neighbor = this.hexagonGrid[gridKey];
                
                if (neighbor) {
                    neighbors.push(neighbor);
                }
            }
        }
        
        return neighbors;
    }
    
    // Show a rippling wave of hexagons that spreads outward (interval-based)
    showRandomHexagonGroup() {
        // Check if we've reached the maximum number of active interval-based ripple groups
        if (this.activeRipples >= this.maxActiveRipples) {
            return; // Don't create more ripples if we've reached the maximum
        }
        
        // Find all invisible hexagons
        const invisibleHexagons = this.hexagons.filter(h => h.opacity < 0.1);
        
        if (invisibleHexagons.length > 0) {
            // Pick a random invisible hexagon as the center of the ripple
            const randomIndex = Math.floor(Math.random() * invisibleHexagons.length);
            const centerHexagon = invisibleHexagons[randomIndex];
            
            // Check if there are any active hexagons nearby (with further reduced minimum distance)
            const minDistance = 3; // Minimum distance between groups
            let tooClose = false;
            
            // Check all hexagons to see if any active ones are too close
            for (const hexagon of this.hexagons) {
                if (hexagon.opacity > 0.1) { // If it's visible/active
                    // Calculate grid distance between this hexagon and the center
                    const rowDiff = Math.abs(hexagon.gridRow - centerHexagon.gridRow);
                    const colDiff = Math.abs(hexagon.gridCol - centerHexagon.gridCol);
                    
                    // Adjust for hexagonal grid
                    const isOddCenterRow = centerHexagon.gridRow % 2 === 1;
                    const isOddRow = hexagon.gridRow % 2 === 1;
                    let adjustedDistance;
                    
                    if (isOddCenterRow === isOddRow) {
                        // Same parity rows
                        adjustedDistance = Math.max(rowDiff, colDiff);
                    } else {
                        // Different parity rows
                        adjustedDistance = rowDiff + Math.max(0, colDiff - Math.floor(rowDiff / 2));
                    }
                    
                    // If an active hexagon is too close, don't create a ripple here
                    if (adjustedDistance < minDistance) {
                        tooClose = true;
                        break;
                    }
                }
            }
            
            // Only create a ripple if we're not too close to another active group
            if (!tooClose) {
                // Create a ripple effect starting from the center with more waves
                this.createRippleEffect(centerHexagon.gridRow, centerHexagon.gridCol, 4); // Ripple with 4 waves for wider spread
            } else {
                // Try again with a different random hexagon
                setTimeout(() => this.showRandomHexagonGroup(), 500);
            }
        }
    }
    
    // Create a ripple effect that spreads outward from a center point
    createRippleEffect(centerRow, centerCol, maxWaves) {
        // Check if we've reached the maximum number of active ripple groups
        if (this.activeRipples >= this.maxActiveRipples) {
            return; // Don't create more ripples if we've reached the maximum
        }
        
        // Increment the active ripples counter
        this.activeRipples++;
        
        // Track hexagons we've already included in the ripple
        const processedHexagons = new Set();
        
        // Start with the center hexagon
        const centerKey = `${centerRow},${centerCol}`;
        const centerHexagon = this.hexagonGrid[centerKey];
        
        if (!centerHexagon) {
            this.activeRipples--; // Decrement if we can't create the ripple
            return;
        }
        
        // Show the center hexagon immediately
        centerHexagon.show();
        processedHexagons.add(centerKey);
        
        // Create waves that spread outward continuously
        for (let wave = 1; wave <= maxWaves; wave++) {
            // Get all hexagons at this wave distance
            const waveHexagons = this.getHexagonsAtDistance(centerRow, centerCol, wave, processedHexagons);
            
            // Show each hexagon in the wave with increasing delay based on wave number and position
            const baseDelay = wave * 2000; // Extremely slow delay (2 seconds per wave)
            
            // Create an array of indices and shuffle it to randomize the order
            const indices = Array.from({ length: waveHexagons.length }, (_, i) => i);
            this.shuffleArray(indices);
            
            // Limit to 6 hexagons per wave (reduced from all hexagons in wave)
            const limitedHexagons = waveHexagons.slice(0, 6);
            
            // Assign each hexagon a unique show and hide delay
            limitedHexagons.forEach((hexagon, i) => {
                // Use the shuffled index to ensure no two hexagons have the same delay
                const index = indices[i];
                
                // Create a unique show delay for each hexagon with 500ms between each hexagon (faster but still staggered)
                const showDelay = baseDelay + i * 500; // 500ms between each hexagon (twice as fast)
                
                setTimeout(() => {
                    hexagon.show();
                    
                    // Create a unique hide delay for each hexagon
                    // Base hide delay plus a unique offset for each hexagon
                    const hideDelay = 3000 + index * 500; // Much longer visibility (3s, 3.5s, 4s, etc.)
                    
                    setTimeout(() => {
                        hexagon.targetOpacity = 0;
                        // Set slow hide animation speed for interval-based ripple (1 second transition)
                        hexagon.hideAnimationSpeed = 0.01;
                        
                        // If this is the last wave, potentially start a new ripple from here
                        if (wave === maxWaves) {
                            // Check if we should continue the ripple
                            if (Math.random() < 0.25 && this.activeRipples < this.maxActiveRipples) { // 25% chance to continue the ripple (increased from 15%)
                                // Unique delay for starting new ripples
                                const newRippleDelay = 2000 + index * 300; // Faster new ripple start for better coverage
                                
                                setTimeout(() => {
                                    // Start a new smaller ripple from this point
                                    this.createRippleEffect(hexagon.gridRow, hexagon.gridCol, 2);
                                }, newRippleDelay);
                            }
                            
                            // If this is the last hexagon in the group, decrement the active ripples counter
                            if (i === waveHexagons.length - 1) {
                                // Use a timeout to ensure all animations in this ripple have completed
                                setTimeout(() => {
                                    this.activeRipples = Math.max(0, this.activeRipples - 1); // Ensure it doesn't go below 0
                                }, 2500); // Wait longer to ensure all animations are complete
                            }
                        }
                    }, hideDelay);
                    
                }, showDelay);
            });
        }
    }
    
    // Get all hexagons at a specific distance from the center
    getHexagonsAtDistance(centerRow, centerCol, distance, processedHexagons) {
        const result = [];
        
        // For each hexagon in the grid
        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLUMNS; col++) {
                const gridKey = `${row},${col}`;
                
                // Skip if already processed
                if (processedHexagons.has(gridKey)) continue;
                
                const hexagon = this.hexagonGrid[gridKey];
                if (!hexagon) continue;
                
                // Calculate the grid distance (not Euclidean)
                // This is an approximation for hexagonal grid distance
                const rowDiff = Math.abs(row - centerRow);
                const colDiff = Math.abs(col - centerCol);
                
                // Adjust for hexagonal grid
                const isOddCenterRow = centerRow % 2 === 1;
                const isOddRow = row % 2 === 1;
                let adjustedDistance;
                
                if (isOddCenterRow === isOddRow) {
                    // Same parity rows
                    adjustedDistance = Math.max(rowDiff, colDiff);
                } else {
                    // Different parity rows
                    adjustedDistance = rowDiff + Math.max(0, colDiff - Math.floor(rowDiff / 2));
                }
                
                // If this hexagon is at the right distance
                if (adjustedDistance === distance) {
                    result.push(hexagon);
                    processedHexagons.add(gridKey);
                }
            }
        }
        
        // Instead of randomly selecting hexagons, select a connected group of hexagons
        // This ensures that hexagons in the same wave are always adjacent to each other
        if (result.length > 8) { // Increased from 5 to 8 maximum hexagons per group
            // Start with a random hexagon from the result
            const startIndex = Math.floor(Math.random() * result.length);
            const startHexagon = result[startIndex];
            
            // Create a new array with the starting hexagon
            const connectedGroup = [startHexagon];
            
            // Keep track of which hexagons we've already considered
            const considered = new Set([`${startHexagon.gridRow},${startHexagon.gridCol}`]);
            
            // Find adjacent hexagons in the same wave
            let candidates = [startHexagon];
            
            // Continue until we have 8 hexagons or no more candidates
            while (connectedGroup.length < 8 && candidates.length > 0) {
                // Get a new set of candidates by finding neighbors of current candidates
                const newCandidates = [];
                
                for (const candidate of candidates) {
                    // Find neighbors that are in the same wave (same distance from center)
                    for (const hexagon of result) {
                        const key = `${hexagon.gridRow},${hexagon.gridCol}`;
                        
                        // Skip if already considered
                        if (considered.has(key)) continue;
                        
                        // Check if this hexagon is adjacent to the candidate
                        const rowDiff = Math.abs(hexagon.gridRow - candidate.gridRow);
                        const colDiff = Math.abs(hexagon.gridCol - candidate.gridCol);
                        
                        // Adjust for hexagonal grid
                        const isOddCandidateRow = candidate.gridRow % 2 === 1;
                        const isOddHexagonRow = hexagon.gridRow % 2 === 1;
                        
                        // Check if they're adjacent in the hexagonal grid
                        let isAdjacent = false;
                        
                        if (rowDiff === 0 && colDiff === 1) {
                            // Same row, adjacent column
                            isAdjacent = true;
                        } else if (rowDiff === 1) {
                            // Adjacent row
                            if (isOddCandidateRow === isOddHexagonRow) {
                                // Same parity rows
                                isAdjacent = (colDiff === 0);
                            } else {
                                // Different parity rows
                                isAdjacent = (colDiff === 0 || colDiff === 1);
                            }
                        }
                        
                        if (isAdjacent) {
                            connectedGroup.push(hexagon);
                            considered.add(key);
                            newCandidates.push(hexagon);
                            
                            // Stop if we've reached 8 hexagons
                            if (connectedGroup.length >= 8) break;
                        }
                    }
                    
                    // Stop if we've reached 8 hexagons
                    if (connectedGroup.length >= 8) break;
                }
                
                // Update candidates for next iteration
                candidates = newCandidates;
            }
            
            return connectedGroup;
        }
        
        // If there are 5 or fewer hexagons, return them all
        return result;
    }
    
    // Fisher-Yates shuffle algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Find the closest hexagon to a point
    findClosestHexagon(x, y) {
        // If mouse is outside canvas bounds, return null
        if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
            return null;
        }
        
        let closest = null;
        let minDistance = Infinity;
        
        for (const hexagon of this.hexagons) {
            const distance = Math.sqrt(Math.pow(x - hexagon.x, 2) + Math.pow(y - hexagon.y, 2));
            if (distance < minDistance && distance <= HEXAGON_SIZE * 1.5) {
                minDistance = distance;
                closest = hexagon;
            }
        }
        
        return closest;
    }

    // Update all hexagons
    update() {
        // Create continuous ripple effects
        this.createContinuousRipples();
        
        // Find hexagon under mouse
        const hoveredHexagon = this.findClosestHexagon(this.mouseX, this.mouseY);
        
        // Update all hexagons
        this.hexagons.forEach(hexagon => {
            // Check if this is the hovered hexagon
            hexagon.setHovered(hexagon === hoveredHexagon);
            
            // Update the hexagon
            hexagon.update();
        });
    }
    
    // Start a continuous ripple that will always be active and menjalar across the entire page
    startContinuousRipple() {
        // Find a random starting point
        const row = Math.floor(Math.random() * GRID_ROWS);
        const col = Math.floor(Math.random() * GRID_COLUMNS);
        
        // Start the first continuous ripple
        this.createContinuousRippleEffect(row, col);
    }
    
    // Create a continuous ripple effect that will always find new points to ripple from
    createContinuousRippleEffect(startRow, startCol) {
        // Mark that we have an active continuous ripple
        this.continuousRippleActive = true;
        
        // Create a ripple with a callback to continue the chain
        this.createRippleWithCallback(startRow, startCol, 3, (endRow, endCol) => {
            // Queue the next ripple point with a small delay
            setTimeout(() => {
                // Start a new ripple from this end point
                this.createContinuousRippleEffect(endRow, endCol);
            }, 500); // Small delay to avoid too much overlap
        });
    }
    
    // Create a ripple effect with a callback when it's done
    createRippleWithCallback(centerRow, centerCol, maxWaves, callback) {
        // Track hexagons we've already included in the ripple
        const processedHexagons = new Set();
        
        // Start with the center hexagon
        const centerKey = `${centerRow},${centerCol}`;
        const centerHexagon = this.hexagonGrid[centerKey];
        
        if (!centerHexagon) {
            // If invalid center, try a random point
            const row = Math.floor(Math.random() * GRID_ROWS);
            const col = Math.floor(Math.random() * GRID_COLUMNS);
            callback(row, col);
            return;
        }
        
        // Show the center hexagon immediately
        centerHexagon.show();
        processedHexagons.add(centerKey);
        
        // Keep track of the last hexagon in the last wave
        let lastHexagon = centerHexagon;
        
        // Create waves that spread outward continuously
        for (let wave = 1; wave <= maxWaves; wave++) {
            // Get all hexagons at this wave distance
            const waveHexagons = this.getHexagonsAtDistance(centerRow, centerCol, wave, processedHexagons);
            
            // Show each hexagon in the wave with increasing delay
            const baseDelay = wave * 1000; // 1 second per wave
            
            // Create an array of indices and shuffle it to randomize the order
            const indices = Array.from({ length: waveHexagons.length }, (_, i) => i);
            this.shuffleArray(indices);
            
            // Limit to 6 hexagons per wave (reduced from 8)
            const limitedHexagons = waveHexagons.slice(0, 6);
            
            // Assign each hexagon a unique show and hide delay
            limitedHexagons.forEach((hexagon, i) => {
                // Use the shuffled index to ensure no two hexagons have the same delay
                const index = indices[i];
                
                // Create a unique show delay for each hexagon
                const showDelay = baseDelay + i * 500; // 500ms between each hexagon
                
                setTimeout(() => {
                    hexagon.show();
                    
                    // Keep track of the last hexagon in the last wave
                    if (wave === maxWaves && i === limitedHexagons.length - 1) {
                        lastHexagon = hexagon;
                    }
                    
                    // Create a unique hide delay for each hexagon
                    const hideDelay = 3000 + index * 500; // Longer visibility
                    
                    setTimeout(() => {
                        hexagon.targetOpacity = 0;
                        // Set slow hide animation speed for continuous ripple (1 second transition)
                        hexagon.hideAnimationSpeed = 0.01;
                        
                        // If this is the last hexagon in the last wave, call the callback
                        if (hexagon === lastHexagon) {
                            // Call the callback with the position of the last hexagon
                            callback(hexagon.gridRow, hexagon.gridCol);
                        }
                    }, hideDelay);
                }, showDelay);
            });
        }
    }
    
    // Create interval-based ripple effects across the grid
    createContinuousRipples() {
        const currentTime = Date.now();
        
        // Start a new interval-based ripple at regular intervals
        if (currentTime - this.lastGroupShowTime > this.groupShowInterval) {
            this.showRandomHexagonGroup();
            this.lastGroupShowTime = currentTime;
        }
        
        // Check if we have fewer than the maximum allowed active ripples
        // This ensures we always try to keep the maximum number of active ripples
        if (this.activeRipples < this.maxActiveRipples) {
            // Try to start a new ripple immediately
            this.showRandomHexagonGroup();
        }
    }

    // Draw all hexagons
    draw() {
        this.hexagons.forEach(hexagon => hexagon.draw());
    }
}

// Create the hexagon manager
const hexagonManager = new HexagonManager();

// Animation loop
function animate() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Smoothly update scroll offset for parallax effect
    hexagonManager.scrollOffset += (hexagonManager.targetScrollOffset - hexagonManager.scrollOffset) * hexagonManager.scrollEasing;
    
    // Apply parallax scrolling effect with different layers for depth
    ctx.save();
    
    // Main layer translation
    ctx.translate(0, -hexagonManager.scrollOffset);
    
    // Update and draw hexagons
    hexagonManager.update();
    hexagonManager.draw();
    
    ctx.restore();
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Start the animation
animate();
