import {initHandlers} from './getAuthSession';
const UrlObj = require('url');

export class SolidNodeClient {
  session?:any;
  debug?:any;
  handlers?:any;
  parser?:any;
  constructor(options:any={}){
    options = options || {};
    this.handlers = initHandlers( options.handlers );
    this.debug = false;
    return this;
  }
  async fetch(url:string,options:any) {
    let protocol = new UrlObj.URL(url).protocol.replace(/:$/,'');
    let _fetch = this.handlers[protocol] && this.handlers[protocol].session 
               ? this.handlers[protocol].session.fetch 
               : this.handlers.fallback.fetch;
    return await _fetch(url.toString(),options)
  }
  async login(options:any={}) {
    options = options || {}
    let session = await this.handlers.https.login(options);
    return session  || this.handlers.fallback.session;
  }
  async logout() {
    if(this.session.info.isLoggedIn) {
      await this.session.logout();
    }
     this.session = this.handlers.fallback;
  }
  async currentSession(){
    return ( this.session.loggedIn ) ? this.session : null ;
  }
  async createServerlessPod( base:string ){
    return this.handlers.fallback.createServerlessPod( base );
  }
}

/** INTERFACES
 */
interface InodeClient {
  session? : any;
  rest? : any;
  debug? : any;
  authFetcher? : any;
  fetch(url:string,options:any):any;
  login(options:IloginOptions):any;
  logout():void;
}
  interface IloginOptions {
    idp? : string,
    username? : string,
    password? : string,
    debug? : boolean,
    rest? : any,
  }
