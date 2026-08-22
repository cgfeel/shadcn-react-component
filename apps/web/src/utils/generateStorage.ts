function isValueUpdater<T>(v: unknown): v is ValueUpdater<T> {
  return typeof v === "function";
}

const generateStore = <T, K extends string>(scope: readonly PurgeUnion<T>[], keyname: K, defaultValue: PurgeUnion<T> | null = null) => {
  const listeners = new Set<() => void>()
  let snapshot: PurgeUnion<T> | null = defaultValue

  const getSnapshotValue = <T,>(prev: T | null, input: T | null | ValueUpdater<T>): T | null => {
    if (isValueUpdater<T>(input)) {
      return input(prev);
    }
    return input;
  }

  const storeSnapshot = {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setSnapshot: (value: PurgeUnion<T> | null | ValueUpdater<PurgeUnion<T>>) => {
      const nextValue = getSnapshotValue(snapshot, value);
      if (snapshot !== nextValue) {
        snapshot = nextValue
        listeners.forEach((listener) => listener())
      }
    },
    setPersistentSnapshot(value: PurgeUnion<T> | null | ValueUpdater<PurgeUnion<T>>) {
      const nextValue = getSnapshotValue(snapshot, value);
      if (!nextValue || scope.includes(nextValue)) {
        storeSnapshot.setSnapshot(value)
        if (nextValue === null) {
          localStorage.removeItem(keyname)
        } else {
          localStorage.setItem(keyname, typeof nextValue === 'object' ? JSON.stringify(nextValue) : String(nextValue))
        }
      }

    },
  }

  return storeSnapshot
}

export default generateStore

type IsUnion<T, COPY = T> = T extends T ? ([COPY] extends [T] ? false : true) : never
type PurgeAtomic<T> = [T] extends [never] ? never : (T extends null | undefined | void | never ? never : T);
type PurgeUnion<T> = 
  IsUnion<T> extends true 
    ? (T extends infer U ? PurgeAtomic<U> : never)
    : PurgeAtomic<T>

type ValueUpdater<T> = (prev: T | null) => T | null;