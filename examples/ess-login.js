/* To run  this example, follow the README to get a cookie and replace the 
   values in the $COOKIE variable below with values from the cookie
*/
const {SolidNodeClient} = require('../');

async function main(creds){
  const client = new SolidNodeClient({
    handlers : { https: 'solid-client-authn-node' }
  })
  console.log( `\nlogging in ...` );
  let session = await client.login({
      clientName: $COOKIE.clientName,
        clientId: $COOKIE.clientId,
    clientSecret: $COOKIE.clientSecret,
    refreshToken: $COOKIE.token,
      oidcIssuer: $COOKIE.oidcIssuer
  });
  if( session.info.isLoggedIn ) {
    console.log('Logged in!');
  }
  else {
    console.log(`Couldn't log in.`);
  }
}


