import type { GameState, Player, Cell } from './types'
import { PropertyManager } from './PropertyManager'

export type AIDifficulty = 'easy' | 'normal' | 'hard'

interface AIDecision {
  action: 'buyProperty' | 'buildBuilding' | 'trade' | 'sellAsset' | 'pass'
  propertyId?: number
  buildingType?: 'villa' | 'building' | 'hotel'
  targetPlayerId?: string
  cashOffer?: number
  propertiesOffer?: number[]
}

export class AIPlayer {
  private difficulty: AIDifficulty
  private propertyMgr: PropertyManager

  constructor(difficulty: AIDifficulty) {
    this.difficulty = difficulty
    this.propertyMgr = new PropertyManager()
  }

  /**
   * AI 턴 시작 시 의사결정
   */
  makeDecision(state: GameState, aiPlayer: Player): AIDecision {
    // 현재 위치의 셀 확인
    const currentCell = state.board[aiPlayer.position]

    // 1. 부동산 구매 결정
    if (currentCell.type === 'property' && currentCell.property && !currentCell.property.owner) {
      if (this.shouldBuyProperty(state, aiPlayer, currentCell)) {
        return { action: 'buyProperty', propertyId: currentCell.id }
      }
    }

    // 2. 건물 건설 결정
    const buildingDecision = this.decideBuildBuilding(state, aiPlayer)
    if (buildingDecision) {
      return buildingDecision
    }

    // 3. 현금 부족 시 자산 매각
    if (aiPlayer.cash < 100000) { // 10만원 이하
      const sellDecision = this.decideSellAsset(state, aiPlayer)
      if (sellDecision) {
        return sellDecision
      }
    }

    // 4. 거래 제안 (hard 모드만)
    if (this.difficulty === 'hard') {
      const tradeDecision = this.decideTradeOffer(state, aiPlayer)
      if (tradeDecision) {
        return tradeDecision
      }
    }

    return { action: 'pass' }
  }

  /**
   * 부동산 구매 여부 결정
   */
  private shouldBuyProperty(state: GameState, aiPlayer: Player, cell: Cell): boolean {
    const property = cell.property!
    const price = property.price || 0

    // 현금 부족
    if (aiPlayer.cash < price) {
      return false
    }

    // 난이도별 전략
    switch (this.difficulty) {
      case 'easy':
        // 현금의 30% 이하만 구매
        return price <= aiPlayer.cash * 0.3 && Math.random() > 0.3

      case 'normal':
        // 현금의 50% 이하 구매, 색 그룹 고려
        if (price > aiPlayer.cash * 0.5) return false
        const groupAdvantage = this.hasColorGroupAdvantage(state, aiPlayer, property.colorGroup || '')
        return groupAdvantage || Math.random() > 0.4

      case 'hard':
        // 현금의 70% 이하 구매, 전략적 판단
        if (price > aiPlayer.cash * 0.7) return false
        const strategicValue = this.calculatePropertyValue(state, aiPlayer, property)
        return strategicValue > 0.6 // 60% 이상 가치 있으면 구매

      default:
        return false
    }
  }

  /**
   * 색 그룹에서 유리한지 확인
   */
  private hasColorGroupAdvantage(state: GameState, aiPlayer: Player, colorGroup: string): boolean {
    if (!colorGroup) return false

    const groupProperties = state.board.filter(
      cell => cell.type === 'property' && cell.property?.colorGroup === colorGroup
    )

    const ownedCount = groupProperties.filter(
      cell => cell.property?.owner === aiPlayer.id
    ).length

    return ownedCount > 0 // 이미 같은 그룹을 소유 중이면 유리
  }

  /**
   * 부동산 전략적 가치 계산 (0~1)
   */
  private calculatePropertyValue(state: GameState, aiPlayer: Player, property: any): number {
    let value = 0.5 // 기본값

    // 색 그룹 보너스
    if (this.hasColorGroupAdvantage(state, aiPlayer, property.colorGroup || '')) {
      value += 0.3
    }

    // 가격 대비 통행료
    const tollRatio = ((property.price || 0) * 0.1) / (property.price || 1)
    value += tollRatio * 0.2

    return Math.min(value, 1)
  }

  /**
   * 건물 건설 결정
   */
  private decideBuildBuilding(state: GameState, aiPlayer: Player): AIDecision | null {
    const ownedProperties = state.board.filter(
      cell => cell.type === 'property' && cell.property?.owner === aiPlayer.id
    )

    for (const cell of ownedProperties) {
      if (cell.type !== 'property' || !cell.property) continue

      // 그룹 완성 확인
      if (!this.propertyMgr.canBuildBuilding(state, aiPlayer.id, cell.id)) {
        continue
      }

      const buildingCost = this.propertyMgr.getBuildingCost(cell.property)
      
      // 현금 여유 확인
      if (aiPlayer.cash < buildingCost * 1.5) continue

      // 난이도별 건설 확률
      const buildChance = {
        easy: 0.3,
        normal: 0.6,
        hard: 0.9
      }[this.difficulty]

      if (Math.random() < buildChance) {
        // 건물 레벨 결정
        const buildingType = this.decideBuildingLevel(aiPlayer.cash, buildingCost)
        return {
          action: 'buildBuilding',
          propertyId: cell.id,
          buildingType
        }
      }
    }

    return null
  }

  /**
   * 건물 레벨 결정
   */
  private decideBuildingLevel(cash: number, baseCost: number): 'villa' | 'building' | 'hotel' {
    if (this.difficulty === 'easy') {
      return 'villa'
    }

    if (this.difficulty === 'normal') {
      return cash > baseCost * 3 ? 'building' : 'villa'
    }

    // hard
    if (cash > baseCost * 5) return 'hotel'
    if (cash > baseCost * 3) return 'building'
    return 'villa'
  }

  /**
   * 자산 매각 결정
   */
  private decideSellAsset(state: GameState, aiPlayer: Player): AIDecision | null {
    // 현금이 정말 부족할 때만 매각
    if (aiPlayer.cash > 50000) return null

    const ownedProperties = state.board.filter(
      cell => cell.type === 'property' && cell.property?.owner === aiPlayer.id
    )

    // 건물 있는 부동산부터 매각 (건물만)
    for (const cell of ownedProperties) {
      if (cell.type === 'property' && cell.property?.building !== 'none') {
        return {
          action: 'sellAsset',
          propertyId: cell.id
        }
      }
    }

    // 건물 없으면 부동산 자체 매각 (가장 저렴한 것부터)
    const cheapestProperty = ownedProperties
      .filter(c => c.type === 'property' && c.property)
      .sort((a, b) => (a.property!.price || 0) - (b.property!.price || 0))[0]

    if (cheapestProperty) {
      return {
        action: 'sellAsset',
        propertyId: cheapestProperty.id
      }
    }

    return null
  }

  /**
   * 거래 제안 결정 (hard 모드)
   */
  private decideTradeOffer(state: GameState, aiPlayer: Player): AIDecision | null {
    // 10% 확률로만 거래 제안
    if (Math.random() > 0.1) return null

    // 다른 플레이어 중 현금이 많은 플레이어 타겟
    const richestPlayer = state.players
      .filter(p => p.id !== aiPlayer.id && !p.bankrupt)
      .sort((a, b) => b.cash - a.cash)[0]

    if (!richestPlayer) return null

    // 간단한 거래: 저가 부동산 1개를 현금으로 제안
    const myProperties = state.board.filter(
      cell => cell.type === 'property' && cell.property?.owner === aiPlayer.id
    )

    const cheapProperty = myProperties
      .filter(c => c.type === 'property' && c.property)
      .sort((a, b) => (a.property!.price || 0) - (b.property!.price || 0))[0]

    if (cheapProperty && cheapProperty.property) {
      return {
        action: 'trade',
        targetPlayerId: richestPlayer.id,
        propertiesOffer: [cheapProperty.id],
        cashOffer: Math.floor((cheapProperty.property.price || 0) * 1.2) // 가격의 120%
      }
    }

    return null
  }

  /**
   * AI 플레이어 자동 턴 실행 지연 시간
   */
  getActionDelay(): number {
    switch (this.difficulty) {
      case 'easy':
        return 2000 // 2초
      case 'normal':
        return 1500 // 1.5초
      case 'hard':
        return 1000 // 1초
      default:
        return 1500
    }
  }
}
