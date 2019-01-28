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
        lines: []
    },
    methods: {
        saveElement(el = null, data = false) {
            if(data) {
                let { pos, size } = data;
                el.pos = { ...pos };
                el.size = { ...size };
            }

            localStorage.setItem('elements', JSON.stringify(this.elements))
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
        lineCreate(event) {
            let { x, y, el } = event;
            if(this.drawingLine) {
                let { x: x0, y: y0 } = this.drawingLine;
                let length = Math.sqrt(Math.pow(y - y0, 2) + Math.pow(x - x0, 2));
                let angle = Math.asin((y - y0) / length);
                
                if(y0 > y) {
                    x0 < x || (angle =  Math.acos((y - y0) / length) + Math.PI/2);
                } else {
                    x0 < x || (angle = Math.acos((y - y0) / length) + Math.PI/2);
                }

                this.lines.push({ x: x0, y: y0, length, angle });
                this.drawingLine = null;
                console.log("Line End");
            } else {
                this.drawingLine = { x, y };
                console.log("Line Start");
            }
            
            console.log(event);
        },
        dataImport(val = null) {
            this.elements = !val ? [] : JSON.parse(val);
            this.saveElement();
            location.href = location.href;
        }
    }
});

if(localStorage.getItem('elements'))
    app.elements = JSON.parse(localStorage.getItem('elements'));
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