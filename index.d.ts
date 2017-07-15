declare module "event-emitter" {
  export interface StoreOptions {
    strict?: boolean, // default: false
    key?: Array,
  }

  export interface EventEmitter {
    addListener(event: string | symbol, listener: Function): this;
    on(event: string | symbol, listener: Function): this;
    once(event: string | symbol, listener: Function): this;
    prependListener(event: string | symbol, listener: Function): this;
    prependOnceListener(event: string | symbol, listener: Function): this;
    removeListener(event: string | symbol, listener: Function): this;
    removeAllListeners(event ?: string | symbol): this;
    emit(event: string | symbol, ...args: any[]): boolean;
    emitAsync(event: string | symbol, ...args: any[]): Promise<boolean>;
  }

  declare function internal(opts?: StoreOptions): EventEmitter;

  export = internal
}
