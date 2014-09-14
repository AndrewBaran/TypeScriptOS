///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.
// TODO Remove curses (for the children)
module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public history = {list: [], currentCommand: 0, numItems: 0};
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {

        }

        public init() {
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
            sc = new ShellCommand(this.shellStatus, "status", " - Display the status message of <string>.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            }

            // TODO Remove curses (for the children)
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
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

        public parseInput(buffer) {
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
            this.history.currentCommand = this.history.list.length - 1;
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
        
        // TODO Remove curses (for the children)
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for a list of available commands.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        public shellVer(args) {
            _StdOut.putText(_Constants.APP_NAME + ": version " + _Constants.APP_VERSION);
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
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

        public shellTrace(args) {
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

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellDate() {
            var dateString : string = Utils.getFormattedDate();

            _StdOut.putText("The current date is: " + dateString);
        }

        public shellWhereAreI() {
            _StdOut.putText("You are probably in Pouhgkeepsie, NY, at Marist College. Or not if you are a job recruiter...");
        }

        public shell007() {

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

        // TODO Improve by removing prompt that follows error message
        public shellBSOD() {

            // Change canvas background color to Microsoft Approved Blue (TM)
            document.getElementById("display").style.backgroundColor = "#2067B2";

            _StdOut.clearScreen();
            _StdOut.resetXY();

            // Display BSOD message
            _StdOut.putText("Attention! An unexpected error has occurred and the system must be reset.");
            _Kernel.krnShutdown();
            clearInterval(_hardwareClockID);
        }

        public shellLoad() {
            // Get text from the User Program Input textbox
            var textInput = (<HTMLInputElement>document.getElementById("taProgramInput")).value;

            // Validate that the text input contains only hex characters and/or spaces
            var regExpPattern = /[a-f|A-F|0-9|\s]/;
            var validInput : boolean = true;

            // Loop through input, testing regExpPattern against each character
            for(var i = 0; i < textInput.length; i++) {
                if(!regExpPattern.test(textInput[i])) {
                    validInput = false;
                    break;
                }
            }

            if(validInput) {
                _StdOut.putText("Valid program input.");
            }

            else {
                _StdOut.putText("Error: Invalid program input.");
            }

        }

        // TODO Implement shellStatus()
        public shellStatus(value : string) {
            _StdOut.putText("In shellStatus()");
        }

    }
}
