function Chip8Cpu(memory, keypad, displayBuffer) {

    // Internals
    this.reg = Array.from({ length: 16 }, () => new Uint8(0)); // General purpose registers (8-bit)
    this.regIndex = new Uint16(0); // Index register (16-bit)
    this.pc = 0x200; // Program counter (16-bit)
    this.stack = []; // Stack (8-bit)
    this.DT = 0; // Delay Timer (8-bit)
    this.ST = 0; // Sound Timer (8-bit)
    this.lastUpdate = Date.now();
    // Externals
    this.memory = memory;
    this.keypad = keypad;
    this.displayBuffer = displayBuffer;

    // Debug
    this.debugFlag = false;

    this.step = function () {
        var opcode = this.readInstruction();
        var instruction = this.decodeInstruction(opcode);
        instruction.call(this, opcode);
        this.decrementTimers();
        this.pc += 2;
        if(this.debugFlag) { this.debug(opcode); }
    }
    this.readInstruction = function () {
        return (this.memory[this.pc] << 8) + (this.memory[this.pc + 1])
    }
    this.decodeInstruction = function (opcode) {
        op = opcode & 0xF000; // Extract identifier for map
        instruction = instructionMap[op];
        if (instruction === undefined || instruction === null) {
            throw Error('Instruction undefined');
        }
        return instruction;
    }
    this.decrementTimers = function() {
        if((Date.now() - this.lastUpdate) > 60) {
            this.DT = this.DT > 0 ? this.DT - 1 : 0;
            this.ST = this.ST > 0 ? this.ST - 1 : 0;
            lastUpdate = Date.now();
        }
    }
    this.debug = function (opcode) {
        var debugString = opcode.toString(16) +'\n';
        // Build debug string
        for (var x = 0; x < 15; x++) {
            debugString += 'V' + x.toString(16) + ': ' + this.reg[x].toString(16) + ' ';
        }
        debugString += '\n';
        debugString += 'F: ' + this.reg[0xF].toString(16) + ' ';
        debugString += 'I: ' + this.regIndex.toString(16) + ' ';
        debugString += 'PC: ' + this.pc.toString(16) + ' ';
        debugString += 'SP: ' + this.stack.length + ' ';
        console.log(debugString);
    }

    // Character memory
    this.characterMemoryMap = [0x0000, 0x0005, 0x000A, 0x000F, 
                               0x0014, 0x0019, 0x001E, 0x0023, 
                               0x0028, 0x002D, 0x0032, 0x0037,
                               0x003C, 0x0041, 0x0046, 0x004B];
}