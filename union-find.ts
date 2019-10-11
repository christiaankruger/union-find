const DEFAULT_SERIALIZER = JSON.stringify;

export class UnionFind<T> {
  private roots: number[] = [];
  private sizes: number[] = [];

  private itemToIndexMap: { [key: string]: number } = {};

  constructor(
    private size: number,
    private serializer: (item: T) => string = DEFAULT_SERIALIZER
  ) {}

  private ensureRegistered(item: T) {
    const index = this.itemToIndexMap[this.serializer(item)];
    if (index === undefined) {
      throw new Error(`${item} is not registered`);
    }
  }

  private root(a: T): number {
    let parent = this.roots[this.itemToIndexMap[this.serializer(a)]];
    const pathToParent = [];
    // The root is the item whose parent is itself
    while (this.roots[parent] !== parent) {
      pathToParent.push(parent);
      parent = this.roots[parent];
    }
    // Path compression:
    // Update the entire path to the new root
    for (let index of pathToParent) {
      this.roots[index] = parent;
    }
    return parent;
  }

  register(item: T) {
    if (this.roots.length === this.size) {
      throw Error(`Full: Already ${this.size} items`);
    }

    const newIndex = this.roots.length;
    const serialized = this.serializer(item);
    this.itemToIndexMap[serialized] = newIndex;
    this.roots.push(newIndex);
    this.sizes.push(1);
  }

  union(a: T, b: T) {
    this.ensureRegistered(a);
    this.ensureRegistered(b);

    const rootA = this.root(a);
    const rootB = this.root(b);

    // We add the smaller tree to the larger one, to keep trees more balanced
    if (this.sizes[rootA] < this.sizes[rootB]) {
      // Connect A to B
      this.roots[rootA] = this.roots[rootB];
      this.sizes[rootB] += this.sizes[rootA];
    } else {
      // Connect B to A
      this.roots[rootB] = this.roots[rootA];
      this.sizes[rootA] += this.sizes[rootB];
    }
  }

  find(a: T, b: T): boolean {
    this.ensureRegistered(a);
    this.ensureRegistered(b);

    return this.root(a) === this.root(b);
  }
}
