///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.
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

            // clearmem
            sc = new ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions in the system.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt(): void {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer): void {
            _Kernel.krnTrace("Shell Command~" + buffer);
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
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
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

                    // Load the program into memory at the opening found by the for loop above
                    if(_ResidentQueue.length !== 3) {

                        // Allows 1 program to be loaded
                        _MemoryManager.loadProgram(byteList, 0);

                        // TODO Buggy and needs fixing
                        // Allow 3 programs to be loaded
                        // _MemoryManager.loadProgram(byteList, _ResidentQueue.length);
                    }

                    else {
                        _StdOut.putText("Cannot load program - memory is full.");
                    }

                }

                else {
                	_StdOut.putText("Invalid program input. Invalid number of hex digits.")
                }

            }

            else {
                _StdOut.putText("Error: Invalid program input. Only hex digits allowed.");
            }

        }

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

            if(args.length != 1) {
                _StdOut.putText("Usage: run <pid> Please supply a program ID");
            }

            else {

                var processID: number = parseInt(args[0], 10);

                if(processID >= 0 && processID < _ResidentQueue.length) {

                    // Set CPU to begin executing program
                    _CPU.isExecuting = true;

                    // Move process from resident queue to ready queue
                    // Find index of PCB with processID
                    for(var i: number = 0; i < _ResidentQueue.length; i++) {

                        if(_ResidentQueue[i].processID == processID) {

                            var properIndex: number = i;
                            break;
                        }
                    }

                    // Remove PCB from resident queue
                    var selectedPCB: TSOS.PCB = _ResidentQueue[properIndex];
                    _ResidentQueue.splice(properIndex, 1);

                    // Add PCB to ready queue
                    _ReadyQueue.enqueue(selectedPCB);
                    _CurrentPCB = selectedPCB;
                    
                    // Clear CPU
                    _CPU.clear();
                }

                else {
                    _StdOut.putText("Error: Invalid process ID");
                }
                
            } // else

        }

        public shellClearMem(): void {

            // Call this method without parameters to clear all partitions
            _MemoryManager.clearMemory();
            _MemoryManager.displayMemory();

            _StdOut.putText("Memory has been cleared.");
        }

    }
}