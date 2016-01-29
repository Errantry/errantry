Game = {};

Game.Boot = function (game) {

};

Game.Boot.prototype = {
	
  // Load the assets which are needed in the preloader view
	preload: function () {
    
    this.enableScaling();
    //init mt helper
		//ME:mt.init(this.game);
		//set background color - true (set also to document.body)
		//ME:mt.setBackgroundColor(true);
		// load assets for the Loading group ( if exists )
		//mt.loadGroup("Loading");

		//	Here we load the assets required for our preloader (in this case a background and a loading bar)
		this.load.image('menu_bg', 'img/general/menu_bg.png');
    this.load.image('mainMenu_bg', 'img/mainMenu_bg.png');
    this.load.atlasJSONArray('menuAtlas', 'img/general/gui.png', 'img/general/gui.json');
    this.load.atlasJSONArray('menuAtlas2', 'img/general/mainMenu.png', 'img/general/mainMenu.json');
    this.load.atlasJSONArray('menuAtlas3', 'img/mainMenu3.png', 'img/mainMenu3.json');  
	},

  // Define basic settings for the game
	create: function () {
    
    // Hack to have fonts available on first time they're used (http://www.html5gamedevs.com/topic/6104-custom-font-works-oddly-with-gameaddtext/)
    this.game.add.text(-100, 0, "fix", {font:"1px opendyslexicregular", fill:"#FFFFFF"});
    this.game.add.text(-100, 0, "fix", {font:"1px felt_tip_womanregular", fill:"#FFFFFF"});
    this.game.add.text(-100, 0, "fix", {font:"1px troikaregular", fill:"#FFFFFF"});
    this.game.add.text(-100, 0, "fix", {font:"1px league_gothicregular", fill:"#FFFFFF"});
    

		// Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
		this.input.maxPointers = 1;

		// Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
		this.stage.disableVisibilityChange = true;
    
    this.stage.backgroundColor = '#000';
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    
    /*if (this.game.device.desktop) {
      var width = 1280;
      var height = 720;
      this.game.width = width;
      this.game.height = height;
      this.game.camera.setSize(width, height);
      if (this.game.renderType === 1) {
        this.game.renderer.resize(width, height);
        Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
      }
      this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
      this.scale.refresh();
    }
    else { // Mobile settings
      /*var width = $(window).width();
      var height = $(window).height();
      this.game.width = width;
      this.game.height = height;*/
      
      /*this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
      this.scale.setMinMax(480, 260, 1280, 720);
      /*this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.setResizeCallback(this.gameResized, this);*/
      
      //this.scale.forceOrientation(true, false);
      //this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
      //this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
      //this.scale.setScreenSize(true);
      //this.scale.refresh();
    //}

	  //	By this point the preloader assets have loaded to the cache, we've set the game settings
	  //	So now let's start the real preloader going
    this.state.start('Preloader');
	},
  
  enableScaling: function(){
		var game = this.game;
		game.scale.parentIsWindow = (game.canvas.parentNode == document.body);
		//MT:game.scale.scaleMode = Phaser.ScaleManager[mt.data.map.scaleMode];
	},
  
  // Mobile settings for when the orientation changes
  gameResized: function (width, height) {

    //  This could be handy if you need to do any extra processing if the game resizes.
    //  A resize could happen if for example swapping orientation on a device or resizing the browser window.
    //  Note that this callback is only really useful if you use a ScaleMode of RESIZE and place it inside your main game state.
    
    /*this.game.width = newWidth;
    this.game.height = newHeight;
    this.game.camera.setSize(newWidth, newHeight);*/
    
    var newWidth = $(window).width();
    var newHeight = $(window).height();
    this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    this.scale.setMinMax(480, 260, 1280, 720);
    
    if (this.game.renderType === 1) {
      this.game.renderer.resize(newWidth, newHeight);
      Phaser.Canvas.setSmoothingEnabled(this.game.context, false);
    }
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    this.scale.refresh();

  },

  enterIncorrectOrientation: function () {

    Game.orientated = false;
    document.getElementById('orientation').style.display = 'block';

  },

  leaveIncorrectOrientation: function () {

    Game.orientated = true;
    document.getElementById('orientation').style.display = 'none';

  }

};