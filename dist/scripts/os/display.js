var TSOS;
(function (TSOS) {
    var Display = (function () {
        function Display() {
        }
        // TODO Probably a smoother way to do this
        Display.displayCPU = function () {
            var cpuInfoTable = document.getElementById("cpuStatus");

            while (cpuInfoTable.rows.length > 0) {
                cpuInfoTable.deleteRow(-1);
            }

            for (var i = 0; i < 2; i++) {
                var newRow = cpuInfoTable.insertRow(i);

                for (var j = 0; j < 5; j++) {
                    var newCell = newRow.insertCell(j);
                    var value = "";

                    // Display header
                    if (i === 0) {
                        value = Object.keys(_CPU)[j];
                    } else {
                        var key = Object.keys(_CPU)[j];
                        value = _CPU[key];
                    }

                    newCell.innerHTML = value;
                }
            }
        };
        return Display;
    })();
    TSOS.Display = Display;
})(TSOS || (TSOS = {}));
