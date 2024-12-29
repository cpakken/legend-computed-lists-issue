export function weakMemo<T extends object, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new WeakMap<T, R>()

  return function memoizedFn(arg: T): R {
    if (cache.has(arg)) {
      return cache.get(arg)! // Non-null assertion is safe here due to the has check
    }

    const result = fn(arg)
    cache.set(arg, result)
    return result
  }
}
