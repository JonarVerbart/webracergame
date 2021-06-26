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
let speed;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);
  frameRate(60);
  mic = new p5.AudioIn()
  fft = new p5.FFT(0.95, 2048);
  calibrating = true;
  startingUp = true;
  highestFreq = 0;
  lowestFreq = 20000;
  mic.start();
  fft.setInput(mic);
  textSize(48);
  drawCount = 0;
  startTime = 0;
  speed = 0;
  smoothXpos = windowWidth / 2;
  lastXpos = windowWidth / 2;
}

function draw() {
  drawCount += 1;
  background(100);
  fill(0);
  analyzeFreq();
  textSize(48);
  let curLoudestFreq = int(loudestFreq);
  if (drawCount > 500) {
    if (drawCount == 501) {
      startingUp = false;
      print('Calibrating');
      startTime = millis();
    }
    if(calibrating === true) {
      text('Calibrating',50,50);
      if (millis() - startTime < 4000) {
        calibrate(curLoudestFreq);
      } else {
        calibrating = false;
        print('Calibrated range:');
        print(lowestFreq);
        print(highestFreq);
      }
    } else {
      drawFrame(curLoudestFreq);
      drawMicStats();
    }
  }
  //drawFrame(curLoudestFreq);
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
      speed = deltaX / 10;
    } else if (deltaX < 0) {
      speed = deltaX / 10;
    } else {
      speed = 0;
    }
  }
  if (speed > 0 && smoothXpos < xpos && smoothXpos < trackWidth + grassWidth) {
    smoothXpos = smoothXpos + speed;
  } else if (speed < 0 && smoothXpos > xpos && smoothXpos > grassWidth) {
    smoothXpos = smoothXpos + speed;
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
