
// Enhanced shuffle with seed for consistent results during same session
export function shuffleArrayWithSeed<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  let currentSeed = seed;
  
  for (let i = arr.length - 1; i > 0; i--) {
    // Pseudo-random number generator with seed
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    const j = Math.floor((currentSeed / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
