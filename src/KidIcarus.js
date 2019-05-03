var game = function(){
  var Q= window.Q= Quintus()
    .include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D")
      .setup({maximize: true})
      .controls()
      .touch();

/*
  Q.Sprite.extend("Pit",{
    init: function(p) {
      p.sheet = "Pit";
      p.frame= 51;
      this._super(p);
      /*this._super(p, {
        sprite: "pit_anim",
        sheet: "Pit",
        gravity: 0.65,
        frame: 1,
        alive:true
      });

      this.add("2d, platformerControls, animation");
      this.on("bump.left, bump.right, bum.top", function(collision){});
      this.on("bump.left, bump.right, bum.top", this, "killed");
    },
    step: function(dt){
      if(this.p.alive){
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
    stand_right: {frames:[1], flip:false, loop:true, rate: 1/5},
    stand_left: {frames:[1], flip: "x", loop:true, rate: 1/5},
    walk_right: {frames: [1,2,3], rate: 1/15, flip:false, loop:true},
    walk_left: {frames: [1,2,3], rate: 1/15, flip: "x", loop:true},
    jump_right: {frames: [6,7], flip: false, loop: true, rate: 1/5},
    jump_left: {frames: [6,7], flip: "x", loop: true, rate: 1/5},
    death: {frames:[0], flip:false, rate:2, loop:false, trigger: "dying"}
  });*/
  

  Q.scene("Level101", function(stage) {
    Q.stageTMX("Level101.tmx", stage);
    //const player = stage.insert(new Q.Pit());
    //stage.add("viewport").follow(player);
    
  });
  

 

  Q.loadTMX("Level101.tmx , Level1.png ", function() {
    //Q.compileSheets("Pit.png", "pit.json");
    Q.stageScene("Level101");
  });
};