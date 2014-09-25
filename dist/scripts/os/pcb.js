var TSOS;
(function (TSOS) {
    var PCB = (function () {
        // Constructor
        function PCB(processID, baseRegister, limitRegister, programCounter, accumulator, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof processID === "undefined") { processID = -1; }
            if (typeof baseRegister === "undefined") { baseRegister = 0; }
            if (typeof limitRegister === "undefined") { limitRegister = 0; }
            if (typeof programCounter === "undefined") { programCounter = 0; }
            if (typeof accumulator === "undefined") { accumulator = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.processID = processID;
            this.baseRegister = baseRegister;
            this.limitRegister = limitRegister;
            this.programCounter = programCounter;
            this.accumulator = accumulator;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        return PCB;
    })();
    TSOS.PCB = PCB;
})(TSOS || (TSOS = {}));
