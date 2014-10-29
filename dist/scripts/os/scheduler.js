var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        // Default scheduling type is round robin
        function Scheduler() {
            this.schedulingType = "rr";
            this.quantum = 6;
        }
        Scheduler.prototype.setQuantum = function (newQuantum) {
            this.quantum = newQuantum;
        };

        // TODO Implement
        Scheduler.prototype.schedule = function () {
            switch (this.schedulingType) {
                case "rr":
                    console.log("Round robin scheduling");

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
