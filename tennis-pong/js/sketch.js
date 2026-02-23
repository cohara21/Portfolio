
const STATE_ERROR = -1;
const STATE_WELCOME = 0;
const STATE_DIFFICULTY_SELECT = 1;
const STATE_PLAYING = 2;
const STATE_SCORE = 3;
const STATE_WINNER = 4;
var cpuDifficulty = "easy";
var currentState = 0;
var canvas;
var backButton;
const SPACE = 32;
const A = 65;
const Z = 90;


// Arrays to hold assets and current selection variables
let backgroundImages = [];
let selectedBackground;

let homeImages = [];
let selectedHome;

let loserVideos = [];
let selectedLoser;

let winnerVideos = [];
let selectedWinner;

let selectedVideo = null;

let racquetImages = [];
let selectedLeftRacquet, selectedRightRacquet;

let ballSoundFX;


var ballDiameter = 6; // Percentage of vmin
var racketWidth = 3; // Percentage of width
var racketHeight = 30; // Percentage of height
var ballMinVelocityH = 15; // Percent of width
var ballMaxVelocityH = 45; // Percent of width
var racketAccelerationFactor = 1.5;
var racketFrictionFactor = 0.9;
var leftRacketForce = 0; // 1, 0, -1
var rightRacketForce = 0; // 1, 0, -1
var leftRacket = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    yVelocity: 0
}
var rightRacket = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    yVelocity: 0
}
var ball = {
    x: 0,
    y: 0,
    diameter: 0,
    xVelocity: 0,
    yVelocity: 0,
    frameCountAtLastBounce: 0
}
var debounceForFrames = 5;
var score = {
    left: 0,
    right: 0
}
var scoreLimit = 3;
var scoreTimeout;
var scoreTimeoutDelay = 3000; // Milliseconds (0.001 seconds)

var myHue = 270;


// Function to Preloads assets
function preload() {
    backgroundImages = [
        loadImage('assets/background1.png'),
        loadImage('assets/background2.png'),
        loadImage('assets/background3.png'),
        loadImage('assets/background4.png'),
        loadImage('assets/background5.png'),
        loadImage('assets/background6.png'),
        loadImage('assets/background7.png'),
        loadImage('assets/background8.png'),
        loadImage('assets/background9.png')
    ];

    homeImages = [
        loadImage('assets/homescreen1.png'),
        loadImage('assets/homescreen2.png'),
        loadImage('assets/homescreen3.png'),
        loadImage('assets/homescreen4.png'),
        loadImage('assets/homescreen5.png'),
        loadImage('assets/homescreen6.png'),
        loadImage('assets/homescreen7.png'),
        loadImage('assets/homescreen8.png'),
        loadImage('assets/homescreen9.png'),
        loadImage('assets/homescreen10.png'),
        loadImage('assets/homescreen11.png'),
        loadImage('assets/homescreen12.png')
    ];

    // Racquet pictures
    for (let i = 1; i <= 4; i++) {
        racquetImages.push(loadImage("assets/racquet" + i + ".png"));
    }
    

    // ball sound fx
    ballSoundFX = loadSound('assets/ballsoundfx.mp3', () => {
        console.log('Sound loaded successfully');
    });

    // load videos
    for (let i = 1; i <= 5; i++) {
        let video = createVideo("assets/loser" + i + ".mp4");
        video.hide(); 
        loserVideos.push(video);
    }

    
    for (let i = 1; i <= 6; i++) {
        let video = createVideo("assets/winner" + i + ".mp4");
        video.hide(); 
        winnerVideos.push(video);
    }
}


function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    setPositionsAndDimensionsForPlaying();
    backButton = document.getElementById('back-to-portfolio');
    updateBackButtonVisibility();

    // Selects one of the home screens, backgrounds and racquets at random
    selectedHome = homeImages[Math.floor(Math.random() * homeImages.length)];
    selectedBackground = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    selectedLeftRacquet = racquetImages[Math.floor(Math.random() * racquetImages.length)];
    selectedRightRacquet = racquetImages[Math.floor(Math.random() * racquetImages.length)];
}

function draw() {
    switch (currentState) {
        case STATE_WELCOME:
            drawForWelcome();
            break;
        case STATE_DIFFICULTY_SELECT:
            drawForDifficultySelect();
            break;
        case STATE_PLAYING:
            drawForPlaying();
            break;
        case STATE_SCORE:
            drawForScore();
            break;
        case STATE_WINNER:
            drawForWinner();
            break;
        case STATE_ERROR:
            drawForError();
            break;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setPositionsAndDimensionsForPlaying();
}

function keyPressed() {
    switch (currentState) {
        case STATE_WELCOME:
            if (keyCode == SPACE) {
                changeState(STATE_DIFFICULTY_SELECT);
            }
            break;

            //Sets Cpu difficulty based on key pressed
        case STATE_DIFFICULTY_SELECT:
            if (key == '1') {
                cpuDifficulty = "easy";
                changeState(STATE_PLAYING);
            } else if (key == '2') {
                cpuDifficulty = "medium";
                changeState(STATE_PLAYING);
            } else if (key == '3') {
                cpuDifficulty = "hard";
                changeState(STATE_PLAYING);
            } else if (key == '4') {
                cpuDifficulty = "impossible";
                changeState(STATE_PLAYING);
            }
            break;
        case STATE_PLAYING:
            // Player key strokes to be registered inside of draw
            break;
        case STATE_WINNER:
            if (keyCode == SPACE) {
                score.left = 0;
                score.right = 0;
                changeState(STATE_DIFFICULTY_SELECT);
            }
            break;
    }
}

function setPositionsAndDimensionsForPlaying() {
    ball.x = windowWidth / 2;
    ball.y = windowHeight / 2;
    ball.diameter = vmin(ballDiameter);

    // Set racket dimensions to the bounding box size you want for the image
    leftRacket.width = racketWidth * 0.01 * windowWidth;
    leftRacket.height = racketHeight * 0.01 * windowHeight;
    leftRacket.x = 0;
    leftRacket.y = windowHeight / 2 - leftRacket.height / 2;

    rightRacket.width = racketWidth * 0.01 * windowWidth;
    rightRacket.height = racketHeight * 0.01 * windowHeight;
    rightRacket.x = windowWidth - rightRacket.width;
    rightRacket.y = windowHeight / 2 - rightRacket.height / 2;

    console.log("resetPositionsAndDimensionsForPlaying", {
        ballX: ball.x,
        ballY: ball.y,
    });
}

function drawForWelcome() {
    //draws image as background and adds a tint
    tint(150, 150, 150, 150); 
    image(selectedHome, 0, 0, width, height);
    noTint();


    textAlign(CENTER, CENTER);
    textSize(vmin(6));
    textStyle(BOLD);
    noStroke();
    fill(255);
    text("Welcome to Tennis Pong!", windowWidth / 2, windowHeight / 3);

    textSize(vmin(4));
    text("Press SPACE to select difficulty", windowWidth / 2, windowHeight * 2 / 3);

    textSize(vmin(4));
    text("Control the Racket with the UP and DOWN Arrows", windowWidth / 2, windowHeight * 2 / 4); 

    

    //var date = new Date();
    //if (date.getSeconds() % 2 == 0) {
    //textSize(vmin(4));
    //text("Press SPACE to start!", windowWidth / 2, windowHeight * 2 / 3);
    //}
}

function drawForDifficultySelect() {
    tint(150, 150, 150, 150); 
    image(selectedHome, 0, 0, width, height);
    noTint(); 
     
    textAlign(CENTER, CENTER);
    textSize(vmin(5));
    fill(255);

    const centerX = windowWidth / 2;
    const baseY = windowHeight / 3;  // Start position for the first line
    const lineSpacing = vmin(8);     // Vertical spacing between lines

    text("Select Difficulty:", centerX, baseY);
    text("Press 1 for Easy", centerX, baseY + lineSpacing);
    text("Press 2 for Medium", centerX, baseY + lineSpacing * 2);
    text("Press 3 for Hard", centerX, baseY + lineSpacing * 3);
    text("Press 4 for Impossible", centerX, baseY + lineSpacing * 4);
}

function drawForPlaying() {
    frameRate(60);

    //Draws the selected background onto the canvas
    image(selectedBackground, 0, 0, width, height);

    fill(223, 255, 79);

    const widthAdjustmentFactor = 1.5;

    //draws the selected racquet for each player
    image(selectedLeftRacquet, leftRacket.x, leftRacket.y, leftRacket.width * widthAdjustmentFactor, leftRacket.height);
    image(selectedRightRacquet, rightRacket.x, rightRacket.y, rightRacket.width * widthAdjustmentFactor, rightRacket.height);

    //cpu racquet control
    handleCPUMovement();

    //detect player key strokes
    if (keyIsDown(UP_ARROW) == true) {
        rightRacketForce = -1;
    } else if (keyIsDown(DOWN_ARROW) == true) {
        rightRacketForce = 1;
    } else {
        rightRacketForce = 0;
    }

    // COLLISION DETECTIONS
    // Ball vs top edge and bottom edge
    if (ball.y <= 0 + ball.diameter / 2) {
        ball.yVelocity *= -1;
    } else if (ball.y >= height - ball.diameter / 2) {
        ball.yVelocity *= -1;
    }

    // Ball vs left racket and right racket
    if (frameCount > ball.frameCountAtLastBounce + debounceForFrames) {
        if (ball.y >= leftRacket.y - ball.diameter / 2 &&
            ball.y <= leftRacket.y + leftRacket.height + ball.diameter / 2 &&
            ball.x <= leftRacket.x + leftRacket.width + ball.diameter / 2
        ) {
            ball.xVelocity *= -1;
            // Debounce
            ball.frameCountAtLastBounce = frameCount;

            if (ballSoundFX) ballSoundFX.play();

        } else if (ball.y >= rightRacket.y - ball.diameter / 2 &&
            ball.y <= rightRacket.y + rightRacket.height + ball.diameter / 2 &&
            ball.x >= rightRacket.x - ball.diameter / 2
        ) {
            ball.xVelocity *= -1;
            // Debounce
            ball.frameCountAtLastBounce = frameCount;

            if (ballSoundFX) ballSoundFX.play();
        }
    }



    // Left racket vs top edge
    // Left racket vs bottom edge
    if (leftRacket.y <= 0 || leftRacket.y + leftRacket.height >= height) {
        leftRacket.yVelocity *= -1;
    }


    // Right racket vs top edge
    // Right racket vs bottom edge
    if (rightRacket.y <= 0 || rightRacket.y + rightRacket.height >= height) {
        rightRacket.yVelocity *= -1;
    }


    // Ball vs left edge
    // Ball vs right edge
    var hasAddedToScore = false;
    if (ball.x <= 0 + ball.diameter / 2) {
        // Right player scores
        score.right++;
        hasAddedToScore = true;
    } else if (ball.x >= width - ball.diameter / 2) {
        // Left player scores
        score.left++;
        hasAddedToScore = true;
    }
    if (hasAddedToScore) {
        if (score.left >= scoreLimit || score.right >= scoreLimit) {
            changeState(STATE_WINNER);
        } else {
            changeState(STATE_SCORE);
        }
    }

    // Move the ball
    ball.x += ball.xVelocity;
    ball.y += ball.yVelocity;
    // Move left racket
    if (leftRacketForce == 1) { // Accelerate down
        leftRacket.yVelocity += racketAccelerationFactor;
    } else if (leftRacketForce == -1) { // Accelerate up
        leftRacket.yVelocity -= racketAccelerationFactor;
    } else if (leftRacket.yVelocity != 0) { // Slow down
        leftRacket.yVelocity *= racketFrictionFactor;
    }
    leftRacket.y += leftRacket.yVelocity;
    // Move right racket
    if (rightRacketForce == 1) {
        rightRacket.yVelocity += racketAccelerationFactor;
    } else if (rightRacketForce == -1) {
        rightRacket.yVelocity -= racketAccelerationFactor;
    } else if (rightRacket.yVelocity != 0) {
        rightRacket.yVelocity *= racketFrictionFactor;
    }
    rightRacket.y += rightRacket.yVelocity;

    // Draw background
    // Draw ball
    circle(ball.x, ball.y, ball.diameter);
    // Draw left racket
    //rect(leftRacket.x, leftRacket.y, leftRacket.width, leftRacket.height);
    // Draw right racket
    //rect(rightRacket.x, rightRacket.y, rightRacket.width, rightRacket.height);
}

function handleCPUMovement() {
    let speed; //variable that stores speed
    switch (cpuDifficulty) {
        case "easy": //sets speed to whatever setting you choose
            speed = 2;
            break;
        case "medium":
            speed = 5;
            break;
        case "hard":
            speed = 12;
            break;
        case "impossible":
            speed = 35;
            break;
    }

    // adjusts the position of the left racquet to follow the ball on the y axis
    if (ball.y < leftRacket.y + leftRacket.height / 2) {
        leftRacket.y -= speed; //racquet down when ball is above racquet
    } else if (ball.y > leftRacket.y + leftRacket.height / 2) {
        leftRacket.y += speed; //racquet up when ball is below racquet
    }

    // Constrain the racquet within the canvas
    leftRacket.y = constrain(leftRacket.y, 0, height - leftRacket.height);
}


function drawForScore() {
    image(selectedHome, 0, 0, width, height);

    colorMode(RGB);
    textSize(vmin(30));
    text(score.left, width / 3, height / 2);
    text(score.right, width * 2 / 3, height / 2);
    text(":", width / 2, height / 2);
}

function drawForWinner() {
    background(0);
    textAlign(CENTER, CENTER);
    textSize(vmin(6));
    textStyle(BOLD);
    noStroke();
    fill(255);

    // Check if the video is ready to play
    if (selectedVideo && selectedVideo.elt.readyState >= 2) { 
        // Display the video on the canvas
        image(selectedVideo, 0, 0, width, height);
    } else if (!selectedVideo) {
        text("Loading video...", windowWidth / 2, windowHeight / 2); 
    }

    // Display winner or loser message
    let winnerString = score.right >= scoreLimit ? "Congrats! You win!" : "You suck! Try again";3 
    text(winnerString, windowWidth / 2, windowHeight / 3);

    let date = new Date();
    if (date.getSeconds() % 2 == 0) {
        textSize(vmin(4));
        text("Press SPACE to play again!", windowWidth / 2, windowHeight * 2 / 3);
    }
}




function drawForError() {
    colorMode(RGB);
    background(255, 0, 0);
}

function changeState(state) {
    if (currentState == STATE_WINNER && selectedVideo) {
        selectedVideo.stop();
        selectedVideo = null; // Reset the selected video so a new one is chosen next time
    }

    currentState = state;
    updateBackButtonVisibility();

    switch (state) {
        case STATE_PLAYING:
            // Set the ball at the center
            ball.x = width / 2;
            ball.y = height / 2;
            // Launch the ball in a random direction
            let aspectRatio = windowWidth / windowHeight;
            let horizontalVelocity, verticalVelocity;
            //Sets the velocity based on cpu difficulty
            switch (cpuDifficulty) {
                case "easy":
                    horizontalVelocity = Math.random() * (20 - 15) + 10;
                    verticalVelocity = Math.random() * (15 - 10) + 6;
                    break;
                case "medium":
                    horizontalVelocity = Math.random() * (25 - 20) + 18;
                    verticalVelocity = Math.random() * (20 - 15) + 12;
                    break;
                case "hard":
                    horizontalVelocity = Math.random() * (30 - 25) + 28;
                    verticalVelocity = Math.random() * (25 - 20) + 20;
                    break;
                case "impossible":
                    horizontalVelocity = Math.random() * (35 - 30) + 45;
                    verticalVelocity = Math.random() * (30 - 25) + 35; 
                    break;
            }

            // Randomize the direction of the velocities
            if (Math.random() < 0.5) horizontalVelocity *= -1;
            if (Math.random() < 0.5) verticalVelocity *= -1;
            ball.xVelocity = horizontalVelocity;
            ball.yVelocity = verticalVelocity;


            // Set the rackets at the center
            leftRacket.y = height / 2 - leftRacket.height / 2;
            leftRacket.yVelocity = 0;
            rightRacket.y = height / 2 - rightRacket.height / 2;
            rightRacket.yVelocity = 0;
            break;

        case STATE_SCORE:
            // show home images when the score is displayed
            selectedHome = homeImages[Math.floor(Math.random() * homeImages.length)];
            // Set timeout
            scoreTimeout = setTimeout(handleScoreTimeout, scoreTimeoutDelay);
            break;

        case STATE_WINNER:
            // Select the appropriate video based on the winner, only if not already selected
            if (!selectedVideo) {
                if (score.right >= scoreLimit) {
                    selectedVideo = winnerVideos[Math.floor(Math.random() * winnerVideos.length)];
                } else if (score.left >= scoreLimit) {
                    selectedVideo = loserVideos[Math.floor(Math.random() * loserVideos.length)];
                }
                selectedVideo.loop(); // Start looping the chosen video
            }
            currentState = STATE_WINNER;
            break;
    }

}

function updateBackButtonVisibility() {
    if (!backButton) return;
    const shouldShow = currentState === STATE_WELCOME ||
        currentState === STATE_DIFFICULTY_SELECT ||
        currentState === STATE_WINNER;
    backButton.style.display = shouldShow ? 'inline-flex' : 'none';
}


function handleScoreTimeout() {
    changeState(STATE_PLAYING);
}


function isValidState(id) {
    var result = false;

    switch (id) {
        case STATE_WELCOME:
        case STATE_PLAYING:
        case STATE_SCORE:
        case STATE_WINNER:
        case STATE_ERROR:
            result = true;
            break;
    }

    return result;
}


function vmin(percentage) {
    var result = windowWidth;
    if (windowHeight < windowWidth) result = windowHeight;

    result = percentage * 0.01 * result;

    return result;
}