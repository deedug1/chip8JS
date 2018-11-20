/*
 *   0 1 2 3 
 * 0 1 2 3 4
 * 1 q w e r
 * 2 a s d f
 * 3 z x c v
 */

function Chip8Input() {
  /* Data / functions */
  this.keys = [];
  
  this.keydown = handleKeydown.bind(this);
  this.keyup = handleKeyup.bind(this);
  this.isPressed = function(index) {
    return this.keys[index].isPressed;
  }
  
  /* listener logic */
  window.addEventListener('keydown', this.keydown);
  window.addEventListener('keyup', this.keyup);
  
  /* keys */
  this.keys.push({code: 49, isPressed: false}); // 1;
  this.keys.push({code: 50, isPressed: false}); // 2;
  this.keys.push({code: 51, isPressed: false}); // 3;
  this.keys.push({code: 52, isPressed: false}); // 4;
  this.keys.push({code: 81, isPressed: false}); // q;
  this.keys.push({code: 87, isPressed: false}); // w;
  this.keys.push({code: 69, isPressed: false}); // e;
  this.keys.push({code: 82, isPressed: false}); // r;
  this.keys.push({code: 65, isPressed: false}); // a;
  this.keys.push({code: 83, isPressed: false}); // s;
  this.keys.push({code: 69, isPressed: false}); // d;
  this.keys.push({code: 70, isPressed: false}); // f;
  this.keys.push({code: 90, isPressed: false}); // z;
  this.keys.push({code: 88, isPressed: false}); // x;
  this.keys.push({code: 67, isPressed: false}); // c;
  this.keys.push({code: 86, isPressed: false}); // v;
}
/* helpers */
function handleKeydown(event) {
  var i = this.keys.findIndex(function(key) {
    return key.code === event.which;
  });
  if(i < 0) { return; }
  this.keys[i].isPressed = true;
}
function handleKeyup(event) {
  var i = this.keys.findIndex(function(key) {
    return key.code === event.which;
  });
  if(i < 0) { return; }
  this.keys[i].isPressed = false;
}