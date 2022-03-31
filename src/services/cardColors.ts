export const cardColors = [
  { background: '#ff6f75', color: 'white' },
  { background: '#46c2a6', color: 'white' },
  { background: '#ff70a8', color: 'white' },
  { background: '#dd8d7f', color: 'white' },
  { background: '#ff875d', color: 'white' },
  { background: '#4bb7dd', color: 'white' },
  { background: '#ffe162', color: '#867734' },
  { background: '#9ccc65', color: 'white' },
  { background: '#ba68c8', color: 'white' },
].map(c => ({
  ...c,
  // todo: move to tailwind.css and use utils
  // fabBackground: lighten(c.background, 0.85),
  // fabColor: darken(c.background, 0.3),
}));
