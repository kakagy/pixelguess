export function isRatingMatch(ratingA: number, ratingB: number, range: number = 100): boolean {
  return Math.abs(ratingA - ratingB) <= range;
}

export function calculateRatingChange(
  winnerRating: number,
  loserRating: number
): { winnerDelta: number; loserDelta: number } {
  const K = 32;
  const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const winnerDelta = Math.round(K * (1 - expectedWin));
  const loserDelta = -winnerDelta;
  return { winnerDelta, loserDelta };
}
