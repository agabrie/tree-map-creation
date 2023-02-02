console.log("Hello World")
let roomSelector = $("#room-selector")
let btnLogRooms = $("#btn-log-rooms")
let btnSubmitMap = $("#btn-submit-map")
let canvas = $("#canvas")

let rooms = []
let roomNumber = 0;
let roomTypes = ["start", "end", "normal"]
let selectedRoom = null;

$(document).ready(()=>{
    roomSelector.draggable( {
        containment: '#main-content',
        helper: "clone",
        // stack: '#canvas div',
        cursor: 'move',
        // snap: "#canvas" 
        // grid: [ 25, 25 ],
        // revert: "invalid"
    });

    canvas.droppable({
        accept:".room",
        drop: handleCardDrop
    })
})

const handleCardDrop = (event, ui)=>{
    // console.log(ui.draggable.attr('id'))
    let xPos = ui.position.left-215
    let yPos = ui.position.top-70
    // console.log(event,ui)
    if(ui.draggable.attr('id') == "room-selector"){
        addRoomToDOM(xPos, yPos);
    }
    else{
        let roomNum = ui.draggable.data("room-number")
        let room = rooms[roomNum]
        let {left, top} = ui.draggable.position()
        // room.element.css({
        //     left:xPos, top:yPos
        // })

        room.location.x = left
        room.location.y = top

        room.connectedRooms.forEach((linked)=>{
            console.log(linked)
            recalculateLine(room, linked.room, linked.link)
        })
    }
}

let createRoom = (roomNumber, x,y)=>{
    let roomEl = $(`<div class="room" id="room-${roomNumber}"></div>`).data("room-number", roomNumber)
    .css({position:"absolute", left:x, top:y})
    return roomEl
}

let addRoomToDOM = (x, y)=>{
    let roomEl = createRoom(roomNumber,x, y )
    // .hover(showRoomOptions, hideRoomOptions)
    .click(selectRoom)
    .draggable( {
        containment: '#main-content',
        cursor: 'move',
        drag:()=>{
            let room = rooms[roomEl.data("room-number")]
            let {left, top} = roomEl.position()
            room.location.x = left
            room.location.y = top
            room.connectedRooms.forEach((linked)=>{
                recalculateLine(room, linked.room, linked.link)
            })
        }
    })
    .dblclick(toggleRoomType)

    canvas.append(roomEl);
    let room  = {element:roomEl, roomType:0, location:{x, y}, connectedRooms:[], roomIndex:roomNumber}


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
    console.log("room type", room.roomType)
    if(room.roomType>0){
        room.element.toggleClass("room-start")
    }
    if(room.roomType > 1 || room.roomType <1){
        room.element.toggleClass("room-end")
    }

}
const selectRoom=(event)=>{
    let room =$(event.target)
    room.css({border:"2px solid black"})
    console.log("previous selected", selectedRoom)
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
        console.log(selectedRoom)
    }
}
const showRoomOptions=(event)=>{
    let room =$(event.target)
    room.css({border:"1px solid black"})

    // console.log(selectedRoom)
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

const submitMap=()=>{
    console.log(rooms)
}

const createLine=(room1, room2)=>{
    
    let checkConnected = room1.connectedRooms.find(room=>room.room==room2)
    if(checkConnected){

        room1.element.css({border:"none"})
        room2.element.css({border:"none"})
        selectedRoom = null;

        // console.log("already connected")
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
    // console.log(distance, xMid, yMid, degrees )
}
let breakLink = (room1, room2, link)=>{
    console.log("break link", link, room1, room2);

    let index = room1.connectedRooms.findIndex(room=>room.room==room2)
    let index2 = room2.connectedRooms.findIndex(room=>room.room==room1)
    // console.log(checkConnected)
    room1.connectedRooms.splice(index,1)
    room2.connectedRooms.splice(index2,1)
    link.remove();
    console.log(room1.connectedRooms, room2.connectedRooms)

}
let recalculateLine=(room1, room2, line)=>{
    let x1 = room1.location.x + 15;
    let y1 = room1.location.y + 15;

    let x2 = room2.location.x+15;
    let y2 = room2.location.y+15;

    let distance = Math.sqrt(Math.pow(x1-x2, 2)+Math.pow(y1-y2, 2))

    // let xMid = (x1+x2)/2;
    // let yMid = (y1+y2)/2;

    let radians = Math.atan2(y2-y1, x2-x1)
    let degrees = (radians*180)/Math.PI;

    line.css({
        width:distance,
        left:x1,
        top:y1,
        transform:`rotate(${degrees}deg)`
    })
}
// createLine(addRoomToDOM(50, 60), addRoomToDOM(300, 250))
btnLogRooms.on("click",showRooms)
btnSubmitMap.on("click",submitMap)
