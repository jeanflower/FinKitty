import React from 'react';

import assetsGraph from './sampleAssetGraph.png';
import expensesGraph from './sampleExpenseGraph.png';
import taxGraph from './sampleTaxGraph.png';
import Image from 'next/image' 

export function screenshotsDiv() {
  return (
    <>
      <h3>Get a handle on your planned expenses</h3>
      <Image
        src={expensesGraph}
        alt="Sample expense graph screenshot"
        width={500}
        height={300}
      />
      <br />
      <br />
      <h3>See the prospects for your future financial health</h3>
      <Image
        src={assetsGraph}
        alt="Sample asset graph screenshot"
        width={500}
        height={300}
      />
      <br />
      <br />
      <h3>Check on your predicted tax payments</h3>
      <Image
        src={taxGraph}
        alt="Sample tax graph screenshot"
        width={500}
        height={300}
      />
    </>
  );
}
