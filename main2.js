// ========== PARAMETERS ==========
let errorRate; // will be loaded from JSON

// Grid setup
let gridSpacing = 75; // Distance between grid points
let gridCols;
let gridRows;

// Animation
let time = 0;
let timeSpeed = 0.01;

// Calculated parameters (based on error rate)
let waveAmplitude; // How much the grid moves
let waveFrequency; // How tight/loose the waves are
let chaosAmount; // How much random noise is added
let numStrips; // Number of horizontal strips to display
let stripHeight; // Height of each strip
let gapHeight; // Height of gaps between strips

function preload() {
    loadJSON('error_rate.json', (data) => {
        errorRate = data.error;
    });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateParameters();

    // Calculate grid dimensions with extra buffer to avoid blank edges
    gridCols = floor(width / gridSpacing) + 6;
    gridRows = floor(height / gridSpacing) + 6;
}

function calculateParameters() {
    if (errorRate === undefined) errorRate = 0.17;

    // At HIGH error (17%): choppy chaotic waves
    // At LOW error (0%): smooth harmonious waves
    let errorNormalized = errorRate / 0.17; // 1.0 at high error, 0.0 at low error

    waveAmplitude = 20 + errorNormalized * 80; // 20px to 100px
    waveFrequency = 0.02 + errorNormalized * 0.05; // Low freq = smooth, high freq = choppy (reduced max)
    chaosAmount = errorNormalized * 1.5; // 0 to 1.5 (reduced noise amount)

    // Number of strips = error rate as percentage (17% = 17 strips)
    numStrips = round(errorRate * 100);
    if (numStrips === 0) numStrips = 1; // Always show at least 1 strip

    // Calculate strip dimensions - no gaps, colors are the separators
    gapHeight = 0;
    stripHeight = height / numStrips;
}

function draw() {
    background(255); // Full white background

    time += timeSpeed;

    // Draw alternating gray backgrounds
    noStroke();
    fill('#E8E8E8'); // Light gray (slightly darker)
    for (let s = 0; s < numStrips; s++) {
        if (s % 2 === 1) { // Every other strip
            let stripY = s * (stripHeight + gapHeight);
            rect(0, stripY, width, stripHeight);
        }
    }

    // Draw wave grid with black lines on white strips (even indices)
    for (let s = 0; s < numStrips; s++) {
        if (s % 2 === 0) { // White background strips
            let stripY = s * (stripHeight + gapHeight);

            push();
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.rect(0, stripY, width, stripHeight);
            drawingContext.clip();

            stroke('#208AAE'); // Blue from vi-task-automation
            strokeWeight(2);
            noFill();

            // Draw horizontal lines
            for (let row = 0; row < gridRows; row++) {
                beginShape();
                for (let col = 0; col < gridCols; col++) {
                    let x = col * gridSpacing - gridSpacing * 3;
                    let y = row * gridSpacing - gridSpacing * 3;
                    let wave = calculateWaveOffset(x, y, time);
                    vertex(x + wave.x, y + wave.y);
                }
                endShape();
            }

            // Draw vertical lines
            for (let col = 0; col < gridCols; col++) {
                beginShape();
                for (let row = 0; row < gridRows; row++) {
                    let x = col * gridSpacing - gridSpacing * 3;
                    let y = row * gridSpacing - gridSpacing * 3;
                    let wave = calculateWaveOffset(x, y, time);
                    vertex(x + wave.x, y + wave.y);
                }
                endShape();
            }

            drawingContext.restore();
            pop();
        }
    }

    // Draw wave grid with red lines on blue strips (odd indices)
    for (let s = 0; s < numStrips; s++) {
        if (s % 2 === 1) { // Blue background strips
            let stripY = s * (stripHeight + gapHeight);

            push();
            drawingContext.save();
            drawingContext.beginPath();
            drawingContext.rect(0, stripY, width, stripHeight);
            drawingContext.clip();

            stroke('#1B2F33'); // Dark teal/black from data-entry-automation
            strokeWeight(2);
            noFill();

            // Draw horizontal lines
            for (let row = 0; row < gridRows; row++) {
                beginShape();
                for (let col = 0; col < gridCols; col++) {
                    let x = col * gridSpacing - gridSpacing * 3;
                    let y = row * gridSpacing - gridSpacing * 3;
                    let wave = calculateWaveOffset(x, y, time);
                    vertex(x + wave.x, y + wave.y);
                }
                endShape();
            }

            // Draw vertical lines
            for (let col = 0; col < gridCols; col++) {
                beginShape();
                for (let row = 0; row < gridRows; row++) {
                    let x = col * gridSpacing - gridSpacing * 3;
                    let y = row * gridSpacing - gridSpacing * 3;
                    let wave = calculateWaveOffset(x, y, time);
                    vertex(x + wave.x, y + wave.y);
                }
                endShape();
            }

            drawingContext.restore();
            pop();
        }
    }

    drawErrorLabel();
}

function calculateWaveOffset(x, y, t) {
    // Add phase offsets to prevent perfect synchronization
    let phaseX = x * 0.003; // Slight phase shift based on x position
    let phaseY = y * 0.003; // Slight phase shift based on y position

    // Primary wave (smooth sine waves) with phase offsets
    let offsetX = sin(y * waveFrequency + t + phaseX) * waveAmplitude;
    let offsetY = cos(x * waveFrequency + t + phaseY) * waveAmplitude;

    // Add chaos/noise based on error rate
    if (chaosAmount > 0) {
        let noiseX = noise(x * 0.01, y * 0.01, t * 0.5) - 0.5;
        let noiseY = noise(x * 0.01 + 100, y * 0.01 + 100, t * 0.5) - 0.5;

        offsetX += noiseX * waveAmplitude * chaosAmount;
        offsetY += noiseY * waveAmplitude * chaosAmount;
    }

    return { x: offsetX, y: offsetY };
}

function drawErrorLabel() {
    let label = `Sales Forecasting Error ${(errorRate * 100).toFixed(1)}%`;

    textSize(32);
    textStyle(BOLD);
    let textW = textWidth(label);

    let pad = 20;
    let innerPad = 16;
    let boxW = textW + innerPad * 2;
    let boxH = 50;
    let x = width - pad - boxW;
    let y = pad;

    // Draw background box
    noStroke();
    fill(255, 238);
    rect(x, y, boxW, boxH, 8);

    // Draw border
    stroke(0, 40);
    noFill();
    rect(x, y, boxW, boxH, 8);

    // Draw text
    noStroke();
    fill(180, 0, 0, 200);
    textAlign(LEFT, CENTER);
    text(label, x + innerPad, y + boxH / 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateParameters();
    gridCols = floor(width / gridSpacing) + 6;
    gridRows = floor(height / gridSpacing) + 6;
}
