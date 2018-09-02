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
    lx.vowels = new Vowels()
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



  class Vowels {
    constructor(image) {
      this._createCanvas()
      this._drawGrid()
      this._setFont()

      let phonemes = [
          "ju"
        , "aɪ"
        , "ɪə"
        , "eɪ"
        , "ɔɪ"
        , "ɛə"
        , "aʊ"
        , "ʊə"
        , "əʊ"

        , "a"
        , "e"
        , "o"

        , "i"
        , "u"
        , "ɪ"
        , "ʊ"
        , "ə"
        , "ɜ"
        , "ɛ"
        , "ʌ"
        , "ɔ"
        , "æ"
        , "ɑ"
        , "ɒ"
      ]

      this.diphthongColour = "#900"
      this.pureVowelColour = "#000" // 999"
      this.benchmarkColour = "#bbb"

      this.ə = {
        x: this.spacing * 3.37
      , y: this.sliver * 35
      }
      this.a = {
        x: this.spacing * 3.2
      , y: this.sliver * 52.6
      }
      this.ʊ = {
        x: this.spacing * 4.75
      , y: this.sliver * 14
      }
      this.ɪ = {
        x: this.spacing * 1.75
      , y: this.sliver * 9
      }
      this.ɛ = {
        x: this.spacing * 1.25
      , y: this.sliver * 44.5
      }
      this.e = {
        x: this.spacing * 0.85
      , y: this.sliver * 24.5
      }
      this.ɔ = {
        x: this.spacing * 5.23
      , y: this.sliver * 44.55
      }

      phonemes.forEach(this._drawPhoneme.bind(this))
    }


    _createCanvas() {
      this.canvas = document.querySelector("canvas")
      this.context = this.canvas.getContext("2d")
      
      this.sliver = 23.5
      this.halfUnit = 60
      this.unit = this.halfUnit * 2
      this.spacing = this.unit * 1.4
      this.width = 960
      this.height = 1405

      this.canvas.width  = this.width
      this.canvas.height = this.height
    }


    _drawGrid() {
      let ctx = this.context
      let left   = this.sliver
      let top    = this.sliver
      let right  = this.width - this.sliver
      let bottom = this.height - this.sliver

      let inset   = this.halfUnit * 4
      let instep  = this.unit * 0.9
      let downStep = this.unit * 4.65
      let third = top + downStep
      let twoThirds = this.unit * 8.72

      ctx.lineWidth = this.sliver * 2
      ctx.strokeStyle = "#ddd"

      ctx.beginPath()
      ctx.moveTo(left,  top)
      ctx.lineTo(right, top)
      ctx.lineTo(right, bottom)
      ctx.lineTo(inset, bottom)
      ctx.lineTo(left, top - this.sliver * 2)

      ctx.moveTo(left + instep, third)
      ctx.lineTo(right, third)

      ctx.moveTo(left + instep * 1.5, twoThirds)
      ctx.lineTo(right, twoThirds)
      ctx.stroke()
    }


    _setFont() {
      this.context.font = "66px GentiumPlusW"
      this.context.fillStyle = "#900"
      this.lineHeightAdjust = 80
    }


    _drawPhoneme(phoneme) {
      this["_draw_"+phoneme]()
    }

    
    _draw_ju() {
      this.colour = this.diphthongColour

      let left = this.spacing * 4
      let top = this.sliver + this.unit / 2
      this._drawRect(left, top, "ju")
    }

    
    _draw_aɪ() {
      let mid = {
        x: this.spacing * 2 // 1.875
      , y: this.sliver * 24.5
      }
      this._drawQuadraticBezierCurve(this.a, mid, this.ɪ, "aɪ")
    }

    
    _draw_ɪə() {
      let mid = {
        x: this.spacing * 2.35
      , y: this.sliver * 18
      }
      this._drawQuadraticBezierCurve(this.ɪ, mid, this.ə, "ɪə")
    }

    
    _draw_eɪ() {
      let mid = {
        x: this.spacing * 1.125
      , y: this.sliver * 18
      }
      this._drawQuadraticBezierCurve(this.e, mid, this.ɪ, "eɪ")
    }

    
    _draw_ɔɪ() {
      let mid = {
        x: this.spacing * 3.375
      , y: this.sliver * 18
      }
      this._drawQuadraticBezierCurve(this.ɔ, mid, this.ɪ, "ɔɪ")
    }

    
    // _draw_ɛə() {
    //   let mid = {
    //     x: this.spacing * 1.85
    //   , y: this.sliver * 35
    //   }
    //   this._drawQuadraticBezierCurve(this.ɛ, mid, this.ə, "ɛə")
    // }

    
    _draw_ɛə() {
      let mid = {
        x: this.spacing * 2.07
      , y: this.sliver * 38.6
      }
      this._drawQuadraticBezierCurve(this.ɛ, mid, this.ə, "ɛə")
    }

    
    _draw_aʊ() {
      let mid = {
        x: this.spacing * 4.95
      , y: this.sliver * 31
      }
      this._drawQuadraticBezierCurve(this.a, mid, this.ʊ, "aʊ")    }

    
    _draw_əʊ() {
      let mid = {
        x: this.spacing * 4.5
      , y: this.sliver * 24.5
      }
      this._drawQuadraticBezierCurve(this.ə, mid, this.ʊ, "əʊ")
    }

    
    _draw_ʊə() {
      let mid = {
        x: this.spacing * 3.375
      , y: this.sliver * 24.5
      }
      this._drawQuadraticBezierCurve(this.ʊ, mid, this.ə, "ʊə")
    }

    // Pure versions of diphthongs //

    _draw_a() {
      this.colour = this.benchmarkColour
      let left = this.a.x - this.halfUnit
      let top = this.a.y - this.halfUnit
      this._drawRect(left, top, "a", "none")
    }

    
    _draw_e() {
      let left = this.e.x - this.halfUnit
      let top = this.e.y - this.halfUnit
      this._drawRect(left, top, "e", "none")
    }

    
    _draw_o() {
      let left = this.spacing * 5.1
      let top = this.sliver * 22.0
      this._drawRect(left, top, "o", "none")
    }

    // Pure vowels //

    _draw_i() {
      this.colour = this.pureVowelColour

      this.context.fillStyle = "#000"
      this.context.strokeStyle = "#000"

      let left = this.spacing * 0.125
      let top = this.sliver
      this._drawRect(left, top, "i")
    }


    _draw_u() {
      let left = this.spacing * 4.875
      let top = this.sliver
      this._drawRect(left, top, "u", true)
    }

    
    _draw_ɪ() {
      let left = this.ɪ.x - this.halfUnit // this.unit * 1.25
      let top = this.ɪ.y - this.halfUnit // this.unit * .5 // 1.25
      this._drawRect(left, top, "ɪ")
    }

    
    _draw_ʊ() {
      let left = this.ʊ.x - this.halfUnit
      let top = this.ʊ.y - this.halfUnit
      this._drawRect(left, top, "ʊ")
    }

    
    _draw_ə() {
      let left = this.ə.x - this.halfUnit // this.unit
      let top = this.ə.y - this.halfUnit // this.height - this.unit * 3
      this._drawRect(left, top, "ə")
    }

    
    _draw_ɜ() {
      let left = this.spacing * 3
      let top = this.sliver * 42
      this._drawRect(left, top, "ɜ")
    }

    
    _draw_ɛ() {
      let left = this.ɛ.x - this.halfUnit // this.unit
      let top = this.ɛ.y - this.halfUnit // this.height - this.unit * 3
      this._drawRect(left, top, "ɛ")
    }

    
    _draw_ʌ() {
      let left = this.spacing * 4.1
      let top = this.sliver * 42
      this._drawRect(left, top, "ʌ")
    }

    
    _draw_ɔ() {
      let left = this.ɔ.x - this.halfUnit // this.width - this.unit
      let top = this.ɔ.y - this.halfUnit // this.height - this.unit * 3
      this._drawRect(left, top, "ɔ", true)
    }

    
    _draw_æ() {
      let left = this.spacing * 1.15
      let top = this.sliver * 50
      this._drawRect(left, top, "æ")
    }

    
    _draw_ɑ() {
      let left = this.spacing * 4.1
      let top = this.sliver * 54
      this._drawRect(left, top, "ɑ")
    }

    
    _draw_ɒ() {
      let left = this.spacing * 4.875
      let top = this.sliver * 54
      this._drawRect(left, top, "ɒ", true)
    }


    _drawRect(left, top, phoneme, outline) {
      this.context.lineWidth = 1
      this.context.strokeStyle = this.colour
      this.context.fillStyle = this.colour

      if (outline === "none") {

      } else {
        this.context.clearRect(left, top, this.unit, this.unit)

        if (outline) {
          this._drawCircle(left, top)
        }

        if (outline !== 1) {
          this.context.strokeRect(left, top, this.unit, this.unit)
        }
      }

      this._drawText(left, top, phoneme)
    }


    _drawText(left, top, phoneme) {
      let textString = "/" + phoneme + "/"
      let width = this.context.measureText(textString).width

      left += (this.unit - width) / 2
      top += this.lineHeightAdjust

      this.context.fillText(textString, left, top)
    }


    _drawCircle(left, top) {
      this.context.beginPath()
      let width = 20
      let x = left + this.halfUnit
      let y = top + this.halfUnit
      let radius = this.halfUnit - width / 2
      this.context.arc(x, y, radius, 0, Math.PI * 2)
      this.context.lineWidth = width
      this.context.strokeStyle = "#eee"
      this.context.stroke()

      this.context.strokeStyle = this.colour
      this.context.lineWidth = 1
    }


    _drawQuadraticBezierCurve(start, mid, end, phoneme) {
      let left = mid.x - this.halfUnit
      let top = mid.y - this.halfUnit

      this.context.lineWidth = 1
      this.context.strokeStyle = this.colour
      this.context.clearRect(left, top, this.unit, this.unit)
      this.context.strokeRect(left, top, this.unit, this.unit)

      this.context.lineWidth = 5
      this.context.strokeStyle = "#fcc"
      this.context.fillStyle = "#fcc"

      let controlX = 2 * mid.x - start.x / 2 - end.x / 2
      let controlY = 2 * mid.y - start.y / 2 - end.y / 2

      this.context.beginPath()
      this.context.moveTo(start.x, start.y)
      this.context.quadraticCurveTo(
        controlX
        , controlY
        , end.x
        , end.y
      )
      this.context.stroke()

      this._drawArrow(start, end, mid)

      this.context.fillStyle = this.colour
      this._drawText(left, top, phoneme)
    }


    _drawArrow(start, end, mid) {      
      let x = (start.x - end.x) / 2
      let y = (start.y - end.y) / 2
      let adjust = Math.sqrt(x * x + y * y)
      let height = Math.sqrt(3) / 2

      x = x * this.halfUnit / adjust
      y = y * this.halfUnit / adjust

      // console.log(x, y, mid)

      let x1 = mid.x + x * height + y / 2
      let y1 = mid.y + y * height - x / 2

      let x2 = x1 - y
      let y2 = y1 + x

      // console.log(x1, y1, " — ", x2, y2)

      this.context.beginPath()
      this.context.moveTo(mid.x, mid.y)
      this.context.lineTo(x1, y1)
      this.context.lineTo(x2, y2)
      this.context.closePath()
      this.context.fill()
      // this.context.stroke()
    }
  }


})(window.lexogram)