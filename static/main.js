var app = new Vue({
    el: '#app',
    data: {
        editModal: false,

        exportModal: false,
        importData: '',

        elements: [],
        colors: ['bandcamp','delicious','facebook','ficly','flickr',
        'github','googleplus','instagram','kickstarter','lanyrd',
        'lastfm','linkedin','photodrop','pinterest','rdio',
        'soundcloud','twitter','vimeo','youtube'],

        drawingLine: false,
        lines: {}
    },
    computed: {
        directionalLines() {
            return Object.keys(this.lines).map(key => {
                let line = this.lines[key];
                let { angle, length } = this.getAngleLength(line);
                
                return {
                    x: line.x0,
                    y: line.y0,
                    angle,
                    length,
                    key
                }
            })
        }
    },
    methods: {
        saveElement(el = null, data = false) {
            if(data) {
                let { pos, size } = data;
                el.pos = { ...pos };
                el.size = { ...size };
            }

            localStorage.setItem('elements', this.dataExport())
        },
        newElement() {
            this.elements.push({
                title: 'New Node',
                subtitle: '',
                centered: true,
                color: '',
                in: [],
                out: [],
                pos: {
                    x: 50,
                    y: 50
                },
                size: {
                    w: 200,
                    h: 100
                }
            })
        },
        getAngleLength({x0, y0, x, y}) {
            let length = Math.sqrt(Math.pow(y - y0, 2) + Math.pow(x - x0, 2));
            let angle = Math.asin((y - y0) / length);
            
            if(y0 > y) {
                x0 < x || (angle =  Math.acos((y - y0) / length) + Math.PI/2);
            } else {
                x0 < x || (angle = Math.acos((y - y0) / length) + Math.PI/2);
            }

            return { length, angle };
        },
        selectLine(key) {
            this.elements.forEach(node => {
                for(let x of ["in", "out"]) {
                    node[x].forEach(el => {
                        if(typeof el.lines !== 'undefined' && key in el.lines) {
                            this.$delete(el.lines, key);
                        }
                    });
                }
            });

            this.$delete(this.lines, key);
            this.saveElement();
        },

        // Draw new line
        linesCreate(event) {
            let { x, y, el } = event;

            if(this.drawingLine) {
                let { x: x0, y: y0, el: el0 } = this.drawingLine;
                
                // Create unique name
                let name =  Math.random().toString(36).substring(2, 15);
                
                // Set to global lines
                let line = { x0, y0, x, y };
                this.$set(this.lines, name, line);
                
                // Set to el_0 lines
                typeof el0.lines !== 'undefined' || (el0.lines = {});
                el0.lines[name] = { from: true, line };

                // Set to el_1 lines
                typeof el.lines !== 'undefined' || (el.lines = {});
                el.lines[name] = { from: false, line};

                console.log("Line End");
                this.saveElement();
                this.drawingLine = null;
            } else {
                this.drawingLine = { ...event };
                console.log("Line Start");
            }
        },
        dataImport(val = null) {
            let obj = !val ? [] : JSON.parse(val);
            
            let l = (val) => {
                let from = false;

                // Refference in lines
                if(!(val in this.lines)) {
                    this.$set(this.lines, val, {});
                    from = true;
                }
                
                return { from, line: this.lines[val]};
            };

            this.elements = obj.map(node => {
                for(let x of ["in", "out"]) {
                    node[x] = node[x].map(o => {
                        let lines = {};
                        typeof o.lines !== 'object' || o.lines.map(val => {lines[val] = l(val);});

                        o.lines = lines;
                        return o;
                    });
                }

                return node;
            })
            
            this.saveElement();
        },
        dataExport() {
            // Clone object
            obj = [ ...this.elements ].map(({ ...node }) => {
                for(let x of ["in", "out"]) {
                    node[x] = node[x].map(({ lines, ...allowed }) => {
                        let keys = Object.keys(lines || {});

                        if(keys.length) {
                            return { lines: keys, ...allowed };
                        } else {
                            return { ...allowed };
                        }
                    });
                }

                return node;
            })
            
            return JSON.stringify(obj);
        }
    }
});

if(localStorage.getItem('elements'))
    app.dataImport(localStorage.getItem('elements'));
else
    app.elements = [{"title":"Init","subtitle":"","centered":true,"color":"pinterest","in":[],"out":[{"text":"","icon":"arrow"},{"text":"Output","icon":"bullet"}],"pos":{"x":93,"y":128},"size":{"w":250,"h":185}},{"title":"Send","subtitle":"","centered":true,"color":"kickstarter","in":[{"icon":"arrow"},{"icon":"bullet","text":"Data"}],"out":[],"pos":{"x":570,"y":130},"size":{"w":200,"h":100}}];

    /*
function init() {
    canvas.width = document.body.clientWidth; //document.width is obsolete
    canvas.height = document.body.clientHeight; //document.height is obsolete
}
init();

var c = document.getElementById('canvas');
var ctx = c.getContext('2d');
ctx.beginPath();
ctx.moveTo(20,20);
ctx.bezierCurveTo(20,100,50,100,200,200);
ctx.strokeStyle = "#ffffff";
ctx.stroke();
*/