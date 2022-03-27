import * as THREE from "three"

// function
class GridGeometry extends THREE.BufferGeometry {
    constructor(size, segments, func = (x, y) => x * y) {
        super();
        this.type = "GridGeometry";

        this.parameters = {
            size: size,
            segments: segments,
            func: func,
        };

        this.lookup = [];

        for (let i = 0; i < this.parameters.segments; i++) {
            const ret = [];

            for (let j = 0; j < this.parameters.segments; j++) {
                ret.push(0);
            }

            this.lookup.push(ret);
        }

        // console.log(this.lookup.length, this.lookup[0].length)

        this.init();
    }

    getXYZ(vertices, index) {

        return [vertices.getX(index), vertices.getY(index), vertices.getZ(index)]
    }



    init() {
        const indices = [];

        const vertices = new THREE.Float32BufferAttribute(
            (this.parameters.segments) * (this.parameters.segments) * 3, 3
        );

        // generate indices (data for element array buffer)

        const normals = [];
        const colors = [];

        const halfSize = this.parameters.size / 2;
        const segmentSize = this.parameters.size / this.parameters.segments;

        let index = 0;

        for (let i = 0; i < this.parameters.segments; i++) {
            const y = i * segmentSize - halfSize;

            for (let j = 0; j < this.parameters.segments; j++) {
                const x = j * segmentSize - halfSize;

                vertices.setXYZ(index, x, -y, this.lookup[i][j]);
                index++;

                normals.push(0, 0, 1);

                const color = new THREE.Color("#FF00FF")
                colors.push(color.r, color.g, color.b);


                const r = x / this.parameters.size + 0.5;
                const g = y / this.parameters.size + 0.5;

                colors.push(r, g, 1);
            }
        }

        // let stuff = 0
        for (let i = 0; i < this.parameters.segments - 1; i++) {
            for (let j = 0; j < this.parameters.segments - 1; j++) {

                const a = i + this.parameters.segments * j;
                const b = i + this.parameters.segments * (j + 1);
                const c = (i + 1) + this.parameters.segments * (j + 1);
                const d = (i + 1) + this.parameters.segments * j;

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }

        //

        this.setIndex(indices);
        this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
        this.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        this.setAttribute(
            "position",
            vertices
        );


        this.getAttribute("position").needsUpdate = true;
        this.getAttribute("color").needsUpdate = true;
    }

    update() {


        const vertices = this.getAttribute("position")
        const colors = this.getAttribute("color")


        let index = 0;

        for (let i = 0; i < this.parameters.segments; i++) {

            for (let j = 0; j < this.parameters.segments; j++) {

                vertices.setZ(index, Math.pow(1.1, (this.lookup[i][j] / 7)) - 1);
                const color = new THREE.Color("#FF00FF")
                colors.setXYZ(index, color.r, color.g, color.b)
                index++;


            }
        }

        this.getAttribute("position").needsUpdate = true;
        this.getAttribute("color").needsUpdate = true;
        this.computeVertexNormals();

    }

    pushRow(arr) {
        if (arr.length != this.parameters.segments)
            throw Error(
                `Incorrect Array Length. Expected: ${this.parameters.segments}. Got ${arr.length}`
            );

        this.lookup.shift();
        this.lookup.push(arr);

        this.update();
    }
}

export { GridGeometry }