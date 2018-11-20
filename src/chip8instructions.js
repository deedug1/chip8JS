 // Helper functions
function getX(opcode) {
  return (opcode & 0x0F00) >> 8;
}
function getY(opcode) {
  return (opcode & 0x00F0) >> 4;
}
function getNNN(opcode) {
  return (opcode & 0x0FFF);
}
function getKK(opcode) {
  return (opcode & 0x00FF);
}
function getN(opcode) {
  return (opcode & 0x000F);
}
function rndInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
// Functions for each opcode
/**
 * Sets all pixels on the screen to zero.
 * Opcode format: 0x00E0
 * @param {number} opcode word representing the instruction. 
 */
function CLS(opcode) { 
  this.displayBuffer.clear();
}
/**
 * Sets the program counter equal to the two bytes on the top of the stack.
 * Opcode format: 0x00EE
 * @param {number} opcode word representing the instruction. 
 */
function RET(opcode) { 
  this.pc = this.stack.pop() << 8;
  this.pc += this.stack.pop();
}
/**
 * Jumps to address NNN
 * Opcode format: 0x1NNN
 * @param {number} opcode word representing the instruction. 
 */
function JP(opcode) { 
  this.pc = getNNN(opcode);
  this.pc -= 2;
}
/**
 * Pushes the program counter to the stack and jumps to address NNN
 * Opcode format: 0x2NNN
 * @param {number} opcode word representing the instruction. 
 */
function CALL(opcode) { 
  this.stack.push(this.pc & 0x00FF);
  this.stack.push((this.pc & 0xFF00) >> 8);
  this.pc = getNNN(opcode);
  this.pc -= 2;
}
/**
 * Skips the next instruction if register X and byte KK are equal
 * Opcode format: 0x3XKK
 * @param {number} opcode word representing the instruction. 
 */
function SExbyte(opcode) {
  var x = getX(opcode);
  if(this.reg[x].value === getKK(opcode)) {
     this.pc += 2;
  } 
}
/**
 * Skips the next instruction if register X and byte KK are not equal
 * Opcode format: 0x4XKK
 * @param {number} opcode word representing the instruction. 
 */
function SNExbyte(opcode) {
  var x = getX(opcode);
  if (this.reg[x].value !== getKK(opcode)) {
     this.pc += 2;
  } 
}
/**
 * Skips the next instruction if register X and Y are equal
 * Opcode format: 0x5XY0
 * @param {number} opcode word representing the instruction. 
 */
function SExy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  if(this.reg[x].value === this.reg[y].value) {
     this.pc += 2;
  }    
}
/**
 * Sets register X to byte KK.
 * Opcode format: 0x6XKK
 * @param {number} opcode word representing the instruction. 
 */
function LDxbyte(opcode) {
  var x = getX(opcode); 
  this.reg[x].value = getKK(opcode);
}
/**
 * Sets register X to register X + byte KK.
 * Opcode format: 0x7XKK
 * @param {number} opcode word representing the instruction. 
 */
function ADDxbyte(opcode) {
  var x = getX(opcode);
  this.reg[x].add(getKK(opcode));
}
/**
 * Sets register X to register Y.
 * Opcode format: 0x8XY0
 * @param {number} opcode word representing the instruction. 
 */
function LDxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].value = this.reg[y].value;
}
/**
 * Sets register X to register X | register Y.
 * Opcode format: 0x8XY1
 * @param {number} opcode word representing the instruction. 
 */
function ORxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].value |= this.reg[y].value;
}
/**
 * Sets register X to register X & register Y.
 * Opcode format: 0x8XY2
 * @param {number} opcode word representing the instruction. 
 */
function ANDxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].value &= this.reg[y].value;
}
/**
 * Sets register X to register X ^ register Y.
 * Opcode format: 0x8XY3
 * @param {number} opcode word representing the instruction. 
 */
function XORxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].value ^= this.reg[y].value; 
}
/**
 * Sets register X to register X + register Y.
 *  The flag register is set if there is a carry.
 * Opcode format: 0x8XY4
 * @param {number} opcode word representing the instruction. 
 */
function ADDxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].add(this.reg[y].value);
  this.reg[0xF].value = this.reg[x].overflow ? 1 : 0;
}
/**
 * Sets register X to register X - register Y.
 *  The flag register is set if there is not a borrow.
 * Opcode format: 0x8XY5
 * @param {number} opcode word representing the instruction. 
 */
function SUBxy(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  this.reg[x].subtract(this.reg[y].value);
  this.reg[0xF].value = this.reg[x].overflow ? 0 : 1;
}
/**
 * Shift register Y right one bit and assign the value to register X.
 *  The flag register is set to the lsb of Y before the shift.
 * Opcode format: 0x8XY6
 * @param {number} opcode word representing the instruction. 
 */
function SHRx(opcode) { 
  var x = getX(opcode);
  this.reg[0xF].value = this.reg[y].value & 1 ? 1 : 0;
  this.reg[x].value = this.reg[y].value >> 1; 
}
/**
 * Sets register X to register Y - register X. 
 *  The flag register is set if there is not a borrow
 * Opcode format: 0x8XY7
 * @param {number} opcode word representing the instruction. 
 */
function SUBNxy(opcode) { 
  var x = getX(opcode);
  var y = getY(opcode);
  var temp = this.reg[y].value;
  this.reg[y].subtract(this.reg[x]);
  this.reg[x].value = this.reg[y].value
  this.reg[y].value = temp;
  this.reg[0xF].value = this.reg[y].overflow ? 0 : 1;
}
/**
 * Shift register Y left one bit and assign the value to register X.
 *  The flag register is set to the msb of Y before the shift.
 * Opcode format: 0x8XYE
 * @param {number} opcode word representing the instruction. 
 */
function SHLx(opcode) { 
  var x = getX(opcode);
  this.reg[0xF].value = this.reg[y].value & (0x80) ? 1 : 0;
  this.reg[x].value = this.reg[y].value << 1;
}
/**
 * Skips the next instruction if register X and Y are not equal
 * Opcode format: 0x9XY0
 * @param {number} opcode word representing the instruction. 
 */
function SNExy(opcode) { 
  var x = getX(opcode);
  var y = getY(opcode);
  if( this.reg[x].value !== this.reg[y].value ){
      this.pc += 2;
  }
}
/**
 * Sets register I to address NNN
 * Opcode format: 0xANNN
 * @param {number} opcode word representing the instruction. 
 */
function LDIaddr(opcode) {
  this.regIndex.value = getNNN(opcode);
}
/**
 * Jumps to address NNN + register 0
 * Opcode format: 0xBNNN
 * @param {number} opcode word representing the instruction. 
 */
function JP0addr(opcode) { 
  this.pc = this.reg[0].value + getNNN(opcode);
  this.pc -= 2; 
}
/**
 * Sets register X to a random number & byte KK
 * Opcode format: 0xCXKK
 * @param {number} opcode word representing the instruction. 
 */
function RNDxbyte(opcode) {
  var x = getX(opcode);
  this.reg[x].value = rndInt(0, 256) & getKK(opcode);
}
/**
 * Draws a sprite to the display buffer at coordinates register X, register Y with a width of 8 pixels
 *  and a height of N pixels. The flag register is set if a pixel is toggled off.
 * Opcode format: 0xDXYN
 * @param {number} opcode word representing the instruction. 
 */
function DRWxyn(opcode) {
  var x = getX(opcode);
  var y = getY(opcode);
  var n = getN(opcode);
  var collision = false;
  for( var offset = 0; offset < n; offset++) {
    collision |= this.displayBuffer.writeByteToBuffer(this.reg[x].value, this.reg[y].value + offset, this.memory[this.regIndex.value + offset]);
  }
  this.reg[0xF].value = collision ? 1 : 0;
}
/**
 * Skips the next instruction if the character stored in X is pressed.
 * Opcode format: 0xEX9E
 * @param {number} opcode word representing the instruction. 
 */
function SKPx(opcode) { 
  var x = getX(opcode);
  if(this.keypad.isPressed(this.reg[x].value)) {
     this.pc += 2;
  }
}
/**
 * Skips the next instruction if the character stored in X is not pressed.
 * Opcode format: 0xEXA1
 * @param {number} opcode word representing the instruction. 
 */
function SKNPx(opcode) { 
  var x = getX(opcode);
  if(!this.keypad.isPressed(this.reg[x].value)) {
     this.pc += 2;
  }
}
/**
 * Sets register X to the delay timer.
 * Opcode format: 0xFX07
 * @param {number} opcode word representing the instruction. 
 */
function LDxDT(opcode) {
  var x = getX(opcode);
  this.reg[x].value = this.DT;
}
/**
 * Block until a key is pressed and store that in register X.
 * Opcode format: 0xFX0A
 * @param {number} opcode word representing the instruction. 
 */
function LDxK(opcode) { 
  var x = getX(opcode);
  var i = 0;
  for(;;) {
    if(this.keypad.isPressed(x)) {
      this.reg[x].value = i;
      break;
    }
    i = (i + 1) % 16
  }
}
/**
 * Sets delay timer to register X.
 * Opcode format: 0xFX15
 * @param {number} opcode word representing the instruction. 
 */
function LDDTx(opcode) { 
  var x = getX(opcode);
  this.DT = this.reg[x].value;
}
/**
 * Sets sound timer to register X.
 * Opcode format: 0xFX18
 * @param {number} opcode word representing the instruction. 
 */
function LDSTx(opcode) { 
  var x = getX(opcode);
  this.ST = this.reg[x].value;
}
/**
 * Add register X to register I
 * Opcode format: 0xFX1E
 * @param {number} opcode word representing the instruction. 
 */
function ADDIx(opcode) { 
  var x = getX(opcode);
  this.regIndex.add(this.reg[x].value);
}
/**
 * Sets the I register to the location of the sprite for the character in register X
 * Opcode format: 0xFX29
 * @param {number} opcode word representing the instruction. 
 */
function LDCHARx(opcode) { 
  var x = getX(opcode);
  this.regIndex.value = this.characterMemoryMap[this.reg[x].value & 0x0F];
}
/**
 * Store BCD format of register X in memory starting at I
 * Opcode format: 0xFX33
 * @param {number} opcode word representing the instruction. 
 */
function LDBCDx(opcode) { 
  var x = getX(opcode);
  var temp = this.reg[x].value;
  this.memory[this.regIndex.value] = temp / 100;
  temp %= 100;
  this.memory[this.regIndex.value + 1] = temp / 10;
  temp %= 10;
  this.memory[this.regIndex.value + 2] = temp;
}
/**
 * Store registers 0 - X sequentially in memory starting at I.
 * Opcode format: 0xFX55
 * @param {number} opcode word representing the instruction. 
 */
function LDIIx(opcode) { 
  var x = getX(opcode);
  for(var i = 0; i <= x; i++) {
    this.memory[this.regIndex.value] = this.reg[i].value;
    this.regIndex.add(1);  
  }
}
/**
 * Load registers 0 - X sequentially from memory starting at I.
 * Opcode format: 0xFX65
 * @param {number} opcode word representing the instruction. 
 */
function LDxII(opcode) { 
  var x = getX(opcode);
  for(var i = 0; i <= x; i++) {
    this.reg[i].value = this.memory[this.regIndex.value];
    this.regIndex.add(1);
  }
}
// Op decode Functions
function __0x0ZZZ(opcode) {
  let op = 0xF0FF & opcode;
  instructionMap[op].call(this, opcode);
}
function __0x8ZZZ(opcode) {
  let op = 0xF00F & opcode;
  if (op === 0x8000) {
      LDxy.call(this, opcode);
  } else {
      instructionMap[op].call(this, opcode);
  }
}
function __0xEZZZ(opcode) {
  let op = 0xF0FF & opcode;
  if (op === 0xE000) {
      throw Error('You trying to blow the stack?');
  }
  instructionMap[op].call(this, opcode);
}
function __0xFZZZ(opcode) {
  let op = 0xF0FF & opcode;
  if (op === 0xF000) {
      throw Error('You trying to blow the stack?');
  }
  instructionMap[op].call(this, opcode);
}

instructionMap = {
  0x0000: __0x0ZZZ,
  0x00E0: CLS,
  0x00EE: RET,
  0x1000: JP,
  0X2000: CALL,
  0x3000: SExbyte,
  0X4000: SNExbyte,
  0x5000: SExy,
  0x6000: LDxbyte,
  0x7000: ADDxbyte,
  0x8000: __0x8ZZZ,
  0x8001: ORxy,
  0x8002: ANDxy,
  0x8003: XORxy,
  0x8004: ADDxy,
  0x8005: SUBxy,
  0x8006: SHRx,
  0x8007: SUBNxy,
  0x800E: SHLx,
  0X9000: SNExy,
  0xA000: LDIaddr,
  0xB000: JP0addr,
  0xC000: RNDxbyte,
  0xD000: DRWxyn,
  0xE000: __0xEZZZ,
  0xE09E: SKPx,
  0xE0A1: SKNPx,
  0xF000: __0xFZZZ,
  0xF007: LDxDT,
  0xF00A: LDxK,
  0xF015: LDDTx,
  0xF018: LDSTx,
  0xF01E: ADDIx,
  0xF029: LDCHARx,
  0xF033: LDBCDx,
  0xF055: LDIIx,
  0xF065: LDxII
};
