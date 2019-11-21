# ssb-config

Configuration module useful for starting an [`ssb-server`](https://github.com/ssbc/ssb-server).

## example usage

``` js
var Server = require('ssb-server')
var config = require('ssb-config')

var server = Server(config)
server.whoami((err, feed) => {
  console.log(feed)

  server.close(() => console.log('closing the server!'))
})
```

Custom configutation (e.g. set up a test network that doesn't collide with main ssb network):
```js
// if you want to customise, e.g. 
// 

var Server = require('ssb-server')
var Config = require('ssb-config/inject')
var config = Config('testnet', { port: 9999 })

var server = Server(config)
server.whoami((err, feed) => {
  console.log(feed)

  server.close(() => console.log('closing the server!'))
})
```

## API

### `require('ssb-config')`

returns you the stock standard config for starting an `ssb-server`

### `require('ssb-config/inject')(appName, opts) => Object`

A function which takes:
- `appName` *(string)* which declares where to look for further config, where to read and write databases. Stores data in `~/.${appName}`, defaults to `ssb` (so data in `~/.ssb`).
- `opts` *(object)* an object which can override config defaults (see 'Configuration' below)

## Configuration

All configuration is loaded via [`rc`](https://github.com/dominictarr/rc). This means the final config is a result of config collected from `opts` passed into the inject method, cli args, env var, and config (e.g. `~/.ssb/config`). See the rc repo for full details.

Options:
* `connections` *(object)* Details `incoming` and `outgoing` connections behaviour (see below)
* `remote` ... TODO ... a multisever address for ... (in the future this may be deprecated / derived from `connections`
* `timeout`: *(number)* Number of milliseconds a replication stream can idle before it's automatically disconnected. Defaults to `30000`.
* `pub` *(boolean)* Replicate with pub servers. Defaults to `true`.
* `local` *(boolean)* Replicate with local servers found on the same network via `udp`. Defaults to `true`.
* `friends.dunbar` *(number)* [`Dunbar's number`](https://en.wikipedia.org/wiki/Dunbar%27s_number). Number of nodes your instance will replicate. Defaults to `150`.
* `friends.hops` *(number)* How many friend of friend hops to replicate. Defaults to `3`.
* `gossip` *(object)* controls what sort of connections are made (see below)
* `path` *(string)* Path to the application data folder, which contains the private key, message attachment data (blobs) and the leveldb backend. Defaults to `$HOME/.ssb`.
* `master` *(array)* Pubkeys of users who, if they connect to the [ssb-server](https://github.com/ssbc/ssb-server) instance, are allowed to command the primary user with full rights. Useful for remotely operating a pub. Defaults to `[]`.
* `logging.level` *(string)* How verbose should the logging be. Possible values are error, warning, notice, and info. Defaults to `notice`.
* `party` _(boolean)_ TODO
* `timers.connection` _(number)_ TODO
* `timers.reconnect` _(number)_ TODO
* `timers.ping` _(number)_ TODO
* `timers.handshake` _(number)_ TODO
* `caps.shs` _(string)_ Key for accessing the scuttlebutt protocol (see secret-handshake paper for a full explaination)
* `caps.sign` _(string)_ Used to sign messages

Deprecated Options:
* `host` *(string)* The domain or ip address for [ssb-server](https://github.com/ssbc/ssb-server). Defaults to your public ip address.
* `port` *(string|number)* The port for [ssb-server](https://github.com/ssbc/ssb-server). Defaults to `8008`.
* `ws` TODO

You should use `connections` to more explicitly configure connections.
These values are currently only used to generate `connections.incoming` if that option isn't provided. The raw options are no longer returned in the final config - this is to ensure we don't have multiple places where different `host` / `port` / `ws` are being set!

### `connections`

An object with two required properties: `incoming` and `outgoing` to specify transports and transformations for connections.
Defaults to the following:
```json
{
  "incoming": {
    "net": [{ "port": 8008, "scope": "public", "transform": "shs" }]
  },
  "outgoing": {
    "net": [{ "transform": "shs" }],
    "onion": [{ "transform": "shs" }]
  }
}
```

It specifies the default TCP `net`work transport for incoming and outging connections, using secret-handshake/boxstream ([shs](https://github.com/auditdrivencrypto/secret-handshake)) for authentication and encryption.

A **transport** is a vehicle or avenue for communication. The following transports are currently supported:
- `net` - TCP based
- `unix` - socket based
- `onion` - TOR based
- `ws` - websocket based

Each transport can have an array of different configurations passed to it, these are objects with properties:
- `transform` *(string)* determines whether traffic is encrypted, and if so how.
  - `shs` - secret handashake
  - `noauth` - no encryption, any connection via `noauth` is considered authorized. **use only with `device` scope or unix socket**
- `port` *(integer)*
- `host` *(string)* only relevant for ... TODO
- `scope` *(string|array(string))* scope determines the set of network interfaces to bind the server to. If scope is an array, then the server will bind to all the selected ports. See more about scopes below.

- `external` *(array of strings)* ... for use in combination with public scope. this is the external domain given out as the address to peers.
- `key` - used together with `cert` for ws plugin to run over TLS (wss). Needs to be a path to where the key is stored.
- `cert` - used together with `key` for ws plugin to run over TLS (wss). Needs to be a path to where the certificate is stored.

---

#### scopes

An address scope is the area from which it's possible to connect to an address.
* `device` means connections can only come from the same device. (talking to your self). _alias `private`_
* `local` means connections can only come from the same network, i.e. same wifi.
* `public` means connections can come from anywhere on the internet.

Some protocols only work in particular scopes. `unix` socket requires file system access,
so it only works for the device scope. `onion` (tor) routes connections through a distributed network,
so it only works if you are fully connected to the `public` internet. Some mesh networks
are really large, so they might seem public. Some overlay networks, such as [cjdns](https://github.com/cjdelisle/cjdns/) and
[ZeroTier](https://www.zerotier.com/) create a fake local network that is publically accessible (these should
be manually configured as public addresses!)

most ssb peers just have a local and device scopes. pubs require a public scope.
`ssb-tunnel` allows any peer to have a public address, by routing connections through a friendly pub.

Addresses for scopes are provides `secret-stack`s `getAddress(scope)` method, which in turn calls `multiserver`s `stringify(scope)` method.

### Example `connnections` configurations

If you only want to use [Tor](https://torproject.org) to create outgoing connections you can specify your `outgoing` like this. It will use `localhost:9050` as the socks server for creating this.

```json
{
  "incoming": {
    "net": [{ "port": 8008, "scope": "public", "transform": "shs" }]
  },
  "outgoing": {
    "onion": [{ "transform": "shs" }]
  }
}
```

If you want to run a peer behind NAT or other kind of proxy but still want [ssb-server](https://github.com/ssbc/ssb-server) to be able to create invites for the outside address, you can specify a `public` scope as your `incoming.net` by defining the `external` parameter like this:

```json
{ 
  "incoming": {
    "net": [
      { "scope": "public",  "external": ["cryptop.home"], "transform": "shs", "port": 8008 },
      { "scope": "private", "transform": "shs", "port": 8008, "host": "internal1.con.taine.rs" },
    ]
  },
  "outgoing": {
    "net": [{ "transform": "shs" }]
  }
}
```

One thing to notice is that you _need_ `incoming` connections for Apps (like patchwork or git-ssb) to function. By default they use the same authentication mechanism (shs) to grant access to the database, choosing access levels depending on the keypair that opens the connection. If you connect to yourself, you get full access (query and publish). If a remote peer connects, it can only replicate. So be sure to have **at least one** `incoming` connection.

That being said, the overhead of encryption for local applications can be very high, especially on low-powered devices. For this use-case there is a `noauth` transform which by-passes the authentication and grants full access to anybody that can connect to it. **hint:** *This is risky! it might expose private messages or enables people to publish as you!* Therefore be sure to bind the listener to `localhost` or use the `unix` socket. The `unix` file socket is created as `$HOME/.ssb/socket` by default and has permissions such that only the user running `ssb-server start` can open it, just like the `$HOME/.ssb/secret` file.

```json
{ 
  "incoming": {
    "unix": [{ "scope":"device", "transform":"noauth" }],
    "net": [{ "scope": "device", "transform": "noauth", "port": 8009, "host": "localhost" }]
  },
  "outgoing": {
    "net": [{ "transform": "shs" }]
  }
}
```

The local plugin inside [ssb-server](https://github.com/ssbc/ssb-server) will use the first incoming connection of either public or private scope. 

## `gossip`

```js
{
  gossip: {
    connections: 3, // this one doesn't work any more
    local: true,
    friends: true,
    global: true
  }
}
```

~~Set the max number of gossip connections to sustain~~

Set which sorts of gossip connections are permitted:
- `local` *(Boolean)* ... TODO
- `friends` *(Boolean)* ... TODO
- `global` *(Boolean)* ... TODO

## License

MIT
