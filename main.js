// Screen Setup
var PIXEL_SIZE = 10;
var WIDTH = 64;
var HEIGHT = 32;
var slider = document.getElementById('period-range'); // Slider to slow down cpu execution
var canvas = document.getElementById('main-screen'); // Screen to draw to
canvas.setAttribute('width', WIDTH * PIXEL_SIZE);
canvas.setAttribute('height', HEIGHT * PIXEL_SIZE);
var ctx = canvas.getContext('2d'); 
// File reader setup
var fileInput = document.getElementById('fileinput'); // Fileinput node
var fr = new FileReader();
var emulator;
// Cpu setup
var display = new Chip8Display(PIXEL_SIZE, WIDTH, HEIGHT);
var keypad = new Chip8Input();
var memory = [];
var cpu;
var file;

function emulateLoop() {
    cpu.step();
    if(display.isChanged()) {
      display.draw(ctx);
    }
    emulator = setTimeout(emulateLoop, slider.value);
}
function start() {
  // Load Program
  if(emulator) { clearTimeout(emulator); }
  file = fileInput.files[0];
  if(!file) { 
    console.log("No file selected");
    return; 
  }
  fr = new FileReader();
  fr.onloadend = intoMemory;
  fr.readAsArrayBuffer(file);
}

function intoMemory() {
  var program = new Uint8Array(fr.result);
  startCpu(program);
  // Begin
  emulator = setTimeout(emulateLoop, slider.value);
}
function startCpu(program) {
  // Reset memory load character data
  memory = [];
  memory.push(...characterData);
  memory.push(... Array.from({length: 0x200 - memory.length}).map(() => 0));
  memory.push(... program);
  display.clear();
  display.draw(ctx);
  cpu = new Chip8Cpu(memory, keypad, display);
}