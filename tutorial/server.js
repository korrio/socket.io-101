const server = require('http').createServer();
const io = require('socket.io')(server,{
  cors: {
    origin: '*',
  }
});
io.on('connection', client => {

  console.info(`Client connected [id=${client.id}]`);
  // initialize this client's sequence number
  sequenceNumberByClient.set(client, 1);

  // when socket disconnects, remove it from the list:
  client.on("disconnect", () => {
    sequenceNumberByClient.delete(client);
    console.info(`Client gone [id=${client.id}]`);
  });

  client.on('event', data => { /* … */ });
  //client.on('disconnect', () => { /* … */ });
});
server.listen(3000);

let
  sequenceNumberByClient = new Map();

// sends each client its current sequence number
setInterval(() => {
  for (const [client, sequenceNumber] of sequenceNumberByClient.entries()) {
    client.emit("seq-num", sequenceNumber);
    sequenceNumberByClient.set(client, sequenceNumber + 1);
  }
}, 1000);