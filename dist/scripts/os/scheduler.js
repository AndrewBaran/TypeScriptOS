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

        Scheduler.prototype.setSchedulingType = function (schedulingType) {
            this.schedulingType = schedulingType;
        };

        // Takes PCBs in the resident queue and arranges them in the ready queue accordingly
        Scheduler.prototype.schedule = function () {
            switch (this.schedulingType) {
                case "rr":
                case "fcfs":
                    if (this.schedulingType === "rr") {
                        _Kernel.krnTrace("Scheduling programs using round robin.");
                    } else {
                        _Kernel.krnTrace("Scheduling programs using first-come first-serve.");
                    }

                    // Take items off resident queue and put into ready queue
                    var queueLength = _ResidentQueue.length;

                    for (var i = 0; i < queueLength; i++) {
                        var currentPCB = _ResidentQueue[i];

                        _ReadyQueue.enqueue(currentPCB);
                    }

                    // Clear the resident queue
                    _ResidentQueue = [];

                    // Reset quantum (used if someone loads during runall)
                    if (!_CPU.isExecuting && this.schedulingType === "rr") {
                        this.resetQuantum();
                    }

                    for (var j = 0; j < _ReadyQueue.getSize(); j++) {
                        _ReadyQueue.q[j].status = _ProcessStates.READY;
                    }

                    // Set currentPCB to running
                    _CurrentPCB = _ReadyQueue.peek();
                    _CurrentPCB.status = _ProcessStates.RUNNING;

                    // Set scheduler flag
                    this.inUse = true;

                    // Log the scheduling event
                    _Kernel.krnTrace("Process state of PID " + _CurrentPCB.processID + " loaded.");

                    break;

                case "priority":
                    _Kernel.krnTrace("Scheduling programs using priority.");

                    var listToSort = [];

                    for (var i = 0; i < _ResidentQueue.length; i++) {
                        var currentPCB = _ResidentQueue[i];
                        listToSort.push(currentPCB);
                    }

                    // Clear resident queue
                    _ResidentQueue = [];

                    // Get all items, except the first item, off the ready queue
                    var readyQueueLength = _ReadyQueue.getSize();

                    for (var i = 1; i < readyQueueLength; i++) {
                        var currentPCB = _ReadyQueue.q[i];
                        listToSort.push(currentPCB);
                    }

                    // Clear ready queue if it has elements; save first element (one in use by CPU)
                    if (_ReadyQueue.getSize() !== 0) {
                        var pcbInUse = _ReadyQueue.dequeue();

                        _ReadyQueue = new TSOS.Queue();
                        _ReadyQueue.enqueue(pcbInUse);
                    }

                    // Sort the list into decreasing priority
                    listToSort.sort(TSOS.Utils.compareUsingPriority);

                    console.log("Sorted list: " + listToSort);

                    // Push sorted list items back into the ready queue
                    var listLength = listToSort.length;

                    for (var i = 0; i < listLength; i++) {
                        var currentPCB = listToSort[i];

                        // Set status to ready
                        currentPCB.status = _ProcessStates.READY;

                        // Add PCB to the ready queue
                        _ReadyQueue.enqueue(currentPCB);
                    }

                    // Set scheduler falg
                    this.inUse = true;

                    // Set global PCB to first item
                    _CurrentPCB = _ReadyQueue.peek();
                    _CurrentPCB.status = _ProcessStates.RUNNING;

                    break;

                default:
                    console.log("This shouldn't happen");
                    break;
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
