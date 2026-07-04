declare module 'react' {
  export function useState<T = any>(initial: T): [T, (value: T | ((prev: T) => T)) => void];
  export const Fragment: any;
  const _default: any;
  export default _default;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export function jsxDEV(type: any, props?: any, key?: any): any;
}
