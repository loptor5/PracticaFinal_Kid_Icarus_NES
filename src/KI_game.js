window.addEventListener("load", function () {
    
    var Q = window.Q = Quintus({ audioSupporter: ["mp3"] })
        .include("Sprites, Scenes, Input, UI, Touch, TMX, Anim, 2D, Audio")
        .setup({ maximize: true })
        .controls()
        .touch()
        .enableSound();

    // CARGA DEL ARCHIVOS

    loadScenes(Q);
    loadPlayer(Q);
    loadEnemies(Q);
    loadItems(Q);

    // CARGA COMPONENTES

    Q.loadTMX("Level101.tmx , Level1.png , TitleScreen.png, Pit.png, Pit.json, Viperix.png, Viperix.json, Monoculus.png, Monoculus.json, Items.png, Items.json, Funesto.png, Funesto.json, FunestoM.png, FunestoM.json, Napias.png, Napias.json, Netora.png, Netora.json, Fuego.png, Fuego.json, EnemyFire.png, EnemyFire.json, Titulo.mp3, Nivel_1.mp3, Nivel_Completado.mp3, Game_Over.mp3, Disparo.mp3, Corazon.mp3, Salto.mp3, Puerta.mp3, Final.mp3, Muerte_Serpiente.mp3, Grito_Funesto.mp3, Door.png, Door.json", function () {
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

});
