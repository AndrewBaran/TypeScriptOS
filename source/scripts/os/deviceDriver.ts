/* ------------------------------
     DeviceDriver.ts

     The "base class" for all Device Drivers.
     ------------------------------ */

module TSOS {
    export class DeviceDriver {
        public version: string = '0.07';
        public status: string = 'unloaded';
        public preemptable: boolean = false;

        constructor(public driverEntry = null,
                    public isr = null) {

        }
    }
}
