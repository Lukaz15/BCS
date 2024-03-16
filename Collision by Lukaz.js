//Initial declarations
const canvas = document.getElementById('simulation')
canvas.height = window.innerHeight / 1.3;
canvas.width = window.innerWidth / 1.3;
const res_text = document.getElementById('restitution-value')
const ctx = canvas.getContext("2d");
const res_slider = document.getElementById('restitution-slider')
const ball_slider = document.getElementById('balls-slider')
const ball_text = document.getElementById('balls-value')
const grav_slider = document.getElementById('gravity-slider')
const grav_text = document.getElementById('gravity-value')
const start = document.getElementById('start')
//Declares the scale of the simulation
const simScale = Math.max(canvas.width, canvas.height) / 100
const sim = { width: canvas.width / simScale, height: canvas.height / simScale }
//Declares some important global parameters 
let gravity = -9.81
const dt = 1.0 / 30.0
let balls = 10
let restitution = 1
let objects = []

//Functions to adjust the values of the sliders
ball_slider.oninput = function () {
    balls = this.value
    ball_text.textContent = this.value

}

res_slider.oninput = function () {
    restitution = this.value / 10
    res_text.textContent = this.value / 10
}

grav_slider.oninput = function () {
    gravity = this.value * -1
    grav_text.textContent = this.value * -1
    console.log(this.value, this.value * -1)
}

// Functions to scale position values back to canvas coordinates
function scaleY(posY) { return canvas.height - posY * simScale }
function scaleX(posX) { return posX * simScale }

// Construction of the class "object", the balls
class object {
    constructor(radius, pos, startVelocity, velocity, mass, accel) {
        this.radius = radius
        this.pos = pos
        this.startVelocity = startVelocity
        this.velocity = velocity
        this.mass = mass
        this.accel = accel
    }
}
//Construction of the class "vector2" to represent 2D Vectors
class vector2 {
    constructor(X = 0, Y = 0) {
        this.X = X
        this.Y = Y
    }
    magnitude() {
        return Math.sqrt(Math.pow(this.X, 2) + Math.pow(this.Y, 2))
    }
    normalize(s) {
        this.X *= s;
        this.Y *= s;
    }
    addM(v, m = 1.0) {
        this.X += v.X * m;
        this.Y += v.Y * m;
        return this;
    }
    subtract(va, vb) {
        this.X = va.X - vb.X;
        this.Y = va.Y - vb.Y;
        return this;
    }
    dot(v) {
        return this.X * v.X + this.Y * v.Y;
    }
}
//Initializes the objects and grants them a range of random properties
function setupSim() {
    objects = [];
    start.textContent = 'Restart'
    for (ball = 0; ball < balls; ball++) {

        const radius = 1.5 + Math.random() * 3
        const pos = new vector2((Math.random() * sim.width) - radius, (Math.random() * sim.height) - radius)
        const startVelocity = new vector2(-10 + 10 * Math.random(), -10 + 10 * Math.random())
        const velocity = new vector2(startVelocity.X, startVelocity.Y)
        const mass = Math.PI * radius * radius
        const accel = new vector2(velocity.X / mass, velocity.Y / mass)
        objects.push(new object(radius, pos, startVelocity, velocity, mass, accel));
    }
}

//Detects and computes the collisions between objects
function collisionObjects(object, i) {
    for (i2 = objects.indexOf(object) + 1; i2 < objects.length; i2++) {
        let object2 = objects[i2]
        const distance = Math.sqrt(Math.pow((object.pos.X - object2.pos.X), 2) + Math.pow((object.pos.Y - object2.pos.Y), 2))
        if (distance < object.radius + object2.radius) {
            //Creates a new empty Vector2
            let nV = new vector2()
            //Gets the distance between objects and sets them in the X and Y of nV 
            nV.subtract(object2.pos, object.pos)
            //Gets the magnitude of nVm, which is the magnitude of the distance between them
            const nVm = nV.magnitude()
            // Normalizes the vector to get only its direction.
            nV.normalize(1.0 / nVm)
            //Constant that holds a value for the space that the objects are overlapping, used for correction
            const cor = (object.radius + object2.radius - nVm) / 2.0
            //Applies correction for the objects, so that they are touching only by their edges
            object.pos.addM(nV, -cor)
            object2.pos.addM(nV, cor)
            //Scalar projections of the normal direction vector, used to calculate the resulting velocities  
            let vel1 = object.velocity.dot(nV)
            let vel2 = object2.velocity.dot(nV)
            //Calculates initial momentum, plays audio if momentum > 150
            const InitialMomentum = vel1 * object.mass + vel2 * object2.mass
            //Plays a sound effect when balls collide each other. The volume is based on the momentum.
            playOnBall(InitialMomentum)
            /*Computes the final velocities of both objects according to the law of conservation of momentum, and multiplies it
            by a restitution factor to simulate different elasticities. Note that by decresing the restitution, due to
            simplification, the momentum won't really be the same after the collision*/
            let newVel1 = ((vel1 * (object.mass - object2.mass) + 2 * object2.mass * vel2) / (object.mass + object2.mass)) * restitution;
            let newVel2 = ((vel2 * (object2.mass - object.mass) + 2 * object.mass * vel1) / (object.mass + object2.mass)) * restitution;
            //Changes the velocities of each object according to their final velocities
            object.velocity.addM(nV, newVel1 - vel1)
            object2.velocity.addM(nV, newVel2 - vel2)
            vel1 = object.velocity.dot(nV)
            vel2 = object2.velocity.dot(nV)
            //Calculates final momentum
            const FinalMomentum = vel1 * object.mass + vel2 * object2.mass
            //Play a small "glowing" effect for cosmetic purposes
            glowOn(object, object2, FinalMomentum)
            //Starts the next iteration
            object2 = objects[i2]
        }
    }


}

//Detects and computes the collision with walls
function collisionWalls(object) {

    if (object.pos.X < object.radius) {
        object.pos.X = object.radius;
        object.velocity.X = -object.velocity.X * restitution;
        playOnWall(object.velocity.magnitude(), object.velocity.Y)

    }

    if (object.pos.X > sim.width - object.radius) {
        object.pos.X = sim.width - object.radius;
        object.velocity.X = -object.velocity.X * restitution;
        playOnWall(object.velocity.magnitude(), object.velocity.Y)

    }

    if (object.pos.Y < object.radius) {
        object.pos.Y = object.radius;
        object.velocity.Y = -object.velocity.Y * restitution;
        playOnWall(object.velocity.magnitude(), object.velocity.Y)

    }

    if (object.pos.Y > sim.height - object.radius) {
        object.pos.Y = sim.height - object.radius;
        object.velocity.Y = -object.velocity.Y * restitution;
        playOnWall(object.velocity.magnitude(), object.velocity.Y)


    }

}

//Animates the objects across the simulation space and calls for the detections and handling of collisions
function Animation() {
    objects.forEach(function callback(object, i) {
        if (object.velocity.X < object.startVelocity.X) {
            object.velocity.X += object.accel.X * dt
        }
        if (object.velocity.Y > gravity)
            object.velocity.Y += gravity * dt
        object.pos.X += object.velocity.X * dt
        object.pos.Y += object.velocity.Y * dt
        object.accel.X = object.velocity.X * dt
        collisionWalls(object)
        collisionObjects(object, i)

    });

}
//Function to play a sound when balls collide with each other
function playOnBall(speed) {
    if (speed > 50) {
        const audio = new Audio('ball_collide.wav')
        speed = Math.abs(speed)
        audio.volume = Math.min(speed / 900, 1)
        audio.play()
    }
}
//Function to play a sound when balls collide with a wall
function playOnWall(speed, sY) {
    console.log(sY)
    if (sY > 5) {
        const audio = new Audio('wall_collide.wav')
        audio.volume = Math.min(speed / 35, 1)
        audio.play()
    }
}
//Function to draw a cosmetic circle around balls that collide
function glowOn(object, object2, speed) {
    if (speed > 50){
        ctx.beginPath();
        ctx.fillStyle = '#FFF';
        ctx.arc(scaleX(object.pos.X), scaleY(object.pos.Y), (object.radius * 1.25) * simScale, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#FFF';
        ctx.arc(scaleX(object2.pos.X), scaleY(object2.pos.Y), (object2.radius * 1.25) * simScale, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}


// Function to draw objects on the canvas
function drawObjects() {
    objects.forEach(object => {
        ctx.beginPath();
        ctx.fillStyle = '#ADABC4';
        ctx.arc(scaleX(object.pos.X), scaleY(object.pos.Y), object.radius * simScale, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        ctx.closePath();
        ctx.fill()



    });
}

// Function to start the main animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Animation()
    drawObjects();
    requestAnimationFrame(animate);
}
start.addEventListener('click', setupSim)
animate();
