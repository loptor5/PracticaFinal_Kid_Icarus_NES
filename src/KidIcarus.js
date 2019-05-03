var game = function(){
  var Q= window.Q= Quintus()
    .include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D")
      .setup({maximize: true})
      .controls()
      .touch();

/*
  Q.Sprite.extend("Pit",{
    init: function(p) {
      this._super(p, {
        sprite: "pit_anim",
        sheet: "Pit",
        gravity: 0.65,
        frame: 0,
        x: 36,
        y:2764,
        alive:true
      });

    this.add("2d, platformerControls, animation");
    this.on("bump.left, bump.right, bum.top", function(collision){});
    this.on("bump.left, bump.right, bum.top", this, "killed");
    this.on("dying", this, "die");
    },
    killed: function(collision){
      if(collision.obj.isA("Goomba")||collision.obj.isA("Bloopa")){
        this.p.alive=false;
        this.p.vx=0;
        this.p.vy= -150;
        this.play("death");
      }
    },

    die: function() { 
      this.destroy(); 
    },

    step: function(dt){
      if(this.p.alive){
        if(this.p.y >= 700){
          this.p.sheet = "Pit";
          this.p.frame = 0;
          this.p.x = 150;
          this.p.y = 380;
        }

        if(this.p.vx === 0) this.play("stand_right");
        if(this.p.vx >0) this.play("walk_right");
        if(this.p.vx <0) this.play("walk_left");
        if(this.p.vy >0 || this.p.vy <0) this.play("jump_right");
        if((this.p.vy >0 || this.p.vy <0)&& this.p.vx <0) this.play("jump_left");
      }
    }
  });
  //----------------------------------------------------------------------//
  
  Q.animations("pit_anim",{
    stand_right: {frames:[0], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[0], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,2,3], rate: 1/15, flip:false, loop:true},
    walk_left: {frames: [1,2,3], rate: 1/15, flip: "x", loop:true},
    jump_right: {frames: [4], flip: false, loop: true, rate: 1/5},
    jump_left: {frames: [4], flip: "x", loop: true, rate: 1/5},
    death: {frames:[12], flip:false, rate:2, loop:false, trigger: "dying"}
  });
  
*/
  Q.scene("Level10", function(stage) {
    Q.stageTMX("Level11.tmx", stage);
    const player = stage.insert(new Q.Pit());
    
  });
  

 

  Q.loadTMX("Level10.tmx , Level1.png ", function() {
    Q.compileSheets("Pit.png", "pit.json");
    Q.stageScene("Level10");
  });
};