import type { GameState, Player, Cell } from './types'

export class PropertyManager {
  // 색 그룹 정의
  private colorGroups = {
    brown: [1, 3],
    blue: [5, 6, 8],
    purple: [9, 11, 12],
    orange: [13, 14, 15],
    red: [16, 18, 19],
    yellow: [21, 23, 24],
    green: [25, 26, 28],
    black: [29, 31]
  }

  canBuildBuilding(state: GameState, playerId: string, propertyId: number): boolean {
    const cell = state.board.find(c => c.id === propertyId)
    if (!cell || cell.type !== 'property' || !cell.property) return false
    if (cell.property.owner !== playerId) return false

    // 색 그룹 완성 확인
    const group = this.getColorGroup(propertyId)
    if (!group) return true // 그룹 없으면 바로 건설 가능(간이)
    
    const allOwned = group.every(id => {
      const c = state.board.find(b => b.id === id)
      return c?.type === 'property' && c.property?.owner === playerId
    })
    
    return allOwned
  }

  calculateToll(property: any, building: string): number {
    const basePrice = property.price || 0
    switch (building) {
      case 'villa': return Math.floor(basePrice * 0.5)
      case 'building': return Math.floor(basePrice * 2)
      case 'hotel': return Math.floor(basePrice * 5)
      default: return Math.floor(basePrice * 0.1) // 빈 땅
    }
  }

  getBuildingCost(property: any): number {
    return Math.floor((property.price || 0) * 0.5)
  }

  private getColorGroup(propertyId: number): number[] | null {
    for (const group of Object.values(this.colorGroups)) {
      if (group.includes(propertyId)) return group
    }
    return null
  }
}
