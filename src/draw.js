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

    TAU = 2 * Math.PI;

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    get cells() {
        return this._cells;
    };

    _toPoint(x, y) {
        return ({x, y});
    };

    _polyPath3(points = []) {
        const [{x : startX, y : startY}] = points;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        points.forEach(({x, y}) => {
            this.ctx.lineTo(x, y);
        });
        this.ctx.closePath();
    }

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
        this.ctx.fillStyle = opts.fillStyle;

        coords.forEach(row => {
            row.forEach(cord => {
                const cell = this._cells.find(c => {
                    return c.x === x + cord[0] && c.y === y + cord[1];
                });
                this.drawPoly(cell.origin, this.points, opts, cell.x, cell.y);
            });
        });
    }

    drawGrid(x, y, w, h, options = {}) {
        const opts = {...this.defaultGridOptions, ...options};
        this._opts = JSON.parse(JSON.stringify(opts));

        this.points = this.createPoly(opts);
        opts.diameter = opts.radius * 2;

        this._cells = [];

        for (let gy = y; gy < y + h; gy++) {
            for (let gx = x; gx < x + w; gx++) {
                this.ctx.fillStyle = opts.randomColors ? this.pickRandom(opts.randomColors) : opts.fillStyle;
                const origin = this._gridToPixel(gx, gy, opts);
                this.drawPoly(origin, this.points, opts, gx, gy);
                this._cells.push({
                    x : gx,
                    y : gy,
                    origin
                });
            }
        }

        const event = new CustomEvent("after-draw", {
            detail: {
                cells : this._cells
            }
        });
        this.dispatchEvent(event);
    }

    drawPoly(origin, points, opts, gx = 0, gy = 0) {
        this.ctx.strokeStyle = opts.strokeStyle;
        this.ctx.save();
        this.ctx.translate(origin.x, origin.y);
        this._polyPath3(points);

        this.ctx.font = "9px serif";
        const text = `${gx}:${gy}`;
        const offset = [
            0, -6, -6, -6, -7, -9, -9, -10, -10
        ];
        this.ctx.fillText(text, offset[text.length], 3);

        this.ctx.restore();
        if (opts.lineWidth) this.ctx.lineWidth = opts.lineWidth;
        if (opts.fillStyle || opts.randomColors) this.ctx.fill();
        if (opts.strokeStyle) this.ctx.stroke();
    }

    toPolarCoordinate(centerX, centerY, radius, angle) {
        return ({
            x : centerX + radius * Math.cos(angle),
            y : centerY + radius * Math.sin(angle)
        });
    }

    createPoly(opts, points = []) {
        const
            {inset, radius, sides} = opts,
            size = radius - inset,
            step = this.TAU / sides;
        for (let i = 0; i < sides; i++) {
            points.push(this.toPolarCoordinate(0, 0, size, step * i));
        }
        return points;
    }

    _generateColor(count, saturation = 1.0, lightness = 0.5, alpha = 1.0) {
        return `hsla(${[
            count,
            `${Math.floor(saturation * 100)}%`,
            `${Math.floor(lightness * 100)}%`,
            alpha
        ].join(', ')})`
    }

    generateColors(count, saturation = 1.0, lightness = 0.5, alpha = 1.0) {
        return Array.from({length : count}, (_, i) =>
            `hsla(${[
                Math.floor(i / count * 360),
                `${Math.floor(saturation * 100)}%`,
                `${Math.floor(lightness * 100)}%`,
                alpha
            ].join(', ')})`)
    }

    gridMeasurements(opts) {
        const
            {diameter, inset, radius, sides} = opts,
            edgeLength = Math.sin(Math.PI / sides) * diameter,
            gridSpaceX = diameter - edgeLength / 2,
            gridSpaceY = Math.cos(Math.PI / sides) * diameter,
            gridOffsetY = gridSpaceY / 2;
        return {
            diameter,
            edgeLength,
            gridSpaceX,
            gridSpaceY,
            gridOffsetY
        };
    }

    _gridToPixel(gridX, gridY, opts) {
        const m = this.gridMeasurements(opts);
        return this._toPoint(
            Math.floor(gridX * m.gridSpaceX),
            Math.floor(gridY * m.gridSpaceY + (gridX % 2 ? m.gridOffsetY : 0))
        );
    }

    draw() {
        // get config from attributes
        const width = (this.getAttribute('width')) ? this.getAttribute('width') * 1 : 500;
        const height = (!this.getAttribute('height') && width) ? width : this.getAttribute('height') * 1 || 500;
        const random = this.getAttribute('random') || false;
        const fillStyle = this.getAttribute('fillStyle') || '';

        this._root.innerHTML = `<canvas id="drawing" width="${width}" height="${height}" class="canvas"></canvas>`;

        // count the cells fitting into it
        const radius = 20;
        const inset = 2;
        const w = Math.floor(width / (radius * 2 + inset));
        const h = Math.floor(height / (radius * 2 + inset));

        this.ctx = this._root.querySelector('#drawing').getContext('2d');
        this.drawGrid(1, 1, w, h, {
            radius : radius,
            inset : inset,
            randomColors : (random) ? this.generateColors(random) : null,
            fillStyle : fillStyle
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