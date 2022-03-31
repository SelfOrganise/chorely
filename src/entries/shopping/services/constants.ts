export const fallbackImage = new Image(64, 64);
fallbackImage.src = '/images/fallback.jpeg';

export const Urls = {
  startUrl: '/images/start.svg',
  finishUrl: '/images/finish.svg',
};

export const Names = {
  start: 'start',
  finish: 'finish',
};

export const Types = {
  rect: 'rect' as const,
  product: 'product' as const,
  checkpoint: 'checkpoint' as const,
};
