const parse = require('parse5')

const registry = {}
global.document = {}

// eslint-disable-next-line
global.root = { toString () {} }

global.window = {
  HTMLElement: class {
    constructor () {
      this.children = []
      this.childNodes = []
      this.attributes = []
      this.id = this._id = 'root'
    }

    getRootNode () {
      return {}
    }

    disabledClientSideCallbacks () {
      this.connected = () => {}
      this.updatedd = () => {}
      this.disconnected = () => {}
    }

    initElements () {
      const elements = this.querySelectorAll(Tonic._tags)

      for (const element of elements) {
        const Component = registry[element.tagName]

        const c = new Component()
        c.disabledClientSideCallbacks()
        c.attributes = element.attrs

        c.willConnect = () => {
          c.initElements()
          c._set(c.root, c.render)
        }

        c.connectedCallback()

        const frag = parse.parseFragment(c.innerHTML)
        element.childNodes.push(...frag.childNodes)
      }
    }

    querySelectorAll (s) {
      const tags = s.split(',')
      const elements = []

      const find = (node, tagName) => {
        for (const child of node.childNodes) {
          if (child.tagName === tagName) elements.push(child)
          if (child.childNodes) find(child, tagName)
        }
      }

      for (const tagName of tags) {
        find(this, tagName)
      }

      return elements
    }

    preRender () {
      const t = this.render()
      Object.assign(this, parse.parseFragment(t.rawText))

      this.disabledClientSideCallbacks()

      this.willConnect = () => {
        this.initElements()
        this._set(this.root, this.render)
      }

      this.connectedCallback()

      return parse.serialize(this)
    }
  },
  customElements: {
    define: (id, c) => (registry[id] = c),
    get: (id) => registry[id]
  },
  customEvent: () => {}
}

const Tonic = require('@optoolco/tonic')

module.exports = Tonic
