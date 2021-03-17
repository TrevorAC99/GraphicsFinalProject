//////////////////////////  GameObject prototype /////////////////////////////////



function GameObject(program, x, y, z, degrees, bounding_cir_rad)  {

    this.x = x;
    this.y = y;
    this.z = z;
    this.degrees = degrees;
    this.xdir    = Math.cos(this.degrees*Math.PI/180.0);
    this.zdir    = Math.sin(this.degrees*Math.PI/180.0);
    this.bounding_cir_rad = bounding_cir_rad;

    GameObject.prototype.turn = function(degreesRotation) {
	this.degrees = (this.degrees + degreesRotation) % 360;
	this.xdir    = Math.cos(this.degrees*Math.PI/180.0);
	this.zdir    = Math.sin(this.degrees*Math.PI/180.0);
    };

    GameObject.prototype.move = function (speed) {		// Pass in negative speed for backward motion
	this.x = this.x + speed * this.xdir;
	this.z = this.z + speed * this.zdir;
    };
};



//////////////////////////  End GameObject prototype /////////////////////////////////

/**
 * Takes an array of vertices and returns an array of texture coordinates to map a texture onto a mesh.
 * This function assumes that that the mesh is centered at the origin.
 * @param {*} vertices The vertices that will be mapped to a texture;
 */
function cylindricalTextureMap(vertices) {
    var textureCoords = [];
    var meshHeight, maxY = vertices[1], minY = vertices[1], meshRadius = 0;

    for(var i = 0; i < vertices.length; i += 3) {//Finds the height and radius of the mesh.
        var x = vertices[i],
            y = vertices[i + 1],
            z = vertices[i + 2];

        if (y > maxY) {
            maxY = y;
        } else if (y < minY) {
            minY = y;
        }

        var distanceFromOrigin = Math.sqrt(x*x + y*y + z*z);
        if (distanceFromOrigin > meshRadius) {
            meshRadius = distanceFromOrigin;
        }
    }

    meshHeight = maxY - minY;

    for(var i = 0; i < vertices.length; i += 3) {

        var x = vertices[i],
            y = vertices[i + 1],
            z = vertices[i + 2];
        
        var theta = getAngleAboutOrigin(x, z),
            height = (y + meshHeight / 2) / (meshHeight);
        
        var s = theta / (2 * Math.PI),
            t = height;
        
        textureCoords.push(s, t);
    }

    return textureCoords;
};

function getAngleAboutOrigin(x, z) {
    var magnitude = Math.sqrt(x*x + z*z),
        normX = x / magnitude,
        normZ = z / magnitude;
    
    if (normZ > 0) {
        return Math.acos(normX);
    } else {
        return 2 * Math.PI - Math.acos(normX);
    }
};