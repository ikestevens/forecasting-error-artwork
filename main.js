// ========== PARAMETERS ==========
let errorRate; // will be loaded from JSON

let baseDistortion = 0.7;
let baseMaxAmplitude = 300;
let baseRectWidth = 10;
let baseRectHeight = 120;

// Control how much each parameter changes as error decreases
let distortionChangeRate = 0.15;
let amplitudeChangeRate = 250;
let widthChangeRate = 50;
let heightChangeRate = 300;

// Calculated parameters (don't edit these)
let distortionAmount;
let maxAmplitude;
let rectWidth;
let rectHeight;

// ========== VARIABLES ==========
let rectangles = [];
let waveSpeed = 0.2;
let rectSpacing = 8;
let numRects;
let offset = 0;

function preload() {
    // Load error rate from JSON before setup
    loadJSON('error_rate.json', (data) => {
        errorRate = data.error; // expects { "error": 0.163 }
    });
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    calculateParameters();
    initializeRectangles();
}

function calculateParameters() {
    if (errorRate === undefined) errorRate = 0.16; // fallback
    // Calculate parameters based on error rate
    let errorDiff = (0.16 - errorRate) / (0.16 - 0.00);

    distortionAmount = baseDistortion - (distortionChangeRate * errorDiff);
    maxAmplitude = baseMaxAmplitude - (amplitudeChangeRate * errorDiff);
    rectWidth = baseRectWidth + (widthChangeRate * errorDiff);
    rectHeight = baseRectHeight + (heightChangeRate * errorDiff);
}

function initializeRectangles() {
    rectangles = [];
    let totalRectWidth = rectWidth + rectSpacing;
    numRects = ceil(width / totalRectWidth) + 2;
    for (let i = 0; i < numRects; i++) {
        rectangles.push({ x: -totalRectWidth/2 + i * totalRectWidth });
    }
}

function draw() {
    background(255);
    drawErrorBand();

    for (let i = 0; i < rectangles.length; i++) {
        let r = rectangles[i];
        let centerY = height / 2;
        let wavePosition = r.x + offset;

        let frequencyNoise = noise(wavePosition * 0.002);
        let frequency = 0.005 + (0.02 * frequencyNoise);

        let amplitudeNoise = noise(wavePosition * 0.003 + 1000);
        let amplitude = 20 + (maxAmplitude * amplitudeNoise);

        let t = wavePosition * frequency;
        let y = centerY + amplitude * sin(t);

        noFill();
        stroke(0);
        strokeWeight(2);
        rectMode(CENTER);
        rect(r.x, y, rectWidth, rectHeight);

        r.x += waveSpeed;
        let totalRectWidth = rectWidth + rectSpacing;
        if (r.x - totalRectWidth / 2 > width) {
            let minX = Math.min(...rectangles.map(rec => rec.x));
            r.x = minX - totalRectWidth;
        }
    }

    offset += waveSpeed;
}

function drawErrorBand() {
    let centerY = height / 2;

    // Compute effective swing including rectangle height
    let maxAmplitudeEffective = maxAmplitude + rectHeight / 2;
    let bandHeight = maxAmplitudeEffective * 2;
    let topY = centerY - maxAmplitudeEffective;

    noStroke();
    fill(255, 100, 100, 60);
    rectMode(CORNER);
    rect(0, topY, width, bandHeight);

    let label = `Sales Forecasting Error ${(errorRate * 100).toFixed(1)}%`;
    textAlign(RIGHT, BOTTOM);
    textSize(32);
    textStyle(BOLD);
    fill(180, 0, 0, 180);
    let pad = 20;
    text(label, width - pad, topY + bandHeight - pad);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    calculateParameters();
    initializeRectangles();
}
