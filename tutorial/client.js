const
    io = require("socket.io-client"),
    ioClient = io.connect("http://159.65.5.73:3000");

ioClient.on("seq-num", (msg) => console.info(msg));