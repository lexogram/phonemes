/** script.js **
 *
 * 
**/



;(function scriptLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }



  class Funetics {
    constructor(data) {
      this.data = data
   
      this.body = document.querySelector("body")
      this.board = this.body.querySelector(".board")

      this.wordData = {}
      this.tiles = []

      this._display("anger")

      this._listenForEvents()
    }


    resized(event) {
      this._positionTiles()
    }


    startDrag(event) {
      let tile = this._extractTile(event)
      if (!tile) {
        return
      }

      new TileMove(tile, event, this.dockTop)
    }


    _listenForEvents() {
      let listener = this.startDrag.bind(this)
      document.body.onmousedown = listener

      listener = this.resized.bind(this)
      lx.helpers.registerListener("resize", listener)
    }


    //// CREATE AND DISPLAY TILES ////

    _display(word) {
      this.wordData = this.data[word]
      this.tiles.length = 0

      this.phonemes = this.wordData.phonemes
      this.strings = this.phonemes[0].split("|")
      this.phonemes = this.phonemes[1].split("|")

      word = this.strings.join("")
      word = word.split(/[.–—]/).join("")
      this.charCount = word.length

      let tile
      let total = this.strings.length
      for ( let ii = 0; ii < total; ii += 1 ) {
        tile = this._createTile(this.strings[ii], this.phonemes[ii])
        this.tiles.push(tile)
      }

      this._shuffle(this.tiles)

      this._emptyBoard()
      this._placeTilesOnDock()
      this._positionTiles()
    }


    _createTile(string, phoneme) {
      // console.log(string, phoneme)
      if (string.indexOf(".") < 0) {
        return this._solidTile(string, phoneme)
      } else {
        return this._stretchTile(string, phoneme)
      }
    }


    _solidTile(string, phoneme) {
      let tile = document.createElement("div")
      tile.classList.add("tile-set")

      let subTile = this._tileChunk(string)
      tile.appendChild(subTile)

      this._addPhoneme(tile, phoneme)

      return tile
    }


    _stretchTile(string, phoneme) {
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


    _tileChunk(string) {
      let tile = document.createElement("div")
      tile.classList.add("tile")

      let strings = string.replace(/[–—ˈˌ]/, "")
                          .split("")
      let span

      strings.forEach((string) => {
        span = document.createElement("span")
        span.classList.add("string", "plain")
        span.innerHTML = string
        tile.appendChild(span)        
      })

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


    _emptyBoard() {
      while (this.board.hasChildNodes()) {
        this.board.removeChild(element.lastChild);
      }
    }


    _placeTilesOnDock() {
      while (this.board.hasChildNodes()) {
        this.board.removeChild(element.lastChild);
      }

      let charIndex = 0
      let tile
        , charCount

      let total = this.tiles.length
      for ( let ii = 0; ii < total; ii += 1 ) {
        tile = this.tiles[ii] 

        charCount = tile.querySelectorAll(".tile span").length       

        tile.tileData = {
          top: -1
        , tileIndex: ii
        , charIndex: charIndex
        , charCount: charCount
        , inDock:    true
        }

        charIndex += charCount

        this.board.appendChild(tile)
      }
    }


    _positionTiles(tiles) {
      if (!tiles) {
        tiles = this.tiles
      }

      let height = this.board.getBoundingClientRect()
      let width  = this.boardWidth =  height.width
      height = height.height
      let left = 0

      let tileCount = this.tiles.length
      let places    = this.charCount + 2
      let charSize  = Math.min(height / 4, width / places)
      let gapSize   = (charSize * 2) / (tileCount + 1)

      this.dockTop = height - charSize
      // this.dockLeft = gapSize + charSize / 2
      // this.dockWidth = width - (this.dockLeft * 2)

      this.body.style = "font-size:" + charSize + "px;"

      tiles.forEach((tile) => { 
        let tileData = tile.tileData
        let left = (tileData.tileIndex + 1) * gapSize
                 + tileData.charIndex * charSize

        if (tileData.inDock) {
          tile.style = "left:" + left + "px;"
                     + "bottom:0;"
                     + "width:" + width + "px;"

        } else {

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



  class TileMove {
    constructor (tile, event, dockTop) {
      this.tile = tile
      this.offset = this._getOffsetFromTopLeft(tile, event)
      this.dockTop = dockTop

      this.tile.style.zIndex = "99"

      document.body.onmousemove = this.moveTile.bind(this)
      document.body.onmouseup = this.stopDrag.bind(this)
    }


    moveTile(event) {
      if (this.tile.tileData.inDock = event.pageY > this.dockTop) {
        this._moveInDock(event)
      } else {
        this._moveOnBoard(event)
      }
    }


    stopDrag(event) {
      if (this.tile.tileData.inDock) {
        this._replaceInDock()
      } else {
        this._snapToNearbyTiles()
      }

      this.tile.style.removeProperty("z-index")

      this._destroy()
    }


    _getOffsetFromTopLeft(tile, event) {
      let offset = { x: 0, y: 0 }
      let rect = tile.getBoundingClientRect()
      
      offset.x = rect.left - event.pageX
      offset.y = rect.top - event.pageY

      console.log(offset)

      return offset
    }


    _moveOnBoard() { 
      let x = event.pageX + this.offset.x
      let y = event.pageY + this.offset.y

      this.tile.style.left = x + "px"
      this.tile.style.top  = y + "px"
    }


    _snapToNearbyTiles() {
      console.log("TODO: Check if tile should snap to another tile")
    }


    _moveInDock(event) {
      let x = event.pageX + this.offset.x
      let y = event.pageY + this.offset.y

      this.tile.style.left = x + "px"
      this.tile.style.bottom = 0
      this.tile.style.removeProperty("top")

      // TODO: Move other tiles around so that there is always
      // space for all of them, and space to drop the current tile
    }


    _replaceInDock() {
      // TODO: Move other tiles around in _moveInDock, so nothing
      // will need to be done here
      lx.funetics._positionTiles([this.tile])
    }


    _snapToNearbyTiles() {
      console.log("TODO: Check if tile should snap to another tile")
    }


    _destroy() {
      document.body.onmousemove = document.body.onmouseup = null
    }
  }



  lx.funetics = new Funetics(lx.json)
  
})(window.lexogram)