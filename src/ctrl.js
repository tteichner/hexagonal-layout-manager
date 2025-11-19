class HexagonalLayoutManagerCtrl extends HTMLElement {
    defaultGridOptions = {

    };

    draw() {
        const that = this;

        this._root.innerHTML = `<div id="control"><h4>Elemente</h4><ul>
    <li><span class="button" id="select-hq">+HQ</span></li>
    <li><span class="button" id="select-tile">+Tile</span></li>
</ul></div>`;

        const style = document.createElement('style');
        style.innerHTML = `
        * {
            box-sizing: content-box;
            padding: 0;
        }
        
        #control {
            position: fixed;
            top: 0;
            right: 0;
            height: 150px;
            width: 100px;
            border-left: 1px solid #ccc;
            border-botton: 1px solid #ccc;
            padding: 0px;
            background: #fff;
        }
        
        ul {
            list-style-type: none;
            padding-inline-start: 0;
        }
        
        li {
            list-style: none;
        }
        
        .button.selected {
            color: #000;
            font-weight: bold;
        }
        
        .button {
            font: bold 13px Arial;
            text-decoration: none;
            background-color: #EEEEEE;
            color: #333333;
            padding: 6px;
            border-top: 1px solid #CCCCCC;
            border-right: 1px solid #333333;
            border-bottom: 1px solid #333333;
            border-left: 1px solid #CCCCCC;
            width: 100%;
            display: inline-block;
            cursor: pointer
        }`;
        this._root.appendChild(style);

        this.grid = document.getElementById(this.getAttribute("grid"));

        this._root.getElementById('select-hq').addEventListener('click', function() {
            for (let i=0; i<this.parentNode.parentNode.children.length; i++) {
                this.parentNode.parentNode.children[i].firstChild.classList.remove("selected");
            }

            if (that.selectedType === 'hq') {
                that.selectedType = null;
                return;
            }
            that.selectedType = 'hq';
            this.classList.add("selected");
        });
        this._root.getElementById('select-tile').addEventListener('click', function() {
            for (let i=0; i<this.parentNode.parentNode.children.length; i++) {
                this.parentNode.parentNode.children[i].firstChild.classList.remove("selected");
            }

            if (that.selectedType === 'tile') {
                that.selectedType = null;
                return;
            }
            that.selectedType = 'tile';
            this.classList.add("selected");
        });

        this.grid.addEventListener("tile-click", (evt) => {
            const cell = evt.detail.cell;

            if (that.selectedType === 'hq') {
                this.grid.drawHQ(cell.row, cell.col);
            }
        });
    }

    constructor() {
        super();
        this._root = this.attachShadow({mode : 'open'});
    }

    static get observedAttributes() {
        return ['id', 'grid'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'grid' && newValue) {
            this.draw();
        }
    }
}

window.customElements.define('hexagonal-layout-manager-ctrl', HexagonalLayoutManagerCtrl);