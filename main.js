import express from "express"
import http from "http"
import socketio from "socket.io"

const app = express()
const server = http.createServer(app)
const sockets = socketio(server)
const port = 3000

const LENGTH_ID = 20

const GENERATED_ID = (obj) => {
    const CASES = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

    const VALID_ID = (id) => {
        Object.keys(obj).map((i) => {
            if (obj[i].id == id) return false
        })
        return true
    }

    let id = ""
    do {
        for (let i = 0; i < LENGTH_ID; i++) id += CASES[Math.round(Math.random() * CASES.length - 1)]
    } while (!VALID_ID(id));

    return id
}

const state = {
    users: {},
    rooms: {}
}

const onEvents = {
    createUser: (id) => {
        state.users[id] = {
            id: id,
            name: "User_" + id.substr(0, 5),
            roomConnected: null
        }

        console.log(`${id} connected!`);
        refresh.user()
    },
    deleteUser: (socket) => {
        if (state.users[socket.id].roomConnected != null) {
            onEvents.logoutRoom(socket, state.users[socket.id].roomConnected)
        }
        console.log(`${socket.id} disconnected!`);
        delete state.users[socket.id]

        refresh.user()
    },
    createRoom: (creator, name) => {
        const id = GENERATED_ID(state.rooms)
        state.rooms[id] = {
            id: id,
            idCreator: creator.id,
            name: name,
            creator: creator.name,
            posts: {},
            users: {}
        }

        console.log(`${creator.id} create room ${id}!`);
        refresh.room()
    },
    createPost: (post) => {
        const id = GENERATED_ID(state.rooms[post.room].posts)
        state.rooms[post.room].posts[id] = {
            id: id,
            idCreator: post.idCreator,
            type: post.type,
            creator: post.name,
            body: post.body,
            time: {
                days: 0,
                hors: 0,
                minutes: 0,
                seconds: 0,
                timer: () => {
                    setInterval(() => {
                        state.rooms[post.room].posts[id].time.seconds++
                            if (state.rooms[post.room].posts[id].time.seconds == 60) {
                                state.rooms[post.room].posts[id].time.seconds = 0
                                state.rooms[post.room].posts[id].time.minutes++
                                    if (state.rooms[post.room].posts[id].time.minutes == 60) {
                                        state.rooms[post.room].posts[id].time.minutes = 0
                                        state.rooms[post.room].posts[id].time.hors++
                                            if (state.rooms[post.room].posts[id].time.hors == 24) {
                                                state.rooms[post.room].posts[id].time.hors = 0
                                                state.rooms[post.room].posts[id].time.days++
                                            }
                                    }
                                refresh.posts(post.room)
                            }
                    }, 1000)
                }
            }
        }

        state.rooms[post.room].posts[id].time.timer()

        if (post.type == "post") {
            console.log(`${post.idCreator} send post room ${post.room}!`);
        }
        refresh.posts(post.room)
    },
    loginRoom: (socket, id) => {
        const user = state.users[socket.id]
        if (user.roomConnected != id) {
            if (user.roomConnected != null) {
                onEvents.logoutRoom(socket, user.roomConnected)
            }
            user.roomConnected = id

            console.log(`${user.id} login room ${id}!`);
            refresh.userConnected()
            onEvents.createPost({ room: id, idCreator: user.id, name: user.name, type: "information", body: `New user connected: ${user.name}` })
        }
    },
    logoutRoom: (socket, id) => {
        const user = state.users[socket.id]
        console.log(`${user.id} disconnected room ${id}!`);
        onEvents.createPost({ room: id, idCreator: user.id, name: user.name, type: "information", body: `User disconnected: ${user.name}` })
    },
    renameUser: (user) => {
        state.users[user.id].name = user.name
        refresh.user()
    }
}

const refresh = {
    user: () => {
        sockets.emit("refreshUsers", state.users)
    },
    room: () => {
        sockets.emit("refreshRooms", state.rooms)
    },
    userConnected: () => {
        sockets.emit("userConnected", state.users)
    },
    posts: (room) => {
        sockets.emit("refreshPosts", { room: room, posts: state.rooms[room].posts })
    }
}

app.use(express.static("public"))

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

sockets.on("connection", (socket) => {
    onEvents.createUser(socket.id)

    refresh.room()

    socket.on("disconnect", () => {
        onEvents.deleteUser(socket)
    })

    socket.on("rename-user", (name) => {
        onEvents.renameUser({ id: socket.id, name: name })
    })

    socket.on("createRoom", (name) => {
        onEvents.createRoom(socket, name)
    })

    socket.on("loginRoom", (id) => {
        onEvents.loginRoom(socket, id)
    })

    socket.on("sendPost", (body) => {
        onEvents.createPost({ room: state.users[socket.id].roomConnected, idCreator: socket.id, name: state.users[socket.id].name, type: "post", body: body })
    })
})
