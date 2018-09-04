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

      this.board = document.querySelector(".board")

      this.wordData = {}
      this.tiles = []

      this._display("range")
    }


    _display(word) {
      this.wordData = this.data[word]
      this.tiles.length = 0

      this.phonemes = this.wordData.phonemes
      this.strings = this.phonemes[0].split("|")
      this.phonemes = this.phonemes[1].split("|")

      let tile
      let total = this.strings.length
      for ( let ii = 0; ii < total; ii += 1 ) {
        tile = this._createTile(this.strings[ii], this.phonemes[ii])
        this.tiles.push(tile)

      }

      this._shuffle(this.tiles)

      this._refresh(this.board, this.tiles)

      // console.log(this.tiles.map((tile) => {
      //   return tile.innerHTML
      // }))
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
      divider.style = "left:" + (index * 14 - 1) + "vmin;"
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


    _refresh(element, children) {
      while (element.hasChildNodes()) {
        element.removeChild(element.lastChild);
      }

      children.forEach((child) => {
        element.appendChild(child)
      })
    }
  }



  lx.funetics = new Funetics(lx.json)
  
})(window.lexogram)