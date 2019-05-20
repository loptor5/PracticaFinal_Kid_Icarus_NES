var game = function ()
{
  var Q = window.Q = Quintus({ audioSupporter: ["mp3"] })
  .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio")
  .setup({maximize: true})
  .controls()
  .touch()
  .enableSound();

  var SPRITE_PLAYER = 1;
  var SPRITE_BULLET = 2;
  var SPRITE_ENEMY = 3;
  var SPRITE_OBJECT = 4;
  var SPRITE_BULLET_ENEMY = 8;
  var SPRITE_DOOR = 16;
  var SPRITE_FLY = 32;
  
  /*
  function sleep(milliseconds) 
  {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds)
        {
          break;
        }
    }
  }
  */

  // PIT

  Q.Sprite.extend("Pit",
  {
    init: function (p)
    {
      this._super(p,
      {
        sprite: "pit_anim",
        sheet: "pit",
        type: SPRITE_PLAYER,
        collisionMask: SPRITE_ENEMY | SPRITE_BULLET_ENEMY | SPRITE_FLY,
        gravity: 0.5,
        x: 40,
        y: 2763,
        frame: 1,
        alive: true,
        live: 7,
        sort: true,
        direction: "right",
        speed: 80,
        jumpSpeed: -280,
        jumped: 0,
        damaged: false,
        shootedUp: false, // si ha disparado hacia arriba
        timeShooted: 0, // tiempo de disparo
        timeDamaged: 0 // tiempo de invulnerabilidad
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bump.up, bump.bottom, bump.top", this, "hit");
      Q.input.on("fire", this, "shoot");
      Q.input.on("S", this, "shootUp");
      this.on("dying", this, "die");
    },

    step: function (dt)
    {
      //console.log(this.p.frame);
      if (this.p.alive)
      {
        // Si se sale de los limites
        if (this.p.x > 257) this.p.x = 1;
        if (this.p.x < 0) this.p.x = 256;
        
        if(this.p.timeShooted > 0)
        {
          this.p.timeShooted--;
          
          if(this.p.timeShooted == 5) // en la mitad de tiempo de animacion suelta la flecha
          {
            // Dependiendo de la situacion da un valor u otro
            if(this.p.shootedUp)
            {
              this.p.shootedUp = false;

              this.stage.insert(new Q.ArrowUp(
                {
                  x: this.p.x,
                  y: this.p.y - this.p.h / 2,
                  vy: vyF = -200,
                }));
            }
            else
            {
              let dir;
              this.p.direction == "right" ? dir = 1 : dir = -1;

              this.stage.insert(new Q.Arrow(
              {
                x: this.p.x + 2 * dir,
                y: this.p.y + this.p.h / 10,
                vx: 200 * dir,
                angle: 90 * dir
              }));
            }
          }
        }
        else if (this.p.timeDamaged > 0)
        {
          this.play("damage_" + this.p.direction);
          this.p.timeDamaged--;
          this.p.timeDamaged == 0 ? this.p.damaged = false : this.p.damaged = true;
        }
        else if (this.p.vy == 0 && this.p.vx == 0 && !this.p.ignoreControls)
        {
          this.play("stand_" + this.p.direction);
          this.p.jumped = 0;
        }
        else if (this.p.landed > 0 && !this.p.ignoreControls)
        {
          this.play("walk_" + this.p.direction);
          this.p.jumped = 0;
        }
        else if (!this.p.ignoreControls)
        {
          if(this.p.vy < 0)
          {
            this.play("jump_up_" + this.p.direction);
          }
          else
          {
            this.play("jump_down_" + this.p.direction);
          }
          this.p.jumped++;
        }

        if (this.p.jumped == 1)
        {
          this.p.vy < 0 ? Q.audio.play("Salto.mp3", { loop: false }) : null; // si salta hacia "arriba" (solo el primer salto)
        }
      }
    },

    shoot: function ()
    {
    	if (this.p.alive)
	    {
        switch(this.p.frame) 
        {
          case 1:
          case 5: // estatico
            this.play("shoot_stand_" + this.p.direction);
            break;
          case 2:
          case 3:
          case 4: // andando
            this.play("shoot_walk_" + this.p.direction);
            break;
          case 6: // saltando abajo
            this.play("shoot_jump_down_" + this.p.direction);
            break;
          case 7: // saltando arriba
            this.play("shoot_jump_up_" + this.p.direction);
            break;
          default:
            this.play("shoot_stand_" + this.p.direction);
            console.log(this.p.frame);
        }
        Q.audio.play("Disparo.mp3", { loop: false }); // audio de disparo
        this.p.timeShooted = 10;
  		}
    },

    shootUp: function ()
    {
      if (this.p.alive)
      {
        this.play("shoot_up");
        Q.audio.play("Disparo.mp3", { loop: false }); // audio de disparo
        this.p.timeShooted = 10;
        this.p.shootedUp = true;
  		}
    },

    hit: function (collision)
    {
      if (this.p.alive)
      {
	      if (collision.obj.isA("Viperix") || collision.obj.isA("Monoculus") || collision.obj.isA("Funesto") || collision.obj.isA("FunestoM") || collision.obj.isA("Napias") ||collision.obj.isA("Fuego")|| collision.obj.isA("EnemyFire")|| collision.obj.isA("Netora"))
	      {
          if(!this.p.damaged)
          {
	       	  this.p.live -= collision.obj.p.damage;
          	Q.state.set("lives", this.p.live);
          	this.p.timeDamaged = 30;
          }

          if (this.p.live <= 0)
          {
            this.p.alive = false;
            this.p.sensor = false;
            this.p.gravity = 0;
            this.play("death");
          }
        }
      }
    },

    die: function ()
    {
      this.add("tween");
      this.p.sensor = true;
      this.p.collisionMask = SPRITE_FLY;
      this.del('2d, platformerControls'); // quito los controles
      Q.stages[0].unfollow();
      this.animate(
      {
        y: this.p.y + 250,
        angle: 180
      }, 0.8, Q.Easing.Linear, 
      {
        callback: function()
        {
          this.destroy(); // elimina el personaje
          Q.stageScene("endGame", 1, { label: "You Died" }); // escena de muerte
        }
      });
    }
  });
  //----------------------------------------------------------------------//

  Q.animations("pit_anim",
  {
    stand_right: { frames: [1], flip: false, loop: true, rate: 1 / 5 },
    stand_left: { frames: [1], flip: "x", loop: true, rate: 1 / 5 },
    walk_right: { frames: [1, 4, 3, 2], rate: 1 / 20, flip: false, loop: false, next: "stand_right" }, // ?cambiar?
    walk_left: { frames: [1, 4, 3, 2], rate: 1 / 20, flip: "x", loop: false, next: "stand_left" },
    jump_up_right: { frames: [7], flip: false, loop: false, rate: 1 / 5 },
    jump_up_left: { frames: [7], flip: "x", loop: false, rate: 1 / 5 },
    jump_down_right: { frames: [6], flip: false, loop: false, rate: 1 / 5 },
    jump_down_left: { frames: [6], flip: "x", loop: false, rate: 1 / 5 },
    death: { frames: [0], flip: false, loop: false, rate: 1 / 5, trigger: "dying" },
    damage_right: { frames: [5, 1, 5, 1], flip: false, loop: true, rate: 1 / 15 },
    damage_left: { frames: [5, 1, 5, 1], flip: "x", loop: true, rate: 1 / 15 },
    shoot_stand_right: { frames: [1, 10], flip: false, loop: false, rate: 1 / 10 },
    shoot_stand_left: { frames: [1, 10], flip: "x", loop: false, rate: 1 / 10 },
    shoot_walk_right: { frames: [3, 2, 11, 12], flip: false, loop: false, rate: 1 / 20 },
    shoot_walk_left: { frames: [3, 2, 11, 12], flip: "x", loop: false, rate: 1 / 20 },
    shoot_jump_up_right: { frames: [7, 14], flip: false, loop: false, rate: 1 / 10 },
    shoot_jump_up_left: { frames: [7, 14], flip: "x", loop: false, rate: 1 / 20 },
    shoot_jump_down_right: { frames: [6, 13], flip: false, loop: false, rate: 1 / 10 },
    shoot_jump_down_left: { frames: [6, 13], flip: "x", loop: false, rate: 1 / 10 },
    shoot_up: { frames: [8, 9], flip: false, loop: false, rate: 1 / 10 }
  });
  //----------------------------------------------------------------------//

  // ARROW

  Q.MovingSprite.extend("Arrow",
  {
    init: function (p)
    {
      this._super(p,
      {
        sheet: "flecha",
        sprite: "flecha",
        scale: 0.5,
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sort: true,
        gravity: 0,
        sensor: true
      });

      this.add("2d");
    },

    step: function (dt)
    {
      if (this.p.vx == 0)
      {
        this.destroy();
      }
      if (this.p.x < 0 || this.p.x > 257)
      {
        this.destroy();
      }
    }
  });

  Q.MovingSprite.extend("ArrowUp",
  {
    init: function (p)
    {
      this._super(p,
      {
        sheet: "flecha",
        sprite: "flecha",
        scale: 0.5,
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sort: true,
        gravity: 0,
        sensor:true
      });

      this.add("2d");
    },

    step: function (dt)
    {
      if (this.p.vy == 0)
      {
        this.destroy();
      }
      if (this.p.y < 0)
      {
        this.destroy();
      }
    }
  });

  //-------------------------------------------------------------------//

  // VIPERIX

  Q.Sprite.extend("Viperix",
  {
    init: function (p)
    {
      this._super(p,
      {
        sprite: "viperix_anim",
        sheet: "viperix1",
        type: SPRITE_ENEMY,
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

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          Q.audio.play("Muerte_Serpiente.mp3", { loop: false }); // Musica muerte de viperix
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "miniCorazon", heart: 1 }));
         	this.destroy();
        }
      }
    },

    hit: function (collision) {},

    step: function (dt)
    {
      if (this.p.live > 0)
      {
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
    init: function (p)
    {
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

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de monoculus 
          this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "medioCorazon", heart: 5 }));
         	this.destroy();
        }
      }

    },

    hit: function (collision) {},

    step: function (dt)
    {
      if (this.p.live > 0)
      {
        this.p.time += 0.01;
        var centroX = 256 / 2;
        var centroY = (this.p.yIni + this.p.yFin) / 2;
        var t = this.p.time;
        scale = 120;
        this.p.x = centroX + scale * Math.cos(t);
        this.p.y = centroY + scale * Math.sin(2 * t) / 2;
        if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY))
        {
          this.play("monoculusR");
        }
        else
        {
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
    init: function (p)
    {
      this._super(p,
      {
        sprite: "funesto_anim",
        sheet: "funesto",
        type: SPRITE_ENEMY,
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

    hit: function (collision) {},

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de funesto 
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
         	this.destroy();
        }
      }
    },

    step: function(dt)
    {
      if(this.p.live > 0)
      {
        var pit = Q("Pit");
        if(pit.items[0])
        {
          pit = pit.items[0];
          
          if(Math.abs(pit.p.y - this.p.y) <= 8) // y esta dentro de su rango de x
          {
	          if(pit.p.x - this.p.x > 0) this.p.vx = 60;

	          if(pit.p.x - this.p.x < 0) this.p.vx = -60;

            if(this.p.vx > 0 && !this.p.running)
            {
              Q.audio.play("Grito_Funesto.mp3", { loop: false }); // grito de funesto 
	            this.play("funestoRunR");
              this.p.running = true;     
	          } 
            if(this.p.vx < 0 && !this.p.running)
            {
              Q.audio.play("Grito_Funesto.mp3", { loop: false }); // grito de funesto 
              this.play("funestoRunL");
              this.p.running = true;
	          }
          }
          else
          {
	          if(this.p.running) this.p.vx = this.p.vx / 6;

	          if(this.p.vx > 0) this.play("funestoR");

	          if(this.p.vx < 0) this.play("funestoL");

	          this.p.running = false;
	        }
        }
        
        if(this.p.xIni > this.p.x)
        {    	
          this.p.vx = 10;
        }
        else if(this.p.xFin < this.p.x)
        {
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
    init: function (p)
    {
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

    hit: function (collision) {},

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de funestoM
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "miniCorazon", heart: 1 }));
         	this.destroy();
        }
      }

    },

    step: function (dt)
    {
      if (this.p.live > 0)
      {
        this.p.time += 0.01;
        var centroX = 256 / 2;
        var centroY = (this.p.yIni + this.p.yFin) / 2;
        var t = this.p.time;
        scale = 100;
        this.p.x = centroX + scale * Math.sin(2 * t) / 2;
        this.p.y = centroY + scale * Math.cos(t);
        if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY))
        {
          this.play("funestoML");
        }
        else
        {
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
    init: function (p)
    {
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

    hit: function (collision) {},

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") | collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de napias
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
         	this.destroy();
        }
      }

    },

    step: function (dt)
    {
      if (this.p.live > 0)
      {
        this.p.time += 0.01;
        var centroX = 256 / 2;
        var centroY = (this.p.yIni + this.p.yFin) / 2;
        var t = this.p.time;
        scale = 120;
        this.p.x = centroX + scale * Math.cos(t);
        this.p.y = centroY + scale * Math.sin(2 * t) / 2;
        if ((this.p.x > centroX && this.p.y < centroY) || (this.p.x < centroX && this.p.y > centroY))
        {
          this.play("napiasR");
        }
        else
        {
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
    init: function (p)
    {
      this._super(p,
      {
        sprite: "netora_anim",
        sheet: "netora",
        type: SPRITE_ENEMY,
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

    hit: function (collision) {},

    killed: function (collision)
    {
      if (collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if (this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de netora
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "medioCorazon", heart:1 }));
         	this.destroy();
        }
      }
    },

    step: function (dt)
    {
      if (this.p.live > 0)
      {
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

  //----------------------------------------------------------------------//

  // ENEMIGO FUEGO

  Q.Sprite.extend("Fuego", {
    init: function(p){
      this._super(p, {
        sprite: "fuego_anim",
        sheet: "fuego",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live: 10,
        exp: 500,
        heart: 10,
        hit:2,
        hidden:true,
        time: 150,
        damage: 1,
        sensor: false
      });

      this.add("2d, aiBounce, animation");
      this.on("hit", this, "killed");
    },

    hit: function (collision) {},

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp"))
      {
        this.p.live--;
        if(this.p.live <= 0)
        {
          //Q.audio.play(".mp3", { loop: false }); // Musica muerte de fuego
        	this.stage.insert(new Q.Corazon({ x: this.p.x, y: this.p.y, sheet: "corazon", heart: 10 }));
          this.destroy();        
      	}
      }
    },

    step: function(dt)
    {
      if(this.p.live > 0)
      {
        var pit = Q("Pit");
        if(pit.items[0])
        {
          pit = pit.items[0];
          if(Math.abs(pit.p.y - this.p.y) <= 10)
          {
            if(this.p.hidden)
            {
              this.p.hidden = false;
              this.p.sensor = true;
              this.play("fuegoR1");
            }
            this.p.time += 1;
            if(this.p.time % 150 == 0)
            {
              if(pit.p.x - this.p.x > 0)
                this.stage.insert(new Q.EnemyFire({x: this.p.x, y: this.p.y, vx: 20}));
              if(pit.p.x - this.p.x < 0)
                this.stage.insert(new Q.EnemyFire({x: this.p.x, y: this.p.y, vx: -20}));
              this.p.time = 0;
            }
          }
        }
    	}
	  }

  });

  //------------------------------------------------------------------------//

  Q.animations("fuego_anim", {
  	fuegoR1: { frames: [1], flip: false, loop:true , rate:1, next: "fuegoL1"},
  	fuegoL1: { frames: [1], flip: "x", loop:true , rate:1, next: "fuegoR2"},
    fuegoR2: { frames: [1], flip: false, loop:true , rate:1/10, next: "fuegoL2"},
    fuegoL2: { frames: [1], flip: "x", loop:true, rate:1/10, next: "fuegoR1" }
  });

 //-------------------------------------------------------------------------//

 // DISPARO ENEMIGO

 Q.MovingSprite.extend("EnemyFire", {
    init: function(p) {
      this._super( p, {
        sheet: "enemyFire",
        sprite: "enemyFire",
        type: SPRITE_BULLET_ENEMY,
        collisionMask: SPRITE_PLAYER,
        sensor: true,
        sort: true,
        gravity: 0,
        damage: 1
      });

      this.add("2d");
    },

    hit: function (collision) {},

    step: function(dt)
    {
      if(this.p.vx == 0)
      {
        this.destroy();
      }
      if(this.p.x < 0 || this.p.x > 257)
      {
        this.destroy();
      }
    }
  });

 // CORAZON

 Q.MovingSprite.extend("Corazon",
  {
    init: function (p)
    {
      this._super(p,
      {
        type: SPRITE_OBJECT,
        collisionMask: SPRITE_PLAYER,
        gravity: 0,
        frame: 0,
        sensor: true
      });

      this.add("2d");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
    },

    hit: function (collision)
    {
      if (collision.obj.isA("Pit"))
      {
        Q.audio.play("Corazon.mp3", { loop: false }); // Reproduce la musica de corazon
      	Q.state.inc("score", this.p.heart);
        this.destroy();
      }
    }
  });
 //------------------------------------------------------------------------//

 // DOOR

 Q.Sprite.extend("Door",
  {
    init: function (p)
    {
      this._super(p,
      {
        type: SPRITE_DOOR,
        collisionMask: SPRITE_PLAYER,
        gravity: 0,
        frame: 0
        //tipoPuerta sera puertaA o puertaB
        //modelo indicará a donde transporta al personaje
      });

      this.add("2d, aiBounce");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
    },

    hit: function (collision)
    {
      if (collision.obj.isA("Pit"))
      {
        Q.audio.play("Puerta.mp3", { loop: false }); // Musica de puerta
      	//Según el tipo de puerta te mandará a un lugar a otro
        if(this.p.modelo == 0) // La ultima puerta
        {
          collision.obj.destroy();
      		Q.stageScene("winGame", 1, { label: "You Won!" });
        }
        else if(this.p.modelo == 1)
        {
      		collision.obj.p.x = 200;
      		collision.obj.p.y = 3216;
      		this.p.sheet = this.p.tipoPuerta + "Close";
      		this.p.modelo = 100;
      		this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3184, yFin: 3264, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0.5 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0.5 }));
        }
        else if(this.p.modelo == 2)
        {
      		collision.obj.p.x = 200;
      		collision.obj.p.y = 2528;
      		//No la cerramos porque el modelo 1 y el 3 te llevan a la misma habitación
        }
        else if(this.p.modelo == 3)
        {
      		collision.obj.p.x = 200;
      		collision.obj.p.y = 3216;
      		this.p.sheet = this.p.tipoPuerta + "Close";
      		this.p.modelo = 100;
      		this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3184, yFin: 3264, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3184, yIni: 3104, yFin: 3264, time: 0.5 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0 }));
          this.stage.insert(new Q.Napias({ x: 112, y: 3136, yIni: 3152, yFin: 3220, time: 0.5 }));
        }
        else if(this.p.modelo == 4)
        {
      		collision.obj.p.x = 200;
      		collision.obj.p.y = 2976;
      		this.p.sheet = this.p.tipoPuerta + "Close";
      		this.p.modelo = 100;
      		this.stage.insert(new Q.Napias({ x: 112, y: 3998, yIni: 2864, yFin: 3008, time: 0 }));
    		  this.stage.insert(new Q.FunestoM({ x: 112, y: 3184, yIni: 2864, yFin: 3008, time: 0.5 }));
        }
        else if(this.p.modelo == 5)
        {
      		collision.obj.p.x = 152;
      		collision.obj.p.y = 1104;
        }
      }
    }
  });
  //----------------------------------------------------------------------//

  // SCORE

  Q.UI.Text.extend("Score",
  {
    init: function (p)
    {
        this._super(
        {
          label: "LIVES: " + barraVida(Q.state.get("lives")) + "\n\nHEARTS: " + Q.state.get("score"),
          color: "white",
          family: "PressStart2P",
          align: "left",
          //outlineWidth: 1,
          //outlineColor: "red",
          //syze: 20,
          x: 150,
          y: 25
        });

        Q.state.on("change.score", this, "score");
        Q.state.on("change.lives", this, "lives");
    },
    score: function (score)
    {
      this.p.label = "LIVES: " + barraVida(Q.state.get("lives")) + "\n\nHEARTS: " + score;
    },

    lives: function (lives)
    {
      this.p.label = "LIVES: " + barraVida(lives) + "\n\nHEARTS: " + Q.state.get("score");
    } 
  });

  var barraVida = function(num)
  {
    let barra = "[";
    for(let i = 1; i <= 7; i++)
    {
      num >= i ? barra += "|" : barra += " ";
    }
    barra += "]";
    return barra;
  }

  // END GAME

  Q.scene("endGame", function(stage)
  {
    Q.audio.stop(); // para toda la musica
    Q.audio.play("Game_Over.mp3", { loop: false }); // Reproduce la musica de Game Over

    const container = stage.insert(
    new Q.UI.Container(
    {
      x: Q.width/2,
      y: Q.height/2,
      fill: "rgba(0,0,0,0.5)"
    }));

    const button = container.insert(
    new Q.UI.Button(
    {
      x: 0,
      y: 0,
      color: "#FFFFFF",
      fill: "#CCCCCC",
      label: "Play Again"
      //keyActionName: "fire"
    }));

    const label = container.insert(
    new Q.UI.Text(
    {
      family: "PressStart2P",
      color: "#FFFFFF",
      x: 10,
      y: -10 - button.p.h,
      label: stage.options.label
    }));

    button.on("click", function()
    {
      Q.audio.stop(); // para toda la musica
      Q.clearStages();
      Q.stageScene("Level101");
      Q.stageScene("HUD", 1);
    });

    container.fit(20);

  });

  // WIN GAME

  Q.scene("winGame", function(stage)
  {
    Q.audio.stop(); // para toda la musica
    Q.audio.play("Nivel_Completado.mp3", { loop: false }); // Reproduce la musica de Nivel Completado
    

    const container = stage.insert(
      new Q.UI.Container(
      {
        x: Q.width/2,
        y: Q.height/2,
        fill: "rgba(0,0,0,0.5)"
      })
    );

    const button = container.insert(
      new Q.UI.Button(
      {
        x: 0,
        y: 0,
        fill: "#FFFFFF",
        family: "PressStart2P",
        label: "Play Again",
        keyActionName: "fire"
      })
    );

    const label = container.insert(
      new Q.UI.Text(
      {
        family: "PressStart2P",
        
      	color: "#FFFFFF",
        x: 10,
        y: -10 - button.p.h,
        label: stage.options.label
      })
    );

    button.on("click", function()
    {
      Q.audio.stop(); // para toda la musica
      Q.clearStages();
      Q.stageScene("level101");
      Q.stageScene("HUD", 1);
    });
    
    container.fit(20);
  });

  // HUD

  Q.scene("HUD", function (stage)
  {
    stage.insert(new Q.Score());
  });

  // TITULO

  Q.scene("TitleScreen", function (stage)
  {
    Q.audio.play("Titulo.mp3", { loop: true }); // Reproduce la musica del TitleScreen
    
    stage.insert(new Q.UI.Button(
    {
      asset: "TitleScreen.png",
      x: Q.width / 2,
      y: Q.height / 2,
      scaleToFit: true,
      scale: 2.85
    }))

    Q.input.on("confirm", function()
    {
      Q.audio.stop(); // para toda la musica
      Q.clearStages();
      Q.stageScene("Level101");
      Q.stageScene("HUD", 1);
    });
  });

  // NIVEL 1

  Q.scene("Level101", function (stage)
  {
    Q.audio.play("Nivel_1.mp3", { loop: true }); // Reproduce la musica del Nivel 1
    Q.stageTMX("Level101.tmx", stage);
    const player = stage.insert(new Q.Pit());
    stage.add("viewport").follow(player);
    stage.viewport.scale = 2;

   	stage.insert(new Q.Viperix({ x: 96, y: 2592 }));
   	stage.insert(new Q.Viperix({ x: 128, y: 2592 }));
   	stage.insert(new Q.Viperix({ x: 176, y: 2528 }));
   	stage.insert(new Q.Viperix({ x: 208, y: 2528 }));
   	stage.insert(new Q.Viperix({ x: 176, y: 2368 }));
   	stage.insert(new Q.Viperix({ x: 192, y: 2336 }));
   	stage.insert(new Q.Viperix({ x: 32, y: 2208 }));
   	stage.insert(new Q.Viperix({ x: 32, y: 2096 }));
   	stage.insert(new Q.Monoculus({ x: 32, y: 2048, yIni: 2047, yFin: 2147, time: 0 }));
   	stage.insert(new Q.Monoculus({ x: 32, y: 2032, yIni: 2031, yFin: 2131, time: 0.5 }));
   	stage.insert(new Q.Monoculus({ x: 32, y: 2016, yIni: 2015, yFin: 2115, time: 1 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 2000, yIni: 1999, yFin: 2199, time: 1.5 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1872, yIni: 1871, yFin: 1971, time: 0 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1840, yIni: 1939, yFin: 1940, time: 0.2 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1840, yIni: 1839, yFin: 1940, time: 1 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1808, yIni: 1807, yFin: 1908, time: 0.25 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1776, yIni: 1775, yFin: 18776, time: 0.75 }));
    stage.insert(new Q.Monoculus({ x: 32, y: 1360, yIni: 1359, yFin: 1460, time: 0 }));
    stage.insert(new Q.Funesto({ x: 157, y: 1346, xIni: 136, xFin: 164 }));
    stage.insert(new Q.Napias({ x: 32, y: 1024, yIni: 1023, yFin: 1124, time: 0.5 }));
    stage.insert(new Q.Napias({ x: 32, y: 992, yIni: 991, yFin: 1092, time: 0.25 }));
    stage.insert(new Q.Funesto({ x: 135, y: 1104, xIni: 95, xFin: 160 }));
    stage.insert(new Q.FunestoM({ x: 112, y: 864, yIni: 863, yFin: 964, time: 0 }));
    stage.insert(new Q.FunestoM({ x: 112, y: 832, yIni: 831, yFin: 932, time: 0.33 }));
    stage.insert(new Q.FunestoM({ x: 112, y: 800, yIni: 799, yFin: 900, time: 0.66 }));
    stage.insert(new Q.FunestoM({ x: 112, y: 768, yIni: 767, yFin: 868, time: 0.99 }));
    stage.insert(new Q.Funesto({ x: 63, y: 544, xIni: 46, xFin: 80 }));
    stage.insert(new Q.Funesto({ x: 151, y: 480, xIni: 126, xFin: 176 }));
    stage.insert(new Q.Fuego({ x: 176, y: 480 }));
    stage.insert(new Q.Fuego({ x: 48, y: 432 }));
    stage.insert(new Q.Fuego({ x: 96, y: 256 }));
    stage.insert(new Q.Netora({ x: 80, y: 128 }));
    stage.insert(new Q.Netora({ x: 192, y: 128 }));

    stage.insert(new Q.Door({x: 16, y:2752, tipoPuerta: "doorB", sheet: "doorBClose", modelo:-1 }));
    stage.insert(new Q.Door({x: 241, y:3200, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 2 }));
    stage.insert(new Q.Door({x: 241, y:2965, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 5 }));
    stage.insert(new Q.Door({x: 241, y:2512, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 1 }));
    stage.insert(new Q.Door({x: 64, y:1317, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 3 }));
    stage.insert(new Q.Door({x: 192, y:1093, tipoPuerta: "doorA", sheet: "doorAOpen", modelo: 4 }));
    stage.insert(new Q.Door({x: 240, y:117, tipoPuerta: "doorB", sheet: "doorBOpen", modelo: 0 }));

     
    // INICIALIZA SCORE
    Q.state.set({ score: 0, lives: 7 });
  });

  // CARGA COMPONENTES

  Q.loadTMX("Level101.tmx , Level1.png , TitleScreen.png, Pit.png, Pit.json, Viperix.png, Viperix.json, Monoculus.png, Monoculus.json, Items.png, Items.json, Funesto.png, Funesto.json, FunestoM.png, FunestoM.json, Napias.png, Napias.json, Netora.png, Netora.json, Fuego.png, Fuego.json, EnemyFire.png, EnemyFire.json, Titulo.mp3, Nivel_1.mp3, Nivel_Completado.mp3, Game_Over.mp3, Disparo.mp3, Corazon.mp3, Salto.mp3, Puerta.mp3, Final.mp3, Muerte_Serpiente.mp3, Grito_Funesto.mp3, Door.png, Door.json", function ()
  {
    Q.compileSheets("Pit.png", "Pit.json");
    Q.compileSheets("Viperix.png", "Viperix.json");
    Q.compileSheets("Monoculus.png", "Monoculus.json");
    Q.compileSheets("Items.png", "Items.json");
    Q.compileSheets("Funesto.png", "Funesto.json");
    Q.compileSheets("FunestoM.png", "FunestoM.json");
    Q.compileSheets("Napias.png", "Napias.json");
    Q.compileSheets("Netora.png", "Netora.json");
    Q.compileSheets("Fuego.png", "Fuego.json");
    Q.compileSheets("EnemyFire.png", "EnemyFire.json");
    Q.compileSheets("Door.png", "Door.json");
    Q.stageScene("TitleScreen");
  });
};
