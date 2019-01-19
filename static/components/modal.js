// register modal component
Vue.component('modal', {
    props: ['el'],
    template: `
        <transition name="modal" @keydown.esc="$emit('close')">
            <div class="modal-mask">
                <div class="modal-wrapper" v-on:click.self="$emit('close')">
                    <div class="modal-container">

                        <div class="modal-header">
                            <slot name="header">
                                default header
                            </slot>
                        </div>

                        <div class="modal-body">
                            <slot name="body">
                            default body
                            </slot>
                        </div>

                        <div class="modal-footer">
                            <slot name="footer">
                                <button @click="$emit('close')">Done</button>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    `,
    mounted() {
        window.addEventListener('keydown', (event) => {
            // If  ESC key was pressed...
            if (event.keyCode === 27) {
                // try close your dialog
                this.$emit('close');
            }
        });
    },

})