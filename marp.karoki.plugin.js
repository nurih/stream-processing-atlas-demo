import { deflateSync } from 'zlib'

const diagramTypes = ['mermaid']

const entrypoint = 'https://kroki.io/'

const marpKrokiPlugin = (md) => {
  const { fence } = md.renderer.rules

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const info = md.utils.unescapeAll(tokens[idx].info).trim()

    if (info) {
      const [lang] = info.split(/(\s+)/g)

      if (diagramTypes.includes(lang)) {
        const data = deflateSync(tokens[idx].content).toString('base64url')
        return `<p><marp-auto-scaling data-downscale-only><img src="${entrypoint}${lang}/svg/${data}"/></marp-auto-scaling></p>`
      }
    }

    return fence.call(self, tokens, idx, options, env, self)
  }
}

export { marpKrokiPlugin }