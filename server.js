const http = require('http')
const exp = require('express')
const app = exp()
const socketIo = require('socket.io')
const { send } = require('process')

const server = http.createServer(app)
const io = socketIo(server , {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  })

app.get('/', (req,res)=>{
    res.send({response:"I am alive"}).status(200);
})

let PairMap = new Map()


io.on("connection", (socket) => {
    console.log(socket.id , " Connected")
    let Found = false
    for(const [key,value] of PairMap.entries()){
        if(value == null){
            PairMap.set(socket.id , key)
            PairMap.set(key,socket.id)
            socket.to(key).emit('found')
            socket.emit('found')
            Found = true
        }
    }

    if(!Found){
    PairMap.set(socket.id,null)
    }

    console.log(PairMap)
    socket.on('msg',(data)=>{
        let sendingData = {...data, from:socket.id}
        socket.to(PairMap.get(socket.id)).emit('msg',sendingData)

    })
    socket.on('ready',()=>{
        PairMap.set(socket.id , null)
        socket.emit('finding')
    for(const [key,value] of PairMap.entries()){

        if(value == null){
            PairMap.set(socket.id , key)
            PairMap.set(key,socket.id)
            socket.to(key).emit('found')
            socket.emit('found')
            Found = true
        }
    }

    })


    socket.on('disconnect',()=>{

        if(PairMap.get(socket.id)!= null && PairMap.get(socket.id) != 'no'){
        socket.to(PairMap.get(socket.id)).emit('left')
        PairMap.set(PairMap.get(socket.id) , 'no')
        }
        PairMap.delete(socket.id)
        console.log("disconneted")
        console.log(PairMap)
    })
})

server.listen(5555 , ()=>{
    console.log("started at" , 5555)
})