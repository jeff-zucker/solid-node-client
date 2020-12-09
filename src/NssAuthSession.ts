/* Login and return session for NSS/PSS via solid-auth-fetcher
*/

import { getSession, getNodeSolidServerCookie, getAuthFetcher } 
 from "solid-auth-fetcher";

export class NssAuthSession {

  session:any
  authFetcher:any

  async login(options:IloginOptions) {
    options = options || {};
    options.idp      = options.idp || process.env.SOLID_IDP || "";
    options.username = options.username || process.env.SOLID_USERNAME;
    options.password = options.password || process.env.SOLID_PASSWORD;
    options.debug    = options.debug || (process.env.SOLID_DEBUG) ?true :false;
    let self=this;
    return new Promise((resolve, reject) => {
      this._getAuthFetcher( options, (session) => {
        self.session = session;
        resolve(session);
      });
    })
  }

  async _getAuthFetcher(options:IloginOptions,callback:Function){
    let cookie;
    try {
      cookie = await getNodeSolidServerCookie(
        options.idp, options.username, options.password
      );
    }catch(e){
      this.authFetcher = null;
      return callback( null );
    }
    if( !cookie || !cookie.match(/nssidp/) ){
      // couldn't login
      this.authFetcher = null;
      return callback( null );
    }
    this.authFetcher = await getAuthFetcher(
      options.idp, cookie, "https://solid-node-client"
    );
    let session = await getSession();
    this.authFetcher.onSession( async(s) => {
      s.info = {};
      s.info.isLoggedIn = ()=>{ s.loggedIn }
      s.info.webId = s.webId
      s.info.isNss = true
      callback(s);
    });
  }
}
  interface IloginOptions {
    idp? : string,
    username? : string,
    password? : string,
    debug? : boolean,
  }


// ENDS