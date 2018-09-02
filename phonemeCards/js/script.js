/* phonemes.js )*
 *
 * 
**/



;(function phonemesLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }


  let font = new FontFace(
    'GentiumPlusW'
  , 'url(fonts/GentiumPlus-R.woff)'
  )

  font.load().then(function() {
    lx.vowels = new Phonemes()
  })



  class Phonemes {
    constructor() {
      this.canvas = document.querySelector("canvas")
      this.context = this.canvas.getContext("2d")
      this._createCanvas()
      this._setFont()

      let diphthongs = [
        "ju"
        , "aɪ"
        , "ɪə"
        , "eɪ"
        , "ɔɪ"
        , "ɛə"
        , "aʊ"
        , "ʊə"
        , "əʊ"
      ]

      let phonemes = [
        "iː"
        , "uː"
        , "ɪ"
        , "ʊ"
        , "ə"
        , "ɜː"
        , "ɛ"
        , "ʌ"
        , "ɔː"
        , "æ"
        , "ɑː"
        , "ɒ"

        , "m"
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

      this.scores = {
        "ə": 1
        , "ɪ": 1
        , "iː": 2
        , "ɛ": 2
        , "ɜː": 3
        , "æ": 3
        , "uː": 4
        , "eɪ": 4
        , "ʌ": 4
        , "aɪ": 5
        , "ɑː": 5
        , "əʊ": 6
        , "ɒ": 6
        , "aʊ": 7
        , "ɔː": 8
        , "ʊ": 8
        , "ɔɪ": 9
        , "ju": 9
        , "ɪə": 10
        , "ʊə": 10
        , "ɛə": 10

        , "n": 1
        , "ɹ": 1
        , "t": 1
        , "s": 2
        , "d": 2
        , "l": 2

        , "k": 3
        , "ð": 3

        , "m": 4
        , "z": 4
        , "p": 4
        , "v": 4
        , "w": 4
        , "b": 4

        , "f": 5
        , "h": 5

        , "ŋ": 6
        , "ʃ": 6
        , "j": 6
        , "g": 6
        , "ʤ": 6
        , "ʧ": 6

        , "θ": 7
        , "ʒ": 8
        , "x": 10
      }

      this.examples = {
        "ə": "unnaccented vowel"
        , "ɪ": "(i)t b(u)sy w(o)men ..."
        , "iː": "b(e) s(ee) s(ea) ..."
        , "ɛ": "th(e)m s(ai)d br(ea)d ..."
        , "ɜː": "h(e)r g(ir)l w(or)d ..."
        , "æ": "(a)t mer(i)ngue pl(ai)t"
        , "uː": "d(o) s(oo)n bl(ue) ..."
        , "eɪ": "th(ey) d(ay) p(ai)d ..."
        , "ʌ": "s(u)n s(o)n d(oe)s ..."
        , "aɪ": "t(i)m(e) wh(y) h(igh) ..."
        , "ɑː": "c(ar) h(ear)t (au)nt ..."
        , "əʊ": "g(o) kn(ow) t(oe) ..."
        , "ɒ": "(o)n (o)ff w(a)tch ..."
        , "aʊ": "n(ow) (ou)t h(ou)s(e) ..."
        , "ɔː": "f(or) f(our) d(oor) ..."
        , "ʊ": "g(oo)d p(u)t w(o)man"
        , "ɔɪ": "b(oy) p(oi)nt b(uoy)"
        , "ju": "n(ew) (u)s(e) d(ue) ..."
        , "ɪə": "y(ear) b(eer) h(ere) ..."
        , "ʊə": "s(ure) p(oor) t(our)"
        , "ɛə": "th(ere) p(air) pr(ayer) ..."

        , "n": "fu(n) fu(nn)y (kn)ow ..."
        , "ɹ": "ve(r)y so(rr)y (wr)ite ..."
        , "t": "bu(t) bu(tt)er loo[k](ed) ..."
        , "s": "u(s) cla(ss) fa(c)[e] ..."
        , "d": "an(d a(dd)"
        , "l": "Eng(l)ish a(ll)"

        , "k": "(k)id (c)at so(ck) ..."
        , "ð": "(th)e wi(th)"

        , "m": "su(m) su(mm)er bo(mb) autu(mn)"
        , "z": "(z)oo pu(zz)le i(s) ..."
        , "p": "u(p) u(pp)er"
        , "v": "ha(v)e sa(vv)y o(f) Ste(ph)en"
        , "w": "(w)as (wh)en (o)ne ..."
        , "b": "(b)e ra(bb)it"

        , "f": "i(f) o(ff) (ph)one lau(gh)"
        , "h": "(h)ello (wh)o"

        , "ŋ": "si(ng) i(n)[k] u(n)[c]le to(ngue)"
        , "ʃ": "(sh)e ma(ch)ine (s)ure ..."
        , "j": "(y)es (u)se (Eu)rope ..."
        , "g": "(g)o e(gg) va(gue) ..."
        , "ʤ": "(j)u(dg)e a(g)[e] (sol(d)ier) ..."
        , "ʧ": "mu(ch) wa(tch) ques(ti)on ..."

        , "θ": "(th)in bo(th)"
        , "ʒ": "oran(ge) plea(s)ure equa(ti)on"
        , "x": "lo(ch)"
      }

      this.rounded = "uːɔːɒ"

      this.strokeColour = "#000"

      let total = 2
      for ( let ii = 0; ii < total; ii += 1 ) {
        this.column = 0
        this.row += 1

        this.colour = this.red

        this._drawPhonemes(diphthongs)

        this.colour = this.black

        this._drawPhonemes(phonemes)
      }
    }


    _createCanvas() {
      this.canvas = document.querySelector("canvas")
      this.context = this.canvas.getContext("2d")

      this.columns = 8
      this.pageRows = 12

      this.halfUnit = 60
      this.unit = this.halfUnit * 2
      this.width = this.unit * this.columns + 30
      this.height = this.unit * this.pageRows + 1
      this.canvas.width  = this.width
      this.canvas.height = this.height

      this.row = -1
    }


    _setFont() {
      this.symbolFont = "66px GentiumPlusW"
      this.exampleFont  = "20px GentiumPlusW"
      this.scoreFont  = "24px GentiumPlusW"

      this.red = "#500"
      this.black = "#000"
      this.grey = "#999"

      this.symbolAdjust = 85
      this.exampleHeight = 30
      this.exampleTop = 21
      this.scoreAdjust = 8  

      this.symbolOpacity = 0.67
    }


    _drawPhonemes(phonemes) {
      let _drawPhoneme = (phoneme) => {
        this._drawRect(phoneme)
        
        if (++this.column === this.columns) {
          this.row++
          this.column = 0
        }
      }

      phonemes.forEach(_drawPhoneme)
    }


    _drawRect(phoneme, circle) {
      this.context.lineWidth = 1
      this.context.fillStyle = this.colour
      this.context.strokeStyle = this.strokeColour

      let left = this.column * this.unit
      let top = this.row * this.unit

      if (this.rounded.indexOf(phoneme) < 0 ) {

      } else {
        this._drawCircle(left, top)
      }

      this.context.strokeRect(left, top, this.unit, this.unit)
    
      this._drawExamples(left, top, this.examples[phoneme])
      this._drawSymbol(left, top, phoneme)
      this._drawScore(left, top, this.scores[phoneme])
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

      this.context.strokeStyle = this.strokeColour
      this.context.lineWidth = 1
    }


    _drawSymbol(left, top, phoneme) {
      this.context.fillStyle = this.colour
      this.context.font = this.symbolFont
      let textString = "/" + phoneme + "/"
      let width = this.context.measureText(textString).width

      left += (this.unit - width) / 2
      top += this.symbolAdjust

      this.context.globalAlpha = this.symbolOpacity
      this.context.fillText(textString, left, top)
      this.context.globalAlpha = 1
    }


    _drawScore(left, top, score) {
      this.context.font = this.scoreFont
      this.context.fillStyle = this.black

      let textString = "" + score
      let width = this.context.measureText(textString).width

      left += this.unit - width - this.scoreAdjust
      top += this.unit - this.scoreAdjust

      this.context.fillText(textString, left, top)

    }

    _drawExamples(left, top, examples) {
      this.context.font = this.exampleFont
      this.context.fillStyle = this.grey
      this.context.textAlign = "center"

      left += this.halfUnit
      top += this.exampleTop

      let lineHeight = this.exampleHeight
      let textString = examples.split(/[()[\]]/).join("")
      let textArray = textString.split(" ")
      let index = textArray.indexOf("...")

      if (index < 0) {
        switch (textArray.length) {
          case 3:
            textArray.splice(2, 0, "  ")
          break
          case 2:
            lineHeight = lineHeight * 3
        }
      } else {
        textArray.splice(index, 1)
        index = textArray.length - 1
        textArray.splice(index, 0, "...")
      }

      let word
        , width

      while(word = textArray.shift()) {
        this.context.fillText(word, left, top, this.unit)
        top += lineHeight
      }
       
      this.context.textAlign = "left"
    }
  }



  lx.phonemes = new Phonemes()
  
})(window.lexogram)