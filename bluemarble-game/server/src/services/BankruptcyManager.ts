import type { GameState, Player } from './types'

export class BankruptcyManager {
  /**
   * 플레이어가 파산했는지 확인하고 처리
   * @returns 파산 여부와 승자 정보
   */
  checkBankruptcy(
    state: GameState,
    playerId: string,
    creditorId?: string // 통행료 등 빚을 진 상대
  ): { bankrupted: boolean; winner?: Player } {
    const player = state.players.find(p => p.id === playerId)
    if (!player || player.cash >= 0) return { bankrupted: false }

    // 보유 자산 정리 시도
    const assets = this.calculateAssets(state, playerId)
    const totalValue = player.cash + assets

    if (totalValue >= 0) {
      // 자산이 있으면 파산 아님 (건물 매각 등으로 해결 가능)
      return { bankrupted: false }
    }

    // 파산 확정: 모든 자산을 채권자에게 이전
    player.bankrupt = true

    if (creditorId) {
      const creditor = state.players.find(p => p.id === creditorId)
      if (creditor) {
        // 현금 이전 (음수 현금도 0으로 처리)
        creditor.cash += Math.max(0, player.cash)
        
        // 모든 부동산 이전
        for (const cell of state.board) {
          if (cell.type === 'property' && cell.property?.owner === playerId) {
            cell.property.owner = creditorId
          }
        }
        
        state.log.unshift({
          timestamp: Date.now(),
          message: `${player.name} 파산! 모든 자산이 ${creditor.name}에게 이전됨`
        })
      }
    } else {
      // 채권자 없으면 모든 부동산 무소유 상태로
      for (const cell of state.board) {
        if (cell.type === 'property' && cell.property?.owner === playerId) {
          cell.property.owner = undefined
          cell.property.building = 'none'
        }
      }
      state.log.unshift({
        timestamp: Date.now(),
        message: `${player.name} 파산! 모든 부동산이 무소유 상태가 됨`
      })
    }

    player.cash = 0

    // 승자 확인: 나머지 플레이어 중 파산하지 않은 플레이어가 1명이면 승리
    const alivePlayers = state.players.filter(p => !p.bankrupt)
    if (alivePlayers.length === 1) {
      return { bankrupted: true, winner: alivePlayers[0] }
    }

    return { bankrupted: true }
  }

  /**
   * 플레이어의 총 자산 가치 계산 (현금 제외)
   */
  private calculateAssets(state: GameState, playerId: string): number {
    let total = 0
    for (const cell of state.board) {
      if (cell.type === 'property' && cell.property?.owner === playerId) {
        total += cell.property.price
        
        // 건물 가치 추가 (구매 가격의 50% 회수 가정)
        if (cell.property.building === 'villa') total += cell.property.price * 0.25
        if (cell.property.building === 'building') total += cell.property.price * 0.25
        if (cell.property.building === 'hotel') total += cell.property.price * 0.25
      }
    }
    return total
  }

  /**
   * 건물 강제 매각 (자금 확보 시도)
   */
  sellBuilding(state: GameState, playerId: string, propertyId: number): boolean {
    const player = state.players.find(p => p.id === playerId)
    const cell = state.board.find(c => c.id === propertyId)
    
    if (!player || cell?.type !== 'property' || !cell.property) return false
    if (cell.property.owner !== playerId || cell.property.building === 'none') return false

    // 매각 가격: 건설 비용의 50%
    const refund = Math.floor(cell.property.price * 0.5 * 0.5)
    player.cash += refund
    cell.property.building = 'none'
    
    state.log.unshift({
      timestamp: Date.now(),
      message: `${player.name}이(가) ${cell.property.name}의 건물 매각 (+${refund / 10000}만원)`
    })

    return true
  }

  /**
   * 부동산 강제 매각
   */
  sellProperty(state: GameState, playerId: string, propertyId: number): boolean {
    const player = state.players.find(p => p.id === playerId)
    const cell = state.board.find(c => c.id === propertyId)
    
    if (!player || cell?.type !== 'property' || !cell.property) return false
    if (cell.property.owner !== playerId) return false

    // 매각 가격: 부동산 가격의 50%
    const refund = Math.floor(cell.property.price * 0.5)
    player.cash += refund
    cell.property.owner = undefined
    cell.property.building = 'none'
    
    state.log.unshift({
      timestamp: Date.now(),
      message: `${player.name}이(가) ${cell.property.name} 매각 (+${refund / 10000}만원)`
    })

    return true
  }
}
