import shogi from './shogi.js'

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

const STARTPOS='lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1'

const tokenSpecs = [
    ['count', '\\d+'],
    ['piece', '\\+?[a-zA-Z]'],
    ['undef', '.']
]
const tokenReg = tokenSpecs.map(e => '(' + e[1] + ')').join('|')
const re = new RegExp(tokenReg, 'ug')

const parseSquare = function (text) {
  const tokens = []
  for (const [rank, t] of text.split('/').entries()) {
    const row = []
    let m
    while ((m = re.exec(t)) != null) {
      const kind = tokenSpecs.find((e, i) => m[i + 1] !== undefined)[0]
      const value = m[0]
      if (kind === 'piece') {
        let piece
        if (value === value.toUpperCase()) {
          piece = new shogi.Piece(pieceTypeMap[value], shogi.BLACK)
        } else {
          piece = new shogi.Piece(pieceTypeMap[value.toUpperCase()], shogi.WHITE)
        }
        row.push(piece)
      } else if (kind === 'count') {
        for (let i = 0; i < parseInt(value); i++) {
          row.push(null)
        }
      } else {
        //throw 'unknown token'
      }
    }
    for (const [file, piece] of row.reverse().entries()) {
      const coords = new shogi.Coords(file + 1, rank + 1)
      tokens.push({
        coords: coords,
        piece: piece
      })
    }
  }
  return tokens
}

const parseInHand = function (text) {
  const tokens = []
  let n = 1
  let m
  while ((m = re.exec(text)) != null) {
    const kind = tokenSpecs.find((e, i) => m[i + 1] !== undefined)[0]
    const value = m[0]
    if (kind === 'count') {
      n = parseInt(value)
    } else if (kind === 'piece') {
      const color = (value === value.toUpperCase()) ? shogi.BLACK : shogi.WHITE
      tokens.push({
        color: color,
        pieceType: pieceTypeMap[value.toUpperCase()],
        count: n
      })
      n = 1
    } else {
      throw 'unknown token'
    }
  }
  return tokens
}

const parse = function (text) {
  const p = new shogi.Position()
  const t = text.split(/\s+/)
  for (const c of parseSquare(t[0])) {
    p.setSquare(c.coords, c.piece)
    if (c.coords.file > p.nFiles) {
      p.nFiles = c.coords.file
    }
    if (c.coords.rank > p.nRanks) {
      p.nRanks = c.coords.rank
    }
  }
  if (t.length < 2) {
    return p
  }
  p.turn = {'b': shogi.BLACK, 'w': shogi.WHITE}[t[1]]
  if (t.length < 3 || t[2] === '-') {
    p.step = 0
    return p
  }
  for (const s of parseInHand(t[2])) {
    p.setInHand(s.color, s.pieceType, s.count)
  }
  if (t.length < 4) {
    p.step = 0
  } else {
    p.step = parseInt(t[3]) - 1
  }
  return p 
}

export default {
  STARTPOS,
  parse
}
