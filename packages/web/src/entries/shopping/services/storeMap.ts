import { fabric } from 'fabric';
import { fallbackImage, Names, Types, Urls } from './constants';
import { RoutesContext, toImageName } from '../services/utils';
import Hammer from 'hammerjs';
import { ICanvasOptions } from 'fabric/fabric-impl';

export const storeMapConfig = {
  columns: 100,
  rows: 32,
  grid: 10,
};

interface HammerCanvasClass extends fabric.Canvas {
  new (element: HTMLCanvasElement | string | null, options?: ICanvasOptions): HammerCanvasClass;
  scale: number;
  isDragging: boolean;
  lastPosX: number;
  lastPosY: number;
  wrapperEl: HTMLElement;
  isScalingObject: boolean;
}

const HammerCanvas: HammerCanvasClass = fabric.util.createClass(fabric.Canvas, {
  _onMouseDown: function (e: any) {
    if (e.type === 'touchstart') {
      // Do not allow grouping in mobile mode
      this.selection = false;
      fabric.util.removeListener(this.upperCanvasEl, 'mousedown', this._onMouseDown);
      if (this.currentTouchStart) {
        // Second event, stop this as this is multitouch
        clearTimeout(this.currentTouchStart);
        this.currentTouchStart = null;
      } else {
        // First touch start, wait 100 ms then call
        this.currentTouchStart = setTimeout(() => {
          this.currentTouchStart = null;
          this.callSuper('_onMouseDown', e);
        }, 75);
      }
    } else {
      this.callSuper('_onMouseDown', e);
    }
  },

  _onMouseUp: function (e: any) {
    if (e.type === 'touchend') {
      setTimeout(() => {
        this.callSuper('_onMouseUp', e);
      }, 75);
    } else {
      this.callSuper('_onMouseUp', e);
    }
  },

  _onMouseMove: function (e: any) {
    this.getActiveObject() && e.preventDefault && e.preventDefault();
    this.__onMouseMove(e);
  },

  _onObjectScaling: function (e: any) {
    this._onObjectScaling(e);
  },

  addOrRemove: function (this: HammerCanvasClass, functor: unknown, eventjsFunctor: unknown) {
    // @ts-ignore
    this.callSuper('addOrRemove', functor, eventjsFunctor);
    const mc = new Hammer.Manager(this.wrapperEl);

    const pinch = new Hammer.Pinch({ interval: 100 });
    const pan = new Hammer.Pan();
    mc.add(pinch);
    mc.add(pan);

    mc.on('pinchin', e => {
      this.scale = Math.max((this.getZoom() || 1) - 0.03, 0.9);

      this.zoomToPoint({ x: e.center.x, y: e.center.y }, this.scale);
      this.requestRenderAll();
    });

    mc.on('pinchout', e => {
      this.scale = Math.min((this.getZoom() || 1) + 0.03, 3);

      this.zoomToPoint({ x: e.center.x, y: e.center.y }, this.scale);
      this.requestRenderAll();
    });

    mc.on('panstart', e => {
      this.isDragging = true;
      this.lastPosX = e.deltaX;
      this.lastPosY = e.deltaY;
    });

    mc.on('panend', e => {
      this.isDragging = false;
      this.setViewportTransform(this.viewportTransform!);
    });

    mc.on('panmove', e => {
      if (this.isDragging) {
        const activeObject = this.getActiveObject();
        if (activeObject) {
          return;
        } else {
          const vpt = this.viewportTransform;
          vpt![4] += e.deltaX - this.lastPosX;
          vpt![5] += e.deltaY - this.lastPosY;
          this.requestRenderAll();
          this.lastPosX = e.deltaX;
          this.lastPosY = e.deltaY;
        }
      }
    });
  },
});

export class StoreMap {
  canvas: HammerCanvasClass;
  clipboard: fabric.Object | null = null;
  canvasWidth = storeMapConfig.columns * storeMapConfig.grid;
  canvasHeight = storeMapConfig.rows * storeMapConfig.grid;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = new HammerCanvas(canvasElement, { selection: false });
    this.canvas.setWidth(this.canvasWidth);
    this.canvas.setHeight(this.canvasHeight);

    const pattern = new fabric.Pattern({
      source:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKBAMAAAB/HNKOAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAABJQTFRFpqamAAAAAAAAAAAAAAAAAAAANjJK4QAAAAZ0Uk5T/wABAgMFah24GgAAABdJREFUeJxjYAADRiEhk0AGRkEgIJ4EAFQYAtPe/vhQAAAAAElFTkSuQmCC',
    });
    this.canvas.setBackgroundColor(pattern, () => null);

    this.init();
  }

  init() {
    this.#enableZoom();
    this.#enableSnapToGrid();
  }

  export(): MapDefinition {
    const validTypes = Object.keys(Types);
    return this.canvas
      .getObjects()
      .filter((o): o is fabric.Object & { type: keyof typeof Types } => {
        return o.type != null && validTypes.includes(o.type);
      })
      .map(o => ({
        type: o.type,
        left: o.left!,
        top: o.top!,
        width: o.width!,
        height: o.height!,
        name: o.name!,
      }));
  }

  import(data: MapDefinition): void {
    if (!data) {
      alert('no data in storage');
    }

    for (const item of data) {
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

  addWall() {
    this.canvas.add(
      new fabric.Rect({
        left: storeMapConfig.grid,
        top: storeMapConfig.grid,
        width: storeMapConfig.grid,
        height: storeMapConfig.grid * 2,
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

  drawRoutes(result: number[][], routes: RoutesContext) {
    // clear
    const lines = this.canvas.getObjects('result');
    this.canvas.remove(...lines);

    for (let i = 0; i < result.length; i++) {
      const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

      for (let j = 0; j < result[i].length - 1; j++) {
        const a = result[i][j];
        const b = result[i][j + 1];

        const route = routes[a][b].route;

        if (!route) {
          continue;
        }

        for (let i = 0; i < route.length - 1; i++) {
          const line = new fabric.Line(
            [
              route[i][0] * storeMapConfig.grid,
              route[i][1] * storeMapConfig.grid,
              route[i + 1][0] * storeMapConfig.grid,
              route[i + 1][1] * storeMapConfig.grid,
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
  }

  #snap(size: number): number {
    return Math.round(size / storeMapConfig.grid) * storeMapConfig.grid;
  }

  addProduct({ name, left, top }: { name: string; left?: number; top?: number }) {
    fabric.Image.fromURL(`/images/small/${toImageName(name)}.webP`, item => {
      item.name = name;
      item.type = 'product';
      if (item.height === 0 || item.width === 0) {
        item.setElement(fallbackImage);
      }
      this.#addHelper({ item, left: left || 4 * storeMapConfig.grid, top: top || 4 * storeMapConfig.grid });
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
    if (args.item.width! > args.item.height!) {
      args.item.scaleToWidth(storeMapConfig.grid);
    } else {
      args.item.scaleToHeight(storeMapConfig.grid);
    }
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
  }
}
