export function parenthesesClosed(str: string): boolean {
  const numberOfOpenParentesis = str.match(/\(/g)?.length;
  const numberOfCloseParentesis = str.match(/\)/g)?.length;

  return numberOfOpenParentesis === numberOfCloseParentesis;
}
