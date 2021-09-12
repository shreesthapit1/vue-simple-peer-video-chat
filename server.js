const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors());
const http = require('http').Server(app)
const io = require('socket.io')(http,{
    cors: {
        origin: "http://localhost:8080",
        methods: ["GET", "POST"]
    }
})
let connectedSockets = []
io.on('connection', function (socket) {
    connectedSockets.push(socket.id)
    io.emit('peer', {
        peerId: socket.id
    })

    socket.on('signal', msg => {
        const receiverId = msg.to
        io.to(receiverId).emit('signal', msg);
    })
    socket.on('disconnect', reason => {
        io.emit('unpeer', {
            peerId: socket.id,
            reason
        })
    })

    socket.on('getmembers', () => {
        io.emit('memberList', connectedSockets)
    })
})

http.listen(4000, () => console.log('listening on port 4000'))
