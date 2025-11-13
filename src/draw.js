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

    _root = null;

    TAU = 2 * Math.PI;

    pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    toPoint(x, y) {
        return ({x, y});
    };

    polyPath3(ctx, points = []) {
        const [{x : startX, y : startY}] = points;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        points.forEach(({x, y}) => {
            ctx.lineTo(x, y);
        });
        ctx.closePath();
    }

    drawGrid(ctx, x, y, w, h, options = {}) {
        const opts = {...this.defaultGridOptions, ...options};
        const points = this.createPoly(opts);
        opts.diameter = opts.radius * 2;
        for (let gy = y; gy < y + h; gy++) {
            for (let gx = x; gx < x + w; gx++) {
                ctx.fillStyle = opts.randomColors ? this.pickRandom(opts.randomColors) : opts.fillStyle;
                this.drawPoly(ctx, this.gridToPixel(gx, gy, opts), points, opts);
            }
        }
    }

    drawPoly(ctx, origin, points, opts) {
        ctx.strokeStyle = opts.strokeStyle;
        ctx.save();
        ctx.translate(origin.x, origin.y);
        this.polyPath3(ctx, points);
        ctx.restore();
        if (opts.lineWidth) ctx.lineWidth = opts.lineWidth;
        if (opts.fillStyle || opts.randomColors) ctx.fill();
        if (opts.strokeStyle) ctx.stroke();
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

    gridToPixel(gridX, gridY, opts) {
        const m = this.gridMeasurements(opts);
        return this.toPoint(
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

        const ctx = this._root.querySelector('#drawing').getContext('2d');
        this.drawGrid(ctx, 1, 1, w, h, {
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