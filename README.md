# Solid-Node-Client                                                            
                                                                               
-- **a nodejs client for Solid** --    

This library provides access to [Solid](https://solidproject.org/) from the command line and from local scripts and apps which either run in the console or in a local browser based context like electron. It can be used to move resources back and forth between a local commputer and one or more  pods, carry out remote operations on pods, and can also treat your local file system as a serverless pod.

Solid-Node-Client uses [solid-auth-fetcher](https://github.com/solid/solid-auth-fetcher) to provide session management and fetching for https: URLs and uses [solid-rest](https://github.com/solid/solid-rest) to provide solid-like fetches on file: and other non-http URLs.  It supports login and authenticated fetches to NSS servers.  Support for login to other servers will be added in the future.

Solid-node-client can be used stand-alone, or can be used with [rdflib](https://github.com/linkeddata/rdflib.js), [solid-file-client](https://github.com/jeff-zucker/solid-file-client/), and most other Solid apps.  See [creating a serverless pod](#pod) for additional details.

As of version 1.2.0, solid node client now supports multiple logins from the same script. See [below](#multiple) for details
                                                                               
## Synopsis   
**Stand alone usage :**
```javascript               
import { SolidNodeClient } from 'solid-node-client';
const client = new SolidNodeClient();

async function main(){
    let response = await client.fetch('https://example.com/publicResource');
    console.log(await response.text())
    let session = await client.login();
    if( session ) {
        console.log (`logged in as <${session.webId}>`);
        response = await client.fetch('https://example.com/privateResource');
        console.log(await response.text())
        logout();
    }    
}
``` 
**Usage with rdflib :**
```javascript
import {SolidNodeClient} from 'solid-node-client';
import * as $rdf from 'rdflib';
const client = new SolidNodeClient();
const store   = $rdf.graph();
const fetcher = $rdf.fetcher(store,{fetch:client.fetch.bind(client)});  
    // now all rdflib methods support file:// requests in nodejs

async function main(){
    let session = await login();  // may be omitted if you don't need authentication
    // now all rdflib methods support authenticated http: requests in nodejs
}
```
## Installation
                                                                               
**1. install the app**
```                                                                            
  npm install
```

**2. give the app permission**                                                 
                           
Skip this step if you don't need authenticated access to a pod.  To get authenticated access to a pod, you will need to add "https://solid-node-client" as a trusted app on that pod or the portion of it you want to access. See [how to make an app trusted](https://github.com/solid/userguide#manage-your-trusted-applications) for how to do this.                       

## Example: Upload and overwrite a folder in your pod
```sh
export SOLID_IDP=https://solidcommunity.net
export SOLID_USERNAME=user
export SOLID_PASSWORD=...
export SOLID_DEBUG=1
npm ci
npm run build
node examples/uploadOverwrite.js ../something/local/ https://user.solidcommunity.net/private/something/
```

## Methods

### login(options)

Logs the user in to a Solid pod and returns an authenticated session.  Credentials for the login may be set as environment variables in your operating system or passed in the options.  

If these variables are part of your environment, you can use the login() method without arguments.

  * **SOLID_IDP** // the server root e.g. https://solidcommunity.net (no trailing slash)
  * **SOLID_USERNAME** // your username on the server
  * **SOLID_PASSWORD** // your password on the server
  * **SOLID_DEBUG** // set this if you want to output extended login and session debugging

If you don't have those environment variables set or if you wish to override them, you can set them in the arguments to login().
```javascript
   let session = await client.login({
       idp : "https://yourIdentityProvider",
       username : "yourUsername",
       password : "yourPassword",
       debug : true // or false
   });
```
The session object returned will be a solid-auth-fetcher Session object which has properties loggedIn and webId.  See the solid-auth-fetcher docs for further details if you need them.

### logout()

Logs the user out.  This means that authenticated fetches are no longer possible but you can still use unauthenticated fetches.

### fetch()

This method performs CRUD operations as specified in the [Solid REST spec](https://github.com/solid/solid-spec).  When used with file: URLs, most of the REST spec is followed and, as with http: URLs, the return value is a Response object containing fields such status and statusText and methods such as text(), json(), and headers.get().  See the [solid-rest docs](https://github.com/solid/solid-rest) for details of how file: URLs are handled.

Here's an example :
```javascript
// write a resource
let writeResponse = await client.fetch( 'https://example.com/file.text', {
  method : "PUT",
  body : "some content to go in the resource",
  headers : { "Content-type" : 'text/plain' }
}
console.log( writeResponse.status  );  // 201
// now read it
let readResponse = await client.fetch( 'https://example.com/file.text' );
// display its contents
console.log( await readResponse.text()  );
```

### Note about Patch

PATCH is supported by solid-node-client, but *only* if your script imports rdflib and you set the parser option for new SolidNodeClient().  The syntax for PATCH is the same as in rdflib.

```javascript
import {SolidNodeClient} from 'solid-node-client';
import * as $rdf from 'rdflib';
const client = new SolidNodeClient({parser:$rdf});
// client.fetch() now supports PATCH on file: URLs and all solid-rest backends
```

## <a name="multiple">Multiple Identities</a>

It is now possible to login multiple times from the same script.  You can create clients authorized for several different identities.
```javascript
  const client_1 = new SolidNodeClient();
  const client_2 = new SolidNodeClient();
  const client_3 = new SolidNodeClient();
  await client_1.login( siteA_credentials);
  await client_2.login( siteB_credentials);
  // now client_1 is authenticated at siteA;
  //     client_2 is authenticated at siteB;
  //     client_3 is unauthenticated
}
```

## Working with underlying session objects

The solid-auth-fetcher session and authFetcher objects are available for each client.  See the solid-auth-fetcher docs for details :
```javascript
  if( client.session.loggedIn() ...
  let authFetcher = client.authFetcher ...  
```

## <a name="pod">Creating a serverless pod</a>

Solid Node Client can access the local file system using file:// URLs without using a server.  In most respects, it will treat the file system as a pod.  To get the full benefit of this, it's best to create some local files such as a profile, a preferences file, and type indexes. You can create them manually or copy them from a remote pod, but the easiest thing to do is use the built-in createServerlessPod method.
```javascript
import {SolidNodeClient} from 'solid-node-client';
const client = new SolidNodeClient();
client.createServerlessPod('file:///home/jeff/myPod/');
```
The code above will create a profile, preferences and other key pod resources in the named folder. Your profile will be located at '/home/jeff/myPod/profile/card' and your preferences file will be located at '/home/jeff/myPod/settings/prefs.ttl'.  You can now use a file:// URL to refer to your local webId: <file:///home/jeff/myPod/profile/card#me>.  As with a server-based pod, this webId is the starting point for any app that wants to follow its nose through your local file system.

## Acknowledgements

All of the session management is from Jackson Creed's solid-auth-fetcher.  The login is from Michiel de Jong's solid-crud-tests.

## Copyright and License

copyright © 2020, Jeff Zucker, may be freely distributed with the MIT license
