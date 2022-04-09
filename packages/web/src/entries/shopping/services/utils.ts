import { storeMapConfig } from 'srcRootDir/entries/shopping/services/storeMap';
import { Names, Types } from 'srcRootDir/entries/shopping/services/constants';
import { AStarFinder, Grid } from 'pathfinding';

export function toProductImageUrl(name: string, small = false): string {
  return `/images${small ? '/small' : ''}/${name.toLowerCase().replace(/ /g, '_')}.webP`;
}

export type RoutesContext = Array<
  Array<{ route: Array<Array<number>>; products: Array<[number, number, MapDefinition[number]]> }>
>;
export function getAllRoutes(mapDefinition: MapDefinition): RoutesContext {
  const storeLayout = Array(storeMapConfig.rows)
    .fill(null)
    .map(() => new Array(storeMapConfig.columns).fill(0));

  // reduce map definitions into a Map
  const entities = mapDefinition.reduce<Record<keyof typeof Types, MapDefinition>>(
    (result, definition) => {
      result[definition.type] = result[definition.type] || [];
      result[definition.type].push(definition);

      return result;
    },
    { checkpoint: [], product: [], rect: [] }
  );

  // create a 2D array and add the walls as 1s
  for (const wall of entities.rect) {
    if (wall.left == null || wall.top == null || wall.height == null || wall.width == null) {
      continue;
    }

    const left1 = Math.floor(wall.left / storeMapConfig.grid);
    const top1 = Math.floor(wall.top / storeMapConfig.grid);
    const left2 = Math.floor((wall.left + wall.width) / storeMapConfig.grid);
    const top2 = Math.floor((wall.top + wall.height) / storeMapConfig.grid);

    for (let i = 0; i < left2 - left1; i++) {
      for (let j = 0; j < top2 - top1; j++) {
        storeLayout[top1 + j][left1 + i] = 1;
      }
    }
  }

  const products: Array<[number, number, MapDefinition[number]]> = entities.product.map(p => [
    p.left! / storeMapConfig.grid,
    p.top! / storeMapConfig.grid,
    p,
  ]);

  const startCheckpoint = entities.checkpoint.find(c => c.name === Names.start);
  const start: [number, number, MapDefinition[number]] = [
    startCheckpoint!.left! / storeMapConfig.grid,
    startCheckpoint!.top! / storeMapConfig.grid,
    startCheckpoint!,
  ];
  products.unshift(start);

  const finishCheckpoint = entities.checkpoint.find(c => c.name === Names.finish);
  const finish: [number, number, MapDefinition[number]] = [
    finishCheckpoint!.left! / storeMapConfig.grid,
    finishCheckpoint!.top! / storeMapConfig.grid,
    finishCheckpoint!,
  ];
  products.push(finish);

  const every2ProductCombination = products.flatMap((v, i) => products.slice(i).map(w => [v, w]));

  // use AStar to find distances between every product
  const finder = new AStarFinder({});
  const routes = Array(products.length)
    .fill(null)
    .map(() => new Array(products.length).fill(0));

  for (const combination of every2ProductCombination) {
    const searchGrid = new Grid(storeLayout);
    const route = finder.findPath(
      combination[0][0],
      combination[0][1],
      combination[1][0],
      combination[1][1],
      searchGrid
    );

    const pairIndexes = [products.indexOf(combination[0]), products.indexOf(combination[1])];
    routes[pairIndexes[0]][pairIndexes[1]] = { route, products: combination };
    routes[pairIndexes[1]][pairIndexes[0]] = { route, products: combination.reverse() };
  }

  return routes;
}
