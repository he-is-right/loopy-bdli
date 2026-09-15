const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.resolveSrv('_mongodb._tcp.cluster0.8wgknje.mongodb.net', (err, addresses) => {
  if (err) {
    console.error('DNS SRV lookup failed with 8.8.8.8:', err);
  } else {
    console.log('SRV Records:', addresses);
  }
});
