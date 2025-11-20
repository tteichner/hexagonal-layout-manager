class HexagonalLayoutManager extends HTMLElement {
    defaultGridOptions = {
        radius : 10,
        sides : 6,
        inset : 0,
        lineWidth : 1,
        fillStyle : '',
        strokeStyle : 'black',
        indexes : false
    };

    _history = [];

    _shapes = [];

    _cells = [];

    _root = null;

    _opts = null;

    _bound = false;

    get cells() {
        return this._cells;
    };

    get shapes() {
        return this._shapes;
    };

    storage = {
        add : function(key, val) {
            let values = window.localStorage.getItem(`HexGrid:${key}`);
            if (values) {
                values = JSON.parse(values);
            } else {
                values = [];
            }
            values.push(val);
            window.localStorage.setItem(`HexGrid:${key}`, JSON.stringify(val));
        },

        set : function(key, val) {
            window.localStorage.setItem(`HexGrid:${key}`, JSON.stringify(val));
        },

        get : function(key) {
            const val = window.localStorage.getItem(`HexGrid:${key}`);
            if (val) {
                return JSON.parse(val);
            }
        }
    }

    drawMud(x, y, options = {}) {
        const coords = [
            [0,36],[-1,36],[-1,37],[-2,37],[-2,38],[-3,38],[-3,39],[-4,39],[-4,40],[-5,40],[-5,41],[-6,41],[-6,42],[-7,42],[-7,43],[-8,43],[-8,44],[-9,44],[-9,45],[-10,45],[-10,46],[-11,46],[-11,47],[-12,47],[-12,48],[-13,48],[-13,49],[-14,49],[-14,50],[-15,50],[-15,51],[-16,51],[-16,52],[-17,52],[-17,53],[-18,53],[-18,54],[-18,53],[-17,53],[-17,52],[-16,52],[-16,51],[-15,51],[-15,50],[-14,50],[-14,49],[-13,49],[-13,48],[-12,48],[-12,47],[-11,47],[-11,46],[-10,46],[-10,45],[-9,45],[-9,44],[-8,44],[-8,43],[-7,43],[-7,42],[-6,42],[-6,41],[-5,41],[-5,40],[-4,40],[-4,39],[-3,39],[-3,38],[-2,38],[-2,37],[-1,37],[-1,36],[0,36]
        ];

        const opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
        opts.fillStyle = this._generateColor(40);
        this._drawShape(x, y, coords, opts);
    }

    drawInnerMud(x, y, options = {}) {
        let opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
        opts.fillStyle = this._generateColor(20);
        opts.collide = true;

        let coords = [
            [0,18],[-1,18],[-1,19],[-2,19],[-2,20],[-3,20],[-3,21],[-4,21],[-4,22],[-5,22],[-5,23],[-6,23],[-6,24],[-7,24],[-7,25],[-8,25],[-8,26],[-9,26],[-9,27],[-9,26],[-8,26],[-8,25],[-7,25],[-7,24],[-6,24],[-6,23],[-5,23],[-5,22],[-4,22],[-4,21],[-3,21],[-3,20],[-2,20],[-2,19],[-1,19],[-1,18],[0,18]
        ];
        this._drawShape(x, y, coords, opts);

        coords = [
            [0,4],[-1,4],[-1,5],[-2,5],[-2,6],[-2,5],[-1,5],[-1,4],[0,4]
        ];

        opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
        opts.fillStyle = this._generateColor(20);
        this._drawShape(x - 3, y - 1, coords, opts);
        this._drawShape(x + 13, y + 24, coords, opts);
        this._drawShape(x + 31, y - 1, coords, opts);

        coords = [
            [0,2],[-1,2],[-1,3],[-1,2],[0,2]
        ];
        opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
        opts.fillStyle = this._generateColor(200, 0.2, 0.8);

        this._drawShape(x-1, y, coords, opts);
        this._drawShape(x + 15, y + 25, coords, opts);
        this._drawShape(x + 33, y, coords, opts);
    }

    drawTile(x, y, options = {}) {
        const coords = [
            [[0, 0]]
        ];

        if (this._shapeCollide(x, y, coords)) {
            alert('collision');
        } else {
            const opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
            opts.fillStyle = this._generateColor(200);
            opts.collide = true;
            this._drawShape(x, y, coords, opts);
        }
    }

    drawHQ(x, y, options = {}) {
        const coords = (x % 2 !== 0) ? [
            [[0, -1], [-1, 0], [-1, 1]],
            [[0, 0]],
            [[0, 1], [1, 1], [1, 0]]
        ] : [
            [[0, -1]],
            [[-1, -1], [0, 0], [1, -1]],
            [[-1, 0], [1, 0]],
            [[0, 1]]
        ];

        if (this._shapeCollide(x, y, coords)) {
            alert('collision');
        } else {
            const opts = {...JSON.parse(JSON.stringify(this._opts)), ...options};
            opts.fillStyle = this._generateColor(110);
            opts.collide = true;

            this._drawShape(x, y, coords, opts);
        }
    }

    _shapeCollide(x, y, coords) {
        let yes = false;
        coords.forEach((row, idx) => {
            row.forEach(cord => {
                const cell = this._cells.find(c => {
                    return c.row === x + cord[0] && c.col === y + cord[1];
                });
                if (cell?.polygon.collide) {
                    yes = true;
                }
            });
        });
        return yes;
    }

    _drawShape(x, y, coords, opts) {
        x *= 1;
        y *= 1;
        const isOdd = x % 2 !== 0;
        const history = [];

        coords.forEach((row, idx) => {
            if (row.length === 2 && typeof row[0] === 'number') {
                let start = row[0];
                const end = row[1];
                row = [];
                while (start <= end) {
                    if (isOdd && idx % 2 === 0) {
                        row.push([idx, start - 1]);
                    } else {
                        row.push([idx, start]);
                    }
                    start++;
                }
            }

            row.forEach(cord => {
                const cell = this._cells.find(c => {
                    return c.row === x + cord[0] && c.col === y + cord[1];
                });
                const orig = {
                    bgColor: cell.polygon.style.fill,
                    polygon: cell.polygon
                };
                this._drawPoly(cell.polygon, null, opts);

                if (opts.indexes) {
                    const title = `${cell.row}:${cell.col}`;
                    orig.label = this._addLabelText(cell.polygon, title);
                }
                history.push(orig);
            });
        });
        this._history.push(history);
        this._shapes.push({
            x, y, coords, opts
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

                const title = `${row}:${col}`;
                polygon.setAttribute('title', title);

                this._cells.push({
                    x, y, row, col, polygon, title
                });
                this.ctx.appendChild(polygon);

                if (opts.indexes) {
                    this._addLabelText(polygon, title);
                }
            }
        }

        const event = new CustomEvent("after-draw", {
            detail : {
                cells : this._cells
            }
        });
        this.dispatchEvent(event);

        const that = this;
        if (!this._bound) {
            this._bound = true;
            window.addEventListener('keyup', (e) => {
                const evt = window.event ? window.event : e;
                if (evt.ctrlKey && evt.key === 'z') {
                   that._shapes.pop();
                    const operation = that._history.pop();

                    operation.forEach((cell, i) => {
                        cell.polygon.style.fill = cell.bgColor;
                        cell.polygon.collide = false;
                        if (cell.label) {
                            cell.label.remove();
                        }
                    });
                }
            });
        }
    }

    _drawPoly(x, y, opts) {
        let polygon, that = this;
        if (x instanceof SVGPolygonElement) {
            polygon = x;
            polygon.style.fill = opts.fillStyle ? opts.fillStyle : 'white';
            polygon.collide = !!opts.collide;
        } else {
            polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            polygon.style.fill = opts.fillStyle ? opts.fillStyle : 'white';
            polygon.style.stroke = 'black';
            polygon.style.strokeWidth = '2px';
            polygon.setAttribute('points', this._hexPoints(x, y, opts.radius));
            polygon.addEventListener('click', function(event) {
                const title = this.getAttribute('title');
                const cell = that.cells.find(c => {
                    return c.title === title;
                });
                const evt = new CustomEvent("tile-click", {
                    detail : {
                        event, cell
                    }
                });
                that.dispatchEvent(evt);
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
        polygon.after(textElem);
        return textElem;
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

    draw(shapes = []) {
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

        if (shapes?.length) {
            shapes.forEach(shape => {
                this._drawShape(shape.x, shape.y, shape.coords, shape.opts);
            });
        }
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