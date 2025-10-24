export class TurnManager {
  next(order: string[], current: string) {
    const idx = order.indexOf(current)
    if (idx === -1) return order[0]
    return order[(idx + 1) % order.length]
  }
}
