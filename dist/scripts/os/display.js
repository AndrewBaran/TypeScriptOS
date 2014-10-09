var TSOS;
(function (TSOS) {
    var Display = (function () {
        function Display() {
        }
        // TODO Move this into CPU class
        Display.displayCPU = function () {
            var cpuInfoTable = document.getElementById("cpuStatus");

            while (cpuInfoTable.rows.length > 2) {
                cpuInfoTable.deleteRow(-1);
            }

            var newRow = cpuInfoTable.insertRow();

            for (var i = 0; i < 5; i++) {
                var key = Object.keys(_CPU)[i];
                var value = _CPU[key];

                var newCell = newRow.insertCell(i);

                newCell.innerHTML = value;
            }
        };
        return Display;
    })();
    TSOS.Display = Display;
})(TSOS || (TSOS = {}));
