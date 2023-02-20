let btnNextIteration = $("#btn-next-iteration")
let traversedRooms = []

let antCounter = 0;
let numberOfAnts = 1;
let ants = []

const createAnt = (room)=>{
    console.log("placing ant in room",room)
    let ant = {
        antIndex:antCounter,
        currentRoom:room,
        traversedRooms:[], 
    }
    console.log("ANT ",ant)
    ant.traversedRooms.push(room)
    return ant
}

let populateAnts = ()=>{
    let startRoom = getStartRoom();
    console.log(startRoom)
    while (antCounter < numberOfAnts) {
        let ant = createAnt(startRoom)
        ants.push(ant);
        antCounter++;
    }
}

let sendAnt=(ant)=>{
    traversedRooms = []
        let room = ant.currentRoom;
        console.log(ant)
        if(room.roomType != 2){
            traverseRoom(ant.currentRoom)
            // find next availableRoom
        }
}



let traverseRoom=(room)=>{
    if(traversedRooms.includes(room)){
        console.log("room index",room.roomIndex,"room value", room.value)
        return room
    }else{
        traversedRooms.push(room)
        room.connectedRooms.forEach(({room})=>{
            // let n= traverseRoom(room);
            // console.log("traversal",n)
            return traverseRoom(room)
        })
    }
}


btnNextIteration.on("click",()=>{
    populateAnts();
    sendAnt(ants[0])
})