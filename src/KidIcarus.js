var game = function(){
  var Q= window.Q= Quintus().include("Sprites, Scenes,Input, UI, Touch, TMX, Anim, 2D").setup({ width:320, height:480, audioSupported: ['ogg', 'mp3'], }).controls().touch()
  Q.Sprite.extend("Player",{
    init: function(p) {
      this._super(p, { sheet: "player", x: 42, y: 2768 });
      this.add('2d, platformerControls');
      
      this.on("hit.sprite",function(collision) {
        if(collision.obj.isA("Tower")) {
          Q.stageScene("endGame",1, { label: "You Won!" }); 
          this.destroy();
        }
      });
    }
  });
  Q.scene("Level11", function(stage) {
    Q.stageTMX("Level11.tmx", stage);
    const player = stage.insert(new Q.Player());

    stage.add("viewport").follow(player);
  });
  

 

  Q.loadTMX("Level11.tmx , Level1.png ", function() {
    Q.stageScene("Level11");
  });
};