// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START appengine_websockets_app]
const express = require('express');
const app = express();

// app.set('view engine', 'pug');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/public'));

const server = require('http').Server(app);
const io = require('socket.io')(server);

// declare vars
let users = [];
let connections = [];
let choices = [];

// app.get('/', (req, res) => {
//   res.render('index');
// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

io.on('connection', socket => {

  connections.push(socket);
  console.log('Connected: %s sockets connected', connections.length);

  socket.on('disconnect', function(data) {
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();
    connections.splice(connections.indexOf(socket), 1)
    io.emit('disconnected', socket.username);
    console.log('Disconnected: %s sockets connected', connections.length);
  });

  socket.on('send message', function(data) {
    io.emit('new message', { msg: data, user: socket.username });
  });

  socket.on('add user', function(data, callback) {
    socket.username = data;

    if (users.indexOf(socket.username) > -1) {
      callback(false);
    } else {
      users.push(socket.username);
      updateUsernames();
      callback(true);

      if (Object.keys(users).length == 2) {
        io.emit('connected', socket.username);
        io.emit('game start');
      }
    }
  });

  socket.on('player choice', function(username, choice) {
    choices.push({ 'user': username, 'choice': choice });
    console.log('%s chose %s.', username, choice);

    if (choices.length == 2) {
      console.log('[socket.io] Both players have made choices.');

      switch (choices[0]['choice']) {
        case 'rock':
          switch (choices[1]['choice']) {
            case 'rock':
              io.emit('tie', choices);
              break;

            case 'paper':
              io.emit('player 2 win', choices);
              break;

            case 'scissors':
              io.emit('player 1 win', choices);
              break;

            default:
              break;
          }
          break;

        case 'paper':
          switch (choices[1]['choice']) {
            case 'rock':
              io.emit('player 1 win', choices);
              break;

            case 'paper':
              io.emit('tie', choices);
              break;

            case 'scissors':
              io.emit('player 2 win', choices);
              break;

            default:
              break;
          }
          break;

        case 'scissors':
          switch (choices[1]['choice']) {
            case 'rock':
              io.emit('player 2 win', choices);
              break;

            case 'paper':
              io.emit('player 1 win', choices);
              break;

            case 'scissors':
              io.emit('tie', choices);
              break;

            default:
              break;
          }
          break;

        default:
          break;
      }

      choices = [];
    }
  });

  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });

  let updateUsernames = () => {
    console.log(users);
    io.emit('get user', users);
  }
});



if (module === require.main) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
// [END appengine_websockets_app]

module.exports = server;