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
      word ? null : word = "clanger" // "cleave" //
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
//
        // console.log(tile.innerText, tile.tileData)
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

      // this.height
    }


    initialize() {
      // The board was completely emptied earlier. Put the rail back.
      this.board.appendChild(this.rail)
    }


    preparePositions() {
      this.height = this.board.getBoundingClientRect().height
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

        // Is this the best place for this?
        tile.style.removeProperty("bottom")

        return {
          x: x
        , y: this.height - rect.bottom
        }
      }

      // returns undefined if point is not in rail rect
    }


    moveTile(tile, point) {
      // console.log(tile.innerText, point)

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

      // console.log("initialize")

      let charIndex = 0
      let tileData

      let total = tiles.length
      for ( let ii = 0; ii < total; ii += 1 ) {
        tileData = tiles[ii].tileData

        Object.assign(
          tileData
        , { tileIndex:     ii
          , charIndex:     charIndex
          , inWord:        false
          , previewOnDock: false
          }
        )

        // console.log(tiles[ii].innerText, tileData)

        charIndex += tileData.charCount
      }
    }


    preparePositions(charSize, gapSize, dockLeft) {
      super.preparePositions()

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

      this.railElements = []
      this.slotMap = []
      this.shadowMap = []

      // this.railLeft
      // this.railTop
      // this.railBottom
      // this.charCount
      // this.dummy
    }


    initialize(charCount) {
      super.initialize()

      this.charCount = charCount

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
      super.preparePositions()

      this.charSize = charSize
      board = this.board.getBoundingClientRect()
      let width = (charCount * charSize)
      this.railLeft = (board.width - width) / 2
      this.railTop = board.height - (this.charSize * 3)
      this.railBottom = (this.charSize * 2)

      this.rail.style = "left:" + this.railLeft + "px;"
                      + "width:" + width + "px;"
                      + "bottom:" + this.railBottom + "px;"
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
          console.log("Tile '" + tile.innerText +"' not on word rail")
          return
        }
      }

      let left = (this.railLeft + (index * this.charSize)) + "px;"
      let width = (tile.tileData.charCount * this.charSize) + "px;"

      tile.style = "left:" + left
                 + "bottom:" + this.railBottom + "px;"
                 + "width:" + width
    }


    updateTiles(revert) {
      if (!revert) {
        this.slotMap = this.shadowMap.slice()
      }

      let tileArray = this.slotMap.getUnique()

      tileArray.forEach((tile) => {
        let index = this.slotMap[tile]
        this.setTilePosition(tile, index)
      })
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

        // this._consoleMap()
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
     * @param  {integer}     left      tile left constrained to rail
     * @param  {object}      dragPoint { x: left of free-dragged tile
     *                                 , y: top        —⫵—           }
     */
    moveTile(tile, dragPoint, pageX, pageY) {
      this._generateShadowMap(tile, pageX)

      this._showPreview()

      this._showAdjustedDrag(tile, dragPoint, pageY)
    }


    removeFromMap(tile, revert) {
      tile.tileData.fromWord = false

      this.shadowMap.forEach((slotItem, index, array) => {
        if (slotItem === tile) {
          array[index] = 0
        }
      })

      if (revert) {
        this.updateTiles(revert !== "slotMap")
      }
    }


    /**
     * Creates a single-use shadow version of slotMap, where tiles
     * have been moved to allow the current `tile` to fit where the
     * user wants it. The shadowMap will be used to place existing
     * Word tiles and the dummy
     *
     * @param  {DIV element} tile
     * @param  {integer}     left of freely dragged tile
     * @return {[type]}      [description]
     */
    _generateShadowMap(tile, pageX) {
      this.shadowMap = this.slotMap.slice()
      this.removeFromMap(tile) //, this.shadowMap)

      // Find which tile the mouse is pointing at, and which part
      // of that tile it is pointing at
      let mouseTileData = this._getMouseTileData(tile, pageX)

      // { slotIndex:   <integer slot under mouse>
      // , tile:        <0 | tile already in slot under mouse>
      // , tileStart:   <slotIndex | first slot occupied by tile>
      // , action:      <"remove" | "moveRight" | "moveLeft" | "fill"
      // , insertStart: <optimal first slot for tile>
      // , insertEnd:   <optimal last slot for tile>
      // }

      switch (mouseTileData.action) {
        case "fill":
          this._fillEmptySlot(tile, mouseTileData)
        break
        case "moveRight":
          this._moveRight(tile, mouseTileData)
        break
        case "moveLeft":
          this._moveLeft(tile, mouseTileData)
        break
        case "remove":
          this._remove(tile, mouseTileData)
      }

      // // REMOVE // REMOVE // REMOVE //
      // if (!this.shadowMap) {
      //   this.shadowMap = []
      // }
      // // REMOVE // REMOVE // REMOVE //

      // this._consoleMap(this.shadowMap)
    }


    _getMouseTileData(tile, pageX) {
      let mouseTileData = {
      // Existing tile under the mouse
        slotIndex:   0 // slot under mouse
      , tile:        0 // tile already in slot under mouse
      , tileStart:   0 // first slot occupied by tile
      , action:      "remove" // moveRight | moveLeft | fill
      // Inserted tile
      , insertStart: 0
      , insertEnd:   0
      }

      // Data about the existing tile under the mouse
      let mouseIndex = (pageX - this.railLeft) / this.charSize
      let charRatio = mouseIndex % 1
      mouseIndex = mouseTileData.slotIndex = Math.floor(mouseIndex)

      let mouseTile = this.shadowMap[mouseIndex] // 0 | tile element
      let mouseTileStart = mouseIndex

      if (mouseTile) {
        mouseTileStart = this.shadowMap.indexOf(mouseTile)
        let mouseTileEnd   = this.shadowMap.lastIndexOf(mouseTile)
        let mouseTileLength =  mouseTileEnd- mouseTileStart + 1

        if (mouseTileLength === 1) {
          if (charRatio < 0.33) {
            mouseTileData.action = "moveRight"
          } else if (charRatio > 0.67) {
            mouseTileData.action = "moveLeft"
          }

        } else {
          // Multi-char tile
          if (mouseIndex === mouseTileStart && charRatio < 0.5) {
            mouseTileData.action = "moveRight"
          } else if (mouseIndex === mouseTileEnd && charRatio < 0.5) {
            mouseTileData.action = "moveLeft"
          }
        }

      } else {
        mouseTileData.action = "fill"
      }

      mouseTileData.tile      = mouseTile
      mouseTileData.tileStart = mouseTileStart

      // Data about inserted tile
      let charCount = tile.tileData.charCount
      let startX = pageX + tile.tileData.offsetX
      let insertStart = Math.max(0, startX - this.railLeft)
      insertStart =  Math.floor(insertStart / this.charSize)
      insertStart = Math.max(0, insertStart, mouseIndex-charCount+1)
      insertStart = Math.min(insertStart, this.charCount - charCount)

      mouseTileData.insertStart = insertStart
      mouseTileData.insertEnd = insertStart + charCount - 1

      return mouseTileData
    }


    /**
     * Triggered by moveTile when the mouse is over an empty slot.
     * Places the tile so that part of it is in the slot under the
     * mouse. May adjust the tile's position and/or move other tiles
     * to make space.
     *
     * @param  {DIV element} tile          div.tile-set to be placed
     * @param  {object map}  mouseTileData see _getMouseTileData()
     */
    _fillEmptySlot(tile, mouseTileData) {
      // Check if there is space from insertStart to insertEnd
      let result = this._fillSlotsIfPossible(
        tile
      , mouseTileData.insertStart
      , mouseTileData.insertEnd
      ) // <integer blocked slot index | shadowMap>

      // Check if there is space around mTD.slotIndex
      if (!isNaN(result)) {
        // result is integer blocked slot index
        result = this._findSpaceIfPossible(
          tile
        , mouseTileData.slotIndex
        , mouseTileData.insertStart
        , result
        )
      }

      // Check if space can be made from insertStart to insertEnd
      if (!Array.isArray(result)) {
        result = this._makeSpace(
          tile
        , mouseTileData
        , result
        )
      }
      // If one side is blocked, shift tiles on that side


      this.shadowMap = result
    }


    /**
     * Simplest case: attempts to place the tile to fill all the slots
     * that it is dragged to
     *
     * @param  {DIV element}  tile      div.tile-set to be placed
     * @param  {integer}      startSlot index of first slot to fill
     * @param  {integer}      endSlot   index of last slot to fill
     *
     * @return {int or array}           [<0|tile>, ...] if successful
     *                                  index of existing tile, if not
     */
    _fillSlotsIfPossible(tile, startSlot, endSlot) {
      let shadowMap = this.shadowMap.slice()

      for ( let ii = startSlot; ii < endSlot + 1; ii += 1 ) {
        if (shadowMap[ii]) {
          return ii

        } else {
          shadowMap[ii] = tile
        }
      }

      return shadowMap
    }


    /**
     * Second simplest case: checks if there are enough empty slots
     * around mouseSlot to place the tile. If so, returns a shadowMap
     * array, if not, returns an object indicating the extent of the
     * free space
     *
     *
     * @param  {DIV element}   tile  div.tile-set to be placed
     * @param  {integer}   mouseSlot index of slot under mouse
     * @param  {integer}   startSlot index of leftmost possible slot
     * @param  {integer} blockedSlot index of slot with tile
     *
     * @return {obj or array}           [<0|tile>, ...] if successful
     *                      or, if not: { left: <int>, right: <int>}
     */
    _findSpaceIfPossible(tile, mouseSlot, startSlot, blockedSlot) {
      let result = this.shadowMap.slice()
      let charCount = tile.tileData.charCount

      if (blockedSlot < mouseSlot) {
        // There's a tile to the left blocking insertion. Find the
        // leftmost empty slot from mouseSlot

        startSlot = mouseSlot - 1
        for ( ; startSlot > -1 ; startSlot -= 1 ) {
          if (result[startSlot]) {
            startSlot += 1
            // We don't know yet if there is enough space to the right
            break
          }
        }

      } else {
        // There's a tile to the right blocking insertion. Check if
        // there are charCount spaces to the left of blockedSlot
        let tooFar = blockedSlot - charCount - 1

        for ( ; startSlot > tooFar ; startSlot -= 1 ) {
          if ((startSlot < 0) || result[startSlot]) {
            // The gap is too small
            result = { left: startSlot + 1, right: blockedSlot - 1 }
            return result
          }
        }
      }

      if (result.length < startSlot + charCount) {
        result = { left: startSlot, right: result.length - 1 }

      } else {
        for ( let ii = 0 ; ii < charCount; ii += 1 ) {
          if (result[startSlot + ii]) {
            result = { left: startSlot, right: startSlot + ii - 1 }
            break

          } else {
            result[startSlot + ii] = tile
          }
        }
      }

      return result
    }


    _makeSpace(tile, mouseTileData, freeSlots) {
      let shadowMap = this.shadowMap.slice()
      let space = freeSlots.left
      let charCount = tile.tileData.charCount
      let spaceNeeded = charCount - 1
                      - freeSlots.right + freeSlots.left
      let spaces = [space]

      while (space && spaceNeeded) {
        space = shadowMap.lastIndexOf(0, space - 1)
        if (space < 0) {
          space = spaces.pop()
          break
        }

        spaces.push(space)
        spaceNeeded -= 1
      }

      let startSlot = this._moveTilesLeft(
        shadowMap
      , space
      , freeSlots.left - 1
      )

      if (spaceNeeded) {
        space = freeSlots.right
        spaces = [] // There must be a space further to the right

        while (spaceNeeded) {
          space = shadowMap.indexOf(0, space + 1)
          if (space < 0) {
            space = spaces.pop()
            break
          }

          spaces.push(space)
          spaceNeeded -= 1
        }

        this._moveTilesRight(
          shadowMap
        , space
        , freeSlots.right + 1
        )
      }

      for ( let ii = 0; ii < charCount; ii += 1 ) {
        shadowMap[startSlot + ii] = tile
      }

      return shadowMap
    }


    _moveTilesLeft(shadowMap, space, stopSlot) {

      while (space < stopSlot) {
        let tile = this._getFirstTileAfter(space, stopSlot, shadowMap)

        if (!tile) {
          // There are no more tiles in the way
          break
        }

        let index = shadowMap.indexOf(tile)
        let charCount = tile.tileData.charCount

        for ( let ii = 0; ii < charCount; ii += 1 ) {
          shadowMap[index + ii] = 0
          shadowMap[space + ii] = tile
        }

        space += charCount
      }

      return space
    }


    _moveTilesRight(shadowMap, space, stopSlot) {
      while (space > stopSlot) {
        let tile = this._getLastTileBefore(space, stopSlot, shadowMap)

        if (!tile) {
          // There are no more tiles in the way
          break
        }

        let index = shadowMap.lastIndexOf(tile)
        let charCount = tile.tileData.charCount

        for ( let ii = 0; ii < charCount; ii += 1 ) {
          shadowMap[index - ii] = 0
          shadowMap[space - ii] = tile
        }

        space -= charCount
      }

      return space
    }


    _getFirstTileAfter(space, stopSlot, shadowMap) {
      let tile

      shadowMap.some((slot, index) => {
        if (index < space || !slot) {
          return false
        } else if (index > stopSlot) {
          return true
        }

        tile = slot
        return true
      })

      return tile
    }


    _getLastTileBefore(space, stopSlot, shadowMap) {
      // Work with a reversed clone of shadowMap
      space = shadowMap.length - space - 1
      stopSlot = shadowMap.length - stopSlot - 1
      shadowMap = shadowMap.slice().reverse()

      return this._getFirstTileAfter(space, stopSlot, shadowMap)
    }


    _moveRight(tile, mouseTileData) {

    }


    _moveLeft(tile, mouseTileData) {

    }


    _remove(tile, mouseTileData) {

    }


    _showPreview() {
      if (!this.shadowMap) {
        return console.log("No shadowMap")
      }

      let tileArray = this.slotMap.getUnique()

      tileArray.forEach((tile) => {
        let shadowIndex = this.shadowMap.indexOf(tile)
        let left

        if (this.slotMap.indexOf(tile) !== shadowIndex) {
          if (shadowIndex < 0) {
            tile.tileData.previewOnDock = true
          } else {
            left = this.railLeft + shadowIndex * this.charSize + "px"
            tile.style.left = left
          }
        }
      })
    }


    _showAdjustedDrag(tile, dragPoint, pageY) {
      let charSize = this.charSize
      let tileHeight = tile.getBoundingClientRect().height
      let tileIndex = this.shadowMap.indexOf(tile)
      let x = this.railLeft + tileIndex * charSize
      let y

      if (pageY < (this.railTop + charSize / 2)) {
        y = this.railTop - tileHeight + charSize / 2
        y = Math.min(dragPoint.y, y)

      } else {
        y = this.railTop + tileHeight - charSize
        y = Math.max(dragPoint.y, y)
      }

      tile.style.left = x + "px"
      tile.style.top = y + "px"

      // console.log("x:", x, " (" + dragPoint.x + ") y:", y, " (" + dragPoint.y + ")")

      // tile.classList.add("translucent")
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
      // console.log("stopDrag", this.tile.tileData.inWord)

      if (!this.moved) {
        if (!this.tile.tileData.inWord) {
          this.word.findFirstEmptyPlaceFor(this.tile)
        }

      } else if (this.tile.tileData.inWord) {
        this.word.updateTiles()
      } else {
        this.word.removeFromMap(this.tile, "slotMap")
        // this.word.updateTiles()
        this.dock.setTilePosition(this.tile)
      }

      this.tile.style.removeProperty("z-index")
      // this.tile.classList.remove("translucent")

      this._destroy()
    }


    _moveOnBoard(dragPoint) {
      this.tile.style.left = dragPoint.x + "px"
      this.tile.style.top  = dragPoint.y + "px"
      this.tile.style.removeProperty("bottom")
    }


    _snapToNearbyTiles() {
      console.log("TODO: Check if tile should snap to another tile")
    }


    _replaceInDock() {
      // TODO: Move other tiles around in _moveInDock, so nothing
      // will need to be done here

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