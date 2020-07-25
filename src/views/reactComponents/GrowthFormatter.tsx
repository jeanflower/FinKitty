import React from 'react';
import { DbSetting } from '../../types/interfaces';
import { makeStringFromGrowth } from '../../utils';

interface GrowthFormatterProps {
  name: string;
  value: string;
  settings: DbSetting[];
}
class GrowthFormatter extends React.Component<GrowthFormatterProps, {}> {
  public render() {
    const x = makeStringFromGrowth(this.props.value, this.props.settings);
    // log(`string representtation of ${this.props.value} is ${x}`);
    return <span data-tip={`${this.props.name}:${x}`}>{x}</span>;
  }
}

export default GrowthFormatter;
