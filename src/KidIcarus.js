var game = function(){
  var Q= window.Q= Quintus()
    .include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D")
      .setup({maximize: true})
      .controls()
      .touch();
      
      var SPRITE_PLAYER=1;
      var SPRITE_BULLET=2;
      var SPRITE_ENEMY=3;
      var SPRITE_OBJECT=4;
      var SPRITE_FLY=5;
      var SPRITE_BULLET_ENEMY=6;


  Q.Sprite.extend("Pit",{
    init: function(p) {
      this._super(p, {
        sprite: "pit_anim",
        sheet: "pit",
        type: SPRITE_PLAYER,
        gravity: 0.50,
        x: 100,
        y: 2551,
        frame: 1,
        alive:true,
        live: 7,
        sort: true,
        direction: "right",
        speed: 80,
        jumpSpeed: -280
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bump.up", function(collision){});
      this.on("bump.left, bump.right, bump.up", this, "hit");
      Q.input.on("fire", this, "shoot");
      Q.input.on( "S", this, "shootUp");
      this.on("dying", this, "die");
      this.play("stand_right");
    },

    step: function(dt){
      if(this.p.alive){
        if(this.p.x>257) this.p.x=1;
        if(this.p.x<0) this.p.x=256;
        if(this.p.vx >0){
          this.p.direction = "right";
          this.play("walk_right");

        }
        if(this.p.vx <0) {
          this.p.direction="left";
          this.play("walk_left");
        }
        if((this.p.vy >0 || this.p.vy <0)&& this.p.direction=="right"){
          this.play("jump_right");
        } 
        if((this.p.vy >0 || this.p.vy <0)&& this.p.direction=="left"){
          this.play("jump_left");
        }
      }
    },

    shoot: function() {
      var p= this.p;
      if(p.direction=="right"){
        this.play("stand_right");
        this.stage.insert(new Q.Arrow({
          x: p.x,
          y: p.y+p.h/8,
          vx: 200
        }))
      }else{
        this.play("stand_left");
        this.stage.insert(new Q.Arrow({
          x: p.x,
          y: p.y+p.h/8,
          vx: -200
        }))
      }
      
    },

    shootUp: function(){
      var p=this.p;
      this.play("lookUp");
      this.stage.insert(new Q.ArrowUp({
        x: p.x,
        y: p.y-p.h/2,
        vy: -200
      }));
    },

    hit: function(collision){
      if(collision.obj.isA("Viperix")){
        this.p.live--;
        if(this.p.direction=="right"){
          this.play("damage_right");
        }else{
          this.play("damage_left");
        }
        if(this.p.live==0){
          this.p.alive=false;
          this.play("death");
        }
      }
    },
    die: function() { 
      this.destroy();
      const player = stage.insert(new Q.Pit());
      stage.add("viewport").follow(player);
      stage.viewport.scale= 2;
    }
  });
  //----------------------------------------------------------------------//
  
  Q.animations("pit_anim",{
    stand_right: {frames:[1], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[1], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,4,3,2], rate: 1/20, flip:false, loop:true, next: "stand_right"},
    walk_left: {frames: [1,4,3,2], rate: 1/20, flip: "x", loop:true, next: "stand_left"},
    jump_right: {frames: [7,6], flip: false, loop: false, rate: 1/5},
    jump_left: {frames: [7,6], flip: "x", loop: false, rate: 1/5},
    lookUp: {frames: [8,9], rate: 1/5, flip: false, loop: false},
    death: {frames:[0], flip:false, rate:1/5, loop:false, trigger: "dying"},
    damage_right: {frames:[5,1,5,1], flip:false, rate:1/15, loop:false},
    damage_left: {frames:[5,1,5,1], flip:"x", rate:1/15, loop:false}
  });
  //----------------------------------------------------------------------//

  Q.MovingSprite.extend("Arrow", {
    init: function(p) {
      this._super( p, {
        sheet: "arrow",
        sprite: "arrow",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sensor: true,
        sort:true,
        gravity: 0
      });

      this.add("2d");
    },

    step: function(dt){
      if(this.p.vx==0){
        this.destroy();
      }
      if(this.p.x<0 || this.p.x>257){
        this.destroy();
      }
    }
  });

  Q.MovingSprite.extend("ArrowUp", {
    init: function(p) {
      this._super( p, {
        sheet: "arrowUp",
        sprite: "arrowUp",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_ENEMY,
        sensor: true,
        sort:true,
        gravity: 0
      });

      this.add("2d");
    },

    step: function(dt){
      if(this.p.vy==0){
        this.destroy();
      }
      if(this.p.y<0){
        this.destroy();
      }
    }
  });

  //-------------------------------------------------------------------//

  Q.Sprite.extend("Viperix", {
    init: function(p){
      this._super(p, {
        sprite: "viperix_anim",
        sheet: "viperix1",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live:1,
        exp: 100,
        heart: 1,
        vx:20,
        hit:1
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },
    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },
    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="corazonMini";
          this.play("viperStop");
          this.p.vx=0;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        if(this.p.vx>0) this.play("viperR");
        if(this.p.vx<0) this.play("viperL");
      }
    }

  });

  //------------------------------------------------------------------------//

  Q.animations("viperix_anim", {
    viperR: { frames: [0,1], flip: false, loop:true , rate:1/5},
    viperL: { frames: [0,1], flip: "x", loop:true, rate:1/5 },
    viperStop: {frames: [0],flip:false, loop:false,rate:1/5}
  });

  //----------------------------------------------------------------------//

  Q.Sprite.extend("Monoculus", {
    init: function(p){
      this._super(p, {
        sprite: "monoculus_anim",
        sheet: "monoculus",
        type: SPRITE_FLY,
        collisionMask: SPRITE_BULLET,
        gravity: 0,
        frame: 1,
        live:1,
        exp: 300,
        heart: 5,
        vx: 30,
        vy: 10,
        z: 32,
        hit:1,
        sensor:false
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },

    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="medioCorazon";
          this.play("monoculusStop");
          this.p.vx=0;
          this.p.vy=0;
          this.p.sensor=true;
          this.p.collisionMask= SPRITE_PLAYER;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        this.p.time+=0.01;
        var centroX= 256/2;
        var centroY= (this.p.yIni+this.p.yFin)/2;
        var t=this.p.time;
        scale= 120;
        this.p.x= centroX+scale*Math.cos(t);
        this.p.y= centroY+scale*Math.sin(2*t)/2;
        if((this.p.x>centroX && this.p.y<centroY)||(this.p.x<centroX && this.p.y>centroY)){
        	this.play("monoculusR");
        }else{
        	this.play("monoculusL");
        }

      }
    }

  });
  //------------------------------------------------------------------------//

  Q.animations("monoculus_anim", {
    monoculusR: { frames: [0], flip: false, loop:true , rate:1/10},
    monoculusL: { frames: [1], flip: false, loop:true, rate:1/10 },
    monoculusStop: {frames: [0],flip:false, loop:false,rate:1/5}
  });

  //------------------------------------------------------------------------//

  Q.Sprite.extend("Funesto", {
    init: function(p){
      this._super(p, {
        sprite: "funesto_anim",
        sheet: "funesto",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live:10,
        exp: 500,
        heart: 10,
        hit:2,
        vx:10,
        running: false
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },

    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="corazon";
          this.play("funestoStop");
          this.p.vx=0;
          this.p.vy=0;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        var pit=Q("Pit");
        if(pit.items[0]){
	        pit= pit.items[0];
	        if(pit.p.y==this.p.y){
	          if(pit.p.x-this.p.x>0) this.p.vx=60;
	          if(pit.p.x-this.p.x<0) this.p.vx=-60;
	          if(this.p.vx>0 && !this.p.running){
	            this.play("funestoRunR");
	            this.p.running=true;

	          } 
	          if(this.p.vx<0 && !this.p.running){
	            this.play("funestoRunL");
	            this.p.running=true;

	          } 

	        }else{
	          if(this.p.running) this.p.vx= this.p.vx/6;
	          if(this.p.vx>0) this.play("funestoR");
	          if(this.p.vx<0) this.play("funestoL");
	          this.p.running=false;
	        }
	        if(this.p.xIni>this.p.x || this.p.xFin<this.p.x){
	          this.p.vx= -this.p.vx;
	          this.p.vy= -this.p.vy;
	        }
    	}
      }
    }

  });

  //------------------------------------------------------------------------//

  Q.animations("funesto_anim", {
    funestoR: { frames: [0], flip: false, loop:true , rate:1},
    funestoL: { frames: [0], flip: "x", loop:true, rate:1 },
    funestoStop: {frames: [0],flip:false, loop:false,rate:1},
    funestoRunR: {frames: [1,2], flip: false, loop: true, rate:1/5},
    funestoRunL: {frames: [1,2], flip: "x", loop: true, rate:1/5}
  });

  //------------------------------------------------------------------------//

  Q.Sprite.extend("FunestoM", {
    init: function(p){
      this._super(p, {
        sprite: "funestoM_anim",
        sheet: "funestoM",
        type: SPRITE_FLY,
        collisionMask: SPRITE_BULLET,
        gravity: 0,
        frame: 1,
        live:2,
        exp: 100,
        heart: 1,
        z: 32,
        hit:1,
        sensor:false
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },

    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="corazonMini";
          this.play("funestoMStop");
          this.p.vx=0;
          this.p.vy=0;
          this.p.sensor=true;
          this.p.collisionMask= SPRITE_PLAYER;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        this.p.time+=0.01;
        var centroX= 256/2;
        var centroY= (this.p.yIni+this.p.yFin)/2;
        var t=this.p.time;
        scale= 100;
        this.p.x= centroX+scale*Math.sin(2*t)/2;
        this.p.y= centroY+scale*Math.cos(t);
        if((this.p.x>centroX && this.p.y<centroY)||(this.p.x<centroX && this.p.y>centroY)){
        	this.play("funestoML");
        }else{
        	this.play("funestoMR");
        }
		
      }
    }

  });
  //------------------------------------------------------------------------//

  Q.animations("funestoM_anim", {
    funestoMR: { frames: [0], flip: false, loop:true , rate:1/10},
    funestoML: { frames: [0], flip: "x", loop:true, rate:1/10 },
    funestoMStop: {frames: [0],flip:false, loop:false,rate:1/5}
  });

  //------------------------------------------------------------------------//

  Q.Sprite.extend("Napias", {
    init: function(p){
      this._super(p, {
        sprite: "napias_anim",
        sheet: "napias",
        type: SPRITE_FLY,
        collisionMask: SPRITE_BULLET,
        gravity: 0,
        frame: 1,
        live:2,
        exp: 0,
        heart: 5,
        vx: 30,
        vy: 10,
        hit:1,
        sensor:false
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },

    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="corazon";
          this.play("napiasStop");
          this.p.vx=0;
          this.p.vy=0;
          this.p.sensor=true;
          this.p.collisionMask= SPRITE_PLAYER;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        this.p.time+=0.01;
        var centroX= 256/2;
        var centroY= (this.p.yIni+this.p.yFin)/2;
        var t=this.p.time;
        scale= 120;
        this.p.x= centroX+scale*Math.cos(t);
        this.p.y= centroY+scale*Math.sin(2*t)/2;
        if((this.p.x>centroX && this.p.y<centroY)||(this.p.x<centroX && this.p.y>centroY)){
        	this.play("napiasR");
        }else{
        	this.play("napiasL");
        }

      }
    }

  });
  //------------------------------------------------------------------------//

  Q.animations("napias_anim", {
    napiasR: { frames: [0], flip: false, loop:true , rate:1/10, next:"napiasL"},
    napiasL: { frames: [0], flip: "x", loop:true, rate:1/10, next:"napiasR"},
    napiasStop: {frames: [0],flip:false, loop:false,rate:1/5}
  });
  //-----------------------------------------------------------------------//

  Q.Sprite.extend("Netora", {
    init: function(p){
      this._super(p, {
        sprite: "netora_anim",
        sheet: "netora",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live:1,
        exp: 100,
        heart: 1,
        vx:20,
        hit:1
      });

      this.add("2d, aiBounce, animation");
      this.on("bump.left, bump.right, bump.top, bump.bottom", this, "hit");
      this.on("hit", this, "killed");
    },
    hit: function(collision){
      if(collision.obj.isA("Pit") && this.p.live<=0){
        this.destroy();
      }

    },
    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.p.sheet="medioCorazon";
          this.play("netoraStop");
          this.p.vx=0;
        }
      }

    },

    step: function(dt){
      if(this.p.live>0){
        if(this.p.vx>0) this.play("netoraR");
        if(this.p.vx<0) this.play("netoraL");
      }
    }

  });
  //------------------------------------------------------------------------//

  Q.animations("netora_anim", {
    netoraR: { frames: [0,1,2], flip: false, loop:true , rate:1/5},
    netoraL: { frames: [0,1,2], flip: "x", loop:true, rate:1/5 },
    netoraStop: {frames: [0],flip:false, loop:false,rate:1/5}
  });

  //----------------------------------------------------------------------//

  //------------------------------------------------------------------------//

  Q.Sprite.extend("Fuego", {
    init: function(p){
      this._super(p, {
        sprite: "fuego_anim",
        sheet: "fuego",
        type: SPRITE_ENEMY,
        collisionMask: SPRITE_BULLET | SPRITE_PLAYER,
        gravity: 0.65,
        frame: 1,
        live:10,
        exp: 500,
        heart: 10,
        hit:2,
        visible:false
      });

      this.add("2d, aiBounce, animation");
      this.on("hit", this, "killed");
    },

    killed: function(collision){
      if(collision.obj.isA("Arrow") || collision.obj.isA("ArrowUp")){
        this.p.live--;
        if(this.p.live<=0){
          this.destroy();        }
      }

    },

    step: function(dt){
	    if(this.p.live>0){
	        var pit=Q("Pit");
	        if(pit.items[0]){
	        	if(!this.p.visible){
	        		this.p.visible= true;
	        		this.play("fuegoR1");
	        	}
		        pit= pit.items[0];
		        if(Math.abs(pit.p.y-this.p.y)<=32){
		          if(pit.p.x-this.p.x>0)
		          	this.stage.insert(new Q.EnemyFire({x: this.p.x, y: this.p.y+this.p.h/8, vx: 20}));
		          if(pit.p.x-this.p.x<0)
		           this.stage.insert(new Q.EnemyFire({x: this.p.x, y: this.p.y+this.p.h/8, vx: 20}));
		      	}
	  		}
    	}
	}

  });

  //------------------------------------------------------------------------//

  Q.animations("fuego_anim", {
  	fuegoR1: { frames: [1], flip: false, loop:true , rate:1, next: "fuegoL1"},
  	fuegoL1: { frames: [1], flip: false, loop:true , rate:1, next: "fuegoR2"},
    fuegoR2: { frames: [1], flip: false, loop:true , rate:1, next: "fuegoL2"},
    fuegoL2: { frames: [1], flip: "x", loop:true, rate:1, next: "fuegoR1" }
  });

 //-------------------------------------------------------------------------//

 Q.MovingSprite.extend("EnemyFire", {
    init: function(p) {
      this._super( p, {
        sheet: "enemyFire",
        sprite: "enemyFire",
        type: SPRITE_BULLET,
        collisionMask: SPRITE_PLAYER,
        sensor: true,
        sort:true,
        gravity: 0
      });

      this.add("2d");
    },

    step: function(dt){
      if(this.p.vx==0){
        this.destroy();
      }
      if(this.p.x<0 || this.p.x>257){
        this.destroy();
      }
    }
  });

 //----------------------------------------------------------------------//



  Q.scene("Level101", function(stage) {
    Q.stageTMX("Level101.tmx", stage);
    const player = stage.insert(new Q.Pit());
    stage.add("viewport").follow(player);
    stage.viewport.scale= 2;
    stage.insert(new Q.Viperix({ x: 60, y: 2666}));
    stage.insert(new Q.Monoculus({ x:60, y: 2068, yIni:2067, yFin: 2164, time: 0}));
    stage.insert(new Q.Monoculus({ x:62, y: 2050, yIni:2049, yFin: 2146, time: 1}));
    stage.insert(new Q.Funesto({ x:135, y: 1346, xIni:135, xFin:180}));
    stage.insert(new Q.FunestoM({ x:135, y: 1046, yIni:1049, yFin:1146, time: 0}));
    stage.insert(new Q.Napias({ x:135, y: 1046, yIni:2500, yFin:2600, time: 1}));
    stage.insert(new Q.Netora({ x: 70, y: 2666}));
    stage.insert(new Q.Fuego({ x: 138, y: 2551}));
    
  });
  

 

  Q.loadTMX("Level101.tmx , Level1.png , Pit.png, Pit.json, Viperix.png, Viperix.json, Monoculus.png, Monoculus.json, Items.png, Items.json, Funesto.png, Funesto.json, FunestoM.png, FunestoM.json, Napias.png, Napias.json, Netora.png, Netora.json, Fuego.png, Fuego.json, EnemyFire.png, EnemyFire.json", function() {
    Q.compileSheets("Pit.png", "Pit.json");
    Q.compileSheets("Viperix.png", "Viperix.json");
    Q.compileSheets("Monoculus.png", "Monoculus.json");
    Q.compileSheets("Items.png","Items.json");
    Q.compileSheets("Funesto.png", "Funesto.json");
    Q.compileSheets("FunestoM.png", "FunestoM.json");
    Q.compileSheets("Napias.png", "Napias.json");
    Q.compileSheets("Netora.png", "Netora.json");
    Q.compileSheets("Fuego.png", "Fuego.json");
    Q.compileSheets("EnemyFire.png", "EnemyFire.json");
    Q.stageScene("Level101");
  });
};