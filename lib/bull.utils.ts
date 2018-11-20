export function getQueueToken(name?: string): string {
  console.log(`name: ${name}`)
  return name ? `BullQueue_${name}` : 'BullQueue_default'
}
