cOSmOS - Operating System
=========================

This is my Fall 2014 Operating Systems class project.
See [Alan's Website](http://www.labouseur.com/courses/os/) for details.

[Access the OS](http://andrewbaran.github.io/TypeScriptOS/)
===========================================================
Last updated: October 11th, 2014

Project 1 Checklist
===================

- [x] Alter the ver command to display your own data
- [x] Add some new shell commands
	- [x] date - display the current date and time
	- [x] whereami - display current users location (be creative)
	- [x] One more command of your choosing (007)
- [x] Enhance the *host* display with a graphical task bar 
	- [x] Current time and date
	- [x] Status messages as specified by the user with a new shell command: status (string)
- [x] Implement scrolling in the *client OS* console/CLI
- [x] Other console / CLI enhancements 
	- [x] Accept and display punctuation characters and symbols
	- [x] Handle backspace appropriately
	- [x] Implement command completion with the tab key
	- [x] Provide command history recall via the up and down arrow keys
- [x] Display a BSOD message (on the CLI) when the kernel traps an OS error
	- [x] Add a shell command to test this
- [x] Add a shell command called load to validate the user code in the HTML 5 text area (id="taProgramInput"). Only hex digits and spaces are valid
- [x] **Optional**: Implement line-wrap in the CLI

Project 2 Checklist
===================

- [x] Modify the load command to copy the 6502a machine language op codes into main memory
	- [x] Put the code at location $0000 in memory
	- [x] Assign a Process ID (PID)
	- [x] Create a Process Control Block (PCB)
	- [x] Return the PID to the console
- [x] Add a shell command, run (pid), to run a program already in memory (user should be able to execute many load/run cycles)
- [x] Execute the running program (including displaying any output)
	Note: Be sure to synchronize the CPU execution cycles with clock ticks
- [x] As the programs executes, display Memory and the CPU status
	PC, instruction reg, accumulator, X reg, Y reg, Z flag) in real time
- [x] Update and display the PCB contents at the end of the execution
- [x] Implement line-wrap in the CLI (no longer optional)
- [x] **Optional**: Provide the ability to single-step execution

- [x] Develop a PCB prototype and implement it in the **client OS**
- [x] Develop a memory manager and implement it in the **client OS**
- [x] Develop a core memory prototype and implement it in the **host OS**
- [x] Develop a CPU prototype and implement it in the **host OS**

Project 3 Checklist
===================

- [x] Add a shell command, clearmem, to clear all memory partitions
- [x] Allow the user to load three programs into memory at once
- [ ] Add a shell command, runall, to execute all the programs at once
- [x] Add a shell command, quantum (int), to let the user set the Round Robin quantum (measured in clock ticks)
- [x] Display the Ready queue and its PCB contents (including process state) in real time
- [x] Add a shell command, ps, to display the PIDs of all active processes
- [ ] Add a shell command, kill (pid), to kill an active process
- [ ] Store multiple programs in memory, each in their own partition, allocated by the client OS
- [ ] Add base and limit registers to your core memory access code in the host OS and to your PCB object in the client OS
- [ ] Enforce memory partition boundaries at all times
- [x] Create a Resident list for the loaded processes
- [x] Create a Ready queue for the running processes
- [ ] Instantiate a PCB for each loaded program and put it in the Resident list
- [ ] Develop a CPU scheduler in the client OS using **Round Robin** scheduling with the user-specified quantum measured in clock ticks (default = 6)
	- [ ] Make the client OS control the host CPU for the client OS CPU scheduler
	- [ ] Log all scheduling events
- [ ] Implement context switches with software interrupts (Remember to update mode bit appropriately)
- [ ] Detect and handle errors like invalid op codes, missing operands, and memory out of bounds access attempts

Final Project Checklist
=======================

- [ ] Add shell commands for the following disk operations
	- [ ] create (filename) - create the file filename and display a message denoting success or failure
	- [ ] read (filename) - read and display the contents of filename or display an error if something went wrong
	- [ ] write (filename) "data" - write the data inside the quotes to filename and display a message denoting success or failure
	- [ ] delete (filename) - remove filename from storage and display a message denoting success or failure
	- [ ] format - initialize all blocks in all sectors in all tracks and display a message denoting success or failure
- [ ] Add a shell command, ls, to list the files currently stored on the disk
- [ ] Add a shell command to allow the user to select a CPU scheduling algorithm - setschedule [rr, fcfs, priority]
- [ ] Add a shell command, getschedule, to return the currently selected CPU scheduling algorithm
- [ ] Implement a file system in HTML5 web storage
- [ ] Include a file system viewer in your OS interface

- [ ] Develop a FIle System Device Driver (fsDD) for all of the functional requirements noted above
	- [ ] Load the fsDD in a similar manner as the keyboard device driver
	- [ ] Develop your fsDD to insulate and encapsulate the implementation of the kernel-level I/O operations from the byte-level details of your individual blocks on the local storage
- [ ] Add new scheduling algorithms to youe CPU scheduler (Default is RR)
	- [ ] First-come, first-served (FCFS)
	- [ ] Non-preemptive priority (You will need an optional load parameter here)

- [ ] Implement swapped virtual memory with enough physical memory for three concurrent user processes
	- [ ] Allow OS to execute four concurrent prcess by writing roll-out and roll-in routines
		- [ ] Take a ready process and store it to the disk via your fsDD
		- [ ] Load a swapped-out process and place it in the ready queue
		- [ ] Your ready queue should denote which process are where

Setup TypeScript/Gulp
=====================

1. Install [npm](https://www.npmjs.org/), if you don't already have it
1. `npm install -g typescript` to get the TypeScript Compiler
1. `npm install gulp` to get the Gulp Task Runner
1. `npm install gulp-tsc` to get the Gulp TypeScript plugin

Your Workflow
=============

Just run `gulp` at the command line in the root directory of this project! Edit your TypeScript files in the source/scripts directory in your favorite editor. Visual Studio has some additional tools that make debugging, syntax highlighting, and more very easy. WebStorm looks like a nice option as well.

Gulp will automatically:

* Watch for changes in your source/scripts/ directory for changes to .ts files and run the TypeScript Compiler on it
* Watch for changes to your source/styles/ directory for changes to .css files and copy them to the dist/ folder

TypeScript FAQs
==================

**What's TypeScript?**
TypeScript is a language that allows you to write in a statically-typed language that outputs standard JS!

**Why should I use it?**
This will be especially helpful for an OS or a Compiler that may need to run in the browser as you will have all of the great benefits of type checking built right into your language.

**Where can I get more info on TypeScript**
[Right this way!](http://www.typescriptlang.org/)

Gulp FAQs
=========

**Why are we using Gulp?**
Gulp is a tool that allows you to automate tons of workflow tasks. In this instance, we want it to watch our directory for changes and automatically run the TypeScript compiler on the source files to output JS to a distribution folder. We also use it to copy over .css files to our distribution folder.

**Copying over CSS files to a dist folder? That seems useless**
Well, in this case, it pretty much is, but it keeps your development consistent. You keep your source in the source directory, and you keep what you want to output to the user in the dist directory. In more mature front-end environments, you may be utilizing a CSS-preprocessor like LESS or SASS. This setup would allow you to keep your .less or .scss files in the source/styles directory, then output the compiled css folders to the dist/styles directory.

**What other cool things can I do with Gulp?**
If you were in a production environment where you wanted to obfuscate your code, you can use Gulp to automatically run things like [Uglify](https://github.com/terinjokes/gulp-uglify) on your JS/CSS. Or if you wanted to [minify your CSS](https://www.npmjs.org/package/gulp-minify-css). It is NOT recommended to do this for this project as you and Alan will need to read and debug this code, and allow GLaDOS to run code against yours.

**Where can I get more info on Gulp?**
[Right this way!](http://gulpjs.com/)
