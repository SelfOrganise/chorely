import { Types } from 'srcRootDir/pages/shopping/services/constants';

declare global {
  interface Grocery {
    id: number;
    name: string;
    size: number;
  }

  interface MapData {
    id: number;
    data: string;
  }

  type MapDefinition = Array<{
    type: keyof typeof Types;
    left: number;
    top: number;
    width: number;
    height: number;
    name: string;
  }>;

  interface Basket {
    id: number;
    created_at_utc: string;
    items: Array<BasketItem>;
  }

  interface BasketItem extends Grocery {
    basketId: number;
  }
}
