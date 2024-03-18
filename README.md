<h1 style="font-size: 36px;" align="center">Balls Collision Simulation</h1>

This is a basic simulation of balls colliding with each other using HTML, CSS, and JS.

The physics are computed according to the law of conservation of momentum. Keep in mind that reducing the restitution value below 1 
will result in a loss of momentum. This is due to the lack of other parameters needed to calculate velocity loss, leading to the use of 
an artificial factor to simulate inelastic collisions. Otherwise, during a completely elastic collision, the momentum will remain the same.

<br>
<br>
<p align="center">
  <a href="https://youtu.be/lw9to5DSBRA">
    <img src="https://img.youtube.com/vi/lw9to5DSBRA/0.jpg" alt="Video Preview" />
  </a>
</p>
<br>
<br>
Click on "Start" to start the simulation.
You can adjust the restitution value (to simulate inelastic collisions), gravity, and the number of balls using the sliders at the top right of the screen. Note that changing the number of balls requires clicking on restart for the change to take effect.
<br>
<br>
<a href="https://lukaz15.github.io/BCS/">You can try it out here</a>
