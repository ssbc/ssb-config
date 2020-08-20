  # ssb-config

This module helps you to generate and manipulate the startup configuration for an 
[`ssb-server`](https://github.com/ssbc/ssb-server).

## Table of contents
[Example usage](#example-usage) | [Api](#api) | [Configuration](#configuration) | [License](#license)

___

## Example usage
This is the most use basic use case where it is not necessary to modify any configuration parameters.

``` js
var Server = require('ssb-server')
var config = require('ssb-config')

var server = Server(config)
server.whoami((err, feed) => {
  console.log(feed)

  server.close(() => console.log('closing the server!'))
})
```
If you want to change the default values you can use inject to overwrite them, without having to specify 
all the settings. For example you can setup a test network that doesn't collide with the main ssb network:

```js
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

Returns you the stock standard config for starting an __ssb-server__.

### `require('ssb-config/inject')(appName, opts) => Object`

A function which takes:
- `appName` *(string)* Which declares where to look for further config, where to read and write databases. 
Stores data in `~/.${appName}`, defaults to `ssb` (so data in `~/.ssb`).
- `opts` *(object)* An object which can override config defaults (see *[Configuration](#configuration)* below).

## Configuration

All configuration is loaded via `rc`. This means the final config is a result of config collected from `opts` 
passed into the inject method, cli args, env var, and config (e.g. `~/.ssb/config`). See the 
[rc repo](https://github.com/dominictarr/rc) for full details.

__Options__
* `connections` *(object)* Details `incoming` and `outgoing` connections behaviour ([See below](#connections)).
* `remote` *(string)* [Multiserver address](https://github.com/ssbc/multiserver#address-format) to connect as 
a client. Useful in some cases, such as using [ssb-unix-socket](https://github.com/ssbc/ssb-unix-socket) + 
[ssb-no-auth](https://github.com/ssbc/ssb-no-auth). In the future this may be deprecated / derived from 
`connections`.
* `timeout`: *(number)* Number of milliseconds a replication stream can idle before it's automatically 
disconnected. Defaults to `30000`.
* `pub` *(boolean)* Replicate with pub servers. Defaults to `true`.
* `local` *(boolean)* Replicate with local servers found on the same network via `udp`. Defaults to `true`.
* `friends.dunbar` *(number)* [`Dunbar's number`](https://en.wikipedia.org/wiki/Dunbar%27s_number). Number 
of nodes your instance will replicate. Defaults to `150`.
* `friends.hops` *(number)* How many friend of friend hops to replicate. Defaults to `3`.
* `gossip` *(object)* Controls what sort of connections are made ([See below](#gossip)).
* `path` *(string)* Path to the application data folder, which contains the private key, message attachment 
data (blobs) and the leveldb backend. Defaults to `$HOME/.ssb`.
* `master` *(array)* Pubkeys of users who, if they connect to the [ssb-server](https://github.com/ssbc/ssb-server) 
instance, are allowed to command the primary user with full rights. Useful for remotely operating a pub. 
Defaults to `[]`.
* `logging.level` *(string)* How verbose should the logging be. Possible values are error, warning, notice, 
and info. Defaults to `notice`.
* `party.out` _(string)_ Where to put standard output of sbot. may be a path (absolute, or relative to ssb's 
directory), or false to discard, or true to pass through to the controlling terminal. Defaults to true.
* `party.err`_(string)_ Where to put standard error of sbot. Defaults to same as config.party.out.
* `timers.connection` _(number)_ TODO
* `timers.reconnect` _(number)_ TODO
* `timers.inactivity` _(number)_  Timeout (ms) before dropping the connection with an inactive pair. 
Defaults to 5 seconds.
* `timers.ping` _(number)_ Timeout (ms) used to consider a peer valid when pinging. Defaults to 5 minutes.
* `timers.handshake` _(number)_ Maximum waiting time (ms) for a handshake response. Defaults to 5 seconds.
* `timers.keepalive` _(number)_ Minimum time (ms) to keep the server online after the last client disconnects. 
Defaults to 30s.
* `caps.shs` _(string)_ Key for accessing the scuttlebutt protocol 
(see [secret-handshake paper](https://github.com/ssbc/ssb-caps/) for a full explaination).
* `caps.sign` _(string)_ Used to sign messages.

__Deprecated Options__
* `host` *(string)* The domain or ip address for [ssb-server](https://github.com/ssbc/ssb-server). Defaults to 
your public ip address.
* `port` *(string|number)* The port for [ssb-server](https://github.com/ssbc/ssb-server). Defaults to `8008`.
* `ws` TODO

You should use `connections` to more explicitly configure connections.
These values are currently only used to generate `connections.incoming` if that option isn't provided. 
The raw options are no longer returned in the final config - this is to ensure we don't have multiple places 
where different `host` / `port` / `ws` are being set!

### `connections`

An object with two required properties: `incoming` and `outgoing` to specify transports and transformations 
for connections. Defaults to the following:
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

It specifies the default TCP `net`work transport for incoming and outging connections, 
using secret-handshake/boxstream ([shs](https://github.com/auditdrivencrypto/secret-handshake)) for 
authentication and encryption.

A **transport** is a vehicle or avenue for communication. The following transports are currently supported:
- `net` - TCP based
- `unix` - socket based
- `onion` - TOR based
- `ws` - websocket based

Each transport can have an array of different configurations passed to it, these are objects with properties:
- `transform` *(string)* Determines whether traffic is encrypted, and if so how.
  - `shs` - Secret handashake.
  - `noauth` - No encryption, any connection via `noauth` is considered authorized. **use only with `device` 
  scope or unix socket**.
- `port` _(integer)_
- `host` _(string)_ IP or hostname that the listener is binding on.
- `scope` _(string | array of string)_ scope Determines the set of network interfaces to bind the server to. 
If scope is an array, then the server will bind to all the selected ports. [See more about scopes below](#scopes).
- `external` _(array of strings)_ For use in combination with public scope. this is the external domain given 
out as the address to peers.
- `key` _(string)_ Used together with `cert` for ws plugin to run over TLS (wss). Needs to be a path to where 
the key is stored.
- `cert` _(sitring)_ Used together with `key` for ws plugin to run over TLS (wss). Needs to be a path to where 
the certificate is stored.

#### Scopes

An address scope is the area from which it's possible to connect to an address.
* `device` Means connections can only come from the same device. (talking to your self). _alias `private`_.
* `local` Means connections can only come from the same network, i.e. same wifi.
* `public` Means connections can come from anywhere on the internet.

Some protocols only work in particular scopes. `unix` socket requires file system access,
so it only works for the device scope. `onion` (tor) routes connections through a distributed network, so it 
only works if you are fully connected to the `public` internet. Some mesh networks are really large, so they 
might seem public. Some overlay networks, such as [cjdns](https://github.com/cjdelisle/cjdns/) and 
[ZeroTier](https://www.zerotier.com/) create a fake local network that is publically accessible 
(these should be manually configured as public addresses!).

Most ssb peers just have a local and device scopes. Pubs require a public scope.
`ssb-tunnel` allows any peer to have a public address, by routing connections through a friendly pub.

Addresses for scopes are provides `secret-stack`s `getAddress(scope)` method, which in turn calls 
`multiserver`s `stringify(scope)` method.

### Example `connnections` configurations

If you only want to use [Tor](https://torproject.org) to create outgoing connections you can specify your 
`outgoing` like this. It will use `localhost:9050` as the socks server for creating this.

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

If you want to run a peer behind NAT or other kind of proxy but still want 
[ssb-server](https://github.com/ssbc/ssb-server) to be able to create invites for the outside address, you 
can specify a `public` scope as your `incoming.net` by defining the `external` parameter like this:

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

One thing to notice is that you _need_ `incoming` connections for Apps (like patchwork or git-ssb) to 
function. By default they use the same authentication mechanism (shs) to grant access to the database, 
choosing access levels depending on the keypair that opens the connection. If you connect to yourself, 
you get full access (query and publish). If a remote peer connects, it can only replicate. So be sure 
to have **at least one** `incoming` connection.

That being said, the overhead of encryption for local applications can be very high, especially on 
low-powered devices. For this use-case there is a `noauth` transform which by-passes the authentication 
and grants full access to anybody that can connect to it. **hint:** *This is risky! it might expose 
private messages or enables people to publish as you!* Therefore be sure to bind the listener to 
`localhost` or use the `unix` socket. The `unix` file socket is created as `$HOME/.ssb/socket` by 
default and has permissions such that only the user running `ssb-server start` can open it, just like 
the `$HOME/.ssb/secret` file.

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

The local plugin inside [ssb-server](https://github.com/ssbc/ssb-server) will use the first incoming 
connection of either public or private scope. 

### `gossip`
Set which sorts of gossip connections are permitted:

- `connections` *(number)* How many other nodes to connect with at one time. Defaults to `2`.
- `local` *(boolean)* Make gossip connections with peers on the same local network as you.
- `friends` *(boolean)* Make gossip connections with peers who are friends.
- `seed` *(boolean)* Make gossip connection with manually added seeds, it is generally used in tests.
- `global` *(boolean)* Don't restrict the connections but prioritize the connections to the peers you're 
friends with.

For example, allow only gossip connections with peers found on the same local network as you, but prioritize 
connections with friends:

```js
{
  gossip: {
    connections: 3,
    local: true,
    friends: false,
    seed: false,
    global: true
  }
}
```
___
## License

MIT
