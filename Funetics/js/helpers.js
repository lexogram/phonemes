/** helpers.js **
 *
 * Creates the global lexogram.helpers instance. You can register a
 * callback to receive a (debounced) event. Events currently handled:
 * 
 * - window.resize
 * 
 * To add more events, edit the Helpers constructor, adding new
 * entries like this:
 * 
 *   this._handle("resize", { delay: 200, waitForCompletion: true })
 *
**/



;(function helpersLoaded(lx){
  "use strict"

  if (!lx) {
    lx = window.lexogram = {}
  }



  class Debounce {
    constructor(event, callback, delay, waitForCompletion) {
      this.event = event        // should be an event object
      this.callback = callback  // must be a function
      this.delay = delay        // should be a positive number
      this.waitForCompletion = !! waitForCompletion // may be truthy

      this.timeout = 0

      this._setTimeout()
    }


    update(event) {
      if (this.waitForCompletion) {
        this._setTimeout()
      }

      this.event = event
    }


    _setTimeout() {
      clearTimeout(this.timeout)
      this.timeout = setTimeout(this._trigger.bind(this), this.delay)
    }


    _trigger() {
      this.callback(this.event)
      this.callback = this.event = null
    }
  }



  class Helpers {
    constructor() {
      this.listeners = {}
      this.buffers = {}

      //// <<< HARD-CODED
      //   If you don't want any debounce delay, then simply
      //   omit the debounce data object
      this._handle("resize", { delay: 200, waitForCompletion: true })
      //// HARD-CODED >>>
    }


    registerListener(eventType, callback) {
      let listeners = this.listeners[eventType]
      if (!listeners) {
        listeners = []
        this.listeners[eventType] = listeners
      }

      if (listeners.indexOf(callback) < 0) {
        listeners.push(callback)
      }
    }


    unregisterListener(eventType, callback) {
      let listeners = this.listeners[eventType]
      if (listeners) {

        let index = listeners.indexOf(callback)
        if (index < 0) {
          return
        } 

        listeners.splice(index, 0)
      }
    }


    _handle(eventType, debounceData) {
      if (debounceData) {
        this.buffers[eventType] = debounceData
      }

      window.addEventListener(eventType, this._debounce.bind(this))
    }


    _debounce(event) {
      let eventType = event.type
      let eventBuffer = this.buffers[eventType]

      if (!eventBuffer) {
        // Act without delay!
        this._broadcast(event)
      }

      // Wait ...
      let debounce = eventBuffer.debounce

      if (!debounce) {
        eventBuffer.debounce = new Debounce(
          event
        , this._broadcast.bind(this)
        , eventBuffer.delay
        , !!eventBuffer.waitForCompletion
        )

      } else {
        debounce.update(event)
      }
    }


    _broadcast(event) {
      let eventType = event.type
      let listeners = this.listeners[eventType]

      // If this call comes from a Debounce instance. delete it
      let eventBuffer = this.buffers[eventType]
      if (eventBuffer) {
        delete eventBuffer.debounce
      }

      listeners.forEach((listener) => {
        listener(event)
      })
    }
  }



  lx.helpers = new Helpers()
  
})(window.lexogram)