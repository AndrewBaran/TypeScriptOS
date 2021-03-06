/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */

var _Constants = { APP_NAME: "cOSmOS", APP_VERSION: "3.14", CPU_CLOCK_INTERVAL: 100 };

var _InterruptConstants = { TIMER_IRQ: 0, KEYBOARD_IRQ: 1, SYSTEM_CALL_IRQ: 2, CONTEXT_SWITCH_IRQ: 3 };

// Constants that don't have a definitive category (I don't like magic numbers)
var _MiscConstants = { NUM_HEX_DIGITS: 3 };

var _MemoryConstants = { PROCESS_SIZE: 256, NUM_ROWS: 96, NUM_COLUMNS: 8, BYTES_PER_ROW: 8 };

var _ProcessStates = { NEW: "New", READY: "Ready", RUNNING: "Running", FINISHED: "Finished" };

var _FileConstants = { NUM_TRACKS: 4, NUM_SECTORS: 8, NUM_BLOCKS: 8, BLOCK_SIZE: 64, DATA_SIZE: 60 };

// My Globals
var _MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var _CANVAS_COLOR = "#FFFFFF";

//
// Global Variables
//
var _CPU;
var _OSclock = 0;

var _Mode_Bit = 0;
var _Modes = { KERNEL: 1, USER: 0 };

var _Locations = { MEMORY: "Memory", DISK: "Disk" };

// Main memory
var _MemoryManager;

// Process lists and related
var _ResidentQueue;
var _ReadyQueue;

var _CurrentPCB;

// Scheduler
var _Scheduler;

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
// Keyboard
var _krnKeyboardDriver = null;

// File system
var _KrnFileSystemDriver = null;

var _hardwareClockID = null;
var _hostClockDisplay = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
