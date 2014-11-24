///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.history = { list: [], currentCommand: 0, numItems: 0 };
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            // whereami
            sc = new TSOS.ShellCommand(this.shellWhereAreI, "whereami", " - Displays your current location.");
            this.commandList[this.commandList.length] = sc;

            // 007: bonus command
            sc = new TSOS.ShellCommand(this.shell007, "007", " - Displays a suggested James Bond film to watch.");
            this.commandList[this.commandList.length] = sc;

            // bsod: for testing purposes
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", " - Displays the BSOD screen when trapping an OS error.");
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Validates the code in the User Program Input box.");
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new TSOS.ShellCommand(this.shellStatus, "status", " <string> - Display the status message of <string>.");
            this.commandList[this.commandList.length] = sc;

            // run <pid>
            sc = new TSOS.ShellCommand(this.shellRun, "run", " <pid> - Runs the program <pid> in memory.");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", " - Runs each program loaded in memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions in the system.");
            this.commandList[this.commandList.length] = sc;

            // quantum <int>
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", " <num> - Sets the quantum amount for RR scheduling.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new TSOS.ShellCommand(this.shellPS, "ps", " - Display the PIDs of all active processes.");
            this.commandList[this.commandList.length] = sc;

            // kill <id>
            sc = new TSOS.ShellCommand(this.shellKill, "kill", " <id> - Kill the pid of the associated <id>.");
            this.commandList[this.commandList.length] = sc;

            // setSchedule <rr | fcfs | priority>
            sc = new TSOS.ShellCommand(this.shellSetSchedule, "setschedule", "<type> - Set scheduling algorithm to (rr, fcfs, priority).");
            this.commandList[this.commandList.length] = sc;

            // getSchedule
            sc = new TSOS.ShellCommand(this.shellGetSchedule, "getschedule", " - Displays the current scheduling algorithm.");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new TSOS.ShellCommand(this.shellLS, "ls", " Displays the files in the current directory.");
            this.commandList[this.commandList.length] = sc;

            // create <filename>
            sc = new TSOS.ShellCommand(this.shellCreate, "create", " <filename> - Creates a new file with the name <filename>.");
            this.commandList[this.commandList.length] = sc;

            // read <filename>
            sc = new TSOS.ShellCommand(this.shellRead, "read", " <filename> - Read the contents of the file <filename>.");
            this.commandList[this.commandList.length] = sc;

            // write <filename>
            sc = new TSOS.ShellCommand(this.shellWrite, "write", " <filename> \"contents\" - Write the contents within the double quotes to the file <filename>.");
            this.commandList[this.commandList.length] = sc;

            // delete <filename>
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", " <filename> - Delete the file <filename> from the disk.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", " - Formats the disk back to its default state.");
            this.commandList[this.commandList.length] = sc;

            // TODO Remove after testing is done
            // test <pid>
            sc = new TSOS.ShellCommand(this.shellTest, "test", " <pid> - Tests rolling program out to the disk.");
            this.commandList[this.commandList.length] = sc;

            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command: " + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
            } else {
                this.execute(this.shellInvalidCommand);
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
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
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        // Adds a command to the history
        Shell.prototype.addHistory = function (buffer) {
            // Add the current command to the history
            this.history.list.push(buffer);
            this.history.numItems++;

            // Move current command cursor to latest item
            this.history.currentCommand = this.history.list.length;
        };

        // Finds a potential match for the current string in the buffer
        Shell.prototype.findMatch = function (buffer) {
            for (var i = 0; i < this.commandList.length; i++) {
                var currentCommand = this.commandList[i].command;
                var substring = currentCommand.substring(0, buffer.length);

                // Match found
                if (substring === buffer) {
                    return currentCommand;
                }
            }

            // No match found
            return null;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            _StdOut.putText("Type 'help' for a list of available commands.");
        };

        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(_Constants.APP_NAME + ": version " + _Constants.APP_VERSION);
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellDate = function () {
            var dateString = TSOS.Utils.getFormattedDate();

            _StdOut.putText("The current date is: " + dateString);
        };

        Shell.prototype.shellWhereAreI = function () {
            _StdOut.putText("You are probably in Pouhgkeepsie, NY, at Marist College. Or not if you are a job recruiter...");
        };

        Shell.prototype.shell007 = function () {
            var movies = [
                { title: "Dr. No", bondActor: "Sean Connery" },
                { title: "From Russia with Love", bondActor: "Sean Connery" },
                { title: "Goldfinger", bondActor: "Sean Connery" },
                { title: "Casino Royale", bondActor: "Daniel Craig" },
                { title: "Quantum of Solace", bondActor: "Daniel Craig" },
                { title: "Skyfall", bondActor: "Daniel Craig" }
            ];

            // Randomly pick a movie to watch
            var index = Math.floor(Math.random() * (movies.length));
            var selectedMovie = movies[index];

            _StdOut.putText("You should");

            if (selectedMovie.bondActor === "Daniel Craig") {
                _StdOut.putText(" not");
            }

            _StdOut.putText(" watch " + selectedMovie.title + ", which stars actor " + selectedMovie.bondActor + ".");
        };

        // TODO Improve by removing prompt that follows error message (same issue as in shellShutdown())
        Shell.prototype.shellBSOD = function () {
            // Change canvas background color to Microsoft Approved Blue (TM)
            document.getElementById("display").style.backgroundColor = "#2067B2";

            _StdOut.clearScreen();
            _StdOut.resetXY();

            // Display BSOD message
            _StdOut.putText("Attention! An unexpected error has occurred and the system must be reset. Check host log for details.");

            clearInterval(_hardwareClockID);
        };

        Shell.prototype.shellLoad = function () {
            // Get text from the User Program Input textbox
            var textInput = document.getElementById("taProgramInput").value;

            // Validate that the text input contains only hex characters and/or spaces
            var regExpPattern = /[a-f|A-F|0-9|\s]/;
            var validInput = true;

            for (var i = 0; i < textInput.length; i++) {
                if (!regExpPattern.test(textInput[i])) {
                    validInput = false;
                    break;
                }
            }

            // Valid hex
            if (validInput && textInput.length > 0) {
                // Split input into bytes (2 hex digits each)
                var byteList = textInput.split(" ");

                for (var j = 0; j < byteList.length; j++) {
                    if (byteList[j].length != 2) {
                        validInput = false;
                    }

                    // Convert to uppercase hex letters if necessary
                    byteList[j] = TSOS.Utils.toUpperHex(byteList[j]);
                }

                if (validInput) {
                    if (byteList.length <= _MemoryConstants.PROCESS_SIZE) {
                        _MemoryManager.loadProgram(byteList);
                    } else {
                        _StdOut.putText("Invalid program input. Program code too large.");
                    }
                } else {
                    _StdOut.putText("Invalid program input. Invalid number of hex digits.");
                }
            } else {
                _StdOut.putText("Error: Invalid program input. Only hex digits allowed.");
            }
        };

        Shell.prototype.shellStatus = function (args) {
            // Invalid number of arguments
            if (args.length < 1) {
                _StdOut.putText("Usage: status <string> Please supply a string.");
            } else {
                // Combine all passed in arguments into a single string
                var statusString = args.join(" ");

                // Update display with new status value
                document.getElementById("statusDisplay").innerHTML = statusString;
            }
        };

        Shell.prototype.shellRun = function (args) {
            // Invalid arguments
            if (args.length != 1) {
                _StdOut.putText("Usage: run <pid> Please supply a program ID");
            } else if (_Scheduler.inUse && _ResidentQueue.length !== 0) {
                // Adding processes to end of queue
                _Scheduler.schedule();
            } else {
                var processID = parseInt(args[0], 10);
                var properIndex = -1;

                for (var i = 0; i < _ResidentQueue.length; i++) {
                    if (_ResidentQueue[i].processID === processID) {
                        var properIndex = i;
                        break;
                    }
                }

                // Found PCB in the residentQueue
                if (properIndex !== -1) {
                    // Remove PCB from resident queue
                    var selectedPCB = _ResidentQueue[properIndex];
                    _ResidentQueue.splice(properIndex, 1);

                    // If PCB is on disk
                    if (selectedPCB.location === _Locations.DISK) {
                        console.log("PCB is on disk");

                        var memorySlot = -1;
                        var memorySlotFound = false;

                        for (var i = 0; i < _MemoryManager.programsInUse.length; i++) {
                            if (_MemoryManager.programsInUse[i] === 0) {
                                memorySlot = i;
                                memorySlotFound = true;
                            }
                        }

                        // Pick one at random if no location available
                        if (!memorySlotFound) {
                            console.log("Picking slot at random.");
                            memorySlot = Math.floor(Math.random() * (_MemoryManager.programsInUse.length));
                        }

                        console.log("Replacing slot " + memorySlot);
                        console.log(_ResidentQueue);

                        var pcbFound = false;

                        for (var index = 0; index < _ResidentQueue.length; index++) {
                            var pcbBeingReplaced = _ResidentQueue[index];

                            if (pcbBeingReplaced.memorySlot === memorySlot) {
                                console.log("This PCB");
                                console.log(pcbBeingReplaced);
                                console.log("is in memorySlot " + memorySlot);

                                pcbFound = true;

                                break;
                            }
                        }

                        // Swapping out a process
                        if (pcbFound) {
                            console.log("pcbBeingReplaced was not null.");

                            // Roll PCB from disk to memory
                            _Kernel.programRollOut(pcbBeingReplaced.processID, true);

                            // Clear memory at the slot
                            _MemoryManager.clearMemory(pcbBeingReplaced.memorySlot);

                            // Clear items on the replaced PCB
                            pcbBeingReplaced.location = _Locations.DISK;
                            pcbBeingReplaced.memorySlot = -1;

                            // Place PCB back in the resident queue
                            _ResidentQueue[index] = pcbBeingReplaced;
                        }

                        // Roll requested PCB into disk
                        _Kernel.programRollIn(processID, memorySlot, true);

                        // Set approrpiate flags and stuff
                        selectedPCB.location = _Locations.MEMORY;
                        selectedPCB.memorySlot = memorySlot;
                        selectedPCB.baseRegister = memorySlot * _MemoryConstants.PROCESS_SIZE;
                        selectedPCB.limitRegister = selectedPCB.baseRegister + _MemoryConstants.PROCESS_SIZE - 1;

                        console.log(selectedPCB);
                        console.log(_ResidentQueue);
                    }

                    // Add PCB to ready queue
                    _ReadyQueue.enqueue(selectedPCB);
                    _CurrentPCB = selectedPCB;

                    // Set CPU to execute
                    _CPU.isExecuting = true;

                    // Clear CPU
                    _CPU.clear();

                    // Display the ready queue
                    TSOS.Control.updateDisplays();

                    _KrnFileSystemDriver.displayFileSystem();
                } else {
                    _StdOut.putText("Error: Invalid process ID");
                }
            }
        };

        // Runs all the programs in the resident queue
        Shell.prototype.shellRunAll = function () {
            // Make sure residentQueue is not empty
            if (_ResidentQueue.length > 0) {
                // Use scheduler to arrange processes
                _Scheduler.schedule();

                // Set CPU to execute
                _CPU.isExecuting = true;
            } else {
                _StdOut.putText("Error: No programs available to run.");
            }
        };

        // Clears out the entire memory array and resident queue
        Shell.prototype.shellClearMem = function () {
            // Call this method without parameters to clear all partitions
            _MemoryManager.clearMemory();

            // Reload memory display
            TSOS.Control.updateDisplays();

            // Clear resident queue
            _ResidentQueue = [];

            _StdOut.putText("Memory has been cleared.");
        };

        // Sets the quantum time length for round robin scheduling
        Shell.prototype.shellQuantum = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Usage: quantum <num> Please supply a positive number.");
            } else {
                var quantumValue = parseInt(args[0], 10);

                // Valid quantum value
                if (quantumValue > 0) {
                    _Scheduler.setQuantumValue(quantumValue);
                    _StdOut.putText("Quantum has been set to " + quantumValue);
                } else {
                    _StdOut.putText("Error! Quantum must be > 0.");
                }
            }
        };

        // Lists processes that are in the ready queue
        Shell.prototype.shellPS = function () {
            var printString = "Processes running: ";

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                printString += _ReadyQueue.q[i].processID + " ";
            }

            if (_ReadyQueue.getSize() === 0) {
                printString += "None";
            }

            _StdOut.putText(printString);
        };

        // Kills an active process
        Shell.prototype.shellKill = function (args) {
            if (args.length !== 1) {
                _StdOut.putText("Usage: kill <id> Please provide a valid PID.");
            } else {
                var processID = parseInt(args[0], 10);

                var properIndex = -1;

                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    if (_ReadyQueue.q[i].processID === processID) {
                        properIndex = i;
                        break;
                    }
                }

                if (properIndex === -1) {
                    _StdOut.putText("Error! Invalid Process ID.");
                } else {
                    var removedPCB = _ReadyQueue.q[properIndex];

                    // Stop program from executing
                    removedPCB.isExecuting = false;

                    // Stop CPU from executing current PCB
                    if (removedPCB === _CurrentPCB) {
                        // Set currentPCB to finished
                        _CurrentPCB.status = _ProcessStates.FINISHED;

                        // Stop tracking it
                        _MemoryManager.programsInUse[_CurrentPCB.processID] = 0;

                        // Enqueue an interrupt to context switch to a new process
                        _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_InterruptConstants.CONTEXT_SWITCH_IRQ, ""));
                    } else {
                        // Remove program from ready queue
                        _ReadyQueue.q.splice(properIndex, 1);

                        // Remove tracking the program
                        _MemoryManager.programsInUse[removedPCB.processID] = 0;

                        // Clear out memory for program
                        _MemoryManager.clearMemory(removedPCB.processID);

                        // Reload displays
                        TSOS.Control.updateDisplays();

                        _StdOut.putText("PID " + removedPCB.processID + " was successfully removed.");
                    }
                }
            }
        };

        // Sets the scheduling algorithm
        Shell.prototype.shellSetSchedule = function (args) {
            // Invalid number of arguments
            if (args.length !== 1) {
                _StdOut.putText("Usage: setschedule <type>  Please supply a scheduling algorithm.");
            } else {
                var schedulingType = args[0];

                if (schedulingType === "rr" || schedulingType === "fcfs" || schedulingType === "priority") {
                    _Scheduler.setSchedulingType(schedulingType);

                    _StdOut.putText("Scheduling algorithm set to: " + schedulingType);
                } else {
                    _StdOut.putText("Error! Invalid scheduling type.");
                }
            }
        };

        // Returns the scheduling algorithm type
        Shell.prototype.shellGetSchedule = function () {
            var schedulingType = _Scheduler.getSchedulingType();

            _StdOut.putText("Scheduling algorithm: " + schedulingType);
        };

        // Lists the fileNames in the current directory
        Shell.prototype.shellLS = function () {
            _Mode_Bit = _Modes.KERNEL;

            var fileNameList = _KrnFileSystemDriver.getFileNames();

            _Mode_Bit = _Modes.USER;

            // No files found
            if (fileNameList.length === 0) {
                _StdOut.putText("No files found on disk.");
                _StdOut.advanceLine();
            } else {
                _StdOut.putText("Files on disk: ");
                _StdOut.advanceLine();

                for (var i = 0; i < fileNameList.length; i++) {
                    _StdOut.putText(fileNameList[i]);
                    _StdOut.advanceLine();
                }
            }
        };

        // Creates a new file in the file system with the name <filename>
        Shell.prototype.shellCreate = function (args) {
            var fileName = args[0];

            // Invalid arguments
            if (args.length !== 1) {
                _StdOut.putText("Usage: create <filename>  Please supply a filename.");
            } else if (!TSOS.Utils.isValidFileName(fileName)) {
                _StdOut.putText("Error! Invalid filename.");
            } else {
                _Mode_Bit = _Modes.KERNEL;

                var result = _KrnFileSystemDriver.createFile(fileName);

                _Mode_Bit = _Modes.USER;

                if (result) {
                    _StdOut.putText("File " + fileName + " successfully created.");

                    // Update the displays
                    _KrnFileSystemDriver.displayFileSystem();
                } else {
                    _StdOut.putText("File could not be created. Secondary memory is full.");
                }
            }
        };

        Shell.prototype.shellRead = function (args) {
            var fileName = args[0];

            // Invalid arguments
            if (args.length !== 1) {
                _StdOut.putText("Usage: read <filename> - Please supply a filename.");
            } else if (!TSOS.Utils.isValidFileName(fileName)) {
                _StdOut.putText("Error! Invalid filename.");
            } else {
                var fileName = args[0];
                var directoryFiles = _KrnFileSystemDriver.getFileNames();

                var fileFound = false;

                for (var i = 0; i < directoryFiles.length; i++) {
                    if (directoryFiles[i] === fileName) {
                        fileFound = true;
                        break;
                    }
                }

                if (fileFound) {
                    var fileContents = _KrnFileSystemDriver.readFile(fileName);

                    _StdOut.putText("Contents of file " + fileName + ": ");
                    _StdOut.advanceLine();

                    _StdOut.putText(fileContents);
                    _StdOut.advanceLine();
                } else {
                    _StdOut.putText("Error! File not found on disk.");
                }
            }
        };

        // Write the specified contents to the file specified
        Shell.prototype.shellWrite = function (args) {
            var fileName = args[0];

            // Invalid arguments
            if (args.length < 2) {
                _StdOut.putText("Usage: write <filename> \"contents\"  Please supply a filename.");
            } else if (!TSOS.Utils.isValidFileName(fileName)) {
                _StdOut.putText("Error! Invalid filename.");
            } else {
                var contentToWrite = "";

                for (var i = 1; i < args.length; i++) {
                    contentToWrite += args[i];

                    // Add space for all but last iteration
                    if (!((i + 1) === args.length)) {
                        contentToWrite += " ";
                    }
                }

                // Strip off the quotation marks
                contentToWrite = contentToWrite.substring(1, contentToWrite.length);
                contentToWrite = contentToWrite.substring(0, contentToWrite.length - 1);

                var fileFound = false;

                var directoryFiles = _KrnFileSystemDriver.getFileNames();

                for (var i = 0; i < directoryFiles.length; i++) {
                    if (directoryFiles[i] === fileName) {
                        fileFound = true;
                        break;
                    }
                }

                if (fileFound) {
                    // Write contents to the file
                    _Mode_Bit = _Modes.KERNEL;

                    var writeResult = _KrnFileSystemDriver.writeFile(fileName, contentToWrite);

                    _Mode_Bit = _Modes.USER;

                    if (writeResult) {
                        _StdOut.putText(contentToWrite + " written to file " + fileName + ".");
                    } else {
                        _StdOut.putText("Error: disk full. Couldn't write to file.");
                    }

                    // Update the file system display
                    _KrnFileSystemDriver.displayFileSystem();
                } else {
                    _StdOut.putText("Error! File not found on disk.");
                }
            }
        };

        // Deletes the specified file from disk
        Shell.prototype.shellDelete = function (args) {
            var fileName = args[0];

            // Invalid arguments
            if (args.length !== 1) {
                _StdOut.putText("Usage: delete <filename>  Please supply a filename.");
            } else if (!TSOS.Utils.isValidFileName(fileName)) {
                _StdOut.putText("Error! Invalid filename.");
            } else {
                var directoryFiles = _KrnFileSystemDriver.getFileNames();

                var fileFound = false;

                for (var i = 0; i < directoryFiles.length; i++) {
                    if (directoryFiles[i] === fileName) {
                        fileFound = true;
                        break;
                    }
                }

                if (fileFound) {
                    _Mode_Bit = _Modes.KERNEL;

                    var deleteResult = _KrnFileSystemDriver.deleteFile(fileName);

                    _Mode_Bit = _Modes.USER;

                    // Update display
                    _KrnFileSystemDriver.displayFileSystem();

                    if (deleteResult) {
                        _StdOut.putText("File " + fileName + " was successfully deleted.");
                    } else {
                        _StdOut.putText("Error! File " + fileName + " couldn't be deleted.");
                    }
                } else {
                    _StdOut.putText("Error! File not found on disk.");
                }
            }
        };

        // Formats the disk back to its default state
        Shell.prototype.shellFormat = function () {
            // Protection against Alan
            if (_Scheduler.inUse || _CPU.isExecuting) {
                _StdOut.putText("Error! Cannot format as programs are running.");
            } else {
                _Mode_Bit = _Modes.KERNEL;

                _KrnFileSystemDriver.formatDisk();

                _Mode_Bit = _Modes.USER;

                _StdOut.putText("Disk successfully formatted.");
                _Kernel.krnTrace("Formatted disk.");

                // Update file system display
                _KrnFileSystemDriver.displayFileSystem();
            }
        };

        // TODO Remove after testing is over
        Shell.prototype.shellTest = function (inputPID) {
            var pidValue = parseInt(inputPID, 10);

            console.log("Rolling pid " + pidValue + " out to disk.");
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
