import type { GameState } from './types'

export interface TradeOffer {
  id: string
  fromPlayerId: string
  toPlayerId: string
  fromCash: number
  toCash: number
  fromProperties: number[] // property IDs
  toProperties: number[] // property IDs
  status: 'pending' | 'accepted' | 'rejected'
  timestamp: number
}

export class TradeManager {
  private trades: Map<string, TradeOffer> = new Map()

  proposeTrade(
    tradeId: string,
    fromPlayerId: string,
    toPlayerId: string,
    fromCash: number,
    toCash: number,
    fromProperties: number[],
    toProperties: number[]
  ): { ok: true; offer: TradeOffer } | { ok: false; message: string } {
    const offer: TradeOffer = {
      id: tradeId,
      fromPlayerId,
      toPlayerId,
      fromCash,
      toCash,
      fromProperties,
      toProperties,
      status: 'pending',
      timestamp: Date.now()
    }
    this.trades.set(tradeId, offer)
    return { ok: true, offer }
  }

  acceptTrade(
    state: GameState,
    tradeId: string
  ): { ok: true; state: GameState } | { ok: false; message: string } {
    const offer = this.trades.get(tradeId)
    if (!offer) return { ok: false, message: '거래가 존재하지 않습니다' }
    if (offer.status !== 'pending') return { ok: false, message: '이미 처리된 거래입니다' }

    const fromPlayer = state.players.find(p => p.id === offer.fromPlayerId)
    const toPlayer = state.players.find(p => p.id === offer.toPlayerId)
    if (!fromPlayer || !toPlayer) return { ok: false, message: '플레이어를 찾을 수 없습니다' }

    // 자금 확인
    if (fromPlayer.cash < offer.fromCash) return { ok: false, message: `${fromPlayer.name}의 자금 부족` }
    if (toPlayer.cash < offer.toCash) return { ok: false, message: `${toPlayer.name}의 자금 부족` }

    // 소유권 확인
    for (const propId of offer.fromProperties) {
      const cell = state.board.find(c => c.id === propId)
      if (cell?.type !== 'property' || cell.property?.owner !== fromPlayer.id) {
        return { ok: false, message: `${fromPlayer.name}이(가) 소유하지 않은 부동산` }
      }
    }
    for (const propId of offer.toProperties) {
      const cell = state.board.find(c => c.id === propId)
      if (cell?.type !== 'property' || cell.property?.owner !== toPlayer.id) {
        return { ok: false, message: `${toPlayer.name}이(가) 소유하지 않은 부동산` }
      }
    }

    // 거래 실행
    fromPlayer.cash -= offer.fromCash
    fromPlayer.cash += offer.toCash
    toPlayer.cash += offer.fromCash
    toPlayer.cash -= offer.toCash

    for (const propId of offer.fromProperties) {
      const cell = state.board.find(c => c.id === propId)
      if (cell?.type === 'property' && cell.property) {
        cell.property.owner = toPlayer.id
      }
    }
    for (const propId of offer.toProperties) {
      const cell = state.board.find(c => c.id === propId)
      if (cell?.type === 'property' && cell.property) {
        cell.property.owner = fromPlayer.id
      }
    }

    offer.status = 'accepted'

    const fromCashText = offer.fromCash > 0 ? `${offer.fromCash / 10000}만원` : ''
    const toCashText = offer.toCash > 0 ? `${offer.toCash / 10000}만원` : ''
    const fromPropsText = offer.fromProperties.length > 0 ? `부동산 ${offer.fromProperties.length}건` : ''
    const toPropsText = offer.toProperties.length > 0 ? `부동산 ${offer.toProperties.length}건` : ''

    const fromGives = [fromCashText, fromPropsText].filter(Boolean).join(', ')
    const toGives = [toCashText, toPropsText].filter(Boolean).join(', ')

    state.log.unshift({
      timestamp: Date.now(),
      message: `거래 성사: ${fromPlayer.name}(${fromGives}) ↔ ${toPlayer.name}(${toGives})`
    })

    return { ok: true, state }
  }

  rejectTrade(tradeId: string): { ok: true } | { ok: false; message: string } {
    const offer = this.trades.get(tradeId)
    if (!offer) return { ok: false, message: '거래가 존재하지 않습니다' }
    if (offer.status !== 'pending') return { ok: false, message: '이미 처리된 거래입니다' }
    offer.status = 'rejected'
    return { ok: true }
  }

  getPendingTrades(playerId: string): TradeOffer[] {
    return Array.from(this.trades.values()).filter(
      t => t.status === 'pending' && (t.fromPlayerId === playerId || t.toPlayerId === playerId)
    )
  }
}
