import { fabric } from 'fabric';
import { fallbackImage, Names, Types, Urls } from './constants';
import { AStarFinder, Grid } from 'pathfinding';
import { toImageName} from '../services/utils';

export class StoreMap {
  canvas: fabric.Canvas;
  clipboard: fabric.Object | null = null;
  grid = 10;
  columns = 100;
  rows = 32;
  canvasWidth = this.columns * this.grid;
  canvasHeight = this.rows * this.grid;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasElement, { selection: false });
    this.canvas.setWidth(1000);
    this.canvas.setHeight(500);

    this.init();
  }

  init() {
    this.#drawGridLines();
    this.#enableZoom();
    this.#enableSnapToGrid();
  }

  export() {
    const result = this.canvas
      .getObjects()
      .filter(o => o.type !== 'line' && o.type !== 'result')
      .map(o => ({
        type: o.type,
        left: o.left,
        top: o.top,
        width: o.width,
        height: o.height,
        name: o.name,
      }));

    return JSON.stringify(result);
  }

  import(data: string | null) {
    if (!data) {
      alert('no data in storage');
      return [];
    }

    const items = JSON.parse(data);
    for (const item of items) {
      if (item.name === Names.start) {
        this.#addSvg({ url: Urls.startUrl, ...item });
      } else if (item.name === Names.finish) {
        this.#addSvg({ url: Urls.finishUrl, ...item });
      } else if (item.type === Types.product) {
        this.addProduct(item);
      } else if (item.type === Types.rect) {
        this.canvas.add(
          new fabric.Rect({
            ...item,
            fill: '#fab',
            stroke: '',
            originX: 'left',
            originY: 'top',
            hasControls: true,
            lockRotation: true,
          })
        );
      }
    }

    return items;
  }

  copy() {
    // clone what are you copying since you
    // may want copy and paste on different moment.
    // and you do not want the changes happened
    // later to reflect on the copy.
    this.canvas.getActiveObject().clone((cloned: fabric.Object) => {
      this.clipboard = cloned;
    });
  }

  paste() {
    // clone again, so you can do multiple copies.
    this.clipboard?.clone((clonedObj: fabric.Group) => {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left! + 10,
        top: clonedObj.top! + 10,
        evented: true,
      });
      if (clonedObj.type === 'activeSelection') {
        // active selection needs a reference to the canvas.
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject((obj: fabric.Object) => {
          this.canvas.add(obj);
        });
        // this should solve the unselectability
        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }
      this.clipboard!.top! += 10;
      this.clipboard!.left! += 10;
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    });
  }

  delete() {
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.remove(active);
    }
  }

  //region old
  // let isDown = false;
  // let origX = 0;
  // let origY = 0;
  // let rect: any = null;
  // canvas.on('mouse:down', function (o) {
  //   if (!canvas.current) {
  //     return;
  //   }
  //
  //   let pointer = canvas.getPointer(o.e);
  //   isDown = true;
  //   origX = snap(pointer.x);
  //   origY = snap(pointer.y);
  //   rect = new fabric.Rect({
  //     top: snap(origY),
  //     left: snap(origX),
  //     originX: 'left',
  //     originY: 'top',
  //     width: snap(pointer.x - origX),
  //     height: snap(pointer.y - origY),
  //     angle: 0,
  //     fill: 'rgba(255,0,0,1)',
  //     transparentCorners: false,
  //   });
  //   canvas.add(rect);
  // });

  // canvas.on('mouse:move', function (o) {
  //   if (!canvas.current) return;
  //   if (!isDown) return;
  //
  //   let pointer = canvas.getPointer(o.e);
  //
  //   if (origX > pointer.x) {
  //     rect.set({ left: snap(Math.abs(pointer.x)) });
  //   }
  //
  //   if (origY > pointer.y) {
  //     rect.set({ top: snap(Math.abs(pointer.y)) });
  //   }
  //
  //   rect.set({ width: snap(Math.abs(origX - pointer.x)) });
  //   rect.set({ height: snap(Math.abs(origY - pointer.y)) });
  //
  //   canvas.renderAll();
  // });

  // canvas.on('mouse:up', function (o) {
  //   rect.set({
  //     width: snap(rect.width),
  //     height: snap(rect.height),
  //     scaleX: 1,
  //     scaleY: 1,
  //   });
  //
  //   canvas.current?.renderAll();
  //   isDown = false;
  // });
  //endregion

  addWall() {
    this.canvas.add(
      new fabric.Rect({
        left: this.grid,
        top: this.grid,
        width: this.grid,
        height: this.grid * 2,
        fill: '#fab',
        stroke: '',
        originX: 'left',
        originY: 'top',
        hasControls: true,
        // centeredRotation: true,
        // lockMovementX: true,
        // lockMovementY: true,
        // lockScaling: true,
        lockRotation: true,
        // hasBorders: false
      })
    );
  }

  solve() {
    // clear
    const lines = this.canvas.getObjects('result');
    this.canvas.remove(...lines);

    // const checkpoints = canvas.current.getObjects('group');
    const walls = this.canvas.getObjects('rect');

    const table = Array(this.rows)
      .fill(null)
      .map(() => new Array(this.columns).fill(0));

    for (const wall of walls) {
      if (wall.left == null || wall.top == null || wall.height == null || wall.width == null) {
        continue;
      }

      const left1 = Math.floor(wall.left / this.grid);
      const top1 = Math.floor(wall.top / this.grid);
      const left2 = Math.floor((wall.left + wall.width) / this.grid);
      const top2 = Math.floor((wall.top + wall.height) / this.grid);

      for (let i = 0; i < left2 - left1; i++) {
        for (let j = 0; j < top2 - top1; j++) {
          table[top1 + j][left1 + i] = 1;
        }
      }
    }

    // console.log(table.map(row => row.join(' ')).join('\n'));

    const products: Array<Array<number>> = this.canvas
      .getObjects('product')
      .map(p => {
        return [(p.left || 0) / this.grid, (p.top || 0) / this.grid];
      })
      .filter(p => p);

    const checkpoints = this.canvas.getObjects(Types.checkpoint);
    const startCheckpoint = checkpoints.find(c => c.name === Names.start);
    const start = [startCheckpoint!.left! / this.grid, startCheckpoint!.top! / this.grid];

    const finishCheckpoint = checkpoints.find(c => c.name === Names.finish);
    const finish = [finishCheckpoint!.left! / this.grid, finishCheckpoint!.top! / this.grid];

    products.unshift(start);
    products.push(finish);

    const finder = new AStarFinder({});

    const allCombinations = products.flatMap((v, i) => products.slice(i + 1).map(w => [v, w]));

    const weights = Array(products.length)
      .fill(null)
      .map(() => new Array(products.length).fill(0));

    const values: any = [];
    for (const combination of allCombinations) {
      const searchGrid = new Grid(table);
      const result = finder.findPath(
        combination[0][0],
        combination[0][1],
        combination[1][0],
        combination[1][1],
        searchGrid
      );

      const set = [products.indexOf(combination[0]), products.indexOf(combination[1])];
      weights[set[0]][set[1]] = result.length;
      weights[set[1]][set[0]] = result.length;

      values.push({
        set,
        value: result.length,
        route: result,
      });

      values.push({
        set: [...set].reverse(),
        value: result.length,
        route: result,
      });
    }

    console.log({ values, weights });

    fetch('http://localhost:4000/shopping/solve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-UserId': '1',
      },
      body: JSON.stringify({
        weights,
        numberOfPeople: 2,
      }),
    })
      .then(result => result.json())
      .then((result: number[][]) => {
        console.log({ result });

        for (let i = 0; i < result.length; i++) {
          const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

          for (let j = 0; j < result[0].length - 1; j++) {
            const a = result[i][j];
            const b = result[i][j + 1];

            const route = values.find((v: any) => v.set[0] == a && v.set[1] === b)?.route;

            if (!route) {
              continue;
            }

            for (let i = 0; i < route.length - 1; i++) {
              const line = new fabric.Line(
                [
                  route[i][0] * this.grid,
                  route[i][1] * this.grid,
                  route[i + 1][0] * this.grid,
                  route[i + 1][1] * this.grid,
                ],
                {
                  type: 'result',
                  fill: color,
                  stroke: color,
                  strokeWidth: 2,
                  selectable: false,
                  evented: false,
                }
              );
              this.canvas.add(line);
            }
          }
        }
      });
  }

  #drawGridLines() {
    for (let i = 0; i < this.columns + 1; i++) {
      this.canvas.add(
        new fabric.Line([i * this.grid, 0, i * this.grid, this.canvasHeight], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
        })
      );
    }

    for (let i = 0; i < this.rows + 1; i++) {
      this.canvas.add(
        new fabric.Line([0, i * this.grid, this.canvasWidth, i * this.grid], {
          stroke: '#ccc',
          selectable: false,
          evented: false,
        })
      );
    }
  }

  #snap(size: number): number {
    return Math.round(size / this.grid) * this.grid;
  }

  addProduct({ name, left, top }: { name: string; left?: number; top?: number }) {
    fabric.Image.fromURL(`/images/${toImageName(name)}.jpeg`, item => {
      item.name = name;
      item.type = 'product';
      if (item.height === 0 || item.width === 0) {
        item.setElement(fallbackImage);
      }
      this.#addHelper({ item, left: left || 4 * this.grid, top: top || 4 * this.grid });
    });
  }

  #addSvg(args: { url: string; name: string; left: number; top: number }) {
    fabric.loadSVGFromURL(args.url, (objects, options) => {
      const svgData = fabric.util.groupSVGElements(objects, options);
      svgData.name = args.name;
      svgData.type = 'checkpoint';
      this.#addHelper({ item: svgData, ...args });
    });
  }

  #addHelper(args: { item: fabric.Object; left: number; top: number }) {
    args.item.left = this.#snap(args.left);
    args.item.top = this.#snap(args.top);
    args.item.scaleToHeight(this.grid);
    args.item.scaleToWidth(this.grid);
    args.item.lockRotation = true;
    args.item.hasControls = false;
    args.item.originX = 'left';
    args.item.originY = 'top';

    this.canvas.add(args.item);
  }

  #enableSnapToGrid() {
    this.canvas.on('object:moving', (options: any) => {
      options.target.set({
        left: this.#snap(options.target.left),
        top: this.#snap(options.target.top),
      });
    });

    this.canvas.on('object:modified', (options: any) => {
      if (options.target.type !== 'rect') {
        return;
      }

      const newWidth = this.#snap(options.target.getScaledWidth());
      const newHeight = this.#snap(options.target.getScaledHeight());

      options.target.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1,
      });
    });
  }

  #enableZoom() {
    this.canvas.on('mouse:wheel', function (this: fabric.Canvas, opt) {
      const delta = opt.e.deltaY;
      let zoom = this.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      this.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    this.canvas.on('mouse:down', function (this: fabric.Canvas, opt) {
      const mouseOrTouchEvent = opt.e as any;
      const evt = mouseOrTouchEvent.changedTouches ? mouseOrTouchEvent.changedTouches[0] : mouseOrTouchEvent;
      if (opt.e.altKey) {
        // @ts-ignore
        this.isDragging = true;
        // @ts-ignore
        this.lastPosX = evt.clientX;
        // @ts-ignore
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:move', function (this: fabric.Canvas, opt) {
      // @ts-ignore
      if (this.isDragging) {
        const mouseOrTouchEvent = opt.e as any;
        const evt = mouseOrTouchEvent.changedTouches ? mouseOrTouchEvent.changedTouches[0] : mouseOrTouchEvent;

        const vpt = this.viewportTransform;
        // @ts-ignore
        vpt![4] += evt.clientX - this.lastPosX;
        // @ts-ignore
        vpt![5] += evt.clientY - this.lastPosY;
        this.requestRenderAll();
        // @ts-ignore
        this.lastPosX = evt.clientX;
        // @ts-ignore
        this.lastPosY = evt.clientY;
      }
    });

    this.canvas.on('mouse:up', function (this: fabric.Canvas, opt) {
      // on mouse up we want to recalculate new interaction
      // for all objects, so we call setViewportTransform
      // @ts-ignore
      this.setViewportTransform(this.viewportTransform);
      // @ts-ignore
      this.isDragging = false;
    });
  }
}
