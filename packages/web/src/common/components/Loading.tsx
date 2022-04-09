import React from 'react';

import { spinnerIcon } from 'srcRootDir/common/icons';

export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center m-8">
      {spinnerIcon}
      <h4 className="mt-4">Loading...</h4>
    </div>
  );
}
