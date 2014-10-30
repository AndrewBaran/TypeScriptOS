var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        // Default scheduling type is round robin
        function Scheduler() {
            this.schedulingType = "rr";
            this.quantum = 6;
            this.quantumUsed = 0;

            this.inUse = false;
        }
        Scheduler.prototype.setQuantumValue = function (newQuantum) {
            this.quantum = newQuantum;
        };

        Scheduler.prototype.incrementQuantum = function () {
            this.quantumUsed++;

            // Check if quantum has reached its limit
            if (this.quantumUsed === this.quantum) {
                console.log("Context swtich now.");

                // Log an interrupt to context switch
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));
            }
        };

        Scheduler.prototype.resetQuantum = function () {
            this.quantumUsed = 0;
        };

        Scheduler.prototype.getSchedulingType = function () {
            return this.schedulingType;
        };

        // Takes PCBs in the resident queue and arranges them in the ready queue accordingly
        Scheduler.prototype.schedule = function () {
            switch (this.schedulingType) {
                case "rr":
                    _Kernel.krnTrace("Scheduling programs using round robin.");

                    // Take items off resident queue and put into ready queue
                    var queueLength = _ResidentQueue.length;

                    for (var i = 0; i < queueLength; i++) {
                        var currentPCB = _ResidentQueue[i];

                        _ReadyQueue.enqueue(currentPCB);
                    }

                    // Clear the resident queue
                    _ResidentQueue = [];

                    // Reset quantum (used if someone loads during runall)
                    if (!_CPU.isExecuting) {
                        this.resetQuantum();
                    }

                    for (var j = 0; j < _ReadyQueue.getSize(); j++) {
                        _ReadyQueue.q[j].status = _ProcessStates.READY;
                    }

                    // Seek currentPCB to running
                    _CurrentPCB = _ReadyQueue.peek();
                    _CurrentPCB.status = _ProcessStates.RUNNING;

                    // Set scheduler flag
                    this.inUse = true;

                    break;

                case "fcfs":
                    console.log("First-come first-serve scheduling");
                    break;

                case "priority":
                    console.log("Priority scheduling");
                    break;

                case "default":
                    console.log("This shouldn't happen");
                    break;
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
