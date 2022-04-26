import express from "express"
import http from "http"
import socketio from "socket.io"

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
const port = 3000

const createRoom = (creator, name) => {
    const ID_LENGTH = 20
    const validId = (id) => {
        Object.keys(state.rooms).map((i) => {
            if (state.rooms[i].id == id) return true
        })
    }
    const createId = () => {
        const CASES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

        let id = ""
        do {
            for (let i = 0; i < ID_LENGTH; i++) {
                id += CASES[Math.round(Math.random() * (ID_LENGTH - 1))]
            }
        } while (validId(id))

        return id
    }

    const ID_ROOM = createId()

    state.rooms[ID_ROOM] = {
        id: ID_ROOM,
        creator: creator,
        name: name
    }

    refreshRooms()
}

const state = {
    users: {},
    msg: {},
    rooms: {}
}

const refreshUsers = () => {
    sockets.emit("refresh-users", state.users)
}

const refreshRooms = () => {
    sockets.emit("refresh-rooms", state.rooms)
}

app.use(express.static("public"))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})


sockets.on("connection", (socket) => {
    console.log(`${socket.id} connected!`);

    state.users[socket.id] = {
        name: "User_" + socket.id.substring(0, 5)
    }

    refreshUsers()
    refreshRooms()

    socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected!`);
        delete state.users[socket.id]
        refreshUsers()
    })

    socket.on("create-room", (name) => {
        console.log(`${socket.id} create room ${name}!`);
        createRoom(state.users[socket.id].name, name)
    })
})
