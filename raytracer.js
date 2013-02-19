function Vector(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector.prototype.dot = function(vec) {
  var result = this.x * vec.x + this.y * vec.y + this.z * vec.z;
  return result;
}

Vector.prototype.len = function() {
  var result = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
  return result;
}

Vector.prototype.normalize = function() {
  var len = this.len();
  this.x /= len;
  this.y /= len;
  this.z /= len;
}

Vector.prototype.multiply = function(factor) {
  this.x *= factor;
  this.y *= factor;
  this.z *= factor;
}

Vector.prototype.add = function(vec) {
  var result = new Vector(0, 0, 0);

  result.x = this.x + vec.x;
  result.y = this.y + vec.y;
  result.z = this.z + vec.z;
  return result;
}

function Screen(canvasId, width, height) {
  this.canvasId = canvasId;
  this.width = width;
  this.height = height;

  this.canvas = document.getElementById(canvasId);
  this.canvas.width = width;
  this.canvas.height = height;
  this.ctx = this.canvas.getContext('2d');
  this.imageData = this.ctx.createImageData(width, height);
}

Screen.prototype.putPixel = function(x, y, r, g, b) {
  var index = 4 * (this.width * y + x);
  this.imageData.data[index] = r;
  this.imageData.data[index + 1] = g;
  this.imageData.data[index + 2] = b;
  this.imageData.data[index + 3] = 255;
}

Screen.prototype.refresh = function() {
  this.ctx.putImageData(this.imageData, 0, 0);
}

function Camera() {
  this.eye = new Vector(0, 0, 1000);
  this.ul = new Vector(0, 0, 500);
  this.ur = new Vector(500, 0, 500);
  this.ll = new Vector(0, 0, 0);
  this.lr = new Vector(500, 0, 0);
}

function Sphere(x, y, z, radius) {
  this.pos = new Vector(x, y, z);
  this.radius = radius;
}

Sphere.prototype.intersects = function(ray) {
  var newVector = new Vector(ray.point.x - this.pos.x, ray.point.y - this.pos.y, ray.point.z - this.pos.z);

  var result = {'t': 0, 'intersects':false};
  var a = ray.vector.dot(ray.vector);
  var b = 2 * ray.vector.dot(newVector);
  var c = newVector.dot(newVector) - (this.radius * this.radius);

  //Find discriminant
  var disc = b * b - 4 * a * c;
  
  // if discriminant is negative there are no real roots, so return 
  // false as ray misses sphere
  if (disc < 0) {
    
    return result;
  }

  // compute q as described above
  var distSqrt = Math.sqrt(disc);
  var q;
  if (b < 0)
      q = (-b - distSqrt)/2.0;
  else
      q = (-b + distSqrt)/2.0;

  // compute t0 and t1
  var t0 = q / a;
  var t1 = c / q;



  // make sure t0 is smaller than t1
  if (t0 > t1)
  {
      // if t0 is bigger than t1 swap them around
      var temp = t0;
      t0 = t1;
      t1 = temp;
  }

  // if t1 is less than zero, the object is in the ray's negative direction
  // and consequently the ray misses the sphere
  if (t1 < 0)
      return result;

  // if t0 is less than zero, the intersection point is at t1
  if (t0 < 0)
  {
      result.t = t1;
      result.intersects = true;
      return result;
  }
  // else the intersection point is at t0
  else
  {
      result.t = t1;
      result.intersects = true;
      return result;
  }

}

function Light(x,y,z) {
  this.pos = new Vector(x, y, z);
}

function Ray(point, vector) {
  this.point = point;
  this.vector = vector;
}

function Scene() {
  this.objects = [];
  this.lights = [];
  this.camera = null;
  this.screen = null;
  this.options = {};
}

Scene.prototype.processRay = function(ray, i, j) {
  
  var objectLength = this.objects.length;
  var lightLength = this.lights.length;

  for (var k = 0; k < objectLength; k++) {
    var obj = this.objects[k];
    var result = obj.intersects(ray);

    for (var z = 0; z < lightLength; z++) {

      var light = this.lights[z];
      if (result.intersects) {
        ray.vector.multiply(result.t);
        var intVector = ray.vector.add(ray.point);

        var normalVec = new Vector(intVector.x - obj.pos.x, intVector.y - obj.pos.y, intVector.z - obj.pos.z);
        var lightVector = new Vector(light.pos.x, light.pos.y, light.pos.z);

        lightVector.normalize();
        normalVec.normalize();
        var dot = lightVector.dot(normalVec);

        if (dot < 0) {
          dot = 0;
        }

          this.screen.putPixel(i, j, 180 * dot + 40, 80, 20);
      }
      else {
        //this.screen.putPixel(i, j, 0, 0, 0);
      }

    }
  }
}

Scene.prototype.render = function() {
  var rayVec = new Vector(0, 0, 0);
  for (var i = 0; i < 500; i++) {
    for (var j = 0; j < 500; j++) {
      // rayVec.x = i - this.camera.eye.x;
      // rayVec.y = 0 - this.camera.eye.y;
      // rayVec.z = j - this.camera.eye.z;

      rayVec.x = 0;
      rayVec.y = 0;
      rayVec.z = -1;

      var eye = new Vector(i - 250,j - 250, 1000);
      var ray = new Ray(eye, rayVec);
      this.processRay(ray, i, j);
    }
  }

  this.screen.refresh();
}

var scene = new Scene();
scene.camera = new Camera();
scene.screen = new Screen('canv', 500, 500);

var sphere = new Sphere(-100, 0, 0, 100);
var sphere2 = new Sphere(100, 0, 0, 100);
var light = new Light(1, 0.5, 1);
var light2 = new Light(1, 0, 0);
scene.objects.push(sphere);
scene.objects.push(sphere2);
scene.lights.push(light);
//scene.lights.push(light2);

$('#btnRender').click(
  function() {
    scene.render();
  }
);


