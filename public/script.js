const socket = io()

let thisId

let nameUser
do {
    nameUser = prompt("Informe o o nome de usuário: ")
} while (nameUser == null);

const state = {
    users: {},
    rooms: {}
}

let validCreateCampWrite = true

const list = {
    users: () => {
        const list = document.getElementById("list-users")
        list.innerHTML = ""

        Object.keys(state.users).map((i) => {
            const user = state.users[i]

            const divMain = document.createElement("div")
            const p = document.createElement("p")

            divMain.className = "users"

            p.innerHTML = user.name

            divMain.appendChild(p)
            list.appendChild(divMain)

            if (user.id == thisId) {
                const span = document.createElement("span")
                span.innerHTML = "<-"
                divMain.className += " this"

                divMain.appendChild(span)
            }
        })
    },
    rooms: () => {
        const list = document.getElementById("list-rooms")
        list.innerHTML = ""

        Object.keys(state.rooms).map((i) => {
            const room = state.rooms[i]

            const divMain = document.createElement("div")
            const p = document.createElement("p")

            divMain.className = "rooms"
            divMain.id = `${room.id}`

            p.innerHTML = room.name

            divMain.appendChild(p)

            list.appendChild(divMain)

            document.getElementById(`${room.id}`).addEventListener("click", () => EMIT_EVENTS.loginRoom(room.id))
        })
    },
    posts: (idRoom) => {
        const list = document.getElementById("list-posts")
        const room = state.rooms[idRoom]

        list.innerHTML = ""

        const h1 = document.createElement("h1")

        h1.id = "title-room"
        h1.innerHTML = `Room: ${room.name}`

        list.appendChild(h1)

        Object.keys(room.posts).map((i) => {
            const post = room.posts[i]

            const divMain = document.createElement("div")
            const pBody = document.createElement("p")

            divMain.className = "posts"
            if (post.idCreator == thisId) { divMain.className += " this" }
            divMain.id = post.id
            pBody.id = "body-post"
            pBody.className = "posts-bodys"

            pBody.innerHTML = post.body

            if (post.type == "post") {
                const pCreator = document.createElement("p")
                const spanTime = document.createElement("span")
                const spanCreator = document.createElement("span")

                pCreator.id = "authors"
                pCreator.className = "posts-creators"

                spanCreator.innerHTML = post.creator + " - "

                if (post.time.days > 0) {
                    spanTime.innerHTML = post.time.days + " days"
                } else if (post.time.hours > 0) {
                    spanTime.innerHTML = post.time.hours + " hours"
                } else {
                    spanTime.innerHTML = post.time.minutes + " minutes"
                }

                pCreator.appendChild(spanCreator)
                pCreator.appendChild(spanTime)
                divMain.appendChild(pCreator)
            } else if (post.type == "information") {
                divMain.className += " info"
            }

            divMain.appendChild(pBody)
            divMain.appendChild(pBody)

            list.appendChild(divMain)
        })
    }
}

const EMIT_EVENTS = {
    createRoom: (name) => {
        socket.emit("createRoom", name)
    },
    loginRoom: (id) => {
        socket.emit("loginRoom", id)
    },
    sendPost: (body) => {
        socket.emit("sendPost", body)
    },
    renameUser: () => {
        socket.emit("rename-user", nameUser)
    },
    createCampWrite: () => {
        const campWrite = document.getElementById("camp-write")
        campWrite.innerHTML = ""

        const textarea = document.createElement("textarea")
        const button = document.createElement("button")

        textarea.id = "text-posts"
        textarea.placeholder = "Mensagem"
        button.id = "send-posts"
        button.innerHTML = ">"

        campWrite.appendChild(textarea)
        campWrite.appendChild(button)

        button.addEventListener("click", () => {
            const body = String(textarea.value)
            if (body != "") {
                EMIT_EVENTS.sendPost(body)
            }
        })
    }
}

const VALID_CREATE_ROOM = () => {
    const name = String(document.getElementById("name-room").value)

    if (name != "") {
        EMIT_EVENTS.createRoom(name)
    } else {
        alert("Por favor, informe um nome para sala!")
    }
}

socket.on("connect", () => {
    thisId = socket.id

    EMIT_EVENTS.renameUser()
    list.users()
    list.rooms()

    socket.on("refreshUsers", (users) => {
        state.users = users
        list.users()
    })

    socket.on("refreshRooms", (rooms) => {
        state.rooms = rooms
        list.rooms()
    })

    socket.on("userConnected", (users) => {
        state.users = users
        list.posts(state.users[thisId].roomConnected)
    })

    socket.on("refreshPosts", (postConfig) => {
        state.rooms[postConfig.room].posts = postConfig.posts
        list.posts(state.users[thisId].roomConnected)

        if (validCreateCampWrite) {
            EMIT_EVENTS.createCampWrite()
            validCreateCampWrite = false
        }
    })
})

function setup() {
    document.getElementById("create-room-submit").addEventListener("click", () => VALID_CREATE_ROOM())
}

window.onload = setup
