import React from "react";

import assetsGraph from "./sampleAssetGraph.png";
import expensesGraph from "./sampleExpenseGraph.png";
import taxGraph from "./sampleTaxGraph.png";
import Image from "next/image";

export function screenshotsDiv() {
  return (
    <>
      <h4>Get a handle on your planned expenses</h4>
      <Image
        src={expensesGraph}
        alt="Sample expense graph screenshot"
        width={250}
        height={150}
      />
      <br />
      <br />
      <h4>See the prospects for your future financial health</h4>
      <Image
        src={assetsGraph}
        alt="Sample asset graph screenshot"
        width={250}
        height={150}
      />
      <br />
      <br />
      <h4>Check on your predicted tax payments</h4>
      <Image
        src={taxGraph}
        alt="Sample tax graph screenshot"
        width={250}
        height={150}
      />
    </>
  );
}
