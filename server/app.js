const root = process.cwd()
const koa = require('koa')
const koaRouter = require('koa-router')
const koaStatic = require('koa-static')
const koaCompress = require('koa-compress')

const port = 8430
const app = new koa()
const router = new koaRouter()

module.exports = function() {
  router.get('/apis/list', async function(ctx, next) {
    ctx.body = {
      code: 0,
      data: [{ a: 1 }, { a: 2 }],
      msg: 'success'
    }
  })

  router.post('/apis/update', async function(ctx) {
    ctx.body = {
      code: 0,
      data: {
        name: 'xiaows'
      },
      msg: 'success'
    }
  })

  app.use(koaCompress())

  app.use(router.routes()).use(router.allowedMethods())

  app.use(koaStatic(root, { gzip: true }))

  app.listen(port, function() {
    console.log(`✨ Server Run on http://localhost:${port}`)
  })
}
