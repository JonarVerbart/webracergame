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
  fft = new p5.FFT();
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
  let curLoudestFreq = int(loudestFreq);
  if (drawCount > 500) {
    if (drawCount == 501) {
      startingUp = false;
      print('Calibrating rn');
      startTime = millis();
    }
    if(calibrating === true) {
      if (millis() - startTime < 4000) {
        calibrate(curLoudestFreq);
      } else {
        calibrating = false;
        print('turned false');
        print(lowestFreq);
        print(highestFreq);
      }
    }
    drawFrame(curLoudestFreq);
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
  micLevel = mic.getLevel() * 100;
  if (micLevel > 1.0) {
    let spectrum = fft.analyze();

    for (let i = 0; i < 127; i++) {
      	energies[i] = fft.getEnergy(midiToFreq(i));
      }
    let indexOfMaxValue = indexOfMax(energies);
    if (startingUp === false) {
      loudestFreq = midiToFreq(indexOfMaxValue);
      text(loudestFreq, windowWidth/2, windowHeight/2);
    }
  }
  text(micLevel, windowWidth/2, windowHeight/2 + 100);
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
      speed = 4;
    } else if (deltaX < 0) {
      speed = -4;
    } else {
      speed = 0;
    }
  }
  if (speed > 0 && smoothXpos < xpos && smoothXpos < trackWidth + grassWidth) {
    smoothXpos = smoothXpos + speed;
  } else if (speed < 0 && smoothXpos > xpos && smoothXpos > grassWidth) {
    smoothXpos = smoothXpos + speed;
  }
  fill(20,130,20);
  rect(0,0,windowWidth/4,windowHeight);
  rect(windowWidth-grassWidth,0,grassWidth,windowHeight);

  fill(200,30,38);
  ellipse(smoothXpos, windowHeight * 0.7, 50);
  lastXpos = xpos;
  lastSXpos = smoothXpos;
}
