/** rails.js **
 *
 *
**/



;(function railsLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }



  class Rail {
    constructor(board, type) {
      this.board = board
      this.rail = document.createElement("div")
      this.rail.classList.add(type + "-rail")

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

      // this.checkWordCallback => WordData.checkWord
    }


    setInterface(checkWord) {
      this.checkWordCallback = checkWord
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


    updateTiles(ignoreShadowMap) {
      if (!ignoreShadowMap) {
        this.slotMap = this.shadowMap.slice()
      }

      let tiles = this.slotMap.getUnique()

      tiles.forEach((tile) => {
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


    removeFromMap(tile, ignoreShadowMap) {
      let index

      while ((index = this.shadowMap.indexOf(tile)) > -1) {
        this.shadowMap[index] = 0
      }

      if (ignoreShadowMap) {
        this.updateTiles(!tile.tileData.fromWord)
      }

      if (ignoreShadowMap === "removeFromWord") {
        tile.tileData.fromWord = false
      }
    }


    checkWord() {
      let tiles = this.slotMap.getUnique(true)
      let index

      // TODO: the reduce function will need to be revised for
      // vowel tiles that embrace consonants, like "i.e" in "like"
      let word = tiles.reduce((string, tile) => {
        if (tile) {
          string += tile.innerText.replace(/\n.*/, "")
        } else {
          string += " "
        }

        return string
      }, "")

      let ipa = tiles.reduce((string, tile) => {
        if (tile) {
          string += tile.innerText.replace(/^.+\n/, "")
        }

        return string
      }, "")

      this.checkWordCallback(word.trim(), ipa)
    }


    /**
     * Creates a single-use shadow version of slotMap, where tiles
     * have been moved to allow the current `tile` to fit where the
     * user wants it. The shadowMap will be used to place existing
     * Word tiles.
     *
     * @param  {DIV element} tile
     * @param  {integer}     left of freely dragged tile
     * @return {[type]}      [description]
     */
    _generateShadowMap(tile, pageX) {
      this.shadowMap = this.slotMap.slice()
      this.removeFromMap(tile)

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
          this._shift("right", tile, mouseTileData, 0)
        break
        case "moveLeft":
          this._shift("left", tile, mouseTileData, 0)
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
          if (charRatio < 0.33 && this.shadowMap[mouseIndex - 1]) {
            mouseTileData.action = "moveRight"
          } else if (charRatio>0.67 && this.shadowMap[mouseIndex+1]) {
            mouseTileData.action = "moveLeft"
          }

        } else {
          // Multi-char tile
          if (mouseIndex === mouseTileStart
                          && charRatio < 0.5
                          && this.shadowMap[mouseIndex - 1]) {
            mouseTileData.action = "moveRight"
          } else if (mouseIndex === mouseTileEnd
                                 && charRatio > 0.5
                                 && this.shadowMap[mouseIndex + 1]) {
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
      // mouseTileData = {
      // // Existing tile under the mouse
      //   slotIndex:   integer slot under mouse
      // , tile:        0 // tile already in slot under mouse
      // , tileStart:   same as slotIndex, because tile is 0
      // , action:      "fill"
      // // Inserted tile
      // , insertStart: integer ≤ slotIndex
      // , insertEnd:   integer ≥ slotIndex
      // }

      // freeslots = {
      //   left:  leftmost empty slot adjacent to slotIndex
      // , right: rightmost empty slot adjacent to slotIndex
      // }

      let charCount = tile.tileData.charCount
      let startSlot = freeSlots.left
      let spaceNeeded = charCount - 1 - freeSlots.right + startSlot
      let toRight = this._checkSpaceToRight(mouseTileData, freeSlots)
      let toLeft = spaceNeeded - toRight.spacesFound

      let spaceData = this._spaceToLeft(startSlot, toLeft)

      // undefined  | {
      //   space: space
      // , spacesFound: spacesNeeded - spacesToFind
      // , spaceStillNeeded: spacesToFind }

      if (spaceData && spaceData.spacesFound) {
        startSlot = this._moveTilesLeft(spaceData.space, startSlot-1)
        spaceNeeded = spaceData.spaceStillNeeded

      } else {
        toRight = this._spaceToRight(freeSlots.right, spaceNeeded)
      }

      if (spaceNeeded) {
        this._moveTilesRight(
          toRight.space
        , freeSlots.right + 1
        )
      }

      for ( let ii = 0; ii < charCount; ii += 1 ) {
        this.shadowMap[startSlot + ii] = tile
      }

      return this.shadowMap
    }


    _moveTilesLeft(space, stopSlot) {
      while (space < stopSlot) {
        let tile = this._getFirstTileAfter(space, stopSlot, this.shadowMap)

        if (!tile) {
          // There are no more tiles in the way
          break
        }

        let index = this.shadowMap.indexOf(tile)
        let charCount = tile.tileData.charCount

        for ( let ii = 0; ii < charCount; ii += 1 ) {
          this.shadowMap[index + ii] = 0
          this.shadowMap[space + ii] = tile
        }

        space += charCount
      }

      return space
    }


    _moveTilesRight(space, stopSlot) {
      while (space > stopSlot) {
        let tile = this._getLastTileBefore(space, stopSlot) //, shadowMap)

        if (!tile) {
          // There are no more tiles in the way
          break
        }

        let index = this.shadowMap.lastIndexOf(tile)
        let charCount = tile.tileData.charCount

        for ( let ii = 0; ii < charCount; ii += 1 ) {
          this.shadowMap[index - ii] = 0
          this.shadowMap[space - ii] = tile
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


    _getLastTileBefore(space, stopSlot) { //, shadowMap) {
      // Work with a reversed clone of shadowMap
      space =this. shadowMap.length - space - 1
      stopSlot = this.shadowMap.length - stopSlot - 1
      let shadowMap = this.shadowMap.slice().reverse()

      return this._getFirstTileAfter(space, stopSlot, shadowMap)
    }


    // SHIFT // SHIFT // SHIFT // SHIFT // SHIFT // SHIFT // SHIFT //

    _shift(direction, tile, mouseData) {
      this.shadowMap = this.slotMap.slice()

      // console.log("Shift " + direction)
      // this._consoleMap(this.slotMap)
      // this._consoleMap(this.shadowMap)

      switch (direction) {
        case "right":
          return this._shiftRight(tile, mouseData, 0)
        case "left":
          return this._shiftLeft(tile, mouseData, 0)
      }
    }


    _shiftRight(tile, mouseTileData, startAdjust) {
      // mouseTileData = {
      //   // Existing tile under the mouse
      //     slotIndex:   0 // slot under mouse
      //   , tile:        0 // tile already in slot under mouse
      //   , tileStart:   0 // first slot occupied by tile
      //   , action:      "remove" // moveRight | moveLeft | fill
      //   // Inserted tile
      //   , insertStart: 0
      //   , insertEnd:   0
      //   }

      // Move tiles to right to create enough spaces, then
      let charCount = tile.tileData.charCount
      let wordTile = mouseTileData.slotIndex + startAdjust
      let freeSlots = { left: wordTile, right: wordTile }
      let toLeft = this._checkSpaceToLeft(mouseTileData, freeSlots)
      let toRight = charCount - toLeft.spacesFound
      let spaceData = this._spaceToRight(wordTile, toRight)
      let insertStart = wordTile
      let moreSpace

      if (!spaceData) {
        return this._shiftLeft(tile, mouseTileData, 0)
      }

      this._moveTilesRight(spaceData.space, wordTile)

      if (moreSpace = spaceData.spaceStillNeeded+toLeft.spacesFound) {
        spaceData = this._spaceToLeft(wordTile, moreSpace)
        this._moveTilesLeft(spaceData.space, wordTile)
        insertStart -= moreSpace
      }

      for ( let ii = 0; ii < charCount; ii += 1 ) {
        this.shadowMap[insertStart + ii] = tile
      }
    }


    _shiftLeft(tile, mouseTileData, startAdjust) {
      let charCount = tile.tileData.charCount
      let wordTile = mouseTileData.slotIndex - startAdjust
      let freeSlots = { left: wordTile, right: wordTile }
      let toRight = this._checkSpaceToRight(mouseTileData, freeSlots)
      let toLeft = charCount - toRight.spacesFound
      let spaceData = this._spaceToLeft(wordTile, toLeft)
      let insertStart = wordTile
      let moreSpace

      if (!spaceData) {
        return this._shiftRight(tile, mouseTileData, 1)
      }

      this._moveTilesLeft(spaceData.space, wordTile)
      insertStart -= (spaceData.spacesFound - 1)

      if (moreSpace = spaceData.spaceStillNeeded+toRight.spacesFound){
        spaceData = this._spaceToRight(wordTile, moreSpace)
        this._moveTilesRight(spaceData.space, wordTile)
      }

      for ( let ii = 0; ii < charCount; ii += 1 ) {
        this.shadowMap[insertStart + ii] = tile
      }
    }


    _checkSpaceToRight(mouseTileData, freeSlots) {
      let wanted = mouseTileData.insertEnd + freeSlots.left
                 - mouseTileData.slotIndex - freeSlots.right
      let found  = this._spaceToRight(freeSlots.right, wanted)

      return found || { spacesFound: 0 }
    }


    _checkSpaceToLeft(mouseTileData) {
      let wanted = mouseTileData.slotIndex
                 - mouseTileData.insertStart
      let found  = this._spaceToRight(mouseTileData.slotIndex, wanted)

      return found || { spacesFound: 0 }
    }


    _spaceToLeft(space, spacesNeeded) {
      let result
      let spaces = []
      let spacesToFind = spacesNeeded

      if (space > 0) {
        while (space && spacesToFind) {
          space = this.shadowMap.lastIndexOf(0, space - 1)
          if (space < 0) {
            space = spaces.pop()
            break
          }

          spaces.push(space)
          spacesToFind -= 1
        }

      } else {
        // There is no space to the left of slot 0
        space = undefined
      }

      if (!isNaN(space)) {
        result = {
          space: space
        , spacesFound: spacesNeeded - spacesToFind
        , spaceStillNeeded: spacesToFind
        }
      }

      return result
    }


    _spaceToRight(space, spacesNeeded) {
      let result
      let spaces = []
      let spacesToFind = spacesNeeded

      if (space > -1) {
        while (spacesToFind) {
          space = this.shadowMap.indexOf(0, space + 1)
          if (space < 0) {
            space = spaces.pop()
            break
          }

          spaces.push(space)
          spacesToFind -= 1
        }

      } else {
        // There is no space to the left of slot 0
        space = undefined
      }

      if (!isNaN(space)) {
        result = {
          space: space
        , spacesFound: spacesNeeded - spacesToFind
        , spaceStillNeeded: spacesToFind
        }
      }

      return result
    }





    // REMOVE // REMOVE // REMOVE // REMOVE // REMOVE // REMOVE //

    _remove(tile, mouseTileData) {

    }


    _showPreview() {
      if (!this.shadowMap) {
        return console.log("No shadowMap")
      }

      // this._consoleMap(this.shadowMap)

      let tiles = this.slotMap.getUnique()

      tiles.forEach((tile) => {
        let shadowIndex = this.shadowMap.indexOf(tile)
        let left

        if (this.slotMap.indexOf(tile) !== shadowIndex) {
          // TODO: style tile to show that it has moved
        }

        if (shadowIndex < 0) {
          tile.tileData.previewOnDock = true

        } else {
          left = this.railLeft + shadowIndex * this.charSize + "px"
          tile.style.left = left
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



  lx.Word = Word
  lx.Dock = Dock


})(window.lexogram)