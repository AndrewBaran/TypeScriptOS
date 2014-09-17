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


            // Note:
            // Setting up and down arrow keys to strings instead of chars
            // Reason is that the ASCII code for & and ( clash with the
            // ASCII codes 38 and 40, respectively
            else if ((keyCode == 38)) { // up arrow
                chr = "up";
                _KernelInputQueue.enqueue(chr);
            }

            else if ((keyCode == 40)) { // down arrow
                chr = "down";
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

                        case 173:
                            chr = String.fromCharCode(45); // -
                            break;

                        case 61:
                            chr = String.fromCharCode(61); // =
                            break;

                        case 192:
                            chr = String.fromCharCode(96); // `
                            break;

                        case 220:
                            chr = String.fromCharCode(92); // \
                            break;

                        case 191:
                            chr = String.fromCharCode(47); // /
                            break;

                    }
                }

                // Shifted
                else {

                    switch(keyCode) {

                        case 188:
                            chr = String.fromCharCode(60); // <
                            break;

                        case 190:
                            chr = String.fromCharCode(62); // >
                            break;

                        case 59:
                            chr = String.fromCharCode(58); // :
                            break;

                        case 222:
                            chr = String.fromCharCode(34); // "
                            break;

                        case 219:
                            chr = String.fromCharCode(123); // {
                            break;

                        case 221:
                            chr = String.fromCharCode(125); // }
                            break;

                        case 49:
                            chr = String.fromCharCode(33); // !
                            break;

                        case 50:
                            chr = String.fromCharCode(64); // @
                            break;

                        case 51:
                            chr = String.fromCharCode(35); // #
                            break;

                        case 52:
                            chr = String.fromCharCode(36); // $
                            break;

                        case 53:
                            chr = String.fromCharCode(37); // %
                            break;

                        case 54:
                            chr = String.fromCharCode(94); // ^
                            break;

                        case 55:
                            chr = String.fromCharCode(38); // &
                            break;

                        case 56:
                            chr = String.fromCharCode(42); // *
                            break;

                        case 57:
                            chr = String.fromCharCode(40); // (
                            break;

                        case 48:
                            chr = String.fromCharCode(41); // )
                            break;

                        case 173:
                            chr = String.fromCharCode(95); // _
                            break;

                        case 61:
                            chr = String.fromCharCode(43); // +
                            break;

                        case 192:
                            chr = String.fromCharCode(126); // ~
                            break;

                        case 220:
                            chr = String.fromCharCode(124); // |
                            break;

                        case 191:
                            chr = String.fromCharCode(63); // ?
                            break;

                    }

                }

                // Add proper code to queue
                _KernelInputQueue.enqueue(chr);

            }
        }
    }
}
