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
        removeElement(index) {
            // Remove lines
            for(let x of ["in", "out"]) {
                this.elements[index][x].forEach(el => {
                    // Loop through lines
                    if(typeof el.lines !== 'undefined') {
                        for(let key in el.lines) {
                            console.log("remove", key)
                            this.deleteLine(key);
                        }
                    }
                });
            }

            this.$delete(this.elements, index);
            this.saveElement();
        },
        saveElement(el = null, data = false) {
            if(data) {
                let { pos, size } = data;
                el.pos = { ...pos };
                el.size = { ...size };
            }

            localStorage.setItem('elements', this.dataExport());
            this.linesUpdate();
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
        deleteLine(key) {
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
                let name = Math.random().toString(36).substring(2, 15);
                
                // Set to global lines
                let line = { x0, y0, x, y };
                this.$set(this.lines, name, line);
                
                // Set to el_0 lines
                typeof el0.lines !== 'undefined' || (el0.lines = {});
                this.$set(el0.lines, name, { from: true, line });

                // Set to el_1 lines
                typeof el.lines !== 'undefined' || (el.lines = {});
                this.$set(el.lines, name, { from: false, line});

                console.log("Line End");
                this.saveElement();
                this.drawingLine = null;
            } else {
                this.drawingLine = { ...event };
                console.log("Line Start");
            }
        },
        linesUpdate() {
            canvas_paths = {};
            let canvas = document.getElementById('canvas');
            canvas.width = document.body.clientWidth;
            canvas.height = document.body.clientHeight;
        
            let ctx = canvas.getContext("2d");
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 4;
            ctx.fillStyle = "#009900";
            
            ctx.shadowColor = "#000000";
            ctx.shadowOffsetX = 1; 
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 4;

            for(let key in this.lines) {
                let { x0, y0, x, y } = this.lines[key];
                
                let path = new Path2D();
                path.moveTo(x0, y0);
                path.bezierCurveTo(x0 + (x - x0) / 2, y0, x0 + (x - x0) / 2, y, x, y);

                ctx.stroke(path);
                canvas_paths[key] = path;
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

var canvas_paths = {};
var canvas = document.getElementById('canvas');
let ctx = canvas.getContext("2d");
canvas.addEventListener('click', (event) => {
    var x = event.pageX;
    var y = event.pageY;

    for(let key in canvas_paths) {
        if(ctx.isPointInStroke(canvas_paths[key], x, y)) {
            app.deleteLine(key);
        }
    }
 });