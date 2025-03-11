class AudioProcessingWorklet extends AudioWorkletProcessor {
    buffer = new Int16Array(2048);
    bufferWriteIndex = 0;

    process(inputs) {
        if (inputs[0].length) {
            const channel0 = inputs[0][0];
            this.processChunk(channel0);
        }
        return true;
    }

    sendAndClearBuffer() {
        this.port.postMessage({
            event: "chunk",
            data: {
                int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer,
            },
        });
        this.bufferWriteIndex = 0;
    }

    processChunk(float32Array) {
        const l = float32Array.length;
        for (let i = 0; i < l; i++) {
            const int16Value = Math.max(-32768, Math.min(32767, float32Array[i] * 32768));
            this.buffer[this.bufferWriteIndex++] = int16Value;
            if (this.bufferWriteIndex >= this.buffer.length) {
                this.sendAndClearBuffer();
            }
        }
    }
}

registerProcessor("audio-processing-worklet", AudioProcessingWorklet);