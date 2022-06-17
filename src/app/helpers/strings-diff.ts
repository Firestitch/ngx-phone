export function stringsDiff(str1: string, str2: string): string | undefined {
  if (typeof (str1) !== 'string' && typeof (str2) !== 'string') {
    return;
  }

  const strLen1 = str1.length;
  const strLen2 = str2.length;
  const maxLen = Math.max(strLen1, strLen2);

  for (let i = 0; i <= maxLen - 1; i++) {
    if (str1.charAt(i) !== str2.charAt(i)) {
      return str1.charAt(i);
    }
  }

  return;
}
