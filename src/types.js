function Uint8(value) {
  this.max = Math.pow(2, 8);
  this.value = value % this.max;
  this.overflow = false;

  this.add = function(num) {
    this.value += num;
    this.overflow = this.value >= this.max;
    this.value %= this.max;
  }
  this.subtract = function(num) {
    this.value -= num;
    this.overflow = this.value < 0;
    this.value = this.overflow ? this.value + this.max : this.value;
  }
  this.toString = function(base) {
    return this.value.toString(base);
  }
}

function Uint16(value) {
  Uint8.apply(this, arguments);
  this.max = Math.pow(2, 16);
  this.value = value % this.max;
}