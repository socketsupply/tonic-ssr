const parse = require('parse5')

// eslint-disable-next-line
global.root = { toString () {} }
const registry = {}
global.document = {}

global.window = {
  HTMLElement: class {
    constructor () {
      this.children = []
      this.childNodes = []
      this.attributes = []
      this.id = this._id = 'ssr'
      this.elementName = this.constructor.name
    }

    getRootNode () {
      return this
    }

    disabledClientSideCallbacks () {
      this.willConnect = () => {}
      this.connected = () => {}
      this.updatedd = () => {}
      this.disconnected = () => {}
    }

    async visit (node) {
      const Component = registry[node.tagName]

      if (Component) {
        const c = new Component()
        c.disabledClientSideCallbacks()
        c.attributes = node.attrs
        c.connectedCallback()

        if (c.stylesheet && !Tonic._stylesheetRegistry[node.tagName]) {
          Tonic._stylesheetRegistry[node.tagName] = c.stylesheet()
        }

        const t = await c.render()
        const frag = parse.parseFragment(t.rawText)
        node.childNodes.push(...frag.childNodes)
      }

      for (const child of node.childNodes) {
        if (child.childNodes) await this.visit(child)
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

    async preRender () {
      const t = await this.render()
      Object.assign(this, parse.parseFragment(t.rawText))

      this.disabledClientSideCallbacks()

      this.connectedCallback()
      await this._set(this.root, this.render)

      const nodes = this.querySelectorAll(Tonic._tags)

      for (const node of nodes) {
        await this.visit(node)
      }

      const styles = Object.values(Tonic._stylesheetRegistry).join('\n')
      const styleNode = parse.parseFragment(`<style>${styles}</style>`)
      this.childNodes.unshift(styleNode.childNodes[0])

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
