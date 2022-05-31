// https://dev.to/glebirovich/typescript-data-structures-stack-and-queue-hld
interface IQueue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  readonly size: number;
}

class Queue<T> implements IQueue<T> {
  private _storage: T[] = [];
  public get storage(): T[] {
    return this._storage;
  }
  public set storage(value: T[]) {
    this._storage = value;
  }

  constructor(private capacity: number = Infinity) {}

  enqueue(item: T): void {
    if (this.size === this.capacity) {
      throw Error("Queue has reached max capacity, you cannot add more items");
    }
    this.storage.push(item);
  }
  dequeue(): T | undefined {
    return this.storage.shift();
  }
  public get size(): number {
    return this.storage.length;
  }
}
export default Queue;