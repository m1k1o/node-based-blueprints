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
        transform: 'translate3D('+pos.x+'px, '+pos.y+'px, 0)',
        width: size.w+'px',
        height: size.h+'px'
    }" ref="interactElement">
        <div class="node-header" v-if="el.title" v-bind:class="{'centered': typeof el.centered !== 'undefined' && el.centered}">
            <div class="node-title">
                {{ el.title }} <small v-if="el.subtitle">{{ el.subtitle }}</small>
            </div>
        </div>

        <ul class="node-interfaces node-input">
            <li v-for="int_in in el.in"><span v-if="int_in.icon" v-bind:class="int_in.icon"></span>{{ int_in.text }}</li>
        </ul>
        
        <ul class="node-interfaces node-output">
            <li v-for="out in el.out">{{ out.text }}<span v-if="out.icon" v-bind:class="out.icon"></span></li>
        </ul>
    </div>
    `,
    methods: {
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
        this.updateData();

        interact(this.$refs.interactElement).draggable({
            // enable inertial throwing
            //inertia: true,
            // keep the element within the area of it's parent
            //allowFrom: '.node-header',
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
            }
        })
        .resizable({
            // preserveAspectRatio: true,
            edges: { left: true, right: true, bottom: true, top: true },
            restrict: {
                // endOnly: true,
                // restriction: '.designScreenContainer',
                elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
            },
            onend: () => {
                this.$emit('update', { pos: this.pos, size: this.size })
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