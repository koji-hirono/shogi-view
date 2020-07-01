const BLACK = "black"
const WHITE = "white"

const DROP = "drop"
const PROMOTE = "promote"
const NOTPROMOTE = "notpromote"

const SAME = "same"

function abs(x) {
  return x < 0 ? -x : x
}

const Pawn = {
  ident: 'P',
  promote: function () {
    return PromotedPawn
  },
  isReachable: function (dx, dy) {
    return dx === 0 && dy === 1
  }
}

const Lance = {
  ident: 'L',
  promote: function () {
    return PromotedLance
  },
  isReachable: function (dx, dy) {
    return dx === 0 && dy > 0
  }
}

const Knight = {
  ident: 'N',
  promote: function () {
    return PromotedKnight
  },
  isReachable: function (dx, dy) {
    return abs(dx) === 1 && dy === 2
  }
}

const Silver = {
  ident: 'S',
  promote: function () {
    return PromotedSilver
  },
  isReachable: function (dx, dy) {
    return (abs(dx) === abs(dy) && abs(dx) === 1) || Pawn.isReachable(dx, dy)
  }
}

const Gold = {
  ident: 'G',
  isReachable: function (dx, dy) {
    return (dx === 0 && abs(dy) === 1) || (abs(dx) === 1 && dy in [0, 1])
  }
}

const Bishop = {
  ident: 'B',
  promote: function () {
    return PromotedBishop
  },
  isReachable: function (dx, dy) {
    return abs(dx) === abs(dy)
  }
}

const Rook = {
  ident: 'R',
  promote: function () {
    return PromotedRook
  },
  isReachable: function (dx, dy) {
    return dx === 0 || dy === 0
  }
}

const King = {
  ident: 'K',
  isReachable: function (dx, dy) {
    return abs(dx) <= 1 && abs(dy) <= 1
  }
}

const PromotedPawn = {
  ident: '+P',
  demote: function () {
    return Pawn
  },
  isReachable: function (dx, dy) {
    return Gold.isReachable(dx, dy)
  }
}

const PromotedLance = {
  ident: '+L',
  demote: function () {
    return Lance
  },
  isReachable: function (dx, dy) {
    return Gold.isReachable(dx, dy)
  }
}

const PromotedKnight = {
  ident: '+N',
  demote: function () {
    return Knight
  },
  isReachable: function (dx, dy) {
    return Gold.isReachable(dx, dy)
  }
}

const PromotedSilver = {
  ident: '+S',
  demote: function () {
    return Silver
  },
  isReachable: function (dx, dy) {
    return Gold.isReachable(dx, dy)
  }
}

const PromotedBishop = {
  ident: '+B',
  demote: function () {
    return Bishop
  },
  isReachable: function (dx, dy) {
    return Bishop.isReachable(dx, dy) || King.isReachable(dx, dy)
  }
}

const PromotedRook = {
  ident: '+R',
  demote: function () {
    return Rook
  },
  isReachable: function (dx, dy) {
    return Rook.isReachable(dx, dy) || King.isReachable(dx, dy)
  }
}


class Piece {
  constructor(pieceType, color) {
    this.pieceType = pieceType
    this.color = color
  }

  promote() {
    if (this.pieceType.promote) {
      return new Piece(this.pieceType.promote(), this.color)
    } else {
      return this
    }
  }

  demote() {
    if (this.pieceType.demote) {
      return new Piece(this.pieceType.demote(), this.color)
    } else {
      return this
    }
  }

  isReachable(dst, src) {
    let dx, dy
    if (this.color === BLACK) {
      dx = src.file - dst.file
      dy = src.rank - dst.rank
    } else {
      dx = dst.file - src.file
      dy = dst.rank - src.rank
    }
    return this.pieceType.isReachable(dx, dy)
  }
}

class Coords {
  constructor(file, rank) {
    this.file = file
    this.rank = rank
  }
}

class Move {
  constructor(color, dst, src=null, pieceType=null, kwargs) {
    this.color = color
    this.pieceType = pieceType
    this.dst = dst
    this.src = src
    this.movement = kwargs.movement
    this.relative = kwargs.relative
    this.modifier = kwargs.modifier
    this.capture = null
  }

  isDrop() {
    return this.modifier === DROP
  }

  isPromote() {
    return this.modifier === PROMOTE
  }
}

class Position {
  constructor() {
    this.nFiles = 0
    this.nRanks = 0
    this.square = {}
    this.inHand = {}
    this.turn = null
    this.step = null
  }

  setSquare(coords, piece) {
    if (!(coords.file in this.square)) {
      this.square[coords.file] = {}
    }
    this.square[coords.file][coords.rank] = piece
  }

  getSquare(coords) {
    if (!(coords.file in this.square)) {
      return null
    }
    return this.square[coords.file][coords.rank]
  }

  putSquare(coords, piece) {
    const p = this.getSquare(coords)
    if (!(coords.file in this.square)) {
      this.square[coords.file] = {}
    }
    this.square[coords.file][coords.rank] = piece
    return p
  }

  takeSquare(coords) {
    return this.putSquare(coords, null)
  }

  setInHand(color, pieceType, n) {
    if (!(color in this.inHand)) {
      this.inHand[color] = {}
    }
    this.inHand[color][pieceType.ident] = n
  }

  getInHand(color, pieceType) {
    if (color in this.inHand) {
      if (pieceType.ident in this.inHand[color]) {
        return this.inHand[color][pieceType.ident]
      }
    }
    return 0
  }

  putInHand(color, pieceType) {
    if (!(color in this.inHand)) {
      this.inHand[color] = {}
    }
    if (!(pieceType.ident in this.inHand[color])) {
      this.inHand[color][pieceType.ident] = 0
    }
    this.inHand[color][pieceType.ident] += 1
  }

  takeInHand(color, pieceType) {
    if (!(color in this.inHand)) {
      this.inHand[color] = {}
    }
    if (!(pieceType.ident in this.inHand[color])) {
      this.inHand[color][pieceType.ident] = 0
    }
    this.inHand[color][pieceType.ident] -= 1
    return new Piece(pieceType, color)
  }

  nextTurn() {
    if (this.turn === BLACK) {
      this.turn = WHITE
    } else {
      this.turn = BLACK
    }
  }

  prevTurn() {
    if (this.turn === BLACK) {
      this.turn = WHITE
    } else {
      this.turn = BLACK
    }
  }
}

class Movelog {
  constructor() {
    this.data = [null]
  }

  load(parsed) {
    this.data = [null]
    for (const move of parsed) {
      this.data.push(move)
    }
  }

  normalize(position) {
    let prevDst = null
    for (let move of this.data) {
      if (move === null) {
        position.step += 1
        continue
      }
      if (move.dst === SAME) {
        move.dst = prevDst
      }
      let piece
      if (move.isDrop()) {
        piece = position.takeInHand(position.turn, move.pieceType)
      } else if (move.src) {
        piece = position.takeSquare(move.src)
        move.pieceType = piece.pieceType
      } else {
        // TODO
      }

      if (move.isPromote()) {
        piece = piece.promote()
      }
      move.capture = position.putSquare(move.dst, piece)
      if (move.capture) {
        let pieceType = move.capture.pieceType
        if (pieceType.demote) {
          pieceType = pieceType.demote()
        }
        position.putInHand(position.turn, pieceType)
      }
      position.nextTurn()
      position.step += 1
      prevDst = move.dst
    }
  }

  forward(position, d) {
    const start = position.step + 1
    const end = start + d
    if (end > this.data.length) {
      return
    }
    for (let move of this.data.slice(start, end)) {
      if (move === null) {
        continue
      }
      let piece
      if (move.src) {
        piece = position.takeSquare(move.src)
      } else {
        piece = position.takeInHand(position.turn, move.pieceType)
      }
      if (move.isPromote()) {
        piece = piece.promote()
      }
      position.putSquare(move.dst, piece)
      if (move.capture) {
        let pieceType = move.capture.pieceType
        if (pieceType.demote) {
          pieceType = pieceType.demote()
        }
        position.putInHand(position.turn, pieceType)
      }
      position.nextTurn()
    }
    position.step += d
  }

  back(position, d) {
    const start = position.step
    const end = start - d
    if (end < 0) {
      return
    }
    for (let move of this.data.slice(end + 1, start + 1).reverse()) {
      position.prevTurn()
      let piece = position.takeSquare(move.dst)
      if (move.isPromote()) {
        piece = piece.demote()
      }
      if (move.src) {
        position.putSquare(move.src, piece)
      } else {
        position.putInHand(position.turn, move.pieceType)
      }
      position.putSquare(move.dst, move.capture)
      if (move.capture) {
        let pieceType = move.capture.pieceType
        if (pieceType.demote) {
          pieceType = pieceType.demote()
        }
        position.takeInHand(position.turn, pieceType)
      }
    }
    position.step -= d
  }

  at(position, n) {
    const cur = position.step
    if (n > cur) {
      this.forward(position, n - cur)
    } else {
      this.back(position, cur - n)
    }
  }
}

export default {
  BLACK,
  WHITE,
  DROP,
  PROMOTE,
  NOTPROMOTE,
  SAME,
  Pawn,
  Lance,
  Knight,
  Silver,
  Gold,
  Bishop,
  Rook,
  King,
  PromotedPawn,
  PromotedLance,
  PromotedKnight,
  PromotedSilver,
  PromotedBishop,
  PromotedRook,
  Piece,
  Coords,
  Move,
  Position,
  Movelog
}
