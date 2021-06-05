import * as THREE from "three"
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

        for (let i = 0; i <= this.parameters.segments; i++) {
            const ret = [];

            for (let j = 0; j <= this.parameters.segments; j++) {
                ret.push(0);
            }

            this.lookup.push(ret);
        }

        this.init();
    }

    init() {
        const indices = [];

        const already_init = !!this.getAttribute("position");
        const vertices = already_init
            ? this.getAttribute("position").array
            : new THREE.Float32BufferAttribute(
                new Array(
                    this.parameters.segments * this.parameters.segments * 3
                ).fill(0)
            );




        // generate indices (data for element array buffer)

        const normals = [];
        const colors = [];

        const halfSize = this.parameters.size / 2;
        const segmentSize = this.parameters.size / this.parameters.segments;

        let index = 0;

        for (let i = 0; i <= this.parameters.segments; i++) {
            const y = i * segmentSize - halfSize;

            for (let j = 0; j <= this.parameters.segments; j++) {
                const x = j * segmentSize - halfSize;

                vertices[index++] = x;
                vertices[index++] = -y;
                vertices[index++] = 0;

                // if (x == 0 && y == 0) console.log(x, y, i, j)

                if (!already_init) {


                    normals.push(0, 0, 1);

                    const r = x / this.parameters.size + 0.5;
                    const g = y / this.parameters.size + 0.5;

                    if (i == 0) colors.push(r, g, 1); else colors.push(1, 0, 0)
                }
            }
        }

        if (!already_init) {
            let stuff = 0
            for (let i = 0; i < this.parameters.segments; i++) {
                for (let j = 0; j < this.parameters.segments; j++) {

                    // LOGIC FAILS HERE. REDO
                    const a = i * (this.parameters.segments + 1) + (j + 1);
                    const b = i * (this.parameters.segments + 1) + j;
                    const c = (i + 1) * (this.parameters.segments + 1) + j;
                    const d = (i + 1) * (this.parameters.segments + 1) + (j + 1);

                    // generate two faces (triangles) per iteration

                    // const t1 = [vertices[a], vertices[b], vertices[d]]
                    // const t2 = [vertices[b], vertices[c], vertices[d]]

                    // if (i > this.parameters.segments - 2) {
                    console.log("INDICES", ++stuff)
                    console.log(a, b, d)
                    console.log(b, c, d)
                    // }

                    indices.push(a, b, d); // face one
                    indices.push(b, c, d); // face two
                }
            }

            //

            this.setIndex(indices);
            this.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
            this.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
        }
        this.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(vertices, 3)
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