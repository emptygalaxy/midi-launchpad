const midi = require('midi');

// Set up a new input.
let input;

// Event handling
let _eventListeners = {};


const EVENT_OPEN = 'open';
const EVENT_CLOSE = 'close';
const EVENT_UPDATE = 'update';


let start = 36;
let width = 4;
let height = 4;
let inverse = true;

/**
 *
 * @param {int} s starting index number
 * @param {int} w number of buttons wide
 * @param {int} h number of buttons high
 * @param {boolean} inverseRows inverse the rows
 */
function setCanvas(s, w, h, inverseRows=false)
{
    start = s;
    width = w;
    height = h;
    inverse = inverseRows;
}

/**
 *
 * @param {string} deviceName
 */
function open(deviceName) {
    input = new midi.input();
    const length = input.getPortCount();
    let deviceIndex = -1;
    for (let i = 0; i < length; i++) {
        console.log(input.getPortName(i));
        if (input.getPortName(i) === deviceName) {
            deviceIndex = i;
            break;
        }
    }

    if (deviceIndex > -1) {
        // Configure a callback.
        input.on('message', handleMessage);

        // Open the first available input port.
        input.openPort(deviceIndex);

        dispatchEvent(EVENT_OPEN);

        // Sysex, timing, and active sensing messages are ignored
        // by default. To enable these message types, pass false for
        // the appropriate type in the function below.
        // Order: (Sysex, Timing, Active Sensing)
        // For example if you want to receive only MIDI Clock beats
        // you should use
        // input.ignoreTypes(true, false, true)
        input.ignoreTypes(false, false, false);
    }
}

/**
 *
 * @param {number} deltaTime
 * @param {Array<number>} message
 */
function handleMessage(deltaTime, message) {
    // The message is an array of numbers corresponding to the MIDI bytes:
    //   [status, data1, data2]
    // https://www.cs.cf.ac.uk/Dave/Multimedia/node158.html has some helpful
    // information interpreting the messages.
    // console.log('m:' + message + ' d:' + deltaTime);

    const down = (message[0] == 144);
    const index = message[1];
    const col = (index - start) % width;
    let row = Math.floor((index - start) / width);
    if(inverse)
        row = (height - 1) - row;


    dispatchEvent(EVENT_UPDATE, [down, index, col, row]);
}


/**
 *
 */
function close() {
    // Close the port when done.
    input.closePort();

    dispatchEvent(EVENT_CLOSE);
}

/**
 *
 * @param {string} event
 * @param {function} callback
 */
function on(event, callback) {
    _eventListeners[event] = callback;
}

/**
 *
 * @param {string} event
 * @param {null|Array|number} arguments
 */
function dispatchEvent(event, arguments = null) {
    if (_eventListeners[event] != null) {

        if(arguments != null)
            _eventListeners[event].apply(this, arguments);
        else
            _eventListeners[event]();
    }
}

exports.open = open;
exports.close = close;
exports.on = on;
exports.setCanvas = setCanvas;