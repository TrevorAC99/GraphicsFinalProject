//////////////////////////  Arena class /////////////////////////////////

function Arena() {

	this.vertices = [
		0.0, 0.0, 0.0,
		ARENASIZE, 0.0, 0.0,
		ARENASIZE, 0.0, -ARENASIZE,
		0.0, 0.0, -ARENASIZE
	];

	this.normals = [
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0,
		0.0, 1.0, 0.0
	];

	this.indices = [
		0, 1, 2, 0, 2, 3
	]

	this.texCoord = [
		0, 0,
		1, 0,
		1, 1,
		0, 1
	]

	this.vBuffer = null;
	this.nBuffer = null;
	this.vPosition = null;
	this.vNormal = null;

	this.init = function () {

		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

		this.nBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.nBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

		this.iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

		this.tBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoord), gl.STATIC_DRAW);

		var image1 = new Image();
		image1.crossOrigin = "anonymous";
		image1.src = "./Images/floor.png";
		image1.onload = function () {
			var texture1 = gl.createTexture();
			gl.activeTexture(gl.TEXTURE1);
			gl.bindTexture(gl.TEXTURE_2D, texture1);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, image1);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
				gl.NEAREST_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		};

		var image3 = new Image();
		image3.crossOrigin = "anonymous";
		image3.src = "./Images/summersYouDied.png";
		image3.onload = function () {
			var texture3 = gl.createTexture();
			gl.activeTexture(gl.TEXTURE3);
			gl.bindTexture(gl.TEXTURE_2D, texture3);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
				gl.UNSIGNED_BYTE, image3);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
				gl.NEAREST_MIPMAP_LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		};

	};

	this.show = function () {

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

		gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
		this.vTexCoord = gl.getAttribLocation(program, "vTexCoord");
		if (this.vTexCoord < 0) {
			console.log('Failed to get the storage location of vTexCoord');
		}
		gl.vertexAttribPointer(this.vTexCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vTexCoord);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
			1);
		gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

		gl.uniform1i(gl.getUniformLocation(program, "texture"), alive ? 1 : 3);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

		gl.uniform1i(gl.getUniformLocation(program, "texture_flag"),
			0);
		// IMPORTANT: Disable current vertex attribute arrays so those in
		// a different object can be activated.  
		gl.disableVertexAttribArray(this.vPosition);
		gl.disableVertexAttribArray(this.vNormal);
		gl.disableVertexAttribArray(this.vTexCoord)
	};

};

//////////////////////////  End Arena object /////////////////////////////////
