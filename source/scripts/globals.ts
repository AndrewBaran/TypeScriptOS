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
}

var _Constants: Constants = {APP_NAME: "cOSmOS", APP_VERSION: "3.14", CPU_CLOCK_INTERVAL: 100};

interface InterruptConstants {
	TIMER_IRQ: number; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
	KEYBOARD_IRQ: number;
	SYSTEM_CALL_IRQ: number;
	CONTEXT_SWITCH_IRQ: number;
}

var _InterruptConstants: InterruptConstants = {TIMER_IRQ: 0, KEYBOARD_IRQ: 1, SYSTEM_CALL_IRQ: 2, CONTEXT_SWITCH_IRQ: 3}

interface MiscConstants {
	NUM_HEX_DIGITS: number;
}

// Constants that don't have a definitive category (I don't like magic numbers)
var _MiscConstants: MiscConstants = {NUM_HEX_DIGITS: 3};

interface MemoryConstants {
	PROCESS_SIZE: number;
	NUM_COLUMNS: number;
	NUM_ROWS: number;
	BYTES_PER_ROW: number;
}

var _MemoryConstants: MemoryConstants = {PROCESS_SIZE: 256, NUM_ROWS: 96, NUM_COLUMNS: 8, BYTES_PER_ROW: 8};

interface MemoryType {
	INSTRUCTION: number;
	DATA: number;
}

// Differentiating type of memory when coloring them during program execution
var _MemoryType: MemoryType = {INSTRUCTION: 0, DATA: 1};

// My Globals
var _MONTH_NAMES: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var _CANVAS_COLOR : string = "#DFDBC3";

//
// Global Variables
//
var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock: number = 0;  // Page 23.

var _Mode: number = 0;     // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.

// Main memory
var _MemoryManager: TSOS.MemoryManager; // Abstraction layer above main memory

// Process lists and related
var _ResidentQueue: TSOS.PCB[]; // List of processes in memory but not running
var _ReadyQueue: TSOS.Queue; // Queue of processes that are in memory and running

var _CurrentPCB: TSOS.PCB; // PCB of process that has CPU time

// Scheduler
var _Scheduler: TSOS.Scheduler; // CPU Scheduler

var _Canvas: HTMLCanvasElement = null;  // Initialized in hostInit().
var _DrawingContext = null;             // Initialized in hostInit().
var _DefaultFontFamily: string = "sans";        // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize: number = 13;
var _FontHeightMargin: number = 4;              // Additional space added to font size when advancing a line.

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

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID: number = null;
var _hostClockDisplay: number = null;

// For testing...
var _GLaDOS: any = null;
var Glados: any = null;

var onDocumentLoad = function() {
	TSOS.Control.hostInit();
};
