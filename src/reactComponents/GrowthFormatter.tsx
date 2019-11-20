import React from 'react';
import { DbSetting } from '../types/interfaces';
import { makeGrowthTooltip, makeStringFromGrowth } from '../utils';

interface GrowthFormatterProps {
  value: string;
  settings: DbSetting[];
}
class GrowthFormatter extends React.Component<GrowthFormatterProps, {}> {
  public render() {
    const x = makeStringFromGrowth(this.props.value, this.props.settings);
    // log(`string representtation of ${this.props.value} is ${x}`);
    return (
      <span data-tip={makeGrowthTooltip(this.props.value, this.props.settings)}>
        {x}
      </span>
    );
  }
}

export default GrowthFormatter;
