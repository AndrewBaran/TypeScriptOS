///<reference path="../globals.ts" />
/* ------------
Console.ts
Requires globals.ts
The OS Console - stdIn and stdOut by default.
Note: This is not the Shell.  The Shell is the "command line interface" (CLI) or interpreter for this console.
------------ */
var TSOS;
(function (TSOS) {
    var Console = (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer, endingXPositions) {
            if (typeof currentFont === "undefined") { currentFont = _DefaultFontFamily; }
            if (typeof currentFontSize === "undefined") { currentFontSize = _DefaultFontSize; }
            if (typeof currentXPosition === "undefined") { currentXPosition = 0; }
            if (typeof currentYPosition === "undefined") { currentYPosition = _DefaultFontSize; }
            if (typeof buffer === "undefined") { buffer = ""; }
            if (typeof endingXPositions === "undefined") { endingXPositions = []; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.endingXPositions = endingXPositions;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };

        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };

        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        };

        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();

                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                // Enter key
                if (chr === String.fromCharCode(13)) {
                    // Don't add enter key to history
                    if (this.buffer.length > 0) {
                        // Add command to history
                        _OsShell.addHistory(this.buffer);
                    }

                    // Clear the lastXPosition buffer
                    this.endingXPositions = [];

                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    // ... and reset our buffer.
                    this.buffer = "";
                } else if (chr === String.fromCharCode(8)) {
                    // Backspace if the buffer is not empty
                    if (this.buffer.length > 0) {
                        var lastCharacter = this.buffer[this.buffer.length - 1];

                        var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastCharacter);

                        // HACK: Using -5 as some character slightly extend beyond 0 (left side of Canvas) when moving their X-position back
                        // Backspace at beginning of line; move to previous line
                        if ((this.currentXPosition - offset) < -5) {
                            // Move up a line
                            this.retreatLine();

                            // Move currentXPosition back to end of line
                            this.currentXPosition = this.endingXPositions.pop();
                        }

                        // Move cursor back one character
                        this.currentXPosition -= offset;

                        // Calculate new Y-Position using last character
                        var newY = this.currentYPosition - this.currentFontSize - _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);

                        var newHeight = this.currentFontSize + (_FontHeightMargin * 2) + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);

                        // Draw a rectangle over the character that is being deleted
                        _DrawingContext.fillStyle = _CANVAS_COLOR;

                        // X, Y, Width, Height
                        _DrawingContext.fillRect(this.currentXPosition, newY, offset, newHeight);

                        // Remove lastCharacter from the buffer
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    }
                } else if (chr === "up") {
                    // Check if there are any more commands in history to recall
                    if (_OsShell.history.numItems > 0) {
                        // Get index of previous command
                        var previousCommand = _OsShell.history.currentCommand - 1;

                        if (previousCommand >= 0 && previousCommand < _OsShell.history.numItems) {
                            this.clearLine();
                            _OsShell.putPrompt();

                            // Get previous command from history and print it
                            var historyCommand = _OsShell.history.list[previousCommand];
                            this.putText(historyCommand);

                            // Move to previous command
                            _OsShell.history.currentCommand--;

                            // Make buffer hold the history command
                            this.buffer = historyCommand;
                        }
                    }
                } else if (chr === "down") {
                    // Check if there are any more commands in history to recall
                    if (_OsShell.history.numItems > 0) {
                        // Get index of next command
                        var nextCommand = _OsShell.history.currentCommand + 1;

                        if (nextCommand >= 0 && nextCommand < _OsShell.history.numItems) {
                            this.clearLine();
                            _OsShell.putPrompt();

                            // Get next command from history and print it
                            var historyCommand = _OsShell.history.list[nextCommand];
                            this.putText(historyCommand);

                            // Move to next command
                            _OsShell.history.currentCommand++;

                            // Make buffer hold the history command
                            this.buffer = historyCommand;
                        }
                    }
                } else if (chr === String.fromCharCode(9)) {
                    // Don't autocomplete for an empty buffer
                    if (this.buffer.length > 0) {
                        // Scoping rules are only function wide, so this does not create a local variable
                        var suggestedCommand = _OsShell.findMatch(this.buffer);
                    }

                    // Check if a match was found
                    if (suggestedCommand !== null) {
                        // Print out rest of the suggested command
                        var remainingText = suggestedCommand.substring(this.buffer.length);
                        this.putText(remainingText);

                        // Change buffer to the suggested command
                        this.buffer = suggestedCommand;
                    }
                } else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);

                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        };

        Console.prototype.putText = function (text) {
            if (text !== "") {
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);

                // Text does not stretch beyond canvas
                if ((this.currentXPosition + offset) < _Canvas.width) {
                    // Draw the text at the current X and Y coordinates.
                    _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);

                    // Move the current X position.
                    this.currentXPosition = this.currentXPosition + offset;
                } else {
                    // Split into individual characters
                    var textInput = text.split("");

                    for (var i = 0; i < textInput.length; i++) {
                        var currentChar = textInput[i];

                        // Check if character extends beyond the canvas
                        var newOffset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, currentChar);
                        if ((this.currentXPosition + newOffset) > _Canvas.width) {
                            // Remember the previous character
                            this.endingXPositions.push(this.currentXPosition);

                            // Move to next line
                            this.advanceLine();
                        }

                        // Print the character
                        _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, currentChar);
                        this.currentXPosition = this.currentXPosition + newOffset;
                    }
                }
            }
        };

        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;

            /*
            * Font size measures from the baseline to the highest point in the font.
            * Font descent measures from the baseline to the lowest point in the font.
            * Font height margin is extra spacing between the lines.
            */
            var newLineHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;

            this.currentYPosition += newLineHeight;

            // Scrolling handled (like a boss)
            if (this.currentYPosition > _Canvas.height) {
                // Copy old canvas data into a temporary variable
                var oldCanvasData = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);

                // Erase old canvas data
                this.clearScreen();

                // Paste old canvas display 1 line above current line
                _DrawingContext.putImageData(oldCanvasData, 0, -newLineHeight);

                // Move prompt up 1 line
                this.currentYPosition -= newLineHeight;
            }
        };

        // Moves up one line in the console (used when backspacing multiple lines)
        Console.prototype.retreatLine = function () {
            var newLineHeight = _DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) + _FontHeightMargin;

            this.currentYPosition -= newLineHeight;
        };

        // TODO Make this work with multiple lines
        // Erases the contents of the current line in the console and moves the cursor back to the beginning
        Console.prototype.clearLine = function () {
            var newY = this.currentYPosition - this.currentFontSize - _FontHeightMargin;
            var newHeight = this.currentFontSize + (_FontHeightMargin * 2) + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);
            var canvasWidth = _Canvas.width;

            _DrawingContext.fillStyle = _CANVAS_COLOR;

            // Draw rectangle the color of the canvas across entire line
            // X, Y, Width, Height
            _DrawingContext.fillRect(0, newY, canvasWidth, newHeight);

            // Move currentXPosition back to start
            this.currentXPosition = 0;
        };

        // Moves to new line and places prompt
        Console.prototype.newLine = function () {
            this.advanceLine();
            _OsShell.putPrompt();
        };
        return Console;
    })();
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
