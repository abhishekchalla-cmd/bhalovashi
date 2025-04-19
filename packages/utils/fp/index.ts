type ComposeFn<T extends any[]> = T extends [infer F, ...infer R]
    ? F extends (x: any) => any
    ? R extends [(x: any) => any, ...any[]]
    ? (x: Parameters<F>[0]) => ComposeFn<R>
    : (x: Parameters<F>[0]) => ReturnType<T[number]>
    : never
    : never;

export function compose<T extends ((x: any) => any)[]>(...fns: T): ComposeFn<T> {
    return ((x: any) => fns.reduce((acc, fn) => fn(acc), x)) as ComposeFn<T>;
}