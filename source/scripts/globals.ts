/* ------------
   Globals.ts

   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)

   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
//
interface Constants {
	APP_NAME: string;
	APP_VERSION: string;

	CPU_CLOCK_INTERVAL: number; // This is in ms, so 1000 = 1 second.
	TIMER_IRQ: number; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
	KEYBOARD_IRQ: number;
}

var _Constants: Constants = {APP_NAME: "cOSmOS", APP_VERSION: "3.14", CPU_CLOCK_INTERVAL: 100, TIMER_IRQ: 0, KEYBOARD_IRQ: 1};

interface MemoryConstants {
	PROCESS_SIZE: number;
	NUM_COLUMNS: number;
	NUM_ROWS: number;
}

// TODO 64 rows seems enough?
var _MemoryConstants: MemoryConstants = {PROCESS_SIZE: 256, NUM_ROWS: 64, NUM_COLUMNS: 9};


// My Globals
var _MONTH_NAMES: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var _CANVAS_COLOR : string = "#DFDBC3";

//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

// TODO Do I want this or just a static memory data structure?
var _Memory: TSOS.Memory; // Main memory data structure

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;              // Additional space added to font size when advancing a line.


var _Trace: boolean = true;  // Default the OS trace to be on.

// The OS Kernel and its queues.
var _Kernel: TSOS.Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers: any[] = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn  = null;
var _StdOut = null;

// UI
var _Console: TSOS.Console;
var _OsShell: TSOS.Shell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode: boolean = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
