var cv = document.getElementById("GFG");
var ctx = null;
$(document).ready(()=>{
    ctx = cv.getContext("2d");
})

function drawArc(point, point2){
    // console.log("starting point of curve",this.a())
    // console.log("ending point of curve",this.b())
    // this.points.forEach((point)=>{
        if(point2){
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            
            let p0 = point
            let p2 = point2
            
            
            let mid = this.getMidPoint(p0, p2);
            let r = this.optimalRadius(p0, p2, mid)

            ctx.moveTo(p0.x, p0.sy);
            ctx.arcTo(mid.x, mid.y, p2.x, p2.y, r);
            ctx.lineTo(p2.x, p2.y);
            
            ctx.stroke();
        }
    // })
}
function optimalRadius(p1, p2, mid){
    let dx = Math.abs(mid.x-p1.x)
    let dy = Math.abs(p2.y-mid.y)
    let r = dx>dy?dy:dx;
    return r;

    /*
        let m = dy/dx
        let c = Math.sqrt(Math.pow(dx, 2)+Math.pow(dy, 2))
        // console.log("gradient", m)
        // console.log("distance", c)
        
        let r = c/(Math.sqrt(Math.pow(m,2)+1));
    */
}
functiongetMidPoint(p1, p2){
   return new Point(p2.x,p1.y)
}