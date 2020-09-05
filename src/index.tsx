import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { shallowEqual } from './utils';

const noopObject = {};

export type AllStyles = ViewStyle | TextStyle | ImageStyle;
export type ReturnStylesFn = (arg0: any) => AllStyles;
export type NativeStyleReccord = Record<string, ReturnStylesFn | AllStyles>;

class NativeStyles<T extends NativeStyleReccord> {
  oldProps: any;
  finalStyles: Map<keyof T, AllStyles>;
  dynamicProps: Map<keyof T, ReturnStylesFn>;

  constructor(styles: T, props: any = {}) {
    this.oldProps = props;
    this.finalStyles = new Map();
    this.dynamicProps = new Map();

    Object.keys(styles).forEach(key => {
      const style = styles[key];
      let evaluatedStyle;

      if (typeof style === 'function') {
        this.dynamicProps.set(key, style as ReturnStylesFn);
        evaluatedStyle = style(props);
      } else {
        evaluatedStyle = style;
      }

      this.finalStyles.set(key, evaluatedStyle);
    });

    return this;
  }

  update = (props = {}) => {
    if (!shallowEqual(props, this.oldProps)) {
      this.oldProps = props;

      this.dynamicProps.forEach((func, key) => {
        this.finalStyles.set(key, func(props));
      });
    }

    return this;
  };

  get = (key: keyof T): AllStyles => {
    return this.finalStyles.get(key) || noopObject;
  };
}

export { NativeStyles };
