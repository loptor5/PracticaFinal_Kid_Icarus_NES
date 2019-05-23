function loadEnemies(Q) {
    
    // MASCARAS DE COLISION

    var SPRITE_PLAYER = 1; 
    var SPRITE_BULLET = 2; 
    var SPRITE_ENEMY_K = 3; 
    var SPRITE_OBJECT = 4; 
    var SPRITE_BULLET_ENEMY = 8;  
    var SPRITE_DOOR = 16;
    var SPRITE_FLY = 32; 

    Q.SPRITE_NONE = 0;
    Q.SPRITE_DEFAULT = 1;
    Q.SPRITE_PARTICLE = 2;
    Q.SPRITE_ACTIVE = 4;
    Q.SPRITE_FRIENDLY = 8;
    Q.SPRITE_ENEMY = 16;
    Q.SPRITE_UI = 32;
    Q.SPRITE_ALL = 0xFFFF;

    //------------------------------------------------------------------------//

    // VIPERIX

    Q.Sprite.extend("Viperix",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "viperix_anim",
                        sheet: "viperix1",
                        type: SPRITE_ENEMY_K,
                        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
                        gravity: 0.65,
                        frame: 1,
                        live: 1,
                        exp: 100,
                        heart: 1,
                        vx: 10,
                        damage: 1
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        Q.audio.play("Muerte_Serpiente.mp3", { loop: false }); // Musica muerte de viperix
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "miniCorazon", heart: 1 }));
                        this.destroy();
                    }
                }
            },

            hit: function (collision) { },

            step: function (dt) {
                if (this.p.live > 0) {
                    if (this.p.x > 257) this.p.x = 1;
                    if (this.p.x < 0) this.p.x = 256;
                    if (this.p.vx > 0) this.play("viperR");
                    if (this.p.vx < 0) this.play("viperL");
                }
            }

        });

    //------------------------------------------------------------------------//

    Q.animations("viperix_anim",
        {
            viperR: { frames: [0, 1], flip: false, loop: true, rate: 1 / 5 },
            viperL: { frames: [0, 1], flip: "x", loop: true, rate: 1 / 5 },
            viperStop: { frames: [0], flip: false, loop: false, rate: 1 / 5 }
        });

    //----------------------------------------------------------------------//

    // MONOCULUS

    Q.Sprite.extend("Monoculus",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "monoculus_anim",
                        sheet: "monoculus",
                        type: SPRITE_FLY,
                        collisionMask: SPRITE_BULLET,
                        gravity: 0,
                        frame: 1,
                        live: 1,
                        exp: 300,
                        heart: 5,
                        vx: 30,
                        vy: 10,
                        z: 32,
                        damage: 1,
                        sensor: false
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        //Q.audio.play(".mp3", { loop: false }); // Musica muerte de monoculus 
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "medioCorazon", heart: 5 }));
                        this.destroy();
                    }
                }

            },

            hit: function (collision) { },

            step: function (dt) {
                if (this.p.live > 0) {
                    this.p.time += 0.01;
                    var centroX = 256 / 2;
                    var centroY = (this.p.yIni + this.p.yFin) / 2;
                    var t = this.p.time;
                    scale = 120;
                    this.p.x = centroX + scale * Math.cos(t);
                    this.p.y = centroY + scale * Math.sin(2 * t) / 2;
                    if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY)) {
                        this.play("monoculusR");
                    }
                    else {
                        this.play("monoculusL");
                    }
                }
            }
        });

    //------------------------------------------------------------------------//

    Q.animations("monoculus_anim",
        {
            monoculusR: { frames: [0], flip: false, loop: true, rate: 1 / 10 },
            monoculusL: { frames: [1], flip: false, loop: true, rate: 1 / 10 },
            monoculusStop: { frames: [0], flip: false, loop: false, rate: 1 / 5 }
        });

    //------------------------------------------------------------------------//

    // FUNESTO

    Q.Sprite.extend("Funesto",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "funesto_anim",
                        sheet: "funesto",
                        type: SPRITE_ENEMY_K,
                        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
                        gravity: 0.65,
                        frame: 1,
                        live: 10,
                        exp: 500,
                        heart: 10,
                        damage: 2,
                        vx: 10,
                        running: false
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            hit: function (collision) { },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        //Q.audio.play(".mp3", { loop: false }); // Musica muerte de funesto 
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
                        this.destroy();
                    }
                }
            },

            step: function (dt) {
                if (this.p.live > 0) {
                    var pit = Q("Pit");
                    if (pit.items[0]) {
                        pit = pit.items[0];

                        if (Math.abs(pit.p.y - this.p.y) <= 8) // y esta dentro de su rango de x
                        {
                            if (pit.p.x - this.p.x > 0) this.p.vx = 60;

                            if (pit.p.x - this.p.x < 0) this.p.vx = -60;

                            if (this.p.vx > 0 && !this.p.running) {
                                Q.audio.play("Grito_Funesto.mp3", { loop: false }); // grito de funesto 
                                this.play("funestoRunR");
                                this.p.running = true;
                            }
                            if (this.p.vx < 0 && !this.p.running) {
                                Q.audio.play("Grito_Funesto.mp3", { loop: false }); // grito de funesto 
                                this.play("funestoRunL");
                                this.p.running = true;
                            }
                        }
                        else {
                            if (this.p.running) this.p.vx = this.p.vx / 6;

                            if (this.p.vx > 0) this.play("funestoR");

                            if (this.p.vx < 0) this.play("funestoL");

                            this.p.running = false;
                        }
                    }

                    if (this.p.xIni > this.p.x) {
                        this.p.vx = 10;
                    }
                    else if (this.p.xFin < this.p.x) {
                        this.p.vx = -10;
                    }
                }
            }
        });

    //------------------------------------------------------------------------//

    Q.animations("funesto_anim",
        {
            funestoR: { frames: [0], flip: false, loop: true, rate: 1 },
            funestoL: { frames: [0], flip: "x", loop: true, rate: 1 },
            funestoStop: { frames: [0], flip: false, loop: false, rate: 1 },
            funestoRunR: { frames: [1, 2], flip: false, loop: true, rate: 1 / 5 },
            funestoRunL: { frames: [1, 2], flip: "x", loop: true, rate: 1 / 5 }
        });

    //------------------------------------------------------------------------//

    // FUNESTO M

    Q.Sprite.extend("FunestoM",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "funestoM_anim",
                        sheet: "funestoM",
                        type: SPRITE_FLY,
                        collisionMask: SPRITE_BULLET,
                        gravity: 0,
                        frame: 1,
                        live: 2,
                        exp: 100,
                        heart: 1,
                        z: 32,
                        damage: 1,
                        sensor: false
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            hit: function (collision) { },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        //Q.audio.play(".mp3", { loop: false }); // Musica muerte de funestoM
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "miniCorazon", heart: 1 }));
                        this.destroy();
                    }
                }

            },

            step: function (dt) {
                if (this.p.live > 0) {
                    this.p.time += 0.01;
                    var centroX = 256 / 2;
                    var centroY = (this.p.yIni + this.p.yFin) / 2;
                    var t = this.p.time;
                    scale = 100;
                    this.p.x = centroX + scale * Math.sin(2 * t) / 2;
                    this.p.y = centroY + scale * Math.cos(t);
                    if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY)) {
                        this.play("funestoML");
                    }
                    else {
                        this.play("funestoMR");
                    }
                }
            }

        });

    //------------------------------------------------------------------------//

    Q.animations("funestoM_anim",
        {
            funestoMR: { frames: [0], flip: false, loop: true, rate: 1 / 10 },
            funestoML: { frames: [0], flip: "x", loop: true, rate: 1 / 10 },
            funestoMStop: { frames: [0], flip: false, loop: false, rate: 1 / 5 }
        });

    //------------------------------------------------------------------------//

    // NAPIAS

    Q.Sprite.extend("Napias",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "napias_anim",
                        sheet: "napias",
                        type: SPRITE_FLY,
                        collisionMask: SPRITE_BULLET,
                        gravity: 0,
                        frame: 1,
                        live: 2,
                        exp: 0,
                        heart: 5,
                        vx: 30,
                        vy: 10,
                        damage: 1,
                        sensor: false
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            hit: function (collision) { },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") | collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        //Q.audio.play(".mp3", { loop: false }); // Musica muerte de napias
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
                        this.destroy();
                    }
                }

            },

            step: function (dt) {
                if (this.p.live > 0) {
                    this.p.time += 0.01;
                    var centroX = 256 / 2;
                    var centroY = (this.p.yIni + this.p.yFin) / 2;
                    var t = this.p.time;
                    scale = 120;
                    this.p.x = centroX + scale * Math.cos(t);
                    this.p.y = centroY + scale * Math.sin(2 * t) / 2;
                    if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY)) {
                        this.play("napiasR");
                    }
                    else {
                        this.play("napiasL");
                    }
                }
            }

        });

    //------------------------------------------------------------------------//

    Q.animations("napias_anim",
        {
            napiasR: { frames: [0], flip: false, loop: true, rate: 1 / 10, next: "napiasL" },
            napiasL: { frames: [0], flip: "x", loop: true, rate: 1 / 10, next: "napiasR" },
            napiasStop: { frames: [0], flip: false, loop: false, rate: 1 / 5 }
        });

    //-----------------------------------------------------------------------//

    // NETORA

    Q.Sprite.extend("Netora",
        {
            init: function (p) {
                this._super(p,
                    {
                        sprite: "netora_anim",
                        sheet: "netora",
                        type: SPRITE_ENEMY_K,
                        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
                        gravity: 0.65,
                        frame: 1,
                        live: 1,
                        exp: 100,
                        heart: 1,
                        vx: 20,
                        damage: 1
                    });

                this.add("2d, aiBounce, animation");
                this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
                this.on("hit", this, "killed");
            },

            hit: function (collision) { },

            killed: function (collision) {
                if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                    this.p.live--;
                    if (this.p.live <= 0) {
                        //Q.audio.play(".mp3", { loop: false }); // Musica muerte de netora
                        this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "medioCorazon", heart: 1 }));
                        this.destroy();
                    }
                }
            },

            step: function (dt) {
                if (this.p.live > 0) {
                    if (this.p.x > 257) this.p.x = 1;
                    if (this.p.x < 0) this.p.x = 256;
                    if (this.p.vx > 0) this.play("netoraR");
                    if (this.p.vx < 0) this.play("netoraL");
                }
            }

        });

    //------------------------------------------------------------------------//

    Q.animations("netora_anim",
        {
            netoraR: { frames: [0, 1, 2], flip: false, loop: true, rate: 1 / 5 },
            netoraL: { frames: [0, 1, 2], flip: "x", loop: true, rate: 1 / 5 },
            netoraStop: { frames: [0], flip: false, loop: false, rate: 1 / 5 }
        });

    //------------------------------------------------------------------------//

    // ENEMIGO FUEGO

    Q.Sprite.extend("Fuego", {
        init: function (p) {
            this._super(p, {
                sprite: "fuego_anim",
                sheet: "fuego",
                type: SPRITE_ENEMY_K,
                collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
                gravity: 0.65,
                frame: 1,
                live: 10,
                exp: 500,
                heart: 10,
                hit: 2,
                hidden: true,
                time: 150,
                damage: 1
            });

            this.add("2d, animation");
            this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
            this.on("hit", this, "killed");
        },

        hit: function (collision) { },

        killed: function (collision) {
            if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")) {
                this.p.live--;
                if (this.p.live <= 0) {
                    //Q.audio.play(".mp3", { loop: false }); // Musica muerte de fuego
                    this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
                    this.destroy();
                }
            }
        },

        step: function (dt) {
            if (this.p.live > 0) {
                var pit = Q("Pit");
                if (pit.items[0]) {
                    pit = pit.items[0];
                    if (Math.abs(pit.p.y - this.p.y) <= 10) {
                        if (this.p.hidden) {
                            this.p.hidden = false;
                            this.p.sensor = true;
                            this.play("fuegoR1");
                        }
                        this.p.time += 1;
                        if (this.p.time % 150 == 0) {
                            if (pit.p.x - this.p.x > 0)
                                this.stage.insert(new Q.EnemyFire({ x: this.p.x, y: this.p.y, vx: 20 }));
                            if (pit.p.x - this.p.x < 0)
                                this.stage.insert(new Q.EnemyFire({ x: this.p.x, y: this.p.y, vx: -20 }));
                            this.p.time = 0;
                        }
                    }
                }
            }
        }

    });

    //------------------------------------------------------------------------//

    Q.animations("fuego_anim", {
        fuegoR1: { frames: [1], flip: false, loop: true, rate: 2, next: "fuegoL1" },
        fuegoL1: { frames: [1], flip: "x", loop: true, rate: 2, next: "fuegoR2" },
        fuegoR2: { frames: [1], flip: false, loop: true, rate: 1 / 10, next: "fuegoL2" },
        fuegoL2: { frames: [1], flip: "x", loop: true, rate: 1 / 10, next: "fuegoR1" }
    });

    //-------------------------------------------------------------------------//

    // DISPARO ENEMIGO

    Q.Sprite.extend("EnemyFire", {
        init: function (p) {
            this._super(p, {
                sheet: "enemyFire",
                sprite: "enemyFire",
                type: SPRITE_BULLET_ENEMY,
                collisionMask: SPRITE_PLAYER,
                sensor: true,
                gravity: 0,
                damage: 1
            });

            this.add("2d");
            this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
        },

        hit: function (collision) { },

        step: function (dt) {
            if (this.p.vx == 0) {
                this.destroy();
            }
            if (this.p.x < 0 || this.p.x > 257) {
                this.destroy();
            }
        }
    });

    //------------------------------------------------------------------------//
}