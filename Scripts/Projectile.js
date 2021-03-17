//////////////////////////  Projectile class /////////////////////////////////


function Projectile(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.projectileVertices = sphere.vertices[0].values;

    this.projectileNormals = sphere.vertices[1].values;

    this.projectileIndices = sphere.connectivity[0].indices;

    this.texCoord = cylindricalTextureMap(this.projectileVertices);

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    this.bounceSound = document.getElementById('bounceSound');
};

Projectile.prototype = Object.create(GameObject.prototype);

Projectile.prototype.init = function() {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.projectileVertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.projectileNormals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.projectileIndices), gl.STATIC_DRAW);
    
    this.tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW );

    var image4 = new Image();
    image4.crossOrigin = "anonymous";
    image4.src = "../Images/glowstone.png";
    image4.onload = function() { 
        var texture4 = gl.createTexture();
        gl.activeTexture( gl.TEXTURE4);
        gl.bindTexture( gl.TEXTURE_2D, texture4 );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, image4);
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    }
};

Projectile.prototype.isTouchingHero = function () {
    var collisionDist = this.bounding_cir_rad + hero.bounding_cir_rad;
    return (this.distanceBetweenCenters() - collisionDist) <= 0;
};

Projectile.prototype.distanceBetweenCenters = function () {
    var xDist = Math.pow(this.x - hero.x, 2),
    zDist = Math.pow(this.z - hero.z, 2),
    distanceBetweenCenters = Math.sqrt(xDist + zDist);
    return distanceBetweenCenters;
};

//Checks for collisions with walls.
Projectile.prototype.move = function (speed) {// Pass in negative speed for backward motion
    var projectile = this,
        offSetVal = 22,
        currGridX = getXCoord(projectile.x),
        currGridZ = getZCoord(projectile.z),
        northSquare = gridSquare(currGridX,     currGridZ + 1),
        eastSquare  = gridSquare(currGridX + 1, currGridZ),
        southSquare = gridSquare(currGridX,     currGridZ - 1),
        westSquare  = gridSquare(currGridX - 1, currGridZ),
        newX = projectile.x + speed * projectile.xdir,
        newZ = projectile.z + speed * projectile.zdir;


    if (newX - projectile.x > 0) {//Moving East
        if(eastSquare !== 1 || newX < xCoord(currGridX) + offSetVal) {
            projectile.x = newX;
        }
        else {
            if ((this.distanceBetweenCenters() - 250) <= 0) {
                projectile.bounceSound.pause();
                projectile.bounceSound.currentTime = 0;
                projectile.bounceSound.play();
            }
            projectile.xdir = -projectile.xdir;
            newX = projectile.x + speed * projectile.xdir;
            projectile.x = newX;
            //console.log("Hit wall");
        }
    } else if (newX - projectile.x < 0) {//Moving West
        if(westSquare !== 1 || newX > xCoord(currGridX) - offSetVal) {
            projectile.x = newX;
        }
        else {
            if ((this.distanceBetweenCenters() - 300) <= 0) {
                projectile.bounceSound.pause();
                projectile.bounceSound.currentTime = 0;
                projectile.bounceSound.play();
            }
            projectile.xdir = -projectile.xdir;
            newX = projectile.x + speed * projectile.xdir;
            projectile.x = newX;
            //console.log("Hit wall");
        }
    }

    if (newZ - projectile.z < 0) {//Moving North
        if(northSquare !== 1 || newZ > zCoord(currGridZ) - offSetVal) {
            projectile.z = newZ;
        }
        else {
            if ((this.distanceBetweenCenters() - 300) <= 0) {
                projectile.bounceSound.pause();
                projectile.bounceSound.currentTime = 0;
                projectile.bounceSound.play();
            }
            projectile.zdir = -projectile.zdir;
            newZ = projectile.z + speed * projectile.zdir;
            projectile.z = newZ;
            //console.log("Hit wall");
        }
    } else if (newZ - projectile.z > 0) {//Moving South
        if(southSquare !== 1 || newZ < zCoord(currGridZ) + offSetVal) {
            projectile.z = newZ;
        }
        else {
            if ((this.distanceBetweenCenters() - 300) <= 0) {
                projectile.bounceSound.pause();
                projectile.bounceSound.currentTime = 0;
                projectile.bounceSound.play();
            }
            projectile.zdir = -projectile.zdir;
            newZ = projectile.z + speed * projectile.zdir;
            projectile.z = newZ;
            //console.log("Hit wall");
        }
    }
};

Projectile.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 10.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, rotateY(-this.degrees));
    modelViewMatrix = mult(modelViewMatrix, scalem(5.0,5.0,5.0));

    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    this.vPosition = gl.getAttribLocation( program, "vPosition" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( this.vPosition );    

    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    this.vNormal = gl.getAttribLocation( program, "vNormal" );
    if (this.vPosition < 0) {
	console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer( this.vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.vNormal );

    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.iBuffer );

    //    var ambientProduct = mult(vec4(1.0,1.0,1.0,1.0), red);
    var ambientProduct = mult(la0, yellow);
    var diffuseProduct = mult(ld0, yellow);
    var specularProduct = mult(ls0, yellow);
    
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
		  flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
		  flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
		  flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
		  flatten(lp0) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"),
        flatten(lp1));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
		 me);

    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    this.vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    if (this.vTexCoord < 0) {
    console.log('Failed to get the storage location of vTexCoord');
    }
    gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vTexCoord);

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 4); 
    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
    1);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.enable(gl.CULL_FACE);	// Why?
    gl.cullFace(gl.BACK);
    gl.drawElements( gl.TRIANGLES, this.projectileIndices.length, gl.UNSIGNED_SHORT, 0 ); 
    gl.disable(gl.CULL_FACE);
    
    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated.  
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
    gl.disableVertexAttribArray(this.vTexCoord);

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"), 0);
};



//////////////////////////  End projectile's code /////////////////////////////////