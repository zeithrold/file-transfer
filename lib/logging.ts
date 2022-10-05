export function logWithDate(message: string) {
  const currentTime = new Date();
  console.log(`[${currentTime.toISOString}]: ${message}`);
}
