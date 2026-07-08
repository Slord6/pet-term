export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function truncateMiddle(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 3) {
    return value.slice(0, maxLength);
  }

  const side = Math.floor((maxLength - 3) / 2);
  return `${value.slice(0, side)}...${value.slice(value.length - side)}`;
}

export function meter(value: number, width = 20): string {
  const filled = Math.round((clamp(value, 0, 100) / 100) * width);
  return `${"#".repeat(filled)}${"-".repeat(width - filled)}`;
}
