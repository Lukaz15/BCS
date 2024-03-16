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
You can change the value of restitution (to simulate inelastic collisions), gravity, and the amount of balls with the sliders at the
top right of the screen. Note that changing the amount of balls requires clicking on restart for the change to take effect.
