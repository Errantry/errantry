
Game.MainMenu = function (game) {
	this.readyToGo = false;
	this.game = game;
};

Game.MainMenu.prototype = {
	// Create buttons for the menu
	create: function () {
    console.log(this.game.device);
    
    this.objects = [];
    // Character is created based on these
    this.currentCharacterValues = {
      gender: "male",
      shirtType: 1,
      noseType: 2,
      hairType: 1,
      skinColor: 1,
      pantsColor: 1,
      shirtColor: 1,
      hairColor: 1,
      wheelchairColor: 1
    };
    // Available choices for character creator
    this.characterItems = {
      male: {
        shirtType: [1, 2, 3, 4],
        hairType: [1, 2, 3, 4, 5],
        noseType: [1, 2, 3, 4, 5],
        skinColor: [1, 2, 3, 4, 5],
        pantsColor: [1, 2, 3, 4, 5],
        shirtColor: [1, 2, 3, 4, 5],
        hairColor: [1, 2, 3, 4, 5],
        wheelchairColor: [1, 2, 3, 4, 5]
      },
      female: {
        shirtType: [1, 2, 3, 4],
        hairType: [1, 2, 3, 4, 5],
        noseType: [1, 2, 3, 4, 5],
        skinColor: [1, 2, 3, 4, 5],
        pantsColor: [1, 2, 3, 4, 5],
        shirtColor: [1, 2, 3, 4, 5],
        hairColor: [1, 2, 3, 4, 5],
        wheelchairColor: [1, 2, 3, 4, 5]
      }
    };
    // This is also drawing order
    this.characterParts = {
      male: ['hairBack', 'rearArm', 'rearSleeve', 'backWheelchair', 'shoes', 'legs', 'torso', 'neck', 'shirtLong', 'frontWheelchair', 'frontArm', 'frontSleeve', 'face', 'nose', 'hair'],
      female: ['hairBack', 'rearArm', 'rearSleeve', 'backWheelchair', 'shoes', 'legs', 'torso', 'neck', 'shirtLong', 'frontWheelchair', 'frontArm', 'frontSleeve', 'face', 'nose', 'hair']
    }
    this.previewAtlases = {male: [], female: []};
    
    // Add audios to game
    for (var audio in this.game.sounds.audio) {
      this.game.sounds.audio[audio] = this.game.add.audio(audio);
    }
    for (var audiosprite in this.game.sounds.audiosprite) {
      this.game.sounds.audiosprite[audiosprite] = this.game.add.audioSprite(audiosprite);
    }
    
    // Default sound settings
    this.game.musicEnabled = true;
    this.game.fxEnabled = true;
    this.game.speechEnabled = true;
    this.game.fullscreenEnabled = false;
    
    // Set music and fx to false when not using web audio
    /*if (!this.sound.usingWebAudio) {
      this.game.speechEnabled = false;
      this.game.musicEnabled = false;
    }*/
    // Check if device supports fullscreen
    if (!this.game.device.fullscreen) this.game.fullscreenEnabled = false;
    
    if (this.readyToGo == true) {
      this.readyToGo = false;
    }
    this.game.characterGender = 'male';
    /*
    this.game.k_102_olet.volume = 1;
    if (this.game.k_102_olet.isPlaying) { // Purkka
      this.game.k_102_olet.stop();
    }
    */
    
    /*if (Config.gamestates.character == undefined) {
      this.defaultCharacter = Config.characters[0];
    }
    else {
      for (var i = 0; i < Config.characters.length; i++) {
        if (Config.characters[i].machineName == Config.gamestates.character) {
          this.defaultCharacter = Config.characters[i];
          break;
        }
      }
    }*/
    
    this.game.musicEnabled = (this.game.musicEnabled === false) ? false : true;
    this.game.fxEnabled = (this.game.fxEnabled === false) ? false : true;
    this.game.speechEnabled = (this.game.speechEnabled === false) ? false : true;
    this.game.fullscreenEnabled = (this.game.fullscreenEnabled === false) ? false : false;
    
    this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    var centerPoint = this.game.width * 0.5;
    
    // Add background and titles
    this.menu_bg = this.game.add.image(0, 0, 'menu_bg');
    this.menu_bg2 = this.game.add.image(0, 0, 'mainMenu_bg');
    this.fadeplate = this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'fadeplate');
    this.fadeplate.alpha = 0;
    /*
    this.gameTitle = this.game.add.image(centerPoint, 100, 'menuAtlas');
    this.gameTitle.frameName = 'logo';
    this.gameTitle.anchor.setTo(0.5, 0);
    */
    // Add main buttons
    this.firstStartButton = this.game.add.button(centerPoint, 467, 'menuAtlas3',  this.startGame, this, 'mainMenu_uusiPeli_active', 'mainMenu_uusiPeli', 'mainMenu_uusiPeli_active', 'mainMenu_uusiPeli');
    this.firstStartButton.anchor.setTo(0.5, 0);
    this.objects.push('firstStartButton');
    //this.firstStartButton.setOverSound(this.game.audio1);
    
    this.resumeButton = this.game.add.button(centerPoint, 360, 'menuAtlas3',  this.resumeGame, this, 'mainMenu_jatka_active', 'mainMenu_jatka', 'mainMenu_jatka_active', 'mainMenu_jatka');
    this.resumeButton.anchor.setTo(0.5, 0);
    if (window.localStorage.gamestate == undefined || window.localStorage.gamestate.length == 0) {
      console.log('juu');
      this.resumeButton.input.enabled = false;
      this.resumeButton.alpha = 0.5;
    }
    this.objects.push('resumeButton');
    
    this.settingsButton = this.game.add.button(centerPoint, 575, 'menuAtlas3', this.enableSettingsMenu, this, 'mainMenu_asetukset_active', 'mainMenu_asetukset', 'mainMenu_asetukset_active', 'mainMenu_asetukset');
    this.settingsButton.anchor.setTo(0.5, 0);
    //this.settingsButton.setOverSound(this.game.audio2);
    this.objects.push('settingsButton');
    
    // Settings stuff. All are invisible in the beginning.
    this.headerTextstyle = { font: "102px league_gothicregular", fill: "#3f3f3f" };
    this.subheaderTextstyle = { font: "52px league_gothicregular", fill: "#000" };
    
    this.settingsTitle = this.game.add.text(centerPoint, 50, 'ASETUKSET', this.headerTextstyle);
    this.settingsTitle.anchor.setTo(0.5, 0);
    this.settingsTitle.alpha = 0;
    this.objects.push('settingsTitle');
    
    this.speechTitle = this.game.add.text(centerPoint, 200, 'Puheäänet', this.subheaderTextstyle);
    this.speechTitle.anchor.setTo(1, 0.5);
    this.speechTitle.alpha = 0;
    this.objects.push('speechTitle');
    
    var defaultFrame = (this.game.speechEnabled) ? 'onBtn' : 'offBtn';
    var otherFrame = (this.game.speechEnabled) ? 'offBtn' : 'onBtn';
    this.speechButton = this.game.add.button(centerPoint + 30, 200, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
    this.speechButton.name = 'speech';
    this.speechButton.anchor.setTo(0, 0.5);
    this.speechButton.alpha = 0;
    this.speechButton.input.enabled = false;
    this.objects.push('speechButton');
    
    defaultFrame = (this.game.fxEnabled) ? 'onBtn' : 'offBtn';
    otherFrame = (this.game.fxEnabled) ? 'offBtn' : 'onBtn';
    this.fxTitle = this.game.add.text(centerPoint, 280, 'Ääniefektit', this.subheaderTextstyle);
    this.fxTitle.anchor.setTo(1, 0.5);
    this.fxTitle.alpha = 0;
    this.fxButton = this.game.add.button(centerPoint + 30, 280, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
    this.fxButton.name = 'fx';
    this.fxButton.anchor.setTo(0, 0.5);
    this.fxButton.alpha = 0;
    this.fxButton.input.enabled = false;
    this.objects.push('fxButton');
    
    defaultFrame = (this.game.musicEnabled) ? 'onBtn' : 'offBtn';
    otherFrame = (this.game.musicEnabled) ? 'offBtn' : 'onBtn';
    this.musicTitle = this.game.add.text(centerPoint, 360, 'Musiikki', this.subheaderTextstyle);
    this.musicTitle.anchor.setTo(1, 0.5);
    this.musicTitle.alpha = 0;
    this.musicButton = this.game.add.button(centerPoint + 30, 360, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
    this.musicButton.name = 'music';
    this.musicButton.anchor.setTo(0, 0.5);
    this.musicButton.alpha = 0;
    this.musicButton.input.enabled = false;
    this.objects.push('musicButton');
    
    defaultFrame = (this.game.fullscreenEnabled) ? 'onBtn' : 'offBtn';
    otherFrame = (this.game.fullscreenEnabled) ? 'offBtn' : 'onBtn';
    this.fullscreenTitle = this.game.add.text(centerPoint, 440, 'Koko ruudun tila', this.subheaderTextstyle);
    this.fullscreenTitle.anchor.setTo(1, 0.5);
    this.fullscreenTitle.alpha = 0;
    this.fullscreenButton = this.game.add.button(centerPoint + 30, 440, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
    this.fullscreenButton.name = 'fullscreen';
    this.fullscreenButton.anchor.setTo(0, 0.5);
    this.fullscreenButton.alpha = 0;
    this.fullscreenButton.input.enabled = false;
    this.objects.push('fullscreenButton');
    
    this.mainMenuButton = this.game.add.button(centerPoint, 640, 'menuAtlas', this.enableMainMenu, this, 'takaisinBtn_hover', 'takaisinBtn', 'takaisinBtn_hover');
    this.mainMenuButton.anchor.setTo(0.5, 1);
    this.mainMenuButton.input.enabled = false;
    this.mainMenuButton.alpha = 0;
    this.objects.push('mainMenuButton');
    
    // Player name
    this.nameTitle = this.game.add.text(centerPoint, 30, 'ANNA HAHMOLLESI NIMI', this.headerTextstyle);
    this.nameTitle.anchor.setTo(0.5, 0);
    this.nameTitle.alpha = 0;
    this.objects.push('nameTitle');
    
    this.nameInputBg = this.game.add.image(centerPoint, 230, 'menuAtlas2', 'nimi_tekstibox');
    this.nameInputBg.anchor.setTo(0.5, 0);
    this.nameInputBg.alpha = 0;
    this.objects.push('nameInputBg');
    
    this.startButton = this.game.add.button(centerPoint, 430, 'menuAtlas2', this.startGame, this, 'nimi_aloita', 'nimi_aloita', 'nimi_aloita', 'nimi_aloita');
    this.startButton.anchor.setTo(0.5, 0);
    this.startButton.input.enabled = false;
    this.startButton.alpha = 0;
    
    this.backButton = this.game.add.button(centerPoint, 540, 'menuAtlas2', this.backToCharacter, this, 'nimi_takaisin', 'nimi_takaisin', 'nimi_takaisin', 'nimi_takaisin');
    this.backButton.anchor.setTo(0.5, 0);
    this.backButton.input.enabled = false;
    this.backButton.alpha = 0;
    
    
    this.nameInput = $('<input placeholder="Nimesi" type="text" value="" id="playerNameInput" maxlength="13" />').appendTo("body");
    this.nameInput.hide();
    
    var leftOffset = Math.floor($(window).width()/2 - 490/2);
    this.nameInput.css('left', leftOffset);
    this.nameInput.data("object", this);
    this.nameInput.on('input', this.nameInputChanged);
    //this.characterTitle = this.game.add.text(centerPoint, 50, 'Valitse hahmo', this.headerTextstyle);
    this.characterTitle = this.game.add.text(centerPoint, 30, 'LUO HAHMO', this.headerTextstyle);
    this.characterTitle.anchor.setTo(0.5, 0);
    this.characterTitle.alpha = 0;
    this.objects.push('characterTitle');
    
    /*this.characterButton = this.game.add.button(centerPoint, 120, 'menuAtlas', this.characterOnOffSwitch, this, 'hahmo', 'hahmo', 'hahmo_valittu');
    this.characterButton.anchor.setTo(0.5, 0);
    this.characterButton.input.enabled = false;
    this.characterButton.alpha = 0;*/
    
    // Character creator
    this.characterGroup = this.game.add.group();
    this.characterButtons = this.game.add.group();
    this.colorActiveBgs = this.game.add.group();
    this.colorButtons = this.game.add.group();
    this.characterTitles = this.game.add.group();
    this.colorTitles = this.game.add.group();
    
    var titlesInitialLocationX = 282;
    var titlesInitialLocationY = 212;
    var arrowLeftInitialLocationX = 379;
    var arrowLeftInitialLocationY = 212;
    var arrowRightInitialLocationX = 152;
    var arrowRightInitialLocationY = 212;
    var titlesPadding = 94;
    var arrows = ['hahmonluonti_sukupuoli_miinus', 'hahmonluonti_sukupuoli_miinus', 'hahmonluonti_sukupuoli_miinus', 'hahmonluonti_sukupuoli_miinus'];
    
    this.genderTitle = this.game.add.text(titlesInitialLocationX, titlesInitialLocationY, 'MIES', { font: "70px league_gothicregular", fill: "#3f3f3f" });
    this.characterTitles.add(this.genderTitle);
    this.genderTitle.anchor.setTo(0.5, 0);
    this.genderNext = this.game.add.image(arrowLeftInitialLocationX, arrowLeftInitialLocationY, 'menuAtlas2', 'hahmonluonti_sukupuoli_plus');
    this.genderNext.itemName = "gender";
    this.genderNext.titleText = "MIES";
    this.genderNext.inputEnabled = true;
    this.genderNext.events.onInputDown.add(this.nextItem, this);
    this.characterButtons.add(this.genderNext);
    this.genderPrev = this.game.add.image(arrowRightInitialLocationX, arrowRightInitialLocationY, 'menuAtlas2', 'hahmonluonti_sukupuoli_miinus');
    this.genderPrev.itemName = "gender";
    this.genderPrev.titleText = "MIES";
    this.genderPrev.inputEnabled = true;
    this.genderPrev.events.onInputDown.add(this.prevItem, this);
    this.characterButtons.add(this.genderPrev);

    this.hairTitle = this.game.add.text(titlesInitialLocationX, titlesInitialLocationY+titlesPadding, 'HIUSTYYLI', { font: "70px league_gothicregular", fill: "#3f3f3f" });
    this.characterTitles.add(this.hairTitle);
    this.hairTitle.anchor.setTo(0.5, 0);
    this.hairNext = this.game.add.image(arrowLeftInitialLocationX, arrowLeftInitialLocationY+titlesPadding, 'menuAtlas2', 'hahmonluonti_sukupuoli_plus');
    this.hairNext.itemName = "hairType";
    this.hairNext.titleText = "Hiukset";
    this.hairNext.inputEnabled = true;
    this.hairNext.events.onInputDown.add(this.nextItem, this);
    this.characterButtons.add(this.hairNext);
    this.hairPrev = this.game.add.image(arrowRightInitialLocationX, arrowRightInitialLocationY+titlesPadding, 'menuAtlas2', 'hahmonluonti_sukupuoli_miinus');    
    this.hairPrev.itemName = "hairType";
    this.hairPrev.titleText = "Hiukset";
    this.hairPrev.inputEnabled = true;
    this.hairPrev.events.onInputDown.add(this.prevItem, this);
    this.characterButtons.add(this.hairPrev);

    this.noseTitle = this.game.add.text(titlesInitialLocationX, titlesInitialLocationY+(titlesPadding*2), 'NENÄN TYYPPI', { font: "70px league_gothicregular", fill: "#3f3f3f" });
    this.characterTitles.add(this.noseTitle);
    this.noseTitle.anchor.setTo(0.5, 0);
    this.noseNext = this.game.add.image(arrowLeftInitialLocationX, arrowLeftInitialLocationY+(titlesPadding*2), 'menuAtlas2', 'hahmonluonti_sukupuoli_plus');
    this.noseNext.itemName = "noseType";
    this.noseNext.titleText = "NENÄN TYYPPI";
    this.noseNext.inputEnabled = true;
    this.noseNext.events.onInputDown.add(this.nextItem, this);
    this.characterButtons.add(this.noseNext);
    this.nosePrev = this.game.add.image(arrowRightInitialLocationX, arrowRightInitialLocationY+(titlesPadding*2), 'menuAtlas2', 'hahmonluonti_sukupuoli_miinus');    
    this.nosePrev.itemName = "noseType";
    this.nosePrev.titleText = "NENÄN TYYPPI";
    this.nosePrev.inputEnabled = true;
    this.nosePrev.events.onInputDown.add(this.prevItem, this);
    this.characterButtons.add(this.nosePrev);

    this.shirtTitle = this.game.add.text(titlesInitialLocationX, titlesInitialLocationY+(titlesPadding*3), 'PAIDAN TYYLI', { font: "70px league_gothicregular", fill: "#3f3f3f" });
    this.characterTitles.add(this.shirtTitle);
    this.shirtTitle.anchor.setTo(0.5, 0);
    this.shirtNext = this.game.add.image(arrowLeftInitialLocationX, arrowLeftInitialLocationY+(titlesPadding*3), 'menuAtlas2', 'hahmonluonti_sukupuoli_plus');
    this.shirtNext.itemName = "shirtType";
    this.shirtNext.titleText = "Paita";
    this.shirtNext.inputEnabled = true;
    this.shirtNext.events.onInputDown.add(this.nextItem, this);
    this.characterButtons.add(this.shirtNext);
    this.shirtPrev = this.game.add.image(arrowRightInitialLocationX, arrowRightInitialLocationY+(titlesPadding*3), 'menuAtlas2', 'hahmonluonti_sukupuoli_miinus');    
    this.shirtPrev.itemName = "shirtType";
    this.shirtPrev.titleText = "Paita";
    this.shirtPrev.inputEnabled = true;
    this.shirtPrev.events.onInputDown.add(this.prevItem, this);
    this.characterButtons.add(this.shirtPrev);

    var colorRowX = 893;
    var colorRowTop = 62;
    var colorRowY = 90;
    var colorRowPadding = 92;
    var colorRowSeparation = 35;
    var colorBoxSeparation = 45;
    
    this.hairTitle = this.game.add.text((colorRowX*1), colorRowTop + colorRowY, 'HIUSTEN VÄRI', { font: "25px league_gothicregular", fill: "#3f3f3f"});
    this.colorTitles.add(this.hairTitle);
    this.skinTitle = this.game.add.text((colorRowX*1), colorRowTop + (colorRowY*2), 'IHON VÄRI', { font: "25px league_gothicregular", fill: "#3f3f3f"});
    this.colorTitles.add(this.skinTitle);
    this.shirtTitle = this.game.add.text((colorRowX*1), colorRowTop + (colorRowY*3), 'PAIDAN VÄRI', { font: "25px league_gothicregular", fill: "#3f3f3f"});
    this.colorTitles.add(this.shirtTitle);
    this.pantsTitle = this.game.add.text((colorRowX*1), colorRowTop + (colorRowY*4), 'HOUSUJEN VÄRI', { font: "25px league_gothicregular", fill: "#3f3f3f"});
    this.colorTitles.add(this.pantsTitle);
    this.wheelchairTitle = this.game.add.text((colorRowX*1), colorRowTop + (colorRowY*5), 'PYÖRÄTUOLIN VÄRI', { font: "25px league_gothicregular", fill: "#3f3f3f"});
    this.colorTitles.add(this.wheelchairTitle);
    
    var colorItems = ['hair', 'skin', 'shirt', 'pants', 'wheelchair'];
    var colorItemFrames = ['hius', 'iho', 'paita', 'housu', 'pyora'];
    
    for (var j = 0; j < colorItems.length; j++) {
      for (var i = 0; i < 5; i++) {
        this[colorItems[j] + (i+1) + 'colorActive'] = this.game.add.image((colorRowX*1)-4+(colorBoxSeparation*i), colorRowTop + colorRowY * (j + 1) + colorRowSeparation-4, 'menuAtlas2', 'hahmonluonti_hius2_active');
        this[colorItems[j] + (i+1) + 'colorActive'].itemName = colorItems[j] + "Color";
        this[colorItems[j] + (i+1) + 'colorActive'].colorNumber = i + 1;
        this[colorItems[j] + (i+1) + 'colorActive'].alpha = 0;
        this[colorItems[j] + (i+1) + 'color'] = this.game.add.image((colorRowX*1)+(colorBoxSeparation*i), colorRowTop + colorRowY * (j + 1) + colorRowSeparation, 'menuAtlas2', 'hahmonluonti_' + colorItemFrames[j] + (i + 1));
        this[colorItems[j] + (i+1) + 'color'].inputEnabled = true;
        this[colorItems[j] + (i+1) + 'color'].itemName = colorItems[j] + "Color";
        this[colorItems[j] + (i+1) + 'color'].colorNumber = i;
        this[colorItems[j] + (i+1) + 'color'].activeBg = this[colorItems[j] + (i+1) + 'colorActive'];
        this[colorItems[j] + (i+1) + 'color'].events.onInputDown.add(this.colorPicker, this);
        this.colorActiveBgs.add(this[colorItems[j] + (i+1) + 'colorActive']);
        this.colorButtons.add(this[colorItems[j] + (i+1) + 'color']);
      }
    }
    
    this.characterButtons.forEach(function(button) {
      button.scale.x = 1;
      button.scale.y = 1;
      button.angle += 0;
      button.origX = this.copy(button.x);
      button.origY = this.copy(button.y);
      button.origWidth = this.copy(button.width);
      button.origHeight = this.copy(button.height);
      button.input.enabled = false;
      button.alpha = 0;
    }, this);

    this.colorButtons.forEach(function(button) {
      //button.scale.x = 1;
      //button.scale.y = 1;
      button.origX = this.copy(button.x);
      button.origY = this.copy(button.y);
      button.origWidth = this.copy(button.width);
      button.origHeight = this.copy(button.height);
      button.input.enabled = false;
      button.alpha = 0;
    }, this);    

    this.colorActiveBgs.forEach(function(sprite) {
      //sprite.scale.x = 1;
      //sprite.scale.y = 1;
      sprite.origX = this.copy(sprite.x);
      sprite.origY = this.copy(sprite.y);
      sprite.origWidth = this.copy(sprite.width);
      sprite.origHeight = this.copy(sprite.height);
      sprite.alpha = 0;
    }, this);  
    
     this.characterTitles.forEach(function(title) {
      title.alpha = 0;
      title.origX = this.copy(title.x);
      title.origY = this.copy(title.y);
    }, this);

     this.colorTitles.forEach(function(title) {
      title.alpha = 0;
      title.origX = this.copy(title.x);
      title.origY = this.copy(title.y);
    }, this);     
    
    this.continueButton = this.game.add.button(centerPoint + 300, 130, 'menuAtlas2', this.enableNameMenu, this, 'hahmonluonti_jatka', 'hahmonluonti_jatka', 'hahmonluonti_jatka', 'hahmonluonti_jatka');
    this.continueButton.anchor.setTo(0.5, 1);
    this.continueButton.alpha = 0;
    this.continueButton.input.enabled = false;
    this.objects.push('continueButton');
    
    this.backToStartButton = this.game.add.button(centerPoint - 300, 130, 'menuAtlas2', this.backToStart, this, 'hahmonluonti_takaisin_disabled', 'hahmonluonti_takaisin_disabled', 'hahmonluonti_takaisin_disabled', 'hahmonluonti_takaisin_disabled');
    this.backToStartButton.anchor.setTo(0.5, 1);
    this.backToStartButton.alpha = 0;
    this.backToStartButton.input.enabled = false;
    this.objects.push('backToStartButton');
    
    this.loadingIcon = this.game.add.image(centerPoint, this.game.height * 0.5, 'menuAtlas');
    this.loadingIcon.anchor.setTo(0.5, 0.5);
    this.loadingIcon.frameName = 'standby';
    this.loadingIcon.alpha = 0;
	

	this.game.menuCreated = true;
	this.resizeMenu(this.game.width, this.game.height);
  
  
  $(document).on('keydown', function(event) {
    var key = event.which || event.keyCode;
    if (key == 13) { // enter
			$("#playerNameInput").blur();
    }
  });
  
    //this.playMusic('nopeafunkihtava1');
	},
 
  resizeMenu: function(width, height) {
    
	this.origWidth = 1280;
	this.origHeight = 720;
	if (height > this.origHeight) {
		height = this.origHeight;
	}
	
	this.scaleFactor = height/this.origHeight;
	this.scale.scaleMode = Phaser.ScaleManager.RESIZE;
	this.scale.refresh();
	this.game.width = this.origWidth * this.scaleFactor;
	this.game.height = this.origHeight * this.scaleFactor;
	$("#gameContainer").width(this.game.width);
	$("#gameContainer").height(this.game.height);
	this.camera.setSize(this.game.width, this.game.height);
	this.world.setBounds(0, 0, this.game.width, this.game.height);
	this.game.renderer.resize(this.game.width, this.game.height);
  
  this.headerTextstyle = { font: Math.floor(102 * this.scaleFactor) + "px league_gothicregular", fill: "#3f3f3f" };
  this.subheaderTextstyle = { font: Math.floor(52 * this.scaleFactor) + "px league_gothicregular", fill: "#000" };
	
	var centerPoint = this.game.width * 0.5;
	this.menu_bg.width = Math.floor(1280 * this.scaleFactor);
	this.menu_bg.height =  Math.floor(720 * this.scaleFactor);
  this.menu_bg2.width = Math.floor(1280 * this.scaleFactor);
	this.menu_bg2.height =  Math.floor(720 * this.scaleFactor);
	this.fadeplate.width = this.game.width;
	this.fadeplate.height = this.game.height;
	/*
	this.gameTitle.x = centerPoint;
	this.gameTitle.y = 100 * this.scaleFactor;
	this.gameTitle.width = 667 * this.scaleFactor;
	this.gameTitle.height = 177 * this.scaleFactor;
	*/
	this.firstStartButton.x = centerPoint;
	this.firstStartButton.y = 467 * this.scaleFactor;
	this.firstStartButton.width = 428 * this.scaleFactor;
	this.firstStartButton.height = 94 * this.scaleFactor;
  
  this.resumeButton.x = centerPoint;
	this.resumeButton.y = 360 * this.scaleFactor;
	this.resumeButton.width = 428 * this.scaleFactor;
	this.resumeButton.height = 94 * this.scaleFactor;
	
	this.settingsButton.x = centerPoint;
	this.settingsButton.y = 575 * this.scaleFactor;
	this.settingsButton.width = 428 * this.scaleFactor;
	this.settingsButton.height = 94 * this.scaleFactor;
	
	this.settingsTitle.x = centerPoint;
	this.settingsTitle.y = 50 * this.scaleFactor;
	this.settingsTitle.setStyle(this.headerTextstyle);
	this.speechTitle.x = centerPoint;
	this.speechTitle.y = 200 * this.scaleFactor;
  this.speechTitle.setStyle(this.subheaderTextstyle);
	
	this.speechButton.x = centerPoint + (30 * this.scaleFactor);
	this.speechButton.y = 200 * this.scaleFactor;
	this.speechButton.width = 253 * this.scaleFactor;
	this.speechButton.height = 64 * this.scaleFactor;
	
	this.fxTitle.x = centerPoint;
	this.fxTitle.y = 280 * this.scaleFactor;
  this.fxTitle.setStyle(this.subheaderTextstyle);
	
	this.fxButton.x = centerPoint + (30 * this.scaleFactor);
	this.fxButton.y = 280 * this.scaleFactor;
	this.fxButton.width = 253 * this.scaleFactor;
	this.fxButton.height = 64 * this.scaleFactor;
	
	this.musicTitle.x = centerPoint;
	this.musicTitle.y = 360 * this.scaleFactor;
  this.musicTitle.setStyle(this.subheaderTextstyle);
	
	this.musicButton.x = centerPoint + (30 * this.scaleFactor);
	this.musicButton.y = 360 * this.scaleFactor;
	this.musicButton.width = 253 * this.scaleFactor;
	this.musicButton.height = 64 * this.scaleFactor;
	
	this.fullscreenTitle.x = centerPoint;
	this.fullscreenTitle.y = 440 * this.scaleFactor;
  this.fullscreenTitle.setStyle(this.subheaderTextstyle);
	
	this.fullscreenButton.x = centerPoint + (30 * this.scaleFactor);
	this.fullscreenButton.y = 440 * this.scaleFactor;
	this.fullscreenButton.width = 253 * this.scaleFactor;
	this.fullscreenButton.height = 64 * this.scaleFactor;
	
	this.mainMenuButton.x = centerPoint;
	this.mainMenuButton.y = 640 * this.scaleFactor;
	this.mainMenuButton.width = 411 * this.scaleFactor;
	this.mainMenuButton.height = 102 * this.scaleFactor;
  
  this.nameTitle.x = centerPoint;
  this.nameTitle.y = 30 * this.scaleFactor;
  this.nameTitle.setStyle(this.headerTextstyle);
  this.continueButton.x = centerPoint + 300 * this.scaleFactor;
	this.continueButton.y = 130 * this.scaleFactor;
	this.continueButton.width = 209 * this.scaleFactor;
	this.continueButton.height = 94 * this.scaleFactor;
  
  this.backToStartButton.x = centerPoint - 300 * this.scaleFactor;
  this.backToStartButton.y = 130 * this.scaleFactor;
  this.backToStartButton.width = 208 * this.scaleFactor;
	this.backToStartButton.height = 94 * this.scaleFactor;
  
  var leftOffset = Math.floor($(window).width()/2 - (Math.floor(490 * this.scaleFactor)/2));
  this.nameInput.css('left', leftOffset);
  this.nameInput.css('top', Math.floor(280 * this.scaleFactor));
  this.nameInput.css('height', Math.floor(70 * this.scaleFactor));
  this.nameInput.css('line-height', Math.floor(70 * this.scaleFactor) + 'px');
  this.nameInput.css('width', Math.floor(540 * this.scaleFactor));
  this.nameInput.css('font-size', Math.floor(48 * this.scaleFactor));
  
  this.nameInputBg.x = centerPoint;
  this.nameInputBg.y = 230 * this.scaleFactor;
  this.nameInputBg.width = 674 * this.scaleFactor;
	this.nameInputBg.height = 177 * this.scaleFactor;
	
	this.characterTitle.x = centerPoint;
	this.characterTitle.y = 30 * this.scaleFactor;
  this.characterTitle.setStyle(this.headerTextstyle);
	
	this.startButton.x = centerPoint;
	this.startButton.y = 430 * this.scaleFactor;
	this.startButton.width = 270 * this.scaleFactor;
	this.startButton.height = 94 * this.scaleFactor;
  
  this.backButton.x = centerPoint;
  this.backButton.y = 540 * this.scaleFactor;
  this.backButton.width = 160 * this.scaleFactor;
	this.backButton.height = 56 * this.scaleFactor;
	
	this.loadingIcon.x = centerPoint;
	this.loadingIcon.y = this.game.height * 0.5;
	this.loadingIcon.width = this.loadingIcon.height = 240 * this.scaleFactor;
  
   this.characterButtons.forEach(function(button) {
      button.x = button.origX * this.scaleFactor;
      button.y = button.origY * this.scaleFactor;
      button.width = button.origWidth * this.scaleFactor;
      button.height = button.origHeight * this.scaleFactor;
    }, this);

   this.colorButtons.forEach(function(button) {
      button.x = button.origX * this.scaleFactor;
      button.y = button.origY * this.scaleFactor;
      button.width = button.origWidth * this.scaleFactor;
      button.height = button.origHeight * this.scaleFactor;
    }, this);

   this.colorActiveBgs.forEach(function(sprite) {
      sprite.x = sprite.origX * this.scaleFactor;
      sprite.y = sprite.origY * this.scaleFactor;
      sprite.width = sprite.origWidth * this.scaleFactor;
      sprite.height = sprite.origHeight * this.scaleFactor;
    }, this);
    
    this.characterTitles.forEach(function(title) {
      title.x = title.origX * this.scaleFactor;
      title.y = title.origY * this.scaleFactor;
      title.setStyle({ font: Math.floor(42*this.scaleFactor) + "px league_gothicregular", fill: "#3f3f3f"});
    }, this);

    this.colorTitles.forEach(function(title) {
      title.x = title.origX * this.scaleFactor;
      title.y = title.origY * this.scaleFactor;
      title.setStyle({ font: Math.floor(25*this.scaleFactor) + "px league_gothicregular", fill: "#3f3f3f"});
    }, this);    
    
    if (this.playerCharacter) {
      
      this.playerCharacter.x = centerPoint;
      this.playerCharacter.y = this.playerCharacter.origY * this.scaleFactor;
      this.playerCharacter.width = this.playerCharacter.origWidth * this.scaleFactor;
      this.playerCharacter.height = this.playerCharacter.origHeight * this.scaleFactor;
      
      this.positionCharacter();
      /*this.playerCharacter.scale.x = this.playerCharacter.defaultScale * this.scaleFactor;
      this.playerCharacter.scale.y = this.playerCharacter.defaultScale * this.scaleFactor;	
      
      this.playerCharacter.position.x = this.game.width * 0.5;
      this.playerCharacter.position.y = 540 * this.scaleFactor;*/
    }

	},
  
  copy: function(toCopy) {
    return toCopy;
  },
  
  nameInputChanged: function() {

    if ($("#playerNameInput").prop("value").trim() != "") {
      $(this).data("object").startButton.frameName = 'nimi_aloita';
      $(this).data("object").startButton.input.enabled = true;
    }
    else {
      $(this).data("object").startButton.frameName = 'nimi_aloita_disabled';
      $(this).data("object").startButton.input.enabled = false;
    }
  },
  
  playMusic: function(music) {
    
    if (this.game.musicEnabled) { // Play music if enabled
      // Music starting or music enabled from pause menu
      if (this.music == undefined || (!this.music.isPlaying && this.game.musicEnabled)) {
        if (this.music == undefined) {
          this.music = this.game.add.audio('music_' + music);
          this.music.loop = true;
        }
		    this.music.volume = 0;
        this.music.play();
        var musicTween = this.game.add.tween(this.music).to({volume: 0.1}, 500, Phaser.Easing.Linear.None, true);
      }
    }
    // Music disabled from pause menu
    else if (this.music != null && this.music.isPlaying && !this.game.musicEnabled) {
      this.music.stop();
    }
  },
  
  createCharacter: function () {
    
    this.playerCharacter = this.game.add.image(this.game.width * 0.5, 130 * this.scaleFactor, 'characterImage');
    //this.playerCharacter.frameName = 'player_walks_00000';
    this.playerCharacter.origY = 130;
    this.playerCharacter.origWidth = this.playerCharacter.width * 0.9;
    this.playerCharacter.origHeight = this.playerCharacter.height * 0.9;
    this.playerCharacter.width = this.playerCharacter.origWidth * this.scaleFactor;
    this.playerCharacter.height = this.playerCharacter.origHeight * this.scaleFactor;
    this.playerCharacter.anchor.setTo(0.5, 0);
    //this.playerCharacter.alpha = 0;
    this.characterGroup.add(this.playerCharacter);
    this.positionCharacter();
  },
  
  positionCharacter: function() {
    
    var offsetX = 0;
    
    if (this.activeView == "name") {
      offsetX = 295;
    }
    else if (this.activeView == "character") {
      
    }
    this.playerCharacter.x = this.game.width * 0.5 - offsetX * this.scaleFactor;
  },
  
  createCharacterSprite: function(preview) {
    this.partsReady = 0;
    this.playerCharacterReady = false;
    this.previewAtlasesReady = 0;
    this.continueButton.frameName = 'hahmonluonti_jatka_disabled';
    this.continueButton.input.enabled = false;
    this.characterButtons.forEach(function(button) {
      button.input.enabled = false;
    }, this);
    this.colorButtons.forEach(function(button) {
      button.input.enabled = false;
    }, this);
    // No need to execute rest anymore if not preview
    if (!preview) {
      $("#playerCharacterCreator").remove('.tempCanvas');
      this.playerCharacterReady = true;
      if (this.playerCharacter != undefined) this.playerCharacter.alpha = 0;
      return;
    }
    var scope = this;
    var prefix = (this.currentCharacterValues.gender == 'male') ? 'male' : 'woman';
    
    // Define shirt used
    var shirtType = (this.currentCharacterValues.shirtType < 3) ? this.currentCharacterValues.shirtType : (2 - this.currentCharacterValues.shirtType%2);
    
    if (preview) {
      if (this.previewAtlases[this.currentCharacterValues.gender].length == 0) {
        // Load preview atlases
        var i;
        for (i = 0; i < this.characterItems[this.currentCharacterValues.gender].skinColor.length; i++) {
          //var atlasImg = new Image();
          var atlasImg = document.createElement("img");
          atlasImg.onload = function() {
           
           scope.previewAtlases[scope.currentCharacterValues.gender][this.index].img = this;
           
           $.getJSON('img/charCreator/preview/' + prefix + '_color' + (this.index+1) + '.json', (function(index) {
              return function(json) {
                scope.previewAtlases[scope.currentCharacterValues.gender][index].json = json;
                scope.previewAtlasesReady++;
              };
            }(this.index)) // calling the function with the current value
          );
          }
          atlasImg.src = 'img/charCreator/preview/' + prefix + '_color' + (i+1) + '.png';
          atlasImg.index = i;
          atlasImg.origSrc = 'img/charCreator/preview/' + prefix + '_color' + (i+1) + '.png';
          
          scope.previewAtlases[scope.currentCharacterValues.gender].push({img:null, imgSrc: null, json: null});
        }
      }
      else {
        this.previewAtlasesReady = this.previewAtlases[this.currentCharacterValues.gender].length;
      }
      this.loadPreviewAtlasesInterval = setInterval(function() {
        if (scope.previewAtlasesReady == scope.characterItems[scope.currentCharacterValues.gender].skinColor.length) {
          clearInterval(scope.loadPreviewAtlasesInterval);
          scope.createSpritePart('hairBack', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.hairColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.hairColor + '.json', 'hair' + scope.currentCharacterValues.hairType + '_back_00016');
          scope.createSpritePart('rearArm', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' +  scope.currentCharacterValues.skinColor + '.json', 'rearArm' + shirtType + '_00016');
          scope.createSpritePart('rearSleeve', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.json', 'rearSleeve' + shirtType + '_00016');
          scope.createSpritePart('backWheelchair', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.wheelchairColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.wheelchairColor + '.json', 'backWheelchair_00016');
          scope.createSpritePart('shoes', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.json', 'shoes_00016');
          scope.createSpritePart('legs', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.pantsColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.pantsColor + '.json', 'legs_00016');
          scope.createSpritePart('torso', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.json', 'torso_00016');
          scope.createSpritePart('neck', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.json', 'neck_00016');
          scope.createSpritePart('shirtLong', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.json', 'shirtLong_00016');
          scope.createSpritePart('frontWheelchair', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.wheelchairColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.wheelchairColor + '.json', 'frontWheelchair_00016');
          scope.createSpritePart('frontArm', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.json', 'frontArm' + shirtType + '_00016');
          scope.createSpritePart('frontSleeve', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.shirtColor + '.json', 'frontSleeve' + shirtType + '_00016');
          scope.createSpritePart('face', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.json', 'face_00016');
          scope.createSpritePart('nose', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.skinColor + '.json', 'nose' + scope.currentCharacterValues.noseType + '_00016');
          scope.createSpritePart('hair', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.hairColor + '.png', 'img/charCreator/preview/' + prefix + '_color' + scope.currentCharacterValues.hairColor + '.json', 'hair' + scope.currentCharacterValues.hairType + '_00016');
        }
      }, 100);
    }
    else {
      /*
      this.createSpritePart('hairBack', 'img/charCreator/stack_' + prefix + '_hair' + this.currentCharacterValues.hairType + '_back_' + this.currentCharacterValues.hairColor + '.png', 'img/charCreator/stack_' + prefix + '_hair' + this.currentCharacterValues.hairType + '_back_' + this.currentCharacterValues.hairColor + '.json', 'all');
      this.createSpritePart('rearArm', 'img/charCreator/stack_' + prefix + '_rearArm' + shirtType + '_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_rearArm' + shirtType + '_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('rearSleeve', 'img/charCreator/stack_' + prefix + '_rearSleeve' + shirtType + '_' + this.currentCharacterValues.shirtColor + '.png', 'img/charCreator/stack_' + prefix + '_rearSleeve' + shirtType + '_' + this.currentCharacterValues.shirtColor + '.json', 'all');
      this.createSpritePart('backWheelchair', 'img/charCreator/stack_' + prefix + '_backWheelchair_' + this.currentCharacterValues.wheelchairColor + '.png', 'img/charCreator/stack_' + prefix + '_backWheelchair_' + this.currentCharacterValues.wheelchairColor + '.json', 'all');
      this.createSpritePart('shoes', 'img/charCreator/stack_' + prefix + '_shoes_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_shoes_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('legs', 'img/charCreator/stack_' + prefix + '_legs_' + this.currentCharacterValues.pantsColor + '.png', 'img/charCreator/stack_' + prefix + '_legs_' + this.currentCharacterValues.pantsColor + '.json', 'all');
      this.createSpritePart('torso', 'img/charCreator/stack_' + prefix + '_torso_' + this.currentCharacterValues.shirtColor + '.png', 'img/charCreator/stack_' + prefix + '_torso_' + this.currentCharacterValues.shirtColor + '.json', 'all');
      this.createSpritePart('neck', 'img/charCreator/stack_' + prefix + '_neck_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_neck_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('shirtLong', 'img/charCreator/stack_' + prefix + '_shirtLong_' + this.currentCharacterValues.shirtColor + '.png', 'img/charCreator/stack_' + prefix + '_shirtLong_' + this.currentCharacterValues.shirtColor + '.json', 'all');
      this.createSpritePart('frontWheelchair', 'img/charCreator/stack_' + prefix + '_frontWheelchair_' + this.currentCharacterValues.wheelchairColor + '.png', 'img/charCreator/stack_' + prefix + '_frontWheelchair_' + this.currentCharacterValues.wheelchairColor + '.json', 'all');
      this.createSpritePart('frontArm', 'img/charCreator/stack_' + prefix + '_frontArm' + shirtType + '_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_frontArm' + shirtType + '_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('frontSleeve', 'img/charCreator/stack_' + prefix + '_frontSleeve' + shirtType + '_' + this.currentCharacterValues.shirtColor + '.png', 'img/charCreator/stack_' + prefix + '_frontSleeve' + shirtType + '_' + this.currentCharacterValues.shirtColor + '.json', 'all');
      this.createSpritePart('face', 'img/charCreator/stack_' + prefix + '_face_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_face_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('nose', 'img/charCreator/stack_' + prefix + '_nose' + this.currentCharacterValues.noseType + '_' + this.currentCharacterValues.skinColor + '.png', 'img/charCreator/stack_' + prefix + '_nose' + this.currentCharacterValues.noseType + '_' + this.currentCharacterValues.skinColor + '.json', 'all');
      this.createSpritePart('hair', 'img/charCreator/stack_' + prefix + '_hair' + this.currentCharacterValues.hairType + '_' + this.currentCharacterValues.hairColor + '.png', 'img/charCreator/stack_' + prefix + '_hair' + this.currentCharacterValues.hairType + '_' + this.currentCharacterValues.hairColor + '.json', 'all');
      */
    }
    this.createCharacterInterval = setInterval(function() {
      
      if (scope.partsReady == scope.characterParts[scope.currentCharacterValues.gender].length) {
        
        clearInterval(scope.createCharacterInterval);
        //$("#playerCharacterCreator").remove('.tempCanvas');
        $("#playerCharacterCreator").remove('.tempCanvas');
        if (!preview) {
          scope.playerCharacterReady = true;
          if (scope.playerCharacter) scope.playerCharacter.alpha = 0;
          return;
        }
        var characterCreatorCanvas = document.getElementById("playerCharacterCreator");
        var ctx = characterCreatorCanvas.getContext("2d");
        $("#playerCharacterCreator").prop("width", 292);
        $("#playerCharacterCreator").prop("height", 496);
        
        for (var index in scope.characterParts[scope.currentCharacterValues.gender]) {
          var partName = scope.characterParts[scope.currentCharacterValues.gender][index];
          if (partName != "shirtLong" || (partName == "shirtLong" && scope.currentCharacterValues.shirtType < 3)) {
            ctx.drawImage(scope[partName].img,scope[partName].x,scope[partName].y,scope[partName].width,scope[partName].height);
          }
        }
        var imgData = characterCreatorCanvas.toDataURL("image/png");
        
        //var tempImg = new Image();
        var tempImg = document.createElement("img");
         tempImg.onload = function() {
           scope.game.cache.addImage('characterImage',imgData,tempImg);
           if (scope.playerCharacter == undefined) {
             scope.createCharacter();
           }
           else {
             scope.playerCharacter.loadTexture('characterImage');
           }
           scope.playerCharacterReady = true;
           if (preview) {
             scope.continueButton.frameName = 'hahmonluonti_jatka'
             scope.continueButton.input.enabled = true;
             scope.characterButtons.forEach(function(button) {
              button.input.enabled = true;
             }, scope);
             scope.colorButtons.forEach(function(button) {
                button.input.enabled = true;
             }, this);
           }
           else {
             scope.playerCharacter.alpha = 0;
           }
         }
        tempImg.src = imgData;
      }
    }, 100);
    
    /*
    console.log("enable the white boxes");
    console.log(this.currentCharacterValues.hairColor);
    for (i = 1; i < 5; i++) {
        if (this.currentCharacterValues.hairColor == 1) {
        this.hair1colorActive.alpha = 1;
        } else this.hair1colorActive.alpha = 0;    
    }*/
  },
  
  loadAndDrawSpritesheets: function(partName, imgSrc, jsonFile, playerHeadData, drawInParts) {
    this.partToDraw = partName;
    var divider = (drawInParts != undefined) ? drawInParts : 1;
    var scope = this;
    $.getJSON(jsonFile, function(json) {
      //var tempImg = new Image();
      var tempImg = document.createElement("img");
      tempImg.onload = function() {
        try {
          if (partName != "shirtLong" || (partName == "shirtLong" && scope.currentCharacterValues.shirtType < 3)) {
            var ctx1 = document.getElementById("playerCharacterCreator").getContext("2d");
            var imgWidth = tempImg.width;
            var imgHeight = tempImg.height;
            if (divider != 1) {
              /*if (partName == 'hairBack') {
                console.log("w: " + imgWidth + " h: " + imgHeight);
              }*/
              //context.drawImage(img,sx,sy,swidth,sheight,x,y,width,height);
              var xPos = 0;
              var yPos = 0;
              var swidth = Math.floor(imgWidth/divider);
              var sheight = Math.floor(imgHeight/divider);
              /*if (partName == 'hairBack') {
                console.log("sw: " + swidth + " sh: " + sheight);
              }*/
              var partsDrawn = 0;
              for (var i = 0; i < divider; i++) {
                for (var j = 0; j < divider; j++) {
                  /*if (partName == 'hairBack') {
                    console.log("x: " + xPos + " y: " + yPos + " sw: " + swidth + " sh: " + sheight);
                  }*/
                  ctx1.drawImage(tempImg, xPos, yPos, swidth, sheight, xPos, yPos, swidth, sheight);
                  partsDrawn++;
                  yPos += sheight;
                  //if ((yPos + sheight) > imgHeight) sheight = imgHeight - yPos;
                }
                xPos += swidth;
                yPos = 0;
                //if ((xPos + swidth) > imgWidth) swidth = imgWidth - xPos;
              }
              /*if (partName == 'hairBack') {
                console.log("partsDrawn: " + partsDrawn);
              }*/
            }
            else {
              ctx1.drawImage(tempImg, 0, 0, imgWidth, imgHeight);
            }
            //ctx1.drawImage(tempImg, 0, 0);
            console.log(partName + " character drawn");
            ctx1 = null;
          }
          if (partName == "hair" || partName == "hairBack" || partName == "nose" || partName == "face") {
            var ctx2 = document.getElementById("playerCharacterCreatorHead").getContext("2d");
            var headScale = (scope.currentCharacterValues.gender == "female" && scope.currentCharacterValues.hairType == 3) ? 1.3 : 1.2; // Woman's hair3 is wider so scale it more
            var offsetX = (scope.currentCharacterValues.gender == "male") ? 30 : 20;
            if (scope.currentCharacterValues.gender == "female" && scope.currentCharacterValues.hairType == 3) offsetX = 0;
            ctx2.drawImage(tempImg, json.frames[16].frame.x + offsetX, json.frames[16].frame.y + 5, playerHeadData.frame.w * headScale, playerHeadData.frame.h * headScale, playerHeadData.frame.x, playerHeadData.frame.y, playerHeadData.frame.w, playerHeadData.frame.h);
            console.log(partName + " head drawn");
            ctx2 = null;
          }
        }
        catch(err) {
          console.log(err);
        }
        finally {
          scope.partsReady++;
          tempImg = null;
        }
      };
	  /*tempImg.onerror = function(){ 
		alert("Character spritesheet for " + partName + "couldn't be loaded");
	  };*/
      tempImg.src = imgSrc; // + '?turhake=1';
    });
  },
  
  createPlayerAtlas: function() {
    
    var characterAtlasJSON = 'img/' + this.defaultCharacter.spriteAtlas + '.json';
    
    for (var i = 0; i < Config.spriteAtlases.length; i++) {
      var found = false;
      for (var j = 0; j < Config.spriteAtlases[i].length; j++) {
        if (Config.spriteAtlases[i][j][0] == this.defaultCharacter.spriteAtlas) {
          characterAtlasJSON = Config.spriteAtlases[i][j][2];
          found = true;
          break;
        }
      }
      if (found) break;
    }
    
    var scope = this;
    // Define needed sprite atlases
    var prefix = (scope.currentCharacterValues.gender == 'male') ? 'male' : 'woman';
    var shirtType = (scope.currentCharacterValues.shirtType < 3) ? scope.currentCharacterValues.shirtType : (2 - scope.currentCharacterValues.shirtType%2);
    scope.partData = [
      {partName: 'hairBack', imgSrc: 'img/charCreator/stack_' + prefix + '_hair' + scope.currentCharacterValues.hairType + '_back_' + scope.currentCharacterValues.hairColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_hair' + scope.currentCharacterValues.hairType + '_back_' + scope.currentCharacterValues.hairColor + '.json'},
      {partName: 'rearArm', imgSrc: 'img/charCreator/stack_' + prefix + '_rearArm' + shirtType + '_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_rearArm' + shirtType + '_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'rearSleeve', imgSrc: 'img/charCreator/stack_' + prefix + '_rearSleeve' + shirtType + '_' + scope.currentCharacterValues.shirtColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_rearSleeve' + shirtType + '_' + scope.currentCharacterValues.shirtColor + '.json'},
      {partName: 'backWheelchair', imgSrc: 'img/charCreator/stack_' + prefix + '_backWheelchair_' + scope.currentCharacterValues.wheelchairColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_backWheelchair_' + scope.currentCharacterValues.wheelchairColor + '.json'},
      {partName: 'shoes', imgSrc: 'img/charCreator/stack_' + prefix + '_shoes_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_shoes_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'legs', imgSrc: 'img/charCreator/stack_' + prefix + '_legs_' + scope.currentCharacterValues.pantsColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_legs_' + scope.currentCharacterValues.pantsColor + '.json'},
      {partName: 'torso', imgSrc: 'img/charCreator/stack_' + prefix + '_torso_' + scope.currentCharacterValues.shirtColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_torso_' + scope.currentCharacterValues.shirtColor + '.json'},
      {partName: 'neck', imgSrc: 'img/charCreator/stack_' + prefix + '_neck_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_neck_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'shirtLong', imgSrc: 'img/charCreator/stack_' + prefix + '_shirtLong_' + scope.currentCharacterValues.shirtColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_shirtLong_' + scope.currentCharacterValues.shirtColor + '.json'},
      {partName: 'frontWheelchair', imgSrc: 'img/charCreator/stack_' + prefix + '_frontWheelchair_' + scope.currentCharacterValues.wheelchairColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_frontWheelchair_' + scope.currentCharacterValues.wheelchairColor + '.json'},
      {partName: 'frontArm', imgSrc: 'img/charCreator/stack_' + prefix + '_frontArm' + shirtType + '_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_frontArm' + shirtType + '_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'frontSleeve', imgSrc: 'img/charCreator/stack_' + prefix + '_frontSleeve' + shirtType + '_' + scope.currentCharacterValues.shirtColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_frontSleeve' + shirtType + '_' + scope.currentCharacterValues.shirtColor + '.json'},
      {partName: 'face', imgSrc: 'img/charCreator/stack_' + prefix + '_face_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_face_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'nose', imgSrc: 'img/charCreator/stack_' + prefix + '_nose' + scope.currentCharacterValues.noseType + '_' + scope.currentCharacterValues.skinColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_nose' + scope.currentCharacterValues.noseType + '_' + scope.currentCharacterValues.skinColor + '.json'},
      {partName: 'hair', imgSrc: 'img/charCreator/stack_' + prefix + '_hair' + scope.currentCharacterValues.hairType + '_' + scope.currentCharacterValues.hairColor + '.png', jsonFile: 'img/charCreator/stack_' + prefix + '_hair' + scope.currentCharacterValues.hairType + '_' + scope.currentCharacterValues.hairColor + '.json'}
    ];
    
    $.getJSON(characterAtlasJSON, function(json) {

      var characterCreatorCanvas = document.getElementById("playerCharacterCreator");
      //var characterCreatorCanvas = document.createElement("canvas");
      var ctx = characterCreatorCanvas.getContext("2d");
      $("#playerCharacterCreator").prop("width", 2048);
      $("#playerCharacterCreator").prop("height", 2048);
      //$(characterCreatorCanvas).prop("width", 2048);
      //$(characterCreatorCanvas).prop("height", 2048);
      ctx.clearRect(0, 0, characterCreatorCanvas.width, characterCreatorCanvas.height);
      
      // Create player head
      var characterCreatorHeadCanvas = document.getElementById("playerCharacterCreatorHead");
      //var characterCreatorHeadCanvas = document.createElement("canvas");
      var ctx2 = characterCreatorHeadCanvas.getContext("2d");
      var sayersImage = scope.cache.getImage("sayerAtlas", true).data;
      $("#playerCharacterCreatorHead").prop("width", sayersImage.width);
      $("#playerCharacterCreatorHead").prop("height", sayersImage.height);
      //$(characterCreatorHeadCanvas).prop("width", sayersImage.width);
      //$(characterCreatorHeadCanvas).prop("height", sayersImage.height);
      ctx2.drawImage(sayersImage, 0, 0);
      sayersImage = null;
      ctx = null;
      
      var sayersJSON = scope.cache.getJSON("sayersJSON");
      var playerHeadData = null;
      for (var i = 0; i < sayersJSON.frames.length; i++) {
        if (sayersJSON.frames[i].filename == "character") {
          playerHeadData = sayersJSON.frames[i];
          break;
        }
      }
      // Clear player head area
      ctx2.clearRect(playerHeadData.frame.x, playerHeadData.frame.y, playerHeadData.frame.w, playerHeadData.frame.h);
      ctx2 = null;
      scope.sheetsCreated = false;
      
      scope.createCharacterSheetsInterval = setInterval(function() {
      
        if (scope.sheetsCreated) {
          clearInterval(scope.createCharacterSheetsInterval);
          console.log("sheetsCreated");
          scope.sheetsCreated = undefined;
          //var imgData = document.getElementById("playerCharacterCreator").toDataURL("image/png");
          //var headImgData = document.getElementById("playerCharacterCreatorHead").toDataURL("image/png");
          setTimeout(function() {
            //var tempImg = new Image();
            var tempImg = document.createElement("img");
            tempImg.onload = function() {
              scope.cache.addTextureAtlas(scope.defaultCharacter.spriteAtlas, null, tempImg, json, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
              console.log("character atlas added to cache");
              // Replace player head to sayerAtlas too
              //var headImg = new Image();
              var headImg = document.createElement("img");
              headImg.onload = function() {
                scope.cache.addTextureAtlas("sayerAtlas", null, headImg, sayersJSON, Phaser.Loader.TEXTURE_ATLAS_JSON_ARRAY);
                console.log("sayer atlas added to cache");
                scope.playerAtlasCreated = true;
                headImg = null;
              }
              headImg.src = document.getElementById("playerCharacterCreatorHead").toDataURL("image/png");
              tempImg = null;
            }
            tempImg.src = document.getElementById("playerCharacterCreator").toDataURL("image/png");
          }, 10);
          return;
        }
        else {
          if (scope.partsReady == scope.partData.length) {
            scope.sheetsCreated = true;
          }
          else if (scope.partToDraw != scope.partData[scope.partsReady].partName) {
            scope.loadAndDrawSpritesheets(scope.partData[scope.partsReady].partName, scope.partData[scope.partsReady].imgSrc, scope.partData[scope.partsReady].jsonFile, playerHeadData, 1);
          }
        }
        
      }, 100); // interval

    });
  },
  
  createSpritePart: function(partName, imgSrc, jsonFile, frameName) {
    
    // If previously loaded image is same, do not load it again
    if (this[partName] != undefined && frameName != 'all' && this[partName].frameName == frameName && this[partName].jsonFile == jsonFile) {
      this.partsReady++;
      return;
    }
    
    var scope = this;
    // When frameName is set to 'all' use whole atlas image
    if (frameName == 'all') {
      $.getJSON(jsonFile, function(json) {
        //var tempImg = new Image();
        var tempImg = document.createElement("img");
        tempImg.onload = function() {
          scope[partName] = {img: this, data: null, x: 0, y: 0, width: 2048, height: 2048, frameName: frameName, jsonFile: jsonFile};
          scope.partsReady++;
        };
        tempImg.src = imgSrc;
      });
    }
    else {
      var previewImg = null;
      var json = null;
      // Images and json objects are preloaded for preview so get correct ones
      for (var i = 0; i < this.previewAtlases[this.currentCharacterValues.gender].length; i++) {
        if (this.previewAtlases[this.currentCharacterValues.gender][i].img.origSrc == imgSrc) {
          previewImg = this.previewAtlases[this.currentCharacterValues.gender][i].img;
          json = this.previewAtlases[this.currentCharacterValues.gender][i].json;
          break;
        }
      }
      var frameIndex = 0;
      for (var i = 0; i < json.frames.length; i++) {
        if (json.frames[i].filename == frameName) {
          frameIndex = i;
          break;
        }
      } 
      var tempCanvas = document.createElement('canvas');
      tempCanvas.className = "tempCanvas";
      tempCanvas.id = "tempCanvas_" + partName;
      document.getElementById("playerCharacterCreator").appendChild(tempCanvas);
      $(tempCanvas).prop("width", json.frames[frameIndex].frame.w);
      $(tempCanvas).prop("height", json.frames[frameIndex].frame.h);
      var ctx = tempCanvas.getContext("2d");
      ctx.drawImage(previewImg, json.frames[frameIndex].frame.x, json.frames[frameIndex].frame.y, json.frames[frameIndex].frame.w, json.frames[frameIndex].frame.h, 0, 0, json.frames[frameIndex].frame.w, json.frames[frameIndex].frame.h);
      var imgData = tempCanvas.toDataURL("image/png");
      
      //var croppedImg = new Image();
      var croppedImg = document.createElement("img");
      croppedImg.onload = function() {
        scope[partName] = {img: this, data: imgData, x: json.frames[frameIndex].spriteSourceSize.x, y: json.frames[frameIndex].spriteSourceSize.y, width: json.frames[frameIndex].frame.w, height: json.frames[frameIndex].frame.h, frameName: frameName, jsonFile: jsonFile};
        scope.partsReady++;
        $("#playerCharacterCreator").remove("#tempCanvas_" + partName);
      }
      croppedImg.src = imgData;
    }
  },
  
    colorPicker: function (button, test) {
      var index = this.characterItems[this.currentCharacterValues.gender][button.itemName].indexOf(this.currentCharacterValues[button.itemName]);
      if (this.characterItems[this.currentCharacterValues.gender][button.itemName][index] == undefined) {
        index = 0;
      }      
      this.currentCharacterValues[button.itemName] = this.characterItems[this.currentCharacterValues.gender][button.itemName][button.colorNumber];
      this.colorActiveBgs.forEach(function(sprite) {
        if (sprite.itemName == button.itemName) sprite.alpha = 0;
      }, this);
      /*console.log(this.colorActiveBgs.children[0]);
      for (i = 0; i < this.colorActiveBgs.length; i++) {
        console.log(this.colorActiveBgs[i]);
        this.colorActiveBgs.children[i].alpha = 0;
      }*/
      
      button.activeBg.alpha = 1;
    this.createCharacterSprite(true);
  },


  nextItem: function (button) {
    
    if (button.itemName == "gender") {
      if (this.currentCharacterValues.gender == "male") {
        this.currentCharacterValues.gender = "female";
        this[button.itemName + "Title"].setText("NAINEN");
      }
      else {
        this.currentCharacterValues.gender = "male";
        this[button.itemName + "Title"].setText("MIES");
      }
      for (var value in this.characterItems[this.currentCharacterValues.gender]) {
        if (this.characterItems[this.currentCharacterValues.gender][value].indexOf(this.currentCharacterValues[value]) == -1) {
          this.currentCharacterValues[value] = this.characterItems[this.currentCharacterValues.gender][value][0];
        }
      }
    }
    else {
      var index = this.characterItems[this.currentCharacterValues.gender][button.itemName].indexOf(this.currentCharacterValues[button.itemName]);
      index++;
      if (this.characterItems[this.currentCharacterValues.gender][button.itemName][index] == undefined) {
        index = 0;
      }
      this.currentCharacterValues[button.itemName] = this.characterItems[this.currentCharacterValues.gender][button.itemName][index];
      /*var titleText = this.copy(button.titleText);
      titleText += (index + 1);
      this[button.itemName + "Title"].setText(titleText);*/
    }
    this.createCharacterSprite(true);
  },
  
  prevItem: function (button) {
    
    if (button.itemName == "gender") {
      if (this.currentCharacterValues.gender == "male") {
        this.currentCharacterValues.gender = "female";
        this[button.itemName + "Title"].setText("NAINEN");
      }
      else {
        this.currentCharacterValues.gender = "male";
        this[button.itemName + "Title"].setText("MIES");
      }
      for (var value in this.characterItems[this.currentCharacterValues.gender]) {
        if (this.characterItems[this.currentCharacterValues.gender][value].indexOf(this.currentCharacterValues[value]) == -1) {
          this.currentCharacterValues[value] = this.characterItems[this.currentCharacterValues.gender][value][0];
        }
      }
    }
    else {
       var index = this.characterItems[this.currentCharacterValues.gender][button.itemName].indexOf(this.currentCharacterValues[button.itemName]);
      index--;
      if (this.characterItems[this.currentCharacterValues.gender][button.itemName][index] == undefined) {
        index = this.characterItems[this.currentCharacterValues.gender][button.itemName].length - 1;
      }
      this.currentCharacterValues[button.itemName] = this.characterItems[this.currentCharacterValues.gender][button.itemName][index];
      /*var titleText = this.copy(button.titleText);
      titleText += (index + 1);
      this[button.itemName + "Title"].setText(titleText);*/
    }
    this.createCharacterSprite(true);
  },
  
  update: function () {
    //if (this.readyToGo && (this.cache.isSoundDecoded('k_1_noniin') /*&& this.cache.isSoundDecoded('k_102_voit')*/)) { // Ready to go but sound still decoding -> show loading iconthis.readyToGo) {
    
    // See if we're ready -> start game if
    if (this.readyToGo/* && this.playerAtlasCreated*/) {
      
      //this.objects = undefined;
      this.objects.forEach(function(button) {
        this[button].destroy();
        this[button] = undefined;
      }, this);
      //$("#playerNameInput, #playerCharacterCreator, #playerCharacterCreatorHead").remove();
      $("#playerNameInput").remove();
      this.previewAtlases = undefined;
      for (var index in this.characterParts[this.currentCharacterValues.gender]) {
          var partName = this.characterParts[this.currentCharacterValues.gender][index];
          this[partName] = undefined;
      }
      this.characterButtons.destroy();
      this.colorButtons.destroy();
      this.colorActiveBgs.destroy();
      this.characterTitles.destroy();
      this.colorTitles.destroy();
      this.characterGroup.destroy();
      
      if (this.music) {
        this.music.stop();
        this.music.destroy();
        this.music = undefined;
      }
      //this.characterButton.destroy();
      this.startButton.destroy();
      this.backButton.destroy();
      
        
      this.game.world.removeAll();
      
      //this.menu_bg = undefined;
      /*this.fadeplate = undefined;
      this.gameTitle = undefined;
      //this.loadingIcon = undefined;
      this.characterTitle = undefined;
      this.startButton = undefined;
      this.backButton = undefined;*/
      /*var scope = this;
      setTimeout(function() {
        scope.state.start('Game');
      }, 5000);*/
			this.state.start('Game');
		}
    else if (this.readyToGo) { // Ready to go but sound still decoding -> show loading icon
      if (this.loadingIcon.alpha == 0) {
        this.loadingIcon.alpha = 1;
      }
      this.loadingIcon.angle += 1;
    }
    // Show loading icon when creating player character
    else if (!this.readyToGo && this.playerCharacterReady != undefined && !this.playerCharacterReady) {
      if (this.loadingIcon.alpha == 1) {
        //this.loadingIcon.alpha = 1;
        this.loadingIcon.angle += 1;
      }
      //this.loadingIcon.angle += 1;
    }
    else if (!this.readyToGo && this.playerCharacterReady != undefined && this.playerCharacterReady) {
      if (this.loadingIcon.alpha == 1) {
        this.loadingIcon.alpha = 0;
      }
    }
  },
  
  resumeGame: function () {
    this.game.resume = true;
    this.startGame();
  },

  // Enables a variable to note the update function that we're ready to go
  startGame: function () {
    this.disableNameMenu();
    this.loadingIcon.alpha = 1;
    if (!this.game.resume) {
      //this.game.playerName = $("#playerNameInput").prop("value").trim();
      this.game.playerName = "Player";
    }
    else {
      this.game.playerName = JSON.parse(window.localStorage.playerName);
      this.currentCharacterValues = JSON.parse(window.localStorage.playerCharacterValues);
      this.disableMainMenu();
    }
    this.game.playerCharacterValues = this.currentCharacterValues;
    this.game.characterGender = this.currentCharacterValues.gender;
    //this.playerAtlasCreated = false;
    //this.createCharacterSprite(false);
    //this.createPlayerAtlas();
    var scope = this;
    /*var atlasInterval = setInterval(function() {
      if (scope.partsReady == scope.characterParts[scope.currentCharacterValues.gender].length) {
        clearInterval(atlasInterval);
        scope.createPlayerAtlas();
      }
    }, 100);*/
    
    // Destroy objects that are no longer needed after litle timeout
    /*setTimeout(function() {
      scope.objects.forEach(function(button) {
        this[button].destroy();
        this[button] = undefined;
      }, scope);
      //$("#playerNameInput, #playerCharacterCreator, #playerCharacterCreatorHead").remove();
      $("#playerNameInput").remove();
      scope.previewAtlases = undefined;
      for (var index in scope.characterParts[scope.currentCharacterValues.gender]) {
          var partName = scope.characterParts[scope.currentCharacterValues.gender][index];
          if (scope[partName] != undefined) {
            scope[partName].img = null;
            scope[partName] = undefined;
          }
      }
      scope.characterButtons.destroy();
      scope.colorButtons.destroy();
      scope.colorActiveBgs.destroy();
      scope.characterTitles.destroy();
      scope.colorTitles.destroy();
      scope.characterGroup.destroy();
      
      if (scope.music) {
        scope.music.stop();
        scope.music.destroy();
        scope.music = undefined;
      }
      scope.startButton.destroy();
      scope.backButton.destroy();
    }, 300);*/
    
		this.game.gameInProgress = true;
    var tween = this.game.add.tween(this.fadeplate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
    tween.onComplete.add(function () { this.readyToGo = true; }, this);
	},
  
  // Hide main menu buttons when going to another menu
  disableMainMenu: function() {
  
    // Disable inputs...
    this.firstStartButton.input.enabled = false;
    this.resumeButton.input.enabled = false;
    this.settingsButton.input.enabled = false;
  
    // ...and make everything invisible
    //this.gameTitle.alpha = 0;
    this.firstStartButton.alpha = 0;
    this.resumeButton.alpha = 0;
    this.settingsButton.alpha = 0;
    this.menu_bg2.alpha = 0;
  },
  
  // Show main menu buttons when returning from another menu
  enableMainMenu: function() {
  
    // First take out whatever there was
    this.disableSettingsMenu();
  
    // Then enable inputs again
    this.firstStartButton.input.enabled = true;
    this.settingsButton.input.enabled = true;
    if (window.localStorage.gamestate == undefined || window.localStorage.gamestate == null) {
      this.resumeButton.input.enabled = false;
      this.resumeButton.alpha = 0.5;
    }
    else {
      this.resumeButton.input.enabled = true;
      this.resumeButton.alpha = 1;
    }
    
    // And make everything visible again
    //this.gameTitle.alpha = 1;
    this.firstStartButton.alpha = 1;
    this.settingsButton.alpha = 1;
   this.menu_bg2.alpha = 1;
  },
  
  // Show settings menu buttons when returning from another menu
  enableSettingsMenu: function() {
  
    this.disableMainMenu();
  
    this.settingsTitle.alpha = 1;
    this.speechTitle.alpha = 1;
    this.fxTitle.alpha = 1;
    this.musicTitle.alpha = 1;
    this.fullscreenTitle.alpha = 1;
    
    this.speechButton.alpha = 1;
    this.fullscreenButton.alpha = (this.game.device.fullscreen) ? 1 : 0.5;
    this.mainMenuButton.alpha = 1;
    //if (this.sound.usingWebAudio) {
      this.fxButton.alpha = 1;
      this.musicButton.alpha = 1;
    /*}
    else {
      this.fxButton.alpha = 0.5;
      this.musicButton.alpha = 0.5;
    }*/
    this.speechButton.input.enabled = true;
    //if (this.sound.usingWebAudio) {
      this.fxButton.input.enabled = true;
      this.musicButton.input.enabled = true;
    //}
    this.fullscreenButton.input.enabled = (this.game.device.fullscreen) ? true : false;
    this.mainMenuButton.input.enabled = true;
    
  },
  
  // Hide settings menu buttons
  disableSettingsMenu: function() {
  
    this.settingsTitle.alpha = 0;
    this.speechTitle.alpha = 0;
    this.fxTitle.alpha = 0;
    this.musicTitle.alpha = 0;
    this.fullscreenTitle.alpha = 0;
    
    this.speechButton.alpha = 0;
    this.fxButton.alpha = 0;
    this.musicButton.alpha = 0;
    this.fullscreenButton.alpha = 0;
    this.mainMenuButton.alpha = 0;
    
    this.speechButton.input.enabled = false;
    this.fxButton.input.enabled = false;
    this.musicButton.input.enabled = false;
    this.fullscreenButton.input.enabled = false;
    this.mainMenuButton.input.enabled = false;
  },
  
  enableNameMenu: function() {
    
    this.activeView = "name";
    this.disableMainMenu();
    this.disableCharacterMenu();
    
    this.nameTitle.alpha = 1;
    this.startButton.alpha = 1;
    this.backButton.input.enabled = true;
    this.backButton.alpha = 1;
    this.nameInputBg.alpha = 1;
    
    if (this.playerCharacter) {
      this.positionCharacter();
      this.playerCharacter.alpha = 1;
    }
    
    if ($('#playerNameInput').prop("value").trim() == "") {
      this.startButton.frameName = 'nimi_aloita_disabled';
      this.startButton.input.enabled = false;
    }
    else {
      this.startButton.input.enabled = true;
    }
    this.nameInput.show();
  },
  
  disableNameMenu: function() {
    
    this.nameTitle.alpha = 0;
    this.nameInputBg.alpha = 0;
    this.nameInput.hide();
    this.startButton.alpha = 0;
    this.startButton.input.enabled = false;
    this.backButton.input.enabled = false;
    this.backButton.alpha = 0;
    if (this.playerCharacter) {
      this.playerCharacter.alpha = 0;
    }
  },
  
  backToCharacter: function() {
    this.disableNameMenu();
    this.disableMainMenu();
    this.enableCharacterMenu();
  },
  
  backToStart: function() {
    this.disableCharacterMenu();
    this.disableNameMenu();
    this.enableMainMenu();
  },
  
  // Show character menu buttons
  enableCharacterMenu: function () {
    
    this.activeView = "character";
    this.disableMainMenu();
    this.disableNameMenu();
    this.loadingIcon.alpha = 1;
    this.createCharacterSprite(true);
    this.characterTitle.alpha = 1;
    if (this.playerCharacter) {
      this.positionCharacter();
      this.playerCharacter.alpha = 1;
    }
    this.continueButton.alpha = 1;
    this.backToStartButton.alpha = 1;
    this.backToStartButton.input.enabled = true;
    
    this.characterButtons.forEach(function(button) {
      button.input.enabled = true;
      button.alpha = 1;
    }, this);
    
    this.colorButtons.forEach(function(button) {
      button.input.enabled = true;
      button.alpha = 1;
    }, this);

    this.colorActiveBgs.forEach(function(sprite) {
      sprite.alpha = (sprite.colorNumber == this.currentCharacterValues[sprite.itemName]) ? 1 : 0;
    }, this);         
    
    this.characterTitles.forEach(function(title) {
      title.alpha = 1;
    }, this);

    this.colorTitles.forEach(function(title) {
      title.alpha = 1;
    }, this);
    
    
    /*console.log("enable the white boxes");
    console.log(this.currentCharacterValues.hairColor);
    for (i = 1; i < 5; i++) {
        if (this.currentCharacterValues.hairColor == 1) {
        this.hair1colorActive.alpha = 1;
        } else this.hair1colorActive.alpha = 0;    
    }*/
  },
  
  disableCharacterMenu: function () {
     
    this.disableNameMenu();
    this.disableMainMenu();
    
    this.characterTitle.alpha = 0;
    this.continueButton.alpha = 0;
    this.backToStartButton.alpha = 0;
    this.continueButton.input.enabled = false;
    this.backToStartButton.input.enabled = false;
    if (this.playerCharacter) {
      this.playerCharacter.alpha = 0;
    }
    
    this.characterButtons.forEach(function(button) {
      button.input.enabled = false;
      button.alpha = 0;
    }, this);
    
    this.characterTitles.forEach(function(title) {
      title.alpha = 0;
    }, this);
    
    this.colorButtons.forEach(function(button) {
      button.input.enabled = false;
      button.alpha = 0;
    }, this);

    this.colorActiveBgs.forEach(function(sprite) {
      sprite.alpha = 0;
    }, this);
    
    this.colorTitles.forEach(function(title) {
      title.alpha = 0;
    }, this);
  },
  
  // Enable or disable highlight of character
  characterOnOffSwitch: function(btn) {
  
    if (btn.frameName == 'hahmo') {
      btn.setFrames('hahmo', 'hahmo', 'hahmo_valittu');
    }
    else if (btn.frameName == 'hahmo_valittu') {
      btn.setFrames('hahmo_valittu', 'hahmo_valittu', 'hahmo');
    }
  },
  
  // Enable or disable highlights of settings buttons
  buttonOnOffSwitch: function(btn, second) {
    
    if (btn.frameName == 'offBtn') {
      btn.setFrames('offBtn', 'offBtn', 'onBtn');
      this.game[btn.name + 'Enabled'] = false;
    }
    else if (btn.frameName == 'onBtn') {
      btn.setFrames('onBtn', 'onBtn', 'offBtn');
      this.game[btn.name + 'Enabled'] = true;
    }
    //this.playMusic('nopeafunkihtava1');
    
    if (btn.name == 'fullscreen') {
      this.checkFullscreen();
    }
  },
  
  // Enable or disable fullscreen
  checkFullscreen: function() { // this is the fullscreen function
    
    if (this.game.fullscreenEnabled) { // Fullscreen has been enabled
      this.scale.startFullScreen(); // Start the fullscreen
    }
    else { // Fullscreen has been disabled
      if (document.exitFullscreen) { // general JavaScript hack to enable exiting fullscreen with a button.
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  },
};