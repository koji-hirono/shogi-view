import shogi from './shogi.js'

const RANKNUM = {
  'a': 1,
  'b': 2,
  'c': 3,
  'd': 4,
  'e': 5,
  'f': 6,
  'g': 7,
  'h': 8,
  'i': 9
}

const pieceTypeMap = {
  'P': shogi.Pawn,
  'L': shogi.Lance,
  'N': shogi.Knight,
  'S': shogi.Silver,
  'G': shogi.Gold,
  'B': shogi.Bishop,
  'R': shogi.Rook,
  'K': shogi.King,
  '+P': shogi.PromotedPawn,
  '+L': shogi.PromotedLance,
  '+N': shogi.PromotedKnight,
  '+S': shogi.PromotedSilver,
  '+B': shogi.PromotedBishop,
  '+R': shogi.PromotedRook
}

const decoder = function (text) {
  const color = [shogi.BLACK, shogi.WHITE]
  const movelog = []
  const n = text.length
  let pos = 0
  let step = 0
  while (pos < n) {
    if ('RBGSNLP'.includes(text[pos])) {
      const dst = new shogi.Coords(parseInt(text[pos+1]), RANKNUM[text[pos+2]])
      movelog.push(new shogi.Move(
        color[step & 1],
        dst,
        null,
        pieceTypeMap[text[pos]],
        {modifier: shogi.DROP}))
      pos += 3
    } else {
      const src = new shogi.Coords(parseInt(text[pos]), RANKNUM[text[pos+1]])
      const dst = new shogi.Coords(parseInt(text[pos+2]), RANKNUM[text[pos+3]])
      let modifier
      if (text[pos+4] === 'p') {
        modifier = shogi.PROMOTE
        pos += 5
      } else {
        modifier = null
        pos += 4
      }
      movelog.push(new shogi.Move(
        color[step & 1],
        dst,
        src,
        null,
        {modifier: modifier}))
    }
    step++
  }
  return movelog
}

export default {
  decoder
}
