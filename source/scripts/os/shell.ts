///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

module TSOS {
    export class Shell {

        // Properties
        public promptStr: string = ">";
        public commandList = [];
        public history = {list: [], currentCommand: 0, numItems: 0};

        constructor() {

        }

        public init(): void {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new ShellCommand(this.shellDate, "date", " - Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new ShellCommand(this.shellWhereAreI, "whereami", " - Displays your current location.");
            this.commandList[this.commandList.length] = sc;

            // 007: bonus command
            sc = new ShellCommand(this.shell007, "007", " - Displays a suggested James Bond film to watch.");
            this.commandList[this.commandList.length] = sc;

            // bsod: for testing purposes
            sc = new ShellCommand(this.shellBSOD, "bsod", " - Displays the BSOD screen when trapping an OS error.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(this.shellLoad, "load", " - Validates the code in the User Program Input box.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(this.shellStatus, "status", " <string> - Display the status message of <string>.");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new ShellCommand(this.shellRun, "run", " <pid> - Runs the program <pid> in memory.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll, "runall", " - Runs each program loaded in memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions in the system.");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new ShellCommand(this.shellQuantum, "quantum", " <num> - Sets the quantum amount for RR scheduling.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPS, "ps", " - Display the PIDs of all active processes.");
            this.commandList[this.commandList.length] = sc;

            // kill <id>
            sc = new ShellCommand(this.shellKill, "kill", " <id> - Kill the pid of the associated <id>.");
            this.commandList[this.commandList.length] = sc;

            // setSchedule <rr | fcfs | priority>
            sc = new ShellCommand(this.shellSetSchedule, "setschedule", "<type> - Set scheduling algorithm to (rr, fcfs, priority).");
            this.commandList[this.commandList.length] = sc;

            // getSchedule
            sc = new ShellCommand(this.shellGetSchedule, "getschedule", " - Displays the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new ShellCommand(this.shellLS, "ls", " Displays the files in the current directory.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new ShellCommand(this.shellCreate, "create", " <filename> - Creates a new file with the name <filename>.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new ShellCommand(this.shellRead, "read", " <filename> - Read the contents of the file <filename>.");
            this.commandList[this.commandList.length] = sc;

            // write <filename>
            sc = new ShellCommand(this.shellWrite, "write", " <filename> \"contents\" - Write the contents within the double quotes to the file <filename>.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new ShellCommand(this.shellDelete, "delete", " <filename> - Delete the file <filename> from the disk.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new ShellCommand(this.shellFormat, "format", " - Formats the disk back to its default state.");
            this.commandList[this.commandList.length] = sc;

            // TODO Remove after testing is done
            // test <pid>
            sc = new ShellCommand(this.shellTest, "test", " <pid> - Tests rolling program out to the disk.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt(): void {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer): void {
            _Kernel.krnTrace("Shell Command: " + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);

            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;


            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }

            else {
                this.execute(this.shellInvalidCommand);
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?): void {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();

            // ... call the command function passing in the args...
            fn(args);

            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }

            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        // Adds a command to the history
        public addHistory(buffer) : void {

            // Add the current command to the history
            this.history.list.push(buffer);
            this.history.numItems++;

            // Move current command cursor to latest item
            this.history.currentCommand = this.history.list.length;
        }

        // Finds a potential match for the current string in the buffer
        public findMatch(buffer) : string {
            for(var i = 0; i < this.commandList.length; i++) {

                var currentCommand : string = this.commandList[i].command;
                var substring : string = currentCommand.substring(0, buffer.length);

                // Match found
                if(substring === buffer) {
                    return currentCommand;
                }
            }

            // No match found
            return null;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //

        public shellInvalidCommand(): void {
            _StdOut.putText("Invalid Command. ");
            _StdOut.putText("Type 'help' for a list of available commands.");
        }

        public shellVer(args): void {
            _StdOut.putText(_Constants.APP_NAME + ": version " + _Constants.APP_VERSION);
        }

        public shellHelp(args): void {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args): void {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args): void {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args): void {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args): void {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace) {
                            _StdOut.putText("Trace is already on.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args): void {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args): void {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate(): void {
            var dateString : string = Utils.getFormattedDate();

            _StdOut.putText("The current date is: " + dateString);
        }

        public shellWhereAreI(): void {
            _StdOut.putText("You are probably in Pouhgkeepsie, NY, at Marist College. Or not if you are a job recruiter...");
        }

        public shell007(): void {

        	var movies = [
        		{title: "Dr. No", bondActor: "Sean Connery"},
        		{title: "From Russia with Love", bondActor: "Sean Connery"},
        		{title: "Goldfinger", bondActor: "Sean Connery"},
        		{title: "Casino Royale", bondActor: "Daniel Craig"},
        		{title: "Quantum of Solace", bondActor: "Daniel Craig"},
        		{title: "Skyfall", bondActor: "Daniel Craig"}
        	];

        	// Randomly pick a movie to watch
        	var index = Math.floor(Math.random() * (movies.length));
        	var selectedMovie = movies[index];

        	_StdOut.putText("You should");

        	if(selectedMovie.bondActor === "Daniel Craig") {
        		_StdOut.putText(" not");
        	}

        	_StdOut.putText(" watch " + selectedMovie.title + ", which stars actor " + selectedMovie.bondActor + ".");
        }

        // TODO Improve by removing prompt that follows error message (same issue as in shellShutdown())
        public shellBSOD(): void {

            // Change canvas background color to Microsoft Approved Blue (TM)
            document.getElementById("display").style.backgroundColor = "#2067B2";

            _StdOut.clearScreen();
            _StdOut.resetXY();

            // Display BSOD message
            _StdOut.putText("Attention! An unexpected error has occurred and the system must be reset. Check host log for details.");

            clearInterval(_hardwareClockID);
        }

        public shellLoad(): void {

            // Get text from the User Program Input textbox
            var textInput : string = (<HTMLInputElement>document.getElementById("taProgramInput")).value;

            // Validate that the text input contains only hex characters and/or spaces
            var regExpPattern = /[a-f|A-F|0-9|\s]/;
            var validInput : boolean = true;

            // Loop through input, testing regExpPattern against each character
            for(var i: number = 0; i < textInput.length; i++) {
                if(!regExpPattern.test(textInput[i])) {
                    validInput = false;
                    break;
                }
            }

            // Valid hex
            if(validInput && textInput.length > 0) {

                // Split input into bytes (2 hex digits each)
                var byteList: string[] = textInput.split(" ");

                // Check if they are nibble pairs
                for(var j: number = 0; j < byteList.length; j++) {
                	if(byteList[j].length != 2) {
                		validInput = false;
                	}

                    // Convert to uppercase hex letters if necessary
                    byteList[j] = Utils.toUpperHex(byteList[j]);
                }

                if(validInput) {

                    if(byteList.length <= _MemoryConstants.PROCESS_SIZE) {

                        _MemoryManager.loadProgram(byteList);
                        
                    }

                    else {
                        _StdOut.putText("Invalid program input. Program code too large.");
                    }


                }

                else {
                	_StdOut.putText("Invalid program input. Invalid number of hex digits.")
                }

            }

            else {
                _StdOut.putText("Error: Invalid program input. Only hex digits allowed.");
            }

        } // shellLoad()

        public shellStatus(args : string[]): void {
            
            // Invalid number of arguments
            if(args.length < 1) {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            }

            else {
                
                // Combine all passed in arguments into a single string
                var statusString : string = args.join(" ");

                // Update display with new status value
                document.getElementById("statusDisplay").innerHTML = statusString;
            }

        }

        public shellRun(args: string[]): void {

            // Invalid arguments
            if(args.length != 1) {
                _StdOut.putText("Usage: run <pid> Please supply a program ID");
            }

            // If runall is already running
            else if(_Scheduler.inUse && _ResidentQueue.length !== 0) {

                // Adding processes to end of queue
                _Scheduler.schedule();
            }

            // Regular ole run command
            else {

                var processID: number = parseInt(args[0], 10);
                var properIndex: number = -1;

                for(var i: number = 0; i < _ResidentQueue.length; i++) {

                    if(_ResidentQueue[i].processID === processID) {

                        var properIndex = i;
                        break;
                    }
                }

                // Found PCB in the residentQueue
                if(properIndex !== -1) {

                    // Remove PCB from resident queue
                    var selectedPCB: TSOS.PCB = _ResidentQueue[properIndex];
                    _ResidentQueue.splice(properIndex, 1);

                    // If PCB is on disk
                    if(selectedPCB.location === _Locations.DISK) {

                        console.log("PCB is on disk");

                        var memorySlot: number = -1;
                        var memorySlotFound: boolean = false;

                        // Find available location in disk
                        for(var i: number = 0; i < _MemoryManager.programsInUse.length; i++) {

                            if(_MemoryManager.programsInUse[i] === 0) {

                                memorySlot = i;
                                memorySlotFound = true;
                            }
                        }

                        // Pick one at random if no location available
                        if(!memorySlotFound) {

                            console.log("Picking slot at random.");
                            memorySlot = Math.floor(Math.random() * (_MemoryManager.programsInUse.length));

                        }

                        console.log("Replacing slot " + memorySlot);
                        console.log(_ResidentQueue);
                        for(var index: number = 0; index < _ResidentQueue.length; index++) {

                            var pcbBeingReplaced: TSOS.PCB = _ResidentQueue[index];

                            if(pcbBeingReplaced.memorySlot === memorySlot) {
                                console.log("This PCB");
                                console.log(pcbBeingReplaced);
                                console.log("is in memorySlot " + memorySlot);

                                break;
                            }
                        }

                        // Roll PCB from disk to memory
                        _Kernel.programRollOut(pcbBeingReplaced.processID, true);

                        // Clear memory at the slot
                        _MemoryManager.clearMemory(pcbBeingReplaced.memorySlot);

                        // Clear items on the replaced PCB
                        pcbBeingReplaced.location = _Locations.DISK;
                        pcbBeingReplaced.memorySlot = -1;

                        // Place PCB back in the resident queue
                        _ResidentQueue[index] = pcbBeingReplaced;

                        // Roll requested PCB into disk
                        _Kernel.programRollIn(processID, true);

                        console.log(_ResidentQueue);

                        Control.updateDisplays();
                    }

                    // Add PCB to ready queue
                    _ReadyQueue.enqueue(selectedPCB);
                    _CurrentPCB = selectedPCB;

                    // Set CPU to execute
                    _CPU.isExecuting = true;

                    // Clear CPU
                    _CPU.clear();

                    // Display the ready queue
                    Control.updateDisplays();
                }

                else {
                    _StdOut.putText("Error: Invalid process ID");
                }
                
            } // else

        } // shellRun()

        // Runs all the programs in the resident queue
        public shellRunAll(): void {

            // Make sure residentQueue is not empty
            if(_ResidentQueue.length > 0) {
                
                // Use scheduler to arrange processes
                _Scheduler.schedule();

                // Set CPU to execute
                _CPU.isExecuting = true;
            }

            else {
                _StdOut.putText("Error: No programs available to run.");
            }


        }

        // Clears out the entire memory array and resident queue
        public shellClearMem(): void {

            // Call this method without parameters to clear all partitions
            _MemoryManager.clearMemory();

            // Reload memory display
            Control.updateDisplays();

            // Clear resident queue
            _ResidentQueue = [];

            _StdOut.putText("Memory has been cleared.");
        }

        // Sets the quantum time length for round robin scheduling
        public shellQuantum(args: string[]): void {

            if(args.length !== 1) {
                _StdOut.putText("Usage: quantum <num> Please supply a positive number.")
            }

            else {

                var quantumValue: number = parseInt(args[0], 10);

                // Valid quantum value
                if(quantumValue > 0) {

                    _Scheduler.setQuantumValue(quantumValue);
                    _StdOut.putText("Quantum has been set to " + quantumValue);
                }

                else {
                    _StdOut.putText("Error! Quantum must be > 0.");
                }

            }

        } // shellQuantum()

        // Lists processes that are in the ready queue
        public shellPS(): void {

            var printString: string = "Processes running: ";

            for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

                printString += _ReadyQueue.q[i].processID + " ";
            }

            if(_ReadyQueue.getSize() === 0) {
                printString += "None";
            }

            _StdOut.putText(printString);

        }

        // Kills an active process
        public shellKill(args: string[]): void {

            if(args.length !== 1) {

                _StdOut.putText("Usage: kill <id> Please provide a valid PID.");
            }

            else {

                var processID: number = parseInt(args[0], 10);

                var properIndex: number = -1;

                // Check for valid PID
                for(var i: number = 0; i < _ReadyQueue.getSize(); i++) {

                    if(_ReadyQueue.q[i].processID === processID) {

                        properIndex = i;
                        break;
                    }

                }

                if(properIndex === -1) {

                    _StdOut.putText("Error! Invalid Process ID.");
                }

                else {

                    var removedPCB: TSOS.PCB = _ReadyQueue.q[properIndex];

                    // Stop program from executing
                    removedPCB.isExecuting = false;

                    // Stop CPU from executing current PCB
                    if(removedPCB === _CurrentPCB) {

                        // Set currentPCB to finished
                        _CurrentPCB.status = _ProcessStates.FINISHED;

                        // Stop tracking it
                        _MemoryManager.programsInUse[_CurrentPCB.processID] = 0;

                        // Enqueue an interrupt to context switch to a new process
                        _KernelInterruptQueue.enqueue(new Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));

                    }

                    else {
                        
                        // Remove program from ready queue
                        _ReadyQueue.q.splice(properIndex, 1);

                        // Remove tracking the program
                        _MemoryManager.programsInUse[removedPCB.processID] = 0;

                        // Clear out memory for program
                        _MemoryManager.clearMemory(removedPCB.processID);

                        // Reload displays
                        Control.updateDisplays();

                        _StdOut.putText("PID " + removedPCB.processID + " was successfully removed.");
                    }
                }
            }
        } // shellKill()

        // Sets the scheduling algorithm
        public shellSetSchedule(args: string[]): void {

            // Invalid number of arguments
            if(args.length !== 1) {
                _StdOut.putText("Usage: setschedule <type>  Please supply a scheduling algorithm.");
            }

            else {

                var schedulingType: string = args[0];

                if(schedulingType === "rr" || schedulingType === "fcfs" || schedulingType === "priority") {

                    _Scheduler.setSchedulingType(schedulingType);

                    _StdOut.putText("Scheduling algorithm set to: " + schedulingType);
                }

                else {
                    _StdOut.putText("Error! Invalid scheduling type.");
                }
            }

        } // setSchedule()

        // Returns the scheduling algorithm type
        public shellGetSchedule(): void {

            var schedulingType: string = _Scheduler.getSchedulingType();

            _StdOut.putText("Scheduling algorithm: " + schedulingType); 
        }

        // Lists the fileNames in the current directory
        public shellLS(): void {

            _Mode_Bit = _Modes.KERNEL;

            var fileNameList: string = _KrnFileSystemDriver.getFileNames();

            _Mode_Bit = _Modes.USER;

            // No files found
            if(fileNameList.length === 0) {

                _StdOut.putText("No files found on disk.");
                _StdOut.advanceLine();
            }

            else {

	            _StdOut.putText("Files on disk: ");
	            _StdOut.advanceLine();

	            // Display files
	            for(var i: number = 0; i < fileNameList.length; i++) {

	                _StdOut.putText(fileNameList[i]);
	                _StdOut.advanceLine();
	            }
            }

        } // shellLS()

        // Creates a new file in the file system with the name <filename>
        public shellCreate(args: string[]): void {

            var fileName: string = args[0];

            // Invalid arguments
            if(args.length !== 1) {
                _StdOut.putText("Usage: create <filename>  Please supply a filename.");
            }

            // Invalid file name
            else if(!Utils.isValidFileName(fileName)) {
                _StdOut.putText("Error! Invalid filename.");
            }

            // Valid filename; create the file
            else {

                _Mode_Bit = _Modes.KERNEL;

                var result: boolean = _KrnFileSystemDriver.createFile(fileName);

                _Mode_Bit = _Modes.USER;

                if(result) {

                    _StdOut.putText("File " + fileName + " successfully created.");

                    // Update the displays
                    _KrnFileSystemDriver.displayFileSystem();
                }

                else {
                    _StdOut.putText("File could not be created. Secondary memory is full.");
                }
            }

        } // shellCreate()

        public shellRead(args: string[]): void {

        	var fileName: string = args[0];

        	// Invalid arguments
        	if(args.length !== 1) {
        		_StdOut.putText("Usage: read <filename> - Please supply a filename.");
        	}

        	else if(!Utils.isValidFileName(fileName)) {
        		_StdOut.putText("Error! Invalid filename.");
        	}

        	else {

        		var fileName: string = args[0];
        		var directoryFiles: string[] = _KrnFileSystemDriver.getFileNames();

        		var fileFound: boolean = false;

        		// See if the file exists on the disk
        		for(var i: number = 0; i < directoryFiles.length; i++) {

        			if(directoryFiles[i] === fileName) {

        				fileFound = true;
        				break;
        			}
        		}

        		if(fileFound) {

        			var fileContents: string = _KrnFileSystemDriver.readFile(fileName);

	        		_StdOut.putText("Contents of file " + fileName + ": ");
	        		_StdOut.advanceLine();

	        		_StdOut.putText(fileContents);
	        		_StdOut.advanceLine();
        		}

        		else {
					_StdOut.putText("Error! File not found on disk.");        			
        		}
        	}

        } // shellRead()

        // Write the specified contents to the file specified
        public shellWrite(args: string[]): void {

        	var fileName: string = args[0];

        	// Invalid arguments
        	if(args.length < 2) {
        		_StdOut.putText("Usage: write <filename> \"contents\"  Please supply a filename.");
        	}

        	else if(!Utils.isValidFileName(fileName)) {
        		_StdOut.putText("Error! Invalid filename.");
        	}

        	else {

        		var contentToWrite: string = "";

        		// TODO BAD WAY OF PARSING CONTENTS; FIX ME
        		// Combine each of the additional arguments (the contents) into a single unified string
        		for(var i: number = 1; i < args.length; i++) {

        			contentToWrite += args[i];

        			// Add space for all but last iteration
        			if(!((i + 1) === args.length)) {
        				contentToWrite += " ";
        			}
        		}

        		// Strip off the quotation marks
        		contentToWrite = contentToWrite.substring(1, contentToWrite.length);
        		contentToWrite = contentToWrite.substring(0, contentToWrite.length - 1);

        		var fileFound: boolean = false;

        		var directoryFiles: string[] = _KrnFileSystemDriver.getFileNames();

        		// See if the file exists on the disk
        		for(var i: number = 0; i < directoryFiles.length; i++) {

        			if(directoryFiles[i] === fileName) {

        				fileFound = true;
        				break;
        			}
        		}

        		if(fileFound) {

        			// Write contents to the file
        			_Mode_Bit = _Modes.KERNEL;

        			var writeResult: boolean = _KrnFileSystemDriver.writeFile(fileName, contentToWrite);

        			_Mode_Bit = _Modes.USER;

                    if(writeResult) {
                        _StdOut.putText(contentToWrite + " written to file " + fileName + ".");
                    }

                    else {
                        _StdOut.putText("Error: disk full. Couldn't write to file.");
                    }

        			// Update the file system display
        			_KrnFileSystemDriver.displayFileSystem();
        		}

        		else {
					_StdOut.putText("Error! File not found on disk.");        			
        		}

        	}

        } // shellWrite()

        // Deletes the specified file from disk
        public shellDelete(args: string[]): void {

        	var fileName: string = args[0];

        	// Invalid arguments
        	if(args.length !== 1) {
        		_StdOut.putText("Usage: delete <filename>  Please supply a filename.");
        	}

        	else if(!Utils.isValidFileName(fileName)) {
        		_StdOut.putText("Error! Invalid filename.");
        	}

        	else {

        		var directoryFiles: string[] = _KrnFileSystemDriver.getFileNames();

        		var fileFound: boolean = false;

        		for(var i: number = 0; i < directoryFiles.length; i++) {

        			if(directoryFiles[i] === fileName) {

        				fileFound = true;
        				break;
        			}
        		} 

        		if(fileFound) {

        			_Mode_Bit = _Modes.KERNEL;

        			var deleteResult: boolean = _KrnFileSystemDriver.deleteFile(fileName);

        			_Mode_Bit = _Modes.USER;

                    // Update display
                    _KrnFileSystemDriver.displayFileSystem();

        			if(deleteResult) {
        				_StdOut.putText("File " + fileName + " was successfully deleted.");
        			}

        			// This shouldn't happen
        			else {
        				_StdOut.putText("Error! File " + fileName + " couldn't be deleted.");	
        			}

        		}

        		// File not found
        		else {
        			_StdOut.putText("Error! File not found on disk.");
        		}
        	}

        } //shellDelete()

        // Formats the disk back to its default state
        public shellFormat(): void {

        	// Protection against Alan
        	if(_Scheduler.inUse || _CPU.isExecuting) {

        		_StdOut.putText("Error! Cannot format as programs are running.");
        	}

        	else {

        		_Mode_Bit = _Modes.KERNEL;

        		_KrnFileSystemDriver.formatDisk();

        		_Mode_Bit = _Modes.USER;

        		_StdOut.putText("Disk successfully formatted.");
        		_Kernel.krnTrace("Formatted disk.");

        		// Update file system display
        		_KrnFileSystemDriver.displayFileSystem();
        	}

        } // shellFormat()

        // TODO Remove after testing is over
        public shellTest(inputPID: string): void {

            var pidValue: number = parseInt(inputPID, 10);

            console.log("Rolling pid " + pidValue + " out to disk.");

            _Kernel.programRollOut(pidValue);

            _Kernel.programRollIn(pidValue);
        }

    }
}