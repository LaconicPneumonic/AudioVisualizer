import * as THREE from "three"

// function getXYZ(vertices, index) {

//     return [vertices.getX(index), vertices.getY(index), vertices.getZ(index)]
// }
class GridGeometry extends THREE.BufferGeometry {
    constructor(size, segments, func = (x, y) => x * y) {
        super();
        this.type = "GridGeometry";

        this.parameters = {
            size: size,
            segments: segments,
            func: func,
        };

        // generate vertices, normals and color data for a simple grid geometry

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

    init() {
        const indices = [];

        const already_init = !!this.getAttribute("position");
        const vertices = already_init
            ? this.getAttribute("position")
            : new THREE.Float32BufferAttribute(
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
                // console.log(getXYZ(vertices, index))
                index++;

                if (!already_init) {


                    normals.push(0, 0, 1);

                    const r = x / this.parameters.size + 0.5;
                    const g = y / this.parameters.size + 0.5;

                    colors.push(r, g, 1);
                }
            }
        }

        if (!already_init) {
            // let stuff = 0
            for (let i = 0; i < this.parameters.segments - 1; i++) {
                for (let j = 0; j < this.parameters.segments - 1; j++) {

                    // Iterate through the first n-1 rows and columns i.e. (n)(n)

                    const first_index = i * (this.parameters.segments) + j;

                    const second_index = first_index + 1;

                    const third_index = first_index + this.parameters.segments;

                    const fourth_index = second_index + this.parameters.segments;

                    // console.log(first_index, second_index, third_index); // face one
                    // console.log(second_index, third_index, fourth_index); // face two

                    indices.push(first_index, second_index, third_index); // face one
                    indices.push(second_index, third_index, fourth_index); // face two
                }
            }

            //

            this.setIndex(indices);
            this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
            this.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        }
        this.setAttribute(
            "position",
            vertices
        );


        this.getAttribute("position").needsUpdate = true;
    }

    pushRow(arr) {
        if (arr.length != this.parameters.segments)
            throw Error(
                `Incorrect Array Length. Expected: ${this.parameters.segments}`
            );

        this.lookup.shift();
        this.lookup.push(arr);

        this.init();
    }
}

export { GridGeometry }