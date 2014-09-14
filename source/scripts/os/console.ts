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
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }

                else if(chr == String.fromCharCode(8)) { // Backspace

                    // Backspace if the buffer is not empty
                    if(this.buffer.length > 0) {
                        var lastCharacter : string = this.buffer[this.buffer.length - 1];

                        var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, lastCharacter);
                       
                        // Move cursor back one character
                        this.currentXPosition -= offset;

                        var newY : number = this.currentYPosition - this.currentFontSize;
                        var newHeight: number = this.currentFontSize + _FontHeightMargin + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize);

                        // Draw a rectangle over the character that is being deleted
                        // TODO Improve by removing magic number
                        _DrawingContext.fillStyle = "#DFDBC3"; // Color of the canvas

                        // X, Y, Width, Height
                        _DrawingContext.fillRect(this.currentXPosition, newY, offset, newHeight);

                        // Remove lastCharacter from the buffer
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    }
                }

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
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
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
        // Moves up one line in the console
        public retreatLine(): void {
            this.currentXPosition = 0;

            this.currentYPosition -= _DefaultFontSize + 
                            _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                            _FontHeightMargin;

        }
    }
 }
