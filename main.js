import express from "express"
import http from "http"
import socketio from "socket.io"

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
const port = 3000

const createRoom = () => {

}

const state = {
    users: {},
    msg: {},
    rooms: {}
}

const refreshUsers = () => {
    sockets.emit("refresh-users", state.users)
}

app.use(express.static("public"))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


sockets.on("connection", (socket) => {
    console.log(`${socket.id} connected!`);

    state.users[socket.id] = {
        name: "User_" + socket.id.substr(0, 5)
    }
    refreshUsers()

    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected!`);
        delete state.users[socket.id]
        refreshUsers()
    })

    socket.on("create-room", () => {
        createRoom()
    })
})
