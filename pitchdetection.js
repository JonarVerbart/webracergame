let mic;
let fft;
var loudestFreq;
var lowestFreq;
var highestFreq;
let energies = [];
let calSample = [];
let calibrating;
let startTime;
let startingUp;
let drawCount;
let lastXpos;
let lastSXpos;
let smoothXpos;
let deltaX;
let xspeed;
let menuActive;
let levelRunning;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);
  frameRate(60);
  mic = new p5.AudioIn()
  fft = new p5.FFT(0.95, 2048);
  calibrating = false;
  startingUp = true;
  menuActive = false;
  levelRunning = false;
  highestFreq = 0;
  lowestFreq = 20000;
  mic.start();
  fft.setInput(mic);
  //textSize(48);
  drawCount = 0;
  startTime = 0;
  xspeed = 0;
  smoothXpos = windowWidth / 2;
  lastXpos = windowWidth / 2;
}

function draw() {
  drawCount += 1;
  background(100);
  //fill(0);
  analyzeFreq();
  textSize(56);
  let curLoudestFreq = int(loudestFreq);
  if (drawCount > 500) {
    if (drawCount == 501) {
      startingUp = false;
      menuActive = true;
    }
    if(calibrating === true) {
      background(0,0,200);
      fill(200,40,0);
      text('WebRacer',windowWidth / 2,windowHeight / 2);
      text('Calibrating...',windowWidth/2,windowHeight/2 + 50);
      drawMicStats();
      if (millis() - startTime < 4000) {
        calibrate(curLoudestFreq);
      } else {
        calibrating = false;
        levelRunning = true;
        print('Calibrated range:');
        print(lowestFreq);
        print(highestFreq);
      }
    } else if (levelRunning === true) {
        drawFrame(curLoudestFreq);
        drawMicStats();
      } else if (menuActive === true){
          background(0,0,200);
          //textSize(56);
          fill(200,40,0);
          textAlign(CENTER);
          text('WebRacer',windowWidth / 2,windowHeight / 2);
        }
  //drawFrame(curLoudestFreq);
  } else {
    background(0,0,200);
    //textSize(56);
    fill(200,40,0);
    textAlign(CENTER);
    text('Loading...',windowWidth / 2,windowHeight / 2);
  }
}

function mousePressed() {
  if (menuActive === true) {
    menuActive = false;
    calibrating = true;
    print('Calibrating');
    startTime = millis();
  }
}

function indexOfMax(arr) {
  if (arr.length === 0) {
      return -1;
  }
  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }
  return maxIndex;
}

function analyzeFreq() {
  textSize(20);
  micLevel = mic.getLevel() * 100;
  if (micLevel > 1.0) {
    let spectrum = fft.analyze();

    for (let i = 0; i < 127; i++) {
      	energies[i] = fft.getEnergy(midiToFreq(i));
      }
    let indexOfMaxValue = indexOfMax(energies);
    if (startingUp === false) {
      loudestFreq = midiToFreq(indexOfMaxValue);
      //text(loudestFreq, 50, windowHeight - 100);
    }
  }
  //text(micLevel, 50, windowHeight - 50);
}

function calibrate(clf) {
  if (clf > highestFreq) {
    highestFreq = clf;
  }
  if (clf < lowestFreq) {
    lowestFreq = clf;
  }
}

function drawFrame(clf) {
  let grassWidth = windowWidth / 4;
  let trackWidth = windowWidth - (2 * grassWidth);
  let xpos = grassWidth + map(clf, lowestFreq, highestFreq, 0, trackWidth, true);
  if (xpos != lastXpos)  {
    deltaX = xpos - lastSXpos;
    if (deltaX > 0) {
      xspeed = deltaX / 10;
    } else if (deltaX < 0) {
      xspeed = deltaX / 10;
    } else {
      xspeed = 0;
    }
  }
  if (xspeed > 0 && smoothXpos < xpos && smoothXpos < trackWidth + grassWidth) {
    smoothXpos = smoothXpos + xspeed;
  } else if (xspeed < 0 && smoothXpos > xpos && smoothXpos > grassWidth) {
    smoothXpos = smoothXpos + xspeed;
  }
  smoothXpos = constrain(smoothXpos,grassWidth,trackWidth + grassWidth);
  fill(20,130,20);
  rect(0,0,windowWidth/4,windowHeight);
  rect(windowWidth-grassWidth,0,grassWidth,windowHeight);

  fill(200,30,38);
  ellipse(smoothXpos, windowHeight * 0.7, 50);
  lastXpos = xpos;
  lastSXpos = smoothXpos;
}

function drawMicStats() {
  textSize(20);
  stroke(0);
  noFill();
  rect(20,windowHeight - 80,20,60);
  noStroke();
  fill(140,0,0);
  rect(20,windowHeight - 20,20,constrain(map(micLevel,0,30,0,-60,true),-60,0));
  fill(0);
  text(round(loudestFreq,2),60,windowHeight - 20);
}
