var app = new Vue({
    el: '#app',
    data: {
        editModal: false,

        exportModal: false,
        importData: '',

        elements: [
            /*
            ...['bandcamp','delicious','facebook','ficly','flickr',
            'github','googleplus','instagram','kickstarter','lanyrd',
            'lastfm','linkedin','photodrop','pinterest','rdio',
            'soundcloud','twitter','vimeo','youtube'].map((color) => {
                return {
                    title: "Get Colors",
                    subtitle: "Target is Shoot",
                    centered: true,
                    color: color,
                    in: [
                        {
                            icon: "bullet",
                            text: "Target"
                        }
                    ],
                    out: [
                        {
                            icon: "bullet full",
                            text: "Target"
                        }
                    ]
                }
            })
            */
        ],
        colors: ['bandcamp','delicious','facebook','ficly','flickr',
        'github','googleplus','instagram','kickstarter','lanyrd',
        'lastfm','linkedin','photodrop','pinterest','rdio',
        'soundcloud','twitter','vimeo','youtube']
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
    app.elements = [
        {
            title: "Get Colors",
            subtitle: "Target is Shoot",
            centered: true,
            color: 'bandcamp',
            in: [
                {
                    icon: "bullet",
                    text: "Source"
                }
            ],
            out: [
                {
                    icon: "bullet",
                    text: "Target"
                }
            ],
            pos: {
                x: 50,
                y: 100
            },
            size: {
                w: 200,
                h: 100
            }
        }
    ]