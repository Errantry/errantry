/**
 * @fileOverview The main game controller.
 * @name Game.js
 */
Game.Game = function (game) {

	/*	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
  this.game;		//	a reference to the currently running game
  this.add;		  //	used to add sprites, text, groups, etc
  this.camera;	//	a reference to the game camera
  this.cache;		//	the game cache
  this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
  this.load;		//	for preloading assets
  this.math;		//	lots of useful common math operations
  this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
  this.stage;		//	the game stage
  this.time;		//	the clock
  this.tweens;	//	the tween manager
  this.world;		//	the game world
  this.particles;	//	the particle manager
  this.physics;	//	the physics manager
  this.rnd;		  //	the repeatable random number generator
  */

  this.gameStarted = false;
  // modaus
};

Game.Game.prototype = {

  createSessionId: function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  /**
   * All basic declarations and default values for the game
   * @alias declarations
   */
  declarations: function () {

    this.sessionId = this.createSessionId(); // Will be replaced with savegame id, if such exists

    this.autoSaveEnabled = false;
    this.dialogueDelayEnabled = true;
    this.defaultMusicFadeTime = 1000;

    // Defaults
    this.loadedGroups = [0];
    qlAdjuster = 50;
    var textSize = Math.floor(24 * this.scaleFactor);
    this.textstyle = { font: textSize + "px opendyslexicregular", fill: "#FFF", wordWrap: true, wordWrapWidth: Math.floor(975 * this.scaleFactor) };
    this.questLogHeaderStyle = { font: Math.floor(this.scaleFactor * 29) + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor), align: 'right' };
    this.questLogTextStyle = { font: Math.floor(this.scaleFactor * 29) + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor), align: 'left' };
    this.qlPixels = {bgX: 0, bgY: 0, dividerX: qlAdjuster+300, dividerY: 30, headerX: qlAdjuster+290, origHeaderY: 365, headerY: 40, headerOffset: 50, textX: qlAdjuster+350, textY: 40, textOffset: 40, textOffsetFromIcon: 30, textFontSize: 34, textMiddleYPoint: 370, headerFontSize: 25, activeHeaderFontSize: 45, closeButtonX: 1150, closeButtonY: 20};

	  this.gamestate = jQuery.extend(true, {}, Config.gamestates);
    this.gamestate.playerName = this.game.playerName;
	  this.points = 0;
	  this.textX = 170 * this.scaleFactor;
	  this.textY = 646 * this.scaleFactor;
	  this.fadeplateMidOpacity = 0;
	  this.dialogueInProgress = false;
    this.musicVolume = 1;
    this.musicVolumeDuringSpeech = 0.1;
    this.hoverVolume = 1;
    this.clickVolume = 1;
    this.defaultWalkingVelocity = 450; // 450 pixels per second
    this.hoverSoundPlaying = false;
    this.speechOngoing = false;
    this.clickSoundPlaying = false;
    this.centerPoint = this.game.width * 0.5;
	  this.pauseMenuActive = false;
    this.followerOffsetFromChar = 200;

    // Prepare/reset variables
	  this.questionAnswers = [];
    this.speechQueue = [];
	  //this.foregroundAssets = [];
    this.assetsWithHover = [];
    this.playerNameTexts = {};
    this.customSpawnX = null;

    this.cutscene = {
      'current': null, // The current list of actions to do
      'currentId': 0, // Which one in the current list we're doing
      'completed': [], // Which ones have already been done
      'waitForNext': false, // Whether we're waiting for the next cutscene part or not
    };

    this.clickables = [];
    this.inventory = [];
    // Add inventory items
    for (var state in this.gamestate) {
      if (state.indexOf('InInv') != -1 && this.gamestate[state]) {
        this.inventory.push(state.replace('InInv', ''));
      }
    }

    this.tempTintedAssets = {};
    this.inventoryActive = false;
    this.questLogActive = false;
    this.activeQuestLogTab = 'tuparit';

    this.questLog = {
      tuparit: {
              header: 'Tuparit',
              visible: true, // Defines whether the header is visible
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Tee viime hetken järjestelyt kotona', visible: true, completed: false },
                { text: 'Laita kahvit tippumaan', visible: false, completed: false },
                { text: 'Siivoa olohuone', visible: false, completed: false, audio: 'skottiherkut_tee_tikkasen_keittiossa' },
                { text: 'Avaa ovi ensimmäiselle vieraalle', visible: false, completed: false },
                { text: 'Avaa ovi toiselle vieraalle', visible: false, completed: false },
                { text: 'Avaa ovi kolmannelle vieraalle', visible: false, completed: false },
                { text: 'Laita stereot hiljemmalle', visible: false, completed: false },
                { text: 'Pyydä Tikkasta lopettamaan tupakointi', visible: false, completed: false },
                { text: 'Hiljennä palohälytin', visible: false, completed: false },
                { text: 'Avaa ikkuna', visible: true, completed: true },
                { text: 'Tumppaa nukkuvan Tikkasen rööki', visible: false, completed: false },
                { text: 'Mene nukkumaan', visible: false, completed: false }
              ]
            },
      anjaltaLupa: {
              header: 'Äidiltä lupa',
              visible: false, // Defines whether the header is visible
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Kysy Tikkaselle lupa festareille lähtöön', visible: true, completed: false },
                { text: 'Mene toiseen kerrokseen', visible: false, completed: false },
                { text: 'Soita Anjan ovikelloa', visible: true, completed: true }
              ]
            },
      sahkokatkos: {
              header: 'Sähkökatkos',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Vaihda sulake', visible: false, completed: false },
                { text: 'Kytke pikasulake takaisin päälle', visible: false, completed: false },
                { text: 'Sammuta jokin sähkölaite keittiössä', visible: false, completed: false },
                { text: 'Sammuta jokin muu sähkölaite keittiössä', visible: false, completed: false }
              ]
            },
      kylmalaitteet: {
              header: 'Kylmälaitteet',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Imuroi jääkaapin tausta', visible: false, completed: false },
                { text: 'Laita imuri päälle', visible: false, completed: false },
                { text: 'Mene takaisin imuroimaan', visible: false, completed: false }
              ]
            },
      palovaroitin: {
              header: 'Palovaroittimet',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hanki Tikkaselle palovaroittimia', visible: false, completed: false },
                { text: 'Näytä, mihin varoitin pitää asentaa', visible: false, completed: false },
                { text: 'Käy asentamassa Tikkaselle palovaroittimet', visible: false, completed: false }
              ]
            },
      mars: {
              header: 'Skottiherkut',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Tee Tikkasen keittiössä turvallisuustarkastus!', visible: false, completed: false },
                { text: 'Näytä, mihin varoitin pitää asentaa', visible: false, completed: false },
                { text: 'Uppopaista Mars-patukoita Tikkasella', visible: false, completed: false },
              ]
            },
      paristot: {
              header: 'Paristot',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hanki palovaroittimeesi paristot', visible: false, completed: false },
                { text: 'Asenna paristo palohälyttimeen', visible: false, completed: false },
              ]
            },
      festarivarusteet: {
              header: 'Festarivarusteet',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hanki makuupussi itsellesi', visible: true, completed: false },
                { text: 'Hanki makuupussi Tikkaselle', visible: true, completed: false },
                { text: 'Hanki teltta', visible: true, completed: false },
                { text: 'Hanki aurinkorasvaa', visible: true, completed: false },
                { text: 'Hanki ensiapupakkaus', visible: true, completed: false },
                { text: 'Hanki käteistä rahaa', visible: true, completed: false },
                { text: 'Hanki matkaliput tai kyyti', visible: true, completed: false }
              ]
            },
      makuupussit: {
              header: 'Makuupussit',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Etsi oma makuupussisi', visible: false, completed: false },
                { text: 'Etsi Tikkasen makuupussi', visible: false, completed: false },
                { text: 'Palauta ostamasi makuupussi kauppaan', visible: false, completed: false },
                { text: 'Palauta Tikkaselle ostamasi makuupussi kauppaan', visible: false, completed: false },
                { text: 'Pese makuupussit Tikkasen pesukoneessa', visible: false, completed: false },
                { text: 'Odota pesuohjelman päättymistä', visible: false, completed: false },
                { text: 'Ota makuupussit pois pesukoneesta', visible: false, completed: false },
                { text: 'Etsi makuupusseille kuivauspaikka', visible: false, completed: false },
                { text: 'Hae makuupussit narulta', visible: false, completed: false },
                { text: 'Sammuta tulipalo!', visible: false, completed: false },
                { text: 'Odota makuupussien kuivumista', visible: false, completed: false },
                { text: 'Ota makuupussit narulta', visible: false, completed: false }
              ]
            },
      matkakassa: {
              header: 'Matkakassa',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Käykää nostamassa seinästä matkakassa', visible: false, completed: false },
                { text: 'Käykää pyytämässä Anjalta vielä vähän rahaa', visible: false, completed: false }
              ]
            },
      varas: {
              header: 'Tilanne tekee varkaan',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Kokeile pankkikorttia automaattiin', visible: false, completed: false }
              ]
            },
      pankkikortti: {
              header: 'Kadonnut pankkikortti',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Vie spankkikortti pankkiin', visible: false, completed: false }
              ]
            },
      rahat: {
              header: 'Rahat',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: '+ 400 €', visible: false, completed: false },
                { text: '+ 100 €', visible: false, completed: false },
                { text: '+ 200 €', visible: false, completed: false },
                { text: '+ 300 €', visible: false, completed: false },
                { text: '+ 400 €', visible: false, completed: false },
                { text: '+ 500 €', visible: false, completed: false },
                { text: '+ 100 € käteistä', visible: false, completed: false },
                { text: '+ 200 € käteistä', visible: false, completed: false },
                { text: '+ 300 € käteistä', visible: false, completed: false },
                { text: '+ 400 € käteistä', visible: false, completed: false },
                { text: '+ 500 € käteistä', visible: false, completed: false },
                { text: '- 200 €', visible: false, completed: false }
              ]
            },
      laakkeet: {
              header: 'Tikkasen lääkkeet',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Etsi Tikkasen lääkkeet', visible: false, completed: false },
                { text: 'Vie lääkkeet lääkekaappiin', visible: false, completed: false }
              ]
            },
      virusturva: {
              header: 'Virusturva',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hanki Tikkaselle virusturva', visible: false, completed: false },
                { text: 'Asenna Tikkasen koneelle virusturva', visible: false, completed: false }
              ]
            },
      vuokra: {
              header: 'Vuokra',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Maksa Tikkasen vuokra verkkopankissa', visible: false, completed: false },
                { text: 'Selvitä kadonneen vuokran mysteeri!', visible: false, completed: false }
              ]
            },
      muuttolaatikot: {
              header: 'Muuttolaatikot',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Siivoa muuttolaatikot pois kulkuväylältä!', visible: false, completed: false }
              ]
            },
      poistumisreitit: {
              header: 'Pelastautumissuunnitelma',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Aloita harjoittelu Tikkasen kanssa asuntosi eteisestä', visible: false, completed: false },
                { text: 'Mene alakertaan rappusia', visible: false, completed: false },
                { text: 'Poistu asunnosta ulko-oven kautta', visible: false, completed: false },
                { text: 'Aloita harjoittelu Tikkasen kanssa asuntosi eteisestä', visible: false, completed: false },
                { text: 'Mene parvekkeelle', visible: false, completed: false },
                { text: 'Etsi vaihtoehtoinen reitti ulos', visible: false, completed: false }
              ]
            },
      pubi: {
              header: 'Huurteiset välissä',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Mene Tikkasen kanssa pubiin', visible: false, completed: false },
                { text: 'Lähde kotiin', visible: false, completed: false },
                { text: 'Mene kotiin nukkumaan', visible: false, completed: false }
              ]
            },
      epilepsiakohtaus: {
              header: 'Epilepsiakohtaus',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Soita 112:een!', visible: false, completed: false },
                { text: 'Hälytä baarimikko!', visible: false, completed: false },
                { text: 'Käy juttelemassa baarimikolle', visible: false, completed: false }
              ]
            },
      tikkanenKotiin: {
              header: 'Tikkanen tuli kotiin',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Käy tervehtimässä Tikkasta naapurissa', visible: false, completed: false }
              ]
            },
      nilkka: {
              header: 'Nyrjähtänyt nilkka',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hae pakastimesta jotain kylmää Tikkasen jalkaan', visible: false, completed: false },
                { text: 'Vie pakasteherneet Tikkaselle', visible: false, completed: false }
              ]
            },
      tuhkis: {
              header: 'Käryävä tuhkakuppi',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Hae soraa', visible: false, completed: false },
                { text: 'Sammuta tuhkakuppi', visible: false, completed: false },
                { text: 'Soita talonmiehelle', visible: false, completed: false },
                { text: 'Ota tuhkakuppi mukaan', visible: false, completed: false },
                { text: 'Laita tuhkakuppi roskikseen', visible: false, completed: false },
                { text: 'Laita sammutettu tuhkakuppi roskikseen', visible: false, completed: false },
              ]
            },
      kaveri: {
              header: 'Kaveri kriisissä!',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Käy tapaamassa Tikkasen kaveria asuinalueella', visible: false, completed: false }
                ]
            },
      matkaan: {
              header: 'Festareille!',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Mene rautatientorille', visible: false, completed: false },
                { text: 'Mene rautatieasemalle', visible: false, completed: false },
                { text: 'Kiiruhda laiturille', visible: false, completed: false },
                { text: 'Nouse junaan', visible: false, completed: false }
                ]
            },
      vakuutus: {
              header: 'Vakuutukset kunnossa',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Osta Tikkaselle kotivakuutus', visible: false, completed: false },
                { text: 'Osta matkavakuutukset', visible: false, completed: false }
                ]
            },
      ullakkovaras: {
              header: 'Varkaita liikkeellä!',
              visible: false,
              // Example with multiple lines and changed with changeQuestLog(machineName, showPart/hidePart, textIndex)
              text: [
                { text: 'Käy poliisilaitoksella antamassa lausunto', visible: false, completed: false },
                { text: 'Juttele poliisivirkailijalle', visible: false, completed: false },
                ]
            }

    };
    console.log(JSON.stringify(this.questLog));

    this.questLogImages = {
      musiikki: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Älä huudata radiota yöllä ja naapurit tykkää!',
        completedImage: 'polaroid_musiikki'
      },
      palovaroitin: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Asenna palohälytin kattoon etäälle ilmastointikanavista ja valaisimista!',
        completedImage: 'polaroid_varoitin'
      },
      laakkeet: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Säilytä lääkkeet lääkekaapissa!',
        completedImage: 'polaroid_varoitin'
      },
      virusturva: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Käytä tietokonetta vain, jos siinä on virusturva!',
        completedImage: 'polaroid_varoitin'
      },
      vuokraFail: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Selvitä aina kadonneiden tilisiirtojen kohtalo!',
        completedImage: 'polaroid_varoitin'
      },
      virusturva: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Pidä tietokoneesi suojattuna viruksilta!',
        completedImage: 'polaroid_varoitin'
      },
      vuokra: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Hoida raha-asioita verkossa ainoastaan virussuojatulla tietokoneella!',
        completedImage: 'polaroid_varoitin'
      },
      muuttolaatikot: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Pidä kulkuväylät vapaana!',
        completedImage: 'polaroid_varoitin'
      },
      poistumisreitit: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Opettele miten asunnosta poistutaan hätätilanteessa!',
        completedImage: 'polaroid_varoitin'
      },
      sisaanpyrkija: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Älä päästä rappuun tuntemattomia ihmisiä!',
        completedImage: 'polaroid_varoitin'
      },
      automatka: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Jos väsyttää, pidä tauko ennen kuin jatkat ajamista!',
        completedImage: 'polaroid_varoitin'
      },
      foorumi: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Käyttäydy nettifoorumeilla hyvin!',
        completedImage: 'polaroid_varoitin'
      },
      kylmalaitteet: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Imuroi kylmälaitteiden taustat vuosittain!',
        completedImage: 'polaroid_varoitin'
      },
      paristot1: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Käytä kiipeilyyn tukevia tikkaita!',
        completedImage: 'polaroid_varoitin'
      },
      paristot2: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Vaihda palohälyttimen paristot ja testaa ne säännöllisesti!',
        completedImage: 'polaroid_varoitin'
      },
      nilkka: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Käytä kylmää lievien nyrjähdyksien hoitamiseen.',
        completedImage: 'polaroid_varoitin'
      },
      tuhkis: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Huolehdi, että tumpit sammuu tuhkakupissa!',
        completedImage: 'polaroid_varoitin'
      },
      makuupussit: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Kuivaa pyykit turvallisesti kuivaushuoneessa, ei koskaan saunassa!',
        completedImage: 'polaroid_varoitin'
      },
      liesituuletin: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Puhdista liesituulettimen rasvasuodatin säännöllisesti!',
        completedImage: 'polaroid_varoitin'
      },
      hella: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Pidä hellan ympärys siistinä!',
        completedImage: 'polaroid_varoitin'
      },
      lampomittari: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Käytä sokerimittaria rasvan lämpötilan seuraukseen!',
        completedImage: 'polaroid_varoitin'
      },
      rasvapalo: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Sammuta rasvapalo aina tukahduttamalla, älä koskaan vedellä!',
        completedImage: 'polaroid_varoitin'
      },
      kaapit: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Järjestä kaapit niin, että tavaroita ei tipu avatessa!',
        completedImage: 'polaroid_varoitin'
      },
      kotivakuutus: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Kotivakuutus on tärkeä ja usein myös pakollinen!',
        completedImage: 'polaroid_varoitin'
      },
      matkavakuutus: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Matkavakuutuksen voi hankkia myös kotimaan matkoille!',
        completedImage: 'polaroid_varoitin'
      },
      epilepsia: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Soita hätänumeroon viivyttelemättä ja epäröimättä!',
        completedImage: 'polaroid_varoitin'
      },
      pubi: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Nauti alkoholia kohtuudella!',
        completedImage: 'polaroid_varoitin'
      },
      ullakkovaras: {
        completedHeader: 'Tehtävä suoritettu!',
        completedText: 'Paina epäilyttävien tyyppien tuntomerkit mieleen!',
        completedImage: 'polaroid_varoitin'
      }
    };

    this.questLogVisibleItems = [];
    this.questLogVisibleHeaders = [];
    this.questLogIcons = [];

    this.npcState = {};
    for (npcName in this.game.npcs) { // Create npc default states
      this.npcState[npcName] = {
        visible: false,
        isFollowing: false,
        x: (this.game.npcs[npcName].x) ? this.game.npcs[npcName].x : 0, // NON-SCALED X AND Y VALUES HERE ALL THE TIME
        //y: (this.game.npcs[npcName].y) ? this.game.npcs[npcName].y : 600,
        //origY: (this.game.npcs[npcName].y) ? this.game.npcs[npcName].y : 600,
        exceptionYs: {}, // Whenever changing the npc's y per room, it gets stored here.
        foreground: this.game.npcs[npcName].foreground,
        faceDirection: 'right',
        attachedToRoom: this.game.npcs[npcName].room,
        defaultAnimation: null
      };
    }

    // These are only used when saving the game, since complete objects with states cannot be saved.
    this.assetState = {};
    for (var i = 0; i < this.game.rooms.length; i++) {
      for (var j = 0; j < this.game.rooms[i].assets.length; j++) {
        if (this.game.rooms[i].assets[j].name != undefined) {
          this.assetState[this.game.rooms[i].assets[j].name] = {};
        }
      }
    }
  },

  /**
   * Preloadable things, mainly sounds.
   * Contains also the possibility to add the debug plugin.
   * @alias preload
   */
  preload: function () {

    // Add for debugging
    //this.game.add.plugin(Phaser.Plugin.Debug);

    // Preload character audios based on gender
    /*if (this.game.characterGender == 'male') {
      this.load.audiosprite("player", ["sounds/m/player.mp3", "sounds/m/player.ogg"], "sounds/m/player.json");
    }
    else {
      this.load.audiosprite("player", ["sounds/f/player.mp3", "sounds/f/player.ogg"], "sounds/f/player.json");
    }
    this.game.sounds.audiosprite["player"] = null;*/
  },

  /**
   * Runs when starting the game or reloading assets. Set everything in place.
   * @alias create
   */
  create: function () {

    this.tweens.frameBased = true;

    this.scaleFactor = this.game.height/this.game.origHeight;
    //if (this.game.sounds.audiosprite["player"] == null) return;
    //if (this.game.sounds.audio["characterTest"] == null) return;

    // Define/reset variables
    if (!this.gameStarted) {
      this.declarations();
      if (this.game.resume) {
        this.loadGame();
      }
      this.gameStarted = true;
    }
    // Check that room is loaded
    var currentRoom = this.getRoom(this.gamestate.activeRoom);
    if (currentRoom && currentRoom.group != undefined && currentRoom.group != "" && this.loadedGroups.indexOf(currentRoom.group) == -1) {
      this.moveToRoom(this.gamestate.activeRoom, undefined);
      return;
    }

    this.camera.setSize(this.game.width, this.game.height);


    // Clickplate is an invisible screen-size sprite, which registers clicks for movement and dialogues, whenever there's nothing else to click
    // NEEDS TO BE IN THE BEGINNING so that everything else that's clickable comes on top of it!
    if (!this.clickplate) {
      this.clickplate = this.game.add.image(0, 0, 'clickplate');
      this.clickplate.anchor.setTo(0, 0);
      this.clickplate.inputEnabled = true;
    }
    else {
      this.clickplate.fixedToCamera = false;
      this.clickplate.x = this.clickplate.y = 0;
      this.game.world.add(this.clickplate);
    }
    this.clickplate.alpha = 0; // Always invisible, it's just for clicks
    this.clickplate.fixedToCamera = true;

		this.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

    // Create room based on what is marked as default in declarations
		this.createRoom();
    //console.log(this.gamestate);
    this.createCharacter(); // Player himself

    this.createNonFollowingNpcs(); // Non-follower(s)
    this.createFollowers(); // Follower(s)

    this.arrangeRoomAssets();

    if (!this.fadeplate) {
      //this.fadeplate = this.game.add.tileSprite(0, 0, this.room.bgWidth, this.room.bgHeight, 'fadeplate');
      this.fadeplate = this.game.add.graphics(0, 0);
      this.fadeplate.beginFill(0x000000);
      this.fadeplate.lineStyle(1, 0x000000, 1);
      this.fadeplate.drawRect(0, 0, this.game.width, this.game.height);
      this.fadeplate.endFill();
      this.fadeplate.alpha = 0;
    }
    else {
      this.fadeplate.fixedToCamera = false;
      this.fadeplate.x = this.fadeplate.y = 0;
      this.game.world.add(this.fadeplate);
    }
    this.fadeplate.fixedToCamera = true;

    // Create pause menu buttons etc on top
		this.createGui();

    if (this.textBgs) this.textBgs.destroy(true);
    this.textBgs = this.game.add.group();
    this.textBgsBg = this.game.add.image(5, 558, 'menuAtlas2', 'dialogi_tausta');
    this.prepareSpriteScale(this.textBgsBg);
    this.textBgsBg.fixedToCamera = true;
    this.textBgs.add(this.textBgsBg);

    this.textBgsSayerBg = this.game.add.image(170, 543, 'menuAtlas2', 'dialogi_sayer');
    this.prepareSpriteScale(this.textBgsSayerBg);
    this.textBgsSayerBg.fixedToCamera = true;
    this.textBgs.add(this.textBgsSayerBg);

    this.textBgsSayerText = this.game.add.text(281, 573, "", { font: 26 + "px troikaregular", fill: "#FFF"});
    this.textBgsSayerText.name = "sayerText";
    this.textBgsSayerText.anchor.set(0.5, 0.5)
    this.textBgsSayerText.origX = 281;
    this.textBgsSayerText.origY = 573;
    this.textBgsSayerText.fixedToCamera = true;
    this.textBgs.add(this.textBgsSayerText);

    this.textBgsOk = this.game.add.image(1250, 636, 'menuAtlas2', 'dialogi_ok');
    this.textBgsOk.anchor.set(1, 0.5);
    this.prepareSpriteScale(this.textBgsOk);
    this.textBgsOk.fixedToCamera = true;
    this.textBgs.add(this.textBgsOk);
    this.textBgs.alpha = 0;

    if (this.infoBox != undefined) {
      this.infoBox = this.game.add.group();
      this.infoBox.add(this.infoBoxBg);
      this.infoBox.add(this.infoBoxImg);
      this.infoBox.add(this.infoBoxClose);
      this.infoBox.alpha = 0;
    }

    this.resizeGame(this.game.width, this.game.height);

    if (this.game.created && this.game.latestCameraX != undefined) {
      this.camera.x = this.game.latestCameraX;
    }
    this.game.created = true;

    // Everything created; run actions if this room has them
    if (this.room.defaultActions.length > 0 || this.room.conditionalActions.length > 0) {
      this.checkAndRunActions('room');
    }

    console.log(this.validConditionalAction);
    // Automatic check for win conditions via a dummy room, if no conditional actions were run
    if (!this.validConditionalAction) {
      this.winConditionRoom = this.getRoom('winConditionRoom');
      console.log(this.winConditionRoom);
      if (this.winConditionRoom != undefined) {
        this.checkAndRunActions('winConditionRoom');
      }
    }
  },

    /**
   * Phaser function which gets run on each frame. Handles real-time stuff.
   * @alias update
   */
  update: function () {
    /*
    if (!this.cache.isSoundDecoded('characterTest')) {
       //this.game.debug.text("Decoding character sounds...", this.game.width/2 - 160*this.scaleFactor, 400 * this.scaleFactor);
       return;
		}
    else if (this.cache.isSoundDecoded('characterTest') && this.game.sounds.audio["characterTest"] == null) {
      this.game.sounds.audio["characterTest"] = this.game.add.audio("characterTest");
      //this.game.input.onDown.addOnce(this.create, this);
      this.create();
      return;
    }*/
    //if (!this.load.hasLoaded/*!this.cache.isSoundDecoded('player')*/) {
       //this.game.debug.text("Decoding character sounds...", this.game.width/2 - 160*this.scaleFactor, 400 * this.scaleFactor);
    //   return;
		//}
    //else if (this.load.hasLoaded /*this.cache.isSoundDecoded('player') */&& this.game.sounds.audiosprite["player"] == null) {
    //  this.game.sounds.audiosprite["player"] = this.game.add.audioSprite("player");
    //  this.create();
    //  return;
    //}

    if (!this.pauseMenuActive) { // Don't do anything if the game is paused

      if (!this.dialogueInProgress && !this.cutscene.isRunning && !this.questLogActive && !this.inventoryActive) { // Nothing's going on

        if (this.character && !this.character.clickToMove) { // character movement isn't clickable, should be!
          this.enableClicks(); // Enables movement after other actions end
        }
      }

      // While cut scenes are running, we constantly check whether we should go forward or not
      if (this.cutscene.isRunning) {
        if (!this.cutscene.completed[this.cutscene.currentId] && !this.cutscene.waitForNext) { // New individual scene starts
          this.runActionFunction(this.cutscene.current[this.cutscene.currentId]);
          this.cutscene.waitForNext = true; // Wait until the scene has completed
        }
        else if (this.cutscene.completed[this.cutscene.currentId]) { // One scene completed, go forward on next loop
          if (this.text != null) this.text.alpha = 0;
          this.text = null; // Future cut scene dialogues break unless this is done (just in case this was a dialogue, caused other problems if used when dialogues end)
          this.cutscene.currentId++; // Go forward
          this.cutscene.waitForNext = false; // Don't wait anymore (next loop will run the next cutscene function)
          if (this.cutscene.current[this.cutscene.currentId] == null) { // Cut scene completed, reset
            delete this.cutscene.current;
            this.cutscene.current= null;
            this.cutscene.currentId = 0;
            this.cutscene.isRunning = false;
            this.saveGame();
            this.changeGuiVisibility(1, 200); // Put GUI back
            // Uncomment these and comment out similar from 'killDialogue' and 'speechStopped'
            // if music volume shouldn't go up in the middle of things
            /*if (this.music != null && this.music.isPlaying) {
              if (this.musicSpeechTween != undefined && this.musicSpeechTween.isPlaying) {
                this.musicSpeechTween.stop();
              }
              console.log("tween music volume up");
              this.musicSpeechTween = this.game.add.tween(this.music).to({volume: this.musicVolume}, 5000, Phaser.Easing.Linear.None, true);
            }*/

            if (this.queuedActions && this.queuedActions.conditionalActions && this.queuedActions.conditionalActions.length > 1) {

              this.checkAndRunActions('queuedActions');
            }
          }
        }
      }

      // Only let the dialogue go forward by clicking anywhere, if there isn't a multi-choice question on screen (in that case you have to click on the answer to go forward) and if it hasn't finished
      if (this.dialogueInProgress && this.questionInput == null && !this.dialogueDelayInProgress) {
        if (this.killDialogueSoon == true) {
          this.killDialogueSoon = false;
          this.clickplate.events.onInputDown.addOnce(this.killDialogue, this, 100);
        }
        else {
          this.clickplate.events.onInputDown.addOnce(this.dialogueHandler, this);
        }
      }

    }
	},

  /**
   *  Arrange assets and NPC:s to correct Z order
   *  @alias arrangeRoomAssets
   */
  arrangeRoomAssets: function() {

    var assetsToArrange = jQuery.extend(true, [], this.room.items);
    while (assetsToArrange.length > 0) {
      var asset = assetsToArrange[assetsToArrange.length-1];
      if (asset.substr(0,4) == 'npc_') asset = asset.substr(4);
      var found = false;
      for (var i = this.bgItems.children.length-1; i >= 0; i--) {
        if (this.bgItems.children[i].machineName != undefined) {
          if (this.bgItems.children[i].machineName == asset) {
            this.bgItems.sendToBack(this.bgItems.children[i]);
            found = true;
          }
        }
        else {
          if (this.bgItems.children[i].name == asset) {
            this.bgItems.sendToBack(this.bgItems.children[i]);
            found = true;
          }
        }
        if (found) break;
      }
      if (found) {
        assetsToArrange.splice(assetsToArrange.length-1, 1);
        continue;
      }
      for (var i = this.fgItems.children.length-1; i >= 0; i--) {
        if (this.fgItems.children[i].machineName != undefined) {
          if (this.fgItems.children[i].machineName == asset) {
            this.fgItems.sendToBack(this.fgItems.children[i]);
            found = true;
          }
        }
        else {
          if (this.fgItems.children[i].name == asset) {
            this.fgItems.sendToBack(this.fgItems.children[i]);
            found = true;
          }
        }
        if (found) break;
      }
      // Remove item even if not found
      assetsToArrange.splice(assetsToArrange.length-1, 1);
    }
  },

  /**
   * Create following NPC's
   * @alias createFollowers
   */
  createFollowers: function() {
    // Get follower from characters
    for (var i = 0; i < Config.characters.length; i ++) {
      // Create all active followers
      npcName = Config.characters[i].machineName;
      if (this.npcState[npcName] && this.npcState[npcName].isFollowing) {
        this.createNpc(Config.characters[i], this.npcState[npcName].foreground);
      }
    }
  },

  /**
   * Create non-following NPC's
   * @alias createNonFollowingNpcs
   */
  createNonFollowingNpcs: function() {

    for (npcName in this.npcState) {
      if (this.npcState[npcName].attachedToRoom == this.room.name && !this.npcState[npcName].isFollowing) {
        this.createNpc(this.game.npcs[npcName], this.npcState[npcName].foreground);
      }
    }
  },

  /**
   * Prepare necessary scaling/resizing variables when creating an object
   * @alias prepareSpriteScale
   * @param {object} sprite The sprite or other object which was just created
   * @param {boolean} [returnSprite] Whether to return the sprite after modifying or not
   */
  prepareSpriteScale: function(sprite, returnSprite) {
    sprite.origX = this.copy(sprite.x);
    sprite.origY = this.copy(sprite.y);
    sprite.x = sprite.origX * this.scaleFactor;
    sprite.y = sprite.origY * this.scaleFactor;
    sprite.origWidth = this.copy(sprite.width);
    sprite.origHeight = this.copy(sprite.height);

    if (returnSprite) return sprite;
  },

  /**
   * Change the X coordinate of a character, either with a scaled or non-scaled value
   * @alias setCharX
   * @param {integer} charName Name of character to modify
   * @param {integer} [nonScaledX] The non-scaled X coordinate to change to
   * @param {integer} [scaledX] The scaled X coordinate to change to
   */
  setCharX: function (charName, nonScaledX, scaledX) {
    this[charName].scaledX = (scaledX != undefined && jQuery.type(scaledX) === 'number') ? scaledX : nonScaledX * this.scaleFactor;
    this[charName].nonScaledX = (nonScaledX != undefined && jQuery.type(nonScaledX) === 'number') ? nonScaledX : scaledX / this.scaleFactor;

    this[charName].x = this[charName].scaledX;
    this[charName].position.x = this[charName].scaledX;
    if (this.npcState[charName]) {
      this.npcState[charName].x = this[charName].nonScaledX;
    }
  },

  /**
   * Change the Y coordinate of a character, either with a scaled or non-scaled value
   * @alias setCharY
   * @param {integer} charName Name of character to modify
   * @param {integer} [nonScaledY] The non-scaled Y coordinate to change to
   * @param {integer} [scaledY] The scaled Y coordinate to change to
   */
  setCharY: function (charName, nonScaledY, scaledY) {

    this[charName].scaledY = (scaledY != undefined && jQuery.type(scaledY) === 'number') ? scaledY : nonScaledY * this.scaleFactor;
    this[charName].nonScaledY = (nonScaledY != undefined && jQuery.type(nonScaledY) === 'number') ? nonScaledY : scaledY / this.scaleFactor;

    this[charName].y = this[charName].scaledY;
    this[charName].position.y = this[charName].scaledY;
    if (this.npcState[charName]) {
      this.npcState[charName].y = this[charName].nonScaledY;
    }
  },

  /**
   * Define the Y coordinate where an NPC should be, when created in a room
   * @alias defineNpcY
   * @param {string} The name of the NPC
   */
  defineNpcY: function (npcName) {
    if (this.npcState[npcName]) {
      // Room-based exception to where a following NPC should be
      if (!this.npcState[npcName].isFollowing && (this.npcState[npcName].exceptionYs[this.gamestate.activeRoom] != undefined && jQuery.type(this.npcState[npcName].exceptionYs[this.gamestate.activeRoom]) === 'number')) {
        this.setCharY(npcName, this.npcState[npcName].exceptionYs[this.gamestate.activeRoom]);
      }
      else if (this.npcState[npcName].foreground) {
        this.setCharY(npcName, this.charSpawnY + 20);
      }
      else {
        this.setCharY(npcName, this.charSpawnY - 20);
      }
    }
  },

  /**
   * Resize all assets, images, characters etc in the game when creating or resizing the screen
   * @alias resizeGame
   * @param {integer} width New width
   * @param {integer} height New height
   */
  resizeGame: function(width, height) {

    //console.log('this.world.width'+this.world.width+' this.camera.width'+this.camera.width+' this.bg.width'+this.bg.width+' this.room.bgWidth'+this.room.bgWidth+' width:'+width+' height:'+height);

		this.game.width = width;
		this.game.height = height;

		this.camera.setSize(width, height);
		this.scaleFactor = height/this.game.origHeight;

		var bgWidth = this.room.bgWidth * this.scaleFactor;
		this.world.setBounds(0, 0, bgWidth, this.game.height);

		this.game.renderer.resize(width, height);

		$("#gameContainer").width(this.game.width);
		$("#gameContainer").height(this.game.height);
    this.fadeplate.fixedToCamera = false;
    this.fadeplate.x = this.fadeplate.y = 0;
		this.fadeplate.width = width;
		this.fadeplate.height = height;
    this.fadeplate.fixedToCamera = true;
    this.clickplate.fixedToCamera = false;
    this.clickplate.x = this.clickplate.y = 0;
		this.clickplate.width = width;
		this.clickplate.height = height;
    this.clickplate.fixedToCamera = true;

		if (this.room.bgImage != null || this.room.bgImage != undefined) {
			this.bg.width = Math.floor(this.room.bgWidth * this.scaleFactor);
			this.bg.height =  Math.floor(this.room.bgHeight * this.scaleFactor);
		}

		this.dialogMargin = Math.floor(-30*this.scaleFactor);
		this.textMargin = Math.floor(20*this.scaleFactor);
		this.textOffset = Math.floor(123*this.scaleFactor);

    this.setCharX('character', this.character.nonScaledX);
    this.setCharY('character', this.character.nonScaledY);

    this.character.scale.x = this.character.scaleDirection * this.character.defaultScale * this.scaleFactor;
    this.character.scale.y = this.character.defaultScale * this.scaleFactor;


    for (npcName in this.npcState) {
      if (this[npcName]) {
        this.setCharX(npcName, this[npcName].nonScaledX);
        this.setCharY(npcName, this[npcName].nonScaledY);
        this[npcName].scale.x = this[npcName].scaleDirection * this[npcName].defaultScale * this.scaleFactor;
        this[npcName].scale.y = this[npcName].defaultScale * this.scaleFactor;
      }
    }
		// Resize assets
    this.bgItems.forEach(function(asset) {
      if (!asset.machineName) {
        var fixed = this[asset.name].fixedToCamera;
        this[asset.name].fixedToCamera = false;
        this[asset.name].x = asset.origX * this.scaleFactor;
        this[asset.name].y = asset.origY * this.scaleFactor;
        this[asset.name].width = asset.origWidth * this.scaleFactor;
        this[asset.name].height = asset.origHeight * this.scaleFactor;
        if (fixed) this[asset.name].fixedToCamera = true;
      }
		}, this);

    this.fgItems.forEach(function(asset) {
      if (!asset.machineName) {
        var fixed = this[asset.name].fixedToCamera;
        this[asset.name].fixedToCamera = false;
        this[asset.name].x = asset.origX * this.scaleFactor;
        this[asset.name].y = asset.origY * this.scaleFactor;
        this[asset.name].width = asset.origWidth * this.scaleFactor;
        this[asset.name].height = asset.origHeight * this.scaleFactor;
        if (fixed) this[asset.name].fixedToCamera = true;
      }
		}, this);

    this.tintedAssetGroup.forEach(function(asset) {
      if (this.tempTintedAssets[asset.name]) {
        var fixed = this[asset.name].fixedToCamera;
        this.tempTintedAssets[asset.name].fixedToCamera = false;
        this.tempTintedAssets[asset.name].x = asset.origX * this.scaleFactor;
        this.tempTintedAssets[asset.name].y = asset.origY * this.scaleFactor;
        this.tempTintedAssets[asset.name].width = asset.origWidth * this.scaleFactor;
        this.tempTintedAssets[asset.name].height = asset.origHeight * this.scaleFactor;
        if (fixed) this.tempTintedAssets[asset.name].fixedToCamera = true;
      }
    }, this);

    for (var i = 0; i < this.questLogIcons.length; i++) {
      this.questLogIcons[i].fixedToCamera = false;
      this.questLogIcons[i].x = this.questLogIcons[i].origX * this.scaleFactor;
      this.questLogIcons[i].y = this.questLogIcons[i].origY * this.scaleFactor;
      this.questLogIcons[i].width = this.questLogIcons[i].origWidth * this.scaleFactor;
      this.questLogIcons[i].height = this.questLogIcons[i].origHeight * this.scaleFactor;
      this.questLogIcons[i].fixedToCamera = true;
    }

    /*DON'T DELETE YET; will need these still
      this.playerNameTextObjects.forEach(function(text) {
      textObj = this.playerNameTexts[text.name].obj;
			textObj.x = textObj.origX * this.scaleFactor;
			textObj.y = textObj.origY * this.scaleFactor;
			textObj.width = textObj.origWidth * this.scaleFactor;
			textObj.height = textObj.origHeight * this.scaleFactor;
		}, this);*/

    // Resize playerNameTexts
    for (var textId in this.playerNameTexts) {
       this.playerNameTexts[textId].obj.x = this.playerNameTexts[textId].x * this.scaleFactor;
       this.playerNameTexts[textId].obj.y = this.playerNameTexts[textId].y * this.scaleFactor;
       var playerTextStyle = { font: this.playerNameTexts[textId].fontsize * this.scaleFactor + "px " + this.playerNameTexts[textId].font, fill: "#"+this.playerNameTexts[textId].color };
       this.playerNameTexts[textId].obj.setStyle(playerTextStyle);
    }


    this.iconGroup.forEach(function(icon) {
      if (this[icon.name]) {
		 this[icon.name].fixedToCamera = false;
		 //this[icon.name].x = icon.origX * this.scaleFactor;
         this[icon.name].y = icon.origY * this.scaleFactor;
         this[icon.name].width = icon.origWidth * this.scaleFactor;
         this[icon.name].height = icon.origHeight * this.scaleFactor;
		 this[icon.name].fixedToCamera = true;
      }
		}, this);
    this.arrangeInventory(); // For adjusting x-axis


    this.guiElementGroup.forEach(function(element) {
      if (this[element.name]) {
        this[element.name].fixedToCamera = false;

        if (element.origOffsetX != undefined) {
          this[element.name].x = this.game.width - element.origOffsetX * this.scaleFactor;
        }
        else {
          if (element.name == 'headerBg') {
            this[element.name].x = this.centerPoint;
          }
          else {
            this[element.name].x = element.origX * this.scaleFactor;
          }
        }
        if (element.origOffsetY != undefined) {
          this[element.name].y = element.origOffsetY * this.scaleFactor;
        }
        else {
          this[element.name].y = element.origY * this.scaleFactor;
        }
        if (element.name == "playerMoney") {
          var moneyFontsize = Math.floor(52 * this.scaleFactor);
          this[element.name].setStyle({ font: moneyFontsize + "px troikaregular", fill: "#EA7C00" });
        }
        else {
          this[element.name].width = element.origWidth * this.scaleFactor;
          this[element.name].height = element.origHeight * this.scaleFactor;
        }
        this[element.name].fixedToCamera = true;
      }
		}, this);

    // Declarations
    var textSize = Math.floor(24 * this.scaleFactor);
    this.textstyle.font = textSize + "px opendyslexicregular";
    this.textstyle.wordWrapWidth = Math.floor(975 * this.scaleFactor);
    this.textX = 170 * this.scaleFactor;
    this.textY = 646 * this.scaleFactor;
    this.centerPoint = this.game.width * 0.5;

    // Quest log
    this.resizeQuestLog();


    this.textBgs.forEach(function(image) {
      image.fixedToCamera = false;
      image.x = image.origX * this.scaleFactor;
      image.y = image.origY * this.scaleFactor;
      if (image.name == "sayerText") {
        var sayerFontSize = Math.floor(26 * this.scaleFactor);
        var sayerTextMargin = 20 * this.scaleFactor;
        image.setStyle({ font: sayerFontSize + "px troikaregular", fill: "#FFF"});
        while (sayerFontSize > 1 && image.getBounds().width + sayerTextMargin > this.textBgsSayerBg.width) {
          sayerFontSize--;
          image.setStyle({ font: sayerFontSize + "px troikaregular", fill: "#FFF"});
        }
      }
      else {
        image.width = image.origWidth * this.scaleFactor;
        image.height = image.origHeight * this.scaleFactor;
      }
      image.fixedToCamera = true;
    }, this);
    //this.textBgs.fixedToCamera = true;

    if (this.textBgSayer) {
      this.textBgSayer.fixedToCamera = false;
      this.textBgSayer.x = this.textBgSayer.origX * this.scaleFactor;
      this.textBgSayer.y = this.textBgSayer.origY * this.scaleFactor;
      this.textBgSayer.width = this.textBgSayer.origWidth * this.scaleFactor;
      this.textBgSayer.height = this.textBgSayer.origHeight * this.scaleFactor;
      this.textBgSayer.fixedToCamera = true;
    }

		// Resize dialogue
		if (this.dialogueInProgress) {

      if (this.text != null) {
        this.text.fixedToCamera = false;
        if (this.text.setStyle) {
          this.text.setStyle(this.textstyle);
        }
        this.text.x = this.textX;
        this.text.y = this.textY;
        this.text.fixedToCamera = true;
      }
      if (this.headerText != null) {
        this.headerText.fixedToCamera = false;
        this.headerText.x = this.centerPoint;
        this.headerText.y = 125 * this.scaleFactor;
        var headerSize = Math.floor(32 * this.scaleFactor);
        this.headerText.fontSize = headerSize;
        this.headerText.fontWeight = "bold";
        this.headerText.font = "opendyslexicregular";
        this.headerText.fixedToCamera = true;
      }

      if (this.textArray != null) {
        var offsetTop = (this.textArray.length <= 6) ? (120 + (6*90 - this.textArray.length * 90)/2) : 120;

        for (var i = 0; i < this.textArray.length; i++) {
          var buttonX = 10 * this.scaleFactor;
          var buttonY = offsetTop * this.scaleFactor + i * 90 * this.scaleFactor;
          if (i >= 6) {
            buttonX = this.centerPoint/2 + buttonX;
            buttonY = offsetTop * this.scaleFactor + (i - 6) * 90 * this.scaleFactor;
          }
          this.textArray[i].fixedToCamera = false;
          this.textArray[i].x = buttonX + 623/2 * this.scaleFactor;
          this.textArray[i].y = buttonY + 63 * this.scaleFactor;
          this.textArray[i].setStyle(this.textstyle);
          this.textArray[i].fixedToCamera = true;
        }
      }

      if (this.answerButtons != null) {
        var offsetTop = (this.textArray.length <= 6) ? (120 + (6*90 - this.textArray.length * 90)/2) : 120;
        for (var i = 0; i < this.answerButtons.length; i++) {
          var buttonX = 10 * this.scaleFactor;
          var buttonY = offsetTop * this.scaleFactor + i * 90 * this.scaleFactor;
          if (i >= 6) {
            buttonX = this.centerPoint/2 + buttonX;
            buttonY = offsetTop * this.scaleFactor + (i - 6) * 90 * this.scaleFactor;
          }
          this.answerButtons[i].fixedToCamera = false;
          this.answerButtons[i].x = buttonX;
          this.answerButtons[i].y = buttonY;
          this.answerButtons[i].width = 623 * this.scaleFactor;
          this.answerButtons[i].height = 82 * this.scaleFactor;
          this.answerButtons[i].fixedToCamera = true;
        }
      }
		}

    this.resizeInfoBox();
		// Pause menu
		if (this.pauseMenu_bg != undefined) {

		  this.pauseMenu_bg.fixedToCamera = false;
      this.pauseMenu_bg.x = this.pauseMenu_bg.y = 0;
		  this.pauseMenu_bg.width = this.pauseMenu_bg.origWidth * this.scaleFactor;
		  this.pauseMenu_bg.height = this.pauseMenu_bg.origHeight * this.scaleFactor;
		  this.pauseMenu_bg.fixedToCamera = true;

		  var headerTextSize = Math.floor(76 * this.scaleFactor);
		  var subheaderTextSize = Math.floor(52 * this.scaleFactor);
		  this.headerTextstyle = { font: headerTextSize + "px opendyslexicregular", fill: "#000" };
		  this.subheaderTextstyle = { font: subheaderTextSize + "px opendyslexicregular", fill: "#000" };

		  this.settingsTitle.fixedToCamera = false;
		  this.settingsTitle.x = this.centerPoint;
		  this.settingsTitle.y = 50 * this.scaleFactor;
		  this.settingsTitle.setStyle(this.headerTextstyle);
		  this.settingsTitle.fixedToCamera = true;

		  this.speechTitle.fixedToCamera = false;
		  this.speechTitle.x = this.centerPoint;
		  this.speechTitle.y = 200 * this.scaleFactor;
		  this.speechTitle.setStyle(this.subheaderTextstyle);
		  this.speechTitle.fixedToCamera = true;

		  this.speechButton.fixedToCamera = false;
		  this.speechButton.x = this.centerPoint + 30 * this.scaleFactor;
		  this.speechButton.y = 200 * this.scaleFactor;
		  this.speechButton.width = this.speechButton.origWidth * this.scaleFactor;
		  this.speechButton.height = this.speechButton.origHeight * this.scaleFactor;
		  this.speechButton.fixedToCamera = true;

		  this.fxTitle.fixedToCamera = false;
		  this.fxTitle.x = this.centerPoint;
		  this.fxTitle.y = 280 * this.scaleFactor;
		  this.fxTitle.setStyle(this.subheaderTextstyle);
		  this.fxTitle.fixedToCamera = true;

		  this.fxButton.fixedToCamera = false;
		  this.fxButton.x = this.centerPoint + 30 * this.scaleFactor;
		  this.fxButton.y = 280 * this.scaleFactor;
		  this.fxButton.width = this.fxButton.origWidth * this.scaleFactor;
		  this.fxButton.height = this.fxButton.origHeight * this.scaleFactor;
		  this.fxButton.fixedToCamera = true;

		  this.musicTitle.fixedToCamera = false;
		  this.musicTitle.x = this.centerPoint;
		  this.musicTitle.y = 360 * this.scaleFactor;
		  this.musicTitle.setStyle(this.subheaderTextstyle);
		  this.musicTitle.fixedToCamera = true;

		  this.musicButton.fixedToCamera = false;
		  this.musicButton.x = this.centerPoint + 30 * this.scaleFactor;
		  this.musicButton.y = 360 * this.scaleFactor;
		  this.musicButton.width = this.musicButton.origWidth * this.scaleFactor;
		  this.musicButton.height = this.musicButton.origHeight * this.scaleFactor;
		  this.musicButton.fixedToCamera = true;

		  this.fullscreenTitle.fixedToCamera = false;
		  this.fullscreenTitle.x = this.centerPoint;
		  this.fullscreenTitle.y = 440 * this.scaleFactor;
		  this.fullscreenTitle.setStyle(this.subheaderTextstyle);
		  this.fullscreenTitle.fixedToCamera = true;

		  this.fullscreenButton.fixedToCamera = false;
		  this.fullscreenButton.x = this.centerPoint + 30 * this.scaleFactor;
		  this.fullscreenButton.y = 440 * this.scaleFactor;
		  this.fullscreenButton.width = this.fullscreenButton.origWidth * this.scaleFactor;
		  this.fullscreenButton.height = this.fullscreenButton.origHeight * this.scaleFactor;
		  this.fullscreenButton.fixedToCamera = true;

		  this.backButton.fixedToCamera = false;
		  this.backButton.x = this.centerPoint;
		  this.backButton.y = 640 * this.scaleFactor;
		  this.backButton.width = this.backButton.origWidth * this.scaleFactor;
		  this.backButton.height = this.backButton.origHeight * this.scaleFactor;
		  this.backButton.fixedToCamera = true;
		}
    $("#gameContainer").show();
	},

  /**
   * Put background and assets to a room
   * @alias createRoom
   */
  createRoom: function() {
    $("#roomInfoBox").html(this.gamestate.activeRoom);
    this.room = this.getRoom(this.gamestate.activeRoom);
    this.bg = this.game.add.image(0, 0, 'bg_' + this.room.name);
    this.playerNameBgTextObjects = this.game.add.group();
    this.bgItems = this.game.add.group();
    this.characterGroup = this.game.add.group();
    this.fgItems = this.game.add.group();
    this.playerNameFgTextObjects = this.game.add.group();
    this.tintedAssetGroup = this.game.add.group();
	  this.checkAndPlayMusic(); // See if music should be playing and start it if applicable

    // Loop through assets in the room and create them
    for (var i = 0; i < this.room.assets.length; i++) {
      if (this.room.assets[i].machineName == undefined) { // Only NPC's have machine names, don't create them here
        this.createAsset(this.room.assets[i]);
      }
    }

    // Create the player names if applicable
    for (textId in this.playerNameTexts) {
      if (this.playerNameTexts[textId].room == this.room.name) {
        this.addPlayerName(textId, this.room.name);
      }
    }

    this.game.world.sort();

    // Basic things for every room
    this.game.world.setBounds(0, 0, this.room.bgWidth, this.room.bgHeight); //	here we set the bounds for the world, should be same size as the background image

    this.saveGame();
  },

  /**
   * Check the current state of music and music settings, and stop/start/change it accordingly.
   * Gets run always when changing music settings and when going to a new room.
   * @alias checkAndPlayMusic
   */
  checkAndPlayMusic: function() {

    // Set music null if not defined for condition checks
    if (this.music == undefined) this.music = null;

    if (this.game.musicEnabled && (this.musicLastingAcrossRooms == undefined || this.musicLastingAcrossRooms == false)) { // Play/change music if enabled and previous music shouldn't continue
      // Old music functionality commented out!
      // Music already running and room changing to one with a different track, change track through fading
      if (this.music != null && this.room.music != null && this.room.music != "" && this.music.key != 'music_' + this.room.music) {
        this.musicTween = this.game.add.tween(this.music).to({volume: 0}, this.defaultMusicFadeTime, Phaser.Easing.Linear.None, true);
        this.musicTween.onComplete.add(
          function() {
            if (this.music != null && this.music.game != undefined && this.music.game != null) {
              this.music.onStop.removeAll();
              this.music.stop();
              this.music.destroy();
              this.music = null;
            }
            this.music = this.game.add.audio('music_' + this.room.music);
            this.music.volume = this.musicVolume;
            // this.music.loop = true;
            // Set music looping
            // Chrome audio loop bug fix
            // http://www.html5gamedevs.com/topic/13947-audio-not-looping-in-chrome/
            this.music.onStop.add(function() {
              if (this.music != null && this.music.game != undefined && this.music.game != null) {
                this.music.play();
              }
            }, this);
            this.music.play();
            //this.game.add.tween(this.music).to({volume: this.musicVolume}, 500, Phaser.Easing.Linear.None, true);
          }, this);
      }
      // First room music starting or music enabled from pause menu
      else if (this.room.music && this.room.music != "" && (this.music == null || (!this.music.isPlaying && this.game.musicEnabled))) {
        if (this.music != null && this.music.game != undefined && this.music.game != null) {
          this.music.onStop.removeAll();
          this.music.stop();
          this.music.destroy();
          this.music = null;
          //this.music.destroy();
        }
        this.music = this.game.add.audio('music_' + this.room.music);
        // this.music.loop = true;
        // Set music looping
        // Chrome audio loop bug fix
        // http://www.html5gamedevs.com/topic/13947-audio-not-looping-in-chrome/
        if (this.game.musicEnabled) {
        this.music.onStop.add(function() {
          if (this.music != null && this.music.game != undefined && this.music.game != null) {
            this.music.play();
          }
				}, this);
        }

        this.music.volume = this.musicVolume;
        this.music.play();
        //var musicTween = this.game.add.tween(this.music).to({volume: this.musicVolume}, 500, Phaser.Easing.Linear.None, true);
      }
      // Music enabled in map (or any room with no music defined)
      else if ((this.music != null && this.music.isPlaying) && (this.room.music == null || this.room.music == "")) {
        this.musicTween = this.game.add.tween(this.music).to({volume: 0}, this.defaultMusicFadeTime, Phaser.Easing.Linear.None, true);
        this.musicTween.onComplete.add(
          function() {
            if (this.music != null && this.music.game != undefined && this.music.game != null) {
              this.music.onStop.removeAll();
              this.music.stop();
              this.music.destroy();
            }
            this.music = null;
          }, this);
      }
    }
    // Music disabled from pause menu
    else if (this.music != null && this.music.isPlaying && !this.game.musicEnabled) {
      if (this.music.game != undefined && this.music.game != null) {
        this.music.onStop.removeAll();
        this.music.stop();
        this.music.destroy();
      }
      this.music = null;
    }

  },

  /**
   * Change background music.
   * Function available in editor.
   * @alias changeMusic
   * @param {string} roomName Name of room where to change music (permanently per room)
   * @param {string} music Name of new music to be played
   */
  changeMusic: function(musicId, lastAcrossRooms, loop, fadeTime) {

    function handleOnstop(loop, that) {

      if (loop === true) {
        // HACKED
        if (window['PhaserGlobal'] != undefined && window['PhaserGlobal'].disableWebAudio) {
          that.music.loop = false;
          that.music.onStop.add(
          function () {
            if (that.music != null && that.music.game != undefined && that.music.game != null) {
              that.music.play();
            }
          }, that);
        }
        else {
          // Normal way
          that.music.loop = true;
        }
      }
      else {
        that.music.loop = false;
        that.music.onStop.add(
          function () {
            that.musicLastingAcrossRooms = false;
            that.checkAndPlayMusic();
          }, that);
      }
    }

    // Set music null if not defined for condition checks
    if (this.music == undefined) this.music = null;

    if (this.game.musicEnabled) {
      var fadeOutTime = (fadeTime != undefined) ? fadeTime : this.defaultMusicFadeTime;

      if (this.music != null && this.music.isPlaying) {
        this.musicTween = this.game.add.tween(this.music).to({volume: 0}, fadeOutTime, Phaser.Easing.Linear.None, true);
      }

      if (musicId != 'silence') {
        if (this.music != null && this.music.isPlaying) {
          this.musicTween.onComplete.add(
            function() {
              if (this.music != null && this.music.game != undefined && this.music.game != null) {
                this.music.onStop.removeAll();
                this.music.stop();
                this.music.destroy();
                this.music = null;
              }
              this.music = this.game.add.audio('music_' + musicId);
              this.music.volume = this.musicVolume;
              this.music.play();
              //this.game.add.tween(this.music).to({volume: this.musicVolume}, 200, Phaser.Easing.Linear.None, true);
              // Loop must be enabled after onComplete callback
              handleOnstop(loop, this);
            }, this);
        }
        else {
          if (this.music != null && this.music.game != undefined && this.music.game != null) {
            this.music.onStop.removeAll();
            this.music.stop();
            this.music.destroy();
            this.music = null;
          }
          this.music = this.game.add.audio('music_' + musicId);
          this.music.volume = this.musicVolume;
          this.music.play();
          //this.game.add.tween(this.music).to({volume: this.musicVolume}, 200, Phaser.Easing.Linear.None, true);
          handleOnstop(loop, this);
        }
      }
      else { // silence
        if (this.music != null && this.music.game != undefined && this.music.game != null) {
          this.music.onStop.removeAll();
          this.music.stop();
          this.music.destroy();
        }
        this.music = null;
      }

      this.musicLastingAcrossRooms = (lastAcrossRooms) ? true : false; // Will also stop anything playing if silence is ongoing
    }

    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'changeMusic') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Create an NPC
   * @alias createNpc
   * @param {object} npc The config entry for the NPC
   * @param {boolean} [foreground] Whether the NPC is foreground or not (undefined = false)
   */
  createNpc: function (npc, foreground) {

    var npcName = npc.machineName;

    this[npcName] = this.game.add.sprite(325 * this.scaleFactor, 390 * this.scaleFactor, npc.spriteAtlas);
    this.addDefinedAnimations(npc);

		this[npcName].defaultScale = 1;
    this[npcName].scaleWithRoom = (npc.scaleWithRoom == undefined || npc.scaleWithRoom) ? true : false;
    if (this.npcState[npcName].tempAnchor) {
      this[npcName].anchor.set(this.npcState[npcName].tempAnchor[0], this.npcState[npcName].tempAnchor[1]);
      this.flipNpc(npcName, 'right');
    }
    else {
      this[npcName].anchor.set(0.5, 1);
    }
    this[npcName].defaultAnchor = [0.5, 1];
    this[npcName].machineName = npc.machineName;
    this[npcName].nickName = npc.nick;
    this.defineNpcY(npcName);

    this[npcName].origWidth = Math.floor(this[npcName].width);
    this[npcName].origHeight = Math.floor(this[npcName].height);

    if (this.room.scale != undefined && this[npcName].scaleWithRoom) {
      this[npcName].defaultScale = this.room.scale;
    }
		this[npcName].scale.x = this[npcName].defaultScale * this.scaleFactor;
		this[npcName].scale.y = this[npcName].defaultScale * this.scaleFactor;

    if (!this.npcState[npcName].visible) { // Hide invisible npc's
      this[npcName].alpha = 0;
    }

    if (this.npcState[npcName].isFollowing) {

      if (this.character.scaleDirection == -1) { // Character faces left
        if (this.character.nonScaledX + this.followerOffsetFromChar + this[npcName].origWidth > this.bg.width) {
          // There is no room for the NPC behind the character; Move character left so that there is!
          //this.setCharX('character', this.bg.width - this[npcName].origWidth - this.followerOffsetFromChar);
        }
        this[npcName].spawnX = this.character.nonScaledX + this.followerOffsetFromChar;
        this.npcState[npcName].faceDirection = 'left';
      }
      else { // Character faces right
        if (this.character.nonScaledX - this.followerOffsetFromChar - this[npcName].origWidth < 0) {
          // There is no room for the NPC behind the character -> Move character right so that there is!
          //this.setCharX('character', this[npcName].origWidth + this.followerOffsetFromChar);
        }
        this[npcName].spawnX = this.character.nonScaledX - this.followerOffsetFromChar;
        this.npcState[npcName].faceDirection = 'right';
      }
    }
    else {
      this[npcName].spawnX = this.npcState[npcName].x;
    }

    this.setCharX(npcName, this[npcName].spawnX);
    this.flipNpc(npcName, this.npcState[npcName].faceDirection);
    this.game.world.add(this[npcName]);
    if (this.npcState[npcName].currentIdle != undefined && this.npcState[npcName].currentIdle != '') {
      this[npcName].currentIdle = this.npcState[npcName].currentIdle;
    }
    this.startIdleAni(npcName);
    //console.log("current idle animation for "+npcName);
    //console.log(npcName.currentIdle);

    this.options = {};

    if (!foreground) {
      this.bgItems.add(this[npcName]);
    }
    else {
      this.fgItems.add(this[npcName]);
    }
    // Action input to the npc
    if ((npc.conditionalActions && npc.conditionalActions.length > 0) || (npc.defaultActions && npc.defaultActions.length > 0)) {

      // Save conditional actions to npc object for further use
      if (npc.conditionalActions && npc.conditionalActions.length > 0) {
        this[npcName].conditionalActions = npc.conditionalActions;
      }

      // Save default (non-conditional) actions to npc object
      if (npc.defaultActions && npc.defaultActions.length > 0) {
        this[npcName].defaultActions = npc.defaultActions;
      }

      this[npcName].inputEnabled = true;
      this.clickables.push(this[npcName]);
      this[npcName].name = npcName;
      this[npcName].events.onInputDown.add(function() {
          console.log('KLIKATTU NPC: '+ this[npcName].name);
          if (!this.cutscene.isRunning) {
            this.checkAndRunActions(this[npcName].name); // checkAndRunActions() needs the name of the asset as a parameter
          }
          else {
            console.log('Npc:n actioneita ei ajettu, koska cutscene on päällä');
          }
        }, this);
      this[npcName].input.enabled = true;
      this[npcName].input.pixelPerfectClick = true;

      if (!this.npcState[npcName].visible) {
        this[npcName].input.enabled = false;
      }
    }

    if (!this.npcState[npcName].isFollowing && this.npcState[npcName].defaultAnimation != null && this.npcState[npcName].defaultAnimation != "") {
      this.playAnimation(npcName, this.npcState[npcName].defaultAnimation);
    }
  },

  /**
   * Create an individual asset based on the settings it has
   * @alias createAsset
   * @param {object} asset The config entry for the asset
   */
  createAsset: function (asset) {

    // These might exist if creating new content to the game while loading it from an existing save
    if (this.assetState[asset.name] == undefined && asset.name != undefined) {
      this.assetState[asset.name] = {};
    }

    // When loading the game, everything that has been changed is now only in assetState
    for (modifiedProp in this.assetState[asset.name]) {
      asset[modifiedProp] = this.copy(this.assetState[asset.name][modifiedProp]);
    }

    // Big assets might have atlases of their own instead of the room defaults
    if (asset.customAtlas == null || asset.customAtlas == "") {
      this[asset.name] = this.game.add.sprite(asset.x, asset.y, this.room.atlasName);
    }
    else {
      this[asset.name] = this.game.add.sprite(asset.x, asset.y, asset.customAtlas);
      this[asset.name].customAtlas = asset.customAtlas;
    }

    if (asset.description != undefined && asset.description != "") {
      this[asset.name].description = asset.description;
    }

    //if asset is fixed to camera, enable that. This is mostly used for whole screen cutscenes.
    if (asset.fixed == true) {
      this[asset.name].fixedToCamera = true
    }

    // If asset is rotated, then rotate it
    if (asset.rotation != null) {
      this[asset.name].angle = asset.rotation;
    }


    // Asset approaching offsets and forced directions
    if (asset.aoLeft) {
      this[asset.name].aoLeft = asset.aoLeft;
    }
    if (asset.aoRight) {
      this[asset.name].aoRight = asset.aoRight;
    }
    if (asset.forcedApproachDirection) {
      this[asset.name].forcedApproachDirection = asset.forcedApproachDirection;
    }

    // If no default frame name has been defined, use the asset name
    this[asset.name].frameName = (asset.defaultFrame != null && asset.defaultFrame != "") ? asset.defaultFrame : asset.name;

    this[asset.name].name = asset.name;
    this[asset.name].icon = asset.icon;

    if (asset.foreground == null || asset.foreground == false) {
      this.bgItems.add(this[asset.name]);
    }
    else {
      this.fgItems.add(this[asset.name]);
    }

    // Save conditional actions to asset object for further use
    if (asset.conditionalActions && asset.conditionalActions.length > 0) {
      this[asset.name].conditionalActions = asset.conditionalActions;
    }

    // Save default (non-conditional) actions to asset object
    if (asset.defaultActions && asset.defaultActions.length > 0) {
      this[asset.name].defaultActions = asset.defaultActions;
    }

    // Invisible assets
    if (asset.invisible) {
      this[asset.name].alpha = 0;
      asset.disabled = true;
    }

    this.prepareSpriteScale(this[asset.name]);

    // All the assets where input is needed
    if ((asset.dialogueId && asset.dialogueId != "") || (asset.doorTarget && asset.doorTarget != "") || (asset.doorTargetTemp && asset.doorTargetTemp != "")  || (asset.defaultActions && asset.defaultActions.length > 0) || (asset.conditionalActions && asset.conditionalActions.length > 0) || (asset.hoverFrame && asset.hoverFrame != "") || (asset.clickSound && asset.clickSound != "") || (asset.hoverSound && asset.hoverSound != "") || asset.pickable) {

      this[asset.name].inputEnabled = true; // First things first
      this.clickables.push(this[asset.name]);

      if (asset.dialogueId != null && asset.dialogueId != "") {
        this[asset.name].dialogue = this.getDialogue(asset.dialogueId);
        this.defineAssetInput(asset.name, 'dialogue');
      }

      // Ignore clicks on transparent pixels with this (expensive operation, use sparingly)
      if (asset.transparentClick != null && asset.transparentClick) {
        this[asset.name].input.pixelPerfectClick = true;
        //this[asset.name].input.pixelPerfectOver = true; // Much more expensive since it needs to be checked on each frame!
      }

      if (asset.pickable != null && asset.pickable) {
        this.defineAssetInput(asset.name, 'pickable');
      }

      // Enable hover functionality (changing frames) in a separate function
      if (asset.hoverFrame != null && asset.hoverFrame != "") {
        this.enableAssetHover(asset.name, asset.defaultFrame, asset.hoverFrame);
      }
      // For showing in ui where door leads
      if (asset.name.indexOf("doorTo") != -1) {
      var targetRoom = asset.name.replace(this.room.name + "_doorTo_", "");
      this[asset.name].events.onInputOver.add(function() {
        $("#roomInfoBox").html(targetRoom);
      }, this);
          this[asset.name].events.onInputOut.add(function() {
            $("#roomInfoBox").html(this.room.name);
          }, this);
      }
      // Enable sound for hovering asset
      if (asset.hoverSound != null && asset.hoverSound != "") {
        this[asset.name].hoverSound = asset.hoverSound;
        this[asset.name].events.onInputOver.add(function() {
          if (this.game.speechEnabled && !this.clickSoundPlaying && !this.speechOngoing) {
            var audiosprite = false;
            // First item is key
            var audioObject = this.game.sounds.audio[this[asset.name].hoverSound[0]];
            if (this[asset.name].hoverSound.length > 1) {
              audiosprite = true;
              audioObject = this.game.sounds.audiosprite[this[asset.name].hoverSound[1]];
            }
            else {
              audioObject.volume = this.hoverVolume;
            }
            if ((!audiosprite && this.currentSound != audioObject) || (audiosprite && this.currentSound != audioObject.get(this[asset.name].hoverSound[0]))) {
              if (this.currentSound != null) {

                if (this.currentSound.isPlaying) {
                  this.currentSound.stop();
                }
              }
              this.hoverSoundPlaying = true;

              if (!audiosprite) {
                this.currentSound = audioObject;
                audioObject.play();
                audioObject.onStop.add(function() {
                  this.hoverSoundPlaying = false;
                  this.currentSound = null;
                }, this);
              }
              else {
                this.currentSound = audioObject.get(this[asset.name].hoverSound[0]);
                audioObject.play(this[asset.name].hoverSound[0], this.hoverVolume);
                audioObject.get(this[asset.name].hoverSound[0]).onStop.add(function() {
                  this.hoverSoundPlaying = false;
                  this.currentSound = null;
                }, this);
              }
            }
          }
        }, this);
      }
      // Enable sound for clicking asset
      // CHROME IF
      //if (this.game.device.chrome && !this.game.device.mspointer) {
        if (asset.clickSound != null && asset.clickSound != "") {
          this[asset.name].clickSound = asset.clickSound;
          this[asset.name].events.onInputDown.add(function() {
              if (this.game.fxEnabled) {
                var audiosprite = false;
                var audioObject = this.game.sounds.audio[this[asset.name].clickSound[0]];
                if (this[asset.name].clickSound.length > 1) {
                  audiosprite = true;
                  audioObject = this.game.sounds.audiosprite[this[asset.name].clickSound[1]];
                }
                else {
                  audioObject.volume = this.clickVolume;
                }
                if ((!audiosprite && this.currentSound != audioObject) || (audiosprite && this.currentSound != audioObject.get(this[asset.name].clickSound[0]))) {
                  if (this.currentSound != null) {
                    if (this.currentSound.isPlaying) {
                      this.currentSound.stop();
                    }
                  }
                  this.clickSoundPlaying = true;

                  if (!audiosprite) {
                    this.currentSound = audioObject;
                    audioObject.play();
                    audioObject.onStop.add(function() {
                      this.clickSoundPlaying = false;
                      this.currentSound = null;
                    }, this);
                  }
                  else {
                    this.currentSound = audioObject.get(this[asset.name].clickSound[0]);
                    audioObject.play(this[asset.name].clickSound[0], this.clickVolume);
                    audioObject.get(this[asset.name].clickSound[0]).onStop.add(function() {
                      this.clickSoundPlaying = false;
                      this.currentSound = null;
                    }, this);
                  }
                }
              }
           }, this);
        }
      //}

      // Run some custom code when this asset is clicked
      if ((asset.defaultActions && asset.defaultActions.length > 0) || (asset.conditionalActions && asset.conditionalActions.length > 0)) {
        this.defineAssetInput(asset.name, 'action');
      }

      // The asset is a door or gateway to another room
      if ((asset.doorTarget != null && asset.doorTarget != "") || (asset.doorTargetTemp != null && asset.doorTargetTemp != "")) {

        this[asset.name].doorTarget = asset.doorTarget;
        if (asset.doorTargetTemp) {
          this[asset.name].doorTargetTemp = asset.doorTargetTemp;
        }
        // Custom spawn point and face if applicable (differing from the room defaults)
        this[asset.name].doorSpawn = (asset.doorSpawn) ? asset.doorSpawn : null;
        this[asset.name].doorFace = (asset.doorFace) ? asset.doorFace : null;

        this.defineAssetInput(asset.name, 'door');
      }

      this[asset.name].disabled = (asset.disabled !== true) ? false : true;
      if (this[asset.name].disabled) {
        this.disableAssetInput(asset.name);
      }

      /*if (!asset.disabled && !asset.invisible && this[asset.name].description != undefined) {
        this.defineAssetInput(asset.name, 'description');
      }*/
    }
    else if (!asset.disabled && !asset.invisible && this[asset.name].description != undefined) { // Described assets have inputs even when nothing else happens
      this[asset.name].inputEnabled = true;
      if (asset.transparentClick != null && asset.transparentClick) {
        this[asset.name].input.pixelPerfectClick = true;
      }
      this.clickables.push(this[asset.name]);
      this.defineAssetInput(asset.name, 'description');
    }

    // Add defined animations
    if (asset.animations != null && asset.animations.length > 0) {

      this.addDefinedAnimations(asset);

      // Some animation to play immediately when entering a room
      if (asset.defaultAnimation != null && asset.defaultAnimation != "" && this[asset.name].alpha > 0) {
        this.playAnimation(asset.name, asset.defaultAnimation);
      }
    }
  },

  /**
   * Make asset clickable and/or hoverable, whatever the settings are
   * @alias enableAssetInput
   * @param {string} assetName The name of the asset.
   */
  enableAssetInput: function(assetName) {
    if (this[assetName] != null && this[assetName].input != null && this[assetName].alpha != 0) {
      if (this[assetName].hadInputEnabled === false) {
        this[assetName].hadInputEnabled = true;
      }
      this[assetName].input.enabled = true;
      this.modifyAsset(assetName, 'disabled', false);
      this[assetName].disabled = false;
    }
  },

  /**
   * Create all the animations that should be tied to the asset
   * @alias addDefinedAnimations
   * @param {object} asset The config object for the asset
   */
  addDefinedAnimations: function (asset) {
    var assetName = (asset.machineName != undefined) ? asset.machineName : asset.name;

    // Player character is this.character
    if (this.gamestate.character == assetName) assetName = "character";

    if (asset.animations) {
      this[assetName].currentAtlas = (this[assetName].spriteAtlas != undefined) ? this[assetName].spriteAtlas : "";

      for (var j = 0; j < asset.animations.length; j++) {

        var frameNameHelper = asset.animations[j].generateFrameNames;
        if (frameNameHelper != undefined && frameNameHelper.length > 0) {
          // 0 = prefix, 1 = startNo, 2 = endNo, 3 = suffix, 4 = zeroPad (how many numbers between prefix and suffix)
          var frameNames = Phaser.Animation.generateFrameNames(frameNameHelper[0], frameNameHelper[1], frameNameHelper[2], frameNameHelper[3], frameNameHelper[4]);
          if (frameNameHelper[5]) { // Sixth parameter means that the animation should be repeated in reverse order, so just concat with switching 1 and 2 around.
            frameNames = frameNames.concat(Phaser.Animation.generateFrameNames(frameNameHelper[0], frameNameHelper[2], frameNameHelper[1], frameNameHelper[3], frameNameHelper[4]));
          }
        }
        else {
          var frameNames = asset.animations[j].frames; // Hand-defined frame names
        }
        if (this[assetName].currentAtlas != undefined && asset.animations[j].tempAtlas != undefined && this[assetName].currentAtlas != asset.animations[j].tempAtlas) {
          // Correct texture must be loaded before adding frames from it to animation
          this[assetName].loadTexture(asset.animations[j].tempAtlas);
          this[assetName].currentAtlas = asset.animations[j].tempAtlas;
        }
        this[assetName].animations.add([asset.animations[j].name], frameNames, asset.animations[j].fps, asset.animations[j].loop);
        this[assetName].animations._anims[asset.animations[j].name].tempAtlas = asset.animations[j].tempAtlas;
        this[assetName].animations._anims[asset.animations[j].name].tempAnchor = asset.animations[j].tempAnchor;
      }
    }
    else {
      console.log(assetName + ' ANIMAATIOT PUUTTUU!');
    }
  },

  /**
   * Disable all asset actions from clicking/hovering
   * @alias disableAssetInput
   * @param {string} assetName The name of the asset
   */
  disableAssetInput: function(assetName) {
    if (this[assetName] != null) {
      if (this[assetName].hadInputEnabled) {
        this[assetName].hadInputEnabled = false;
      }
      this[assetName].disabled = true;
      this[assetName].input.enabled = false;
      this.modifyAsset(assetName, 'disabled', true);
    }
  },

  /**
   * Helper function to enable switching hover frames for an asset
   * Function available in editor.
   * @alias enableAssetHover
   * @param {string} assetName The name of the asset
   * @param {string} defaultFrame The new default (non-hover) frame
   * @param {string} hoverFrame The new hover frame
   */
  enableAssetHover: function(assetName, defaultFrame, hoverFrame) {

    // Change asset defaults, so that it looks correct when the room opens
    this.modifyAsset(assetName, 'defaultFrame', defaultFrame);
    this.modifyAsset(assetName, 'hoverFrame', hoverFrame);

    this.enableAssetInput(assetName); // If there's another input, add it (checked in the function)

    // If asset exists in current room, we need to switch its current state as well.
    if (this[assetName].game != null) {

      if (jQuery.inArray(assetName, this.assetsWithHover) == -1) {
        this.assetsWithHover.push(assetName); // Helper array for removing all hovers at once
      }

      // These are checked when the actual hover happens
      this[assetName].defaultFrame = defaultFrame;
      this[assetName].hoverFrame = hoverFrame;

      // Actual hover functionality
      this[assetName].events.onInputOver.add(function() {
          if (!this.dialogueInProgress) {
            this[assetName].frameName = this[assetName].hoverFrame;
          }
        }, this);
      this[assetName].events.onInputOut.add(function() {
          if (!this.dialogueInProgress) {
            this[assetName].frameName = this[assetName].defaultFrame;
          }
        }, this);

      this[assetName].frameName = this[assetName].defaultFrame; // Set frame immediately (otherwise you need to hover once for default frame to show)
    }

    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'enableAssetHover') {
      this.cutscenePartCompleted();
    }
  },

  //
  /**
   * Helper function, disabling hover functionality and making assets static and dumb.
   * @alias disableAssetHover
   * @param {string} assetName The name of the asset
   * @param {string} frameName The static frame to switch to
   */
  disableAssetHover: function (assetName, frameName) {
    // Enable static frame
    this[assetName].frameName = frameName;
    this[assetName].defaultFrame = frameName;
    this.disableAssetInput(assetName);

    // Change defaults
    this.modifyAsset(assetName, 'defaultFrame', null);
    this.modifyAsset(assetName, 'hoverFrame', null);

    var id = $.inArray(assetName, this.assetsWithHover);
    if (id != -1) {
      // Remove asset from helper array
      this.assetsWithHover.splice(id, 1);
    }
  },

  /**
   * Adds actions for assets on different input events (dialogue, door, action, cutscene)
   * @alias defineAssetInput
   * @param {string} assetName The name of the asset
   * @param {string} type 'dialogue', 'door', 'action' or 'cutscene'
   */
  defineAssetInput: function(assetName, type) {

    if (type == 'dialogue' && !this[assetName].events.onInputDown.has(this.dialogueHandler, this)) { // Dialogue starts by clicking this asset
      this[assetName].events.onInputDown.add(this.dialogueHandler, this);
    }
    else if (type == 'door') { // Clicking asset moves to another room
      this[assetName].events.onInputDown.add(function() {   // Room change function call with fade to black tween
        if (!this.cutscene.isRunning) {
          console.log('KLIKATTU DOOR: '+assetName);
          this.displayAssetName(this[assetName]);
          this.walkToAssetAndRunActions(assetName, 'door');
        }
        else {
          console.log('Doorista ei menty, koska cutscene on päällä');
        }
      }, this);
    }
    else if (type == 'action') { // Clicking asset might run some custom code
      this[assetName].name = assetName;
      this[assetName].events.onInputDown.add(function() {
        console.log('KLIKATTU ASSET: '+assetName);
        if (!this.cutscene.isRunning) {
          this.displayAssetName(this[assetName]);
          this.walkToAssetAndRunActions(assetName, 'action');
        }
        else {
          console.log('Assetin actioneita ei ajettu, koska cutscene on päällä');
        }
      }, this);

    }
    else if (type == 'pickable') {

      this.walkToAssetAndRunActions(assetName);
      this.characterTween.onComplete.add(function () {
          this[assetName].events.onInputDown.addOnce(this.addToInventory, this);
          this[assetName].input.enabled = true;
        }, this);
    }
    else if (type == 'description') {
      this[assetName].events.onInputDown.add(function () {
          if (!this.cutscene.isRunning) {
            this.displayAssetName(this[assetName]);
          }
          else {
            console.log('Assetin nimeä ei näytetty, koska cutscene on päällä');
          }
        }, this);
      //this[assetName].events.onInputOver.add(this.displayAssetName, this);
    }
  },

  displayAssetName: function (asset) {

    if (asset.description != undefined && asset.description != '') {
      if (this.assetNameTween != undefined && this.assetNameTween.isRunning) {
        this.assetNameTween.stop();
      }

      if (this.displayedAssetName == undefined || this.displayedAssetName.exists == false) {
        this.displayedAssetName = this.game.add.text(this.game.width / 2, 5, asset.description, this.textstyle);
        this.displayedAssetName.anchor.set(0.5, 0);
        this.displayedAssetName.fixedToCamera = true;
      }
      else {
        this.displayedAssetName.setText(asset.description);
      }

      this.displayedAssetName.alpha = 1;
      this.assetNameTween = this.game.add.tween(this.displayedAssetName).to({alpha: 0}, 500, Phaser.Easing.Linear.None).delay(3000);
      this.assetNameTween.start();
    }
  },

  /**
   * Make character walk to asset before running actions, and then run them
   * @alias walkToAssetAndRunActions
   * @param {string} assetName The asset name
   * @param {string} type 'door' or 'action', defining if we need to go through a door or run actions after arriving
   */
  walkToAssetAndRunActions: function (assetName, type) {

    var leftPoint = this[assetName].origX;
    leftPoint += (this[assetName].aoLeft && this[assetName].aoLeft != 0) ? this[assetName].aoLeft : 0;
    var rightPoint = this[assetName].origX + this[assetName].origWidth;
    rightPoint += (this[assetName].aoRight && this[assetName].aoRight != 0) ? this[assetName].aoRight : 0;

    var forcedApproachDirection = (this[assetName].forcedApproachDirection && this[assetName].forcedApproachDirection != 0) ? this[assetName].forcedApproachDirection : false;

    if (forcedApproachDirection) {
      if (forcedApproachDirection == 'left') {
        var targetX = leftPoint;
        this.awaitingCharDirection = 'right';
      }
      else {
        var targetX = rightPoint;
        this.awaitingCharDirection = 'left';
      }
    }
    else if (this.character.nonScaledX < leftPoint) { // Character on left side of asset -> walk to normal x +- offset (anchor 0)
      var targetX = leftPoint;
      this.awaitingCharDirection = 'right';
    }
    else if (this.character.nonScaledX > rightPoint) { // Character on right side of asset -> walk to right side of it +- offset
      var targetX = rightPoint;
      this.awaitingCharDirection = 'left';
    }
    else {
      if (type == 'door') {
        this.moveThroughDoor(assetName); // No walking at all if character is standing within the assets area + offsets and there is no forced movement!
        return;
      }
      else if (type == 'action') {
        this.checkAndRunActions(assetName);
        return;
      }
    }

    if (this.character.nonScaledX != targetX) {
      this.moveCharacter(null, null, targetX);
      this.characterTween.onComplete.add(function () {
          this.flipNpc('character', this.awaitingCharDirection);
          if (type == 'door') {
            this.moveThroughDoor(assetName);
          }
          else if (type == 'action') {
            this.checkAndRunActions(assetName);
          }
        }, this);
    }
  },

  /**
   * Move through a door
   * @alias moveThroughDoor
   * @param {string} assetName The name of the door
   */
  moveThroughDoor: function (assetName) {

    if (this[assetName].doorTarget == null) {
      return;
    }
    for (name in this.gamestate) { // Increase door "timers" instantly instead of waiting the tween to complete
      if (name.substr(0,5) == 'timer') {
        this.gamestate[name]++;
        console.log(this.gamestate);
      }
    }
    this.game.add.tween(this.fadeplate).to({alpha: 1}, 300, Phaser.Easing.Linear.None, true).onComplete.add(function() {
      this.moveToRoom(this[assetName].doorTarget, this[assetName].doorSpawn, this[assetName].doorFace);}, this);
  },

  /**
   * Useful helper function to help with Javascript's annoying automatic reference handling
   * TODO: put jQuery's extend function here for it to be able to accept any type of variable or object
   * @alias copy
   * @param {mixed} toCopy Whatever we need a non-reference copy of (doesn't work with objects or arrays)
   */
  copy: function(toCopy) {
    return toCopy;
  },

  /**
   * Add pause menu buttons etc static stuff to the game view
   * @alias createGui
   */
  createGui: function() {

    // Inventory and questlog on top of everything else
    this.guiElementGroup = this.game.add.group();
    if (!this.playerMoney) {
      this.playerMoneyBg = this.game.add.image(1030, 635, 'menuAtlas2', 'rahat_icon');
      this.playerMoneyBg.name = 'playerMoneyBg';
      this.prepareSpriteScale(this.playerMoneyBg);

      var moneyFontsize = Math.floor(42 * this.scaleFactor);
      this.playerMoney = this.game.add.text(1140, 650, this.gamestate.money.toString() + ' €', { font: moneyFontsize + "px troikaregular", fill: "#EA7C00" });
      this.playerMoney.name = "playerMoney";
      this.prepareSpriteScale(this.playerMoney);
    }
    this.guiElementGroup.add(this.playerMoneyBg);
    this.guiElementGroup.add(this.playerMoney);
    this.playerMoneyBg.fixedToCamera = true;
    this.playerMoney.fixedToCamera = true;

    this.createInventory();
    this.createQuestLog();

    // Pause menu button initialize
    var origOffsetX = 110;
    var origOffsetY = 5;
    var spacing = 80;
    if (!this.pauseMenuButton) {
      this.pauseMenuButton = this.game.add.button(this.game.width - origOffsetX * this.scaleFactor, origOffsetY * this.scaleFactor, 'menuAtlas2', this.startPauseMenu, this, 'asetukset_icon', 'asetukset_icon', 'asetukset_icon', 'asetukset_icon');
      this.pauseMenuButton.name = 'pauseMenuButton';
      this.pauseMenuButton.origWidth = this.copy(this.pauseMenuButton.width);
      this.pauseMenuButton.origHeight = this.copy(this.pauseMenuButton.height);
      this.pauseMenuButton.origOffsetX = this.copy(origOffsetX);
      this.pauseMenuButton.origOffsetY = this.copy(origOffsetY);
    }
    this.guiElementGroup.add(this.pauseMenuButton);
    // Pause menu button always available

    if (!this.inventoryButton) {
      this.inventoryButton = this.game.add.button(this.game.width - (origOffsetX + spacing) * this.scaleFactor, origOffsetY * this.scaleFactor, 'menuAtlas2', this.toggleInventory, this, 'icons_inventaario', 'inventory_icon', 'inventory_icon', 'inventory_icon');
      this.inventoryButton.name = 'inventoryButton';
      this.inventoryButton.origWidth = this.copy(this.inventoryButton.width);
      this.inventoryButton.origHeight = this.copy(this.inventoryButton.height);
      this.inventoryButton.origOffsetX = this.copy(origOffsetX + spacing);
      this.inventoryButton.origOffsetY = this.copy(origOffsetY);
    }
    this.guiElementGroup.add(this.inventoryButton);

    if (!this.questLogButton) {
      this.questLogButton = this.game.add.button(this.game.width - (origOffsetX + spacing * 2) * this.scaleFactor, origOffsetY * this.scaleFactor, 'menuAtlas2', this.toggleQuestLog, this, 'questlog_icon', 'questlog_icon', 'questlog_icon', 'questlog_icon');
      this.questLogButton.name = 'questLogButton';
      this.questLogButton.origWidth = this.copy(this.questLogButton.width);
      this.questLogButton.origHeight = this.copy(this.questLogButton.height);
      this.questLogButton.origOffsetX = this.copy(origOffsetX + spacing * 2);
      this.questLogButton.origOffsetY = this.copy(origOffsetY);
    }
    this.guiElementGroup.add(this.questLogButton);

    if (!this.highlightButton) {
      this.highlightButton = this.game.add.button(25, origOffsetY, 'menuAtlas2', this.highlightClickables, this, 'suurennuslasi_icon', 'suurennuslasi_icon', 'suurennuslasi_icon', 'suurennuslasi_icon');
      this.highlightButton.name = 'highlightButton';
      this.prepareSpriteScale(this.highlightButton);
    }
    this.guiElementGroup.add(this.highlightButton);

    this.pauseMenuButton.fixedToCamera = true;
    this.inventoryButton.fixedToCamera = true;
    this.questLogButton.fixedToCamera = true;
    this.highlightButton.fixedToCamera = true;

    // BEGINNING OF TEMP
    if (!this.manualSaveButton && !this.autoSaveEnabled) {
      this.manualSaveButton = this.game.add.button(spacing * this.scaleFactor, origOffsetY * this.scaleFactor, 'menuAtlas2', this.saveGame, this, 'asetukset_icon', 'asetukset_icon', 'asetukset_icon', 'asetukset_icon');
      this.manualSaveButton.name = 'manualSaveButton';
      this.manualSaveButton.origWidth = this.copy(this.manualSaveButton.width);
      this.manualSaveButton.origHeight = this.copy(this.manualSaveButton.height);
      this.manualSaveButton.origOffsetX = this.copy(origOffsetX + spacing * 5);
      this.manualSaveButton.origOffsetY = this.copy(origOffsetY);
      this.manualSaveButton.fixedToCamera = true;
    }
    if (!this.autoSaveEnabled) {
      this.guiElementGroup.add(this.manualSaveButton);
    }

    // END OF TEMP

    // Background for question headers, readily available but invisible.
    if (!this.headerBg) {
      this.headerBg = this.game.add.image(this.centerPoint, 90, 'menuAtlas');
      this.headerBg.frameName = 'question_bg';
      this.headerBg.anchor.setTo(0.5, 0);
      this.headerBg.alpha = 0;
      this.headerBg.name = 'headerBg';
      this.prepareSpriteScale(this.headerBg);
      this.headerBg.fixedToCamera = true;
    }
    this.guiElementGroup.add(this.headerBg);
  },

  /**
   * Create the inventory to be available in the game
   * @alias createInventory
   */
  createInventory: function() {
    if (!this.inventoryBg) {
      this.inventoryBg = this.game.add.image(0, 385, 'menuAtlas2', 'reppu_tausta');
      this.inventoryBg.name = 'inventoryBg';
      this.prepareSpriteScale(this.inventoryBg);
      this.inventoryBg.anchor.setTo(0, 0);
      this.inventoryBg.alpha = 0;
      this.inventoryBg.fixedToCamera = true;

      this.inventoryPage1 = this.game.add.image(30, 354, 'menuAtlas2', 'tasku1_button');
      this.inventoryPage1.name = 'inventoryPage1';
      this.prepareSpriteScale(this.inventoryPage1);
      this.inventoryPage1.anchor.setTo(0, 0);
      this.inventoryPage1.inputEnabled = true;
      this.inventoryPage1.events.onInputDown.add(this.switchInventoryTab, this);
      this.inventoryPage1.alpha = 0;
      this.inventoryPage1.fixedToCamera = true;

      this.inventoryPage2 = this.game.add.image(230, 354, 'menuAtlas2', 'tasku2_button_active');
      this.inventoryPage2.name = 'inventoryPage2';
      this.prepareSpriteScale(this.inventoryPage2);
      this.inventoryPage2.anchor.setTo(0, 0);
      this.inventoryPage2.inputEnabled = true;
      this.inventoryPage2.events.onInputDown.add(this.switchInventoryTab, this);
      this.inventoryPage2.alpha = 0;
      this.inventoryPage2.fixedToCamera = true;

      this.inventoryPage3 = this.game.add.image(430, 354, 'menuAtlas2', 'tasku3_button');
      this.inventoryPage3.name = 'inventoryPage3';
      this.prepareSpriteScale(this.inventoryPage3);
      this.inventoryPage3.anchor.setTo(0, 0);
      this.inventoryPage3.inputEnabled = true;
      this.inventoryPage3.events.onInputDown.add(this.switchInventoryTab, this);
      this.inventoryPage3.alpha = 0;
      this.inventoryPage3.fixedToCamera = true;

      this.inventoryClose = this.game.add.image(1265, 354, 'menuAtlas2', 'sulje_button');
      this.inventoryClose.name = 'inventoryClose';
      this.prepareSpriteScale(this.inventoryClose);
      this.inventoryClose.anchor.setTo(1, 0);
      this.inventoryClose.inputEnabled = true;
      this.inventoryClose.events.onInputDown.add(this.toggleInventory, this);
      this.inventoryClose.alpha = 0;
      this.inventoryClose.fixedToCamera = true;

    }
    this.guiElementGroup.add(this.inventoryBg);
    this.guiElementGroup.add(this.inventoryClose);
    this.guiElementGroup.add(this.inventoryPage1);
    this.guiElementGroup.add(this.inventoryPage2);
    this.guiElementGroup.add(this.inventoryPage3);
    this.inventoryPage1.input.enabled = false;
    this.inventoryPage2.input.enabled = false;
    this.inventoryPage3.input.enabled = false;
    this.inventoryClose.input.enabled = false;

    this.iconGroup = this.game.add.group();

    // All icons need to be added hidden when entering any room, so that the sprites are available on top whenever needed
    for (var i = 0; i < this.game.icons.length; i++) {
      if (!this[this.game.icons[i]]) {
        this[this.game.icons[i]] = this.game.add.image(-500, 420, 'menuAtlas2', this.game.icons[i]);// Put inventory items out of the way so that they don't block clicks from clickplate
        this[this.game.icons[i]].anchor.setTo(0,0);
        this[this.game.icons[i]].inputEnabled = true;
        this[this.game.icons[i]].events.onInputDown.add(function(icon) {console.log("inventoryIcon " + icon.name);}, this);
        this[this.game.icons[i]].alpha = 0;
        this[this.game.icons[i]].name = this.game.icons[i];
        this.prepareSpriteScale(this[this.game.icons[i]]);
      }
      this.iconGroup.add(this[this.game.icons[i]]);
    }
    // If this is inside loop it gets set to true after for some reason
    this.iconGroup.forEach(function(icon) {
      icon.input.enabled = false;
    }, this);
  },

  /**
   * Modify any entry in the quest log.
   * Function available in editor.
   * @alias changeQuestLog
   * @param {string} machineName Name of quest log "header" item to modify
   * @param {string} operation How to modify item
   * @param {integer} textIndex Id of quest log subitem to modify (-1 = header root level)
   */
  changeQuestLog: function(machineName, operation, textIndex) {

    console.log('changeQuestLog('+machineName + ' ' + operation + ' ' + textIndex + ')');

    if (textIndex > -1) { // Modify individual text rows according to index
      switch (operation) {
        case 'hide':
          this.questLog[machineName].text[textIndex].visible = false;
          break;
        case 'show':
          this.questLog[machineName].text[textIndex].visible = true;
          // Put new element to last in list
          var temp = this.copy(this.questLog[machineName]);
          delete this.questLog[machineName];
          this.questLog[machineName] = temp;
          this.activeQuestLogTab = machineName;
          break;
        case 'complete':
          if (this.questLog[machineName].text[textIndex] != undefined) {this.questLog[machineName].text[textIndex].completed = true;}
          // Put new element to first of completed in list
          var keys = Object.keys(this.questLog);
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] != machineName && this.questLog[keys[i]].text[textIndex] && this.questLog[keys[i]].text[textIndex].completed) {
              var temp = this.copy(this.questLog[keys[i]]);
              delete this.questLog[keys[i]];
              this.questLog[keys[i]] = temp;
            }
          }
          console.log(this.questLog[machineName]);
          if (this.questLog[machineName].header == "Festarivarusteet") {
            this.changeGamestate('festarivarusteet'+textIndex, true);
            console.log(this.gamestate);
          }
          break;
        case 'incomplete':
          this.questLog[machineName].text[textIndex].completed = false;
          if (this.questLog[machineName].text == "festarivarusteet") {
            this.changeGamestate('festarivarusteet'+textIndex, false);
            console.log(this.gamestate);
          }
          break;
      }
    }
    else if (textIndex == -1) { // -1 = Modify header root level
      switch (operation) {
        case 'hide':
          this.questLog[machineName].visible = false;
          break;
        case 'show':
          this.questLog[machineName].visible = true;
          // Put new element to last in list
          var temp = this.copy(this.questLog[machineName]);
          delete this.questLog[machineName];
          this.questLog[machineName] = temp;
          break;
        case 'complete':
          this.questLog[machineName].completed = true;
          // Put new element to first of completed in list
          var keys = Object.keys(this.questLog);
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] != machineName && this.questLog[keys[i]] && this.questLog[keys[i]].completed) {
              var temp = this.copy(this.questLog[keys[i]]);
              delete this.questLog[keys[i]];
              this.questLog[keys[i]] = temp;
            }
          }
          break;
        case 'incomplete':
          this.questLog[machineName].completed = false;
          break;
      }
    }
    this.updateQuestLog();

    if (this.questLogActive) {
      // Show items
      for (var i = 0; i < this.questLogVisibleItems.length; i++) {
        if (this.questLogVisibleItems[i].type != "line") {
          this.questLogVisibleItems[i].alpha = 1;
        }
        else {
          this.questLogVisibleItems[i].alpha = (this.questLog[this.questLogVisibleItems[i].machineName].text[textIndex].completed) ? 1 : 0;
        }
      }
    }
    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'changeQuestLog') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Create quest log for later use
   * @alias createQuestLog
   */
  createQuestLog: function() {
    this.questLogActive = false;
    this.questLogBg = this.game.add.image(this.qlPixels.bgX, this.qlPixels.bgY, 'questlog_bg');
    this.questLogDivider = this.game.add.image(this.qlPixels.dividerX, this.qlPixels.dividerY, 'questlog_divider');
    this.questLogCloseButton = this.game.add.button(this.qlPixels.closeButtonX, this.qlPixels.closeButtonY, 'questlog_close', this.toggleQuestLog, this);
    this.questLogCloseButton.input.enabled = false;

    this.prepareSpriteScale(this.questLogBg);
    this.prepareSpriteScale(this.questLogDivider);
    this.prepareSpriteScale(this.questLogCloseButton);
    this.questLogBg.name = 'questLogBg';
    this.questLogDivider.name = 'questLogDivider';
    this.questLogCloseButton.name = 'questLogCloseButton';
    this.questLogBg.alpha = 0;
    this.questLogDivider.alpha = 0;
    this.questLogCloseButton.alpha = 0;
    this.questLogBg.fixedToCamera = true;
    this.questLogDivider.fixedToCamera = true;
    this.questLogCloseButton.fixedToCamera = true;

    if (!this.qlMask) {
      this.qlMask = this.game.add.graphics(0, 0);
      this.qlMask.beginFill(0xFF3300);
      this.qlMask.lineStyle(1, 0xffd900, 1);
      this.qlMask.moveTo(20 * this.scaleFactor, 30 * this.scaleFactor);
      this.qlMask.lineTo(this.qlPixels.headerX * this.scaleFactor, 30 * this.scaleFactor);
      this.qlMask.lineTo(this.qlPixels.headerX * this.scaleFactor, 700 * this.scaleFactor);
      this.qlMask.lineTo(20 * this.scaleFactor, 700 * this.scaleFactor);
      this.qlMask.lineTo(20 * this.scaleFactor, 30 * this.scaleFactor);
      this.qlMask.endFill();
      this.qlMask.alpha = 0;
      this.qlMask.fixedToCamera = true;
    }

    this.guiElementGroup.add(this.questLogBg);
    this.guiElementGroup.add(this.questLogDivider);
    this.guiElementGroup.add(this.questLogCloseButton);

    this.updateQuestLog();
  },

  /**
   * Update the quest log view based on new specifications
   * @alias updateQuestLog
   */
  updateQuestLog: function() {

    for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
      this.questLogVisibleHeaders[i].destroy();
      delete this.questLogVisibleHeaders[i];
    }
    this.questLogVisibleHeaders = [];
    //var createHeaders = (this.questLogVisibleHeaders.length == 0) ? true : false;

    for (var i = 0; i < this.questLogVisibleItems.length; i++) {
      this.questLogVisibleItems[i].destroy();
      delete this.questLogVisibleItems[i];
    }
    this.questLogVisibleItems = [];

    for (var i = 0; i < this.questLogIcons.length; i++) {
      this.questLogIcons[i].destroy();
      delete this.questLogIcons[i];
    }
    this.questLogIcons = [];

    // Starting y point depends on what the active tab is
    this.qlPixels.headerY = this.qlPixels.origHeaderY + this.qlPixels.headerOffset * -this.activeQLHeaderId;

    var i = 0;
    for (name in this.questLog) {

      // Create visible headers to be clicked
      if (this.questLog[name].visible) {

        //if (createHeaders) {
          if (name == this.activeQuestLogTab && this.questLog[name].completed) {
            this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
          }
          else if (name == this.activeQuestLogTab && !this.questLog[name].completed) {
            this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
          }
          else if (this.questLog[name].completed) {
            this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
          }
          else if (!this.questLog[name].completed) {
            this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
          }

          // Add header
          var helper = this.game.add.text(this.scaleFactor * this.qlPixels.headerX, this.scaleFactor * (this.qlPixels.headerY + (this.qlPixels.headerOffset * i)), this.questLog[name].header.toUpperCase(), this.questLogHeaderStyle);
          helper.type = 'header'; // For resizing
          helper.alpha = (this.questLogActive) ? 1 : 0;
          helper.anchor.set(1, 0.5); // Align right
          helper.fixedToCamera = true;
          helper.machineName = name;
          helper.mask = this.qlMask;
          helper.completed = this.questLog[name].completed;
          helper.inputEnabled = true;
          if (!this.questLogActive) {
            helper.input.enabled = false;
          }
          helper.events.onInputDown.add(this.switchQuestLogTab, this);
          this.questLogVisibleHeaders.push(helper);
        //}

        // Add texts of active tab
        if (this.activeQuestLogTab == name) {
          var questLogTexts = [];
          var helperIndex = 0;

          questLogTexts = this.copy(this.questLog[this.activeQuestLogTab].text);
          var visibleCount = 0;
          for (var j = 0; j < questLogTexts.length; j++) {
            if (questLogTexts[j].visible) {
              visibleCount++;
            }
          }
          var heightOfTexts = visibleCount * this.qlPixels.textOffset;
          this.qlPixels.textY = this.qlPixels.textMiddleYPoint - (heightOfTexts * 0.5);

          for (var j = 0; j < questLogTexts.length; j++) {

            if (questLogTexts.length > 1 && !questLogTexts[j].visible) continue;

            if (questLogTexts[j].completed) {
              var newQLIcon = this.game.add.image(this.scaleFactor * this.qlPixels.textX, this.scaleFactor * (this.qlPixels.textY + (this.qlPixels.textOffset * j)), 'questlog_done');
              this.questLogTextStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
            }
            else {
              var newQLIcon = this.game.add.image(this.scaleFactor * this.qlPixels.textX, this.scaleFactor * (this.qlPixels.textY + (this.qlPixels.textOffset * j)), 'questlog_notdone');
              this.questLogTextStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
            }

            newQLIcon = this.prepareSpriteScale(newQLIcon, true);
            newQLIcon.name = 'newQLIcon';
            //newQLIcon.alpha = (this.questLogActive) ? 1 : 0;
            newQLIcon.alpha = 0;
            newQLIcon.fixedToCamera = true;
            this.questLogIcons.push(newQLIcon);

            helper = this.game.add.text(this.scaleFactor * (this.qlPixels.textX + this.qlPixels.textOffsetFromIcon), this.scaleFactor * (this.qlPixels.textY + (this.qlPixels.textOffset * j)), questLogTexts[j].text.toUpperCase(), this.questLogTextStyle);
            helper.type = 'text'; // For resizing
            //helper.alpha = (this.questLogActive) ? 1 : 0;
            helper.alpha = 0;
            helper.anchor.set(0, 0);
            helper.fixedToCamera = true;
            helper.machineName = this.activeQuestLogTab;
            helper.completed = questLogTexts[j].completed;
            this.questLogVisibleItems.push(helper);

            helperIndex++;
          }
        }

        i++;
      }
    }

    // Get the id to define header tweens on
    for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
      if (this.questLogVisibleHeaders[i].machineName == this.activeQuestLogTab) {
        this.activeQLHeaderId = i;
      }
    }

    // Tween all headers into place
    var newY;
    for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
      newY = this.qlPixels.origHeaderY + this.qlPixels.headerOffset * (i - this.activeQLHeaderId);
      this.game.add.tween(this.questLogVisibleHeaders[i].cameraOffset).to({y:  newY * this.scaleFactor}, 500, Phaser.Easing.Cubic.In, true);
    }

    this.arrangeQuestLog();

    if (this.questLogActive) {
      // Display items as the last thing in order to avoid flicking
      for (var i = 0; i < this.questLogIcons.length; i++) {
        this.questLogIcons[i].alpha = 1;
      }
      for (var i = 0; i < this.questLogVisibleItems.length; i++) {
        this.questLogVisibleItems[i].alpha = 1;
      }
    }
  },

  /**
   * Change between tabs in the questlog
   * @alias switchQuestLogTab
   * @param {string} clickedHeader Name of the tab to switch to
   */
  switchQuestLogTab: function (clickedHeader) {
    this.activeQuestLogTab = clickedHeader.machineName;
    this.updateQuestLog();
  },

  /**
   * Move all completed items to the bottom of the questlog
   * @alias arrangeQuestLog
   */
  arrangeQuestLog: function() {


    var completedIndexes = [];
    var notCompletedIndexes = [];

    for (var i = 0; i < this.questLogVisibleItems.length; i++) {
      var questHeader = this.questLogVisibleItems[i].machineName;
      if (this.questLogVisibleItems[i] == null) {
        continue;
      }
      else {
        if (this.questLogVisibleItems[i].completed) {
          completedIndexes.push(i);
        }
        else {
          notCompletedIndexes.push(i);
        }
      }
    }

    var arrangedQuestLogItems = [];
    var arrangedQuestLogIcons = [];

    for (var i = 0; i < notCompletedIndexes.length; i++) {
      arrangedQuestLogItems.push(this.questLogVisibleItems[notCompletedIndexes[i]]);
      arrangedQuestLogIcons.push(this.questLogIcons[notCompletedIndexes[i]]);
    }
    for (var i = 0; i < completedIndexes.length; i++) { // Display completed tasks on bottom
      arrangedQuestLogItems.push(this.questLogVisibleItems[completedIndexes[i]]);
      arrangedQuestLogIcons.push(this.questLogIcons[completedIndexes[i]]);
    }

    this.questLogVisibleItems = arrangedQuestLogItems;
    this.questLogIcons = arrangedQuestLogIcons;
    this.resizeQuestLog();
  },

  /**
   * Display the quest as animated text in the middle of the screen for the player
   * Function available in editor
   * @alias displayQuestText
   * @param {integer} questId Id of the quest
   * @param {string} textIndex Numerical index of the sub-id of the quest
   */
  displayQuestText: function (questId, textIndex) {

    this.disableClicks();

    var obj = this.questLog[questId]; // .header .text .completed .visible .audio
    console.log(obj.text[textIndex]);

    this.questHeader = this.game.add.text(this.centerPoint, 400 * this.scaleFactor, obj.header, { font: Math.floor(100 * this.scaleFactor) + "px troikaregular", fill: "#fff", stroke: 'black', strokeThickness: 8 });
    this.questHeader.alpha = 0;
    this.questHeader.setShadow(0, 0, 'rgba(0,0,0,75)', 8);
    this.questHeader.anchor.setTo(0.5, 0);
    this.questHeader.fixedToCamera = true;

    var text = (obj.text[textIndex] != undefined) ? obj.text[textIndex].text : '';

    this.questText = this.game.add.text(this.centerPoint, 500 * this.scaleFactor, text, { font: Math.floor(50 * this.scaleFactor) + "px troikaregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(this.game.width - 250 * this.scaleFactor), align: 'center', stroke: 'black', strokeThickness: 6 });
    this.questText.alpha = 0;
    this.questText.setShadow(0, 0, 'rgba(0,0,0,75)', 8);
    this.questText.anchor.setTo(0.5, 0);
    this.questText.fixedToCamera = true;


    this.questHeader.tween1 = this.game.add.tween(this.questHeader.cameraOffset).to({y: 300 * this.scaleFactor}, 500, Phaser.Easing.Linear.None, true).onComplete.add(function () {
        this.clickplate.events.onInputDown.addOnce(function () {
            this.questHeader.tween1 = this.game.add.tween(this.questHeader.cameraOffset).to({y: 200 * this.scaleFactor}, 500, Phaser.Easing.Linear.None, true).onComplete.add(function () {
                this.questHeader.destroy();
                this.questText.destroy();
                if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'displayQuestText') {
                  this.cutscenePartCompleted();
                }
                this.enableClicks();
              }, this);
            this.questHeader.tween2 = this.game.add.tween(this.questHeader).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
            this.questText.tween3 = this.game.add.tween(this.questText.cameraOffset).to({y: 300 * this.scaleFactor}, 500, Phaser.Easing.Linear.None, true);
            this.questText.tween4 = this.game.add.tween(this.questText).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
          }, this);
      }, this);
    this.questHeader.tween2 = this.game.add.tween(this.questHeader).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
    this.questText.tween3 = this.game.add.tween(this.questText.cameraOffset).to({y: 400 * this.scaleFactor}, 500, Phaser.Easing.Linear.None, true);
    this.questText.tween4 = this.game.add.tween(this.questText).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
  },

  /**
   * Display image about a completed quest.
   * Images defined in declarations, object named this.questLogImages.
   * Function available in editor.
   * @alias displayQuestCompleted
   * @param {integer} questImageId Id of image to display.
   */
  displayQuestCompleted: function (questImageId) {

    this.disableClicks();
    var obj = this.questLogImages[questImageId];
    this.questHeader = this.game.add.text(90 * this.scaleFactor, 250 * this.scaleFactor, obj.completedHeader, { font: Math.floor(70 * this.scaleFactor) + "px troikaregular", fill: "#fff", align: 'left', stroke: 'black', strokeThickness: 6 });
    this.questHeader.alpha = 0;
    this.questHeader.anchor.setTo(0, 0);
    this.questHeader.fixedToCamera = true;

    this.questText = this.game.add.text(90 * this.scaleFactor, 320 * this.scaleFactor, obj.completedText, { font: Math.floor(45 * this.scaleFactor) + "px troikaregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(570 * this.scaleFactor), align: 'left', stroke: 'black', strokeThickness: 6 });
    this.questText.alpha = 0;
    this.questText.lineSpacing = -15*this.scaleFactor;
    this.questText.anchor.setTo(0, 0);
    this.questText.fixedToCamera = true;

    this.questCompletedImg = this.game.add.image(818, 92, obj.completedImage);
    this.questCompletedImg.alpha = 0;
    this.prepareSpriteScale(this.questCompletedImg);
    this.questCompletedImg.name = 'questCompletedImg';
    this.guiElementGroup.add(this.questCompletedImg);
    this.questCompletedImg.fixedToCamera = true;


    this.questHeader.tween = this.game.add.tween(this.questHeader).to({alpha: 1}, 10, Phaser.Easing.Linear.None, true).onComplete.add(function () {
        this.clickplate.events.onInputDown.addOnce(function () {
            this.questHeader.tween = this.game.add.tween(this.questHeader).to({alpha: 0}, 10, Phaser.Easing.Linear.None, true).onComplete.add(function () {
                this.questHeader.destroy();
                this.questText.destroy();
                this.questCompletedImg.destroy();
                if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'displayQuestCompleted') {
                  this.cutscenePartCompleted();
                }
                this.enableClicks();
              }, this);
            this.questText.tween = this.game.add.tween(this.questText).to({alpha: 0}, 10, Phaser.Easing.Linear.None, true);
            this.questCompletedImg.tween = this.game.add.tween(this.questCompletedImg).to({alpha: 0}, 10, Phaser.Easing.Linear.None, true);
          }, this);
      }, this);
      this.questText.tween = this.game.add.tween(this.questText).to({alpha: 1}, 10, Phaser.Easing.Linear.None, true);
      this.questCompletedImg.tween = this.game.add.tween(this.questCompletedImg).to({alpha: 1}, 10, Phaser.Easing.Linear.None, true);

    this.resizeGame(this.game.width, this.game.height);

  },

  /**
   * Resize/scale quest log when changing size of screen
   * @alias resizeQuestLog
   */
  resizeQuestLog: function() {


    this.qlMask = this.game.add.graphics(0, 0);
    this.qlMask.beginFill(0xFF3300);
    this.qlMask.lineStyle(1, 0xffd900, 1);
    this.qlMask.moveTo(20 * this.scaleFactor, 30 * this.scaleFactor);
    this.qlMask.lineTo(this.qlPixels.headerX * this.scaleFactor, 30 * this.scaleFactor);
    this.qlMask.lineTo(this.qlPixels.headerX * this.scaleFactor, 700 * this.scaleFactor);
    this.qlMask.lineTo(20 * this.scaleFactor, 700 * this.scaleFactor);
    this.qlMask.lineTo(20 * this.scaleFactor, 30 * this.scaleFactor);
    this.qlMask.endFill();
    this.qlMask.alpha = 0;
    this.qlMask.fixedToCamera = true;

    // Causes flickering with switching files
    for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
      if (this.questLogVisibleHeaders[i] == null) {
        continue;
      }
      this.questLogVisibleHeaders[i].fixedToCamera = false;
      if (this.questLogVisibleHeaders[i].type == 'header') {

        if (this.questLogVisibleHeaders[i].machineName == this.activeQuestLogTab && this.questLogVisibleHeaders[i].completed) {
          this.questLogHeaderStyle = { font: this.scaleFactor * 44 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }
        else if (this.questLogVisibleHeaders[i].machineName == this.activeQuestLogTab && !this.questLogVisibleHeaders[i].completed) {
          this.questLogHeaderStyle = { font: this.scaleFactor * 44 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }
        else if (this.questLogVisibleHeaders[i].completed) {
          this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }
        else if (!this.questLogVisibleHeaders[i].completed) {
          this.questLogHeaderStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }

        this.questLogVisibleHeaders[i].x = this.qlPixels.headerX * this.scaleFactor;
        this.questLogVisibleHeaders[i].y = (this.qlPixels.headerY + (i * this.qlPixels.textOffset)) * this.scaleFactor;
        this.questLogVisibleHeaders[i].setStyle(this.questLogHeaderStyle);
        //this.questLogVisibleHeaders[i].wordWrapWidth = Math.floor(this.game.width - 240 * this.scaleFactor);
      }
      this.questLogVisibleHeaders[i].fixedToCamera = true;
    }

    for (var i = 0; i < this.questLogVisibleItems.length; i++) {
      if (this.questLogVisibleItems[i] == null) {
        continue;
      }
      this.questLogVisibleItems[i].fixedToCamera = false;
      this.questLogIcons[i].fixedToCamera = false;

      if (this.questLogVisibleItems[i].type == 'text') {

        if (this.questLogVisibleItems[i].completed) {
          this.questLogTextStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#99e0eb", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }
        else {
          this.questLogTextStyle = { font: this.scaleFactor * 29 + "px league_gothicregular", fill: "#fff", wordWrap: true, wordWrapWidth: Math.floor(1000 * this.scaleFactor) };
        }

        this.questLogVisibleItems[i].x = (this.qlPixels.textX + this.qlPixels.textOffsetFromIcon) * this.scaleFactor;
        this.questLogIcons[i].x = this.qlPixels.textX * this.scaleFactor;
        this.questLogVisibleItems[i].y = (this.qlPixels.textY + (i * this.qlPixels.textOffset)) * this.scaleFactor;
        this.questLogIcons[i].y = (this.qlPixels.textY + (i * this.qlPixels.textOffset)) * this.scaleFactor;
        this.questLogIcons[i].width = this.questLogIcons[i].origWidth * this.scaleFactor;
        this.questLogIcons[i].height = this.questLogIcons[i].origHeight * this.scaleFactor;

        this.questLogVisibleItems[i].setStyle(this.questLogTextStyle);
        this.questLogVisibleItems[i].wordWrapWidth = Math.floor(this.game.width - 240 * this.scaleFactor);
      }
      this.questLogVisibleItems[i].fixedToCamera = true;
      this.questLogIcons[i].fixedToCamera = true;
    }
  },

  /**
   * Switch quest log on/off
   * @alias toggleQuestLog
   */
  toggleQuestLog: function() {

    if (this.dialogueInProgress) return;
    if (this.questLogActive) {
      this.questLogActive = false;
      this.questLogBg.alpha = 0;
      this.questLogDivider.alpha = 0;
      this.questLogCloseButton.alpha = 0;
      this.questLogCloseButton.input.enabled = 0;

      for (var i = 0; i < this.questLogVisibleItems.length; i++) {
        this.questLogVisibleItems[i].alpha = 0;
      }
      for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
        this.questLogVisibleHeaders[i].alpha = 0;
        this.questLogVisibleHeaders[i].input.enabled = false;
      }
      for (var i = 0; i < this.questLogIcons.length; i++) {
        this.questLogIcons[i].alpha = 0;
      }

      this.enableClicks();
      this.enableHovers();
      this.changeGuiVisibility(1); // Hide gui buttons
    }
    else {
      // Hide other menus
      if (this.inventoryActive) {
        this.toggleInventory();
      }
      if (this.pauseMenuActive) {
        this.resumeGame();
      }

      this.questLogActive = true;
      this.questLogBg.alpha = 1;
      this.questLogDivider.alpha = 1;
      this.questLogCloseButton.alpha = 1;
      this.questLogCloseButton.input.enabled = 1;

      for (var i = 0; i < this.questLogVisibleItems.length; i++) {
        this.questLogVisibleItems[i].alpha = 1;
      }

      for (var i = 0; i < this.questLogVisibleHeaders.length; i++) {
        this.questLogVisibleHeaders[i].alpha = 1;
        this.questLogVisibleHeaders[i].input.enabled = true;
      }

      for (var i = 0; i < this.questLogIcons.length; i++) {
        this.questLogIcons[i].alpha = 1;
      }

      this.disableClicks();
      this.disableHovers();
      this.changeGuiVisibility(0); // Display gui buttons
    }
  },

  /**
   * Switch inventory on/off
   * @alias toggleInventory
   */
  toggleInventory: function() {
    if (this.dialogueInProgress) return;
    if (this.inventoryActive) {
      this.inventoryActive = false;
      this.inventoryBg.alpha = 0;
      this.inventoryClose.alpha = 0;
      this.inventoryClose.input.enabled = false;
      this.inventoryPage1.alpha = 0;
      this.inventoryPage2.alpha = 0;
      this.inventoryPage3.alpha = 0;
      this.inventoryPage1.input.enabled = false;
      this.inventoryPage2.input.enabled = false;
      this.inventoryPage3.input.enabled = false;

      for (var i = 0; i < this.inventory.length; i++) {
        if (this[this.inventory[i]+'Icon'] != undefined) {
          this[this.inventory[i]+'Icon'].alpha = 0;
          this[this.inventory[i]+'Icon'].fixedToCamera = false;
          this[this.inventory[i]+'Icon'].x = -500; // Move inventory items out of the way so that they don't block clicks from clickplate
          this[this.inventory[i]+'Icon'].fixedToCamera = true;
          this[this.inventory[i]+'Icon'].input.enabled = false;
        }
      }
      this.enableClicks();
      this.enableHovers();
    }
    else {
      // Hide other menus
      if (this.pauseMenuActive) {
        this.resumeGame();
      }
      if (this.questLogActive) {
        this.toggleQuestLog();
      }
      this.inventoryActive = true;
      this.inventoryBg.alpha = 1;
      this.inventoryClose.alpha = 1;
      this.inventoryClose.input.enabled = true;
      this.inventoryPage1.alpha = 1;
      this.inventoryPage1.input.enabled = true;
      if (this.inventory.length > 18) {
        this.inventoryPage2.alpha = 1;
        this.inventoryPage2.input.enabled = true;
      }
      if (this.inventory.length > 36) {
        this.inventoryPage3.alpha = 1;
        this.inventoryPage3.input.enabled = true;
      }

      /*for (var i = 0; i < this.inventory.length; i++) {
        this[this.inventory[i]+'Icon'].alpha = 1;
        this[this.inventory[i]+'Icon'].input.enabled = true;
      }*/
      this.switchInventoryTab(this.inventoryPage1);
      this.arrangeInventory(1);
      this.disableClicks();
      this.disableHovers();
    }
  },

  /**
   * Set up inventory items
   * @alias arrangeInventory
   * @param {integer} [activeTab] Id of inventory tab to have opened
   */
  arrangeInventory: function(activeTab) {

    if (this.activeInventoryTab == undefined) this.activeInventoryTab = 1;

    this.activeInventoryTab = (activeTab != undefined) ? activeTab : this.activeInventoryTab;
    var visibleItems = 0;
    var startingIndex = 0 + ((this.activeInventoryTab - 1) * 18);

    var offsetX = 23 * this.scaleFactor;
    var leftMargin = 12 * this.scaleFactor + offsetX;
    var nextX = leftMargin;

	  for (var i = 0; i < this.inventory.length; i++) {
		  if (this[this.inventory[i]+'Icon']) {
        this[this.inventory[i]+'Icon'].fixedToCamera = false;
        if (i >= startingIndex && visibleItems < 18 ) {
          if (visibleItems == 9) nextX = leftMargin;
          this[this.inventory[i]+'Icon'].x = nextX;
          this[this.inventory[i]+'Icon'].y = (visibleItems < 9) ? 427 * this.scaleFactor : (541 * this.scaleFactor + offsetX);
          nextX += this[this.inventory[i]+'Icon'].width + offsetX;
          if (activeTab != undefined) {
            this[this.inventory[i]+'Icon'].alpha = 1;
            this[this.inventory[i]+'Icon'].input.enabled = true;
          }
          visibleItems++;
        }
        else {
          this[this.inventory[i]+'Icon'].x = -500;
          this[this.inventory[i]+'Icon'].alpha = 0;
          this[this.inventory[i]+'Icon'].input.enabled = false;
        }
        this[this.inventory[i]+'Icon'].fixedToCamera = true;
      }
      else {
        console.log('MISSING ICON: No "'+this.inventory[i]+'Icon'+'" loaded!');
      }
    }
  },

  /**
   * Switch between tabs in inventory
   * @alias switchInventoryTab
   * @param {object} button Phaser button object which was pressed
   */
  switchInventoryTab: function(button) {

    var activeTab = parseInt(button.name.replace('inventoryPage', ''));
    var changeTab = false;

    for (var i = 1; i < 4; i++) {
      if (activeTab != i) {
        this['inventoryPage' + i].frameName = 'tasku' + i + '_button';
      }
      else {
        if (this['inventoryPage' + i].frameName != 'tasku' + i + '_button_active') {
          this['inventoryPage' + i].frameName = 'tasku' + i + '_button_active';
          changeTab = true;
        }
      }
    }
    if (changeTab) this.arrangeInventory(activeTab);
  },

  /**
   * Add new item to inventory
   * @alias addToInventory
   * @param {object} sprite Callback for Phaser sprite object, which is added
   */
  addToInventory: function(name) {
    this.changeGamestate(name+'InInv', true);
    this.inventory.push(name);

    if (this[name]) {
      this[name].xBeforeTween = this.copy(this[name].x);
      this[name].yBeforeTween = this.copy(this[name].y);
      this.game.add.tween(this[name]).to({x: this.inventoryButton.x + 50 * this.scaleFactor, y: 50 * this.scaleFactor}, 700, Phaser.Easing.Cubic.Out, true).onComplete.add(function() {
          this.hideAsset(name);
          this[name].x = this[name].xBeforeTween;
          this[name].y = this[name].yBeforeTween;
          this.arrangeInventory();
        }, this);
      this.game.add.tween(this[name].scale).to({x: 0.05, y: 0.05}, 2000, Phaser.Easing.Linear.None, true).onComplete.add(function() {
          this[name].scale.x = 1;
          this[name].scale.y = 1;
        }, this);
    }

    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'addToInventory') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Remove sprite from inventory
   * @alias removeFromInventory
   * @param {string} spriteName Name of sprite to remove
   */
  removeFromInventory: function(spriteName) {
    if (this.inventoryActive) {
      this[spriteName+'Icon'].alpha = 0;
      this[spriteName+'Icon'].input.enabled = false;
    }

    var index = jQuery.inArray(spriteName, this.inventory);
    if (index > -1) {
      this.inventory.splice(index, 1);
    }
    this.changeGamestate(spriteName+'InInv', false);
    this.arrangeInventory();

    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'removeFromInventory') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Player helper function to highlight everything that is currently clickable.
   * Creates temporary tinted duplicates on top of existing clickable items, tweens them to visible and back and destroys them immediately after.
   * @alias highlightClickables
   */
  highlightClickables: function () {
    if (this.dialogueInProgress || this.inventoryActive || this.questLogActive) return;

    for (var i = 0; i < this.clickables.length; i++) {

      var assetName = this.clickables[i].name;

      if (this[assetName] && this[assetName].conditionalActions != undefined) { // Has conditional actions -> check if any of them apply, meaning it's clickable
        var valid = false;
        for (var j = 0; j < this[assetName].conditionalActions.length; j++) {
          // Get condition logic
          var valid = this.checkConditionalActions(this[assetName].conditionalActions[j]);

          if (valid) {
            break;
          }
        }
      }
      else if (this[assetName]) { // Is clickable and has no conditional actions available -> should always highlight
        var valid = true;
      }

      if (valid && this[assetName].input && this[assetName].input.enabled) {

        var x = (this[assetName].nonScaledX != undefined) ? this[assetName].nonScaledX : this[assetName].origX;
        var y = (this[assetName].nonScaledY != undefined) ? this[assetName].nonScaledY : this[assetName].origY;
        var frameName = (this[assetName].machineName == undefined) ? this[assetName].frameName : this[assetName]._frame.name;

        this.tempTintedAssets[assetName] = this.game.add.image(x, y, this[assetName].key, frameName);
        this.tempTintedAssets[assetName].anchor = this[assetName].anchor;
        this.tempTintedAssets[assetName].name = this[assetName].name;
        this.prepareSpriteScale(this.tempTintedAssets[assetName]);
        this.tintedAssetGroup.add(this.tempTintedAssets[assetName]);
        //this.resizeGame(this.game.width, this.game.height); // this is too heavy operation to resize all game objects
        var fixed = this[assetName].fixedToCamera;
        this.tempTintedAssets[assetName].fixedToCamera = false;
        this.tempTintedAssets[assetName].x = x * this.scaleFactor;
        this.tempTintedAssets[assetName].y = y * this.scaleFactor;
        this.tempTintedAssets[assetName].width = this.tempTintedAssets[assetName].origWidth * this.scaleFactor;
        this.tempTintedAssets[assetName].height = this.tempTintedAssets[assetName].origHeight * this.scaleFactor;
        if (fixed) this.tempTintedAssets[assetName].fixedToCamera = true;

        this.tempTintedAssets[assetName].blendMode = PIXI.blendModes.ADD;
        this.tempTintedAssets[assetName].tint = 0xFFFFFF;

        this.game.add.tween(this[assetName])
          .to({alpha: 0}, 400, Phaser.Easing.Linear.None)
          .to({alpha: 1}, 1000, Phaser.Easing.Cubic.In)
          .start();

        this.game.add.tween(this.tempTintedAssets[assetName])
          .to({alpha: 1}, 400, Phaser.Easing.Linear.None)
          .to({alpha: 0}, 1000, Phaser.Easing.Cubic.In)
          .start()
          .onComplete.add(function() {
              for (name in this.tempTintedAssets) {
                this.tempTintedAssets[name].destroy();
                this.tempTintedAssets[name] = null;
                delete this.tempTintedAssets[name];
              }
            }, this);
      }
    }
  },

  /**
   * Display help text box
   * Available and exclusively used in editor
   * @alias displayInfoBox
   * @param {string} infoImageName Name of image to display
   */
  displayInfoBox: function (infoImageName) {

    this.disableClicks();

    if (this.infoBox == undefined) {
      this.infoBox = this.game.add.group();
      this.infoBoxBg = this.game.add.image(20, 80, 'menuAtlas2', 'vinkki_tausta');
      this.prepareSpriteScale(this.infoBoxBg);
      this.infoBox.add(this.infoBoxBg);

      this.infoBoxImg = this.game.add.image(20 + this.infoBoxBg.width/2, 80 + this.infoBoxBg.height/2, 'menuAtlas2', infoImageName + '_ohje');
      this.infoBoxImg.anchor.set(0.5, 0.5);
      this.infoBox.add(this.infoBoxImg);

      this.infoBoxClose = this.game.add.image(20 + this.infoBoxBg.width, 80 + this.infoBoxBg.height, 'menuAtlas2', 'vinkki_close');
      this.infoBoxClose.anchor.set(0.5, 0.5);
      this.infoBoxClose.inputEnabled = true;
      this.prepareSpriteScale(this.infoBoxClose);
      this.infoBoxClose.events.onInputDown.add(this.closeInfoBox, this);
      this.infoBox.add(this.infoBoxClose);
    }
    else {
      this.infoBoxImg.frameName = infoImageName + '_ohje';
    }
    this.infoBoxClose.input.enabled = false;
    this.infoBoxImg.scale.x = 1;
    this.infoBoxImg.scale.y = 1;
    this.infoBoxImg.x = 20 + this.infoBoxBg.origWidth/2;
    this.infoBoxImg.y = 80 + this.infoBoxBg.origHeight/2;
    this.prepareSpriteScale(this.infoBoxImg);

    this.infoBox.alpha = 0;

    this.resizeInfoBox();

    var infoBoxTween = this.game.add.tween(this.infoBox).to({alpha: 1}, 100, Phaser.Easing.Linear.None, true).onComplete.add(function () {
        this.infoBoxClose.input.enabled = true;
    }, this);
  },

  /**
   * Resize / scale help text box
   * @alias resizeInfoBox
   */
  resizeInfoBox: function() {

    if (this.infoBox != undefined) {
       this.infoBox.forEach(function(element) {
         element.fixedToCamera = false;
         element.x = element.origX * this.scaleFactor;
         element.y = element.origY * this.scaleFactor;
         element.width = element.origWidth * this.scaleFactor;
         element.height = element.origHeight * this.scaleFactor;
         element.fixedToCamera = true;
       }, this);
    }
  },

  /**
   * Close help text box
   * Function available in editor.
   * @alias closeInfoBox
   * @param {object} button Phaser button object callback
   */
  closeInfoBox: function(button) {

    button.input.enabled = false;
    var infoBoxTween = this.game.add.tween(this.infoBox).to({alpha: 0}, 100, Phaser.Easing.Linear.None, true).onComplete.add(function () {
      if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'displayInfoBox') {
        this.cutscenePartCompleted();
      }
      this.enableClicks();
    }, this);
  },

  /**
   * Check the current state of fullscreen and enable/disable it accordingly
   * @alias checkFullscreen
   */
  checkFullscreen: function() {

    if (this.game.fullscreenEnabled) {  // Fullscreen has been enabled
      this.disableClicks(); // Disable & enable -> means the character stops walking to the button.
      this.enableClicks();
      this.scale.startFullScreen();
    }

    else { // Fullscreen disabled
      this.disableClicks(); // Disable & enable -> means the character stops walking to the button.
      this.enableClicks();
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

  /**
   * Open pause menu
   * @alias startPauseMenu
   */
  startPauseMenu: function() {

	// Hide other menus
    if (this.inventoryActive) {
      this.toggleInventory();
    }
    if (this.questLogActive) {
      this.toggleQuestLog();
    }
    if (this.character.clickToMove) {
      this.disableClicks();
      //this.disableHovers();
    }

    this.pauseMenuActive = true;

    if (this.pauseMenu_bg == null) { // Add background, buttons and titles (first time pause menu is opened)
      this.pauseMenu_bg = this.game.add.image(0, 0, 'menu_bg');
      this.pauseMenu_bg.anchor.setTo(0, 0);
      this.pauseMenu_bg.origWidth = this.copy(this.pauseMenu_bg.width);
      this.pauseMenu_bg.origHeight = this.copy(this.pauseMenu_bg.height);
      this.pauseMenu_bg.width = this.pauseMenu_bg.origWidth * this.scaleFactor;
      this.pauseMenu_bg.height = this.pauseMenu_bg.origHeight * this.scaleFactor;
      this.pauseMenu_bg.fixedToCamera = true;

      var headerTextSize = Math.floor(76 * this.scaleFactor);
      var subheaderTextSize = Math.floor(52 * this.scaleFactor);
      this.headerTextstyle = { font: headerTextSize + "px opendyslexicregular", fill: "#000" };
      this.subheaderTextstyle = { font: subheaderTextSize + "px opendyslexicregular", fill: "#000" };

      this.settingsTitle = this.game.add.text(this.centerPoint, 50 * this.scaleFactor, 'Asetukset', this.headerTextstyle);
      this.settingsTitle.anchor.setTo(0.5, 0);
      this.settingsTitle.fixedToCamera = true;

      this.speechTitle = this.game.add.text(this.centerPoint, 200 * this.scaleFactor, 'Puheäänet', this.subheaderTextstyle);
      this.speechTitle.anchor.setTo(1, 0.5);
      this.speechTitle.fixedToCamera = true;
      var defaultFrame = (this.game.speechEnabled) ? 'onBtn' : 'offBtn';
      var otherFrame = (this.game.speechEnabled) ? 'offBtn' : 'onBtn';
      this.speechButton = this.game.add.button(this.centerPoint + 30 * this.scaleFactor, 200 * this.scaleFactor, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
      this.speechButton.origWidth = this.copy(this.speechButton.width);
      this.speechButton.origHeight = this.copy(this.speechButton.height);
      this.speechButton.width = this.speechButton.origWidth * this.scaleFactor;
      this.speechButton.height = this.speechButton.origHeight * this.scaleFactor;
      this.speechButton.name = 'speech';
      this.speechButton.anchor.setTo(0, 0.5);
      this.speechButton.fixedToCamera = true;

      this.fxTitle = this.game.add.text(this.centerPoint, 280 * this.scaleFactor, 'Ääniefektit', this.subheaderTextstyle);
      this.fxTitle.anchor.setTo(1, 0.5);
      this.fxTitle.fixedToCamera = true;
      defaultFrame = (this.game.fxEnabled) ? 'onBtn' : 'offBtn';
      otherFrame = (this.game.fxEnabled) ? 'offBtn' : 'onBtn';
      this.fxButton = this.game.add.button(this.centerPoint + 30 * this.scaleFactor, 280 * this.scaleFactor, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
      this.fxButton.origWidth = this.copy(this.fxButton.width);
      this.fxButton.origHeight = this.copy(this.fxButton.height);
      this.fxButton.width = this.fxButton.origWidth * this.scaleFactor;
      this.fxButton.height = this.fxButton.origHeight * this.scaleFactor;
      this.fxButton.name = 'fx';
      this.fxButton.anchor.setTo(0, 0.5);
      this.fxButton.fixedToCamera = true;

      this.musicTitle = this.game.add.text(this.centerPoint, 360 * this.scaleFactor, 'Musiikki', this.subheaderTextstyle);
      this.musicTitle.anchor.setTo(1, 0.5);
      this.musicTitle.fixedToCamera = true;
      defaultFrame = (this.game.musicEnabled) ? 'onBtn' : 'offBtn';
      otherFrame = (this.game.musicEnabled) ? 'offBtn' : 'onBtn';
      this.musicButton = this.game.add.button(this.centerPoint + 30 * this.scaleFactor, 360 * this.scaleFactor, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
      this.musicButton.origWidth = this.copy(this.musicButton.width);
      this.musicButton.origHeight = this.copy(this.musicButton.height);
      this.musicButton.width = this.musicButton.origWidth * this.scaleFactor;
      this.musicButton.height = this.musicButton.origHeight * this.scaleFactor;
      this.musicButton.name = 'music';
      this.musicButton.anchor.setTo(0, 0.5);
      this.musicButton.fixedToCamera = true;

      this.fullscreenTitle = this.game.add.text(this.centerPoint, 440 * this.scaleFactor, 'Koko ruudun tila', this.subheaderTextstyle);
      this.fullscreenTitle.anchor.setTo(1, 0.5);
      this.fullscreenTitle.fixedToCamera = true;
      defaultFrame = (this.game.fullscreenEnabled) ? 'onBtn' : 'offBtn';
      otherFrame = (this.game.fullscreenEnabled) ? 'offBtn' : 'onBtn';
      this.fullscreenButton = this.game.add.button(this.centerPoint + 30 * this.scaleFactor, 440 * this.scaleFactor, 'menuAtlas', this.buttonOnOffSwitch, this, defaultFrame, defaultFrame, otherFrame);
      this.fullscreenButton.origWidth = this.copy(this.fullscreenButton.width);
      this.fullscreenButton.origHeight = this.copy(this.fullscreenButton.height);
      this.fullscreenButton.width = this.fullscreenButton.origWidth * this.scaleFactor;
      this.fullscreenButton.height = this.fullscreenButton.origHeight * this.scaleFactor;
      this.fullscreenButton.name = 'fullscreen';
      this.fullscreenButton.anchor.setTo(0, 0.5);
      this.fullscreenButton.fixedToCamera = true;

      this.backButton = this.game.add.button(this.centerPoint, 640 * this.scaleFactor, 'menuAtlas', this.resumeGame, this, 'takaisinBtn_hover', 'takaisinBtn', 'takaisinBtn_hover');
      this.backButton.origWidth = this.copy(this.backButton.width);
      this.backButton.origHeight = this.copy(this.backButton.height);
      this.backButton.width = this.backButton.origWidth * this.scaleFactor;
      this.backButton.height = this.backButton.origHeight * this.scaleFactor;
      this.backButton.anchor.setTo(0.5, 1);
      this.backButton.fixedToCamera = true;

    }
    else { // Second and further times in pause menu, assets already added and now only made visible/clickable
      //this.settingsButton.input.enabled = true;
      if (!this.pauseMenu_bg.parent) {
        // Add menu items to world
        this.game.world.add(this.pauseMenu_bg);
        this.game.world.add(this.settingsTitle);
        this.game.world.add(this.speechTitle);
        this.game.world.add(this.speechButton);
        this.game.world.add(this.fxTitle);
        this.game.world.add(this.fxButton);
        this.game.world.add(this.musicTitle);
        this.game.world.add(this.musicButton);
        this.game.world.add(this.fullscreenTitle);
        this.game.world.add(this.fullscreenButton);
        this.game.world.add(this.backButton);
      }

      this.speechButton.input.enabled = true;
      //this.fxButton.input.enabled = true;
      //this.musicButton.input.enabled = true;
      //this.fullscreenButton.input.enabled = true;
      this.backButton.input.enabled = true;

      this.pauseMenu_bg.alpha = 1;
      this.settingsTitle.alpha = 1;
      //this.settingsButton.alpha = 1;
      this.speechTitle.alpha = 1;
      this.speechButton.alpha = 1;

      this.fxTitle.alpha = 1;
      //this.fxButton.alpha = 1;
      this.musicTitle.alpha = 1;
      //this.musicButton.alpha = 1;
      this.fullscreenTitle.alpha = 1;
      //this.fullscreenButton.alpha = 1;
      this.backButton.alpha = 1;
    }
    //if (this.sound.usingWebAudio) {
      this.fxButton.alpha = 1;
      this.musicButton.alpha = 1;
    /*}
    else {
      this.fxButton.alpha = 0.5;
      this.musicButton.alpha = 0.5;
    }*/
    //if (this.sound.usingWebAudio) {
      this.fxButton.input.enabled = true;
      this.musicButton.input.enabled = true;
    /*}
    else {
      this.fxButton.input.enabled = false;
      this.musicButton.input.enabled = false;
    }*/
    this.fullscreenButton.input.enabled = (this.game.device.fullscreen) ? true : false;
    this.fullscreenButton.alpha = (this.game.device.fullscreen) ? 1 : 0.5;
  },

  /**
   * Enable or disable highlight frames of settings buttons
   * @alias buttonOnOffSwitch
   * @param {object} btn The recently pressed Phaser button object from callback
   */
  buttonOnOffSwitch: function(btn) {

    if (btn.frameName == 'offBtn') {
      btn.setFrames('offBtn', 'offBtn', 'onBtn');
      this.game[btn.name + 'Enabled'] = false;
    }
    else if (btn.frameName == 'onBtn') {
      btn.setFrames('onBtn', 'onBtn', 'offBtn');
      this.game[btn.name + 'Enabled'] = true;
    }

    if (btn.name == 'music') {
      this.checkAndPlayMusic(); // Start/stop music if it was enabled/disabled
    }

    if (btn.name == 'fullscreen') {
      this.checkFullscreen(); // Start/stop fullscreen if it was enabled/disabled
    }
  },

  /**
   * Come back to game from pause menu, makes everything in the menu invisible and non-clickable
   * @alias resumeGame
   */
  resumeGame: function() {

    this.speechButton.input.enabled = false;
    this.fxButton.input.enabled = false;
    this.musicButton.input.enabled = false;
    this.fullscreenButton.input.enabled = false;
    this.backButton.input.enabled = false;

    this.pauseMenu_bg.alpha = 0;
    this.settingsTitle.alpha = 0;
    this.speechTitle.alpha = 0;
    this.speechButton.alpha = 0;
    this.musicTitle.alpha = 0;
    this.musicButton.alpha = 0;
    this.fxTitle.alpha = 0;
    this.fxButton.alpha = 0;
    this.fullscreenTitle.alpha = 0;
    this.fullscreenButton.alpha = 0;
    this.backButton.alpha = 0;

    if (this.character.clickToMove) {
      this.enableClicks();
    }

    this.enableHovers();
    this.pauseMenuActive = false;
  },

  /**
   * Reset all values and restart game
   * @alias resetGame
   * @param {boolean} toMainMenu If true, return to main menu after reset
   * @param {boolean} toMainMenu If true, clear local storage
   */
  resetGame: function(toMainMenu, clearLocalstorage) {

    this.exitRoom();
    this.declarations();

    // Reset local storage
    if (clearLocalstorage == true) {
    window.localStorage.gamestate = '';
    window.localStorage.npcState = '';
    window.localStorage.assetState = '';
    window.localStorage.questLog = '';
    window.localStorage.characterX = '';
    window.localStorage.characterFace = '';
    window.localStorage.playerCharacterValues = '';
	window.localStorage.inventory = '';
  }

    this.gameStarted = false;
    if (this.music != null && this.music.game != undefined && this.music.game != null) {
      this.music.onStop.removeAll();
      this.music.stop();
      this.music.destroy();
    }
    this.music = null;

    for (var i = 0; i < this.game.rooms.length; i++) {
      for (var j = 0; j < this.game.rooms[i].assets.length; j++) {
        // Deep copy all assets to the asset state array in their original state
        this.game.rooms[i].assets[j] = jQuery.extend(true, {}, this.game.rooms[i].originalAssets[j]);
      }
      for (var j = 0; j < this.game.rooms[i].npcs.length; j++) {
        // Deep copy all npcs to the npc state array in their original state
        this.game.rooms[i].npcs[j] = jQuery.extend(true, {}, this.game.rooms[i].originalNpcs[j]);
      }
    }

    if (toMainMenu !== true) { // Restart game immediately
      this.state.start('Game');
    }
    else if (toMainMenu) { // Go back to main menu
      this.state.start('MainMenu');
    }
  },

  /**
   * Create character after assets when entering a room
   * @alias createCharacter
   */
  createCharacter: function() {

    var playerCharacter = Config.characters[0];
    if (this.gamestate.character != undefined) {
      for (var i = 0; i < Config.characters.length; i++) {
        if (Config.characters[i].machineName == this.gamestate.character) {
          playerCharacter = Config.characters[i];
          break;
        }
      }
    }

    this.character = this.game.add.sprite(325 * this.scaleFactor, 390 * this.scaleFactor, playerCharacter.spriteAtlas);
    this.addDefinedAnimations(playerCharacter);

    this.character.anchor.set(0.5, 1);
		this.character.defaultScale = 1;
    if (this.room.scale != undefined) {
      this.character.defaultScale = this.room.scale;
    }

		this.character.scale.x = this.character.defaultScale * this.scaleFactor;
		this.character.scale.y = this.character.defaultScale * this.scaleFactor;
    this.charSpawnY = this.room.spawnY;

    // Spawn point and facing direction can come either from a parameter or be a default
    this.charSpawnX = (this.customSpawnX == null) ? this.room.spawnX : this.customSpawnX;
    this.charSpawnFace = (this.customSpawnFace == null) ? this.room.spawnFace : this.customSpawnFace;
    this.flipNpc('character', this.charSpawnFace); // Same function works for character as for NPCs

    // Default facing direction
    /*this.character.scale.x = (this.room.spawnFace == 'left') ? -this.character.defaultScale * this.scaleFactor : this.character.defaultScale * this.scaleFactor;
    this.character.scaleDirection = (this.character.scale.x >= 0) ? 1 : -1;*/ // works properly for both directions the character can face, with all scales

    this.noOfFollowers = 0;
    for (npcName in this.npcState) {
      if (this[npcName] && this.npcState[npcName].isFollowing) {
        this.noOfFollowers++;
        this.charSpawnX += this.character.scaleDirection * 40;
      }
    }

    this.setCharX('character', this.charSpawnX);
    this.setCharY('character', this.charSpawnY);

    this.character.origWidth = Math.floor(this.character.width);
    this.character.origHeight = Math.floor(this.character.height);

    this.game.physics.arcade.enable(this.character, Phaser.Physics.ARCADE);

    this.clickplate.events.onInputDown.add(this.moveCharacter, this);
    this.game.camera.follow(this.character);

    this.characterGroup.add(this.character);
    this.startIdleAni('character');

  },

  /**
   * Begin the walking animation of an NPC or character. Automatic when starting to move to a location
   * @alias startWalkAni
   * @param {integer} name This is "character" for the character itself, or name of the NPC
   */
  startWalkAni: function (name) {

    var animName = 'walkAni';
    if (this[name].currentWalk != undefined) {
      animName = this[name].currentWalk;
    }
    // Check that character has correct atlas for animation
    if (this[name].animations._anims[animName] && (!this[name].animations._anims[animName].tempAtlas || this[name].animations._anims[animName].tempAtlas == "")) {
      if (this[name].currentAtlas != this[name].animations._anims[animName].spriteAtlas) {
        this[name].loadTexture(this[name].spriteAtlas);
        this[name].currentAtlas = this[name].spriteAtlas;
      }
    }
    else if (this[name].animations._anims[animName] && this[name].currentAtlas != this[name].animations._anims[animName].tempAtlas) {
      this[name].loadTexture(this[name].animations._anims[animName].tempAtlas);
      this[name].currentAtlas = this[name].animations._anims[animName].tempAtlas;
    }
    this.playAnimation(name, animName);
  },

  /**
   * Begin the idle animation of an NPC or character. Automatic when arriving at a location after walking.
   * @alias startIdleAni
   * @param {string} name Name of NPC or "character"
   */
  startIdleAni: function (name) {

    var animName = 'idleAni';
    if (this[name].currentIdle != undefined) {
      animName = this[name].currentIdle;
    }
    //console.log("started animation is called "+animName);
    // Check that character has correct atlas for animation
    if (this[name].animations._anims[animName] && (!this[name].animations._anims[animName].tempAtlas || this[name].animations._anims[animName].tempAtlas == "")) {
      if (this[name].currentAtlas != this[name].animations._anims[animName].spriteAtlas) {
        this[name].loadTexture(this[name].spriteAtlas);
        this[name].currentAtlas = this[name].spriteAtlas;
      }
    }
    else if (this[name].animations._anims[animName] && this[name].currentAtlas != this[name].animations._anims[animName].tempAtlas) {
      this[name].loadTexture(this[name].animations._anims[animName].tempAtlas);
      this[name].currentAtlas = this[name].animations._anims[animName].tempAtlas;
    }
    this.playAnimation(name, animName);
    // Check that character has correct atlas for animation
  },

  /**
   * Add the name of the player as dynamic text somewhere
   * Function available in editor.
   * @alias addPlayerName
   * @param {string} textId Textual id of text to display (define or update old)
   * @param {string} room Name of room to attach text to
   * @param {integer} x X coordinate of text
   * @param {integer} y Y coordinate of text
   * @param {integer} fontsize Font size of text
   * @param {string} font Font of text
   * @param {string} color color of text
   */
  addPlayerName: function (textId, room, x, y, fontsize, font, color, anchorX, anchorY, foreground) {

    if (font == undefined) font = 'opendyslexicregular';
    if (color == undefined) color = 'fff';
    var anchorX = (anchorX != undefined) ? anchorX : 0;
    var anchorY = (anchorY != undefined) ? anchorY : 0;

    var playerTextStyle = { font: fontsize * this.scaleFactor + "px " + font, fill: "#"+color };

    if (this.playerNameTexts[textId] == undefined) { // Save the info to the object when creating for the first time
      this.playerNameTexts[textId] = {};
      this.playerNameTexts[textId].room = room;
      this.playerNameTexts[textId].x = x
      this.playerNameTexts[textId].y = y;
      this.playerNameTexts[textId].anchorX = anchorX;
      this.playerNameTexts[textId].anchorX = anchorY;
      this.playerNameTexts[textId].textStyle = playerTextStyle;
      this.playerNameTexts[textId].fontsize = fontsize;
      this.playerNameTexts[textId].font = font;
      this.playerNameTexts[textId].color = color;
    }

    if (room && room == this.room.name) { // Add the text if it belongs to this room
      if (this.playerNameTexts[textId].obj == undefined || this.playerNameTexts[textId].obj.game == null) {
        this.playerNameTexts[textId].obj = this.game.add.text(this.playerNameTexts[textId].x * this.scaleFactor, this.playerNameTexts[textId].y * this.scaleFactor, this.gamestate.playerName, this.playerNameTexts[textId].textStyle);
        this.playerNameTexts[textId].obj.anchor.set(this.playerNameTexts[textId].anchorX, this.playerNameTexts[textId].anchorY);
        this.playerNameTexts[textId].obj.name = textId;
        if (foreground == true) {this.playerNameFgTextObjects.add(this.playerNameTexts[textId].obj);} else {this.playerNameBgTextObjects.add(this.playerNameTexts[textId].obj);}
      }
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'addPlayerName') {
      this.cutscenePartCompleted(); // Go to next cut scene piece if this was part of one
    }
  },

  /**
   * Remove the name of the player from somewhere
   * Function available in editor.
   * @alias removePlayerName
   * @param {string} textId Id of text to remove
   */
  removePlayerName: function (textId) {
    this.playerNameTexts[textId].obj.destroy();
    this.playerNameTexts[textId] = null;
    delete this.playerNameTexts[textId];


    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'removePlayerName') {
      this.cutscenePartCompleted(); // Go to next cut scene piece if this dialogue was part of it
    }
  },

  /**
   * Helper function when hovering answer buttons.
   * Checks if there is another answer audio playing, and only plays or queues the current audio if not.
   * Question answers can be queued after other dialogue lines, but not many answers in a row.
   * @alias checkButtonSpeech
   * @param {object} button Phaser button object callback
   */
  checkButtonSpeech: function (button) {
    this.answerButtonIn(button);
    if (button.audio != null && button.audio != "") {
      this.answerAudioLastPlayed = button.audio;
      this.playOrQueueSpeech(null, button.audio);
    }
  },

  /**
   * Hover function for the answer buttons
   * @alias answerButtonIn
   * @param {object} button Phaser callback for button object
   */
  answerButtonIn: function (button) {

    for (var i = 0; i < this.textArray.length; i++) {
      if (button.textIndex != i) {
        if (this.textArray[button.textIndex] && this.textArray[button.textIndex].style.fill != "#FFF") {
          var style = jQuery.extend(true, {}, this.textstyle);
          style.fill = "#FFF";
          this.textArray[button.textIndex].setStyle(style);
        }
      }
    }
    if (this.textArray[button.textIndex]) {
      if (this.textArray[button.textIndex].style.fill == "#00B2CC") return;
      var style = jQuery.extend(true, {}, this.textstyle);
      style.fill = "#00B2CC";
      this.textArray[button.textIndex].setStyle(style);
    }
  },

  /**
   * Hover-out function for the answer buttons
   * @alias answerButtonOut
   * @param {object} button The button object through a Phaser callback
   */
  answerButtonOut: function (button) {

    if (this.textArray[button.textIndex]) {
      if (this.textArray[button.textIndex].style.fill == "#FFF") return;
      var style = jQuery.extend(true, {}, this.textstyle);
      style.fill = "#FFF";
      this.textArray[button.textIndex].setStyle(style);
    }
  },

  /**
   * Plays the current audio (no queueing anymore)
   * @alias playOrQueueSpeech
   * @param {object} button Phaser button object through callback
   * @param {string} audioName Name of speech item to play
   */
  playOrQueueSpeech: function (button, audioName) {

    if (this.music == undefined) this.music = null;
    if (this.music != null && this.music.isPlaying) {
      //this.music.volume = this.musicMultiplierDuringSpeech * this.musicVolume;
      if (this.musicSpeechTween != undefined && this.musicSpeechTween.isRunning) {
        this.musicSpeechTween.stop();
      }
      this.musicSpeechTween = this.game.add.tween(this.music).to({volume: this.musicVolumeDuringSpeech}, 200, Phaser.Easing.Linear.None, true);
    }

    if (/*!this.speechOngoing && */button == null) {
      var audiosprite = false;


      if (audioName[0].substr(audioName[0].length -2) == "_f" || audioName[0].substr(audioName[0].length -2) == "_m") {
        if (this.game.characterGender == "male") {
          audioName[0] = audioName[0].replace('_f', '_m');
          if (audioName[1] != undefined) { audioName[1] = audioName[1].replace('_f', '_m'); }
        } else if (this.game.characterGender == "female") {
          audioName[0] = audioName[0].replace('_m', '_f');
          if (audioName[1] != undefined) { audioName[1] = audioName[1].replace('_m', '_f'); }
        } else {
          console.log('some weird gender error');
        }
      }

      var audioObject = this.game.sounds.audio[audioName[0]];

      // Markus commented out
      if (audioName.length > 1) {
        audiosprite = true;
        audioObject = this.game.sounds.audiosprite[audioName[1]];
      }
      else if (audioObject != undefined) {
        audioObject.volume = this.hoverVolume;
      }

      if ((/*!audiosprite && */audioObject == undefined) || (audiosprite && audioObject.sounds[audioName[0]] == undefined)) {
        console.log("audioObject: " + audioName + " undefined");
        return;
      }

      if (this.currentSound != null) {
        if (this.currentSound.isPlaying) {
          this.speechWasCutShort = true;
          this.currentSound.stop();
        }
        this.currentSound = null;
      }
      this.speechOngoing = true;

      // CHROME IF
      //if (this.game.device.chrome && !this.game.device.mspointer) {
        if (!audiosprite) {
          audioObject.play();
          audioObject.onStop.add(this.speechStopped, this);
          this.speechWasCutShort = false;
          this.currentSound = audioObject;
        }
        else {
          audioObject.play(audioName[0]);
          audioObject.get(audioName[0]).onStop.add(this.speechStopped, this);
          this.speechWasCutShort = false;
          this.currentSound = audioObject.get(audioName[0]);
        }
      //}
    }
    else if (!this.speechOngoing && button != null && button.audio != "" && this.answerAudioLastPlayed != button.audio) {
      this.answerButtonIn(button);
      var audiosprite = false;
      // First item is key
      var audioObject = this.game.sounds.audio[button.audio[0]];
      if (button.audio.length > 1) {
        audiosprite = true;
        audioObject = this.game.sounds.audiosprite[button.audio[1]];
      }
      if (this.currentSound != null) {
        if (this.currentSound.isPlaying) {
          this.currentSound.stop();
        }
        this.currentSound = null;
      }

      if ((audioObject == undefined) || (audiosprite && audioObject.sounds[button.audio[0]] == undefined)) {
        console.log("audioObject: " + button.audio + " undefined");
        return;
      }

      if (!audiosprite) {
        audioObject.play();
        this.speechWasCutShort = false;
        audioObject.onStop.add(this.speechStopped, this);
        this.currentSound = audioObject;
      }
      else {
        audioOject = audioOject.get(button.audio[0]);
        audioObject.play(button.audio[0]);
        this.speechWasCutShort = false;
        audioObject.get(button.audio[0]).onStop.add(this.speechStopped, this);
        this.currentSound = audioObject.get(button.audio[0]);
      }
    }
    else {
      this.answerButtonIn(button);
    }
  },

  /**
   * Single speech item ends
   * @alias speechStopped
   */
  speechStopped: function() {

    //this.speechWasCutShort = false;
    if (this.currentSound != null) {
      if (this.currentSound.isPlaying) {
        this.speechWasCutShort = true;
        this.currentSound.stop();
      }
      this.currentSound = null;
      this.speechOngoing = false;
    }

    if (this.music != null && this.music.isPlaying && !this.speechWasCutShort) {
      //this.music.volume = this.musicVolume;
      this.musicSpeechTween = this.game.add.tween(this.music).to({volume: this.musicVolume}, 5000, Phaser.Easing.Linear.None, true);

      /*if (this.musicSpeechTween != undefined && this.musicSpeechTween.isRunning) {
        this.musicSpeechTween.stop();
        this.musicSpeechTween = this.game.add.tween(this.music).to({volume: });
      }

      if (this.musicSpeechTween == undefined || (this.musicSpeechTween != undefined && !this.musicSpeechTween.isRunning)) {
        this.musicSpeechTween = this.game.add.tween(this.music).to({volume: this.musicVolume}, 5000, Phaser.Easing.Linear.None, true);
      }*/
    }
  },

  /**
   * The main function for running one line of dialogue. Begins the process, goes forward or stops the dialogue chain based on what kind of a dialogue object is coming.
   * @alias dialogueHandler
   * @param {object} textObj Defined only when this function is run as a callback from clicking an object
   */
  dialogueHandler: function(textObj) {

    // In order to prevent accidental double-clicks, next dialogue items will not be available before 0,4 seconds has passed since the last one
    if (this.dialogueDelayEnabled) {
      this.dialogueDelayInProgress = true;
      scope = this; // Won't recognize this inside setTimeout
      setTimeout(function() { scope.dialogueDelayInProgress = false; }, 600);
    }

    if (jQuery.type(textObj) === 'object' && jQuery.type(textObj.dialogue) === 'object') { // These are defined only for objects which trigger dialogues (because they are callbacks)
      this.disableClicks();
      this.activeDialogue = textObj.dialogue; // Start dialogue from here
      this.text = null; // Start from a clean table (causes problems if not)
    }

    if (this.questionInput != null) { // We have an answer to a question to process
      this.points += textObj.points;
      this.questionAnswers[textObj.questionId] = textObj.feedback;
      this.activeDialogue = this.getDialogue(textObj.next);

      if (this.textArray != null) { // Remove the question text objects from view
        for (var i = 0; i < this.textArray.length; i++) {
          this.textArray[i].destroy();
          this.answerButtons[i].alpha = 0;
          this.answerButtons[i].input.enabled = false;
          this.guiElementGroup.remove(this.answerButtons[i]);
        }
        if (this.questionInput != null) {
          delete this.questionInput; // This makes the update loop register global clicks again
          if (this.headerText && this.headerText.game != null) {
            this.headerText.destroy();
          }
          this.headerBg.alpha = 0;
          delete this.headerText;
        }
      }
    }

    if (!this.validString(this.activeDialogue.text) && !this.validNumber(this.activeDialogue.next) && jQuery.type(this.activeDialogue.next) !== 'array') {  // No next nor text defined
      this.dialogueEnd(true); // Parameter makes the exit immediate
    }
    else if (!this.validString(this.activeDialogue.text) && (this.validNumber(this.activeDialogue.next) || jQuery.type(this.activeDialogue.next) === 'array')) { // No text but a next
      // Don't run actions on empty nodes because it doesn't work right
      this.activeDialogue.actionDone = true;
      this.dialogueNext();
      this.dialogueHandler(); // Trigger immediately the next line in order to avoid an extra click!
    }
    else { // Normal processing
      var output = '';
      if (this.game.speechEnabled && this.activeDialogue.audio != null && this.activeDialogue.audio != "") {
        var outputAudio = '';
      }
      else {
        var outputAudio = null;
      }

      if (this.checkType(this.activeDialogue.text) == 'string') {
        output += this.activeDialogue.text;
        if (outputAudio != null) {
          outputAudio = this.activeDialogue.audio;
        }
      }

      output = this.replaceStringsWithValues(output); // Replace gamestate names marked like %gamestatename% to string

      var textBgTween = undefined;
      // First dialogue line -> create this.text
      if (this.text == null && this.validString(output)) {
        this.dialogueInProgress = true;
        this.disableHovers();
        this.setTextBgSayer(this.activeDialogue.sayer, this.activeDialogue.speechAnimation);
        if (this.textBgSayer) {
          //console.log('e');
          this.game.add.tween(this.textBgSayer).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        }

        if (this.checkType(this.activeDialogue.text) != 'choice') {
          textBgTween = this.game.add.tween(this.textBgs).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        }
        // If the whole game needs to be half-faded when there's a dialogue
        //fadeplateTween = this.game.add.tween(this.fadeplate).to({alpha: this.fadeplateMidOpacity}, 500, Phaser.Easing.Linear.None, true);
        this.text = this.game.add.text(this.textX, this.textY, output, this.textstyle);
        this.text.anchor.set(0, 0.5);

        this.text.alpha = 0;
        this.text.fixedToCamera = true;
        textTween = this.game.add.tween(this.text).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);

        if (outputAudio != null) {
          this.playOrQueueSpeech(null, outputAudio);
        }
      }
      // Later lines -> update this.text
      else if (this.text != null && this.text.exists && this.validString(output)) {
        this.setTextBgSayer(this.activeDialogue.sayer, this.activeDialogue.speechAnimation);
        if (this.textBgSayer) {
          //console.log('f');
          //this.game.add.tween(this.textBgSayer).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
          this.textBgSayer.alpha = 1;
        }
        if (this.textBgs.alpha == 0) {
          textBgTween = this.game.add.tween(this.textBgs).to({alpha: 1}, 500, Phaser.Easing.Linear.None, true);
        }
        this.text.setText(output); // Update the normal text

        if (outputAudio != null/*&& this.game[outputAudio] != null*/)  {
          this.playOrQueueSpeech(null, outputAudio);
        }
      }

      // Questions / choices
      if (this.checkType(this.activeDialogue.text) == 'choice') {

        if (this.text != undefined && this.text.exists) { // Remove normal text, if such is visible at the screen
          this.text.destroy();
          this.text = null;
        }

        // Show text on top only when it's not empty string
        if (this.activeDialogue.textOnTop.trim() != "") {
          // Header / question itself
          this.headerBg.alpha = 1;
          var headerSize = Math.floor(32 * this.scaleFactor);
          this.activeDialogue.textOnTop = this.replaceStringsWithValues(this.activeDialogue.textOnTop); // Replace gamestate names marked like %gamestatename%
          this.headerText = this.game.add.text(this.centerPoint, 125 * this.scaleFactor, this.activeDialogue.textOnTop, { font: "bold " + headerSize + "px opendyslexicregular", fill: "#000", align: 'center', });
          this.headerText.anchor.setTo(0.5, 0);
          this.headerText.fixedToCamera = true;
        }

        this.textArray = [];
        if (this.answerButtons) {
          for (var i = 0; i < this.answerButtons.length; i++) {
            this.answerButtons[i].clearFrames();
            this.answerButtons[i].destroy();
          }
        }
        this.answerButtons = [];
        if (textBgTween != undefined && textBgTween.game) {
          textBgTween.stop();
          this.textBgs.alpha = 0;
        }
        // Hide sayer head when choices
        if (this.textBgSayer) {
          //console.log('g');
          this.textBgSayer.alpha = 0;
        }

        this.textBgs.alpha = 0;
        //this.activeDialogue.text = this.shuffle(this.activeDialogue.text); // Randomize the answer order
        var choicesToAdd = [];

        for (var i = 0; i < this.activeDialogue.text.length; i++) {
          // Check if choice has condition and validate it
          if (this.activeDialogue.text[i].condition != undefined && this.activeDialogue.text[i].condition != "") {
            // Validate condition
            var valid = this.checkConditionalActions(this.activeDialogue.text[i]);
            // If choice's condition isn't valid don't show it
            if (!valid) {
              continue;
            }
          }
          choicesToAdd.push(this.activeDialogue.text[i]);
        }
        var visibleChoices = choicesToAdd.length;

        var offsetTop = (visibleChoices <= 6) ? (120 + (6*90 - visibleChoices * 90)/2) : 120;

        for (var i = 0; i < visibleChoices; i++) {

          // Position of buttons
          var buttonY = offsetTop * this.scaleFactor + i * 90 * this.scaleFactor;
          if (visibleChoices > 6) { // Two columns
            var buttonX = 10 * this.scaleFactor;
            if (i >= 6) {
              buttonX = this.game.width/2 + buttonX;
              buttonY = offsetTop * this.scaleFactor + (i - 6) * 90 * this.scaleFactor;
            }
          }
          else { // One column centered
            var buttonX = this.centerPoint - (311 * this.scaleFactor);
          }
          this.answerButtons[i] = this.game.add.button(buttonX, buttonY, 'menuAtlas2', this.dialogueHandler, this, 'choices_tausta_down', 'choices_tausta', 'choices_tausta_down', 'choices_tausta');
          this.answerButtons[i].width = 623 * this.scaleFactor;
          this.answerButtons[i].height = 82 * this.scaleFactor;
          this.answerButtons[i].textIndex = i;

          this.answerButtons[i].anchor.setTo(0, 0);
          this.answerButtons[i].fixedToCamera = true;
          this.guiElementGroup.add(this.answerButtons[i]);

          if (this.game.speechEnabled && choicesToAdd[i].audio != "") {
            this.answerButtons[i].onInputOver.add(this.checkButtonSpeech, this);
            this.answerButtons[i].onInputDown.add(this.playOrQueueSpeech, this);
          }
          else {
            this.answerButtons[i].onInputOver.add(this.answerButtonIn, this);
            this.answerButtons[i].onInputDown.add(this.answerButtonIn, this);
          }
          this.answerButtons[i].onInputOut.add(this.answerButtonOut, this, 100);

          choicesToAdd[i].text = this.replaceStringsWithValues(choicesToAdd[i].text); // Replace gamestate names marked like %gamestatename%

          this.textArray[i] = this.game.add.text(buttonX + this.answerButtons[i].width/2, buttonY + 63 * this.scaleFactor, choicesToAdd[i].text, this.textstyle); // Lines added immediately
          this.textArray[i].anchor.setTo(0.5, 1);
          this.textArray[i].fixedToCamera = true;

          // We save all the properties of the dialogue item to the buttons, so that they are usable in the callback function, which gets the pressed button as a parameter.
          this.answerButtons[i].next = choicesToAdd[i].next; // Save the custom next id to the object for later handling in dialogueNext()
          this.answerButtons[i].points = choicesToAdd[i].points; // Same goes for points...
          this.answerButtons[i].feedback = choicesToAdd[i].feedback; // ...and the feedback to be shown later
          this.answerButtons[i].defaultActions = choicesToAdd[i].defaultActions;
          this.answerButtons[i].conditionalActions = choicesToAdd[i].conditionalActions;
          this.answerButtons[i].audio = choicesToAdd[i].audio;
          this.answerButtons[i].questionId = this.activeDialogue.id; // Save also the id of the question to each answer
          this.answerButtons[i].text = choicesToAdd[i].text; // Save button text itself for printing on the phone

          this.answerButtons[i].input.priorityID = 999;

          this.questionInput = true; // Doesn't matter that this gets redefined on every loop, it's just important for the update loop that there is a questionInput.
        }
      }

      this.dialogueNext();
    }
  },

  /**
   * Dialogues can have %VARIABLENAME% within them, in which case they need to be replaced with this.gamestate.VARIABLENAME
   * @alias replaceStringsWithValues
   * @param {string} output The current dialogue text
   */
  replaceStringsWithValues: function(output) {
    var indexes = [];
    for (var i = 0; i < output.length; i++) { // Get indexes of % characters, marking parts to replace with gamestate values
      if (output[i] == '%') indexes.push(i);
    }
    if (indexes.length > 0) {
      var replaceables = [];
      for (var i = 0; i < indexes.length; i+=2) { // Extract the strings which need to be replaced
        //replaceables.push(output.substr(indexes[i], indexes[i+1]-indexes[i]+1));
        replaceables.push(output.slice(indexes[i], indexes[i+1]+1));
      }

      for (var i = 0; i < replaceables.length; i++) { // Replace strings with corresponding gamestates
        var gamestateName = replaceables[i].substr(1, replaceables[i].length-2);
        if (this.gamestate[gamestateName] != undefined) {
          output = output.replace(replaceables[i], this.gamestate[gamestateName]);
        }
        else {
          console.log('EPÄVALIDI GAMESTATE: '+gamestateName);
        }
      }
    }
    return output;
  },

  /**
   * Display the background image and correct face for the dialogue item being played.
   * @alias setTextBgSayer
   * @param {string} sayer The current character/NPC
   * @param {string} speechAnimation Custom speech animation to run
   */
  setTextBgSayer: function (sayer, speechAnimation) {

    if (this.textBgSayer && this.textBgSayer.frameName != sayer) {
      if (this.textBgSayer.frameName != undefined && this[this.textBgSayer.frameName] != undefined && this[this.textBgSayer.frameName].returnToThisAni != undefined) {
        this.playAnimation(this.textBgSayer.frameName, this[this.textBgSayer.frameName].returnToThisAni);
        this[this.textBgSayer.frameName].returnToThisAni = null;
      }
      this.textBgSayer.destroy();
      this.textBgSayer = null;
    }

    var sayerName = "Kertoja";
    if (sayer == 'you') {
      sayerName = this.gamestate.playerName;
    }
    else {
      for (var i = 0; i < Config.characters.length; i++) {
        if (Config.characters[i].machineName == sayer) {
          sayerName = Config.characters[i].name;
          break;
        }
      }
    }
    this.textBgsSayerText.setText(sayerName);
    var sayerFontSize = parseInt(this.textBgsSayerText.style.font.replace("px troikaregular", ""));
    if (sayerFontSize < Math.floor(26 * this.scaleFactor)) sayerFontSize = Math.floor(26 * this.scaleFactor);
    var sayerTextMargin = 20 * this.scaleFactor;
    while (sayerFontSize > 1 && this.textBgsSayerText.getBounds().width + sayerTextMargin > this.textBgsSayerBg.width) {
      sayerFontSize--;
      this.textBgsSayerText.setStyle({ font: sayerFontSize + "px troikaregular", fill: "#FFF"});
    }

    var sayerX = 130;
    var sayerY = 635;

    if (sayer == undefined || sayer == "") {
      return;
    }
    else if (sayer == 'you') {
      sayerX = (this.game.characterGender == 'female') ? 125 : 135;
      sayerY = (this.game.characterGender == 'female') ? 645 : 630;
      sayer = Config.characters[0].name;
      if (this.gamestate.character != undefined) {
        sayer = this.gamestate.character;
      }
    }
    // Don't add sayer head if frame is not found
    if (!this.game.cache.getImage('sayerAtlas', true).frameData._frameNames.hasOwnProperty(sayer)) return;

    if (!this.textBgSayer || !this.textBgSayer.game || this.textBgSayer.frameName != sayer) {
      this.textBgSayer = this.game.add.image(sayerX, sayerY, 'sayerAtlas');
      this.textBgSayer.frameName = sayer;
      this.textBgSayer.anchor.set(0.5, 0.5);
      // Scale sprite down a bit
      var sayerScale = 0.85;
      this.textBgSayer.x = Math.floor(this.textBgSayer.x * sayerScale);
      this.textBgSayer.x = Math.floor(this.textBgSayer.x * sayerScale);
      this.textBgSayer.width = Math.floor(this.textBgSayer.width * sayerScale);
      this.textBgSayer.height = Math.floor(this.textBgSayer.height * sayerScale);
      this.prepareSpriteScale(this.textBgSayer);
      //this.textBgSayer.fixedToCamera = true;
    }
    this.textBgSayer.x = this.textBgSayer.origX * this.scaleFactor;
    this.textBgSayer.y = this.textBgSayer.origY * this.scaleFactor;
    this.textBgSayer.width = this.textBgSayer.origWidth * this.scaleFactor;
    this.textBgSayer.height = this.textBgSayer.origHeight * this.scaleFactor;
    this.textBgSayer.fixedToCamera = true;

   /*console.log(sayer);
    console.log(this.textBgSayer);
    console.log(this[sayer]);*/

    // Define what animation to return to after the speech ends
    if (this[sayer] != undefined) {
      if (this[sayer].currentIdle != undefined ||this[sayer].currentIdle != null) {
        this[sayer].returnToThisAni = this[sayer].currentIdle;
      }
      else if (this[sayer].animations && this[sayer].animations.currentAnim && this[sayer].animations.currentAnim.name != undefined && this[sayer].animations.currentAnim.name != null) {
        this[sayer].returnToThisAni = this[sayer].animations.currentAnim.name[0];
      }
    }

    // Custom speech animation defined
    if (speechAnimation != undefined && speechAnimation != "") {
      this.playAnimation(sayer, speechAnimation);
    }
    // If default animation is defined use that
    else if (this[sayer] != undefined && this[sayer].animations._anims["speechAni"] != undefined) {
      this.playAnimation(sayer, "speechAni");
    }
  },

  /**
   * Helper function for randomizing the dialogue answer order
   * @alias shuffle
   * @param {array} Answers to be randomized
   */
  shuffle: function (array) {
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  },

  /**
   * Helper function to check type of dialogue item
   * @alias checkType
   * @param {mixed} check The object/string to check
   */
  checkType: function(check) {

    if (jQuery.type(check) === 'string') {
      return 'string';
    }
    else if (jQuery.type(check) === 'array' && jQuery.type(check[0]) === 'object') {
      return 'choice';
    }
  },

  /**
   * Helper function to check validity of "next" id's in dialogues
   * @alias validNumber
   * @param {mixed} check The id to check
   */
  validNumber: function(check) {
    if (jQuery.type(check) === 'number') {
      return true;
    }
    else if (!check || jQuery.type(check) === 'undefined' || jQuery.type(check) === 'null') {
      return false;
    }
  },

  /**
   * Helper function to check validity of strings in dialogues
   * @alias validString
   * @param {mixed} check The item to check
   */
  validString: function(check) {
    if (jQuery.type(check) === 'undefined' || jQuery.type(check) === 'null') {
      return false;
    }
    else if (check.length > 0) {
      return true;
    }
    else {
      return false;
    }
  },

  /**
   * Check if there's another dialogue item coming and continue/end based on that
   * @alias dialogueNext
   */
  dialogueNext: function () {
    // Do all the default and conditional actions tied to this dialogue item on next click
    if (this.activeDialogue.actionDone == null && (this.activeDialogue.defaultActions || this.activeDialogue.conditionalActions)) {

      this.dialogueActionHelper = jQuery.extend(true, {}, this.activeDialogue);

      // There are some occasions when cutscenes / action chains / dialogues overlap and stuff doesn't work as expected. This is meant to avoid those. Far from optimal i guess?
      if (this.queuedActions && this.queuedActions.conditionalActions && this.queuedActions.conditionalActions.length > 0) {
        //for (var i = 0; i < this.queuedActions.conditionalActions.length; i++) { // These might get executed before the cutscene ends :(

        while (this.queuedActions.conditionalActions.length > 0) { // This will execute some rows many times before the conditions apply after rows in cutscenes have changed them
          this.checkAndRunActions('queuedActions');
        }
      }

      // If active dialogue is choice execute actions immediately
      if (this.checkType(this.dialogueActionHelper.text) != 'choice') {
        this.clickplate.events.onInputDown.addOnce(function () {this.checkAndRunActions('dialogueActionHelper');}, this, 100);
      }
      else {
        this.checkAndRunActions('dialogueActionHelper');
      }
      this.activeDialogue.actionDone = true; // Without this it might happen twice since it comes here another time on "next" too.
    }
    // Check if next is array of objects (conditional next)
    if (jQuery.type(this.activeDialogue.next) === 'array' && jQuery.type(this.activeDialogue.next[0]) === 'object') {
      var validNextFound = false;
      for (var i = 0; i < this.activeDialogue.next.length; i++) {
        // Check if choice has condition and validate it
        if (this.activeDialogue.next[i].condition != undefined && this.activeDialogue.next[i].condition != "") {
          // Validate condition
          var valid = this.checkConditionalActions(this.activeDialogue.next[i]);
          // If next item's condition is valid get that dialogue
          if (valid) {
            this.activeDialogue = this.getDialogue(this.activeDialogue.next[i].dialogue);
            validNextFound = true;
            break;
          }
        }
      }
      if (!validNextFound) {
        var tempDialogue = jQuery.extend(true, {}, this.activeDialogue);
        tempDialogue.next = "";
        this.activeDialogue = tempDialogue;
        this.dialogueEnd(true);
      }
    }
    else if (this.validNumber(this.activeDialogue.next)) { // Continue to another dialogue item if "next" exists
      this.activeDialogue = this.getDialogue(this.activeDialogue.next); // Get the next defined dialogue item
    }
    else if (this.text != null && this.text.exists && this.checkType(this.activeDialogue.text) != 'choice') { // Click and get out of choices
      this.dialogueEnd();
    }
  },

  /**
   * End the dialogue either with a click or instantly
   * @alias dialogueEnd
   * @param {boolean} immediate Don't wait for a click, end immediately
   */
  dialogueEnd: function(immediate) {
    if (immediate) {
      this.killDialogue();
    }
    else {
      this.killDialogueSoon = true;
      //this.clickplate.events.onInputDown.addOnce(this.killDialogue, this, 100); // 100 = priority, happens first.
    }
  },

  /**
   * Make the dialogue box go away and resume basic gameplay.
   * The ending function for launchDialogue, which is available in the editor.
   * @alias killDialogue
   */
  killDialogue: function() {

    this.dialogueInProgress = false; // Next update loop makes this.character.clickToMove true; can't have it here!

    // Take text away
    if (this.text != null && this.text.game != null) {
      this.text.alpha = 0;
      this.text.destroy();
    }
    this.enableHovers(); // All assets have be hovered again

    if (this.textBgSayer) {
      if (this.textBgSayer.frameName != undefined && this[this.textBgSayer.frameName] != undefined && this[this.textBgSayer.frameName].returnToThisAni != undefined) {
        this.playAnimation(this.textBgSayer.frameName, this[this.textBgSayer.frameName].returnToThisAni);
      }
      this.game.add.tween(this.textBgSayer).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true).onComplete.add(function () {
          if (this.textBgSayer.alpha == 0) { // Sometimes there's already a new textBgSayer at this point, which we don't want to destroy
            //console.log(this.textBgSayer);
            this.textBgSayer.destroy();
            this.textBgSayer = null;
          }
        }, this);
    }
    textBgTween = this.game.add.tween(this.textBgs).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true); // Tween the background out
    //fadeplateTween = this.game.add.tween(this.fadeplate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);

    if (this.currentSound != null && this.currentSound.isPlaying) {
      this.currentSound.onStop.remove(this.speechStopped, this);
      this.currentSound.stop();
      this.currentSound = null;

      if (this.music != null && this.music.isPlaying) {
        this.musicSpeechTween = this.game.add.tween(this.music).to({volume: this.musicVolume}, 5000, Phaser.Easing.Linear.None, true);
      }
    }


    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'launchDialogue') {
      this.cutscenePartCompleted(); // Go to next cut scene piece if this dialogue was part of it
    }


  },

  /**
   * Validate conditionalActions, return boolean value telling whether the condition applies or not
   * @alias checkConditionalActions
   * @param {object} item The conditional actions to validate
   */
  checkConditionalActions: function(item) {

    var expression = item.condition;
    var variables = expression.match(/\$\w+/g);
    var length = variables.length;
    var uniqueVariables = [];
    var index = 0;

    while (index < length) {
      var variable = variables[index++];
      if (uniqueVariables.indexOf(variable) < 0)
        uniqueVariables.push(variable);
    }

    var condition = Function.apply(null, uniqueVariables.concat("return " + expression));

    var params = [];
    for (var j = 0; j < item.gamestates.length; j++) {
      params.push(this.gamestate[item.gamestates[j]]);
    }
    // Validate condition
    var valid = condition.apply(null, params);
    return valid;
  },

  /**
   * Run a single function in a cutscene or action chain.
   * @alias runActionFunction
   * @param {object} result The object containing information about the function and parameters to run
   */
  runActionFunction: function(result) {
    console.log(result);

    if (result.variableName != undefined) {
      this[result.variableName][result.name].apply(this, result.params);
    }
    else {
      this[result.name].apply(this, result.params);
    }
  },

  /**
   * Create a cutscene or append to it from actions on the fly.
   * @alias prepareCutscene
   * @param {object} actionChain All the actions to be run
   * @param {integer} firstId The id of the first action item in the chain to be run
   */
  prepareCutscene: function (actionChain, firstId) {
    if (this.cutscene.current == null) { // New cutscene beginning, reset
      this.cutscene.current = [];
    }
    for (var i = firstId; i < actionChain.length; i++) { // Add all the remaining chained actions to the cutscene chain
      this.cutscene.current.push(actionChain[i]);
    }
  },

  /**
   * Run a cutscene, which was customly created from chained actions
   * @alias playCutscene
   */
  playCutscene: function() {
    // We always wait for the final part of a cutscene. Without this, the cutscene might end prematurely and cause problems
    this.cutscene.current[this.cutscene.current.length-1].wait = true;

    this.disableClicks(); // Can't move during cutscenes
    if (this.questLogButton.alpha == 1) {
      this.changeGuiVisibility(0.5, 200);
    }

    this.cutscene.isRunning = true;
    this.cutscene.currentId = 0;
    this.cutscene.completed = [];

    for (var i = 0; i < this.cutscene.length; i++) { // Create an array to follow where the cutscene goes
      this.cutscene.completed[i] = false; // Contains a false for each item to run, which turn to true one at a time when it progresses
    }
  },

  /**
   * Put conditional actions to a queue, awaiting condition checking whenever it needs to happen
   * @alias queueActions
   * @param {string} assetName Name of asset which has the actions in it
   * @param {integer} executedIndex Id of how far we've come with the queue
   */
  queueActions: function (assetName, executedIndex) {

    // Maybe there are more conditions to check than the one that started a cutscene now
    if (executedIndex != null && this[assetName].conditionalActions != undefined && this[assetName].conditionalActions[executedIndex + 1] != undefined) {
      // Check and queue any remaining conditional actions to the cutscene so that many can be true and get executed at once
      var helper = {defaultActions: [], conditionalActions: []}; // Create a queue with the default format
      for (var k = executedIndex + 1; k < this[assetName].conditionalActions.length; k++) {
        helper.conditionalActions.push(this[assetName].conditionalActions[k]);
      }
      this.queuedActions = this.copy(helper);
    }
    else {
      this.queuedActions = {defaultActions: [], conditionalActions: []}; // reset
    }
  },

  /**
   * Go through the default and conditional actions of an asset, dialogue item or room, and run the ones which apply.
   * Default actions are always run first, after that all the applying conditional actions starting from the beginning.
   * Changes in conditions which happen during the cutscene are taken into account, so that the conditions are checked only the moment they arrive.
   * @alias checkAndRunActions
   * @param {string} assetName The name of the asset which was clicked and in which the actions are waiting to be checked
   */
  checkAndRunActions: function (assetName) {
    console.log("checkAndRunActions: "+assetName);

    if (this[assetName].defaultActions != undefined) {
      var executedIndex = null;
      defaultActionLoop:
      for (var i = 0; i < this[assetName].defaultActions.length; i++) {
        var result = this[assetName].defaultActions[i];

        // We deviate from normal code execution by creating a custom cutscene
        if (result.wait === true || result.name == 'wait' || result.name == 'launchDialogue' || result.name == 'moveCharacterTo' || result.name == 'displayQuestText' || result.name == 'displayQuestCompleted' || result.name == 'displayInfoBox') { // These actions listed have an automatic, built-in "wait" in them
          // Rest of the action chain becomes a cutscene
          this.prepareCutscene(this[assetName].defaultActions, i);
          executedIndex = this.copy(i);
          break defaultActionLoop;
        }
        else {
          this.runActionFunction(this[assetName].defaultActions[i]);
          executedIndex = this.copy(i);
        }
        this.queueActions(assetName, executedIndex);
      }
    }
    if (this[assetName].conditionalActions != undefined) {

      this.validConditionalAction = false;
      for (var i = 0; i < this[assetName].conditionalActions.length; i++) {

        // Get condition logic
        var valid = this.checkConditionalActions(this[assetName].conditionalActions[i]);

        if (valid) {

          this.validConditionalAction = true;

          var executedIndex = null;

          // Parse and execute result set
          for (var j = 0; j < this[assetName].conditionalActions[i].results.length; j++) {
            var result = this[assetName].conditionalActions[i].results[j];

            // If a cutscene has already begun within these actions, all the rest goes to that cutscene chain
            // Also a few functions have an automatic "wait" built-in for default expected behavior.
            if (this.cutscene.current != null || result.wait === true || result.name == 'wait' || result.name == 'launchDialogue' || result.name == 'moveCharacterTo' || result.name == 'displayQuestText' || result.name == 'displayQuestCompleted' || result.name == 'displayInfoBox') {
              this.prepareCutscene(this[assetName].conditionalActions[i].results, j);
              executedIndex = this.copy(i);
              break; // Break current result loop (all the remaining ones are in the cutscene queue already)
            }
            else {
              this.runActionFunction(result); // Results continue to happen instantly as long as there is no cutscene running
              executedIndex = this.copy(i);
            }
          }

          this.queueActions(assetName, executedIndex);

          break; // Break current conditional action loop (If there are remaining ones, they will be checked and run after the cutscene completes)
        }
        if (assetName == 'queuedActions') {
          this[assetName].conditionalActions[i] = null;
        }
      }
      if (assetName == 'queuedActions') {
        for (var i = this.queuedActions.conditionalActions.length-1; i >= 0 ; i--) {
          if (this.queuedActions.conditionalActions[i] == null) {
            this.queuedActions.conditionalActions.splice(i, 1);
          }
        }
      }
    }

    if (this.cutscene.current != null && !this.cutscene.isRunning) {
      this.playCutscene();
    }
    else if (!this.cutscene.current && this.queuedActions && valid) { // There isn't a cutscene but there's a queue, and something was validly run or queued this time
      this.checkAndRunActions('queuedActions');
    }
  },

  /**
   * This gets run always when we need to go one step forward in the current cutscene.
   * Whenever this goes to true, the next frame in update function launches the next cutscene function.
   * @alias cutscenePartCompleted
   */
  cutscenePartCompleted: function () {
    this.cutscene.completed[this.cutscene.currentId] = true;
  },

  /**
   * Save the game in its current state.
   * Happens automatically very often if this.autoSaveEnabled in declarations is true, can also be triggered manually when debugging.
   * @alias saveGame
   * @param {boolean} manualSave This save was triggered from pressing the save button (as opposed to the save being automatic)
   */
  saveGame: function (manualSave) {
    if (this.autoSaveEnabled || manualSave) {
      if (this.dialogueInProgress) return;
      if (this.gamestate) window.localStorage.gamestate = JSON.stringify(this.gamestate);
      if (this.npcState) window.localStorage.npcState = JSON.stringify(this.npcState);
      if (this.assetState) window.localStorage.assetState = JSON.stringify(this.assetState);
      if (this.questLog) window.localStorage.questLog = JSON.stringify(this.questLog);
      if (this.gamestate.playerName) window.localStorage.playerName = JSON.stringify(this.gamestate.playerName);
      if (this.game.playerCharacterValues) window.localStorage.playerCharacterValues = JSON.stringify(this.game.playerCharacterValues);
      if (this.inventory) window.localStorage.inventory = JSON.stringify(this.inventory);
      if (this.sessionId) window.localStorage.sessionId = JSON.stringify(this.sessionId);

      if (this.character) {
        window.localStorage.characterX = JSON.stringify(this.character.nonScaledX);
        window.localStorage.characterFace = JSON.stringify(this.character.faceDirection);
      }

      var datestamp = new Date();
      // Save states to log for debugging
      $.post("logGame.php", {
        action: 'createLogFile',
        date: datestamp,
        sessionId: this.sessionId,
        gamestate: window.localStorage.gamestate,
        npcState: window.localStorage.npcState,
        assetState: window.localStorage.assetState,
        questLog: window.localStorage.questLog,
        playerCharacterValues: window.localStorage.playerCharacterValues,
        inventory: window.localStorage.inventory,
        characterX: window.localStorage.characterX,
        characterFace: window.localStorage.characterFace,
        filename: 'savegames.log'
      }, "json").done();
      //For console.logging php stuff
      /*.always(
          function(response) {
            console.log('asd3');
            console.log(response);
          }
      );*/

      console.log('GAME SAVED!');
    }
  },

  /**
   * Continue from a previously saved game.
   * @alias loadGame
   */
  loadGame: function () {

    // Add gamestates, npcstates and assetstates to existing arrays instead of replacing them completely, so that new items work which have been saved in the editor after making the last save
    if (window.localStorage.gamestate) {
      var savedGameState = JSON.parse(window.localStorage.gamestate);
      for (var item in savedGameState) {
        this.gamestate[item] = savedGameState[item];
      }
    }
    if (window.localStorage.npcState) {
      var savedNpcState = JSON.parse(window.localStorage.npcState);
      for (var item in savedNpcState) {
        this.npcState[item] = savedNpcState[item];
      }
    }
    if (window.localStorage.assetState) {
      var savedAssetState = JSON.parse(window.localStorage.assetState);
      for (var item in savedAssetState) {
        if (item != undefined) {
          this.assetState[item] = savedAssetState[item];
        }
      }
    }
    // The rest can just be replaced normally

    if (window.localStorage.gamestate) this.gamestate = JSON.parse(window.localStorage.gamestate);
    if (window.localStorage.npcState) this.npcState = JSON.parse(window.localStorage.npcState);
    if (window.localStorage.assetState) this.assetState = JSON.parse(window.localStorage.assetState);
    if (window.localStorage.questLog) this.questLog = JSON.parse(window.localStorage.questLog);
    if (window.localStorage.characterX) this.customSpawnX = JSON.parse(window.localStorage.characterX);
    if (window.localStorage.playerName) this.gamestate.playerName = JSON.parse(window.localStorage.playerName);
    if (window.localStorage.characterFace) this.customSpawnFace = JSON.parse(window.localStorage.characterFace);
    if (window.localStorage.inventory) this.inventory = JSON.parse(window.localStorage.inventory);
    if (window.localStorage.sessionId) this.sessionId = JSON.parse(window.localStorage.sessionId);
  },

  /**
   * Put another dialogue item to the event of clicking an asset
   * Function available in editor.
   * @alias changeDialogue
   * @param {string} assetName The name of the asset to modify
   * @param {integer} dialogueId The new dialogue id to the asset
   */
  changeDialogue: function (assetName, dialogueId) {
    this[assetName].dialogue = this.getDialogue(dialogueId);
    this.modifyAsset(assetName, 'dialogueId', dialogueId);

    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'changeDialogue') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Put another sound to the event of hovering an asset.
   * Function available in editor.
   * @alias changeHoverSound
   * @param {string} assetName The name of the asset to modify
   * @param {string} hoverSound The new sound for the asset
   */
  changeHoverSound: function (assetName, hoverSound) {
    if (hoverSound != "") {
      hoverSound = hoversound.trim().split(",");
      for (var i = 0; i < hoverSound.length; i++) {
        hoverSound[i] = hoverSound[i].trim();
      }
    }
    this.modifyAsset(assetName, 'hoverSound', hoverSound);

    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning == true && this.cutscene.current[this.cutscene.currentId].name == 'changeHoverSound') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Start one defined dialogue item
   * Function available in editor (doesn't get completed before killDialogue)
   * @alias launchDialogue
   * @param {integer} dialogueId The id of the dialogue to launch
   */
  launchDialogue: function (dialogueId) {
    this.activeDialogue = this.getDialogue(dialogueId);
    this.text = null;
    this.disableClicks();
    this.dialogueHandler();
  },

  /**
   * Play all dialogues in a row to for testing puroposes
   * Function available in editor (doesn't get completed before killDialogue)
   * @alias playAllDialogues
   * @param {integer} dialogueId The id of the dialogue to start from
   */
  playAllDialogues: function (dialogueId) {

  },

  /**
   * Play a sound effect if they are enabled
   * Function available in editor.
   * @alias playFx
   * @param {string} fxName The name of the sound effect to play
   */
  playFx: function(fxName, loop) {
    if (this.game.fxEnabled) {
      //this.game[fxName].play();
      if (loop == true) {
        //this.game.sounds.audio[fxName].loop = true;

		// Chrome audio loop bug fix
		// http://www.html5gamedevs.com/topic/13947-audio-not-looping-in-chrome/
		this.game.sounds.audio[fxName].onStop.add(function() {
	      this.game.sounds.audio[fxName].play();
		}, this);
      }
      this.game.sounds.audio[fxName].play();
    }
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'playFx' && this.cutscene.current[this.cutscene.currentId].wait !== true) {
      this.cutscenePartCompleted(); // Go forward instantly
    }
    else if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'playFx' && this.cutscene.current[this.cutscene.currentId].wait === true) {
      this.game[fxName].onComplete.add(this.cutscenePartCompleted, this);
    }
  },

  /**
   * Stop a sound effect from playing.
   * Function available in editor.
   * @alias stopFx
   * @param {string} fxName The name of the sound effect to stop.
   */
  stopFx: function(fxName) {
    if (this.game.sounds.audio[fxName] != null && this.game.sounds.audio[fxName].isPlaying) {

	  // Remove onStop handler to stop the loop
	  this.game.sounds.audio[fxName].onStop.removeAll();
      this.game.sounds.audio[fxName].stop();
    }

    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'stopFx') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Display a hidden asset.
   * Function available in editor.
   * @alias showAsset
   * @param {string} assetName Name of asset to show
   * @param {boolean} [keepDisabled] Do not enable input to the asset while showing it
   */
  showAsset: function(assetName, keepDisabled) {
    if (this[assetName] != null) { // Asset is in current room
      this[assetName].alpha = 1;
      if (this[assetName].disabled && keepDisabled !== true) { // Add also input to asset if such exists, unless specifically not wanted
        this.enableAssetInput(assetName);
      }
    }
    if (keepDisabled !== true) {
      this.modifyAsset(assetName, 'disabled', false);
    }
    this.modifyAsset(assetName, 'invisible', null);

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'showAsset') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Hide a visible asset
   * Function available in editor.
   * @alias hideAsset
   * @param {string} assetName Name of asset to hide
   */
  hideAsset: function(assetName) {

    this.modifyAsset(assetName, 'invisible', true);

    if (this[assetName] != null) { // Asset is in current room

      if (this[assetName].defaultActions || this[assetName].conditionalActions) { // Always disable inputs as well to prevent ghost clicks
        this.modifyAsset(assetName, 'disabled', true);
      }

      this[assetName].alpha = 0;

      if (this[assetName].animations != null) {
        this[assetName].animations.stop();
        this.resetTempAnchor(assetName);
      }
      if (this[assetName].input != null) {
        this.disableAssetInput(assetName);
      }
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'hideAsset') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Put normal anchor back to NPC after having a different, temporary anchor in some animation.
   * @alias resetTempAnchor
   * @param {string} assetName Name of NPC to reset
   */
  resetTempAnchor: function(assetName) {
    if (this[assetName].tempAnchorSet) {
      this[assetName].tempAnchorSet = false;
      if (this[assetName].defaultAnchor) {
        this[assetName].anchor.setTo(this[assetName].defaultAnchor[0], this[assetName].defaultAnchor[1]);
        if (this.npcState[assetName]) this.npcState[assetName].tempAnchor = null;
      }
      else {
        this[assetName].anchor.setTo(0,0);
        if (this.npcState[assetName]) this.npcState[assetName].tempAnchor = null;
      }
    }
  },

  /**
   * Make changes to asset default settings, so that it keep its state until modified again
   * Function available in editor.
   * @alias modifyAsset
   * @param {string} assetName Name of asset to modify
   * @param {string} property Property of asset to modify
   * @param {mixed} value New value to set to asset property
   */
  modifyAsset: function(assetName, property, value) {
    roomLoop: // Get numeric ids of the room and the asset to be able to refer to it
    for (var i = 0; i < this.game.rooms.length; i++) {
      var roomId = i;
      for (var j = 0; j < this.game.rooms[i].assets.length; j++) {
        if (this.game.rooms[i].assets[j].name == assetName) {
          var assetId = j;
          break roomLoop;
        }
      }
    }
    this.game.rooms[roomId].assets[assetId][property] = value;
    this.assetState[assetName][property] = value;

    // When moving an asset in the current room, move it instantly, if it exists
    if (this[assetName] != null && (property == 'x' || property == 'y' || property == 'pickable')) {
      this[assetName][property] = value;

      // Scale x and y properties correctly
      if (property == 'x' || property == 'y') {
        var fixed = this[assetName].fixedToCamera;
        this[assetName].fixedToCamera = false;
        if (property == 'x') {
          this[assetName].origX = value;
          this[assetName].x = this[assetName].origX * this.scaleFactor;
        }
        else if (property == 'y') {
          this[assetName].origY = value;
          this[assetName].y = this[assetName].origY * this.scaleFactor;
        }
        if (fixed) this[assetName].fixedToCamera = true;
      }

      if (property == 'pickable' && value == true) {
        this.defineAssetInput(assetName, 'pickable');
      }
    }

    if (property == 'dialogue') {
      this.defineAssetInput(assetName, 'dialogue');
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'modifyAsset') {
      this.cutscenePartCompleted();
    }

    return assetId;
  },

  /**
   * Lock a door or open a locked door.
   * Function available in editor.
   * @alias modifyDoor
   * @param {integer} doorName Name of door to modify
   * @param {boolean} doorState What to do to the door. true = open, false = close.
   */
  modifyDoor: function(doorName, doorState) {

    var doorTarget = null;
    var doorTargetTemp = null;
    if (!this[doorName] || !this[doorName].game) {
      if (this.assetState[doorName]['doorTarget'] != undefined || this.assetState[doorName]['doorTargetTemp'] != undefined) {
        doorTarget = this.assetState[doorName]['doorTarget'];
        doorTargetTemp = this.assetState[doorName]['doorTargetTemp'];
      }
      else if (this.assetState[doorName]['doorTarget'] == undefined || this.assetState[doorName]['doorTargetTemp'] == undefined) {
        var assetFound = false;
        for (var i = 0; i < this.game.rooms.length; i++) {
          for (var j = 0; j < this.game.rooms[i].assets.length; j++) {
            if (this.game.rooms[i].assets[j].name == doorName) {
              if (doorTarget == undefined || doorTarget == null) {
                doorTarget = this.game.rooms[i].assets[j].doorTarget;
              }
              if (doorTargetTemp == undefined || doorTargetTemp == null) {
                doorTargetTemp = this.game.rooms[i].assets[j].doorTargetTemp;
              }
             assetFound = true;
             break;
            }
          }
          if (assetFound) break;
        }
      }
    }
    else {
      doorTarget = this[doorName].doorTarget;
      doorTargetTemp = this[doorName].doorTargetTemp;
    }
    this.gamestate[doorName] = doorState;


    if (doorState) { // doorState true -> open door

      if (doorTargetTemp != undefined) {

        this.modifyAsset(doorName, 'doorTarget', doorTargetTemp);
        if (this[doorName] != undefined && this[doorName].game != null) {
          this[doorName].doorTarget = this[doorName].doorTargetTemp;
        }
      }
      //this[doorName].input.enabled = true; // TODO: tähän rinnalle dialoguen disablointi

      this.playAnimation(doorName, 'open');
    }
    else if (doorTarget) { // doorstate false or undefined -> close door (don't do anything if doortarget isn't defined, as in this door has already been closed)
      this.modifyAsset(doorName, 'doorTargetTemp', doorTarget);
      this.modifyAsset(doorName, 'doorTarget', null);
      if (this[doorName] != undefined && this[doorName].game != null) {
        this[doorName].doorTargetTemp = doorTarget;

        this[doorName].doorTarget = null;
      }
      //this[doorName].input.enabled = false; // TODO: tämän tilalle dialoguen enablointi
      //this[doorName].dialogue = id <- tähän tyyliin
      this.playAnimation(doorName, 'closed');
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'modifyDoor') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Teleport the character to another room instantly.
   * Function available in editor.
   * @alias teleport
   * @param {string} roomName Room to teleport to
   * @param {string} spawnX X coordinate in the new room where to teleport to
   */
  teleport: function(roomName, spawnX) {
    var teleportTween = this.game.add.tween(this.fadeplate).to({alpha: 1}, 300, Phaser.Easing.Linear.None, true).onComplete.add(function() {
        if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'teleport') {
          this.cutscenePartCompleted();
        }
        this.moveToRoom(roomName, spawnX);
    }, this);
  },

  /**
   * Move from one room to another
   * @alias moveToRoom
   * @param {string} roomName Name of the room to move to
   * @param {integer} [spawnX] X coordinate of character when spawning.
   * @param {string} [spawnFace] Face direction of character when spawning.
   */
  moveToRoom: function(roomName, spawnX, spawnFace) {

    this.killDialogue();
    this.roomFadeDone = false;

    this.gamestate.activeRoom = roomName;
    if (spawnX != undefined) {
      this.customSpawnX = spawnX;
    }
    if (spawnFace != undefined) {
      this.customSpawnFace = spawnFace;
    }

    var currentRoom = this.getRoom(this.gamestate.activeRoom);
    //console.log(Config.sounds.audioSprites);
    //console.log(this.game.sounds.audiosprite);
    // Check if atlases of group is loaded and if not load those
    if (currentRoom.group != undefined && this.loadedGroups.indexOf(currentRoom.group) == -1) {

      // TODO: change to smaller loader bar so that resizing isn't necessary
      // Adjusting scale of preloadSprite doesn't work well because of cropping
      //loader = new Phaser.Loader(this.game);
      this.preloadBarBg = this.add.sprite(325 * this.scaleFactor, 390 * this.scaleFactor, 'menuAtlas');
      this.preloadBarBg.frameName = 'loading';
      this.preloadBarBg.width = 642 * this.scaleFactor;
      this.preloadBarBg.height = 102 * this.scaleFactor;
      this.preloadBar = this.add.sprite(325 * this.scaleFactor, 390 * this.scaleFactor, 'menuAtlas');
      this.preloadBar.frameName = 'loading_over';
      this.preloadBar.width = 642 * this.scaleFactor;
      this.preloadBar.height = 102 * this.scaleFactor;
      this.preloadBarBg.fixedToCamera = true;
      this.preloadBar.fixedToCamera = true;
      this.game.load.setPreloadSprite(this.preloadBar);

      var that = this;
      var onLoaded = function() {
        //that.preloadBar.cropEnabled = false;
        if (that.room != undefined) {
          that.exitRoom(); //	this resets some stuff
        }
        // Add audios to game
        for (var audio in that.game.sounds.audio) {
          if (that.game.sounds.audio[audio] == "null") {
            that.game.sounds.audio[audio] = that.game.add.audio(audio);
          }
        }
        for (var audiosprite in that.game.sounds.audiosprite) {
          if (that.game.sounds.audiosprite[audiosprite] == "null") {
            that.game.sounds.audiosprite[audiosprite] = that.game.add.audioSprite(audiosprite);
          }
        }
        that.create(); //	this creates everything again, but now with new parameters
        that.preloadBarBg.destroy();
        that.preloadBarBg = undefined;
        that.preloadBar.destroy();
        that.preloadBar = undefined;
        if (that.room != undefined) {
          if (!that.roomFadeDone) {
            that.fadeplate.alpha = 1;
            that.game.add.tween(that.fadeplate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
          }
          //that.playFx('sulje_oviFx');
        }

        //that.loadedGroups.push(currentRoom.group);
      }
      for (var i = 0; i < Config.spriteAtlases[currentRoom.group].length; i++) {
        this.game.load.atlasJSONArray(Config.spriteAtlases[currentRoom.group][i][0], Config.spriteAtlases[currentRoom.group][i][1], Config.spriteAtlases[currentRoom.group][i][2]);
      }
      for (var i = 0; i < Config.sounds.general[currentRoom.group].length; i++) {
        this.load.audio(Config.sounds.general[currentRoom.group][i][0], Config.sounds.general[currentRoom.group][i][1]);
        this.game.sounds.audio[Config.sounds.general[currentRoom.group][i][0]] = "null";
      }
      for (var i = 0; i < Config.sounds.audioSprites[currentRoom.group].length; i++) {
        //this.load.audiosprite(key, urls, jsonURL, jsonData, autoDecode)
        this.load.audiosprite(Config.sounds.audioSprites[currentRoom.group][i][0], Config.sounds.audioSprites[currentRoom.group][i][1], Config.sounds.audioSprites[currentRoom.group][i][2]);
        this.game.sounds.audiosprite[Config.sounds.audioSprites[0][i][0]] = "null";
      }
      this.game.load.onLoadComplete.addOnce(onLoaded);
      this.game.load.start();
      that.loadedGroups.push(currentRoom.group);
    }
    else {
      this.exitRoom(); //	this resets some stuff
      this.create(); //	this creates everything again, but now with new parameters
      if (!this.roomFadeDone) {
        this.fadeplate.alpha = 1;
        this.game.add.tween(this.fadeplate).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
      }
      //this.playFx('sulje_oviFx');
    }
  },

  /**
   * Destroy room assets etc when exiting
   * @alias exitRoom
   */
  exitRoom: function() {

    this.game.world.removeAll();


    // Separate sprites
		this.bg.destroy();
    //this.clickplate.destroy();
    //this.fadeplate.destroy();

    // Characters
		this.character.destroy(true);
    for (npcName in this.npcState) {
      if (this[npcName]) {
        this[npcName].destroy(true);
      }
    }

    // Groups
    this.bgItems.destroy(true);
    this.fgItems.destroy(true);

    if (this.displayedAssetName != undefined) this.displayedAssetName.destroy();
    this.playerNameFgTextObjects.destroy(true);
    this.playerNameBgTextObjects.destroy(true);
    this.characterGroup.destroy(true);
    // Destroy only group not children
    this.guiElementGroup.destroy(false);
    this.iconGroup.destroy(false);
    if (this.infoBox != undefined) {
      this.infoBox.destroy(false);
    }
    this.inventoryActive = false;
    this.questLogActive = false;
    this.pauseMenuActive = false;

    // Reset helper arrays
    this.questLogVisibleItems = [];
    //this.foregroundAssets = [];
    this.clickables = [];
    //this.assetsWithHover = [];

    //	Dude might keep on walking if we don't reset this
		this.character.targetScaledX = null;

	},

  /**
   * All assets with hover are disabled e.g. for a dialogue playing
   * @alias disableHovers
   */
  disableHovers: function () {
    for (var i = 0; i < this.assetsWithHover.length; i++) {
      if (this[this.assetsWithHover[i]].alpha > 0) {
        this.disableAssetInput(this.assetsWithHover[i]);
        this[this.assetsWithHover[i]].frameName = this.assetsWithHover[i];
      }
    }
  },

  /**
   * All assets with hover are enabled
   * @alias enableHovers
   */
  enableHovers: function () {
    for (var i = 0; i < this.assetsWithHover.length; i++) {
      if (this[this.assetsWithHover[i]].alpha != 0) {
        this.enableAssetInput(this.assetsWithHover[i]);
        this[this.assetsWithHover[i]].frameName = this[this.assetsWithHover[i]].defaultFrame;
      }
    }
  },

  /**
   * Disactivate picking up inventory objects and all npc & asset actions
   * Character also doesn't move when clicking somewhere
   * @alias disableClicks
   */
  disableClicks: function() {

    for (var i = 0; i < this.clickables.length; i++) {
      if (this.clickables[i].hadInputEnabled == null || this.clickables[i].hadInputEnabled == undefined) {
        this.clickables[i].hadInputEnabled = this.copy(this.clickables[i].input.enabled); // Save info if the input wasn't available when disabling others
      }
      this.clickables[i].input.enabled = false;
    }

    this.character.clickToMove = false;
    this.startIdleAni('character'); // Animations keep rolling while the character is staying still without this

    // Kill tweens which are ongoing
    if (this.characterTween && this.characterTween.isRunning) {
      this.characterTween.pause(); // Without this, sometimes stop() didn't work on it's own :(
      this.characterTween.stop();
    }
  },

  /**
   * Activate picking up inventory objects & action clicks
   * Character can move again by clicking somewhere
   * @alias enableClicks
   */
  enableClicks: function() {

    for (var i = 0; i < this.clickables.length; i++) {
      var item = this.clickables[i];
      if (item) {
        if (item.hadInputEnabled && (this.gamestate[item.name+'InInv'] == undefined || !this.gamestate[item.name+'InInv']) // object is not an inventory item or it has not been picked
              && (!this.npcState[item.name] || this.npcState[item.name].visible)) { // Object is not an NPC hit box or it is visible
          item.input.enabled = true;
        }
        item.hadInputEnabled = null;
      }
    }

    this.character.targetX = null;
    this.character.targetScaledX = null; // If the click target x is still defined when resuming movement, the characters want to go towards it without clicking again
    this.character.clickToMove = true;
  },

  /**
   * Move character to a defined point. Gets run always when clicking to move.
   * @alias moveCharacter
   * @param {object} sprite Phaser sprite for the character from callback
   * @param {object} pointer Phaser pointer for where the mouse was clicked from callback
   * @param {integer} customTarget (Mainly from the cutscene wrapper function moveCharacterTo) Move the character to a custom x coordinate
   * @param {boolean} dontMoveFollower (Mainly from the cutscene wrapper function moveCharacterTo) Move only the character and leave the follower to where it is
   */
  moveCharacter: function(sprite, pointer, customTarget, dontMoveFollower) {

    if (this.character.clickToMove || customTarget != null) {

      if (this.characterTween && this.characterTween.isRunning) {
        this.characterTween.stop();
      }

      if (customTarget == null) { // No target in function call = normal click-movement
        this.character.targetScaledX = pointer.worldX; // "worldX" instead of just "x" is important so that the player can move
        // Limit movement if min or max X is set
        if (this.room.minX != undefined && this.character.targetScaledX < (this.room.minX * this.scaleFactor)) {
          this.character.targetScaledX = this.room.minX * this.scaleFactor;
        }
        if (this.room.maxX != undefined && this.character.targetScaledX > (this.room.maxX * this.scaleFactor)) {
          this.character.targetScaledX = this.room.maxX * this.scaleFactor;
        }
      }
      else { // Cut scene movement with target in function call
        this.character.targetScaledX = customTarget * this.scaleFactor;
      }

      if (this.character.x < this.character.targetScaledX) { // Define which way the character is facing
        //this.character.scale.x = 1 * this.scaleFactor;
        this.character.scale.x = this.character.defaultScale * this.scaleFactor;
        this.character.faceDirection = 'right';
      }
      else {
        //this.character.scale.x = -1 * this.scaleFactor;
        this.character.scale.x = -this.character.defaultScale * this.scaleFactor;
        this.character.faceDirection = 'left';
      }

      var duration = (this.game.physics.arcade.distanceToXY(this.character, this.character.targetScaledX, 500) / (this.defaultWalkingVelocity*this.character.defaultScale)) * 1000 / this.scaleFactor;
      this.character.targetScaledY = this.charSpawnY * this.scaleFactor;

      this.startWalkAni('character');
      this.characterTween = this.game.add.tween(this.character).to({x: this.character.targetScaledX, y: this.character.targetScaledY}, duration, Phaser.Easing.Linear.None, true);
      this.characterTween.onComplete.add(
          function() {
            if (this.character.targetScaledX && this.character.targetScaledY) {
              this.setCharX('character', undefined, this.character.targetScaledX);
              this.setCharY('character', undefined, this.character.targetScaledY);
            }
            $("#debugBox2").html("x: " + this.character.targetScaledX + " y: " + this.character.targetScaledY);
            this.startIdleAni('character');
            this.followerNo = -1;
            for (npcName in this.npcState) {
              if (this[npcName] && this.npcState[npcName].isFollowing && dontMoveFollower == undefined) {
                this.followerNo++;
                this.startWalkAni(npcName);
                this.moveNpcTo(npcName, 'character');
              }
            }
            if (this.followerNo == -1) {
              this.saveGame();
            }
          }, this);
    }

  },

  /**
   * Fade the game screen in or out during a specified time.
   * Function available in editor.
   * @alias fade
   * @param {float} opacity What opacity to fade to from the current opacity, something between 0-1
   * @param {float} seconds For how many seconds the fade process will last
   */
  fade: function(opacity, seconds, color) {

    /*if (color == undefined) {
      color = '000000'; // Default fade color is black
    }*/
    if (color != undefined) {
      this.fadeplate.clear();
      this.fadeplate.beginFill('0x'+color);
      this.fadeplate.lineStyle(1, '0x'+color, 1);
      this.fadeplate.drawRect(0, 0, this.room.bgWidth, this.room.bgHeight);
      this.fadeplate.endFill();
    }

    this.roomFadeDone = true; // Need to be set when default or conditional actions of room contains fade

    if (seconds == null) {
      seconds = 1; // Default = 1 second
    }

    // Instant actions -> no tween
    if (seconds == 0) {
      this.fadeplate.alpha = opacity;
    }
    // Tweens for actual fades
    else {
      var fadeTween = this.game.add.tween(this.fadeplate).to({alpha: opacity}, seconds * 1000, Phaser.Easing.Linear.None, true);
      if (opacity == 0 && color != '000000') { // Reset color to black for room switches
        fadeTween.onComplete.add(function () {
            this.fadeplate.clear();
            this.fadeplate.beginFill(0x000000);
            this.fadeplate.lineStyle(1, 0x000000, 1);
            this.fadeplate.drawRect(0, 0, this.game.width, this.game.height);
            this.fadeplate.endFill();
          }, this);
      }
    }

    // If this was a part of a cutscene, complete it immediately or after the fade has happened
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'fade') {
      if (seconds == 0 || this.cutscene.current[this.cutscene.currentId].wait !== true) {
        this.cutscenePartCompleted();
      }
      else if (seconds > 0 && this.cutscene.current[this.cutscene.currentId].wait === true) {
        fadeTween.onComplete.add(this.cutscenePartCompleted, this);
      }
    }
  },

  /**
   * Wait for X seconds. Function is used for pauses in cutscenes
   * Function available in editor.
   * @alias wait
   * @param {float} seconds For how long to wait
   */
  wait: function(seconds) {
    this.game.time.events.add(seconds * 1000, function() {
        this.cutscenePartCompleted(); // Go forward in cutscene after time has passed
      }, this);
  },

  /**
   * Move an asset to another point, either with a tween or instantly.
   * Function available in editor.
   * @alias moveAssetTo
   * @param {integer} targetX Target X coordinate to move to
   * @param {integer} targetY Target Y coordinate to move to
   * @param {string} assetName Name of asset to move
   * @param {float} velocity How quickly the transition should happen, in pixels per second. 0 means instant movement.
   */
  moveAssetTo: function(targetX, targetY, assetName, velocity) {

    if (velocity > 0) {
      //  velocity = pixels per second = the speed the sprite will move at, regardless of the distance it has to travel
      var duration = (this.game.physics.arcade.distanceToXY(this[assetName], targetX, targetY) / (velocity * this.scaleFactor)) * 1000;
      if (targetX == null) targetX = this[assetName].x / this.scaleFactor;
      if (targetY == null) targetY = this[assetName].y / this.scaleFactor;
      var targetScaledX = targetX * this.scaleFactor;
      var targetScaledY = targetY * this.scaleFactor;
      var tween = this.game.add.tween(this[assetName]).to({x: targetScaledX, y: targetScaledY}, duration, Phaser.Easing.Linear.None, true);
      tween.onComplete.add(
        function () {
          this.modifyAsset(assetName, 'x', targetX);
          this.modifyAsset(assetName, 'y', targetY);
          this.cutscenePartCompleted();
        }, this);
    }
    else {
      this.modifyAsset(assetName, 'x', targetX);
      this.modifyAsset(assetName, 'y', targetY);
      this.cutscenePartCompleted();
    }
  },

  /**
   * Move character to a custom point in a cutscene. Wrapper function for moveCharacter.
   * Function available in editor.
   * @alias moveCharacterTo
   * @param {integer} customTarget Move the character to a custom x coordinate
   * @param {boolean} dontMoveFollower Move only the character and leave the follower to where it is
   */
  moveCharacterTo: function(targetX, dontMoveFollower) {
    this.moveCharacter(null, null, targetX, dontMoveFollower);
    this.characterTween.onComplete.add(function () {

        if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'moveCharacterTo') {
          this.cutscenePartCompleted();
        }
      }, this);
  },

  /**
   * Flip npc or main character to face to a certain direction.
   * Function available in editor.
   * @alias flipNpc
   * @param {string} npcName Name of NPC to flip, or "character" for the main character.
   * @param {mixed} target Target can be "left", "right", "character" or an X coordinate.
   */
  flipNpc: function(npcName, target) {
    var scaleX;

    if (target == 'left') {
      scaleX = -this[npcName].defaultScale * this.scaleFactor;
    }
    else if (target == 'right') {
      scaleX = this[npcName].defaultScale * this.scaleFactor;
    }
    else { // Target is an x coordinate or the character
      if (target == 'character') {
        rotateToX = this.character.nonScaledX;
      }
      else {
        rotateToX = target;
      }

      if (this[npcName].position.x < rotateToX) {
        scaleX = this[npcName].defaultScale * this.scaleFactor;
      }
      else {
        scaleX = -this[npcName].defaultScale * this.scaleFactor;
      }
    }

    this[npcName].scale.x = scaleX;
    this[npcName].scaleDirection = (scaleX >= 0) ? 1 : -1; // works properly for both directions the character can face, with all scales

    this[npcName].faceDirection = (this[npcName].scaleDirection == 1) ? 'right' : 'left'; // Have face direction available for character autosaves
    if (this.npcState[npcName]) {
      this.npcState[npcName].faceDirection = (this[npcName].scaleDirection == 1) ? 'right' : 'left'; // Copy info also to npcState
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'flipNpc') {
      this.cutscenePartCompleted();
    }

  },

  /**
   * Move NPC to somewhere.
   * Function available in editor.
   * @alias moveNpcTo
   * @param {string} npcName Name of NPC to move
   * @param {mixed} target Target can be "character", asset name or x coordinate
   * @param {integer} [targetY] Target Y coordinate to move to. Defaults to the current default Y.
   * @param {integer} [velocity] Velocity of movement in pixels per second. Defaults to the default walking velocity.
   */
  moveNpcTo: function(npcName, target, targetY, velocity) {

    var targetX = null;

    // Define target x first
    if (target == 'character') { // Go to character
      if (this.game.physics.arcade.distanceBetween(this[npcName], this.character) > this.followerOffsetFromChar) {

        // Follower on right side
        if (this.character.nonScaledX - this[npcName].nonScaledX < 0) {
          targetX = this.character.nonScaledX + this.followerOffsetFromChar - this.followerNo * this[npcName].width * 0.5;
        }
        // Follower on left side
        else {
          targetX = this.character.nonScaledX - this.followerOffsetFromChar - this.followerNo * this[npcName].width * 0.5;
        }
      }
      else { // Not far enough from character; don't move!
        this.flipNpc(npcName, 'character');
        this.startIdleAni(npcName);
      }
    }
    else if (jQuery.type(target) !== 'number') { // Go to an asset or NPC
      var parts = target.split("|");
      if (parts.length == 1) { // Only a simple string, go to the asset/npc
        targetX = (this[target]) ? this[target].x : null;
      }
      else { // The name has an +/- offset, which needs to be extracted and calculated
        var assetX = (this[parts[0]]) ? this[parts[0]].x : null;
        var operator = parts[1];
        var offset = parseInt(parts[2]);
        var add_or_subtract = {
          '+': function (x, y) { return x + y },
          '-': function (x, y) { return x - y }
        };
        targetX = add_or_subtract[operator](assetX, offset);
      }
    }
    else { // Target is x coordinate
      targetX = target;
    }

    if (targetY != undefined && jQuery.type(targetY) === 'number') { // Save npc Y state for this room if it was modified
      // Change the y value of the room the NPC is attached to, or current room if not attached
      var room = (this.npcState[npcName].attachedToRoom) ? this.npcState[npcName].attachedToRoom : this.gamestate.activeRoom;
      this.npcState[npcName].exceptionYs[room] = targetY;
    }

    // Npc not in room and thus not existing, just modify default state!
    if (!this[npcName] && ((targetX != undefined && jQuery.type(targetX) === 'number') || (targetY != undefined && jQuery.type(targetY) === 'number'))) {
      this.npcState[npcName].x = (targetX) ? targetX : this[npcName].nonScaledX;
      this.npcState[npcName].y = (targetY) ? targetY : this[npcName].nonScaledY;
    }

    // NPC in room and targetX/targetY warrants movement, do it!
    else if (this[npcName] && ((targetX != undefined && jQuery.type(targetX) === 'number') || (targetY != undefined && jQuery.type(targetY) === 'number'))) {

      // Scale targets. Use current ones if new ones aren't defined.
      this[npcName].targetScaledX = (targetX != undefined && jQuery.type(targetX) === 'number') ? targetX * this.scaleFactor : this[npcName].scaledX;
      this[npcName].targetScaledY = (targetY != undefined && jQuery.type(targetY) === 'number') ? targetY * this.scaleFactor : this[npcName].scaledY;

      if (this[npcName].anchor.x == 0.5) {
        this.flipNpc(npcName, this[npcName].targetScaledX); // Flip NPC to point to the direction where it's about to start walking to
      }

      // velocity = pixels per second
      if (velocity == undefined) velocity = this.defaultWalkingVelocity * this[npcName].defaultScale;

      if (velocity > 0) {
        var duration = (this.game.physics.arcade.distanceToXY(this[npcName], this[npcName].targetScaledX, this[npcName].targetScaledY) / velocity) * 1000/this.scaleFactor;
        this.startWalkAni(npcName);
        this[npcName].tween = this.game.add.tween(this[npcName]).to({x: this[npcName].targetScaledX, y: this[npcName].targetScaledY}, duration, Phaser.Easing.Linear.None, true);
        this[npcName].tween.onComplete.add(
          function() {
            if (this[npcName].targetScaledX != undefined && this[npcName].targetScaledY != undefined) {
              this.setCharX(npcName, undefined, this[npcName].targetScaledX);
              this.setCharY(npcName, undefined, this[npcName].targetScaledY);
              if (this[npcName].tween && !this[npcName].tween.isRunning) {
                this.startIdleAni(npcName);
              }
              this.saveGame();
            }
          }, this);
      }
      else { // Instant movement
        this.setCharX(npcName, undefined, this[npcName].targetScaledX);
        this.setCharY(npcName, undefined, this[npcName].targetScaledY);
      }
    }

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'moveNpcTo') {
      if (this[npcName] && this[npcName].tween && this[npcName].tween.isRunning) {
        this[npcName].tween.onComplete.add(function () {
            this.cutscenePartCompleted();
          }, this);
      }
      else {
        this.cutscenePartCompleted();
      }
    }
  },

  /**
   * Change properties or behavior of an NPC through pre-defined operations.
   * Individual operations commented further inline.
   * Function available in editor.
   * @alias modifyNpc
   * @param {string} npcName
   * @param {string} operation Name of operation to do. Available
   * @param {string} [value] Some operations need a new value also.
   * @param {boolean} [internalCall] This function call was internal instead of coming from an action chain. This means we can't go forward in the cutscene!
   */
  modifyNpc: function(npcName, operation, value, internalCall) { // Point of value varies
    switch (operation) {

      case 'getOut': // Walk to a door (or other asset) and disappear
        this.modifyNpc(npcName, 'stopFollowing', undefined, true);
        this.moveNpcTo(npcName, this[value].x); // Value = door name where to go to
        if (this[npcName]) {
          this[npcName].tween.onComplete.add(function() {
              this.modifyNpc(npcName, 'hide', undefined, true);
            }, this);
        }
        break;

      case 'getIn': // Appear at a door (or other asset)
        if (!this[npcName]) {
          for (var i = 0; i < Config.characters.length; i++) {
            if (Config.characters[i].machineName == npcName && this.npcState[npcName]) {
              this.createNpc(Config.characters[i], this.npcState[npcName].foreground);
              this.arrangeRoomAssets();
              break;
            }
          }
        }

        if (this[npcName]) {
          this.setCharX(npcName, undefined, this[value].x); // Value = door name where to come from
          this.modifyNpc(npcName, 'show', undefined, true);
        }
        break;

      case 'startFollowing': // This NPC will follow the main character for now
        if (!this.npcState[npcName].isFollowing) {
          this.npcState[npcName].isFollowing = true;
        }
        break;

      case 'stopFollowing': // This NPC will stop following the main character for now.
        if (this.npcState[npcName].isFollowing) {
          this.npcState[npcName].isFollowing = false;
        }
        break;

      case 'hide': // Make NPC invisible and non-responsive to clicks.
        if (this[npcName]) {
          this[npcName].alpha = 0;
          // Stop all animations of invisible npc's
        }
        if (this.npcState[npcName]) { // Can also hide character, which isn't in npcState
          this.npcState[npcName].visible = false;
        }
        break;

      case 'show': // Display hidden NPC
        if (this[npcName]) {
          this[npcName].alpha = 1;
        }
        if (this.npcState[npcName]) { // Can also show character, which isn't in npcState
          this.npcState[npcName].visible = true;

          // Enable also input, if there are actions
          if (this[npcName].input != undefined && (this[npcName].defaultActions != undefined && this[npcName].defaultActions.length > 0) || (this[npcName].conditionalActions != undefined && this[npcName].conditionalActions.length > 0)) {
            this[npcName].input.enabled = true;
          }
        }
        break;

      case 'attachToRoom': // Tie non-following NPC to a specific room, so that it sticks there
        var roomToModify = this.getRoom(value); // Value = name of room
        var npcAlreadyInRoom = false;
        for (var i = 0; i < roomToModify.npcs.length; i++) {
          if (roomToModify.npcs[i].machineName == npcName) {
            npcAlreadyInRoom = true;
          }
        }
        if (!npcAlreadyInRoom) {
          roomToModify.npcs.push(jQuery.extend(true, {}, this.game.npcs[npcName]));
          this.modifyNpc(npcName, 'show', undefined, true);
        }
        this.npcState[npcName].attachedToRoom = value;
        break;

      case 'detachFromRoom': // Untie NPC from a specific room
        var roomToModify = this.getRoom(value);
        for (var i = 0; i < roomToModify.npcs.length; i++) {
          if (roomToModify.npcs[i].machineName == npcName) {
            roomToModify.npcs.splice(i, 1);
          }
        }
        this.npcState[npcName].attachedToRoom = null;
        break;

      case 'changeY': // Change Y position permanently for an NPC (until modified again)
        if (this[npcName]) {
          this[npcName].position.y = value;
        }
        this.npcState[npcName].y = value;
        break;

      case 'toggleForeground': // Switch NPC to be foreground or background
        this.npcState[npcName].foreground = !this.npcState[npcName].foreground;
        if (!this.npcState[npcName].foreground) {
          this.bgItems.add(this[npcName]); // This automatically removes it from the other group
        }
        else {
          this.fgItems.add(this[npcName]);
        }
        break;

      case 'changeWalkAnimation': // Change the default walking animation until defined otherwise

        if (this[npcName]) {
          this[npcName].currentWalk = value;
        }
        this.npcState[npcName].currentWalk = value;
        break;

      case 'changeIdleAnimation': // Change the default idle animation until defined otherwise

        if (this[npcName]) {
          this[npcName].currentIdle = value;
        }
        this.npcState[npcName].currentIdle = value;
        //console.log("current idle animation after changeIdleAnimation function for "+npcName);
        //console.log(this[npcName].currentIdle);
        break;

    }

    if (!internalCall && this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'modifyNpc') { // Finish cutscene part for assets which aren't in the room
      this.cutscenePartCompleted();
    }
  },

  /**
   * Define temporary custom atlas for a single animation.
   * Needed e.g. when the animations are too big to fit to only one atlas.
   * @alias setAtlasForAnimation
   * @param {string} assetName Name of asset to be animated
   * @param {string} animationName Name of assets animation, containing information about the custom atlas to be used.
   */
  setAtlasForAnimation: function(assetName, animationName) {

     // Check that asset has correct spriteAtlas for animation and load correct if not
    if (this[assetName].animations._anims[animationName] && (!this[assetName].animations._anims[animationName].tempAtlas || this[assetName].animations._anims[animationName].tempAtlas == "")) {
      // Asset is some character
      if (this[assetName].spriteAtlas && this[assetName].currentAtlas != this[assetName].spriteAtlas) {
        this[assetName].loadTexture(this[assetName].spriteAtlas);
        this[assetName].currentAtlas = this[assetName].spriteAtlas;
      }
      // Asset has customAtlas
      else if (this[assetName].customAtlas && this[assetName].customAtlas != "" /*&& this[assetName].currentAtlas != this[assetName].customAtlas*/) {
        this[assetName].loadTexture(this[assetName].customAtlas);
        this[assetName].currentAtlas = this[assetName].customAtlas;
      }
      // Atlas is roomAtlas
      else if (this[assetName].currentAtlas != "" && this[assetName].currentAtlas != this.room.atlasName) {
        this[assetName].loadTexture(this.room.atlasName);
        this[assetName].currentAtlas = this.room.atlasName;
      }
      else {
        this[assetName].currentAtlas = this[assetName].key;
      }
    }
    else if (this[assetName].animations._anims[animationName] && this[assetName].currentAtlas != this[assetName].animations._anims[animationName].tempAtlas) {
      this[assetName].loadTexture(this[assetName].animations._anims[animationName].tempAtlas);
      this[assetName].currentAtlas = this[assetName].animations._anims[animationName].tempAtlas;
    }
  },

  /**
   * Play one single animation for one asset
   * Function available in editor.
   * @alias playAnimation
   * @param {string} assetName Name of asset to be animated
   * @param {string} animationName Name of animation to be played
   */
  playAnimation: function(assetName, animationName) {

    if (this[assetName] != null && this[assetName].game != null) { // Start animation for an asset in the room
      var tempAnchor = this[assetName].animations._anims[animationName].tempAnchor;
      if (tempAnchor != undefined && tempAnchor[0] != undefined && tempAnchor[1] != undefined) {
        this[assetName].anchor.setTo(tempAnchor[0], tempAnchor[1]);
        this[assetName].tempAnchorSet = true;
        if (this.npcState[assetName]) {
          this.npcState[assetName].tempAnchor = tempAnchor;
        }
      }
      else {
        this.resetTempAnchor(assetName);
      }
      this.setAtlasForAnimation(assetName, animationName);

      if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'playAnimation' && this.cutscene.current[this.cutscene.currentId].wait === true) { // Animations which pause the cutscene for their duration

        // Commented row was there for some reason and caused animations not launching. Delete or put back later (same in next if)
        if (this[assetName].animations._anims[animationName] != null && this[assetName].animations._anims[animationName].name[0] == animationName && this[assetName].animations._anims[animationName].loop) {
        //if (this[assetName].animations.currentAnim != null && this[assetName].animations.currentAnim.name[0] == animationName && this[assetName].animations.currentAnim.loop) { // Doesn't work!
          this.loopNo = 0;
          this[assetName].animations.play(animationName).onLoop.add(function() { // Looping animations are "complete" after first loop
              this.loopNo++;
              if (this.loopNo == 1) {
                this.cutscenePartCompleted();
              }
            }, this);
        }
        else if (this[assetName].animations._anims[animationName].name[0] == animationName && !this[assetName].animations._anims[animationName].loop && this.cutscene.current[this.cutscene.currentId].wait === true) {
        //else if (this[assetName].animations.currentAnim.name[0] == animationName && !this[assetName].animations.currentAnim.loop && this.cutscene.current[this.cutscene.currentId].wait === true) { // Doesn't work!
          this[assetName].animations.play(animationName).onComplete.add(function () {
              this.resetTempAnchor(assetName);
              if (this.npcState[assetName]) { // Make sure that after non-looping NPC animations, subsequent speech animations don't return to repeating them
                this[assetName].animations.currentAnim.name[0] = 'idleAni'; // Quite bubblegum but better than flashing the idleAni when it doesn't belong here
              }
              this.cutscenePartCompleted();
            }, this);
        }
      }
      else { // Animations which continue immediately with cutscene while the animation is playing

        this[assetName].animations.play(animationName);
        if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].wait !== true && this.cutscene.current[this.cutscene.currentId].name == 'playAnimation') {
          this.cutscenePartCompleted();
        }
      }
    }
    else if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'playAnimation') { // Finish cutscene part for assets which aren't in the room
      this.cutscenePartCompleted();
    }

    if (assetName == 'character' || this.npcState[assetName]) {
      //this.modifyNpc(assetName, 'show');
      if (this.npcState[assetName]) {
        if (this[assetName].animations && this[assetName].animations._anims && this[assetName].animations._anims[animationName] && this[assetName].animations._anims[animationName].loop && animationName.substring(0,9) != 'speechAni' && animationName != 'walkAni') {
          this.npcState[assetName].defaultAnimation = animationName;
        }
      }
    }
    else {
      this.showAsset(assetName); // Make asset visible if it wasn't
      if (!this[assetName] || !this[assetName].game || (this[assetName] && this[assetName].animations && this[assetName].animations._anims && this[assetName].animations._anims[animationName] && this[assetName].animations._anims[animationName].loop)) {
        this.modifyAsset(assetName, 'defaultAnimation', animationName); // Put default animation in place, if: a) it's not in this room (will happen when entering the room where it is), b) it's in this room looping, so that the animation stays
      }
    }
  },

  /**
   * Change a gamestate variable to a new value
   * Function available in editor.
   * @alias changeGamestate
   * @param {string} state Name of gamestate to be modified
   * @param {string} value New value to be assigned
   * @param {boolean} [increment] Incremental value assigning instead of complete replacing
   * @param {boolean} [substract] Substract incremental value instead of adding
   */
  changeGamestate: function(state, value, increment, substract) {

    $("#debugBox").html("changeGamestate(" + state + ", " + value + ")");
    console.log("changeGamestate(" + state + ", " + value + ")");

    if (jQuery.type(value) === 'string' && value.substr(0,1) == '%') { // Gamestates can be used as variable values like %GAMESTATENAME%
      var gamestateName = value.substr(1, value.length-2);
      value = this.gamestate[gamestateName];
    }

    if (increment) {
      if (substract) {
        this.gamestate[state] -= value;
      } else {
        this.gamestate[state] += value;
      }
    }
    else {
      this.gamestate[state] = value;
    }

    if (state == "money") {
      this.playerMoney.setText(this.gamestate[state] + ' €');
    }


    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'changeGamestate') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Change scale of character for the current room.
   * Function available in editor.
   * @alias scalePlayer
   * @param {float} value The new scaling value, between 0-1
   */
  scalePlayer: function(value) {

    this.character.defaultScale = value;

		this.character.scale.x = this.character.defaultScale * this.scaleFactor;
		this.character.scale.y = this.character.defaultScale * this.scaleFactor;

    // Checks and completes this as a part of a cutscene, if it was one.
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'scalePlayer') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Get one individual piece of dialogue from the whole batch.
   * @alias getDialogue
   * @param {integer} dialogueId The id of the dialogue to be fetched
   */
  getDialogue: function(dialogueId) {

    var dialogueHandle = [];

    for (var i = 0; i < this.game.dialogueArray.length; i++) {
      if (dialogueId != null && this.game.dialogueArray[i].id == dialogueId) { // Individual dialogue id defined -> return it immediately upon encounter
        this.game.dialogueArray[i].actionDone = null; // This might be defined on second game loop
        return this.game.dialogueArray[i];
      }
    }
    return dialogueHandle;
  },

  /**
   * Get all the information of one room
   * @alias getRoom
   * @param {string} roomID Name of room to be fetched
   */
  getRoom: function(roomID) {
    for (var i = 0; i < this.game.rooms.length; i++) {
      if (this.game.rooms[i].name == roomID) {
        return this.game.rooms[i];
      }
    }
  },

    /**
   * Change follower offset
   * Function available in editor.
   * @alias changeFollowerOffset
   * @param {int} The distance of the follower from the character
   */
  changeFollowerOffset: function(distance) {
    this.followerOffsetFromChar = distance;

    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'changeFollowerOffset') {
      this.cutscenePartCompleted();
    }
  },

  /**
   * Display or hide GUI buttons from view.
   * Function available in editor.
   * @alias changeGuiVisibility
   * @param {boolean} show True for showing, false for hiding
   * @param {integer} tweenDuration How long the fade takes in milliseconds
   */
  changeGuiVisibility: function(newAlpha, tweenDuration) {

    //var newAlpha = (show) ? 1 : 0;
    var show = (newAlpha < 1) ? false : true;

    if (this.playerMoney != undefined) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.playerMoney).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true);
      }
      else {
        this.playerMoney.alpha = newAlpha;
      }
    }
    if (this.playerMoneyBg != undefined) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.playerMoneyBg).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true);
      }
      else {
        this.playerMoneyBg.alpha = newAlpha;
      }
    }
    if (this.pauseMenuButton != undefined) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.pauseMenuButton).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true).onComplete.add(
          function() { this.pauseMenuButton.input.enabled = show; }
        , this);
      }
      else {
        this.pauseMenuButton.alpha = newAlpha;
        this.pauseMenuButton.input.enabled = show;
      }
    }
    if (this.inventoryButton != undefined) {

      if (tweenDuration != undefined) {
        this.game.add.tween(this.inventoryButton).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true).onComplete.add(
          function() { this.inventoryButton.input.enabled = show; }
        , this);
      }
      else {
        this.inventoryButton.alpha = newAlpha;
        this.inventoryButton.input.enabled = show;
      }
    }
    if (this.questLogButton != undefined) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.questLogButton).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true).onComplete.add(
          function() { this.questLogButton.input.enabled = show; }
        , this);
      }
      else {
        this.questLogButton.alpha = newAlpha;
        this.questLogButton.input.enabled = show;
      }
    }
    if (this.highlightButton != undefined) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.highlightButton).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true).onComplete.add(
          function() { this.highlightButton.input.enabled = show; }
        , this);
      }
      else {
        this.highlightButton.alpha = newAlpha;
        this.highlightButton.input.enabled = show;
      }
    }
    if (this.manualSaveButton != undefined && !this.autoSaveEnabled) {
      if (tweenDuration != undefined) {
        this.game.add.tween(this.manualSaveButton).to({alpha: newAlpha}, tweenDuration, Phaser.Easing.Linear.None, true).onComplete.add(
          function() { this.manualSaveButton.input.enabled = show; }
        , this);
      }
      else {
        this.manualSaveButton.alpha = newAlpha;
        this.manualSaveButton.input.enabled = show;
      }
    }
    if (this.cutscene.isRunning && this.cutscene.current[this.cutscene.currentId].name == 'changeGuiVisibility') {
      this.cutscenePartCompleted();
    }
  },
};
