export function expand(items: Array<any>) {
  const columnCount = Object.values(items[0]).length;
  let index = 1;
  return Array(items.length)
    .fill(0)
    .map(
      () =>
        `(${Array(columnCount)
          .fill(0)
          .map(() => `$${index++}`)
          .join(", ")})`
    )
    .join(", ");
}
