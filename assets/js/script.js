let roomSelector = $("#room-selector")
let roomSelectorStart = $("#room-selector-start")
let roomSelectorEnd = $("#room-selector-end")
let btnLogRooms = $("#btn-log-rooms")
let btnevaluateMap = $("#btn-submit-map")
let canvas = $("#canvas")
let configContainer = $("#config-container")
let $storedMaps = $("#stored-maps")


let maps = []
let rooms = []
let roomNumber = 0;
let roomTypes = ["room-regular","room-start", "room-end" ]
let selectedRoom = null;
let currentRoom = null

// let mousePos = null
$(document).ready(()=>{
    // canvas.on("mousemove",(e)=>{
    //     // console.log(e)
    //     mousePos = {x:e.offsetX, y:e.offsetY}
    // })
    let storedMaps = localStorage.getItem("maps")
    if(storedMaps){
        maps = JSON.parse(storedMaps);
    }
    btnevaluateMap.prop("disabled", true);
    displayStoredMaps();
    roomSelector.draggable( {
        containment: '#main-content',
        helper: "clone",
        cursor: 'move',
        revert: "invalid",
        // grid: [ 25, 25 ],
    });
    roomSelectorStart.draggable( {
        containment: '#main-content',
        helper: "clone",
        cursor: 'move',
        revert: "invalid",
        // grid: [ 25, 25 ],
    });
    roomSelectorEnd.draggable( {
        containment: '#main-content',
        helper: "clone",
        cursor: 'move',
        revert: "invalid",
        // grid: [ 25, 25 ],
    });
    canvas.droppable({
        accept:".room",
        drop: handleCardDrop
    })
})

const generateFromStoredMaps = async (storedMap)=>{
    console.log(storedMap)
    $mapNameInput.val(storedMap.name)
    let presolve = Promise.resolve()
    let promises = []
    storedMap.rooms.forEach((storedRoom,index) =>{
        let interval = 0
        presolve = presolve.then(()=>{
            let currentRoom = rooms[index]
            if(currentRoom){
                currentRoom.location = storedRoom.location
                currentRoom.roomType = storedRoom.roomType
                let {x, y} = storedRoom.location;
                currentRoom.element.css({transition:'transform 1s ease-in-out',transform:`translate(${x}px, ${y}px)`})
                // console.log(currentRoom, storedRoom)
                setTimeout(()=>{
                    currentRoom.element.css({transition:'none'})
                },1000)
                interval = 500
            }else{
                addRoomToDOM(storedRoom.location.x, storedRoom.location.y, roomTypes[storedRoom.roomType])
            }
            currentRoom = rooms[index]
            // console.log("current",currentRoom, storedRoom)
            renderRoomType(currentRoom)
            return new Promise(function (resolve) {
                setTimeout(resolve, interval);
              });
        })
        promises.push(presolve)
        // console.log(storedRoom)
    })

    await Promise.all(promises)

    evaluateMap();
    generateLinksFromStoredMaps(storedMap)
    // console.log(rooms)
}
const generateLinksFromStoredMaps=(storedMap)=>{
    storedMap.rooms.forEach((storedRoom, ri)=>{
        storedRoom.connectedIndexes.forEach((ci, index)=>{
            createLine(rooms[ri], rooms[ci])
        })
    })
}
const displayStoredMaps = ()=>{
    maps.forEach(map=>{
        let $btnMap = $(`<div class="stored-map-selector" id="#m-${map.name}"><p>${map.name}</p></div>`)

        $btnMap.on("click", ()=>{generateFromStoredMaps(map)})
        $storedMaps.append($btnMap)
    })

}

const handleCardDrop = (event, ui)=>{
    let uiClasses = ui.draggable.attr("class").split(" ");
    let roomType = uiClasses[1]
    // console.log(roomType)
    let xPos = ui.position.left-configContainer.outerWidth()
    let yPos = ui.position.top
    if(ui.draggable.attr('id').includes("room-selector")){
        addRoomToDOM(xPos, yPos, roomType);
    }
    else{
        let roomNum = ui.draggable.data("room-number")
        let room = rooms[roomNum]
        let {left, top} = ui.draggable.position()

        room.location.x = left
        room.location.y = top

        console.log(room)
        // room.element.css({left:"auto", top:"auto"})

        room.connectedRooms.forEach((linked)=>{
            recalculateLine(room, linked.room, linked.link)
        })
    }
    evaluateMap()
}

let createRoom = (roomNumber, x,y, roomType=null)=>{
    // console.log("create room",roomType)
    let roomEl = $(`<div class="room ${roomType}" id="room-${roomNumber}"></div>`).data("room-number", roomNumber)
    .css({position:"absolute", transform:`translate(${x}px, ${y}px)`})
    return roomEl
}

let addRoomToDOM = (x, y, roomType=null)=>{
    let roomEl = createRoom(roomNumber,x, y , roomType)
    .click(selectRoom)
    .draggable( {
        containment: '#main-content',
        cursor: 'move',
        start:(e, ui)=>{
            // console.log("start", e, ui)
            // console.log(mousePos)
            roomEl.css({transform:"none"})
            // ui.transform =`none`
        },
        drag:(e, ui)=>{
            let room = rooms[roomEl.data("room-number")]
            // console.log(e, ui)
            // ui.position.top = ui.originalPosition.top - ui.offset.top
            // ui.position.left = 0
            // ui.position.top = "auto"
            // ui.position.left = "auto"
            // ui.transform =`none`
            let {left, top} = roomEl.position()
            room.location.x = left
            room.location.y = top
            room.connectedRooms.forEach((linked)=>{
                recalculateLine(room, linked.room, linked.link)
            })
        },
        stop:(e, ui)=>{
            // console.log("stop", mousePos)
            roomEl.css({left:"auto",top:"auto",transform:`translate(${ui.position.left}px, ${ui.position.top}px)`})
        }
        
    })
    .dblclick(toggleRoomType)

    canvas.append(roomEl);
    let type= roomTypes.indexOf(roomType); 
    // console.log(type)
    let room  = {element:roomEl, roomType:type, location:{x, y}, connectedRooms:[], roomIndex:roomNumber}


    rooms.push(room);
    roomNumber++;

    return room;
}

const toggleRoomType=(e)=>{
    let room = rooms[$(e.target).data("room-number")];
    room.roomType++;
    if(room.roomType > 2 )
    {
        room.roomType = 0
    }
    // console.log(room.roomType)
    renderRoomType(room)

}
const renderRoomType = (room)=>{
    // console.log(room.roomType)
    if(room.roomType==1){
        // console.log("start",room.roomType)
        room.element.addClass("room-start")
        room.element.removeClass("room-end")
    }
    else if(room.roomType==2){
        // console.log("end",room.roomType)
        room.element.addClass("room-end")
        room.element.removeClass("room-start")
    }
    else {
        // console.log("default",room.roomType)
        room.element.removeClass("room-start")
        room.element.removeClass("room-end")
    }
}
const selectRoom=(event)=>{
    let room =$(event.target)
    room.css({border:"2px solid black"})
    if(selectedRoom != null){
        if(selectedRoom == room.data("room-number")){
            room.css({border:"none"})
            selectedRoom = null; 
        }else{
            rooms[selectedRoom].element.css({border:"none"})
            rooms[room.data("room-number")].element.css({border:"none"})
            createLine(rooms[selectedRoom], rooms[room.data("room-number")])
            selectedRoom = null; 
        }
    }else{
        selectedRoom = room.data("room-number");
    }
}
const showRoomOptions=(event)=>{
    let room =$(event.target)
    room.css({border:"1px solid black"})
}
const hideRoomOptions=(event)=>{
    let room =$(event.target)
    if(selectedRoom != room.data("room-number")){

        room.css({border:"none"})
    }
}
const showRooms=()=>{
    rooms.forEach((room, index)=>{
        console.log(index, room)
    })
}


const evaluateMap=async ()=>{
    // let visited = []
    btnNextIteration.prop("disabled", true);
    
    
    rooms.forEach(room=>{
        if(room.roomType == 1){
            room.value = 0
        }else{
            room.value = rooms.length-1
        }
        room.element.text(`${room.roomIndex}[${room.value}]`)
    })
    await evaluateRooms();
    btnNextIteration.prop("disabled", false);
}


let visited = [];
let evaluateRooms =async ()=>{
    let room = getEndRoom();

    return await evaluateRoomBFS(room);
}

let evaluateRoomBFS = (currentRoom)=>{
    let promises = []
    if(!currentRoom){
        return ;
    }
    currentRoom.element.text(`${currentRoom.roomIndex}[${currentRoom.value}]`)
    currentRoom.connectedRooms.forEach((connectedRoom,index)=>{
        // console.log("evaluated",connectedRoom.room.roomIndex, connectedRoom.room.value)
        if(connectedRoom.room.roomType==0 && (connectedRoom.room.value < currentRoom.value || connectedRoom.room.value == rooms.length-1)){
            connectedRoom.room.value = currentRoom.value-1;
            promises.push(
                new Promise((resolve, reject)=>{
                    // setTimeout(()=>{
                        resolve(evaluateRoomBFS(connectedRoom.room))
                    // },1000)
                })
            )
        }

    })
    return Promise.all(promises)
}

let nextAvailableRoom = (room)=>{
    if(room.roomType === 2 ){
        return room
    }else{
        for( let i = 0;i<room.connectedRooms.length;i++){
            return nextAvailableRoom(room.connectedRooms[i].room)
        }
    }
}
let findNextRoom=(ant)=>{
    let nextRoom = goToRoom(ant.currentRoom)
    return nextRoom;
}
let getStartRoom=()=>{
    let room = rooms.find(room=>room.roomType==1);
    console.log("start room", room)
    // startRoom.value = 0;
    return room;
}
let getEndRoom = ()=>{
    let room = rooms.find(room=>room.roomType===2);
    // startRoom.value = 0;
    return room;
}
const createLine=(room1, room2)=>{
    console.log(room1, room2)
    let checkConnected = room1.connectedRooms.find(room=>room.room==room2)
    if(checkConnected){
        room1.element.css({border:"none"})
        room2.element.css({border:"none"})
        selectedRoom = null;
        return ;
    }
    let line = $(`<div class="link"></div>`)
    recalculateLine(room1, room2, line);

    let link1 = {room:room2,link:line}
    room1.connectedRooms.push(link1)
    let link2 = {room:room1,link:line}
    room2.connectedRooms.push(link2)

    let linkBreaker = $(`<div class="link-breaker"></div>`).click((e)=>{breakLink(room1, room2, line)})
    line.append(linkBreaker)
    canvas.append(line)
    evaluateMap();
}
let breakLink = (room1, room2, link)=>{
    console.log("break link", link, room1, room2);

    let index = room1.connectedRooms.findIndex(room=>room.room==room2)
    let index2 = room2.connectedRooms.findIndex(room=>room.room==room1)
    room1.connectedRooms.splice(index,1)
    room2.connectedRooms.splice(index2,1)
    link.remove();
    evaluateMap();
}
let recalculateLine=(room1, room2, line)=>{
    // if(room1.roomType == 2 || room2.roomType == 2){
        // evaluateMap()
    // }
    let x1 = room1.location.x + 15;
    let y1 = room1.location.y + 15;

    let x2 = room2.location.x+15;
    let y2 = room2.location.y+15;

    let distance = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))

    let radians = Math.atan2(y2-y1, x2-x1)
    let degrees = (radians*180)/Math.PI;

    line.css({
        width:distance,
        left:x1,
        top:y1,
        transform:`rotate(${degrees}deg)`
    })
}
const $mapNameInput = $("#map-name-input")
let mapName;
$mapNameInput.on("keyup", ()=>{
    mapName = $mapNameInput.val()
    console.log(mapName)
    if(mapName.length>2){
        btnevaluateMap.prop("disabled", false);
    }else{
        btnevaluateMap.prop("disabled", true);
    }
})
const submitMap = ()=>{
    // let mapName = $mapNameInput.val()
    let mapRooms = []
    rooms.forEach(room=>{
        // let r = {element:roomEl, roomType:type, location:{x, y}, connectedRooms:[], roomIndex:roomNumber}
        let {element, roomType, location, connectedRooms, roomIndex} = room

        let connectedIndexes = connectedRooms.map((room)=>room.room.roomIndex)
        let r = {roomType, location, connectedIndexes, roomIndex};
        console.log(r)
        mapRooms.push(r)
    })
    let map = {rooms:mapRooms, name:mapName}
    maps.push(map)
    localStorage.setItem(`maps`, JSON.stringify(maps))
}
btnLogRooms.on("click",showRooms)
btnevaluateMap.on("click",submitMap)
