global.pino = require('pino')({
  name: process.env.APP_NAME,
  prettyPrint: 'true'
});

require('dotenv').config({ silent: true });
require('./lib/mongoose');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

global.nconf = require('nconf');
nconf.env('__');

global.Services = require('./services');

const logger = require('koa-pino-logger')

const app = new Koa();
const router = new Router();
app.use(bodyParser());
app.use(router.routes())
  .use(router.allowedMethods());
app.use(logger({
  logger: pino
}));

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

router.post('/fulfill', (ctx) => {
  console.log(JSON.stringify(ctx.request.body));
  const result = ctx.request.body.queryResult;
  const service = result.action.split('.')[0];
  const action = result.action.split('.')[1];
  return Services.Fulfillment[service][action](result).then((body) => {
    ctx.body = {
      fulfillmentText: body.join('\n')
    };
  }).catch((err) => {
    ctx.body = {
      fulfillmentText: err.message
    };
  })
});
router.get('/', (ctx) => {
  ctx.body = {
    name: 'testlab hooked'
  }
});
app.getMaxListeners();
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err => {
  pino.info(`Server started at ${PORT}`);
}));