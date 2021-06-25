let mic;
let fft;
var loudestFreq;
let energies = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);
  frameRate(60);
  mic = new p5.AudioIn()
  fft = new p5.FFT();
  mic.start();
  fft.setInput(mic);
  textSize(48);
}

function draw() {
  background(100);
  micLevel = mic.getLevel() * 100;
  if (micLevel > 1.0) {
    let spectrum = fft.analyze();

    for (let i = 0; i < 127; i++) {
      	energies[i] = fft.getEnergy(midiToFreq(i));
      }
    let indexOfMaxValue = indexOfMax(energies);
    loudestFreq = midiToFreq(indexOfMaxValue);
    text(loudestFreq, windowWidth/2, windowHeight/2);
  }
  text(micLevel, windowWidth/2, windowHeight/2 + 100);
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
