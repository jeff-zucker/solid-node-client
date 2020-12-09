export function initHandlers(handlers){
  let newHandlers = {};
  handlers = handlers || {};
  handlers.https = typeof handlers.https != 'undefined'
                 ? handlers.https
                 : "solid-client-authn-node";
  handlers.file = typeof handlers.file != 'undefined'
                 ? handlers.file
                 : "solid-rest-file";
  handlers.fallback = typeof handlers.fallback != 'undefined'
                 ? handlers.fallback
                 : "solid-rest-file";
  let protocols = Object.keys( handlers);
  for( let protocol of protocols ){
     let h = getAuthSession( handlers[protocol] );
     if(h) newHandlers[protocol] = h
  }
  return(newHandlers);
}

function getAuthSession( handler){
  if(typeof handler === 'undefined' || !handler) return null;
  if(typeof handler != 'string'){
    // console.log('Using custom auth handler.');
    return handler;
  }
  if(handler==='solid-client-authn-node'){
    // console.log('Using solid-client-authn-node')
    const {EssAuthSession} = require("./EssAuthSession");
    return new EssAuthSession();
  }
  else if(handler==='solid-auth-fetcher'){
    // console.log('using solid-auth-fetcher')
    const {NssAuthSession} = require("./NssAuthSession");
    return new NssAuthSession();
  }
  else if(handler.match(/solid-rest/)){
    const Rest = require('../node_modules/solid-rest')
    const {NoAuthSession} = require('./NoAuthSession')
    if(handler==='solid-rest-file'){
      // console.log('using solid-rest-file')
      // TBD call solid-rest-file when rest repo is reorganized
      return new NoAuthSession({rest:new Rest()});
    }
    else if(handler==='solid-rest-mem'){
      // console.log('using solid-rest-mem')
      // TBD call solid-rest-mem when rest repo is reorganized
      return new NoAuthSession({rest:new Rest()});
    }
  }
}
// ENDS