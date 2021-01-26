const Tonic = require('.')

class HelloWorld extends Tonic {
  render () {
    return this.html`
      <h1>
        ${JSON.stringify(this.props.greetings[this.props.lang])}
      </h1>
    `
  }
}

class MainComponent extends Tonic {
  render () {
    const greetings = { en: 'Hello' }

    return this.html`
      <header>
        Example
      </header>
      <main>
        <hello-world id="hello" lang="en" greetings="${greetings}">
        </hello-world>
      </main>
      <footer>
      </footer>
    `
  }
}

Tonic.add(HelloWorld)
Tonic.add(MainComponent)

const c = new MainComponent()

console.log(c.preRender())
