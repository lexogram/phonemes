/** script.js **
 *
 *
**/


// GENERIC METHODS // GENERIC METHODS // GENERIC METHODS //

function empty(element) {
  while (element.hasChildNodes()) {
    element.removeChild(element.lastChild);
  }
}



;(function scriptLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }



  // CLASSES // CLASSES // CLASSES // CLASSES // CLASSES // CLASSES //


  class Funetics {
    constructor(data) {
      this.feedback = new Feedback()

      let callback = this.feedback.show.bind(this.feedback)
      this.wordData = new WordData(data, callback)

      let boardDiv = document.body.querySelector(".board")
      this.board   = new Board(boardDiv)

      // Exchange interfaces
      callback = this.board.showTiles.bind(this.board)
      this.wordData.setInterface(callback)

      callback = this.wordData.getCallbacks()
      // { getNextWord: <function>
      // , checkWord: <function> }
      this.board.setInterface(callback)

      // { getNextWord: <function>
      // , checkWord: <function>
      // , showStatus: <function> }
      this.feedback.setInterface(callback)

      callback.getNextWord()
    }


    destroy() {
      this.board.setInterface(null)
      this.wordData.setInterface(null)
    }
  }



  class Feedback {
    constructor() {
      // this.showStatus
    }


    setInterface(callbacks) {
      this.showStatus = callbacks.showStatus
    }


    show(status, word, ipa) {
      if (status) {
        console.log(
          "Feedback — status: " + status
        + ", word: '" + word
        + "', ipa: /" + ipa + "/"
        )
      }

      this.showStatus(status, word, ipa)
    }
  }



  class WordData {
    constructor(data, feedback) {
      this.data = data
      this.feedback = feedback

      // this.wordData
      // this.bestLength
      // this.misses
    }


    setInterface(callback) {
      this.callback = callback
    }


    getCallbacks() {
      return {
        getNextWord: this.getNextWord.bind(this)
      , checkWord: this.checkWord.bind(this)
      }
    }


    getNextWord(word) {
      //// <<< HARD-CODED
      word ? null : word = "clanger" // "cleave" //
      //// HARD-CODED >>>>

      this.bestLength = word.length
      this.wordData = this.data[word]
      this.misses = Object.keys(this.wordData.miss)
      this.callback(this.wordData)
    }


    checkWord(word, ipa) {
      let anagram = this.wordData.anagram
      let stripped = word.replace(" ", "")

      stripped = word === stripped
               ? false
               : !!(word = stripped) // word has no spaces; true

      let status = anagram.alphabet.indexOf(word)
      let temp

      if (status > -1) {
        ipa = anagram.ipa[status]
        temp = anagram.url[status]

        if (word.length === this.bestLength) {
          status = "best"
        } else {
          status = "good"
        }

      } else if (temp = this.wordData.miss[word]) {
        ipa = temp
        status = !stripped && "word"

      } else if (word = this.wordData.miss[ipa]) {
        status = !stripped && "sound"

      } else {
        status = false
      }

      if (stripped && status) {
        status = "strip"
      }

      this.feedback(status, word, ipa)

      return status
    }
  }



  class Board {
    constructor(board){
      this.board = board

      this.wordRail = new lx.Word(board)
      this.dockRail = new lx.Dock(board)
      this.tileFactory  = new TileFactory(board)

      // this.getNextWord => WordData.getNextWord

      this._listenForEvents()
    }


    setInterface(callbacks) {
      this.getNextWord = callbacks.getNextWord
      this.wordRail.setInterface(callbacks.checkWord)

      Object.assign(callbacks, {
        showTiles: this.showTiles.bind(this)
      , showStatus: this.showStatus.bind(this)
      })
    }


    resized(event) {
      this._updatePositions()
    }


    startDrag(event) {
      let tile = this._extractTile(event)
      if (!tile) {
        return
      }

      this.movingTile = new TileMove(tile, event, this.dockRail, this.wordRail)
    }


    showTiles(wordData) {
      this.tileFactory.generateTiles(wordData)

      this.tiles = this.tileFactory.tiles
      let charCount = this.tileFactory.charCount

      empty(this.board)
      this.dockRail.initialize(this.tiles, charCount)
      this.wordRail.initialize(charCount)

      this._updatePositions()
    }


    showStatus(status, word, ipa) {

      this.tiles.forEach((tile) => {
        tile.classList.remove("best","good","word","sound","strip")

        if (status && tile.tileData.inWord) {
          tile.classList.add(status)
        }
      })
    }


    _listenForEvents() {
      let listener = this.startDrag.bind(this)
      document.body.onmousedown = listener

      listener = this.resized.bind(this)
      lx.helpers.registerListener("resize", listener)
    }


    _updatePositions(tiles) {
      if (!tiles) {
        tiles = this.tileFactory.tiles
      }

      let height    = this.board.getBoundingClientRect()
      let width     = height.width
      height        = height.height

      let tileCount = tiles.length
      let charCount = this.tileFactory.charCount
      let places    = charCount + 2

      let charSize  = Math.min(height / 4, width / places)
      let gapSize   = (charSize * 2) / (tileCount + 1)

      let dockLeft  = (width - (charCount * charSize)
                             - ((tileCount - 1) * gapSize))
                      / 2

      document.body.style = "font-size:" + charSize + "px;"

      this.dockRail.preparePositions(charSize, gapSize, dockLeft)
      this.wordRail.preparePositions(charSize, charCount)

      this._positionTiles(tiles, gapSize, charSize)
    }


    _positionTiles(tiles) { //, gapSize, charSize) {
      tiles.forEach((tile) => {
        this.board.appendChild(tile)

        if (tile.tileData.inWord) {
          this.wordRail.setTilePosition(tile)
        } else {
          this.dockRail.setTilePosition(tile)
        }
      })
    }


    //// INTERACTIONS ////

    _extractTile(event) {
      let tile = event.target

      while (tile && !tile.classList.contains("tile-set")) {
        if (tile.tagName === "HTML") {
          tile = null
          break
        }

        tile = tile.parentNode
      }

      return tile
    }
  }



  class TileFactory {
    constructor(board) {
      this.board = board

      this.wordData = {}
      this.tiles = []

      // this.phonemes
      // this.strings
      // this.charCount
    }


    generateTiles(wordData) {
      this.wordData = wordData
      this.tiles.length = 0

      this.phonemes = this.wordData.phonemes
      this.strings  = this.phonemes[0].split("|")
      this.phonemes = this.phonemes[1].split("|")

      // Words like "anger" and "eighth" will have more than one
      // `char` for the letters that contribute to 2 phonemes
      let word = this.strings.join("") // lea.ev ang––ger rang—e

      // Filter out:
      // * . : space between vowels for consonants
      // * - : used to split a single consonant into two phonemes
      // * — : used to indicate that a 'c' or a 'g' is softened by
      //       a following 'e' or 'i'

      word = word.split(/[.–—]/).join("") // leaev angger range
      this.charCount = word.length
      let tileCount = this.strings.length

      let tile
        , string

      for ( let ii = 0; ii < tileCount; ii += 1 ) {
        string = this.strings[ii].replace(/[–—ˈˌ]/, "")

        tile = this._createTile(string, this.phonemes[ii])
        tile.tileData = {
          charCount: string.length
        }

        this.tiles.push(tile)
      }

      this._shuffle(this.tiles)

      return this.tiles
    }


    _createTile(string, phoneme) {
      // console.log(string, phoneme)
      if (string.indexOf(".") < 0) {
        // if (string.indexOf("–") < 0) {
          return this._createSolidTile(string, phoneme)
        // }

        // return this._createDoubleTile(string, phoneme)

      } else {
        return this._createSplitTile(string, phoneme)
      }
    }


    _createSolidTile(string, phoneme) {
      let tile = document.createElement("div")
      tile.classList.add("tile-set")

      let subTile = this._tileChunk(string)
      tile.appendChild(subTile)

      this._addPhoneme(tile, phoneme)

      return tile
    }


    _createSplitTile(string, phoneme) {
      let tile = document.createElement("div")
      tile.classList.add("tile-set")

      let index = string.indexOf(".")
      let subtiles = string.split(".")

      subtiles.forEach((string) => {
        let subTile = this._tileChunk(string)
        tile.appendChild(subTile)
      })

      this._addPhoneme(tile, phoneme)

      let divider = document.createElement("div")
      divider.classList.add("divider")
      divider.style = "left:" + (index - 0.1) + "em;"
      tile.appendChild(divider)

      return tile
    }


    _tileChunk(chars) {
      let tile = document.createElement("div")
      tile.classList.add("tile")

      chars = chars.split("")
      let span

      chars.forEach((char) => {
        span = document.createElement("span")
        span.classList.add("string", "plain")
        span.innerHTML = char
        tile.appendChild(span)
      })

      // if (string[string.length - 1] === "–") {
      //   span.classList.add("last", "half")
      // }

      // switch (string[0]) {
      //   case "–":
      //     tile.firstChild.classList.add("first", "half")
      //   break
      //   case "—":
      //     tile.firstChild.classList.add("soften")
      //   break
      // }

      return tile
    }


    _addPhoneme(tile, phoneme) {
      phoneme = phoneme.replace(/(\(.+\))/
      , "<span class='faint'>$1</span>")

      let span = document.createElement("span")
      span.classList.add("phoneme")
      span.innerHTML = phoneme
      tile.appendChild(span)
    }


    _shuffle(array) {

    }
  }



  class TileMove {
    constructor (tile, event, dock, word, checkWord) {
      this.tile = tile
      this._setOffset(tile, event)
      this.dock = dock
      this.word = word
      this.checkWord = checkWord

      this.word.checkIfTileIsOnRail(tile)

      // console.log("Tile is on rail?", tile.tileData.fromWord)

      this.tile.style.zIndex = "99"
      this.moved = false

      document.body.onmousemove = this.moveTile.bind(this)
      document.body.onmouseup = this.stopDrag.bind(this)
    }


    moveTile(event) {
      this.moved = true

      let x = event.pageX
      let y = event.pageY

      let railPoint = this.word.mapToRail(this.tile, x, y)
      let dragPoint = this._getDragPoint(this.tile, x, y)
      this.tile.tileData.inWord = !!railPoint

      if (railPoint) {
        this.word.moveTile(this.tile, dragPoint, x, y)

      } else {
        this.word.removeFromMap(this.tile, true)

        if (railPoint = this.dock.mapToRail(this.tile, x, y)) {
        this.dock.moveTile(this.tile, railPoint)

        } else {
          this._moveOnBoard(dragPoint)
        }
      }
    }


    stopDrag() {
      if (!this.moved) {
        if (!this.tile.tileData.inWord) {
          this.word.findFirstEmptyPlaceFor(this.tile)
        }

      } else if (this.tile.tileData.inWord) {
        this.word.updateTiles()

      } else {
        this.word.removeFromMap(this.tile, "removeFromWord")
        this.dock.setTilePosition(this.tile)
      }

      this.tile.style.removeProperty("z-index")
      this.word.checkWord()

      this._destroy()
    }


    _moveOnBoard(dragPoint) {
      this.tile.style.left = dragPoint.x + "px"
      this.tile.style.top  = dragPoint.y + "px"
      this.tile.style.removeProperty("bottom")
    }


    // UTILITIES // UTILITIES // UTILITIES // UTILITIES // UTILITIES /

    _setOffset(tile, event) {
      let rect = tile.getBoundingClientRect()

      tile.tileData.offsetX = rect.left - event.pageX
      tile.tileData.offsetY = rect.top - event.pageY
    }


    _getDragPoint(tile, x, y) {
      return {
        x: (x + this.tile.tileData.offsetX)
      , y: (y + this.tile.tileData.offsetY)
      }
    }


    _destroy() {
      document.body.onmousemove = document.body.onmouseup = null
    }
  }



  lx.funetics = new Funetics(lx.json)

})(window.lexogram)
