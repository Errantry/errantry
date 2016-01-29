Game.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

};

Game.Preloader.prototype = {

  // Load all the images and other assets in the game
	preload: function () {
	
    var origHeight = 720;
    var origWidth = 1280;
    
    var width = $(window).width();
      var height = $(window).height();
    
    if (height > origHeight) {
      height = origHeight;
    }
    if (width > origWidth) {
      width = origWidth;
    }
    this.scaleFactor = height/origHeight;
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.scale.refresh();
    this.game.width = origWidth * this.scaleFactor;
    this.game.height = origHeight * this.scaleFactor;
    $("#gameContainer").width(this.game.width);
    $("#gameContainer").height(this.game.height);
    this.camera.setSize(this.game.width, this.game.height);
    this.world.setBounds(0, 0, this.game.width, this.game.height);
    this.game.renderer.resize(this.game.width, this.game.height);
	
    //	These are the assets we loaded in Boot.js
		//	Background and a loading progress bar
		this.menu_bg = this.add.image(0, 0, 'menu_bg');
		this.menu_bg.width = this.game.width;
		this.menu_bg.height = this.game.height;
    
    this.preloadBarBg = this.add.image(325 * this.scaleFactor, 390 * this.scaleFactor, 'menuAtlas');
    this.preloadBarBg.frameName = 'loading';
    this.preloadBarBg.width = 642 * this.scaleFactor;
    this.preloadBarBg.height = 102 * this.scaleFactor;
    this.preloadBar = this.add.sprite(325 * this.scaleFactor, 390 * this.scaleFactor, 'menuAtlas');
    this.preloadBar.frameName = 'loading_over';
    this.preloadBar.width = 642 * this.scaleFactor;
    this.preloadBar.height = 102 * this.scaleFactor;
    this.preloadBar.anchor.setTo(0, 0);
		//	This sets the preloadBar sprite as a loader sprite.
		//	What that does is automatically crop the sprite from 0 to full-width
		//	as the files below are loaded in.
		this.load.setPreloadSprite(this.preloadBar);
	
    this.load.image('clickplate', 'img/general/clickplate.png');
    this.load.image('fadeplate', 'img/general/1px_black.png');
    //this.load.image('1px_transparent', 'img/general/1px_transparent.png');
    this.load.image('questlog_bg', 'img/questlog/bg.png');
    this.load.image('questlog_divider', 'img/questlog/divider.png');
    this.load.image('questlog_done', 'img/questlog/done.png');
    this.load.image('questlog_notdone', 'img/questlog/notDone.png');
    this.load.image('questlog_close', 'img/questlog/sulje.png');    
    this.load.image('polaroid_musiikki', 'img/polaroids/polaroid_musiikki.png');
    this.load.image('polaroid_varoitin', 'img/polaroids/polaroid_halytin.png');
    
    var characterAtlas = "";
    for (var i = 0; i < Config.characters.length; i++) {
      if (Config.characters[i].machineName == Config.gamestates.character) {
        characterAtlas = Config.characters[i].spriteAtlas;
      }
    }
    
    for (var i = 0; i < Config.spriteAtlases[0].length; i++) {
      // Load all but player character atlas normally because that's created dynamically
     //if (Config.spriteAtlases[0][i][0] != characterAtlas) {
        this.load.atlasJSONArray(Config.spriteAtlases[0][i][0], Config.spriteAtlases[0][i][1], Config.spriteAtlases[0][i][2]);
     /*}
     else {
       this.load.json('characterJSON', Config.spriteAtlases[0][i][2]);
     }*/
    }
	  
    // Custom atlases
    this.load.atlasJSONArray('sayerAtlas', 'img/faces.png', 'img/faces.json');
    //this.load.json('sayersJSON', 'img/faces.json');
    
    // Prepare icons array
    var scope = this;
    $.getJSON('img/general/mainMenu.json', function(inventoryJson) {
      var helper = [];
      for (var item in inventoryJson.frames) {
        if (inventoryJson.frames[item].filename.indexOf("Icon") != -1) {
          helper.push(inventoryJson.frames[item].filename);
        }
      }
      scope.game.icons = helper;
    });
    
    // Load all the rooms
    this.game.rooms = this.getRooms();
    this.game.dialogueArray = this.getDialogueArray();
    var index;
    
    this.audioKeys = []; // Array containing all audios needed to decode before continuing
    var loadedMusics = [];
    
    for (var i = 0; i < this.game.rooms.length; i++) {
      // Background image loading/preparing
      this.load.image('bg_' + this.game.rooms[i].name, this.game.rooms[i].bgImage);
      var assets = this.getAssets();
      // Items are needed for arrangeRoomItems function to work
      this.game.rooms[i].items = jQuery.extend(true, [], this.game.rooms[i].assets);
      // Music file loading/preparing
      if (this.game.rooms[i].music != null && this.game.rooms[i].music != "") {
        if (loadedMusics.indexOf('music_' + this.game.rooms[i].music) == -1) {
          //console.log("load music: " + this.game.rooms[i].music);
          // Firefox doesn't support mp3 files, so use ogg
          if (this.game.device.firefox){ // .ogg
            this.load.audio('music_' + this.game.rooms[i].music, ['sounds/music/' + this.game.rooms[i].music + '.ogg']);
          }
          else if (this.game.device.ie){ // .mp3
            this.load.audio('music_' + this.game.rooms[i].music, ['sounds/music/' + this.game.rooms[i].music + '.mp3']);
          }
          else {
            this.load.audio('music_' + this.game.rooms[i].music, ['sounds/music/' + this.game.rooms[i].music + '.mp3', 'sounds/music/' + this.game.rooms[i].music + '.ogg']);
          }
          //this.load.audio('music_' + this.game.rooms[i].music, ['sounds/music/' + this.game.rooms[i].music + '.mp3', 'sounds/music/' + this.game.rooms[i].music + '.ogg']);
          loadedMusics.push('music_' + this.game.rooms[i].music);
          this.audioKeys.push('music_' + this.game.rooms[i].music);
        }
      }
      
      this.game.rooms[i].originalAssets = [];
      this.game.rooms[i].originalNpcs = [];
    
      // Put assets and npc's in the rooms where they belong ready for further use
      for (var j = 0; j < assets.length; j++) {
        if (jQuery.inArray(assets[j].name, this.game.rooms[i].assets) >= 0) {
          index = jQuery.inArray(assets[j].name, this.game.rooms[i].assets); // Get the index of the asset name in the room
          this.game.rooms[i].assets[index] = jQuery.extend(true, {}, assets[j]); // Replace the name in the room with the actual asset
          this.game.rooms[i].originalAssets[index] = jQuery.extend(true, {}, assets[j]); // Save originals for restarting the game
        }
      }
      
      var npcs = this.getNpcs();
      this.game.npcs = {};
      for (var j = 0; j < npcs.length; j++) {
        this.game.npcs[npcs[j].machineName] = jQuery.extend(true, {}, npcs[j]); // Copy npc to npc array
        if (jQuery.inArray(npcs[j].machineName, this.game.rooms[i].npcs) >= 0) {
          index = jQuery.inArray(npcs[j].machineName, this.game.rooms[i].npcs); // Get the index of the npc name in the room
          this.game.rooms[i].npcs[index] = jQuery.extend(true, {}, npcs[j]); // Replace the name in the room with the actual npc
          this.game.rooms[i].originalNpcs[index] = jQuery.extend(true, {}, npcs[j]); // Save originals for restarting the game
        }
        if (jQuery.inArray('npc_'+npcs[j].machineName, this.game.rooms[i].assets) >= 0) {
          npcName = 'npc_'+npcs[j].machineName;
          index = jQuery.inArray(npcName, this.game.rooms[i].assets); // Get the index of the npc name in the room
          this.game.rooms[i].assets[index] = jQuery.extend(true, {}, npcs[j]); // Replace the name in the room with the actual npc
          this.game.rooms[i].originalAssets[index] = jQuery.extend(true, {}, npcs[j]); // Save originals for restarting the game
        }
      }
    }

    // Audio
    // Load rest of the music
    if (Config.sounds.music) {
      for (var i = 0; i < Config.sounds.music.length; i++) {
        if (loadedMusics.indexOf('music_' + Config.sounds.music[i]) == -1) {
          //console.log("load music: " + Config.sounds.music[i]);
          // Firefox doesn't support mp3 files, so use ogg
          if (this.game.device.firefox){ // .ogg
            this.load.audio('music_' + Config.sounds.music[i], ['sounds/music/' +  Config.sounds.music[i] + '.ogg']);
          }
          else if (this.game.device.ie){ // .mp3
            this.load.audio('music_' + Config.sounds.music[i], ['sounds/music/' +  Config.sounds.music[i] + '.mp3']);
          }
          else {
            this.load.audio('music_' + Config.sounds.music[i], ['sounds/music/' +  Config.sounds.music[i] + '.mp3', 'sounds/music/' +  Config.sounds.music[i] + '.ogg']);
          }
          //this.load.audio('music_' + Config.sounds.music[i], ['sounds/music/' +  Config.sounds.music[i] + '.mp3', 'sounds/music/' +  Config.sounds.music[i] + '.ogg']);
          loadedMusics.push('music_' + Config.sounds.music[i]);
          this.audioKeys.push('music_' + Config.sounds.music[i]);
        }
      }
    }
    // TODO: Audio sprites and more clever and IE-compatible handling of these
    this.game.sounds = {"audio":{},"audiosprite":{}};
    if (this.game.device.desktop /*&& Config.sounds.general != undefined*/) {
		
      // Load from Config.sounds
      //console.log(this.game.device);
      // CHROME IF
      //if (this.game.device.chrome && !this.game.device.mspointer) {
        for (var i = 0; i < Config.sounds.general[0].length; i++) {
          if (this.game.device.chrome){
            this.load.audio(Config.sounds.general[0][i][0], Config.sounds.general[0][i][1]);
          }
          else if (this.game.device.firefox){ // .ogg
            var soundIndex = 0;
            if (Config.sounds.general[0][i][1][0].indexOf(".ogg") === -1) soundIndex = 1;
            this.load.audio(Config.sounds.general[0][i][0], Config.sounds.general[0][i][1][soundIndex]);
          }
          else if (this.game.device.ie){ // .mp3
            var soundIndex = 0;
            if (Config.sounds.general[0][i][1][0].indexOf(".mp3") === -1) soundIndex = 1;
            this.load.audio(Config.sounds.general[0][i][0], Config.sounds.general[0][i][1][soundIndex]);
          }                            
          this.game.sounds.audio[Config.sounds.general[0][i][0]] = null;
          this.audioKeys.push(Config.sounds.general[0][i][0]);
        }
      //}
      
      
      for (var i = 0; i < Config.sounds.audioSprites[0].length; i++) {
        //this.load.audiosprite(key, urls, jsonURL, jsonData, autoDecode) 
        
        if (this.game.device.chrome){
          this.load.audiosprite(Config.sounds.audioSprites[0][i][0], Config.sounds.audioSprites[0][i][1], Config.sounds.audioSprites[0][i][2]);
        }
        else if (this.game.device.firefox){ // .ogg
          var soundIndex = 0;
          if (Config.sounds.audioSprites[0][i][1][0].indexOf(".ogg") === -1) soundIndex = 1;
          this.load.audiosprite(Config.sounds.audioSprites[0][i][0], Config.sounds.audioSprites[0][i][1][soundIndex], Config.sounds.audioSprites[0][i][2]);
        }
        else if (this.game.device.ie){ // .mp3
          var soundIndex = 0;
          if (Config.sounds.audioSprites[0][i][1][0].indexOf(".mp3") === -1) soundIndex = 1;
          this.load.audiosprite(Config.sounds.audioSprites[0][i][0], Config.sounds.audioSprites[0][i][1][soundIndex], Config.sounds.audioSprites[0][i][2]);
        }
        else {
          this.load.audiosprite(Config.sounds.audioSprites[0][i][0], Config.sounds.audioSprites[0][i][1], Config.sounds.audioSprites[0][i][2]);
        }
        //this.load.audiosprite(Config.sounds.audioSprites[0][i][0], Config.sounds.audioSprites[0][i][1], Config.sounds.audioSprites[0][i][2]);
        this.game.sounds.audiosprite[Config.sounds.audioSprites[0][i][0]] = null;
        this.audioKeys.push(Config.sounds.audioSprites[0][i][0]);
      }
    }
    
    this.game.buttons = [];
    this.game.activeButton = null;
    
    // Fade menu in
    /*this.fadeplate = this.game.add.sprite(0, 0, 'fadeplate');
    this.fadeplate.anchor.setTo(0, 0);
    this.fadeplate.alpha = 1; // Starts as black screen, invisible always except in the start
    this.fadeplate.fixedToCamera = true;
    tween = this.game.add.tween(this.fadeplate).to({alpha: 0}, 1000, Phaser.Easing.Linear.None, true);*/
	},

  // Show the preloader bar and then start the main menu
	create: function () {
    //this.sound.setDecodedCallback(this.audioKeys, callback, this); // setDecodedCallback is in later Phaser versions
    this.audiosDecoded = false;
		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;
    //this.state.start('MainMenu');
	},
  
update: function () {
    /*if (this.audiosDecoded != undefined && !this.audiosDecoded) {
      var audiosReady = true;
      for (var i = 0; i < this.audioKeys.length; i++) {
        if (!this.cache.isSoundDecoded(this.audioKeys[i])) {
          audiosReady = false;
          break;
        }
      }
      if (audiosReady) {*/
        this.state.start('MainMenu');
        
        
        /*this.menu_bg.destroy();
        this.menu_bg = undefined;
        this.gameTitle.destroy();
        this.gameTitle = undefined;
        this.preloadBar.destroy();
        this.preloadBar = undefined;
        this.preloadBarBg.destroy();
        this.preloadBarBg = undefined;*/
        
        
     // }
    //}
    
    /*if (this.cache.isSoundDecoded("music_nopeafunkihtava1")) {
      this.state.start('MainMenu');
    }*/
    /*if (this.cache.isSoundDecoded('dialogs')) {
   // now you can safely change state and music will play instantly on desktop (mobile still requires a touch unlock though)
      this.state.start('MainMenu');
  }
    else {
      this.game.debug.text("Decoding sound files...", this.game.width/2 - 120*this.scaleFactor, 440 * this.scaleFactor);
    }*/
  },
  
  // An array of all the rooms and their settings in the game
  getRooms: function() {
    // From Config.rooms
    this.rooms = Config.rooms;
    return this.rooms;
  },
  
  // Predefined action chains to be done at various events
  getActions: function (actionName) {

    this.actions = Config.actions;
	
    if (jQuery.type(actionName) === 'string') {
      return this.actions[actionName];
    }
    else if (jQuery.type(actionName) === 'array') {
      var handle = [];
      for (var i = 0; i < actionName.length; i++) {
        for (var j = 0; j < this.actions[actionName[i]].length; j++) {
          handle.push(this.actions[actionName[i]][j]);
        }
      }
      return handle;
    }
  },
  
  // An array of all the available assets and their settings in the game
  getAssets: function() {
    
    this.assets = Config.assets;
    return this.assets;
  },
  
  getNpcs: function() {
    this.npcs = Config.characters;
    return this.npcs;
  },
  
  getDialogueArray: function () {
    dialogueArray = Config.dialogs;
	
    return dialogueArray;
  },
};