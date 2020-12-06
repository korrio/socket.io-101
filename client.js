const
    io = require("socket.io-client"),
    ioClient = io.connect("http://localhost:3000");

ioClient.on("seq-num", (msg) => console.info(msg));