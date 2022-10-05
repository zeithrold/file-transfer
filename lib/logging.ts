export function logWithDate(message: any) {
  const currentTime = new Date();
  console.log(`[${currentTime.toISOString}]: ${message}`);
}
