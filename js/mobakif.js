import shogi from './shogi.js'

const RANKNUM = {
  '一': 1,
  '二': 2,
  '三': 3,
  '四': 4,
  '五': 5,
  '六': 6,
  '七': 7,
  '八': 8,
  '九': 9
}

const PIECETYPE = {
    '歩': shogi.Pawn,
    '香': shogi.Lance,
    '桂': shogi.Knight,
    '銀': shogi.Silver,
    '金': shogi.Gold,
    '角': shogi.Bishop,
    '飛': shogi.Rook,
    '王': shogi.King,
    '玉': shogi.King,
    'と': shogi.PromotedPawn,
    '成香': shogi.PromotedLance,
    '成桂': shogi.PromotedKnight,
    '成銀': shogi.PromotedSilver,
    '馬': shogi.PromotedBishop,
    '竜': shogi.PromotedRook,
    '龍': shogi.PromotedRook 
}

const COLOR = {
    '▲': shogi.BLACK,
    '△': shogi.WHITE
}

const decoder = function (text) {
  const movelog = []
  for (let line of text.match(/[^\n]*(\n|$)/ug)) {
    line = line.trim()
    if (line === '') {
      continue
    }
    let m = line.match(/^\s*\d+\.\s+(.+)/u)
    if (!m) {
      continue
    }
    const token = m[1]
    const color = COLOR[token[0]]
    let dst
    if (token[1] === '同') {
      dst = shogi.SAME
    } else {
      dst = new shogi.Coords(parseInt(token[1]), RANKNUM[token[2]])
    }

    let src
    let modifier
    let pieceType
    m = token.match(/(成)?\((\d)(\d)\)$/u)
    if (m) {
      src = new shogi.Coords(parseInt(m[2]), parseInt(m[3]))
      if (m[1] === '成') {
        modifier = shogi.PROMOTE
      } else {
        modifier = null
      }
      pieceType = null
    } else {
      src = null
      modifier = shogi.DROP
      pieceType = PIECETYPE[token[3]]
    }

    movelog.push(
      new shogi.Move(color, dst, src, pieceType, {modifier: modifier})
    )
  }

  return movelog
}

export default {
  decoder
}
