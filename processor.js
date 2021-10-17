// processor.js: wrapper for wasm sine processor

const SIZE_F32 = Float32Array.BYTES_PER_ELEMENT;
// frame quanta defined by web audio
const NFRAMES = 128;

class WasmProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    // received compiled wasm from main thread
    this._init(options.processorOptions.wasm);
  }

  async _init(wasm) {
    const instance = await WebAssembly.instantiate(wasm);
    const malloc = instance.exports.malloc;
    const sine_init = instance.exports.sine_init;
    this._process = instance.exports.sine_process;
    // only a view into the memory, not allocating new memory
    this._memory = new Float32Array(instance.exports.memory.buffer);

    // init data on C side
    this._outPtr = malloc(NFRAMES*SIZE_F32);
    this._sine = sine_init(sampleRate);
  }

  static get parameterDescriptors() {
    return [
      {
        name: "freq",
        defaultValue: 440.0,
        minValue: 0,
        maxValue: sampleRate / 2.0,
        // for simplicity, we only allow constant frequency
        // value during process callback, i.e. control rate
        automationRate: "k-rate"
      },
    ];
  }

  process(inputs, outputs, parameters) {
    // for simplicity, only one output and one channel, and
    // constant frequency during call back
    const out = outputs[0][0];
    const freq = parameters.freq[0];

    // call C function to generate samples
    this._process(this._sine, freq, this._outPtr);

    // outPtr is address in bytes (lives inside memory)
    // memory is indexed as floats
    // so we need to convert address -> index
    let offset = this._outPtr / SIZE_F32;
    // copy result to out buffer
    out.set(this._memory.subarray(offset, offset + NFRAMES));

    return true;
  }
}

registerProcessor("wasm", WasmProcessor);
