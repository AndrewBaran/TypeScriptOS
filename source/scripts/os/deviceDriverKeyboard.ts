///<reference path="deviceDriver.ts" />

/* ----------------------------------
   DeviceDriverKeyboard.ts

   Requires deviceDriver.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.
            super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.    TODO: Check that they are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.
            if (((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
                ((keyCode >= 97) && (keyCode <= 123))) {  // a..z
                // Determine the character we want to display.
                // Assume it's lowercase...
                chr = String.fromCharCode(keyCode + 32);
                // ... then check the shift key and re-adjust if necessary.
                if (isShifted) {
                    chr = String.fromCharCode(keyCode);
                }
                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } 

            else if (((keyCode >= 48) && (keyCode <= 57) && (!isShifted)) || // digits
                    (keyCode == 32) ||  // space
                    (keyCode == 13) || // enter
                    (keyCode == 9) || // tab
                    (keyCode == 8)) { // backspace
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

            else if ((keyCode == 38) || // up arrow
                    (keyCode == 40)) { // down arrow
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

            else { // Punctuation

                // Not shifted
                if(!isShifted) {
                    switch(keyCode) {
                        case 188:
                            chr = String.fromCharCode(44); // ,
                            break;

                        case 190:
                            chr = String.fromCharCode(46); // .
                            break;

                        case 59:
                            chr = String.fromCharCode(59); // ;
                            break;

                        case 222:
                            chr = String.fromCharCode(39); // "
                            break;

                        case 219:
                            chr = String.fromCharCode(91); // [
                            break;

                        case 221:
                            chr = String.fromCharCode(93); // ]
                            break;


                    }
                }

                // Shifted
                else {

                }

                // Add code to queue
                _KernelInputQueue.enqueue(chr);

            }
        }
    }
}
