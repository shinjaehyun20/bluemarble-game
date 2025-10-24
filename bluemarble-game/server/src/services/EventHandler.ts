import type { GameState, Player } from './types'

export class EventHandler {
  // 복지기금 풀
  private welfareFund = 0

  handleGoldenKey(state: GameState, player: Player, cardId: number) {
    const card = this.getCardById(cardId)
    if (!card) return

    switch (card.type) {
      case 'move-start':
        player.position = 0
        player.cash += 200000
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 출발점 이동(+20만원)` })
        break
      case 'move-back-3':
        player.position = Math.max(0, player.position - 3)
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 3칸 뒤로` })
        break
      case 'bonus':
        player.cash += card.amount || 0
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: +${(card.amount || 0) / 10000}만원` })
        break
      case 'fine':
        player.cash -= card.amount || 0
        this.welfareFund += card.amount || 0
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: -${(card.amount || 0) / 10000}만원` })
        break
      case 'move-forward-2':
        player.position = (player.position + 2) % state.board.length
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 2칸 앞으로` })
        break
      case 'move-forward-5':
        player.position = (player.position + 5) % state.board.length
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 5칸 앞으로` })
        break
      case 'escape-island':
        if (player.inIsland) {
          player.inIsland = 0
          state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 무인도 탈출!` })
        }
        break
      case 'teleport':
        player.position = card.to || 20
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: ${card.to}번 칸으로 이동` })
        break
      case 'salary-bonus':
        player.cash += card.amount || 0
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 특별 보너스 +${(card.amount || 0) / 10000}만원` })
        break
      case 'welfare-collect':
        player.cash += this.welfareFund
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 복지기금 ${this.welfareFund / 10000}만원 획득` })
        this.welfareFund = 0
        break
      case 'random-tax':
        player.cash -= card.amount || 0
        this.welfareFund += card.amount || 0
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: 특별세 -${(card.amount || 0) / 10000}만원` })
        break
      default:
        state.log.unshift({ timestamp: Date.now(), message: `${player.name} 황금열쇠: ${card.text}` })
    }
  }

  getWelfareFund() { return this.welfareFund }
  addToWelfareFund(amount: number) { this.welfareFund += amount }

  private getCardById(id: number) {
    const cards = [
      { id: 1, type: 'move-start', text: '출발점으로 이동(+20만원)' },
      { id: 2, type: 'move-back-3', text: '3칸 뒤로 이동' },
      { id: 3, type: 'bonus', amount: 100000, text: '복권 당첨 +10만원' },
      { id: 4, type: 'fine', amount: 50000, text: '벌금 -5만원' },
      { id: 5, type: 'move-forward-2', text: '2칸 앞으로 이동' },
      { id: 6, type: 'move-forward-5', text: '5칸 앞으로 이동' },
      { id: 7, type: 'escape-island', text: '무인도 탈출권' },
      { id: 8, type: 'bonus', amount: 80000, text: '세금 환급 +8만원' },
      { id: 9, type: 'fine', amount: 20000, text: '건물 유지비 -2만원' },
      { id: 10, type: 'bonus', amount: 30000, text: '선물 +3만원' },
      { id: 11, type: 'fine', amount: 40000, text: '기부 -4만원' },
      { id: 12, type: 'teleport', to: 20, text: '우주여행으로 이동' },
      { id: 13, type: 'bonus', amount: 150000, text: '럭키데이 +15만원' },
      { id: 14, type: 'fine', amount: 150000, text: '언럭키데이 -15만원' },
      { id: 15, type: 'salary-bonus', amount: 200000, text: '특별 보너스 월급 +20만원' },
      { id: 16, type: 'random-tax', amount: 70000, text: '특별세 -7만원' },
      { id: 17, type: 'welfare-collect', text: '복지기금 전액 수령' },
      { id: 18, type: 'bonus', amount: 50000, text: '이자 수익 +5만원' },
      { id: 19, type: 'fine', amount: 60000, text: '과태료 -6만원' },
      { id: 20, type: 'bonus', amount: 100000, text: '보험 환급 +10만원' }
    ]
    return cards.find(c => c.id === id)
  }
}
