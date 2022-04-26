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

socket.on("connect", () => {
    console.log(`Console: Player connected with id ${socket.id}`)
    listUsers()
})

socket.on("refresh-users", (users) => {
    state.users = users
    listUsers()
})
