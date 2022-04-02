import { Types } from 'srcRootDir/entries/shopping/services/constants';

declare global {
  type MapDefinition = Array<{
    type: keyof typeof Types;
    left: number;
    top: number;
    width: number;
    height: number;
    name: string;
  }>;
}
