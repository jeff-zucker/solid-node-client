import { Session } from "@inrupt/solid-client-authn-node";

export class EssAuthSession {
  session:any
  async login(options:any) {
    options = options || {
                token : process.env.ESS_TOKEN,
             clientId : process.env.ESS_CLIENT_ID,
         clientSecret : process.env.ESS_SECRET,
           oidcIssuer : process.env.ESS_ISSUER,
    };
    const sess = new Session();
    await sess.login({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      refreshToken: options.token,
      oidcIssuer: options.oidcIssuer,
    });
    this.session=sess;
    return sess;
  }
}
// ENDS