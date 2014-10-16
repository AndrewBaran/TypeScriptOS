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
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
