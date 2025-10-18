export interface AudioAnalysisData {
  amplitude: number; // 0-1
  frequency: number; // dominant frequency
  energy: number; // overall energy 0-1
  bass: number; // 0-1
  mid: number; // 0-1
  treble: number; // 0-1
}

export class AudioAnalyzer {
  private analyserNode: AnalyserNode;
  private dataArray: Uint8Array;
  private frequencyDataArray: Uint8Array;
  private smoothingFactor: number;
  private previousAmplitude: number = 0;

  constructor(audioContext: AudioContext, smoothingFactor = 0.8) {
    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.85;
    this.smoothingFactor = smoothingFactor;

    const bufferLength = this.analyserNode.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    this.frequencyDataArray = new Uint8Array(bufferLength);
  }

  connectSource(source: AudioNode): void {
    source.connect(this.analyserNode);
  }

  getAnalysisData(): AudioAnalysisData {
    // Get time domain data (waveform)
    this.analyserNode.getByteTimeDomainData(this.dataArray);

    // Get frequency data
    this.analyserNode.getByteFrequencyData(this.frequencyDataArray);

    // Calculate amplitude (RMS of time domain data)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const normalized = (this.dataArray[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    
    // Smooth amplitude changes
    const amplitude = this.smoothValue(rms, this.previousAmplitude);
    this.previousAmplitude = amplitude;

    // Find dominant frequency
    let maxIndex = 0;
    let maxValue = 0;
    for (let i = 0; i < this.frequencyDataArray.length; i++) {
      if (this.frequencyDataArray[i] > maxValue) {
        maxValue = this.frequencyDataArray[i];
        maxIndex = i;
      }
    }

    const nyquist = 44100 / 2; // Assuming standard sample rate
    const frequency = (maxIndex * nyquist) / this.frequencyDataArray.length;

    // Calculate frequency band energies
    const bassEnd = Math.floor(this.frequencyDataArray.length * 0.1);
    const midEnd = Math.floor(this.frequencyDataArray.length * 0.5);

    const bass = this.getAverageFrequency(0, bassEnd) / 255;
    const mid = this.getAverageFrequency(bassEnd, midEnd) / 255;
    const treble = this.getAverageFrequency(midEnd, this.frequencyDataArray.length) / 255;

    // Overall energy
    const energy = this.getAverageFrequency(0, this.frequencyDataArray.length) / 255;

    return {
      amplitude: Math.min(amplitude * 2, 1), // Scale up for better visibility
      frequency,
      energy,
      bass,
      mid,
      treble,
    };
  }

  private getAverageFrequency(start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) {
      sum += this.frequencyDataArray[i];
    }
    return sum / (end - start);
  }

  private smoothValue(current: number, previous: number): number {
    return previous * this.smoothingFactor + current * (1 - this.smoothingFactor);
  }

  getAnalyserNode(): AnalyserNode {
    return this.analyserNode;
  }
}

