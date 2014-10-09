///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
// TODO Remove curses (for the children)
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.history = { list: [], currentCommand: 0, numItems: 0 };
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
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

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", " - Clears all memory partitions in the system.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

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
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
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
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
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
        // TODO Remove curses (for the children)
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for a list of available commands.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
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
                    // Load the program into memory at the opening found by the for loop above
                    if (_ResidentQueue.length !== 3) {
                        // Allows 1 program to be loaded
                        _MemoryManager.loadProgram(byteList, 0);
                        // TODO Buggy and needs fixing
                        // Allow 3 programs to be loaded
                        // _MemoryManager.loadProgram(byteList, _ResidentQueue.length);
                    } else {
                        _StdOut.putText("Cannot load program - memory is full.");
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
            if (args.length != 1) {
                _StdOut.putText("Usage: run <pid> Please supply a program ID");
            } else {
                var processID = parseInt(args[0], 10);
                console.log("ProcessID = " + processID);

                if (processID >= 0 && processID < _ResidentQueue.length) {
                    // Set CPU to begin executing program
                    _CPU.isExecuting = true;

                    console.log(_ResidentQueue);
                    console.log(_ReadyQueue);

                    for (var i = 0; i < _ResidentQueue.length; i++) {
                        if (_ResidentQueue[i].processID == processID) {
                            console.log("Found a match at index " + i);
                            var properIndex = i;
                            break;
                        }
                    }

                    // Remove PCB from resident queue
                    var selectedPCB = _ResidentQueue[properIndex];
                    _ResidentQueue.splice(properIndex, 1);

                    // Add PCB to ready queue
                    _ReadyQueue.enqueue(selectedPCB);
                    _CurrentPCB = selectedPCB;

                    console.log(_ResidentQueue);
                    console.log(_ReadyQueue);

                    // Clear CPU
                    _CPU.clear();
                } else {
                    _StdOut.putText("Error: Invalid process ID");
                }
            }
        };

        Shell.prototype.shellClearMem = function () {
            // Call this method without parameters to clear all partitions
            _MemoryManager.clearMemory();
            _MemoryManager.displayMemory();

            _StdOut.putText("Memory has been cleared.");
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
