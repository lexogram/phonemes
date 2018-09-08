/** script.js **
 *
 * 
**/



;(function scriptLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }


  // GENERIC METHODS // GENERIC METHODS // GENERIC METHODS //

  function empty(element) {
    while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
    }
  }


  // CLASSES // CLASSES // CLASSES // CLASSES // CLASSES // CLASSES //


  class Funetics {
    constructor(data) {
      this.wordData = new WordData(data)

      let boardDiv = document.body.querySelector(".board")
      this.board   = new Board(boardDiv)

      // Exchange interfaces
      let callback = this.board.showTiles.bind(this.board)
      this.wordData.setInterface(callback)

      callback = this.wordData.getNextWord.bind(this.wordData)
      this.board.setInterface(callback)

      callback()
    }


    destroy() {
      this.board.setInterface(null)
      this.wordData.setInterface(null)
    }
  }



  class WordData {
    constructor(data) {
      this.data = data
    }


    setInterface(callback) {
      this.callback = callback
    }


    getNextWord(word) {
      //// <<< HARD-CODED
      word ? null : word = "clanger"
      //// HARD-CODED >>>>

      let wordData = this.data[word]
      this.callback(wordData)
    }
  }



  class Board {
    constructor(board, getNextWord){
      this.board = board
      this.getNextWord = getNextWord

      this.wordRail = new Word(board)
      this.dockRail = new Dock(board)
      this.tileFactory  = new TileFactory(board)

      // this.callback

      this._listenForEvents()
    }


    setInterface(callback) {
      this.callback = callback
    }


    resized(event) {
      this._updatePositions()
    }


    startDrag(event) {
      let tile = this._extractTile(event)
      if (!tile) {
        return
      }

      new TileMove(tile, event, this.dockRail, this.wordRail)
    }


    showTiles(wordData) {
      this.tileFactory.generateTiles(wordData)

      let tiles = this.tileFactory.tiles
      let charCount = this.tileFactory.charCount

      empty(this.board)
      this.dockRail.initialize(tiles, charCount)
      this.wordRail.initialize(charCount)

      this._updatePositions()
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

        console.log(tile.innerText, tile.tileData)
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



  class Rail {
    constructor(board, type) {
      this.board = board
      this.rail = document.createElement("div")
      this.rail.classList.add("rail", type)

      this.height = this.board.getBoundingClientRect().bottom 
    }


    initialize() {
      // The board was completely emptied earlier. Put the rail back.
      this.board.appendChild(this.rail)
    }


    /**
     * Returns `undefined` or the bottom-left corner of the tile
     * freely dragged within the Word rail.
     */
    mapToRail(tile, x, y) {
      let rect = this.rail.getBoundingClientRect()

      if (rect.contains(x, y)) {
        let count = tile.tileData.charCount
        let right = rect.right - count * this.charSize

        x += tile.tileData.offsetX
        x = Math.max(rect.left, Math.min(x, right))

        return {
          x: x
        , y: this.height - rect.bottom
        }
      }

      // returns undefined if point is not in rail rect
    }


    moveTile(tile, point) {
      console.log(tile.innerText, point)

      tile.style.left = point.x + "px"
      tile.style.bottom = point.y + "px"
      tile.style.removeProperty("top")
    }
  }



  class Dock extends Rail {
    constructor(board) {
      super(board, "dock")
    }


    initialize(tiles, totalChars) {
      super.initialize()

      console.log("initialize")

      let charIndex = 0
      let tileData

      let total = tiles.length
      for ( let ii = 0; ii < total; ii += 1 ) {
        tileData = tiles[ii].tileData

        Object.assign(
          tileData
        , { tileIndex: ii
          , charIndex: charIndex
          , inWord:    false
          }
        )

        console.log(tiles[ii].innerText, tileData)

        charIndex += tileData.charCount
      }
    } 


    preparePositions(charSize, gapSize, dockLeft) {
      this.charSize = charSize
      this.gapSize  = gapSize
      this.dockLeft = dockLeft
    }


    setTilePosition(tile) {
      let tileData = tile.tileData
      let left  = this.dockLeft
                + tileData.tileIndex * this.gapSize
                + tileData.charIndex * this.charSize
      let width = tileData.charCount * this.charSize

      tile.style = "left:" + left + "px;"
                 + "bottom:0;"
                 + "width:" + width + "px;"
    }
  }



  class Word extends Rail {
    constructor(board) {
      super(board, "word") 
      // this.board
      // this.rail
      // this.height
      // 
      this.railElements = []
      this.slotMap = []
      this.shadowMap = []

      // this.railLeft
      // this.dummy
    }


    initialize(charCount) {
      super.initialize()
      empty(this.rail)
      this.railElements.length = 0

      this.slotMap.length = charCount
      this.slotMap.fill(0)

      let element

      for ( let ii = 0; ii < charCount; ii += 1 ) {
        element = document.createElement("div")
        this.railElements.push(element)
        this.rail.appendChild(element)
      }

      this.dummy = document.createElement("div")
      this.dummy.classList.add("dummy")
      this.rail.appendChild(this.dummy)
    }


    preparePositions(charSize, charCount, board) {
      this.charSize = charSize
      board = this.board.getBoundingClientRect()
      let width = (charCount * charSize)
      this.railLeft = (board.width - width) / 2
      this.railBottom = (this.charSize * 2) + "px"

      this.rail.style = "left:" + this.railLeft + "px;"
                      + "width:" + width + "px;"
                      + "bottom:" + this.railBottom + ";"
                      + "height:" + charSize + "px;"

      let total = this.railElements.length
      let element
        , left

      for ( let ii = 0; ii < total; ii += 1 ) {
        element = this.railElements[ii]
        left = this.railLeft + ii * charSize
        element.style = "left:" + left + "px;"
                      + "width:" + charSize + "px;"
      }
    }


    setTilePosition(tile, index) {
      if (index === "fromShadowMap") {
        index = this.shadowMap.indexOf(tile)
        this.slotMap = this.shadowMap.slice()

      } else if (isNaN(index)) {
        index = this.slotMap.indexOf(tile)  
          
        if (index < 0) {          
          console.log("Tile '" + tile.innerText +"' is not on word rail")
          return
        }
      }

      let left = (this.railLeft + (index * this.charSize)) + "px"
      tile.style.left = left
      tile.style.bottom = this.railBottom
      tile.style.removeProperty("top")
    }


    findFirstEmptyPlaceFor(tile) {
      let tileData = tile.tileData
      let charCount = tileData.charCount
      let slotCount = this.slotMap.length
      let emptySlot = -1

      let total = slotCount - charCount + 1
      // Use label to break out of inner loop and continue outer loop
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
      outerLoop:
      for ( let slot = 0; slot < total; slot += 1 ) {
        if(this.slotMap[slot]) {
          // This slot is taken
          continue
        }

        // This slot is free. Is there enough space to the right?
        for ( let next = 1 ; next < charCount ; next += 1 ) {
          if (this.slotMap[slot + next]) {
            continue outerLoop
          }
        }

        // If we get here, `slot` is empty with enough empty slots to
        // the right

        emptySlot = slot
        this.slotMap.fill(tile, slot, slot + charCount)
        tile.tileData.inWord = true
        this.setTilePosition(tile, emptySlot)

        this._consoleMap()
        break
      }

      // return emptySlot
    }


    checkIfTileIsOnRail(tile) {
      tile.tileData.fromWord = !(this.slotMap.indexOf(tile) < 0)
    }


    /**
     * [moveTile description]
     * @param  {HTMLELement} tile      
     * @param  {integer}     left      left of optimum insert point
     * @param  {object}      dragPoint { x: left of free-dragged tile
     *                                 , y: top        —⫵—           }
     */
    moveTile(tile, left, dragPoint) {
      let insertAt = this._mapPointToInsertPoint(tile, left)
      // { left: corrected left of inserted tile + "px"
      // , action: <moveLeft | moveRight | remove>}

      this.dummy.style.left = insertAt.left  
      this.shadowMap = this.slotMap.slice()
      if (tile.tileData.fromWord) {
        console.log("fromWord")
        this.removeFromMap(tile, this.shadowMap)
      }

      this._shiftExistingTiles(tile, insertAt)

      this._consoleMap(this.shadowMap)

      tile.style.left = dragPoint.x
      tile.style.top = dragPoint.y

      tile.classList.add("translucent")
    }


    removeFromMap(tile, map) {
      if (!map) {
        map = this.slotMap
        tile.tileData.fromWord = false
      }

      map.forEach((slotItem, index, array) => {
        if (slotItem === tile) {
          array[index] = 0
        }
      })

      // this._consoleMap(map)
    }


    _mapPointToInsertPoint(tile, left) {
      let insertAt = {
        index:  0
      , action: -1
      }

      let offsetX = tile.tileData.offsetX
      let charAdjust = Math.floor(-offsetX / this.charSize)
      let index = (left - offsetX - this.railLeft) / this.charSize
      index = Math.floor(index) - charAdjust
      insertAt.left = (index * this.charSize) + "px"

      let tileWidth = tile.tileData.charCount * this.charSize
      let offsetRatio = offsetX / tileWidth
      insertAt.action = (offsetRatio)

      return insertAt
    }


    _shiftExistingTiles(tile, insertAt) {
      let index = insertAt.index
      let charCount = tile.tileData.charCount
      this.shadowMap.fill(tile, index, index + charCount)
    }



    /// DEV TOOL // DEV TOOL // DEV TOOL // DEV TOOL // DEV TOOL ///

    _consoleMap(map) {
      if (!map) {
        map = this.slotMap
      }
      console.log(
        map===this.slotMap ? "slo" : "dow"
      , map.map((slot) => {
        return slot ? slot.innerText.replace(/\n.*/, "") : 0
      }))
    }
  }



  class TileMove {
    constructor (tile, event, dock, word) {
      this.tile = tile
      this._setOffset(tile, event)
      this.dock = dock
      this.word = word

      this.word.checkIfTileIsOnRail(tile)

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
        this.word.moveTile(this.tile, railPoint.x, dragPoint)

      } else if (railPoint = this.dock.mapToRail(this.tile, x, y)) {
        this.dock.moveTile(this.tile, railPoint)

      } else {
        this._moveOnBoard(dragPoint)
      }
    }


    stopDrag() {
      console.log("stopDrag", this.tile.tileData.inWord)

      if (!this.moved) {
        if (!this.tile.tileData.inWord) {
          this.word.findFirstEmptyPlaceFor(this.tile)
        }

      } else if (this.tile.tileData.inWord) {
        this.word.setTilePosition(this.tile, "fromShadowMap")
      } else {
        this.word.removeFromMap(this.tile)
        this.dock.setTilePosition(this.tile)
      }

      this.tile.style.removeProperty("z-index")
      this.tile.classList.remove("translucent")

      this._destroy()
    }


    _moveOnBoard(dragPoint) { 
      this.tile.style.left = dragPoint.x
      this.tile.style.top  = dragPoint.y
      this.tile.style.removeProperty("bottom")
    }


    _snapToNearbyTiles() {
      console.log("TODO: Check if tile should snap to another tile")
    }


    _replaceInDock() {
      // TODO: Move other tiles around in _moveInDock, so nothing
      // will need to be done here
      
    }


    _snapToNearbyTiles() {
      console.log("TODO: Check if tile should snap to another tile")
    }


    // UTILITIES // UTILITIES // UTILITIES // UTILITIES // UTILITIES /

    _setOffset(tile, event) {
      let rect = tile.getBoundingClientRect()
      
      tile.tileData.offsetX = rect.left - event.pageX
      tile.tileData.offsetY = rect.top - event.pageY
    }


    _getDragPoint(tile, x, y) {
      return {
        x: (x + this.tile.tileData.offsetX) + "px"
      , y: (y + this.tile.tileData.offsetY) + "px"
      }
    }


    _destroy() {
      document.body.onmousemove = document.body.onmouseup = null
    }
  }



  lx.funetics = new Funetics(lx.json)
  
})(window.lexogram)