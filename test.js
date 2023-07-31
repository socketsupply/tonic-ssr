import test from 'node:test'
import assert from 'node:assert'
import { Tonic } from './index.js'

const sleep = t => new Promise(resolve => setTimeout(resolve, t))

class TimeStamp extends Tonic {
  render () {
    return this.html`
      <time>
        Tue Jan 26 22:18:05 CET 2021
      </time>
    `
  }
}

class HelloWorld extends Tonic {
  stylesheet () {
    return `
      hello-world {
        border: ${this.props.border};
      }
    `
  }

  async click () {
    //
    // Won't do anything on the server,
    // will work if rendered in the browser.
    //
  }

  async render () {
    await sleep(200)

    const {
      greetings,
      lang
    } = this.props

    return this.html`
      <h1>
        ${greetings[lang]}
        <time-stamp></time-stamp>
      </h1>
    `
  }
}

class MainComponent extends Tonic {
  constructor (props) {
    super()
    this.props = props
  }

  render () {
    const greetings = { en: 'Hello' }

    return this.html`
      <header>
        ${String(this.props.timestamp)}
      </header>

      <main>
        <hello-world
          id="hello"
          lang="en"
          border="1px solid red"
          greetings="${greetings}"
        >
        </hello-world>
      </main>

      <footer>
      </footer>
    `
  }
}

Tonic.add(TimeStamp)
Tonic.add(HelloWorld)
Tonic.add(MainComponent)

const c = new MainComponent({
  timestamp: 1611695921286
})

test('Simple ssr rendering', async (t) => {
  const expected = `<html><head><style>
      hello-world {
        border: 1px solid red;
      }
    </style></head><body><header>
        1611695921286
      </header>

      <main>
        <hello-world id="hello" lang="en" border="1px solid red" greetings="__ssr__tonic0__">

      <h1>
        Hello
        <time-stamp>
      <time>
        Tue Jan 26 22:18:05 CET 2021
      </time>
    </time-stamp>
      </h1>
    </hello-world>
      </main>

      <footer>
      </footer>
    </body></html>`
  const actual = await c.preRender()

  assert.strictEqual(
    actual.replace(/\s\s+/g, ' '),
    expected.replace(/\s\s+/g, ' '),
    'Renders correctly'
  )
})
