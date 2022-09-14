
//遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]

//mvc


const model = {
  //翻開的卡片集中管理
  revealedCards: [

  ],
  //比較是否相等 相等回傳ture
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0
}

const view = {
  //取得已配對卡片
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  //取得背面卡片
  getCardElement(index) {
    //data綁定index才能翻到背面           
    return `<div data-index="${index}" class="card back"></div>`
  },

  //取得正面卡片
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
    `
  },

  //特殊字符轉換
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  //渲染卡片
  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    //放入1-52隨機順序的陣列再map
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  //翻牌函式
  flipCards(...cards) {
    //map迭帶
    cards.map(card => {
      //背面才翻牌
      if (card.classList.contains('back')) {
        // 去除背面
        card.classList.remove('back')
        //回傳正面,字串要改成數字
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  //計分函式  
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  //計次函式
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },
  //配對失敗動畫
  appendWrongAnimation(...cards) {
    cards.map(card => {
      //失敗便跑動畫
      card.classList.add('wrong')
      //跑完動畫後拿掉    一次就拿掉
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },
  //通關畫面
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const controller = {
  //等待翻開第一張卡片
  currentState: GAME_STATE.FirstCardAwaits,
  // 產生卡片
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    //switch判斷
    switch (this.currentState) {
      //翻第一張卡片
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
      //翻第二張卡片
      case GAME_STATE.SecondCardAwaits:
        //計次
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          //計分
          view.renderScore(model.score += 10)
          // 配對成功
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []

          //通關畫面
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits

        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          //跑失敗動畫
          view.appendWrongAnimation(...model.revealedCards)
          //帶入重製卡片
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  //重置卡片函式
  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }
}

const utility = {
  //亂數洗牌函式
  getRandomNumberArray(count) {
    //生成1-52排序的連續陣列
    const number = Array.from(Array(count).keys())
    //迴圈從52到1
    for (let index = number.length - 1; index > 0; index--) {
      //決定這張牌要跟前面的誰交換
      let randomIndex = Math.floor(Math.random() * (index + 1))

        //結構賦值
        //  最後一張牌      挑中交換的牌               交換過程
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


controller.generateCards()
//牌面監聽器
document.querySelectorAll('.card').forEach(card => {
  //點擊
  card.addEventListener('click', event => {
    //翻面
    controller.dispatchCardAction(card)
  })
})


