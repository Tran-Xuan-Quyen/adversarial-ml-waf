/// <reference types="react-scripts" />

namespace React {
    interface Attributes {
      styleName?: string;
    }
  }
  
  declare type A = any;
  declare type valueof<T> = T[keyof T];
  declare interface Window {
    context?: IContext;
    analytics?: any;
    aptrinsic?: any;
    [key: string]: any;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: A;
  }