import { errorHandling, telemetryData } from "./utils/middleware";

function UnauthorizedException(reason) {
  return new Response(reason, {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "Content-Type": "text/plain;charset=UTF-8",
      // Disables caching by default.
      "Cache-Control": "no-store",
      // Returns the "Content-Length" header for HTTP HEAD requests.
      "Content-Length": reason.length,
    },
  });
}

export async function onRequestPost(context) {  // Contents of context object  
    const {
        request, // same as existing Worker API    
        env, // same as existing Worker API    
        params, // if filename includes [id] or [[path]]   
        waitUntil, // same as ctx.waitUntil in existing Worker API    
        next, // used for middleware or to fetch assets    
        data, // arbitrary space for passing data between middlewares 
    } = context;
    const ref=request.headers.get('Referer');
    const url1= new URL(ref)
    const refparam = new URLSearchParams(url1.search);
    const autcode=refparam.get('authcode');
    if(autcode==env.AUTH_CODE){
        const url2 = new URL(request.url)
        const url = new URL(url2.protocol + '//' + url2.host + '/upload' + url2.search);
        
        const clonedRequest = request.clone();
        await errorHandling(context);
        telemetryData(context);
        const response = fetch('https://telegra.ph/' + url.pathname + url.search, {
            method: clonedRequest.method,
            headers: clonedRequest.headers,
            body: clonedRequest.body,
        });
        return response;
    }
    return new UnauthorizedException("error");
}
