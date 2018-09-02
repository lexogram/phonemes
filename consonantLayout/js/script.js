/** vowels.js **
 *
 * Creates a canvas where squares will be drawn to place the various
 * vowel sounds of English in the standard IPA positions.
**/



;(function vowelsLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }



  let font = new FontFace(
    'GentiumPlusW'
  , 'url(fonts/GentiumPlus-R.woff)'
  )

  font.load().then(function() {
    lx.vowels = new Consonants()
  })
  

  ;(function overlay(){
    let checkbox = document.querySelector("input")
    let body = document.querySelector("body")

    checkbox.onchange = function checkChange(event) {
      let show = checkbox.checked

      if (show) {
        body.classList.add("overlay")
      } else {
        body.classList.remove("overlay")
      }
    }
  })()


  class Consonants {
    constructor(image) {
      this._createCanvas()
      this._drawUnvoiced()
      this._setFont()

      let phonemes = [
        "m"
      , "b"
      , "p"
      , "f"
      , "v"
      , "w"

      , "θ"
      , "ð"

      , "n"
      , "d"
      , "t"
      , "s"
      , "z"
      , "l"

      , "ʤ"
      , "ʧ"
      , "ʃ"
      , "ʒ"
      , "ɹ"

      , "j"

      , "ŋ"
      , "g"
      , "k"
      , "x"

      , "h"
      ]

      let labels = [
        "labial"
      , "labioDental"
      , "dental"
      , "alveolar"
      , "postAlveolar"
      , "palatal"
      , "velar"
      , "glottal"

      , "nasal"
      , "plosive"
      , "fricative"
      , "approximant"
      , "lateral"
      ]

      phonemes.forEach(this._drawPhoneme.bind(this))
      labels.forEach(this._drawLabel.bind(this))
    }


    _createCanvas() {
      this.canvas = document.querySelector("canvas")
      this.context = this.canvas.getContext("2d")

      this.ySliver = 20
      this.xSliver = 23
      this.halfUnit = 60
      this.unit = this.halfUnit * 2    // 120
      this.width = 10 * this.unit + 9 * this.xSliver + 1
      this.height = 7 * this.unit + 6 * this.ySliver + 1

      this.lineHeightAdjust = 84

      console.log(this.width, this.height) // 1406 x 962

      this.canvas.width  = this.width
      this.canvas.height = this.height
    }


    _drawUnvoiced() {
      let top = (this.unit + this.ySliver) * 2 - 1
      let height = this.unit * 2 + this.ySliver + 2
      this.context.fillStyle = "#ddd"
      this.context.fillRect(0, top, this.width, height)

      top += this.unit + 25
      let left = (this.unit + this.xSliver) * 5

      this.context.font = "70px GentiumPlusW"
      this.context.fillStyle = "#fff"
      this.context.fillText("unvoiced", left, top)
    }


    _setFont() {
      this.context.font = "66px GentiumPlusW"
      this.context.fillStyle = "#000"

      this.labelSize = 22
      this.labelFont = this.labelSize + "px GentiumPlusW"
    }


    _drawLabel(label) {
      this["_draw_" + label](label)
    }


    _draw_labial() {
      this.context.font = this.labelFont

      let left = this.labelSize
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "labial")
    }


    _draw_labioDental() {
      let left = (this.unit + this.xSliver) * 1 + this.labelSize
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "labio-dental")
    }


    _draw_dental() {
      let left = (this.unit + this.xSliver) * 2 + this.labelSize
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "dental")
    }


    _draw_alveolar() {
      let left = (this.unit + this.xSliver) * 3 - this.labelSize / 4
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "alveolar")
    }


    _draw_postAlveolar() {
      let left = (this.unit + this.xSliver) * 4 + this.labelSize
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "post-alveolar")
    }


    _draw_palatal() {
      let left = (this.unit + this.xSliver) * 5 + this.labelSize
      let top = (this.unit + this.ySliver) * 6
      this._drawPlace(left, top, "palatal")
    }


    _draw_velar() {
      let left = (this.unit + this.xSliver) * 7 - this.labelSize / 4
      let top = (this.unit + this.ySliver) * 3
      this._drawPlace(left, top, "velar")
    }


    _draw_glottal() {
      let left = (this.unit + this.xSliver) * 9 - this.labelSize / 3
      let top = (this.unit + this.ySliver) * 3
      this._drawPlace(left, top, "glottal")
    }


    _draw_nasal() {
      let left = 6
      let top = 0
      this._drawManner(left, top, "nasal")
    }


    _draw_plosive() {
      let left = 6
      let top = 1.5
      this._drawManner(left, top, "plosive")
    }


    _draw_fricative() {
      let left = 6
      let top = 3.5
      this._drawManner(left, top, "fricative")
    }


    _draw_approximant() {
      let left = 6
      let top = 5
      this._drawManner(left, top, "approximant")
    }


    _draw_lateral() {
      let left = 6
      let top = 6
      this._drawManner(left, top, "lateral-approximant")
    }


    _drawPhoneme(phoneme) {
      this["_draw_"+phoneme]()
    }


    _draw_m() {
      let column = 0
      let row = 0
      let left = (this.unit + this.xSliver) * column + 1
      let top = (this.unit + this.ySliver) * row + 1
      this._drawRect(left, top, "m", true)
    }


    _draw_b() {
      let column = 0
      let row = 1
      let left = (this.unit + this.xSliver) * column + 1
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "b", true)
    }


    _draw_p() {
      let column = 0
      let row = 2
      let left = (this.unit + this.xSliver) * column + 1
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "p", true)
    }


    _draw_w() {
      let column = 0
      let row = 5
      let left = (this.unit + this.xSliver) * column + 1
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "w", true)
    }


    _draw_f() {
      let column = 1
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "f", true)
    }


    _draw_v() {
      let column = 1
      let row = 4
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "v", true)
    }


    _draw_θ() {
      let column = 2
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "θ", true)
    }


    _draw_ð() {
      let column = 2
      let row = 4
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ð", true)
    }


    _draw_n() {
      let column = 3
      let row = 0
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row + 1
      this._drawRect(left, top, "n", true)
    }


    _draw_d() {
      let column = 3
      let row = 1
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "d", true)
    }


    _draw_t() {
      let column = 3
      let row = 2
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "t", true)
    }


    _draw_s() {
      let column = 3
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "s", true)
    }


    _draw_z() {
      let column = 3
      let row = 4
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "z", true)
    }


    _draw_ɹ() {
      let column = 3
      let row = 5
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ɹ", true)
    }


    _draw_l() {
      let column = 3
      let row = 6
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "l", true)
    }


    _draw_ʤ() {
      let column = 4
      let row = 1
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ʤ", true)
    }


    _draw_ʧ() {
      let column = 4
      let row = 2
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ʧ", true)
    }


    _draw_ʃ() {
      let column = 4
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ʃ", true)
    }


    _draw_ʒ() {
      let column = 4
      let row = 4
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "ʒ", true)
    }


    _draw_j() {
      let column = 5
      let row = 5
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "j", true)
    }



    _draw_ŋ() {
      let column = 7
      let row = 0
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row + 1
      this._drawRect(left, top, "ŋ", true)
    }


    _draw_k() {
      let column = 7
      let row = 1
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "k", true)
    }


    _draw_g() {
      let column = 7
      let row = 2
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "g", true)
    }


    _draw_x() {
      let column = 7
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "x", true)
    }


    _draw_h() {
      let column = 9
      let row = 3
      let left = (this.unit + this.xSliver) * column
      let top = (this.unit + this.ySliver) * row
      this._drawRect(left, top, "h", true)
    }


    _drawRect(left, top, phoneme, outline) {
      this.context.strokeRect(left, top, this.unit, this.unit)
      this._drawText(left, top, phoneme)
    }


    _drawText(left, top, phoneme) {
      let textString = "/" + phoneme + "/"
      let width = this.context.measureText(textString).width

      left += (this.unit - width) / 2
      top += this.lineHeightAdjust

      this.context.fillText(textString, left, top)
    }


    _drawPlace(left, top, label) {
      let width = this.context.measureText(label).width

      top += width
      
      this.context.save()
      this.context.translate(left, top)
      this.context.rotate(-Math.PI/2);
      this.context.fillText(label, 0, 0);
      this.context.restore();
    }


    _drawManner(left, top, label) {
      let width = this.context.measureText(label).width
      left =  left * (this.unit + this.xSliver) 
      left = left + (this.unit - width) / 2

      top = top * (this.unit + this.ySliver)
                + (this.unit + this.labelSize) / 2 - 3

      this.context.fillText(label, left, top)
    }
  }


})(window.lexogram)