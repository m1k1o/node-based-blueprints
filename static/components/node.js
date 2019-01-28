Vue.component('icon', {
    props: ['el'],
    data() {
        return {};
    },
    template: `<span class="icon" v-bind:class="el.icon" @click="clicked($event);"></span>`,
    methods: {
        getPos() {
            let el = this.$el;
            
            let rect = el.getBoundingClientRect();
            let x = rect.left + window.scrollX + (el.offsetWidth/2);
            let y = rect.top + window.scrollY + (el.offsetHeight/2);

            return { x, y };
        },
        clicked() {
            let { x, y } = this.getPos();
            this.$emit('click', { x, y })
        }
    }
});

Vue.component('node', {
    props: ['el'],
    data() {
        return {
            pos: {
                x: 0,
                y: 0,
            },
            size: {
                w: 200,
                h: 150
            }
        };
    },
    template: `
    <div class="node" v-bind:class="el.color" :style="{
        top: pos.y+'px',
        left: pos.x+'px',
        width: size.w+'px',
        height: size.h+'px'
    }" ref="interactElement">
        <div class="node-header" v-if="el.title" v-bind:class="{'centered': typeof el.centered !== 'undefined' && el.centered}">
            <div class="node-title">
                {{ el.title }} <small v-if="el.subtitle">{{ el.subtitle }}</small>
            </div>
        </div>

        <ul class="node-interfaces node-input">
            <li v-for="int_in in el.in">
                <span class="no-handler">
                    <icon v-if="int_in.icon" v-bind:el="int_in" ref="handlers" @click="lines_create($event, int_in);"></icon>{{ int_in.text }}
                </span>
            </li>
        </ul>
        
        <ul class="node-interfaces node-output">
            <li v-for="out in el.out">
                <span class="no-handler">
                    {{ out.text }}<icon v-if="out.icon" v-bind:el="out" ref="handlers" @click="lines_create($event, out);"></icon>
                </span>
            </li>
        </ul>
    </div>
    `,
    methods: {
        // Pass event to parent with element
        lines_create(event, el) {
            this.$emit('lines:create', { ...event, el });
        },
        // Update all lines (on move, on resize)
        lines_update() {
            for (var ref in this.$refs.handlers) {
                let pos = this.$refs.handlers[ref].getPos();
                let el = this.$refs.handlers[ref].el;

                for (var key in el.lines) {
                    var obj = el.lines[key];
                    console.log(obj, pos);

                    if(!obj.from) {
                        this.$set(obj.line, 'x', pos.x);
                        this.$set(obj.line, 'y', pos.y);
                    } else {
                        this.$set(obj.line, 'x0', pos.x);
                        this.$set(obj.line, 'y0', pos.y);
                    }
                }
            }
        },
        interactSetPosition(dx, dy) { 
            this.pos.x += dx;
            this.pos.y += dy;
        },
        interactSetSize(w, h) { 
            this.size = { w, h };
        },
        updateData() {
            if(this.el.pos){
                this.pos = { ...this.el.pos };
            }

            if(this.el.size){
                this.size = { ...this.el.size };
            }
        }
    },
    watch: { 
        el: function() {
            this.updateData();
        }
    },
    mounted() {
        setTimeout(() => this.lines_update(), 0);
        this.updateData();

        interact(this.$refs.interactElement).draggable({
            // enable inertial throwing
            //inertia: true,
            // keep the element within the area of it's parent
            //allowFrom: '.node-header',
            ignoreFrom: '.no-handler',
            restrict: {
                restriction: "parent",
                //endOnly: true,
                //elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            onmove: event => {
                this.interactSetPosition(event.dx, event.dy);
            },
            onend: () => {
                this.$emit('update', { pos: this.pos, size: this.size })
                this.lines_update();
            }
        })
        .resizable({
            // preserveAspectRatio: true,
            ignoreFrom: '.no-handler',
            edges: { left: true, right: true, bottom: true, top: true },
            restrict: {
                endOnly: true,
                // restriction: '.designScreenContainer',
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            onend: () => {
                this.$emit('update', { pos: this.pos, size: this.size })
                this.lines_update();
            }
        })
        .on('resizemove', (event) => {
            this.interactSetSize(event.rect.width, event.rect.height)
            this.interactSetPosition(event.deltaRect.left, event.deltaRect.top);
        });
    },
    beforeDestroy() {
        interact(this.$refs.interactElement).unset();
    }
});