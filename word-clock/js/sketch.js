var canvas;
var myFrameCount = 0;
var shapeCount = 100;

function setup() {
    frameRate(4);
    canvas = createCanvas(windowWidth, windowHeight);
    angleMode(DEGREES);
    noStroke();
    background(random(360));
}

function draw() {
    push();

    translate(random(width), random(height));
    rotate(random(360));

    colorMode(HSB);
    fill(random(45) + 190, 100, 100, 0.35);

    let shapeType = floor(random(3));
    let shapeSize = random(150, 250);

    if (shapeType == 0) {
        rect(0, 0, shapeSize, shapeSize);
    } else if (shapeType == 1) {
        ellipse(0, 0, shapeSize, shapeSize);
    } else {
        let x1 = random(width);
        let y1 = random(height);
        let x2 = random(width);
        let y2 = random(height);
        let x3 = random(width);
        let y3 = random(height);

        triangle(x1, y1, x2, y2, x3, y3);
    }

    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background("#FF3366");
}
