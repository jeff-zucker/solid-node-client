/** UNAUTHENTICATED SESSION 
 */

import fetch from "node-fetch";

export class NoAuthSession {
  session:any
  rest: any;
  constructor(options:any={}){
    this.session = {
      info : { isLoggedIn:false },
      fetch : this.fetch.bind(this),
      logout : ()=>{},
    }
    this.rest=options.rest;
  }
  createServerlessPod( base ) {
    return this.rest.createServerlessPod(base);
  }
  fetch(url:string,options:any) {
    if( url.startsWith('http') ) return fetch(url,options)
    return this.rest.fetch(url,options);
  }
}

