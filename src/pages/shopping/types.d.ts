import { Types } from 'srcRootDir/pages/shopping/services/constants';

declare global {
  interface Grocery {
    id: number;
    name: string;
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
}
