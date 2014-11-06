///<reference path="../globals.ts" />
///<reference path="../os/canvastext.ts" />
/* ------------
Control.ts
Requires globals.ts.
Routines for the hardware simulation, NOT for our client OS itself.
These are static because we are never going to instantiate them, because they represent the hardware.
In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
is the "bare metal" (so to speak) for which we write code that hosts our client OS.
But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
in both the host and client environments.
This (and other host/simulation scripts) is the only place that we should see "web" code, such as
DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    var Control = (function () {
        function Control() {
        }
        Control.hostInit = function () {
            _Canvas = document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext('2d');

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();

            // Check for our testing and enrichment core.
            if (typeof Glados === "function") {
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        };

        Control.hostLog = function (msg, source) {
            if (typeof source === "undefined") { source = "?"; }
            // Note the OS CLOCK.
            var clock = _OSclock;

            // Build the log string.
            var str = "Clock: " + clock + " | " + msg + "\n";

            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
        };

        Control.displayTimer = function () {
            // Update time every second
            var dateString = TSOS.Utils.getFormattedDate();
            document.getElementById("statusTimer").innerHTML = dateString;
        };

        //
        // Host Events
        //
        Control.hostBtnStartOS_click = function (btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // Enable all other buttons
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            document.getElementById("btnEnableStep").disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu();
            _CPU.init();

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, _Constants.CPU_CLOCK_INTERVAL);

            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap();
        };

        Control.hostBtnHaltOS_click = function (btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");

            // Call the OS shutdown routine.
            _Kernel.krnShutdown();

            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        };

        Control.hostBtnReset_click = function (btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        };

        // Enables single step mode
        Control.hostBtnEnableStep_click = function (btn) {
            // Disable start and step button
            document.getElementById("btnStartOS").disabled = true;
            document.getElementById("btnEnableStep").disabled = true;

            // Enable step and stop button
            document.getElementById("btnStep").disabled = false;
            document.getElementById("btnStop").disabled = false;

            // Set flag
            Control.singleStepEnabled = true;

            // Clear CPU interval
            clearInterval(_hardwareClockID);

            // Keep clock still running; update it every second (1000ms = 1s)
            _hostClockDisplay = setInterval(Control.displayTimer, 1000);
        };

        // Executes 1 cycle in single step mode
        Control.hostBtnStep_click = function (btn) {
            TSOS.Devices.hostClockPulse();
        };

        // Stops single step mode
        Control.hostBtnStop_click = function (btn) {
            // Disable step and stop button
            document.getElementById("btnStep").disabled = true;
            Control.singleStepEnabled = false;

            document.getElementById("btnStop").disabled = true;

            // Enable start button
            document.getElementById("btnEnableStep").disabled = false;

            // Start up hardwareClock interval again
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, _Constants.CPU_CLOCK_INTERVAL);
        };

        // Loads a randomly selected program into the textbox taProgramInput
        Control.hostBtnLoadProgram_click = function (btn) {
            var programList = [
                { name: "3 + 4 = 7", code: "A9 03 8D 18 00 A9 04 6D 18 00 8D 19 00 A2 01 AC 19 00 FF 00" },
                { name: "For loop from 1 to 5", code: "A9 01 8D 20 00 A2 05 EE 20 00 EC 20 00 D0 F8 AC 20 00 A2 01 FF 00" },
                { name: "1 2 DONE", code: "A9 03 8D 41 00 A9 01 8D 40 00 AC 40 00 A2 01 FF EE 40 00 AE 40 00 EC 41 00 D0 EF A9 44 8D 42 00 A9 4F 8D 43 00 A9 4E 8D 44 00 A9 45 8D 45 00 A9 00 8D 46 00 A2 02 A0 42 FF 00" },
                { name: "Tom's Memory Filling Program", code: "A9 AD A2 A9 EC 10 00 8D 10 00 EE 08 00 D0 F8 00 00" },
                { name: "007", code: "A9 30 8D 70 00 8D 71 00 A9 37 8D 72 00 A2 02 A0 70 FF 00" }
            ];

            var index = Math.floor(Math.random() * (programList.length));
            var selectedProgram = programList[index];

            // Set name of program
            document.getElementById("programTitle").innerHTML = selectedProgram.name;

            // Load program into textbox
            document.getElementById("taProgramInput").value = selectedProgram.code;
        };

        Control.updateDisplays = function () {
            // Update CPU display
            _CPU.display();

            // Update memory display
            _MemoryManager.displayMemory();

            // Update ready queue display
            _Kernel.displayReadyQueue();
        };
        Control.singleStepEnabled = false;
        return Control;
    })();
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
