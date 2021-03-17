//////////////////////////  ThingSeeking class /////////////////////////////////


function ThingSeeking(program, x, y, z, degrees, bounding_cir_rad)  {
    GameObject.call(this, program, x, y, z, degrees, bounding_cir_rad);

    this.thingSeekingVertices = coin.vertices[0].values;

    this.thingSeekingNormals = coin.vertices[1].values;

    this.thingSeekingIndices = coin.connectivity[0].indices;

    this.texCoord = cylindricalTextureMap(this.thingSeekingVertices);

    this.vBuffer = null;
    this.nBuffer = null;
    this.iBuffer = null;
    this.vPosition = null;
    this.vNormal = null;

    this.rotate = 0;
};

ThingSeeking.prototype = Object.create(GameObject.prototype);

ThingSeeking.prototype.init = function() {
    this.vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingVertices), gl.STATIC_DRAW );

    this.nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.thingSeekingNormals), gl.STATIC_DRAW );

    this.iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.thingSeekingIndices), gl.STATIC_DRAW);
    
    this.tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.tBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW );

    var image0 = new Image();
    image0.crossOrigin = "anonymous";
    image0.src = "../Images/newtest.png";
    image0.onload = function() { 
        var texture0 = gl.createTexture();
        gl.activeTexture( gl.TEXTURE0);
        gl.bindTexture( gl.TEXTURE_2D, texture0 );
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                gl.UNSIGNED_BYTE, image0);
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, 
                gl.NEAREST_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    };
};

ThingSeeking.prototype.isTouchingHero = function () {
    var xDist = Math.pow(this.x - hero.x, 2),
        zDist = Math.pow(this.z - hero.z, 2),
        distanceBetweenCenters = Math.sqrt(xDist + zDist),
        collisionDist = this.bounding_cir_rad + hero.bounding_cir_rad;

    return (distanceBetweenCenters - collisionDist) <= 0;
};

ThingSeeking.prototype.show = function() {

    g_matrixStack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, translate(this.x, 15, this.z));
    modelViewMatrix = mult(modelViewMatrix, scalem(0.4,0.4,0.4));
    modelViewMatrix = mult(modelViewMatrix, rotate(this.rotate, vec3(1.0, 1.0, 0.0)));

    this.rotate += 0.5;
    if(this.rotate > 360) {
        this.rotate -= 360;
    }

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

    var ambientProduct = mult(la0, red);
    var diffuseProduct = mult(ld0, red);
    var specularProduct = mult(ls0, red);
    
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

    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0); 
    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
    1);

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.drawElements( gl.TRIANGLES, this.thingSeekingIndices.length, gl.UNSIGNED_SHORT, 0 ); 
    
    modelViewMatrix = g_matrixStack.pop();
    // IMPORTANT: Disable current vertex attribute arrays so those in
    // a different object can be activated
    gl.disableVertexAttribArray(this.vPosition);
    gl.disableVertexAttribArray(this.vNormal);
    gl.disableVertexAttribArray(this.vTexCoord);

    gl.uniform1i(gl.getUniformLocation(program, "texture_flag"), 0);
};



//////////////////////////  End ThingSeeking's code /////////////////////////////////
