<?php
	session_start();

	// Handle login or logout
	/*
	if (isset($_POST['login']) && isset($_POST['login']['send_login'])) {
		processLogin($_POST['login']['username'], $_POST['login']['password']);
	}
	else if (isset($_GET['logout']) && $_GET['logout']) {
		logout();
	}
	*/

	$javascript_file = 'JSObject.js';

    // Defines which AJAX action is requested
	$action = '';

	if (isset($_REQUEST['action'])) {
		$action = $_REQUEST['action'];
	}
	if ($action == 'saveJSObjectAsJSON') {
		saveJSObjectAsJSON();
		exit;
	}
	else if ($action == 'createConfigFile') {
		createConfigFile();
		exit;
	}
	else if ($action == 'importGameObjects') {
		importGameObjects();
		exit;
	}
	else if ($action == 'getAssetImageProperties') {
		getAssetImageProperties();
		exit;
	}
  else if ($action == 'importAudios') {
    importAudios();
    exit;
  }

	// Read image and music file names from the disk
	$image_folder = dirname(__FILE__) . '/img';
	//$image_files = scandir($image_folder);
  $image_files = array();
  if (is_dir($image_folder)) {
    $image_files = readFileNamesRecursively($image_folder, array("png", "jpg"));
  }

	$music_folder = dirname(__FILE__) . '/sounds/music';
	//$music_files = scandir($music_folder);
  $music_files = array();
  if (is_dir($music_folder)) {
    $music_files = readFileNamesRecursively($music_folder, array("mp3", "ogg"));
  }

	$sounds_folder = dirname(__FILE__) . '/sounds';
	//$sound_files = scandir($sounds_folder);
  $sound_files = array();
  if (is_dir($sounds_folder)) {
    $sound_files = readFileNamesRecursively($sounds_folder, array("mp3", "ogg"));
  }

	// Read json definitions for game from the disk
	$actions_json = 'json/actions.json';
	$actions = readJSONFile($actions_json);
	$rooms_json = 'json/rooms.json';
	$rooms = readJSONFile($rooms_json);

	$sprite_atlases_json = 'json/spriteAtlases.json';
	$sprite_atlases = readJSONFile($sprite_atlases_json);

	$assets_json = 'json/assets.json';
	$assets = readJSONFile($assets_json);

	$sounds_json = 'json/sounds.json';
	$sounds = readJSONFile($sounds_json);

	$dialogs_json = 'json/dialogs.json';
	$dialogs = readJSONFile($dialogs_json);

	$misc_json = 'json/misc.json';
	$misc = readJSONFile($misc_json);

  $tasks_json = 'json/tasks.json';
	$tasks = readJSONFile($tasks_json);

	$gamestates_json = 'json/gamestates.json';
	$gamestates = readJSONFile($gamestates_json);

	$characters_json = 'json/characters.json';
	$characters = readJSONFile($characters_json);

?>
<!DOCTYPE HTML>
<html>
<head>
	<meta charset="utf-8" />
	<title>Errantry</title>
	<script src="lib/jquery-1.11.1.min.js"></script>
	<script src="lib/jquery-ui-1.11.4/jquery-ui.min.js"></script>
	<script src="lib/jquery.layout-latest.js"></script>
	<script src="lib/mindmap.js"></script>
	<script src="editor.js"></script>
	<link href="lib/jquery-ui-1.11.4/jquery-ui.min.css" rel="stylesheet">
	<link href="lib/layout-default-latest.css" rel="stylesheet">
	<link rel="stylesheet" href="lib/mindmap.css">
	<link href="editor.css" rel="stylesheet">
</head>
<script>
	// Print arrays for javascript
  var tasks = <?php echo json_encode($tasks, true); ?>;
	var rooms = <?php echo json_encode($rooms, true); ?>;
	rooms.sort(function(a, b){
		if (a.name < b.name) {
			return -1;
		}
		return 1;
	});
  var writeRooms = false;
  // Create room limits
  for (var i = 0; i < rooms.length; i++) {
    if (rooms[i].minX == undefined) {
      rooms[i].minX = 0;
      writeRooms = true;
    }
    if (rooms[i].maxX == undefined) {
       rooms[i].maxX = rooms[i].bgWidth;
       writeRooms = true;
    }
  }
  if (writeRooms) {
    saveJSObjectAsJSON(rooms, "json/rooms.json");
  }

	var spriteAtlases = <?php echo json_encode($sprite_atlases, true); ?>;
	var actions = <?php echo json_encode($actions, true); ?>;
	if (actions.length == 0) {
		actions = {};
	}
  else if (actions[Object.keys(actions)[0]].comment == undefined) {
    for (var act in actions) {
      var actionTasks = actions[act];
      var newAct = {tasks: actionTasks, comment: ""};
      actions[act] = newAct;
    }
    saveJSObjectAsJSON(actions, "json/actions.json");
  }

	var assets = <?php echo json_encode($assets, true); ?>;
	assets.sort(function(a, b){
		if (a.name < b.name) {
			return -1;
		}
		return 1;
	});
	var sounds = <?php echo json_encode($sounds, true); ?>;

  var musicFiles = <?php echo json_encode($music_files, true); ?>;
  var music = [];
  for (var i = 0; i < musicFiles.length; i++) {
    var musicName = musicFiles[i].replace(".ogg", "").replace(".mp3", "");
    if (music.indexOf(musicName) == -1) {
      music.push(musicName);
    }
  }

	var dialogs = <?php echo json_encode($dialogs, true); ?>;
	var misc = <?php echo json_encode($misc, true); ?>;
	var characters = <?php echo json_encode($characters, true); ?>;
	// Create new character structure
  var createCharacterStructure = false;
  for (var i = 0; i < characters.length; i++) {
    if (jQuery.type(characters[i].animations) !== "array") {
      createCharacterStructure = true;
      characters[i].animations = [];
      // Remove old stuff
      if (characters[i].source) characters[i].source = undefined;
      if (characters[i].bodyparts) characters[i].bodyparts = undefined;
      if (characters[i].headparts) characters[i].headparts = undefined;
      if (characters[i].hair) characters[i].hair = undefined;
      if (characters[i].clothing) characters[i].clothing = undefined;
      if (characters[i].colors) characters[i].colors = undefined;
    }
    if (characters[i].animations.length > 0) {

      for (var j = 0; j < characters[i].animations.length; j++)  {

        if (characters[i].animations[j].generateFrameNames == undefined) {
          createCharacterStructure = true;
          characters[i].animations[j].generateFrameNames = [];
          if (characters[i].animations[j].tempAnchor == undefined) characters[i].animations[j].tempAnchor = [];
          if (characters[i].animations[j].tempAtlas == undefined) characters[i].animations[j].tempAtlas = "";
        }
      }
    }
  }
  if (createCharacterStructure) {
    saveJSObjectAsJSON(characters, "json/characters.json");
  }

	var gamestates = <?php echo json_encode($gamestates, true); ?>;
	var createMissingStates = false;

	var moneyFound = false;
	var activeRoomFound = false;
	for (var i = 0; i < gamestates.length; i++) {

		if (gamestates[i].name == "money") {
			moneyFound = true;
		}
		else if (gamestates[i].name == "activeRoom") {
			activeRoomFound = true;
		}
	}
	if (!moneyFound) {
		createMissingStates = true;
		gamestates.push({"id":misc.gameStateId,"name":"money","type":"int","value":0});
		misc.gameStateId++;
	}
	if (!activeRoomFound) {
		createMissingStates = true;
		gamestates.push({"id":misc.gameStateId,"name":"activeRoom","type":"string","value":""});
		misc.gameStateId++;
	}

	if (createMissingStates) {
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
		saveJSObjectAsJSON(gamestates, "json/gamestates.json");
	}
	gamestates.sort(function(a, b){
		if (a.name < b.name) {
			return -1;
		}
		return 1;
	});

	// Selected items
	var activeRoomID = undefined;
	var activeRoomIndex = undefined;
	var activeAssetName = undefined;
	var activeAssetIndex = undefined;
	var assetFilter = undefined;
	var activeActionName = undefined;
	//var activeActionIndex = undefined;
	var activeDialogID = undefined;
	var activeDialogIndex = undefined;
	var dialogFilter = undefined;
	var dialogRootNode = undefined;
	var dialogRefreshPath = true;
	var activeCharacterID = undefined;
	var activeCharacterIndex = undefined;

	var availableGameStates = [];
	var dialogueSearch = [];
	var assetSearch = [];
	var npcSearch = [];
  var roomSearch = [];
</script>
<body>

<?php /* if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) : ?>
    <div id="login_header">
		<div id="login">
			<p class="error" id="login_error"><?php if (isset($_POST['login']['error_msg'])) echo $_POST['login']['error_msg']; ?></p>
			<form id="login_form" action="" method="post">
				<label for="login[username]">Username:</label><br />
				<input type="text" id="login[username]" name="login[username]" value="" /><br />
				<label for="login[password]">Password:</label><br />
				<input type="password" id="login[password]" name="login[password]" value="" /><br />
				<input type="submit" id="login[send_login]" name="login[send_login]" value="Login" />
			</form>
		</div>
	</div>
<?php else: */ ?>
    <div id="header">
		<span id="startingRoomSection"><label for="startingRoom">Starting room: </label><select id="startingRoom" class="roomSelection dropdown-select"></select></span>
		<button class="headerButton" id="charactersViewButton">Characters</button>
		<button class="headerButton" id="spriteAtlasesViewButton">Sprite Atlases</button>
		<button class="headerButton" id="soundsViewButton">Sounds</button>
		<span id="playerCharacterSection"><label for="playerCharacter">Player Character: </label><select id="playerCharacter" class="characterSelection dropdown-select"></select></span>
		<button id="importAll">Import editor/import/*</button>
		<button id="exportAndLaunch" >Export and Launch</button>
    <?php if (isset($_SESSION['logged_in']) && $_SESSION['logged_in']) : ?>
        <span id="logoutLink"><a href="<?php echo($_SERVER['PHP_SELF'] . '?logout=1'); ?>" id="logout_link">Logout</a></span>
    <?php endif; ?>
		<br />
		<hr />
    </div>

	<div class="contentView" id="charactersView" style="">
		<h2>Characters</h2>
		<button id="deleteCharacterButton">Delete</button>
		<select id="characterSelection" class="characterSelection"></select>
		<button id="createCharacterButton">New</button>
		<button id="saveCharacterButton">Save</button>
		<button id="duplicateCharacterButton">Duplicate</button>
		<div id="characterInfo">
			<div id="characterAccordion">
				<h3>Properties</h3>
				<div>
					<label for="characterId">Id: </label><input type="text" id="characterId" name="characterId" value="" disabled="disabled" /><br />
					<label for="characterMachineName">Machine Name: </label><input type="text" id="characterMachineName" name="characterMachineName" value="" /><br />
					<label for="characterName">Name: </label><input type="text" id="characterName" name="characterName" value="" /><br />
					<label for="characterNick">Nickname: </label><input type="text" id="characterNick" name="characterNick" value="" /><br />
					<label for="characterRoomSelection">Room: </label><select id="characterRoomSelection" class="roomSelection"></select><br />
          <label for="characterScaleWithRoom">Disable Room Scale: </label><input type="checkbox" id="characterScaleWithRoom" name="characterScaleWithRoom" value="" /><br />
					<label for="characterX">X: </label><input type="text" id="characterX" name="characterX" value="" /><br />
					<label for="characterY">Y: </label><input type="text" id="characterY" name="characterY" value="" /><br />
					<label for="characterForeground">Foreground:</label>
					<select id="characterForeground" name="characterForeground">
						<option value="false">false</option>
						<option value="true">true</option>
					</select><br />
					<label for="characterAtlas">Sprite Atlas: </label><input type="text" id="characterAtlas" name="characterAtlas" value="" /><br />
					<!--<label for="characterSource">Source: </label><input type="text" id="characterSource" name="characterSource" value="" />-->
				</div>
				<!--<h3>Bodyparts</h3>
				<div>
					<label for="characterTorso">Torso: </label><input type="text" id="characterTorso" name="characterTorso" value="" /><br />
					<label for="characterArms">Arms: </label><input type="text" id="characterArms" name="characterArms" value="" /><br />
					<label for="characterLegs">Legs: </label><input type="text" id="characterLegs" name="characterLegs" value="" /><br />
					<label for="characterHead">Head: </label><input type="text" id="characterHead" name="characterHead" value="" /><br />
					<label for="characterBoobs">Boobs: </label><select id="characterBoobs" name="characterBoobs"><option value="false" selected="selected">false</option><option value="true">true</option></select>
				</div>
				<h3>Headparts</h3>
				<div>
					<label for="characterMouth">Mouth: </label><input type="text" id="characterMouth" name="characterMouth" value="" /><br />
					<label for="characterEyes">Eyes: </label><input type="text" id="characterEyes" name="characterEyes" value="" /><br />
					<label for="characterCheeks">Cheeks: </label><input type="text" id="characterCheeks" name="characterCheeks" value="" /><br />
					<label for="characterNose">Nose: </label><input type="text" id="characterNose" name="characterNose" value="" />
				</div>
				<h3>Hair</h3>
				<div>
					<label for="characterHair">Hair: </label><input type="text" id="characterHair" name="characterHair" value="" /><br />
					<label for="characterMoustache">Moustache: </label><input type="text" id="characterMoustache" name="characterMoustache" value="" /><br />
					<label for="characterEyebrows">Eyebrows: </label><input type="text" id="characterEyebrows" name="characterEyebrows" value="" /><br />
					<label for="characterBeard">Beard: </label><input type="text" id="characterBeard" name="characterBeard" value="" />
				</div>
				<h3>Clothing</h3>
				<div>
					<label for="characterShirt">Shirt: </label><input type="text" id="characterShirt" name="characterShirt" value="" /><br />
					<label for="characterShoes">Shoes: </label><input type="text" id="characterShoes" name="characterShoes" value="" /><br />
					<label for="characterPants">Pants: </label><input type="text" id="characterPants" name="characterPants" value="" />
				</div>
				<h3>Colors</h3>
				<div>
					<label for="characterColorHair">Hair: </label><input type="text" id="characterColorHair" name="characterColorHair" class="color" value="" /><br />
					<label for="characterColorBeard">Beard: </label><input type="text" id="characterColorBeard" name="characterColorBeard" class="color" value="" /><br />
					<label for="characterColorMoustache">Moustache: </label><input type="text" id="characterColorMoustache" name="characterColorMoustache" class="color" value="" /><br />
					<label for="characterColorEyebrow">Eyebrow: </label><input type="text" id="characterColorEyebrow" name="characterColorEyebrow" class="color" value="" /><br />
					<label for="characterColorShirt">Shirt: </label><input type="text" id="characterColorShirt" name="characterColorShirt" class="color" value="" /><br />
					<label for="characterColorSkintone">Skintone: </label><input type="text" id="characterColorSkintone" name="characterColorSkintone" class="color" value="" /><br />
					<label for="characterColorPants">Pants: </label><input type="text" id="characterColorPants" name="characterColorPants" class="color" value="" /><br />
					<label for="characterColorShoes">Shoes: </label><input type="text" id="characterColorShoes" name="characterColorShoes" class="color" value="" />
				</div>-->
				<h3>Animations</h3>
				<div>
					<!--<label for="characterAnimationIdle">Idle: </label><input type="text" id="characterAnimationIdle" name="characterAnimationIdle" value="" /><br />
					<label for="characterAnimationWalkstyle">Walkstyle: </label><input type="text" id="characterAnimationWalkstyle" name="characterAnimationWalkstyle" value="" /><br />-->
					<h4>"walkAni" and "idleAni" are required for each character</h4>
          <button id="characterAddAnimation" class="addAnimation">Add Animation</button>
					<ul id="characterAnimationsList"></ul>
				</div>
				<h3>Default Actions <span id="characterDefaultActionsNbr"></span></h3>
				<div>
					<select id="characterAddDefaultActionSelect" name="characterAddDefaultActionSelect" class="addDefaultActionSelect"></select> <button id="characterAddDefaultAction" class="addDefaultAction">Add</button>
					<ul id="characterDefaultActionsList"></ul>
				</div>
				<h3>Conditional Actions <span id="characterConditionalActionsNbr"></span></h3>
				<div>
					<button id="characterAddCondition" class="addCondition">Add Condition</button>
					<ul id="characterConditionalActionsList"></ul>
				</div>
			</div>
		</div>
	</div>

	<div class="contentView" id="spriteAtlasesView">
		<h2>Sprite Atlases</h2>

		<div id="createNewSpriteAtlas">
			<label for="spriteAtlasName">Name: </label><input type="text" id="spriteAtlasName" name="spriteAtlasName" value="" />
			<label for="spriteAtlasSpritesheet"> Spritesheet: </label><input type="text" id="spriteAtlasSpritesheet" name="spriteAtlasSpritesheet" value="" />
			<label for="spriteAtlasJSON"> JSON: </label><input type="text" id="spriteAtlasJSON" name="spriteAtlasJSON" value="" />
			<button id="newSpriteAtlasButton">Add New</button>
		</div>
		<ul id="spriteAtlasesList"></ul>
		<br />
	</div>

	<div class="contentView" id="soundsView" style="">
		<h2>Sounds</h2>
		<h3>Audio Sprites:</h3>
		<div id="createNewAudioSprite">
			<label for="audioSpriteName">Name: </label><input type="text" id="audioSpriteName" name="audioSpriteName" value="" />
			<label for="audioSpriteURLs"> Files: </label><input type="text" id="audioSpriteURLs" name="audioSpriteURLs" value="" />
			<label for="audioSpriteJSON"> JSON: </label><input type="text" id="audioSpriteJSON" name="audioSpriteJSON" value="" />
			<button id="newAudioSpriteButton">Add New</button>
		</div>
		<ul id="audioSpritesList"></ul>
		<br />
		<h3>General Audios:</h3>
		<div id="createNewAudioSprite">
			<label for="normalAudioName">Name: </label><input type="text" id="normalAudioName" name="normalAudioName" value="" />
			<label for="normalAudioFiles"> Files: </label><input type="text" id="normalAudioFiles" name="normalAudioFiles" value="" />
			<button id="newNormalAudioButton">Add New</button>
		</div>
		<ul id="normalAudiosList"></ul>
		<br />

		<label for="musicFiles">Music Files:</label>
		<?php echo $music_folder; ?>
		<ul id="musicFiles" name="musicFiles">
		<?php
			foreach ($music_files as $music) {
				echo "<li>" . $music . "</li>" . PHP_EOL;
			}
		?>
		</ul>
		<br />
		<!--<label for="soundFiles">Sound Files:</label>
		<?php echo $sounds_folder; ?>
		<ul id="soundFiles" name="soundFiles">
		<?php
			foreach ($sound_files as $sound) {
				echo "<li>" . $sound . "</li>" . PHP_EOL;
			}
		?>
		</ul>-->
	</div>

    <div id="container">

		<div class="" id="mainWindow">

			<div class="pane" id="topWindow">
				<div class="pane" id="roomsView">
					<h2>Rooms</h2>
					<div class="leftSide">
						<button id="deleteRoomButton">Delete</button>
						<select id="roomSelection" class="roomSelection dropdown-select"></select>
						<button id="createRoomButton">New</button>
						<button id="saveRoomButton">Save</button>
					</div>
					<div class="rightSide">
						<div id="bgPreview"><img src="" style="display:none;" /></div>
					</div>
					<div id="roomInfo">
						<div id="roomAccordion">
							<h3>Properties</h3>
							<div style="text-align: center;">
								<div class="leftProperties">
									<label for="roomId">Id: </label><input type="text" id="roomId" name="roomId" value="" disabled="disabled" /><br />
									<label for="roomName">Name: </label><input type="text" id="roomName" name="roomName" value="" /><br />
									<label for="roomGroup">Loading Group: </label><input type="text" id="roomGroup" name="roomGroup" value="" /><br />
									<label for="atlasName">Atlas Name: </label><select name="atlasName" id="atlasName" class=""></select><br />
									<label for="bgImage">Background Image: </label><br />
									<select id="bgImage" name="bgImage">
										<option value="-1" selected="selected">None</option>
									<?php
										foreach ($image_files as &$img) {
											$img = str_replace('\\', '/' , $img);
											echo '<option value="' . $img . '">' . $img . '</option>' . PHP_EOL;
										}
									?>
									</select>
                  <label for="minX">Minimum X: </label><input type="text" id="minX" name="minX" value="" /><br />
									<label for="maxX">Maximum X: </label><input type="text" id="maxX" name="maxX" value="" /><br />
								</div>
								<div class="rightProperties">
									<label for="bgWidth">Background Width: </label><input type="text" id="bgWidth" name="bgWidth" value="" /><br />
									<label for="bgHeight">Background Height: </label><input type="text" id="bgHeight" name="bgHeight" value="" /><br />
									<label for="spawnX">Spawn X: </label><input type="text" id="spawnX" name="spawnX" value="" /><br />
									<label for="spawnY">Spawn Y: </label><input type="text" id="spawnY" name="spawnY" value="" /><br />
									<label for="spawnFace">Spawn Face: </label>
									<select id="spawnFace" name="spawnFace">
										<option value="left">Left</option>
										<option value="right">right</option>
									</select><br />
									<label for="backgroundMusic">Background Music:</label><input type="text" id="backgroundMusic" name="backgroundMusic" value="" /><br />
									<label for="scale">Scale: </label><input type="text" id="scale" name="scale" value="" />
								</div>
							</div>
							<h3>Assets <span id="roomAssetNbr"></span> / NPCs <span id="roomNPCNbr"></span></h3>
							<div>
								<h4>Assets:</h4>
								<select name="availableRoomAssets" id="availableRoomAssets" class=""></select><button id="addRoomAssetButton">Add</button>
								<ul id="roomAssetsList"></ul>
								<br />
								<h4>NPCs:</h4>
								<ul id="roomNPCList"></ul>
							</div>
							<h3>Default Actions <span id="roomDefaultActionsNbr"></span></h3>
							<div>
								<select id="roomAddDefaultActionSelect" name="roomAddDefaultActionSelect" class="addDefaultActionSelect"></select> <button id="roomAddDefaultAction" class="addDefaultAction">Add</button>
								<ul id="roomDefaultActionsList"></ul>
							</div>
							<h3>Conditional Actions <span id="roomConditionalActionsNbr"></span></h3>
							<div>
								<button id="roomAddCondition" class="addCondition">Add Condition</button>
								<ul id="roomConditionalActionsList"></ul>
							</div>
						</div>
					</div>
				</div>

				<div class="pane" id="assetsView">
					<h2>Assets</h2>
					<div class="leftSide">
						<label for="assetFilterSelection">Filter:</label>
						<select id="assetFilterSelection" name="assetFilterSelection"></select><br /><br />
						<button id="deleteAssetButton">Delete</button>
						<select id="" class="assetSelection"></select>
						<button id="createAssetButton">New</button>
						<button id="saveAssetButton">Save</button>
					</div>
					<div class="rightSide">
						<div id="assetPreview"><canvas id="assetPreviewCanvas" style="display: none;"></canvas><img src="" /></div>
					</div>
					<div id="assetInfo">
						<button id="duplicateAsset">Duplicate</button><br /><br />
						<div id="assetAccordion">
							<h3>Properties</h3>
							<div style="text-align: center;">
								<div class="leftProperties">
									<label for="assetName">Name:</label><input type="text" id="assetName" name="assetName" value="" /><br />
									<label for="assetRooms">Rooms:</label><input type="text" id="assetRooms" name="assetRooms" value="" disabled="disabled" /><br />
									<label for="assetX">X:</label><input type="text" id="assetX" name="assetX" value="" /><br />
									<label for="assetY">Y:</label><input type="text" id="assetY" name="assetY" value="" /><br />
									<label for="assetForeground">Foreground:</label>
									<select id="assetForeground" name="assetForeground">
										<option value="false">false/undefined</option>
										<option value="true">true</option>
									</select><br />
									<label for="assetInvisible">Invisible:</label>
									<select id="assetInvisible" name="assetInvisible">
										<option value="false">false/undefined</option>
										<option value="true">true</option>
									</select><br />
									<label for="assetDisabled">Disabled:</label>
									<select id="assetDisabled" name="assetDisabled">
										<option value="false">false/undefined</option>
										<option value="true">true</option>
									</select><br />
									<label for="assetTransparentClick">Transparent Click:</label>
									<select id="assetTransparentClick" name="assetTransparentClick">
										<option value="false">false/undefined</option>
										<option value="true">true</option>
									</select><br />
                  <label for="assetDescription">Description:</label><br />
                  <textarea id="assetDescription" name="assetDescription"></textarea><br />
								</div>
								<div class="rightProperties">
									<label for="assetDialogueId">Dialogue:</label><select id="assetDialogueId" name="assetDialogueId" class="dialogueSelection"></select>
									<button id="assetShowDialogueButton">View</button> <input type="text" id="assetDialogueSearch" name="assetDialogueSearch" value="" class="dialogueSearch" placeholder="Search..." /><br />
									<label for="assetDoorTarget">Door Target:</label>
									<select id="assetDoorTarget" name="assetDoorTarget"></select><br />
									<label for="assetDoorSpawn">Door Spawn:</label><input type="text" id="assetDoorSpawn" name="assetDoorSpawn" value="" /><br />
                  <label for="assetDoorFace">Door Face:</label>
									<select id="assetDoorFace" name="assetDoorFace"><option value="-1">None</option><option value="left">left</option><option value="right">right</option></select><br />
									<label for="assetHoverSound" style="display:none;">Hover Sound:</label><input type="text" id="assetHoverSound" name="assetHoverSound" value="" style="display:none;" />
									<label for="assetClickSound">Click Sound:</label><input type="text" id="assetClickSound" name="assetClickSound" value="" /><br />
									<label for="assetDefaultFrame">Default Frame:</label><input type="text" id="assetDefaultFrame" name="assetDefaultFrame" value="" /><br />
									<label for="assetHoverFrame"style="display:none;">Hover Frame:</label><input type="text" id="assetHoverFrame" name="assetHoverFrame" value="" style="display:none;"/>
									<label for="assetCustomAtlas">Custom Atlas:</label><select id="assetCustomAtlas" name="assetCustomAtlas" value="-1"></select><!--<input type="text" id="assetCustomAtlas" name="assetCustomAtlas" value="" />--><br />
									<label for="assetPickable">Pickable:</label>
									<select id="assetPickable" name="assetPickable">
										<option value="false">false</option>
										<option value="true">true</option>
									</select><br />
									<!-- Ville & Markus testaa -->
									<label for="assetFixed">Fixed to camera:</label>
									<select id="assetFixed" name="assetFixed">
										<option value="false">false</option>
										<option value="true">true</option>
									</select><br />

									<label for="assetRotation">Rotation angle:</label><input type="text" id="assetRotation" name="assetRotation" value="" /><br />

                  <label for="assetApproachOffsetLeft">Approach offset left:</label><input type="text" id="assetApproachOffsetLeft" name="assetApproachOffsetLeft" value="" /><br />
                  <label for="assetForcedApproachDirection">Force approach direction (left or right):</label><input type="text" id="assetForcedApproachDirection" name="assetForcedApproachDirection" value="" /><br />
                  <label for="assetApproachOffsetRight">Approach offset right:</label><input type="text" id="assetApproachOffsetRight" name="assetApproachOffsetRight" value="" /><br />
									<!-- Ville & Markus lopettaa testauksen -->

									<label for="assetNPC">NPC: </label><input type="checkbox" id="assetNPC" name="assetNPC" value="" />
								</div>
							</div>
							<h3>Animations <span id="assetAnimationNbr"></span></h3>
							<div>
								<button id="assetAddAnimation" class="addAnimation">Add Animation</button>
								<ul id="assetAnimationsList"></ul>
							</div>
							<h3>Default Actions <span id="assetDefaultActionsNbr"></span></h3>
							<div>
								<select id="assetAddDefaultActionSelect" name="assetAddDefaultActionSelect" class="addDefaultActionSelect"></select> <button id="assetAddDefaultAction" class="addDefaultAction">Add</button>
								<ul id="assetDefaultActionsList"></ul>
							</div>
							<h3>Conditional Actions <span id="assetConditionalActionsNbr"></span></h3>
							<div>
								<button id="assetAddCondition" class="addCondition">Add Condition</button>
								<ul id="assetConditionalActionsList"></ul>
							</div>
						</div>
					</div>
				</div>

			</div> <!-- mid-top -->
			<div class="pane" id="bottomWindow"><!-- mid-bottom -->
				<div class="pane" id="actionsView">
					<h2>Actions</h2>
					<button id="deleteActionButton">Delete</button>
					<select id="" class="actionSelection"></select>
					<button id="createActionButton">New</button>
					<button id="renameActionButton">Edit</button>
					<button id="duplicateAction">Duplicate</button>
					<div id="renameAction">
						<label for="renameActionInput">Name:</label>
						<input type="text" id="renameActionInput" name="renameActionInput" value="" />
						<button id="confirmActionRenameButton">OK</button>
					</div>
          <div id="actionComment"><br /><label for="actionCommentArea">Comment:</label><br /><textarea id="actionCommentArea"></textarea></div>

					<div style="text-align: center;">
						<div id="tasksInAction">
							<div id="actionInfo">
								<div id="actionTaskDescription"></div>
								<h3 style="margin-top: 5px; display:inline-block;">Tasks:</h3>
								<ul id="actionTasksList"></ul>
							</div>
						</div>
						<div id="tasksAvailable">
							<h3 style="margin-top: 5px; display:inline-block;">Available tasks:</h3>
							<ul id="actionTasksToUseList">
                <li class="actionTaskToUse" id="actionTaskToUse_0" title="string = comment (EDITOR ONLY)">comment line</li>
							<?php $index = 1;
								  foreach ($tasks as $task) { ?>
								<li class="actionTaskToUse" id="<?php echo "actionTaskToUse_" . $index; ?>" title="<?php echo $task['description']; ?>"><?php echo $task['name']; ?></li>
							<?php $index++;
								  } ?>
							</ul>
						</div>
					</div>
				</div>

				<div class="pane" id="dialogsView">
					<h2>Dialogs</h2>
					<div class="leftSide">
						<label for="dialogFilterSelection">Filter:</label>
						<select id="dialogFilterSelection" name="dialogFilterSelection"></select><br /><br />
						<button id="deleteDialogButton">Delete</button>
						<select class="dialogSelection dialogueSelection"></select>
						<button id="createDialogButton">New</button>
						<button id="saveDialogButton">Save</button><br /><br />
						<input type="text" id="dialogDialogueSearch" name="dialogDialogueSearch" value="" class="dialogueSearch" placeholder="Search..." /> <br /><br />
					</div>
					<div class="rightSide">
						<label for="dialogChainSelection">Dialog Chains:</label>
						<select class="dialogChainSelection"></select><button id="deleteDialogChainButton">Delete</button><br /><br />
						<label for="dialogChainName">Name: </label><input type="text" id="dialogChainName" name="dialogChainName" value="" />
						<label for="dialogChainNode">Node: </label><select id="dialogChainNode" name="dialogChainNode"></select>
						<button id="newDialogChainButton">New Chain</button><br />
					</div>
					<div id="dialogInfo" style="overflow-x: hidden;">
						<div id="dialogAccordion">
							<h3>General</h3>
							<div>
								<label for="dialogId">Id:</label><input type="text" id="dialogId" name="dialogId" value="" disabled="disabled" /><br />
								<label for="dialogText">Text:</label><input type="text" id="dialogText" name="dialogText" value="" /><br />
								<label for="dialogRoom">Room:</label><select id="dialogRoom" name="dialogRoom"></select>
								<label for="dialogSayer">Sayer:</label><select id="dialogSayer"></select><br />
								<label for="dialogAudio">Audio:</label><input type="text" id="dialogAudio" name="dialogAudio" value="" /><label for="dialogSpeechAnimation">Speech Animation:</label><select id="dialogSpeechAnimation"></select><br />
								<label for="dialogNext">Next:</label><select id="dialogNext" name="dialogNext" class="dialogueSelection"></select><button id="dialogCreateNextButton">New</button> <input type="text" id="dialogNextDialogueSearch" name="dialogNextDialogueSearch" value="" class="dialogueSearch" placeholder="Search..." /><br /><br />
								<label for="dialogConditionalNextList">Conditional Next:</label> <button id="dialogAddConditionalNext">Add Conditional Next</button>
								<ul id="dialogConditionalNextList"></ul>
							</div>
							<h3>Choices <span id="dialogChoiceNbr"></span></h3>
							<div>
								<button id="dialogsAddChoice" class="addChoice">Add Choice</button><br />
								<ul id="dialogChoicesList"></ul>
							</div>
							<h3>Default Actions <span id="dialogDefaultActionsNbr"></span></h3>
							<div>
								<select id="dialogAddDefaultActionSelect" name="dialogAddDefaultActionSelect" class="addDefaultActionSelect"></select> <button id="dialogAddDefaultAction" class="addDefaultAction">Add</button>
								<ul id="dialogDefaultActionsList"></ul>
							</div>
							<h3>Conditional Actions <span id="dialogConditionalActionsNbr"></span></h3>
							<div>
								<button id="dialogAddCondition" class="addCondition">Add Condition</button>
								<ul id="dialogConditionalActionsList"></ul>
							</div>
						</div>
						<hr />
						<div style="overflow-x: scroll; white-space: nowrap; background: none repeat scroll 0 0 #efefef;">
						<div id="dialogPathContainer">
							<div class="node node_root"  id="dialogChainRootNode">
								<span class="node__text" id="dialogChainRootName">ChainName</span>
								<input type="text" class="node__input" id="dialogChainNameEdit" />
							</div>
							<ul id="dialogPath" class="children children_rightbranch"></ul>
						</div>
						</div>
					</div>
				</div>
			</div>

		</div>

		<div class="pane" id="gamestatesView"> <!-- right -->
			<h2>Game States</h2>
			<div id="createNewGamestate">
				<label for="gamestateName">Name: </label><input type="text" id="gamestateName" name="gamestateName" value="" /><br />
				<label for="gamestateType">Type: </label>
				<select id="gamestateType" name="gamestateType">
					<option value="mixed">mixed</option>
					<option value="bool">bool</option>
					<option value="int">int</option>
					<option value="string">string</option>
				</select><br />
				<label for="gamestateValue">Value: </label><input type="text" id="gamestateValue" name="gamestateValue" value="" /><br />
				<button id="newGamestateButton">Create New</button>
			</div>
			<ul id="gamestatesList"></ul>
		</div>

		<!--<div class="pane" id="spriteAtlasesView">--> <!-- bottom -->
			<!--<h2>Sprite Atlases</h2>

			<div id="createNewSpriteAtlas">
				<label for="spriteAtlasName">Name: </label><input type="text" id="spriteAtlasName" name="spriteAtlasName" value="" />
				<label for="spriteAtlasSpritesheet"> Spritesheet: </label><input type="text" id="spriteAtlasSpritesheet" name="spriteAtlasSpritesheet" value="" />
				<label for="spriteAtlasJSON"> JSON: </label><input type="text" id="spriteAtlasJSON" name="spriteAtlasJSON" value="" />
				<button id="newSpriteAtlasButton">Add New</button>
			</div>
			<ul id="spriteAtlasesList"></ul>
			<br />
		</div>-->
	</div>

	<!--<br />-->
	<hr />
	<!--<button id="createJSONObject">Luo JSON-tiedosto</button>-->
	<!--button id="createJSObject" style="margin-left: 20px;">Export to App and launch</button>-->
	<!--button id="launchApp" style="margin-left: 20px;">Export to App and Launch</button>-->
	<!--button id="importAudios" style="position: absolute; right: 220px;">Import Audios</button>-->
	<!--button id="importRoomsAndAssets" style="position:absolute; right: 20px;">Import Rooms and Assets</button>-->
<script>
window.loggedIn = true;
$(document).ready(function() {
	// Confirm leaving popup
	function confirmBeforeUnload(e) {

		var e = e || window.event;
		// For IE and Firefox
		if (e) {
			e.returnValue = 'Leave the editor?';
		}
		// For Safari
		return 'Leave editor?';
	}
	window.onbeforeunload = confirmBeforeUnload;
});
</script>
<?php /* endif; */ ?>

</body>
</html>

<?php
/***********************************************
* 	PHP FUNCTIONS
***********************************************/

// Returns array containing filenames with subfolder paths.
// Filtering can be done with array containing wanted extensions
function readFileNamesRecursively($filepath, $extensionsArray = array()) {

	$fileArray = [];

	$di = new RecursiveDirectoryIterator($filepath,RecursiveDirectoryIterator::SKIP_DOTS);
	$it = new RecursiveIteratorIterator($di);

	foreach($it as $file) {

		if (empty($extensionsArray) || in_array(pathinfo($file, PATHINFO_EXTENSION), $extensionsArray)) {

			$fileName = $file;
			// Remove filepath from filename
			if (substr($fileName, 0, strlen($filepath)) == $filepath) {
				$fileName = substr($fileName, strlen($filepath));
			}
			// Remove first '/' or '\' from filepath
			$first_character = substr($fileName, 0, 1);
			if ($first_character == '/' || $first_character == '\\') {
				$fileName = substr($fileName, 1);
			}
			$fileArray[] = $fileName;
		}
	}
	return $fileArray;
}

function processLogin($user, $pass) {

    // Hardcoded credentials
    $username = 'ylläpito';
    $password = 'admin';

    if ($user == $username && $pass == $password) {
      $_SESSION['logged_in'] = true;
      unset($_POST['login']);
      return true;
    }
    else {
      $_POST['login']['error_msg'] = "Invalid username or password!";
      return false;
    }
}

function logout() {

    unset($_SESSION);
    session_destroy();
    session_start();
    header('Location: index.php');
    exit();
}

function readJSONFile($file) {

    // Read json file to php array
    $contents = file_get_contents($file);

    $json = json_decode($contents, true);
    if (!$json) {
      $json = array();
    }
    return $json;
}

function saveJSObjectAsJSON() {

	$JS = new stdClass();

	if (isset($_POST['JSObject'])) {
		//$JS = $_POST['JSObject'];
		$JS = json_decode($_POST["JSObject"], JSON_FORCE_OBJECT);
	}
	global $javascript_file;
	$file = $javascript_file;
	if (isset($_POST['filename'])) {
		$file = $_POST['filename'];
	}
	//file_put_contents($file, $JS);
	file_put_contents($file, json_encode($JS, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
	print_r($JS);
	exit();
}

function createConfigFile() {

	$JS = new stdClass();
	$JS->rooms = array();
	$JS->spriteAtlases = array();
	//$JS->actions = array();
	$JS->assets = array();
	$JS->sounds = new stdClass();
	$JS->dialogs = array();
	$JS->gamestates = array();

	if (isset($_POST["rooms"])) {
		$JS->rooms = json_decode($_POST["rooms"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["spriteAtlases"])) {
		$JS->spriteAtlases = json_decode($_POST["spriteAtlases"], JSON_FORCE_OBJECT);
	}
	/*if (isset($_POST["actions"])) {
		$JS->actions = json_decode($_POST["actions"], JSON_FORCE_OBJECT);
	}*/
	if (isset($_POST["assets"])) {
		$JS->assets = json_decode($_POST["assets"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["sounds"])) {
		$JS->sounds = json_decode($_POST["sounds"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["dialogs"])) {
		$JS->dialogs = json_decode($_POST["dialogs"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["gamestates"])) {
		$JS->gamestates = json_decode($_POST["gamestates"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["characters"])) {
		$JS->characters = json_decode($_POST["characters"], JSON_FORCE_OBJECT);
	}
	global $javascript_file;
	$file = $javascript_file;
	if (isset($_POST["filename"])) {
		$file = $_POST["filename"];
	}
	file_put_contents($file, "var Config = " . json_encode($JS, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . ";");
	exit();
}

function recurse_copy($src,$dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(false !== ( $file = readdir($dir)) ) {
        if (( $file != '.' ) && ( $file != '..' )) {
            if ( is_dir($src . '/' . $file) ) {
                recurse_copy($src . '/' . $file,$dst . '/' . $file);
            }
            else {
                copy($src . '/' . $file,$dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

function importGameObjects() {

	$roomsToImport = scandir("import/rooms/");
	$jsonData = array();

	foreach ($roomsToImport as $roomName) {
		if ($roomName == "." || $roomName == "..") {
			continue;
		}
		$importFolder = "import/rooms/" . $roomName . "/";
		$importFile = $importFolder . $roomName . ".json";

		// Read json file to php array
		$jsonData[$roomName] = json_decode(file_get_contents($importFile), true);

		// Create folder and necessary file
		$roomFolder = dirname(__FILE__) . '/img/' . $roomName;
		if (!file_exists($roomFolder)) {
			mkdir($roomFolder, 0777, true);
		}
		// Copy background, spriteAtlas and jsons
		if (is_file($importFolder . $roomName . "_bg.png")) {
			copy($importFolder . $roomName . "_bg.png", $roomFolder . "/" .  $roomName . "_bg.png");
		}
		else {
			$jsonData[$roomName]["noBackground"] = true;
		}
		if (is_file($importFolder . $roomName . "Atlas.png")) {
			copy($importFolder . $roomName . "Atlas.png", $roomFolder . "/" .  $roomName . "Atlas.png");
		}
		else {
			$jsonData[$roomName]["noAtlas"] = true;
		}
		if (is_file($importFolder . $roomName . "Atlas.json")) {
			copy($importFolder . $roomName . "Atlas.json", $roomFolder . "/" .  $roomName . "Atlas.json");
		}
		else {
			$jsonData[$roomName]["noAtlas"] = true;
		}
	}

	recurse_copy(dirname(__FILE__) . '/img', dirname(__FILE__) . '/../app/img');

	// Print response
    header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($jsonData);
	exit;
}

function getAssetImageProperties() {

	$assetName = "";
	if (isset($_GET["asset"])) {
		$assetName = $_GET["asset"];
	}
	$atlas = "";
	if (isset($_GET["atlas"])) {
		$atlas = $_GET["atlas"];
	}
	$jsonData = new stdClass();
	$atlasInfo = json_decode(file_get_contents($atlas), true);
	foreach ($atlasInfo["frames"] as $asset) {
		if ($asset["filename"] == $assetName) {
			$jsonData = $asset;
			break;
		}
	}
	// Print response
    header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($jsonData);
	exit;
}

function importAudios() {

  $categories = array('assets', 'dialogs', 'music', 'other');
  $foldersToScan = array();
  $jsonData = array();
  // Create sounds and music folders if not exists
  $soundsFolder = dirname(__FILE__) . '/sounds';
  if (!file_exists($soundsFolder)) {
    mkdir($soundsFolder, 0777, true);
  }
  $musicFolder = dirname(__FILE__) . '/sounds/music';
  if (!file_exists($musicFolder)) {
    mkdir($musicFolder, 0777, true);
  }

  foreach ($categories as $category) {
    $jsonData[$category] = array();

    switch($category) {
      case 'music': {
         $foldersToScan = array($category . '/');
        break;
      }
      default: {
        $foldersToScan = array($category . '/general/', $category . '/audiosprites/');
        break;
      }
    }

    for ($i = 0; $i < count($foldersToScan); $i++) {

      $filesToImport = scandir("import/sounds/" . $foldersToScan[$i]);
      $spritesToImport = array();

      $audiosprite = true;
      $pos = strrpos($foldersToScan[$i], "audiosprites");
      if ($pos === false) {
           $audiosprite = false;
      }
      // Add all JSON files to filesToImport
      foreach ($filesToImport as $fileName) {
        if ($fileName == "." || $fileName == "..") {
          continue;
        }
        $ext = pathinfo($fileName, PATHINFO_EXTENSION);
        if ($audiosprite && $ext != "json" && $ext != "JSON") {
          continue;
        }
        $spritesToImport[] = $fileName;
      }
      $importFolder = "import/sounds/" . $foldersToScan[$i];

      foreach ($spritesToImport as $spriteName) {

        $importFile = $importFolder . $spriteName;
        $targetFile = $soundsFolder . "/" . $spriteName;
        if (is_file($importFile)) {
          if ($category === 'music') {
             $targetFile = $soundsFolder . "/music/" . $spriteName;
          }
          copy($importFile, $targetFile);
        }
        else {
          continue;
        }
        if ($audiosprite) {
          $audioSpriteName = str_lreplace(".json", "", $spriteName);
          if (!isset($jsonData[$category]['audiosprites'])) {
            $jsonData[$category]['audiosprites'] = array();
          }
          // Read json file to php array
          $jsonData[$category]['audiosprites'][$audioSpriteName] = json_decode(file_get_contents($importFile), true);

          foreach ($jsonData[$category]['audiosprites'][$audioSpriteName]["resources"] as $soundFile) {
            // Copy audiofiles
            if (is_file($importFolder . $soundFile)) {
              copy($importFolder . $soundFile, $soundsFolder . "/" .  $soundFile);
            }
          }
        }
        else {
          $audioName = str_lreplace(".mp3", "", $spriteName);
          $audioName = str_lreplace(".ogg", "", $audioName);
          $audioName = str_lreplace(".wav", "", $audioName);
          if (!isset($jsonData[$category]['general'])) {
            $jsonData[$category]['general'] = array();
          }
          if (!isset($jsonData[$category]['general'][$audioName])) {
            $jsonData[$category]['general'][$audioName] = array($targetFile);
          }
          else {
            $jsonData[$category]['general'][$audioName][] = $targetFile;
          }
        }
      }
    }
  }

  recurse_copy(dirname(__FILE__) . '/sounds', dirname(__FILE__) . '/../app/sounds');

	// Print response
  header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
  header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($jsonData);
	exit;
}

//http://stackoverflow.com/questions/3835636/php-replace-last-occurence-of-a-string-in-a-string
function str_lreplace($search, $replace, $subject) {
    $pos = strrpos($subject, $search);

    if($pos !== false)
    {
        $subject = substr_replace($subject, $replace, $pos, strlen($search));
    }

    return $subject;
}

//http://php.net/manual/en/function.json-encode.php  bohwaz
function json_readable_encode($in, $indent = 0, $from_array = false)
{
    $_myself = __FUNCTION__;
    $_escape = function ($str)
    {
        return preg_replace("!([\b\t\n\r\f\"\\'])!", "\\\\\\1", $str);
    };

    $out = '';

    foreach ($in as $key=>$value)
    {
        $out .= str_repeat("\t", $indent + 1);
        $out .= "\"".$_escape((string)$key)."\": ";

        if (is_object($value) || is_array($value))
        {
            $out .= "\n";
            $out .= $_myself($value, $indent + 1);
        }
        elseif (is_bool($value))
        {
            $out .= $value ? 'true' : 'false';
        }
        elseif (is_null($value))
        {
            $out .= 'null';
        }
        elseif (is_string($value))
        {
            $out .= "\"" . $_escape($value) ."\"";
        }
        else
        {
            $out .= $value;
        }

        $out .= ",\n";
    }

    if (!empty($out))
    {
        $out = substr($out, 0, -2);
    }

    $out = str_repeat("\t", $indent) . "{\n" . $out;
    $out .= "\n" . str_repeat("\t", $indent) . "}";

    return $out;
}
?>
