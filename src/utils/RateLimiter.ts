import Queue from "./types/Queue";

// https://stackoverflow.com/a/28173630
class RateLimiter {
  private readonly _requestsPerInterval: number;
  private readonly _history: Queue<number>;
  private readonly _intervalMS: number;

  public constructor(requestsPerInterval = 240, intervalHour = 3600) {
    this._requestsPerInterval = requestsPerInterval;
    this._history = new Queue<number>();
    this._intervalMS = intervalHour * 1000;
  }

  private delay(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  public async SleepAsNeeded() {
    const now = Date.now();
    this._history.enqueue(now);

    if (this._history.size >= this._requestsPerInterval) {
      var last = this._history.dequeue();
      if (last) {
        const difference = now - last;
        if (difference < this._intervalMS) {
          await this.delay(this._intervalMS - difference);
        }
      }
    }
  }
}

export default new RateLimiter();
