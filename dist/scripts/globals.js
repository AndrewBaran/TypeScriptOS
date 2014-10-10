/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */

var _Constants = { APP_NAME: "cOSmOS", APP_VERSION: "3.14", CPU_CLOCK_INTERVAL: 100, TIMER_IRQ: 0, KEYBOARD_IRQ: 1, SYSTEM_CALL_IRQ: 2 };

var _MemoryConstants = { PROCESS_SIZE: 256, NUM_ROWS: 96, NUM_COLUMNS: 8, BYTES_PER_ROW: 8 };

// Differentiating type of memory when coloring them during program execution
var _MemoryType = { INSTRUCTION: 0, DATA: 1 };

// My Globals
var _MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var _CANVAS_COLOR = "#DFDBC3";

//
// Global Variables
//
var _CPU;
var _OSclock = 0;

var _Mode = 0;

// Main memory
var _MemoryManager;

// Process lists and related
var _ResidentQueue;
var _ReadyQueue;

var _CurrentPCB;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;
var _hostClockDisplay = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
