//////////////////////////  Villain class /////////////////////////////////


function Villain(program, x, y, z, degrees, bounding_cir_rad, color, movementType = 0) {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.villainVertices = fancyGhost.vertices[0].values;

    this.villainNormals = fancyGhost.vertices[1].values;

    this.villainIndices = fancyGhost.connectivity[0].indices;

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;
    this.color = color;
    this.movementType = movementType;
    this.isMoving = false;
    this.seeSound = new Audio('../Sounds/soundSeeing.mp3');
};

Villain.prototype = Object.create(GameObject.prototype);

Villain.prototype.init = function () {
    var villain = this;

    this.vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.villainVertices), gl.STATIC_DRAW);

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.villainNormals), gl.STATIC_DRAW);

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.villainIndices), gl.STATIC_DRAW);

    this.movementFunctions = [
        function () {
            if (!villain.isMoving) {
                var currX = getXCoord(villain.x);
                var currZ = getZCoord(villain.z);

                /**
                 * 0 - Looking east.
                 * 1 - Looking down.
                 * 2 - Looking west.
                 * 3 - Looking up.
                 */
                var direction = Math.floor(villain.degrees / 90);

                var left,
                    right,
                    forward;

                var leftSee = false;
                var rightSee = false;
                var forwardSee = false;
                var counter = 1;

                switch (direction) {
                    case 0:
                        left = gridSquare(currX, currZ + 1);
                        right = gridSquare(currX, currZ - 1);
                        forward = gridSquare(currX + 1, currZ);
                        break;
                    case 1:
                        left = gridSquare(currX + 1, currZ);
                        right = gridSquare(currX - 1, currZ);
                        forward = gridSquare(currX, currZ - 1);
                        break;
                    case 2:
                        left = gridSquare(currX, currZ - 1);
                        right = gridSquare(currX, currZ + 1);
                        forward = gridSquare(currX - 1, currZ);
                        break;
                    case 3:
                        left = gridSquare(currX - 1, currZ);
                        right = gridSquare(currX + 1, currZ);
                        forward = gridSquare(currX, currZ + 1);
                        break;
                    default:
                        forward = 0;
                        console.log("Error");
                }

                var directions = [];

                if (left === 0) {
                    directions.push(270);
                }

                if (right === 0) {
                    directions.push(90);
                }

                if (forward === 0) {
                    directions.push(0);
                }

                if(directions.length === 0) {//If something is wrong, turn around.
                    directions.push(180);
                }

                villain.turn(directions[Math.floor(Math.random() * directions.length)]);
            }
        },

        function () {//If player is in line of sight, will follow player.
            if (!villain.isMoving) {
                var currX = getXCoord(villain.x);
                var currZ = getZCoord(villain.z);

                /**
                 * 0 - Looking east.
                 * 1 - Looking down.
                 * 2 - Looking west.
                 * 3 - Looking up.
                 */
                var direction = Math.floor(villain.degrees / 90);

                var left,
                    right,
                    forward;

                switch (direction) {
                    case 0:
                        left = gridSquare(currX, currZ + 1);
                        for (var counter = 1; gridSquare(currX, currZ + counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ + counter))) {
                                villain.seeSound.play();
                                villain.turn(270);
                                return;
                            }
                        }
                        right = gridSquare(currX, currZ - 1);
                        for (var counter = 1; gridSquare(currX, currZ - counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ - counter))) {
                                villain.seeSound.play();
                                villain.turn(90);
                                return;
                            }
                        }
                        forward = gridSquare(currX + 1, currZ);
                        for (var counter = 1; gridSquare(currX + counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX + counter)) && (getZCoord(hero.z) === currZ)) {
                                return;
                            }
                        }
                        break;
                    case 1:
                        left = gridSquare(currX + 1, currZ);
                        for (var counter = 1; gridSquare(currX + counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX + counter)) && (getZCoord(hero.z) === currZ)) {
                                villain.seeSound.play();
                                villain.turn(270);
                                return;
                            }
                        }
                        right = gridSquare(currX - 1, currZ);
                        for (var counter = 1; gridSquare(currX - counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX - counter)) && (getZCoord(hero.z) === currZ)) {
                                villain.seeSound.play();
                                villain.turn(90);
                                return;
                            }
                        }
                        forward = gridSquare(currX, currZ - 1);
                        for (var counter = 1; gridSquare(currX, currZ - counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ - counter))) {
                                return;
                            }
                        }
                        break;
                    case 2:
                        left = gridSquare(currX, currZ - 1);
                        for (var counter = 1; gridSquare(currX, currZ - counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ - counter))) {
                                villain.seeSound.play();
                                villain.turn(270);
                                return;
                            }
                        }
                        right = gridSquare(currX, currZ + 1);
                        for (var counter = 1; gridSquare(currX, currZ + counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ + counter))) {
                                villain.seeSound.play();
                                villain.turn(90);
                                return;
                            }
                        }
                        forward = gridSquare(currX - 1, currZ);
                        for (var counter = 1; gridSquare(currX - counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX - counter)) && (getZCoord(hero.z) === currZ)) {
                                return;
                            }
                        }
                        break;
                    case 3:
                        left = gridSquare(currX - 1, currZ);
                        for (var counter = 1; gridSquare(currX - counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX - counter)) && (getZCoord(hero.z) === currZ)) {
                                villain.seeSound.play();
                                villain.turn(270);
                                return;
                            }
                        }
                        right = gridSquare(currX + 1, currZ);
                        for (var counter = 1; gridSquare(currX + counter, currZ) !== 1; counter++) {
                            if ((getXCoord(hero.x) === (currX + counter)) && (getZCoord(hero.z) === currZ)) {
                                villain.seeSound.play();
                                villain.turn(90);
                                return;
                            }
                        }
                        forward = gridSquare(currX, currZ + 1);
                        for (var counter = 1; gridSquare(currX, currZ + counter) !== 1; counter++) {
                            if ((getXCoord(hero.x) === currX) && (getZCoord(hero.z) === (currZ + counter))) {
                                return;
                            }
                        }
                        break;
                    default:
                        forward = 0;
                        console.log("Error");
                }

                var directions = [];

                if (left === 0) {
                    directions.push(270);
                }

                if (right === 0) {
                    directions.push(90);
                }

                if (forward === 0) {
                    directions.push(0);
                }

                if(directions.length === 0) {//If something is wrong, turn around.
                    directions.push(180);
                }

                villain.turn(directions[Math.floor(Math.random() * directions.length)]);
            }
        }
    ];
};

Villain.prototype.isTouchingHero = function () {
    var xDist = Math.pow(this.x - hero.x, 2),
        zDist = Math.pow(this.z - hero.z, 2),
        distanceBetweenCenters = Math.sqrt(xDist + zDist),
        collisionDist = this.bounding_cir_rad + hero.bounding_cir_rad;

    return (distanceBetweenCenters - collisionDist) <= 0;
}

Villain.prototype.moveAuto = function () {
    this.movementFunctions[this.movementType]();
    this.moveTest();
}

Villain.prototype.moveTest = function () {
    var villain = this;
    if (!villain.isMoving) {
        villain.isMoving = true;
        var num = 50;

        function moveHelper() {
            if (num === 0) {
                villain.isMoving = false;
            } else {
                villain.move(1.0);
                num--;

                requestAnimationFrame(moveHelper);
            }
        }

        moveHelper(50);
    }
}

Villain.prototype.show = function () {

    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 25.0, this.z));
    modelViewMatrix = mult(modelViewMatrix, rotateY(-this.degrees + 90));
    modelViewMatrix = mult(modelViewMatrix, rotateX(-90.0));
    //modelViewMatrix = mult(modelViewMatrix, scalem(1.0,1.0,1.0))

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
    var ambientProduct = mult(la0, this.color);
    var diffuseProduct = mult(ld0, this.color);
    var specularProduct = mult(ls0, this.color);

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
    gl.drawElements(gl.TRIANGLES, this.villainIndices.length, gl.UNSIGNED_SHORT, 0);
    gl.disable(gl.CULL_FACE);

    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated.  
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
};

////////////////////////////////////////// End Villain's Code //////////////////////////////////
