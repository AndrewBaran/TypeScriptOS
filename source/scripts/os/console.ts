///<reference path="../globals.ts" />

/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public buffer = "") {

        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        private clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        private resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {

                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).

                // Enter key
                if (chr === String.fromCharCode(13)) {

                    // Don't add enter key to history
                    if(this.buffer.length > 0) {
                        // Add command to history
                        _OsShell.addHistory(this.buffer);
                    }

                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }

                // Backspace
                else if(chr == String.fromCharCode(8)) {

                    // Backspace if the buffer is not empty
                    if(this.buffer.length > 0) {
                        var lastCharacter : string = this.buffer[this.buffer.length - 1];

                        var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastCharacter);
                       
                        // Move cursor back one character
                        this.currentXPosition -= offset;

                        var newY : number = this.currentYPosition - this.currentFontSize;
                        var newHeight: number = this.currentFontSize + _FontHeightMargin + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);

                        // Draw a rectangle over the character that is being deleted
                        _DrawingContext.fillStyle = _CANVAS_COLOR; // Color of the canvas

                        // X, Y, Width, Height
                        _DrawingContext.fillRect(this.currentXPosition, newY, offset, newHeight);

                        // Remove lastCharacter from the buffer
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    }
                }

                // TODO Going from up arrow to down arrow causes same command to appear.
                // TODO Fix by starting search from history.numItems (1 beyond) and look backwards/forwarding before decrementing/incrementing currentCommand, then get the command
                // Up arrow
                else if(chr == String.fromCharCode(38)) {

                    // Check if there are any more commands in history to recall
                    if(_OsShell.history.numItems > 0) {

                        if(_OsShell.history.currentCommand >= 0 && _OsShell.history.currentCommand < _OsShell.history.numItems) {

                        	// Clear line and put prompt
                            this.clearLine();
                            _OsShell.putPrompt();

                            // Get previous command from history and print it
                            var historyCommand : string = _OsShell.history.list[_OsShell.history.currentCommand];
                            this.putText(historyCommand);

                            // Move to previous command
                            _OsShell.history.currentCommand--;

                            // Make buffer hold the history command
                            this.buffer = historyCommand;
                        }
                    }
                }

                // Down arrow
                else if(chr == String.fromCharCode(40)) {

                    // Check if there are any more commands in history to recall
                    if(_OsShell.history.numItems > 0) {

                    	var nextCommand : number = _OsShell.history.currentCommand + 1;

                        if(nextCommand >= 0 && nextCommand < _OsShell.history.numItems) {

                        	// Clear line and put prompt
                        	this.clearLine();
                        	_OsShell.putPrompt();

                        	// Get next command from history and print it
                        	var historyCommand : string = _OsShell.history.list[nextCommand];
                        	this.putText(historyCommand);

                        	// Move to next command
                        	_OsShell.history.currentCommand++;

                        	// Make buffer hold the history command
                        	this.buffer = historyCommand;
                        }
                	}
                }

                // Tab character
                else if(chr === String.fromCharCode(9)) {

                    // Don't autocomplete for an empty buffer
                    if(this.buffer.length > 0) {
                	   var suggestedCommand: string = _OsShell.findMatch(this.buffer);
                    }

                	// Check if a match was found
                	if(suggestedCommand !== null) {

                		// Print out rest of the suggested command
                		var remainingText : string = suggestedCommand.substring(this.buffer.length);
                		this.putText(remainingText);

                		// Change buffer to the suggested command
                		this.buffer = suggestedCommand;
                	}

                }

                // "Normal" character
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }

        public putText(text): void {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            if (text !== "") {

                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);

                // Text does not stretch beyond canvas
                if((this.currentXPosition + offset) < _Canvas.width) {

                	// Draw the text at the current X and Y coordinates.
               		_DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                	// Move the current X position.
                	this.currentXPosition = this.currentXPosition + offset;
                }

                // Text stretches beyond canvas
                else {
                	console.log("Text extends beyond screen.");

                	// Split into words
                	var textInput: string[] = text.split("");
                	console.log("Words to be written: " + textInput);

                	for(var i = 0; i < textInput.length; i++) {
                		
                		// Check if word extends beyond
                		var newOffset : number = _DrawingContext.measureText(this.currentFont, this.currentFontSize, textInput[i]);
                		console.log("Writting: " + textInput[i]);
                		if((this.currentXPosition + newOffset) > _Canvas.width) {
                			// Move to next line
                			this.advanceLine();
                		}

                		// Print the word
                		_DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, textInput[i]);
                		this.currentXPosition = this.currentXPosition + newOffset;
                	}
                }

                console.log("Canvas width: " + _Canvas.width);
                console.log("Sum: " + (this.currentXPosition + offset + "\n"));
                
            }
         }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;

            // TODO: Handle scrolling. (Project 1)
        }

        // TODO Do I need this anymore?
        // Moves up one line in the console and move the cursor back to the start
        public retreatLine(): void {
            this.currentXPosition = 0;

            this.currentYPosition -= _DefaultFontSize + 
                            _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                            _FontHeightMargin;

        }

        // Erases the contents of the current line in the console and moves the cursor back to the beginning
        public clearLine(): void {
            var newY : number = this.currentYPosition - this.currentFontSize;
            var newHeight : number = this.currentFontSize + _FontHeightMargin + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);
            var canvasWidth : number = _Canvas.width;

            _DrawingContext.fillStyle = _CANVAS_COLOR;

            // Draw rectangle the color of the canvas across entire line
            // X, Y, Width, Height
            _DrawingContext.fillRect(0, newY, canvasWidth, newHeight);

            // Move currentXPosition back to start
            this.currentXPosition = 0;
        }
    }
 }
