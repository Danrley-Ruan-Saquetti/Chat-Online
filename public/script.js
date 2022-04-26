const socket = io()

const state = {
    users: {},
    msg: {},
    rooms: {}
}

const listUsers = () => {
    const userTag = document.getElementById("list-users")

    userTag.innerHTML = ""
    Object.keys(state.users).map((i) => {
        const user = state.users[i]

        const div = document.createElement("div")
        const p = document.createElement("p")

        div.className = "users"

        p.innerHTML = user.name
        div.appendChild(p)
        userTag.appendChild(div)
    })
}

const listRooms = () => {
    const roomTag = document.getElementById("list-rooms")

    roomTag.innerHTML = ""
    Object.keys(state.rooms).map((i) => {
        const room = state.rooms[i]

        const div = document.createElement("div")
        const p = document.createElement("p")

        div.className = "rooms"

        p.innerHTML = room.name
        div.appendChild(p)
        roomTag.appendChild(div)
    })
}

document.getElementById("create-room-submit").addEventListener("click", () => {
    const name = String(document.querySelector("#name-room").value)

    const invalidName = () => {
        Object.keys(state.rooms).map((i) => {
            if (state.rooms[i].name == name) { return true }
        })
    }

    if (name != null && name != undefined && name != "") {
        const validName = invalidName()

        if (validName) {
            alert("Este nome já existe!")
        } else {
            socket.emit("create-room", name)
        }
    } else {
        alert("Por favor, insira um nome para sala!")
    }
})

socket.on("connect", () => {
    listUsers()
})

socket.on("refresh-users", (users) => {
    state.users = users
    listUsers()
})

socket.on("refresh-rooms", (rooms) => {
    state.rooms = rooms
    listRooms()
})
