//////////////////////////  Hero class /////////////////////////////////


function Hero(program, x, y, z, degrees, bounding_cir_rad) {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.heroVertices = pacman.vertices[0].values;

    this.heroNormals = pacman.vertices[1].values;

    this.heroIndices = pacman.connectivity[0].indices;

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;

    this.canMove = true;
};

Hero.prototype = Object.create(GameObject.prototype);

Hero.prototype.init = function () {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.heroVertices), gl.STATIC_DRAW);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.heroNormals), gl.STATIC_DRAW);

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.heroIndices), gl.STATIC_DRAW);
};

//Checks for collisions with walls.
Hero.prototype.move = function (speed) {// Pass in negative speed for backward motion
    if (this.canMove) {
        var hero = this,
            offSetVal = 15,
            currGridX = getXCoord(hero.x),
            currGridZ = getZCoord(hero.z),
            northSquare = gridSquare(currGridX, currGridZ + 1),
            eastSquare = gridSquare(currGridX + 1, currGridZ),
            southSquare = gridSquare(currGridX, currGridZ - 1),
            westSquare = gridSquare(currGridX - 1, currGridZ),
            newX = hero.x + speed * hero.xdir,
            newZ = hero.z + speed * hero.zdir;

        if (newX - hero.x > 0) {//Moving East
            if (eastSquare !== 1 || newX < xCoord(currGridX) + offSetVal) {
                hero.x = newX;
            }
        } else if (newX - hero.x < 0) {//Moving West
            if (westSquare !== 1 || newX > xCoord(currGridX) - offSetVal) {
                hero.x = newX;
            }
        }

        if (newZ - hero.z < 0) {//Moving North
            if (northSquare !== 1 || newZ > zCoord(currGridZ) - offSetVal) {
                hero.z = newZ;
            }
        } else if (newZ - hero.z > 0) {//Moving South
            if (southSquare !== 1 || newZ < zCoord(currGridZ) + offSetVal) {
                hero.z = newZ;
            }
        }
    }
};

Hero.prototype.disableMovement = function () {
    var hero = this;
    hero.canMove = false;
    setTimeout(function() {
        hero.canMove = true;
    }, 2000);
};

Hero.prototype.show = function () {

    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 10.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, rotateY(-this.degrees));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.8, 0.8, 0.8));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    this.vPosition = gl.getAttribLocation(program, "vPosition");
    if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    this.vNormal = gl.getAttribLocation(program, "vNormal");
    if (this.vPosition < 0) {
        console.log('Failed to get the storage location of vPosition');
    }
    gl.vertexAttribPointer(this.vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.vNormal);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);

    //    var ambientProduct = mult(vec4(1.0,1.0,1.0,1.0), red);
    var ambientProduct = mult(la0, yellow);
    var diffuseProduct = mult(ld0, yellow);
    var specularProduct = mult(ls0, yellow);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
        flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
        flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
        flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
        flatten(lp0));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition2"),
        flatten(lp1));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),
        me);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.enable(gl.CULL_FACE);	// Why?
    gl.cullFace(gl.BACK);
    gl.drawElements(gl.TRIANGLES, this.heroIndices.length, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.CULL_FACE);

    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated.  
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
};



//////////////////////////  End hero's code /////////////////////////////////