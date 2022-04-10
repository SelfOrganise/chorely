import React, { useEffect, useRef } from 'react';
import { StoreMap } from '../services';

export function SolutionView() {
  const { rawSolution, groceriesSolution, routesBetweenBasketGroceries, basketGroceriesAsMapDefinition } = useRef<any>(
    JSON.parse(window.localStorage.getItem('solution') || '{}')
  ).current;

  const canvasElement = useRef<HTMLCanvasElement | null>(null);

  // if (result && selectedResult == null) {
  //   return (
  //     <div className="flex h-full flex-col justify-center items-center">
  //       <h4>Select one of the solutions</h4>
  //       <div className="flex space-x-2 p-2">
  //         {result.map((r, i: number) => (
  //           <Button onClick={() => setSelectedResult(i)} key={i}>
  //             Solution {i + 1}???
  //           </Button>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }

  useEffect(() => {
    if (!canvasElement.current) {
      alert('something wrong with canvas');
      return;
    }

    const storeMap = new StoreMap(canvasElement.current);
    storeMap.import(basketGroceriesAsMapDefinition);
    storeMap.drawRoutes(rawSolution, routesBetweenBasketGroceries);
    storeMap.canvas.forEachObject(o => (o.selectable = false));

    //
    // const selectedResultRoute = allBasketAsMapDefinition.current.filter(m => {
    //   if(m.type === Types.product && m.) {
    //
    //   }
    // })
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="overflow-hidden border-2 border-black">
        <canvas ref={canvasElement} />
      </div>
      <div className="flex flex-row">
        {groceriesSolution &&
          groceriesSolution.map((s: Array<Grocery>, index: number) => (
            <div key={index} className="flex justify-around space-x-2 p-2">
              <div className="border-2 p-2">
                <p className="font-bold">Size: {s.map(e => e.size).reduce((res, s) => res + s, 0)}</p>
                {s.map((g: Grocery, i: number) => (
                  <div className="border-b-2 p-2" key={g.name + i}>
                    {g?.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
