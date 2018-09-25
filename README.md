# ssb-config

Configuration module used by [`scuttlebot`](https://github.com/ssbc/scuttlebot).

## example

``` js
var config = require('ssb-config')

//if you want to set up a test network, that
//doesn't collide with main ssb pass the name of that network in.

var test_config = require('ssb-config/inject')('testnet', {port: 9999})
//you can also pass a second argument, which overrides the default defaults.
```

## Configuration

There are some configuration options for the sysadmins out there. All configuration is loaded via [`rc`](https://github.com/dominictarr/rc). You can pass any configuration value in as cli arg, env var, or in a file.

* `host` *(string)* The domain or ip address for `sbot`. Defaults to your public ip address.
* `port` *(string|number)* The port for `sbot`. Defaults to `8008`.
* `timeout`: *(number)* Number of milliseconds a replication stream can idle before it's automatically disconnected. Defaults to `30000`.
* `pub` *(boolean)* Replicate with pub servers. Defaults to `true`.
* `local` *(boolean)* Replicate with local servers found on the same network via `udp`. Defaults to `true`.
* `friends.dunbar` *(number)* [`Dunbar's number`](https://en.wikipedia.org/wiki/Dunbar%27s_number). Number of nodes your instance will replicate. Defaults to `150`.
* `friends.hops` *(number)* How many friend of friend hops to replicate. Defaults to `3`.
* `gossip.connections` *(number)* How many other nodes to connect with at one time. Defaults to `2`.
* `path` *(string)* Path to the application data folder, which contains the private key, message attachment data (blobs) and the leveldb backend. Defaults to `$HOME/.ssb`.
* `master` *(array)* Pubkeys of users who, if they connect to the Scuttlebot instance, are allowed to command the primary user with full rights. Useful for remotely operating a pub. Defaults to `[]`.
* `logging.level` *(string)* How verbose should the logging be. Possible values are error, warning, notice, and info. Defaults to `notice`.

### `connections`

Two objects to specify `incoming` and `outgoing` transports and transformations for connections.

The default is the following. It specifies the default TCP `net`work transport for incoming and outging connections, using secret-handshake/boxstream ([shs](https://github.com/auditdrivencrypto/secret-handshake)) for authentication and encryption.

```json
"connections": {
  "incoming": {
    "net": [{ "port": 8008, "scope": "public", "transform": "shs" }]
  },
  "outgoing": {
    "net": [{ "transform": "shs" }]
  }
},
```

If you want to use [Tor](https://torproject.org) to create outgoing connections you can specify your `outgoing` like this. It will use `localhost:9050` as the socks server for creating this.

```json
"connections": {
  "outgoing": {
    "onion": [{ "transform": "shs" }]
  }
},
```

If you want to run a peer behind NAT or other kind of proxy but still want sbot to be able to create invites for the outside addres, you can specify a `public` scope as your `incoming.net` by defining the `external` parameter like this:

```json
"incoming": {
  "net": [
    { "scope": "public",  "external": ["cryptop.home"], "transform": "shs", "port": 8008 },
    { "scope": "private", "transform": "shs", "port": 8008, "host": "internal1.con.taine.rs" },
  ]
},
```

One thing to notice is that you _need_ `incoming` connections for Apps (like patchwork or git-ssb) to function. By default they use the same authentication mechanism (shs) to grant access to the database, choosing access levels depending on the keypair that opens the connection. If you connect to yourself, you get full access (query and publish). If a remote peer connects, it can only replicate. So be sure to have **at least one** `incoming` connection.

That beeing said, the overhead of encryption for local applications can be very high, especially on low-powered devices. For this use-case there is a `noauth` transform which by-passes the authentication and grants full access to anybody that can connect to it. **hint:** *This is risky! it might expose private messages or enables people to publish as you!* Therefore be sure to bind the listener to `localhost` or use the `unix` socket. The `unix` file socket is creted as `$HOME/.ssb/socket` by default and has permissions such that only the user running `sbot server` can open it, just like the `.ssb/secret` file.

```json
"incoming": {
  "unix": [{ "scope":"device", "transform":"noauth" }],
  "net": [{ "scope": "device", "transform": "noauth", "port": 8009, "host": "localhost" }]
},
```

The local plugin inside scuttlebot will use the first incoming connection of either public or private scope. 

## License

MIT
