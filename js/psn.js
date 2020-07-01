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
  let step = 0
  for (let line of text.match(/[^\n]*(\n|$)/g)) {
    line = line.trim()
    if (line === '') {
      continue
    }
    if (line[0] === '[') {
      continue
    }
    for (let token of line.split(/\s+/g)) {
      if (token.endsWith('.')) {
        continue
      } else if (token[0].match(/^\d+$/)) {
        continue
      } else if (token[0] === '+') {
        token = token.slice(1)
      }
      if (token[1] === '*') {
        const dst = new shogi.Coords(parseInt(token[2]), RANKNUM[token[3]])
        movelog.push(new shogi.Move(
          color[step & 1],
          dst,
          null,
          pieceTypeMap[token[0]],
          {modifier: shogi.DROP}))
      } else {
        const src = new shogi.Coords(parseInt(token[1]), RANKNUM[token[2]])
        const dst = new shogi.Coords(parseInt(token[4]), RANKNUM[token[5]])
        const modifier = (token.endsWith('+')) ? shogi.PROMOTE : null
        movelog.push(new shogi.Move(
          color[step & 1],
          dst,
          src,
          null,
          {modifier: modifier}))
      }
      step++;
    }
  }
  return movelog
}

export default {
  decoder
}
