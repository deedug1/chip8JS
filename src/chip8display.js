function Chip8Display(pixelSize, width, height) {
  // Setup
  this.width = width;
  this.height = height;
  this.pixelSize = pixelSize;
  
  // 64 x 32;
  this.buffer = Array.from({length: this.height * this.width}).map(() => 0);

  this.clear = function() {
    this.buffer = Array.from({length: this.height * this.width}).map(() => 0);
  }
  this.writeByteToBuffer = function(x, y, byte) {
    var mask = 0x80;
    var index = 0;
    var collision  = false;
    do {
      var pixel = mask & byte;
      var pixel = pixel > 0 ? 1 : 0;
      this.changed = true;
      index = this.getIndex(x, y);
      this.buffer[index] ^= pixel;
      collision |= this.buffer[index] === 0 && pixel > 0;
      x++;
    } while ((mask = mask >> 1) > 0); 
    return collision;
  }
  this.getIndex = function(x, y) {
    return ((x % this.width + this.width) % this.width) + y * this.width;
  }
  this.getX = function (index){ 
    return index % this.width;
  }
  this.getY = function (index){ 
    return Math.floor(index / this.width); 
  }
  this.isChanged = function() {
    return this.changed;
  }
  this.draw = function(context) {
    this.changed = false;
    // Background
    context.fillStyle = 'white';
    context.fillRect(0, 0, this.width * pixelSize, this.height * pixelSize);

    // Pixels
    context.fillStyle = 'black';
    for(p = 0; p < this.buffer.length; p++) {
      if(this.buffer[p] === 0) { continue; }
      context.fillRect( this.getX(p) * this.pixelSize, this.getY(p) * this.pixelSize, this.pixelSize, this.pixelSize);
    }
  }
  this.toString = function () {
    var string = '';
    for(var r = 0; r < this.height; r++){
      string += this.buffer.slice(r * this.width, r * this.width + 64).join(',');
      string += '\n';
    }
    return string;
  } 
}