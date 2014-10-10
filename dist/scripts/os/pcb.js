var TSOS;
(function (TSOS) {
    var PCB = (function () {
        // Constructor
        function PCB(processID, baseRegister, limitRegister, programCounter, accumulator, Xreg, Yreg, Zflag, isExecuting, cyclesComplete) {
            if (typeof processID === "undefined") { processID = -1; }
            if (typeof baseRegister === "undefined") { baseRegister = 0; }
            if (typeof limitRegister === "undefined") { limitRegister = 0; }
            if (typeof programCounter === "undefined") { programCounter = 0; }
            if (typeof accumulator === "undefined") { accumulator = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            if (typeof cyclesComplete === "undefined") { cyclesComplete = 0; }
            this.processID = processID;
            this.baseRegister = baseRegister;
            this.limitRegister = limitRegister;
            this.programCounter = programCounter;
            this.accumulator = accumulator;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
            this.cyclesComplete = cyclesComplete;
        }
        // Methods
        PCB.prototype.saveInfo = function () {
            this.programCounter = _CPU.PC;
            this.accumulator = _CPU.Acc;
            this.Xreg = _CPU.Xreg;
            this.Yreg = _CPU.Yreg;
            this.Zflag = _CPU.Zflag;
            this.isExecuting = _CPU.isExecuting;
        };

        PCB.prototype.display = function () {
            var hexPC = TSOS.Utils.decimalToHex(this.programCounter);
            var hexAcc = TSOS.Utils.decimalToHex(this.accumulator);
            var hexXReg = TSOS.Utils.decimalToHex(this.Xreg);
            var hexYReg = TSOS.Utils.decimalToHex(this.Yreg);

            _StdOut.putText("PC = " + hexPC + " | Acc = " + hexAcc + " | Xreg = " + hexXReg + " | Yreg = " + hexYReg + " | Zflag = " + this.Zflag + " | Cycles completed = " + this.cyclesComplete);
            _StdOut.newLine();
        };
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
