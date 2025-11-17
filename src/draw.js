class HexagonalLayoutManager extends HTMLElement {
    defaultGridOptions = {
        radius : 10,
        sides : 6,
        inset : 0,
        lineWidth : 1,
        fillStyle : '',
        strokeStyle : 'black',
        randomColors : null
    };

    _cells = [];

    _root = null;

    _opts = null;

    get cells() {
        return this._cells;
    };

    drawHQ(x, y, options = {}) {
        x *= 1;
        y *= 1;
        const coords = [
            [[0, -1]],
            [[-1, -1], [0, 0], [1, -1]],
            [[-1, 0], [1, 0]],
            [[0, 1]]
        ];

        const opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
        opts.fillStyle = this._generateColor(110);

        coords.forEach(row => {
            row.forEach(cord => {
                const cell = this._cells.find(c => {
                    return c.row === x + cord[0] && c.col === y + cord[1];
                });
                this._drawPoly(cell.polygon, null, opts);
            });
        });
    }

    drawGrid(cols, rows, options = {}) {
        const opts = {...this.defaultGridOptions, ...options};
        this._opts = JSON.parse(JSON.stringify(opts));
        this._cells = [];

        let x, y, row, col;
        for (col = 0; col < cols; col += 1) {
            for (row = 0; row < rows; row += 1) {
                const offset = (Math.sqrt(3) * opts.radius) / 2;
                x = opts.radius * 2 + offset * col * 2;
                y = opts.radius * 2 + offset * row * Math.sqrt(3);

                if (row % 2 !== 0) x += offset;

                const polygon = this._drawPoly(x, y, opts);

                this._cells.push({
                    x, y, row, col, polygon
                });
                this.ctx.appendChild(polygon);

                if ((col + row) % 7 === 0) {
                    const text = `${row}:${col}`;
                    const textOffset = [
                        0, -6, -6, -6, -7, -9, -9, -10, -10
                    ];
                    this._addLabelText(polygon, text, textOffset[text.length]);
                }
            }
        }

        const event = new CustomEvent("after-draw", {
            detail : {
                cells : this._cells
            }
        });
        this.dispatchEvent(event);
    }

    _drawPoly(x, y, opts) {
        let polygon;
        if (x instanceof SVGPolygonElement) {
            polygon = x;
            polygon.style.fill = opts.fillStyle ? opts.fillStyle : 'white';
        } else {
            polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.style.fill = opts.fillStyle ? opts.fillStyle : 'white';
            polygon.style.stroke = 'black';
            polygon.style.strokeWidth = '2px';
            polygon.setAttribute('points', this._hexPoints(x, y, opts.radius));
            polygon.addEventListener('click', function(event) {
                console.log(event.target);
            }, false);
        }

        return polygon;
    }

    _addLabelText(polygon, labelText) {
        let bbox = polygon.getBBox();
        let x = bbox.x + bbox.width / 2;
        let y = bbox.y + bbox.height / 2;

        // Create a <text> element
        let textElem = document.createElementNS(polygon.namespaceURI, "text");
        textElem.setAttribute("x", x);
        textElem.setAttribute("y", y);
        textElem.setAttribute("text-anchor", "middle");
        textElem.classList.add("label-text");
        textElem.textContent = labelText;
        // Add this text element directly after the label background path
        polygon.after(textElem);
    }

    _hexPoints(x, y, radius) {
        const points = [];
        for (let theta = 0; theta < Math.PI * 2; theta += Math.PI / 3) {
            let pointX, pointY;

            pointX = x + radius * Math.sin(theta);
            pointY = y + radius * Math.cos(theta);

            points.push(pointX + ',' + pointY);
        }

        return points.join(' ');
    }

    _generateColor(count, saturation = 1.0, lightness = 0.5, alpha = 1.0) {
        return `hsla(${[
            count,
            `${Math.floor(saturation * 100)}%`,
            `${Math.floor(lightness * 100)}%`,
            alpha
        ].join(', ')})`
    }

    draw() {
        // get config from attributes
        const width = (this.getAttribute('width')) ? this.getAttribute('width') * 1 : 500;
        const height = (!this.getAttribute('height') && width) ? width : this.getAttribute('height') * 1 || 500;

        this._root.innerHTML = `<svg id="drawing" version="1.1" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"></svg>`;

        const style = document.createElement('style');
        style.innerHTML = `.label-text {
            font-size: 8px;
            font-family: Verdana, Geneva, Tahoma, sans-serif;
        }`;
        this._root.appendChild(style);

        // count the cells fitting into it
        const radius = 15;
        const w = Math.floor(width / (radius * 2));
        const h = Math.floor(height / (radius * 2));

        this.ctx = this._root.querySelector('#drawing');
        this.drawGrid(w, h, {
            radius : radius
        });
    }

    constructor() {
        super();
        this._root = this.attachShadow({mode : 'open'});
        this.draw();
    }

    static get observedAttributes() {
        return ['width', 'height'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'height' || name === 'width') {
            this.draw();
        }
    }
}

window.customElements.define('hexagonal-layout-manager', HexagonalLayoutManager);