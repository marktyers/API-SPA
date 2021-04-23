/* index.js */

import { Application, send, Status } from "https://deno.land/x/oak@v6.5.1/mod.ts";
// status codes https://deno.land/std@0.82.0/http/http_status.ts
import { Md5 } from 'https://deno.land/std@0.89.0/hash/md5.ts'
import { getEtag, setHeaders } from "./api/modules/util.js";
import { login } from "./api/modules/accounts.js";

import router from "./api/routes.js";

const port = 8080;

const app = new Application();

// checks if file exists
async function fileExists(path) {
  try {
    const stats = await Deno.lstat(path);
    return stats && stats.isFile;
  } catch (e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }
}

async function staticFiles(context, next) {
	const path = `${Deno.cwd()}/spa/${context.request.url.pathname}`
	const isFile = await fileExists(path)
	if (isFile) {
		// file exists therefore we can serve it
		console.log(path)
		const etag = await getEtag(path)
		console.log(`etag: ${etag}`)
		context.response.headers.set('ETag', etag)
		await send(context, context.request.url.pathname, {
			root: `${Deno.cwd()}/spa`,
		})
	} else {
		await next()
	}
}

async function errorHandler(context, next) {
  try {
    const method = context.request.method;
    const path = context.request.url.pathname;
    console.log(`${method} ${path}`);
    await next();
  } catch (err) {
    console.log(err);
    context.response.status = Status.InternalServerError;
    const msg = { err: err.message };
    context.response.body = JSON.stringify(msg, null, 2);
  }
}

app.use(staticFiles);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(setHeaders);
app.use(errorHandler);

app.addEventListener(
  "listen",
  ({ port }) => console.log(`listening on port: ${port}`),
);
console.log(Deno.cwd())
await app.listen({ port });
