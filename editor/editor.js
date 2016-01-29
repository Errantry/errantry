
$(document).ready(function() {
	/***********************************************
	* ROOMS VIEW
	***********************************************/
	// Initialize room view
	generateRoomsViewSelection();
  refreshRoomAutocomplete();
	$("#roomsView #roomSelection").prop("value", "-1");
	$("#roomsView #availableRoomAssets").prop("value", "-1");
	$("#addRoomAssetButton").prop("disabled", true);
	$("#deleteRoomButton").prop("disabled", true);
	$("#saveRoomButton").prop("disabled", true);
	$("#roomAddDefaultAction").prop("disabled", true);
	$("#roomAddConditionalAction").prop("disabled", true);
	$("#roomInfo").hide();
	// Select room
	$("#roomsView #roomSelection").change(function() {
		
		activeRoomID = parseInt($(this).val());
		activeRoomIndex = undefined;
		$("#roomInfo").hide();
		$("#deleteRoomButton").prop("disabled", true);
		$("#saveRoomButton").prop("disabled", true);
		$("#addRoomAssetButton").prop("disabled", true);
		$("#roomAddDefaultAction").prop("disabled", true);
		$("#roomAddConditionalAction").prop("disabled", true);
		$("#roomAddDefaultActionSelect, #roomAddConditionalActionSelect").prop("value", "-1");
		$("#roomAssetsList").empty();
		$("#roomDefaultActionsList").empty();
		$("#roomConditionalActionsList").empty();
		$("#roomsView #availableRoomAssets").empty();
		$("#bgPreview img").hide();
		$("#roomAssetNbr, #roomNPCNbr").html("");
		
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id == activeRoomID) {
				activeRoomIndex = i;
				break;
			}
		}
		if (activeRoomIndex != undefined) {
			$("#deleteRoomButton").prop("disabled", false);
			$("#saveRoomButton").prop("disabled", false);
			$("#roomId").prop("value", activeRoomID);
			$("#roomName").prop("value", rooms[activeRoomIndex].name);
			
			var atlasValue = -1;
			if (rooms[activeRoomIndex].atlasName != "") {
				atlasValue = rooms[activeRoomIndex].atlasName;
			}
			$("#atlasName").prop("value", atlasValue);
			var group = "";
			if (rooms[activeRoomIndex].group != undefined && rooms[activeRoomIndex].group != "") {
				group = rooms[activeRoomIndex].group;
			}
			$("#roomGroup").prop("value", group);
			var bgImage = "-1";
			var imageSource = "";
			if (rooms[activeRoomIndex].bgImage != "") {
				bgImage = rooms[activeRoomIndex].bgImage.replace("img/", "");
				imageSource = rooms[activeRoomIndex].bgImage;
				$("#bgPreview img").show();
			}
			else {
				$("#bgPreview img").hide();
			}
			$("#bgImage").prop("value", bgImage);
			$("#bgPreview img").prop("src", imageSource);
			$("#bgWidth").prop("value", rooms[activeRoomIndex].bgWidth);
			$("#bgHeight").prop("value", rooms[activeRoomIndex].bgHeight);
			$("#spawnX").prop("value", rooms[activeRoomIndex].spawnX);
			$("#spawnY").prop("value", rooms[activeRoomIndex].spawnY);
			$("#spawnFace").prop("value", rooms[activeRoomIndex].spawnFace);
			$("#backgroundMusic").prop("value", rooms[activeRoomIndex].music);
      $("#minX").prop("value", rooms[activeRoomIndex].minX);
			$("#maxX").prop("value", rooms[activeRoomIndex].maxX);
      $("#scale").prop("value", "");
      if (rooms[activeRoomIndex].scale != undefined) {
        $("#scale").prop("value", rooms[activeRoomIndex].scale);
      }
			
      // Get room npcs
			$("#roomNPCList").empty();
			
			var characterNbr = 0;
			for (var j = 0; j < characters.length; j++) {
				if (characters[j].room == rooms[activeRoomIndex].name) {
					characterNbr++;
					$("#roomNPCList").append('<li id="roomNpc_' + characters[j].id + '"><a class="showCharacter">' + characters[j].machineName + '</a></li>');
				}
			}
			if (characterNbr > 0) {
				$("#roomNPCNbr").html(" (" + characterNbr + ")");
			}
      
			var availableAssets = jQuery.extend(true, [], assets);
			// Create used assets list
			for (var i = 0; i < rooms[activeRoomIndex].assets.length; i++) {
        $("#roomAssetsList").append('<li class="roomAsset" id="roomAsset_' + rooms[activeRoomIndex].assets[i] + '"><button class="removeRoomAsset">X</button> <a href="">' + rooms[activeRoomIndex].assets[i] + '</a><span class="sortable-handle"></span></li>');
        if (rooms[activeRoomIndex].assets[i].substr(0,4) != 'npc_') {
          // Remove asset from available asset list
          for (var j = 0; j < availableAssets.length; j++) {
            if (availableAssets[j].name == rooms[activeRoomIndex].assets[i]) {
              availableAssets.splice(j, 1);
              break;
            }
          }
        }
        else {
          $('#roomAsset_' + rooms[activeRoomIndex].assets[i] + ' > a').addClass("showCharacter");
          $('#roomAsset_' + rooms[activeRoomIndex].assets[i]).prop('id', 'roomNpc_' + rooms[activeRoomIndex].assets[i].substr(4));
        }
			}
     
      var assetsNbr = rooms[activeRoomIndex].assets.length - characterNbr;
			if (assetsNbr > 0) {
				$("#roomAssetNbr").html(" (" + assetsNbr + ")");
			}

      
			// Make asset list sortable
			$('#roomAssetsList').sortable({
				placeholder: "ui-state-highlight",
				cursor: "move",
				handle: ".sortable-handle",
				axis: "y",
				delay: 300,
				update: function(event,ui) {
					
					var items = $("#roomAssetsList > li");
					
					var newAssetList = [];
					for (var i = 0; i < items.length; i++) {
						
            var identifier = "roomAsset_";
            if ($(items[i]).prop("id").indexOf("roomNpc_") != -1) {
              identifier = "roomNpc_";
            }
						var assetName = $(items[i]).prop("id").replace(identifier, "");
            if (identifier == "roomNpc_") assetName = "npc_" + assetName;
						newAssetList.push(assetName);
					}
					rooms[activeRoomIndex].assets = newAssetList;
					saveJSObjectAsJSON(rooms, "json/rooms.json");
				}
			}).disableSelection();
			
			// Create available assests list
			$("#roomsView #availableRoomAssets").append('<option value="-1" disabled="disabled" selected="selected">Select Asset</option>');
		
			for (var i = 0; i < availableAssets.length; i++) {
				$("#roomsView #availableRoomAssets").append('<option id="availableAsset_' + i + '" value="' + availableAssets[i].name + '">' + availableAssets[i].name + '</option>');
			}
			
			// Create actions lists
			if (rooms[activeRoomIndex].defaultActions != undefined) {
				createDefaultActionsList(rooms[activeRoomIndex].defaultActions, activeRoomIndex, "room");
			}
			if (rooms[activeRoomIndex].conditionalActions != undefined) {
				createConditionalActionsList(rooms[activeRoomIndex].conditionalActions, activeRoomIndex, "room");
			}
			
			$("#roomInfo").show();
		}
		
		$( "#roomAccordion" ).accordion({
			collapsible: true,
			heightStyle: "content"
		});
	});
	
	$("#startingRoom").change(function() {
		
		var id = parseInt($(this).prop("value"));
		var name = "";
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].id == id) {
				name = rooms[i].name;
				break;
			}
		}
		
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == "activeRoom") {
				gamestates[i].value = name;
			}
		}
		saveJSObjectAsJSON(gamestates, "json/gamestates.json");
		updateGamestates();
	});
	
	$("body").on("click", ".roomAsset a", function(e) {
		
		e.preventDefault();
		// Change assets view filter
		$("#assetFilterSelection").prop("value", rooms[activeRoomIndex].name);
		$("#assetFilterSelection").change();
		var assetName = $(this).parent().prop("id").replace("roomAsset_", "");
		$("#assetsView .assetSelection").prop("value", assetName);
		$("#assetsView .assetSelection").change();
		$("#assetsViewButton").click();
	});
	
	$("body").on("click", "#roomNPCList .showCharacter, #roomAssetsList .showCharacter", function(e) {
		
		e.preventDefault();
    var characterId = 0;
    if ($(this).parent().parent().prop("id") == "roomAssetsList") {
      var characterToShow = $(this).parent().prop("id").replace("roomNpc_", "");
      for (var i = 0; i < characters.length; i++) {
        if (characters[i].machineName == characterToShow) {
          characterId = characters[i].id;
          break;
        }
      }
    }
    else {
      characterId = parseInt($(this).parent().prop("id").replace("roomNpc_", ""));
    }
		$("#characterSelection").prop("value", characterId);
		$("#characterSelection").change();
		if (!$("#charactersViewButton").hasClass("selected")) {
			$("#charactersViewButton").click();
		}
		// Scroll to top of page
		$('html, body').scrollTop(0);
	});
	
	$("body").on("click", ".removeRoomAsset", function(e) {
		
		e.preventDefault();
    var id = $(this).parent().prop("id");
    var assetName = "";
    var roomNpc = false;
    var text = "asset";
    
    if (id.indexOf('roomNpc_') == -1) {
      assetName = id.replace("roomAsset_", "");
    }
    else {
       assetName = id.replace("roomNpc_", "");
       text = "NPC";
       roomNpc = true;
    }
    if (!confirm("Remove " + text + " " + assetName + " from room?")) {
      return;
    }
    
    var compareName = (roomNpc) ? 'npc_' + assetName : assetName;
		// Remove asset from rooms asset list
		for (var i = 0; i < rooms[activeRoomIndex].assets.length; i++) {
			if (rooms[activeRoomIndex].assets[i] == compareName) {
				rooms[activeRoomIndex].assets.splice(i, 1);
				break;
			}
		}
		$(this).parent().remove();
		// Create json file
		saveJSObjectAsJSON(rooms, "json/rooms.json");
		var availableAssetsCount = $("#availableRoomAssets option").length;
    var characterNbr = 0;
    if (roomNpc) {
      // Remove npc from room
			for (var j = 0; j < characters.length; j++) {
				if (characters[j].room == rooms[activeRoomIndex].name) {
          if (characters[j].machineName == assetName) {
            characters[j].room = "";
            // Create json file
            saveJSObjectAsJSON(characters, "json/characters.json");
          }
          else {
            characterNbr++;
          }
				}
			}
      $("#characterSelection").change();
    }
    else {
      // Put asset to available assets selection
      $("#availableRoomAssets").append('<option id="availableAsset_' + (availableAssetsCount + 1) + '" value="' + assetName + '">' + assetName + '</option>');
    }
		
		$("#roomAssetNbr, #roomNPCNbr").html("");
    
    if (characterNbr > 0) {
      $("#roomNPCNbr").html(" (" + characterNbr + ")");
    }
    var assetNbr = rooms[activeRoomIndex].assets.length - characterNbr;
		if (assetNbr > 0) {
			$("#roomAssetNbr").html("(" + assetNbr + ")");
		}
	});
	
	$("#bgImage").change(function() {
		
		var bgImage = "-1";
		var imageSource = "";
		if ($(this).prop("value") != "-1") {
			imageSource = "img/" + $(this).prop("value");
			$("#bgPreview img").show();
		}
		else {
			$("#bgPreview img").hide();
		}
		$("#bgPreview img").prop("src", imageSource);
	});
	
	$("#availableRoomAssets").change(function() {
		
		var assetName = $(this).prop("value");
		if (assetName == "-1") {
			$("#addRoomAssetButton").prop("disabled", true);
			return;
		}
		$("#addRoomAssetButton").prop("disabled", false);
	});
	
	$("#addRoomAssetButton").click(function(e) {
		
		e.preventDefault();
		var assetName = $("#availableRoomAssets").prop("value");
		rooms[activeRoomIndex].assets.push(assetName);
		// Create json file
		saveJSObjectAsJSON(rooms, "json/rooms.json");
		$("#roomAssetsList").append('<li class="roomAsset" id="roomAsset_' + assetName + '"><button class="removeRoomAsset">X</button> <a href="">' + assetName + '</a><span class="sortable-handle"></span></li>');
		$('#availableRoomAssets > option[value="' + assetName + '"]').remove();
		$("#availableRoomAssets").prop("value", "-1");
		$("#availableRoomAssets").change();
		$("#roomAssetNbr").html("");
    var roomAssets = 0;
    for (var i = 0; i < rooms[activeRoomIndex].assets.length; i++) {
      if (rooms[activeRoomIndex].assets[i].substr(0,4) != 'npc_') {
        roomAssets++;
      }
    }
		if (roomAssets > 0) {
			$("#roomAssetNbr").html("(" + roomAssets + ")");
		}
	});
	
	$("#createRoomButton").click(function(e) {
		
		e.preventDefault();
		
		$(".roomSelection").append('<option id="room_' + rooms.length + '" value="' + misc.roomId + '">' + 'new_room_' + misc.roomId + '</option>');
		
		var room = {"id":misc.roomId,"name":"new_room_" + misc.roomId,"atlasName":"","bgImage":"","bgWidth":0,"bgHeight":0,"spawnX":0,"spawnY":0,"spawnFace":"left","music":"","minX":0,"maxX":0,"assets":[],"defaultActions":[],"conditionalActions":[]};
		misc.roomId++;
		
		rooms.push(room);
		$("#roomsView #roomSelection").prop("value", room.id);
		$("#roomsView #roomSelection").change();
		
		var gameStateFound = false;
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == "activeRoom") {
				gameStateFound = true;
				break;
			}
		}
		if (!gameStateFound) {
			var newState = {"id":misc.gameStateId,"name":"activeRoom","type":"string","value":""};
			gamestates.push(newState);
			misc.gameStateId++;
			saveJSObjectAsJSON(gamestates, "json/gamestates.json");
		}
		// Create json files
		saveJSObjectAsJSON(rooms, "json/rooms.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		
		if (rooms.length == 1 || !gameStateFound) {
			$("#startingRoom").prop("value", misc.roomId - 1);
			$("#startingRoom").change();
		}
    refreshRoomAutocomplete();
	});
	
	$("#deleteRoomButton").click(function(e) {
		if (!confirm("Delete room " + rooms[activeRoomIndex].name + "?")) {
			return;
		}
		rooms.splice(activeRoomIndex, 1);
		activeRoomID = undefined;
		activeRoomIndex = undefined;
		generateRoomsViewSelection();
		$("#roomsView #roomSelection").change();
		// Create json files
		saveJSObjectAsJSON(rooms, "json/rooms.json");
    refreshRoomAutocomplete();
	});
	
	$("#saveRoomButton").click(function(e) {
		
		var newName = $("#roomName").prop("value");
		var oldName = rooms[activeRoomIndex].name;
		
		rooms[activeRoomIndex].name = newName;
		if ($("#atlasName").prop("value") != "-1") {
			rooms[activeRoomIndex].atlasName = $("#atlasName").prop("value");
		}
		else {
			rooms[activeRoomIndex].atlasName = "";
		}
		if ($("#roomGroup").prop("value").trim() != "") {
			rooms[activeRoomIndex].group = parseInt($("#roomGroup").prop("value").trim());
		}
		else {
			rooms[activeRoomIndex].group = undefined;
		}
		if ($("#bgImage").prop("value") != "-1") {
			rooms[activeRoomIndex].bgImage = "img/" + $("#bgImage").prop("value");
		}
		else {
			rooms[activeRoomIndex].bgImage = "";
		}
		
		rooms[activeRoomIndex].bgWidth = parseInt($("#bgWidth").prop("value"));
		rooms[activeRoomIndex].bgHeight = parseInt($("#bgHeight").prop("value"));
		rooms[activeRoomIndex].spawnX = parseInt($("#spawnX").prop("value"));
		rooms[activeRoomIndex].spawnY = parseInt($("#spawnY").prop("value"));
		rooms[activeRoomIndex].spawnFace = $("#spawnFace").prop("value");	
		rooms[activeRoomIndex].music = $("#backgroundMusic").prop("value");
    rooms[activeRoomIndex].minX = parseInt($("#minX").prop("value"));
    rooms[activeRoomIndex].maxX = parseInt($("#maxX").prop("value"));
    rooms[activeRoomIndex].scale = undefined;
    if ($("#scale").prop("value").trim() != "") {
      var floatScale = $("#scale").prop("value").trim();
      if (!isNaN(floatScale)) {
        rooms[activeRoomIndex].scale = parseFloat(floatScale);
      }
    }
		
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == "activeRoom") {
				if (gamestates[i].value == oldName) {
					gamestates[i].value = newName;
					saveJSObjectAsJSON(gamestates, "json/gamestates.json");
					updateGamestates();
				}
			}
		}
		// Create json file
		saveJSObjectAsJSON(rooms, "json/rooms.json");
		// Update dropdown
		generateRoomsViewSelection();
    refreshRoomAutocomplete();
	});
	
	function generateRoomsViewSelection() {
		
		$(".roomSelection").empty();
		$("#roomsView #roomSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Room</option>');
		$("#charactersView .roomSelection").append('<option value="-1" selected="selected">Not specified</option>');
		
		for (var i = 0; i < rooms.length; i++) {
			$(".roomSelection").append('<option id="room_' + i + '" value="' + rooms[i].id + '">' + rooms[i].name + '</option>');
		}
		// Generate atlas list
		$("#roomsView #atlasName").empty();
		$("#roomsView #atlasName").append('<option id="roomAtlas_-1" value="-1" selected="selected">No Atlas</option>');
		for (var i = 0; i < spriteAtlases.length; i++) {
			$("#roomsView #atlasName").append('<option id="roomAtlas_' + i + '" value="' + spriteAtlases[i][0] + '">' + spriteAtlases[i][0] + '</option>');
		}				
		
		// If some room is active, select that
		if (activeRoomID != undefined) {
			$("#roomsView #roomSelection").prop("value", activeRoomID);
			$("#roomsView #roomSelection").change();
		}
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == "activeRoom") {
				
				var opt = $("#startingRoom > option");
				for (var j = 0; j < opt.length; j++) {
					var name = $(opt[j]).html();
					if (name == gamestates[i].value) {
						$(opt[j]).prop("selected", true);
						break;
					}
				}
				break;
			}
		}
	}
  
  function refreshRoomAutocomplete() {
		
		roomSearch = [];
		for (var i = 0; i < rooms.length; i++) {
			if (roomSearch.indexOf(rooms[i].name) == -1) {
				roomSearch.push(rooms[i].name);
			}
		}
		roomSearch.sort();
		
		$(".roomNameAutocomplete").autocomplete({
			source: roomSearch
		});
    $(".roomNameWithParameterAutocomplete").autocomplete({
      source: roomSearch,
      select: function(event, ui) {
        event.preventDefault();
        $(this).val(ui.item.value + ', musicName');
      }
    });
	}
	
	/***********************************************
	* ASSETS VIEW
	***********************************************/
	// Initialize assets view
	generateAssetsViewSelection();
	generateAssetFilterSelection();
	refreshAssetAutocomplete();
	$("#assetsView .assetSelection").prop("value", "-1");
	$("#deleteAssetButton").prop("disabled", true);
	$("#saveAssetButton").prop("disabled", true);
	$("#assetAddDefaultAction").prop("disabled", true);
	$("#assetAddConditionalAction").prop("disabled", true);
	$("#assetAddDefaultActionSelect, #assetAddConditionalActionSelect").prop("value", "-1");
	$("#assetInfo").hide();
	$("#assetPreview img").hide();
	
	// Select asset
	$("#assetsView .assetSelection").change(function() {
		
		activeAssetName = $(this).val();
		activeAssetIndex = undefined;
		$("#assetInfo").hide();
		$("#assetPreview img").hide();
		$("#deleteAssetButton").prop("disabled", true);
		$("#saveAssetButton").prop("disabled", true);
		$("#assetShowDialogueButton").prop("disabled", true);
		$("#assetAddDefaultAction").prop("disabled", true);
		$("#assetAddConditionalAction").prop("disabled", true);
		$("#assetAddDefaultActionSelect, #assetAddConditionalActionSelect").prop("value", "-1");
		
		$("#assetAnimationsList").empty();
		$("#assetDefaultActionsList").empty();
		$("#assetConditionalActionsList").empty();
		$("#assetAnimationNbr").html("");
		
		for (var i = 0; i < assets.length; i++) { //TODO: maybe use id
			if (assets[i].name == activeAssetName) {
				activeAssetIndex = i;
				break;
			}
		}
		if (activeAssetIndex != undefined) {
			$("#deleteAssetButton").prop("disabled", false);
			$("#saveAssetButton").prop("disabled", false);
			
			$("#assetId").prop("value", activeAssetName);
			$("#assetName").prop("value", assets[activeAssetIndex].name);
			$("#assetRooms").prop("value", "");
			// Get rooms that use this asset
			var assetRooms = [];
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].assets.indexOf(activeAssetName) != -1) {
					assetRooms.push(rooms[i].name);
				}
			}
			$("#assetRooms").prop("value", assetRooms.join(", "));
			
			$("#assetX").prop("value", assets[activeAssetIndex].x);
			$("#assetY").prop("value", assets[activeAssetIndex].y);
			$("#assetForeground").prop("value", "false");
			if (assets[activeAssetIndex].foreground != undefined) {
				$("#assetForeground").prop("value", assets[activeAssetIndex].foreground);
			}
			$("#assetInvisible").prop("value", "false");
			if (assets[activeAssetIndex].invisible != undefined) {
				$("#assetInvisible").prop("value", assets[activeAssetIndex].invisible);
			}
			$("#assetDisabled").prop("value", "false");
			if (assets[activeAssetIndex].disabled != undefined) {
				$("#assetDisabled").prop("value", assets[activeAssetIndex].disabled);
			}
			$("#assetTransparentClick").prop("value", "false");
			if (assets[activeAssetIndex].transparentClick != undefined) {
				$("#assetTransparentClick").prop("value", assets[activeAssetIndex].transparentClick);
			}
      $("#assetDescription").prop("value", "");
			if (assets[activeAssetIndex].description != undefined) {
				$("#assetDescription").prop("value", assets[activeAssetIndex].description);
			}
			$("#assetDoorTarget").prop("value", "-1");
			if (assets[activeAssetIndex].doorTarget != undefined && assets[activeAssetIndex].doorTarget != "") {
				$("#assetDoorTarget").prop("value", assets[activeAssetIndex].doorTarget);
			}
      $("#assetDoorSpawn").prop("value", "");
			if (assets[activeAssetIndex].doorSpawn != undefined && assets[activeAssetIndex].doorSpawn != "") {
				$("#assetDoorSpawn").prop("value", assets[activeAssetIndex].doorSpawn);
			}
      $("#assetDoorFace").prop("value", "-1");
			if (assets[activeAssetIndex].doorFace != undefined) {
				$("#assetDoorFace").prop("value", assets[activeAssetIndex].doorFace);
			}
			$("#assetHoverSound").prop("value", "");
			if (assets[activeAssetIndex].hoverSound != undefined && assets[activeAssetIndex].hoverSound != "") {
        var hoverSound = assets[activeAssetIndex].hoverSound.join(", ");
				$("#assetHoverSound").prop("value", hoverSound);
			}
      $("#assetClickSound").prop("value", "");
			if (assets[activeAssetIndex].clickSound != undefined && assets[activeAssetIndex].clickSound != "") {
        var clickSound = assets[activeAssetIndex].clickSound.join(", ");
				$("#assetClickSound").prop("value", clickSound);
			}
      $("#assetDefaultFrame").prop("value", "");
			if (assets[activeAssetIndex].defaultFrame != undefined) {
				$("#assetDefaultFrame").prop("value", assets[activeAssetIndex].defaultFrame);
			}
      $("#assetHoverFrame").prop("value", "");
			if (assets[activeAssetIndex].hoverFrame != undefined) {
				$("#assetHoverFrame").prop("value", assets[activeAssetIndex].hoverFrame);
			}
			$("#assetCustomAtlas").prop("value", "-1");
			if (assets[activeAssetIndex].customAtlas != undefined) {
				$("#assetCustomAtlas").prop("value", assets[activeAssetIndex].customAtlas);
			}
			$("#assetPickable").prop("value", "false");
			if (assets[activeAssetIndex].pickable != undefined) {
				$("#assetPickable").prop("value", assets[activeAssetIndex].pickable);
			}
// Ville & Markus testaa
			$("#assetFixed").prop("value", "false");
			if (assets[activeAssetIndex].fixed != undefined) {
				$("#assetFixed").prop("value", assets[activeAssetIndex].fixed);
			}

      $("#assetRotation").prop("value", "");
			if (assets[activeAssetIndex].rotation != undefined && assets[activeAssetIndex].rotation != "") {
				$("#assetRotation").prop("value", assets[activeAssetIndex].rotation);
			}
      
      $("#assetApproachOffsetLeft").prop("value", "");
			if (assets[activeAssetIndex].aoLeft != undefined && assets[activeAssetIndex].aoLeft != "") {
				$("#assetApproachOffsetLeft").prop("value", assets[activeAssetIndex].aoLeft);
			}
      
      $("#assetForcedApproachDirection").prop("value", "");
			if (assets[activeAssetIndex].forcedApproachDirection != undefined && assets[activeAssetIndex].forcedApproachDirection != "") {
				$("#assetForcedApproachDirection").prop("value", assets[activeAssetIndex].forcedApproachDirection);
			}
      
      $("#assetApproachOffsetRight").prop("value", "");
			if (assets[activeAssetIndex].aoRight != undefined && assets[activeAssetIndex].aoRight != "") {
				$("#assetApproachOffsetRight").prop("value", assets[activeAssetIndex].aoRight);
			}

// Ville & Markus lopettaa testauksen
			$("#assetDialogueId").prop("value", "-1");
			if (assets[activeAssetIndex].dialogueId != undefined && assets[activeAssetIndex].dialogueId != "") {
				$("#assetDialogueId").prop("value", assets[activeAssetIndex].dialogueId);
				$("#assetShowDialogueButton").prop("disabled", false);
			}
			$("#assetNPC").prop("checked", false);
			if (assets[activeAssetIndex].npc != undefined && assets[activeAssetIndex].npc == true) {
				$("#assetNPC").prop("checked", true);
			}
			// Create actions lists
			if (assets[activeAssetIndex].defaultActions != undefined) {
				createDefaultActionsList(assets[activeAssetIndex].defaultActions, activeAssetIndex, "asset");
			}
			if (assets[activeAssetIndex].conditionalActions != undefined) {
				createConditionalActionsList(assets[activeAssetIndex].conditionalActions, activeAssetIndex, "asset");
			}
			
			if (assets[activeAssetIndex].animations != undefined) {
				
				for (var i = 0; i < assets[activeAssetIndex].animations.length; i++) {
					
					var animationItem =  '<li class="assetAnimation" id="assetAnimation_' + activeAssetIndex + '_' + i + '">Name: <input type="text" id="assetAnimationName_' + activeAssetIndex + '_' + i + '" value="' + assets[activeAssetIndex].animations[i].name + '" disabled="disabled" /> <button style="display:none;" class="deleteAnimation">X</button> <button style="display:none;" class="saveAnimation">Save</button><button class="editAnimation">Edit</button><br />';
					animationItem += 'FPS: <input type="text" id="assetAnimationFPS_' + activeAssetIndex + '_' + i + '" value="' + assets[activeAssetIndex].animations[i].fps + '" disabled="disabled" /> Loop: <select id="assetAnimationLoop_' + activeAssetIndex + '_' + i + '"  disabled="disabled">';
					animationItem += '<option value="false"';
					if (!assets[activeAssetIndex].animations[i].loop) {
						animationItem += ' selected="selected"';
					}
					animationItem += '>false</option><option value="true"';
					if (assets[activeAssetIndex].animations[i].loop) {
						animationItem += ' selected="selected"';
					}
					animationItem += '>true</option></select><br />';
					
					animationItem += 'Frames: <input type="text" id="assetAnimationFrames_' + activeAssetIndex + '_' + i + '" value="';
					for (var j = 0; j < assets[activeAssetIndex].animations[i].frames.length; j++) {
						animationItem += assets[activeAssetIndex].animations[i].frames[j] + ", ";
					}
					if (assets[activeAssetIndex].animations[i].frames.length) {
						animationItem = animationItem.slice(0, -2);
					}
					animationItem += '" disabled="disabled" /></li>';
					
					$('#assetAnimationsList').append(animationItem);
				}
				
				if (assets[activeAssetIndex].animations.length > 0) {
					$("#assetAnimationNbr").html("(" + assets[activeAssetIndex].animations.length + ")");
				}
			}
			
			$("#assetInfo").show();
			// Generate preview image
			generateAssetPreview();
			$( "#assetAccordion" ).accordion({
				collapsible: true,
				heightStyle: "content"
			});
		}
	});
	
	$("#assetFilterSelection").change(function(e) {
		
		assetFilter = $(this).prop("value");
		generateAssetsViewSelection();
	});
	
	$("#assetDialogueId").change(function(e) {
		
		if ($(this).prop("value") != "-1") {
			$("#assetShowDialogueButton").prop("disabled", false);
		}
		else {
			$("#assetShowDialogueButton").prop("disabled", true);
		}
	});
	
	$("#assetShowDialogueButton").click(function(e) {
		
		e.preventDefault();
		var dialogId = parseInt($("#assetDialogueId").prop("value"));
		$("#dialogsView .dialogSelection").prop("value", dialogId);
		$("#dialogsView .dialogSelection").change();
		$("#dialogsViewButton").click();
	});
	
	$("#duplicateAsset").click(function(e) {
		
		e.preventDefault();
		var newAsset = jQuery.extend(true, {}, assets[activeAssetIndex]);
		if (newAsset.defaultFrame == "") {
			var frame = newAsset.name;
			newAsset.defaultFrame = frame;
		}
		if (newAsset.customAtlas == "") {
			// Make first found room to assets custom atlas
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].assets.indexOf(newAsset.name) != -1) {
					newAsset.customAtlas = rooms[i].name + "Atlas";
					break;
				}
			}
		}
		newAsset.id = misc.assetId;
		newAsset.name += misc.assetId;
		
		misc.assetId++;
		$("#assetsView .assetSelection").append('<option id="asset_' + assets.length + '" value="' + newAsset.name + '">' + newAsset.name + '</option>');
		assets.push(newAsset);
		$("#assetsView .assetSelection").prop("value", newAsset.name);
		$("#assetsView .assetSelection").change();
		
		// Create json files
		saveJSObjectAsJSON(assets, "json/assets.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		$("#assetName").focus().select();
	});
	
	$("#createAssetButton").click(function(e) {
		
		e.preventDefault();
		$("#assetsView .assetSelection").append('<option id="asset_' + assets.length + '" value="newAsset' + misc.assetId + '">' + 'newAsset' + misc.assetId + '</option>');
		
		var asset = {"id":misc.assetId,"name":"newAsset" + misc.assetId,"x":0,"y":0,"animations":[],"defaultActions":[],"conditionalActions":[]};
		misc.assetId++;
		
		assets.push(asset);
		
		$("#assetsView .assetSelection").prop("value", 'newAsset' + asset.id);
		$("#assetsView .assetSelection").change();
		
		// Create json files
		saveJSObjectAsJSON(assets, "json/assets.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		$("#roomSelection").change();
		refreshAssetAutocomplete();
	});
	
	$("#deleteAssetButton").click(function(e) {
		
		if (!confirm("Delete asset " + assets[activeAssetIndex].name + "?")) {
			return;
		}
		var assetName = assets[activeAssetIndex].name;
		assets.splice(activeAssetIndex, 1);
		activeAssetName = undefined;
		activeAssetIndex = undefined;
		generateAssetsViewSelection();
		refreshAssetAutocomplete();
		$("#assetsView .assetSelection").change();
		var writeRooms = false;
		// Remove deleted asset from rooms
		for (var i = 0; i < rooms.length; i++) {
			var index = rooms[i].assets.indexOf(assetName);
			if (index != -1) {
				rooms[i].assets.splice(index, 1);
				writeRooms = true;
			}
		}
		// Create json files
		saveJSObjectAsJSON(assets, "json/assets.json");
		if (writeRooms) {
			saveJSObjectAsJSON(rooms, "json/rooms.json");
		}
		$("#roomSelection").change();
	});
	
	$("#saveAssetButton").click(function(e) {
		
		e.preventDefault();
		
		var oldName = assets[activeAssetIndex].name;
		assets[activeAssetIndex].name = $("#assetName").prop("value");
		if (oldName != assets[activeAssetIndex].name) {
			activeAssetName = assets[activeAssetIndex].name;
			var writeRooms = false;
			for (var i = 0; i < rooms.length; i++) {
				var index = rooms[i].assets.indexOf(oldName);
				if (index != -1) {
					rooms[i].assets[index] = assets[activeAssetIndex].name;
					writeRooms = true;
				}
			}
			// Update roomsview
			if (writeRooms) {
				// Create json file
				saveJSObjectAsJSON(rooms, "json/rooms.json");
				$("#roomSelection").change();
			}
		}
		assets[activeAssetIndex].x = parseInt($("#assetX").prop("value"));
		assets[activeAssetIndex].y = parseInt($("#assetY").prop("value"));
		if ($("#assetForeground").prop("value") == "false") {
			assets[activeAssetIndex].foreground = false;
		}
		else {
			assets[activeAssetIndex].foreground = true;
		}
		if ($("#assetInvisible").prop("value") == "false") {
			assets[activeAssetIndex].invisible = false;
		}
		else {
			assets[activeAssetIndex].invisible = true;
		}
		if ($("#assetDisabled").prop("value") == "false") {
			assets[activeAssetIndex].disabled = false;
		}
		else {
			assets[activeAssetIndex].disabled = true;
		}
		if ($("#assetTransparentClick").prop("value") == "false") {
			assets[activeAssetIndex].transparentClick = false;
		}
		else {
			assets[activeAssetIndex].transparentClick = true;
		}
    assets[activeAssetIndex].description = $("#assetDescription").prop("value");
		if ($("#assetDoorTarget").prop("value") == "-1") {
			assets[activeAssetIndex].doorTarget = "";
		}
		else {
			assets[activeAssetIndex].doorTarget = $("#assetDoorTarget").prop("value");
		}
    
    if ($("#assetDoorFace").prop("value") == "-1") {
      assets[activeAssetIndex].doorFace = undefined;
    }
    else {
      assets[activeAssetIndex].doorFace = $("#assetDoorFace").prop("value");
    }
    
		if ($("#assetPickable").prop("value") == "false") {
			assets[activeAssetIndex].pickable = false;
		}
		else {
			assets[activeAssetIndex].pickable = true;
		}
// Ville testaa
		if ($("#assetFixed").prop("value") == "false") {
			assets[activeAssetIndex].fixed = false;
		}

		else {
			assets[activeAssetIndex].fixed = true;
		}
// Ville lopettaa testauksen		
		if ($("#assetNPC").prop("checked")) {
			assets[activeAssetIndex].npc = true;
		}
		else {
			assets[activeAssetIndex].npc = false;
		}
		createSayerDropdown();
		
		// Recreate gamestates list
		updateGamestates();
		if ($("#assetDialogueId").prop("value") == "-1") {
			assets[activeAssetIndex].dialogueId = "";
		}
		else {
			assets[activeAssetIndex].dialogueId = parseInt($("#assetDialogueId").prop("value"));
		}
		assets[activeAssetIndex].doorSpawn = undefined;
		if ($("#assetDoorSpawn").prop("value").trim() != "") {
			assets[activeAssetIndex].doorSpawn = parseInt($("#assetDoorSpawn").prop("value"));
		}

// Ville & Markus testaa

		assets[activeAssetIndex].rotation = undefined;
		if ($("#assetRotation").prop("value").trim() != "") {
			assets[activeAssetIndex].rotation = parseInt($("#assetRotation").prop("value"));
		}
    
    assets[activeAssetIndex].aoLeft = undefined;
		if ($("#assetApproachOffsetLeft").prop("value").trim() != "") {
			assets[activeAssetIndex].aoLeft = parseInt($("#assetApproachOffsetLeft").prop("value"));
		}
    
    assets[activeAssetIndex].aoRight = undefined;
		if ($("#assetApproachOffsetRight").prop("value").trim() != "") {
			assets[activeAssetIndex].aoRight = parseInt($("#assetApproachOffsetRight").prop("value"));
		}
    
    if ($("#assetForcedApproachDirection").prop("value") == "-1") {
      assets[activeAssetIndex].forcedApproachDirection = undefined;
    }
    else {
      assets[activeAssetIndex].forcedApproachDirection = $("#assetForcedApproachDirection").prop("value");
    }

// Ville & Markus lopettaa testauksen		
    assets[activeAssetIndex].hoverSound = "";
    var hover = $("#assetHoverSound").prop("value").trim().split(",");
    for (var i = 0; i < hover.length; i++) {
      hover[i] = hover[i].trim();
    }
    if (hover.length > 0 && hover[0] != "") {
      assets[activeAssetIndex].hoverSound = hover;
    }
    assets[activeAssetIndex].clickSound = "";
    var click = $("#assetClickSound").prop("value").trim().split(",");
    for (var i = 0; i < click.length; i++) {
      click[i] = click[i].trim();
    }
    if (click.length > 0 && click[0] != "") {
      assets[activeAssetIndex].clickSound = click;
    }
		assets[activeAssetIndex].defaultFrame = $("#assetDefaultFrame").prop("value");
		assets[activeAssetIndex].hoverFrame = $("#assetHoverFrame").prop("value");
		assets[activeAssetIndex].customAtlas = "";
		if (assets[activeAssetIndex].customAtlas = $("#assetCustomAtlas").prop("value") != "-1") {
			assets[activeAssetIndex].customAtlas = $("#assetCustomAtlas").prop("value");
		}
		// Create json file
		saveJSObjectAsJSON(assets, "json/assets.json");
		// Update dropdown
		generateAssetsViewSelection();
		refreshAssetAutocomplete();
		$("#roomSelection").change();
	});
	
	$("#assetAddAnimation").click(function(e) {
		
		e.preventDefault();
		
		if (assets[activeAssetIndex].animations == undefined) {
			assets[activeAssetIndex].animations = [];
		}
		var index = assets[activeAssetIndex].animations.length;
		var animationItem =  '<li class="assetAnimation" id="assetAnimation_' + activeAssetIndex + '_' + index + '">Name: <input type="text" id="assetAnimationName_' + activeAssetIndex + '_' + index + '" value="" /> <button class="deleteAnimation">X</button> <button class="saveAnimation">Save</button><button style="display:none;" class="editAnimation">Edit</button><br />';
		animationItem += 'FPS: <input type="text" id="assetAnimationFPS_' + activeAssetIndex + '_' + index + '" value="" />' + ' Loop: <select id="assetAnimationLoop_' + activeAssetIndex + '_' + index + '"><option value="false">false</option><option value="true">true</option></select><br />';
		animationItem += 'Frames: <input type="text" id="assetAnimationFrames_' + activeAssetIndex + '_' + index + '" value="" /></li>';
		$('#assetAnimationsList').append(animationItem);
				
		var animation = {"name":"","fps":"","loop":"","frames":[]};
		assets[activeAssetIndex].animations.push(animation);
		
		$("#assetAnimationNbr").html("(" + (index + 1) + ")");
		
		// Create json file
		saveJSObjectAsJSON(assets, "json/assets.json");
		
		$("#assetAnimationsList .editAnimation").prop("disabled", true);
		$(this).prop("disabled", true);
	});
	
	$("#assetAnimationsList ").on("click", ".saveAnimation", function(e) {
		
		e.preventDefault();
		// Enable all edit animation buttons
		$("#assetAnimationsList .editAnimation").prop("disabled", false);
		$("#assetAddAnimation").prop("disabled", false);
		
		var parentId = $(this).parent().prop("id");
		var id = parentId.replace("assetAnimation_", "");
		var index = parseInt(parentId.replace("assetAnimation_" + activeAssetIndex + "_", ""));
		var name = $("#assetAnimationName_" + id).prop("value").trim();
		var loop = ($("#assetAnimationLoop_" + id).prop("value") == "true");
		var fps = $("#assetAnimationFPS_" + id).prop("value").trim();
		if (fps != "") {
			fps = parseInt(fps);
		}
		var frames = $("#assetAnimationFrames_" + id).prop("value");
		var framesArray = frames.split(",");
		
		if (framesArray.length == 1 && framesArray[0].trim() == "") {
			framesArray = [];
		}
		for (var i = 0; i < framesArray.length; i++) {
			framesArray[i] = framesArray[i].trim();
		}
		assets[activeAssetIndex].animations[index].name = name;
		assets[activeAssetIndex].animations[index].loop = loop;
		assets[activeAssetIndex].animations[index].fps = fps;
		assets[activeAssetIndex].animations[index].frames = framesArray;
		// Create json file
		saveJSObjectAsJSON(assets, "json/assets.json");
		
		$("#" + parentId + " .editAnimation").show();
		$("#" + parentId + " .deleteAnimation").hide();
		$(this).hide();
		
		$("#assetAnimationName_" + id).prop("disabled", true);
		$("#assetAnimationFPS_" + id).prop("disabled", true);
		$("#assetAnimationLoop_" + id).prop("disabled", true);
		$("#assetAnimationFrames_" + id).prop("disabled", true);
	});
	
	$("#assetAnimationsList ").on("click", ".editAnimation", function(e) {
		
		e.preventDefault();
		
		// Disable all edit animation buttons
		$("#assetAnimationsList .editAnimation").prop("disabled", true);
		$("#assetAddAnimation").prop("disabled", true);
		
		var parentId = $(this).parent().prop("id");
		var id = parentId.replace("assetAnimation_", "");
		
		$("#" + parentId + " .saveAnimation").show();
		$("#" + parentId + " .deleteAnimation").show();
		$(this).hide();
		
		$("#assetAnimationName_" + id).prop("disabled", false);
		$("#assetAnimationFPS_" + id).prop("disabled", false);
		$("#assetAnimationLoop_" + id).prop("disabled", false);
		$("#assetAnimationFrames_" + id).prop("disabled", false);
	});
	
	$("#assetAnimationsList ").on("click", ".deleteAnimation", function(e) {
		
		e.preventDefault();
		
		var index = parseInt($(this).parent().prop("id").replace("assetAnimation_" + activeAssetIndex + "_", ""));
		
		if (!confirm("Delete animation " + assets[activeAssetIndex].animations[index].name + "?")) {
			return;
		}
		assets[activeAssetIndex].animations.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(assets, "json/assets.json");
		
		// Enable all edit animation buttons
		$("#assetAnimationsList .editAnimation").prop("disabled", false);
		$("#assetAddAnimation").prop("disabled", false);
		$(this).parent().remove();
		
		var assetAnimations = $("#assetAnimationsList > li");
		
		$("#assetAnimationNbr").html("");
		if (assetAnimations.length > 0) {
			$("#assetAnimationNbr").html("(" + assetAnimations.length + ")");
		}
		
		// Remove deleted index from the list
		for (var i = 0; i < assetAnimations.length; i++) {
			
			var oldIndex = $(assetAnimations[i]).prop("id").replace("assetAnimation_", "");
			
			$(assetAnimations[i]).prop("id", "assetAnimation_" + activeAssetIndex + "_" + i);
			$("#assetAnimationName_" + oldIndex).prop("id", "assetAnimationName_" + activeAssetIndex + "_" + i);
			$("#assetAnimationFPS_" + oldIndex).prop("id", "assetAnimationFPS_" + activeAssetIndex + "_" + i);
			$("#assetAnimationLoop_" + oldIndex).prop("id", "assetAnimationLoop_" + activeAssetIndex + "_" + i);
			$("#assetAnimationFrames_" + oldIndex).prop("id", "assetAnimationFrames_" + activeAssetIndex + "_" + i);
		}
	});
	
	function generateAssetPreview() {
		
		var atlas = "";
		var fileName = "";
		var spriteName = activeAssetName;
		
		if (assets[activeAssetIndex].customAtlas != undefined && assets[activeAssetIndex].customAtlas != "") {
			for (var i = 0; i < spriteAtlases.length; i++) {
				if (spriteAtlases[i][0] == assets[activeAssetIndex].customAtlas) {
					atlas = spriteAtlases[i][2];
					fileName = spriteAtlases[i][1];
					break;
				}
			}
		}
		else {
			var assetRoom = "";
			// Get first room that use this asset
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].assets.indexOf(activeAssetName) != -1) {
					assetRoom = rooms[i].name;
					break;
				}
			}
			if (assetRoom != "") {
				atlas = "img/" + assetRoom + "/" + assetRoom + "Atlas.json";
				fileName = "img/" + assetRoom + "/" + assetRoom + "Atlas.png";
			}
		}
		
		if (atlas == "") {
			return;
		}
		if (assets[activeAssetIndex].defaultFrame != undefined && assets[activeAssetIndex].defaultFrame != "") {
			spriteName = assets[activeAssetIndex].defaultFrame;
		}
		var img = new Image();
		
		img.onload = function() {
			
			$.get("index.php", {action: 'getAssetImageProperties', asset: spriteName, atlas: atlas}, "json").done(function(result) {
				if (result.frame != undefined) {
					$("#assetPreviewCanvas").prop("width", result.frame.w);
					$("#assetPreviewCanvas").prop("height", result.frame.h);
					var previewCanvas = document.getElementById("assetPreviewCanvas");
					var ctx = previewCanvas.getContext("2d");
					ctx.drawImage(img,result.frame.x,result.frame.y,result.frame.w,result.frame.h,0,0,result.frame.w,result.frame.h);
					var imgData = previewCanvas.toDataURL("image/png");
					$("#assetPreview img").prop("src", imgData);
					$("#assetPreview img").show();
				}
			});
		};
		img.src = fileName;
	}
	
	function generateAssetsViewSelection() {
		
		$("#assetsView .assetSelection").empty();
		$("#assetsView .assetSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Asset</option>');
		
		var roomAssets = [];
		
		for (var i = 0; i < assets.length; i++) {
			
			var addAsset = false;
			if (assetFilter == undefined || assetFilter == "-1") {
				addAsset = true;
			}
			else {
				// Get suitable assets
				if (!roomAssets.length) {

					for (var j = 0; j < rooms.length; j++) {
						if (rooms[j].name == assetFilter) {
							roomAssets = rooms[j].assets;
							break;
						}
					}
				}
				for (var j = 0; j < roomAssets.length; j++) {
					if (roomAssets[j].indexOf(assets[i].name) != -1) {
						addAsset = true;
						break;
					}
				}
			}
			
			if (addAsset) {
				$("#assetsView .assetSelection").append('<option id="asset_' + i + '" value="' + assets[i].name + '">' + assets[i].name + '</option>');
			}
		}
		// Generate door targets
		$("#assetDoorTarget").empty();
		$("#assetDoorTarget").append('<option value="-1" selected="selected">None</option>');
		for (var i = 0; i < rooms.length; i++) {
			$("#assetDoorTarget").append('<option value="' + rooms[i].name + '">' + rooms[i].name + '</option>');
		}
		if (activeAssetIndex != undefined && assets[activeAssetIndex].doorTarget != undefined && assets[activeAssetIndex].doorTarget != "") {
			$("#assetDoorTarget").prop("value", assets[activeAssetIndex].doorTarget);
		}
		// Generate dialogueIds
		$("#assetDialogueId").empty();
		$("#assetDialogueId").append('<option value="-1" selected="selected">None</option>');
		for (var i = 0; i < dialogs.length; i++) {
			$("#assetDialogueId").append('<option value="' + dialogs[i].id + '">' + dialogs[i].id + '</option>');
		}
		if (activeAssetIndex != undefined && assets[activeAssetIndex].dialogueId != undefined && assets[activeAssetIndex].dialogueId != "") {
			$("#assetDialogueId").prop("value", assets[activeAssetIndex].dialogueId);
		}
		// If some asset is active, select that
		if (activeAssetName != undefined) {
			$("#assetsView .assetSelection").prop("value", activeAssetName);
			$("#assetsView .assetSelection").change();
		}
	}
	
	function generateAssetFilterSelection() {
		
		$("#assetFilterSelection").empty();
		$("#assetFilterSelection").append('<option value="-1" selected="selected">Show All</option>');
		
		for (var i = 0; i < rooms.length; i++) {
			$("#assetFilterSelection").append('<option value="' + rooms[i].name + '">' + rooms[i].name + '</option>');
		}
		// If some room is active, select that
		if (assetFilter != undefined) {
			$("#assetFilterSelection").prop("value", assetFilter);
			$("#assetFilterSelection").change();
		}
	}
	
	function refreshAssetAutocomplete() {
		
		assetSearch = [];
		for (var i = 0; i < assets.length; i++) {
			if (assetSearch.indexOf(assets[i].name) == -1) {
				assetSearch.push(assets[i].name);
			}
		}
		assetSearch.sort();
		
    $(".assetNameAutocomplete").autocomplete({
			source: assetSearch
		});
    $(".assetNameWithParameterAutocomplete").autocomplete({
			source: assetSearch,
      select: function(event, ui) {
        event.preventDefault();
        $(this).val(ui.item.value + ', ' + $(this).data("parameter"));
      }
		});
		$(".assetModifyAutocomplete").autocomplete({
			source: assetSearch,
			select: function(event, ui) {
				event.preventDefault();
				$(this).val(ui.item.value + ', property, value');
			}
		});
		$(".assetMoveAutocomplete").autocomplete({
			source: assetSearch,
			select: function(event, ui) {
				event.preventDefault();
				$(this).val('x, y, ' + ui.item.value + ', velocity');
			}
		});
		$(".assetAnimationAutocomplete").autocomplete({
			source: assetSearch,
			select: function(event, ui) {
				event.preventDefault();
				$(this).val(ui.item.value + ', animationName');
			}
		});
    $(".playAnimationAutocomplete").autocomplete({
      source: assetSearch.concat(npcSearch).sort(),
      select: function(event, ui) {
        event.preventDefault();
        $(this).val(ui.item.value + ', animationName');
      }
    });
	}
	
	/***********************************************
	* ACTIONS VIEW
	***********************************************/
	// Initialize actions view
	generateActionsViewSelection();
	$("#actionsView .actionSelection").prop("value", "-1");
	$("#deleteActionButton").prop("disabled", true);
	$("#renameActionButton").prop("disabled", true);
	$("#renameAction").hide();
	$("#actionInfo").hide();
	$("#duplicateAction").prop("disabled", true);
  $("#actionCommentArea").prop("disabled", true);
  $("#actionComment").hide();
	var activeTask = undefined;
	var taskAdded = false;
	
	/*function resizePanels() {
		
		var availableWidth = $("#actionsView").width() - $("#tasksAvailable").width();
		
		var minWidth = $("#tasksInAction").css("min-width");
		if (availableWidth < minWidth) {
			$("#tasksInAction").width($("#actionsView").width());
		}
		else {
			$("#tasksInAction").width(availableWidth);
		}
		console.log($("#tasksInAction").width());
	}
	$(window).resize(resizePanels);*/
	// Init available tasks list
	$("#actionTasksToUseList > li").draggable({
		cursor: "move",
		revert: true,
		revertDuration: 300,
		appendTo: "body",
		helper: "clone",
		start: function( event, ui ) {
			taskAdded = false;
			activeTask = parseInt(ui.helper.context.id.replace("actionTaskToUse_", ""));
      if (activeTask == 0) {
        $("#actionTaskDescription").html("string = comment (EDITOR ONLY)");
      }
      else {
        activeTask--;
        $("#actionTaskDescription").html("Params: " + tasks[activeTask].description);		
      }
		},
		stop: function( event, ui ) {
			if (!taskAdded) {
				$("#actionTaskDescription").html("<br />");
			}
		}
	});
	
	// Select action
	$("#actionsView .actionSelection").change(function() {
		
		activeActionName = $(this).val();
		$("#actionInfo").hide();
		$("#deleteActionButton").prop("disabled", true);
		$("#renameActionButton").prop("disabled", true);
		$("#duplicateAction").prop("disabled", true);
    $("#actionCommentArea").prop("disabled", true);
    $("#actionComment").hide();
		$("#renameAction").hide();
		$("#actionTasksList").empty();
		$("#actionTaskDescription").html("");
		
		if (activeActionName != undefined && activeActionName != "-1") {
			
			$("#deleteActionButton").prop("disabled", false);
			$("#renameActionButton").prop("disabled", false);
			$("#duplicateAction").prop("disabled", false);

			
			// Create placeholder for droppable items if list is empty
			if (actions[activeActionName].tasks.length < 1) {
				$('<li class="placeholder">Drag tasks to here.</li>').appendTo("#actionTasksList");
			}
				
			for (var i = 0; i < actions[activeActionName].tasks.length; i++) {
				
        if (actions[activeActionName].tasks[i].name == "Comment") {
          var listItem = '<li id="actionTask_' + i + '" class="commentLine"><button class="editTask">Edit</button> <span id="actionTaskName_' + i + '">' + actions[activeActionName].tasks[i].name + ': </span><input type="text" id="actionTaskParamsInput_' + i + '" value="' + actions[activeActionName].tasks[i].params + '" style="display:none;" />';
          listItem += '<span id="actionTaskParams_' + i + '">' + actions[activeActionName].tasks[i].params + '</span> <button style="display:none;" class="deleteTask">Del</button><span class="sortable-handle"></span></li>';
          $('#actionTasksList').append(listItem);
          continue;
        }
				var listItem = '<li id="actionTask_' + i + '"><button class="editTask">Edit</button> <span id="actionTaskName_' + i + '">' + actions[activeActionName].tasks[i].name + '</span>(<input type="text" id="actionTaskParamsInput_' + i + '" value="';
				var params = "";
				
				for (var j = 0; j < actions[activeActionName].tasks[i].params.length; j++) {
					params += actions[activeActionName].tasks[i].params[j] + ", ";
				}
				if (actions[activeActionName].tasks[i].params.length) {
					params = params.slice(0, -2);
				}
				listItem += params + '" style="display:none;" />';
				listItem += '<span id="actionTaskParams_' + i + '">' + params + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="actionTaskWait_' + i + '" ';
				var wait = false;
				if (actions[activeActionName].tasks[i].wait != undefined) {
					wait = actions[activeActionName].tasks[i].wait;
					listItem += 'checked="checked"';
				}
				listItem += ' disabled="disabled" /><button style="display:none;" class="deleteTask">Del</button><span class="sortable-handle"></span></li>';
				
				$('#actionTasksList').append(listItem);
				
				// Add autocompletes
				if (actions[activeActionName].tasks[i].name == "launchDialogue") {
					$("#actionTaskParamsInput_" + i).addClass("launchDialogueAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: dialogueSearch
					});
				}
				else if (actions[activeActionName].tasks[i].name == "changeGamestate") {
					$("#actionTaskParamsInput_" + i).addClass("changeGamestateAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: availableGameStates,
						select: function(event, ui) {
							event.preventDefault();
							var type = getGamestateType(ui.item.value);
							$(this).val(ui.item.value + ', ' + type + ', false'); // last parameter is increment
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "showAsset" || actions[activeActionName].tasks[i].name == "modifyDoor") {
          $("#actionTaskParamsInput_" + i).addClass("assetNameWithParameterAutocomplete");
          $("#actionTaskParamsInput_" + i).data("parameter", "keepDisabled");
          if (actions[activeActionName].tasks[i].name == "modifyDoor") $("#actionTaskParamsInput_" + i).data("parameter", "boolean");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: assetSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', ' + $(this).data("parameter"));
						}
					});
        } else if (actions[activeActionName].tasks[i].name == "hideAsset" || actions[activeActionName].tasks[i].name == "addToInventory" || actions[activeActionName].tasks[i].name == "removeFromInventory") {
					$("#actionTaskParamsInput_" + i).addClass("assetNameAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: assetSearch
					});
				} else if (actions[activeActionName].tasks[i].name == "modifyAsset") {
					$("#actionTaskParamsInput_" + i).addClass("assetModifyAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: assetSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', property, value');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "moveAssetTo") {
					$("#actionTaskParamsInput_" + i).addClass("assetMoveAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: assetSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val('x, y, ' + ui.item.value + ', velocity');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "playAnimation") {
					$("#actionTaskParamsInput_" + i).addClass("assetAnimationAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: assetSearch.concat(npcSearch).sort(),
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', animationName');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "playNpcAnimation") {
					$("#actionTaskParamsInput_" + i).addClass("npcAnimationAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: npcSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', animationName, loop');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "modifyNpc") {
					$("#actionTaskParamsInput_" + i).addClass("npcModifyAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: npcSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', operation, value(only with some operations)');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "moveNpcTo") {
					$("#actionTaskParamsInput_" + i).addClass("npcMoveAutocomplete");
					$("#actionTaskParamsInput_" + i).autocomplete({
						source: npcSearch,
						select: function(event, ui) {
							event.preventDefault();
							$(this).val(ui.item.value + ', targetX, velocity');
						}
					});
				} else if (actions[activeActionName].tasks[i].name == "flipNpc") {
          $("#actionTaskParamsInput_" + i).addClass("npcModifyAutocomplete");
          $("#actionTaskParamsInput_" + i).autocomplete({
            source: npcSearch,
            select: function(event, ui) {
              event.preventDefault();
              $(this).val(ui.item.value + ', target');
            }
          });
        } else if (actions[activeActionName].tasks[i].name == "teleport") {
          $("#actionTaskParamsInput_" + i).addClass("roomNameAutocomplete");
          $("#actionTaskParamsInput_" + i).autocomplete({
            source: roomSearch
          });
        } else if (actions[activeActionName].tasks[i].name == "changeMusic") {
          $("#actionTaskParamsInput_" + i).addClass("roomNameWithParameterAutocomplete");
          $("#actionTaskParamsInput_" + i).autocomplete({
            source: roomSearch,
            select: function(event, ui) {
              event.preventDefault();
              $(this).val(ui.item.value + ', musicName');
            }
          });
        }
			}
      $("#actionCommentArea").prop("value", actions[activeActionName].comment);
      $("#actionComment").show();
      
			$('#actionTasksList').sortable({
				placeholder: "ui-state-highlight",
				cursor: "move",
				axis: "y",
				delay: 500,
				handle: ".sortable-handle",
				items: "li:not(.placeholder)",
				update: function(event,ui) {
					
					var items = $("#actionTasksList > li");
					
					var newActions = jQuery.extend(true, [], actions[activeActionName].tasks);
					for (var i = 0; i < items.length; i++) {
						
						var index = parseInt($(items[i]).prop("id").replace("actionTask_", ""));
						actions[activeActionName].tasks[i] = newActions[index];
						$(items[i]).prop("id", "actionTask_" + i);
			
						$("#actionTask_" + i + " #actionTaskName_" + index).prop("id", "actionTaskName_" + i);
						$("#actionTask_" + i + " #actionTaskParamsInput_" + index).prop("id", "actionTaskParamsInput_" + i);
						$("#actionTask_" + i + " #actionTaskParams_" + index).prop("id", "actionTaskParams_" + i);
						$("#actionTask_" + i + " #actionTaskWait_" + index).prop("id", "actionTaskWait_" + i);
					}
					saveJSObjectAsJSON(actions, "json/actions.json");
				}
				
			}).droppable({
				accept: "#actionTasksToUseList > li",
				activeClass: "ui-state-hover",
				hoverClass: "ui-state-active",
				drop: function( event, ui ) {
					taskAdded = true;
					$( this ).find( ".placeholder" ).remove();
					var index = parseInt(ui.draggable.prop("id").replace("actionTaskToUse_", ""));
					createTask(index);			
				}
			});
			$('#actionTasksList label, #actionTasksList a').disableSelection();
			$( "#actionTaskList" ).disableSelection();
			$("#actionInfo").show();
		}
	});
	
	$("#duplicateAction").click(function(e) {
		
		e.preventDefault();
		var newObject = jQuery.extend(true, {}, actions[activeActionName]);
		var name = activeActionName + misc.actionId;
		misc.actionId++;
		actions[name] = newObject;
		activeActionName = name;
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
		saveJSObjectAsJSON(actions, "json/actions.json");
		generateActionsViewSelection();
		$("#renameActionButton").click();
		$("#renameActionInput").focus().select();
	});
	
	$("#createActionButton").click(function(e) {
		
		e.preventDefault();
		actions["newAction" + misc.actionId] = {"tasks":[], "comment":""};
		activeActionName = "newAction" + misc.actionId;
		misc.actionId++;
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
		saveJSObjectAsJSON(actions, "json/actions.json");
		generateActionsViewSelection();
	});
	
	$("#deleteActionButton").click(function(e) {
		
		e.preventDefault();
		if (!confirm("Delete action " + activeActionName + "?")) {
			return;
		}
		delete actions[activeActionName];
		activeActionName = undefined;
		// Create json file
		saveJSObjectAsJSON(actions, "json/actions.json");
		generateActionsViewSelection();
		$("#actionsView .actionSelection").prop("value", "-1");
		$("#actionsView .actionSelection").change();
	});
	
	$("#renameActionButton").click(function(e) {
		
		e.preventDefault();
		$(this).prop("disabled", true);
		$(".editTask, #createActionButton, #deleteActionButton, #duplicateAction").prop("disabled", true);
		$("#renameAction, #actionComment").show();
    $("#actionCommentArea").prop("disabled", false);
		$("#renameActionInput").prop("value", activeActionName);
		$("#actionTasksList").sortable( "option", "disabled", true );
		$("#actionTasksList").droppable( "option", "disabled", true );
    $(".actionSelection").prop("disabled", true);
	});
	
	$("#confirmActionRenameButton").click(function(e) {
		
		e.preventDefault();
		
		var newName = $("#renameActionInput").prop("value").trim();
    if (actions[newName] && activeActionName != newName) {
      if (!confirm("There's already action with name " + newName + ". Do you want to overwrite it?")) {
        return;
      }
    }
    if (activeActionName != newName) {
      var newObject = jQuery.extend(true, {}, actions[activeActionName]);
      delete actions[activeActionName];
      actions[newName] = newObject;
      activeActionName = newName;
    }
    actions[activeActionName].comment = $("#actionCommentArea").prop("value");
		// Create json file
		saveJSObjectAsJSON(actions, "json/actions.json");
		generateActionsViewSelection();
		$("#renameAction").hide();
    $("#actionCommentArea").prop("disabled", true);
    $(".actionSelection").prop("disabled", false);
		$(".editTask, #createActionButton, #deleteActionButton, #duplicateAction").prop("disabled", false);
		$("#renameActionButton").prop("disabled", false);
		$("#actionTasksList").sortable( "option", "disabled", false );
    $("#actionTasksList").droppable( "option", "disabled", false );
	});
	
	$("body").on("click", ".editTask", function(e) {
		
		e.preventDefault();
		// Disable edit buttons
		$(".editTask").prop("disabled", true);
		$("#createActionButton").prop("disabled", true);
    $("#deleteActionButton").prop("disabled", true);
		$("#renameActionButton").prop("disabled", true);
		$("#duplicateAction").prop("disabled", true);
    $(".actionSelection").prop("disabled", true);
		$(this).hide();
		var index = parseInt($(this).parent().prop("id").replace("actionTask_", ""));
		$("#actionTaskWait_" + index).prop("disabled", false);
		$('#actionTaskParamsInput_' + index).show();
		$('#actionTaskParams_' + index).hide();
		$('#actionTask_' + index + ' .deleteTask').show();
		$(this).parent().prepend('<button class="saveTask">Save</button> ');
		$("#actionTasksList").sortable( "option", "disabled", true );
		$("#actionTasksList").droppable( "option", "disabled", true );
	});
	
	$("body").on("click", ".saveTask", function(e) {
		
		e.preventDefault();
		// Show edit button
		$('#' + $(this).parent().prop("id") + ' .editTask').show();
		// Enable edit buttons
		$(".editTask").prop("disabled", false);
		$("#createActionButton").prop("disabled", false);
    $("#deleteActionButton").prop("disabled", false);
		$("#renameActionButton").prop("disabled", false);
		$("#duplicateAction").prop("disabled", false);
    $(".actionSelection").prop("disabled", false);
		var index = parseInt($(this).parent().prop("id").replace("actionTask_", ""));
		$("#actionTaskWait_" + index).prop("disabled", true);
		var params = $('#actionTaskParamsInput_' + index).prop("value");
		$('#actionTaskParams_' + index).html(params);
    if ($(this).parent().hasClass("commentLine")) {
      actions[activeActionName].tasks[index].params = params;
      $('#actionTaskName_' + index).html("Comment: ");
    }
    else {
      var paramsArray = params.split(",");
		
      if (paramsArray.length == 1 && paramsArray[0].trim() == "") {
        paramsArray = [];
      }
      for (var i = 0; i < paramsArray.length; i++) {
        paramsArray[i] = paramsArray[i].trim();
        if (paramsArray[i] == "true") {
          paramsArray[i] = true;
        }
        else if (paramsArray[i] == "false") {
          paramsArray[i] = false;
        }
        else if (!isNaN(paramsArray[i])) {
          paramsArray[i] = parseFloat(paramsArray[i]);
        }
      }
      var wait = undefined;
      if ($("#actionTaskWait_" + index).prop("checked")) {
        wait = true;
      }
      actions[activeActionName].tasks[index].params = paramsArray;
      actions[activeActionName].tasks[index].wait = wait;
      $('#actionTaskName_' + index).html(actions[activeActionName].tasks[index].name);
    }
		
		// Create json file
		saveJSObjectAsJSON(actions, "json/actions.json");
		
		$('#actionTaskParamsInput_' + index).hide();
		$('#actionTask_' + index + ' .deleteTask').hide();
		$('#actionTaskParams_' + index).show();
		$(this).remove();
		$("#actionTasksList").sortable( "option", "disabled", false );
		$("#actionTasksList").droppable( "option", "disabled", false );
		$("#actionTaskDescription").html("<br />");
		activeTask = undefined;
		taskAdded = false;
	});
	
	$("body").on("click", ".deleteTask", function(e) {
		
		e.preventDefault();
		
		var index = parseInt($(this).parent().prop("id").replace("actionTask_", ""));
		if (!confirm("Delete task " + actions[activeActionName].tasks[index].name + "?")) {
			return;
		}
		actions[activeActionName].tasks.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(actions, "json/actions.json");
		// Enable edit buttons
		$('#' + $(this).parent().prop("id") + ' .editTask').show();
		$(".editTask").prop("disabled", false);
		$("#createActionButton").prop("disabled", false);
    $("#deleteActionButton").prop("disabled", false);
		$("#renameActionButton").prop("disabled", false);
		$("#duplicateAction").prop("disabled", false);
    $(".actionSelection").prop("disabled", false);
		// Remove item
		$(this).parent().remove();
		
		var taskItems = $("#actionTasksList > li");
		// Remove deleted index from the list
		for (var i = 0; i < taskItems.length; i++) {
			
			var oldIndex = $(taskItems[i]).prop("id").replace("actionTask_", "");
			$(taskItems[i]).prop("id", "actionTask_" + i);
			$("#actionTask_" + i + " #actionTaskName_" + oldIndex).prop("id", "actionTaskName_" + i);
			$("#actionTask_" + i + " #actionTaskParamsInput_" + oldIndex).prop("id", "actionTaskParamsInput_" + i);
			$("#actionTask_" + i + " #actionTaskParams_" + oldIndex).prop("id", "actionTaskParams_" + i);
			$("#actionTask_" + i + " #actionTaskWait_" + oldIndex).prop("id", "actionTaskWait_" + i);
		}
		// Create placeholder for droppable items if list is empty
		if (actions[activeActionName].tasks.length < 1) {
			$('<li class="placeholder">Drag tasks to here.</li>').appendTo("#actionTasksList");
		}
		$("#actionTasksList").sortable( "option", "disabled", false );
		$("#actionTasksList").droppable( "option", "disabled", false );
		$("#actionTaskDescription").html("<br />");
		activeTask = undefined;
		taskAdded = false;
	});
	
	function createTask(taskIndex) {
		
    if (taskIndex == 0) {
      
      var listItem = '<li id="actionTask_' + actions[activeActionName].tasks.length + '" class="commentLine"><button class="editTask">Edit</button> <span id="actionTaskName_' + actions[activeActionName].tasks.length + '">Comment: </span><input type="text" id="actionTaskParamsInput_' + actions[activeActionName].tasks.length + '" value="" style="display:none;" />';
      listItem += '<span id="actionTaskParams_' + actions[activeActionName].tasks.length + '"></span> <button style="display:none;" class="deleteTask">Del</button><span class="sortable-handle"></span></li>';
      $('#actionTasksList').append(listItem);
      var task = {"id":misc.taskId,"name":"Comment","params":""};
      actions[activeActionName].tasks.push(task);
      misc.taskId++;
      // Create json files
      saveJSObjectAsJSON(misc, "json/misc.json");
      saveJSObjectAsJSON(actions, "json/actions.json");
      $('#actionTask_' + (actions[activeActionName].tasks.length-1) + ' .editTask').click();
		
      if (activeTask != undefined) {
        $("#actionTaskDescription").html("string = comment (EDITOR ONLY)");
      }
      return;
    }
		var taskItem = tasks[taskIndex-1];
		
		var listItem = '<li id="actionTask_' + actions[activeActionName].tasks.length + '"><button class="editTask">Edit</button> <span id="actionTaskName_' + actions[activeActionName].tasks.length + '">' + taskItem.name + '</span>(<input type="text" id="actionTaskParamsInput_' + actions[activeActionName].tasks.length + '" value="';
		
		var paramsString = "";
		var paramsNbr = taskItem.paramTypes.length;
		
		for (var i = 0; i < paramsNbr; i++) {
			
			if (taskItem.defaultParams[i] != "null") {
				
				if (taskItem.paramTypes[i] == "string" && taskItem.defaultParams[i].indexOf("__") != -1) {
					var defaults = taskItem.defaultParams[i].split("__");
					paramsString += defaults[0];
				}
				else {
					paramsString += taskItem.defaultParams[i];
				}
			}
			else {
				paramsString += taskItem.paramTypes[i];
			}
			if (i < paramsNbr-1) {
				paramsString += ", ";
			}
		}
		listItem +=  paramsString + '" style="display:none;" />';
		
		listItem += '<span id="actionTaskParams_' + actions[activeActionName].tasks.length + '">' + paramsString + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="actionTaskWait_' + actions[activeActionName].tasks.length + '"  disabled="disabled" /> <button style="display:none;" class="deleteTask">Del</button><span class="sortable-handle"></span></li>';
		$('#actionTasksList').append(listItem);
		var task = {"id":misc.taskId,"name":taskItem.name,"params":[]};
		actions[activeActionName].tasks.push(task);
		misc.taskId++;
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
		saveJSObjectAsJSON(actions, "json/actions.json");
		
		// Add autocompletes
		if (taskItem.name == "launchDialogue") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("launchDialogueAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: dialogueSearch
			});
		} else if (taskItem.name == "changeGamestate") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("changeGamestateAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: availableGameStates,
				select: function(event, ui) {
					event.preventDefault();
					var type = getGamestateType(ui.item.value);
					$(this).val(ui.item.value + ', ' + type + ', false'); // last parameter is increment
				}
			});
    } else if (taskItem.name == "showAsset" || taskItem.name == "modifyDoor") {
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("assetNameWithParameterAutocomplete");
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).data("parameter", "keepDisabled");
      if (taskItem.name == "modifyDoor") $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).data("parameter", "boolean");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
        source: assetSearch,
        select: function(event, ui) {
          event.preventDefault();
          $(this).val(ui.item.value + ', ' + $(this).data("parameter"));
        }
      });
    } else if (taskItem.name == "hideAsset" || taskItem.name == "addToInventory" || taskItem.name == "removeFromInventory") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("assetNameAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: assetSearch
			});
		} else if (taskItem.name == "modifyAsset") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("assetModifyAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', property, value');
				}
			});
		} else if (taskItem.name == "moveAssetTo") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("assetMoveAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val('x, y, ' + ui.item.value + ', velocity');
				}
			});
		} else if (taskItem.name == "playAnimation") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("assetAnimationAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: assetSearch.concat(npcSearch).sort(),
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName');
				}
			});
		} else if (taskItem.name == "playNpcAnimation") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("npcAnimationAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName, loop');
				}
			});
		} else if (taskItem.name == "modifyNpc") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("npcModifyAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', operation, value(only with some operations)');
				}
			});
		} else if (taskItem.name == "moveNpcTo") {
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("npcMoveAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', targetX, velocity');
				}
			});
		} else if (taskItem.name == "flipNpc") {
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("npcMoveAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
          $(this).val(ui.item.value + ', target');
        }
      });
    } else if (taskItem.name == "teleport") {
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("roomNameAutocomplete");
			$("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
        source: roomSearch
      });
    } else if (taskItem.name == "changeMusic") {
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).addClass("roomNameWithParameterAutocomplete");
      $("#actionTaskParamsInput_" + (actions[activeActionName].tasks.length - 1)).autocomplete({
        source: roomSearch,
        select: function(event, ui) {
          event.preventDefault();
          $(this).val(ui.item.value + ', musicName');
        }
      });
    }
		
		$('#actionTask_' + (actions[activeActionName].tasks.length-1) + ' .editTask').click();
		
		if (activeTask != undefined) {
			$("#actionTaskDescription").html("Params: " + tasks[activeTask].description);
		}
	}
	
	// Returns number of references to action in rooms, assets and dialogs
	function getActionReferencesNbr(actionName) {
		
		var refNbr = 0;
		var objectArrays = [rooms, assets, dialogs];
		
		for (var a = 0; a < objectArrays.length; a++) {
			
			for (var i = 0; i < objectArrays[a].length; i++) {
				
				if (objectArrays[a][i].defaultActions != undefined) {
					for (var j = 0; j < objectArrays[a][i].defaultActions.length; j++) {
						
						if (jQuery.type(objectArrays[a][i].defaultActions[j]) === "string" && objectArrays[a][i].defaultActions[j] == actionName) {
							refNbr++;
						}
						else if (jQuery.type(objectArrays[a][i].defaultActions[j]) === "array" && objectArrays[a][i].defaultActions[j][0] == actionName) {
							refNbr++;
						}
					}
				}
				if (objectArrays[a][i].conditionalActions != undefined) {
				
					for (var j = 0; j < objectArrays[a][i].conditionalActions.length; j++) {
					
						for (var k = 0; k < objectArrays[a][i].conditionalActions[j].results.length; k++) {
							
							if (jQuery.type(objectArrays[a][i].conditionalActions[j].results[k]) === "string" && objectArrays[a][i].conditionalActions[j].results[k] == actionName) {
								refNbr++;
							}
							else if (jQuery.type(objectArrays[a][i].conditionalActions[j].results[k]) === "array" && objectArrays[a][i].conditionalActions[j].results[k][0] == actionName) {
								refNbr++;
							}
						}
					}
				}
			}
		}
		return refNbr;
	}
	
	function generateActionsViewSelection() {
		
		$("#actionsView .actionSelection").empty();
		$("#actionsView .actionSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Action</option>');
		
		// Create add default and conditional actions lists too
		$(".addDefaultActionSelect, .addConditionalActionSelect").empty();
		$(".addDefaultActionSelect, .addConditionalActionSelect").append('<option value="-1" disabled="disabled" selected="selected">Select Action</option>');
		$(".addDefaultActionSelect, .addConditionalActionSelect").append('<option value="singleTask">Single Task</option>');
		
		var actionIndex = 0;
		for (var action in actions) {
			$("#actionsView .actionSelection").append('<option id="action_' + actionIndex + '" value="' + action + '">(' + getActionReferencesNbr(action) + ') ' + action + '</option>');
			$(".addDefaultActionSelect, .addConditionalActionSelect").append('<option value="' + action + '">' + action + '</option>');
			actionIndex++;
		}
		$(".addDefaultActionSelect, .addConditionalActionSelect").change();
		// If some action is active, select that
		if (activeActionName != undefined) {
			$("#actionsView .actionSelection").prop("value", activeActionName);
			$("#actionsView .actionSelection").change();
		}
	}
	
	/***********************************************
	* DIALOGS VIEW
	***********************************************/
	// Initialize dialogs view
	generateDialogsViewSelection();
	generateDialogFilterSelection();
	createSayerDropdown();
	$("#dialogsView .dialogSelection").prop("value", "-1");
	$("#dialogsView .dialogChainSelection").prop("value", "-1");
	$("#deleteDialogChainButton").prop("disabled", true);
	$("#deleteDialogButton").prop("disabled", true);
	$("#saveDialogButton").prop("disabled", true);
	$("#dialogCreateNextButton").prop("disabled", true);
	$("#dialogAddDefaultAction").prop("disabled", true);
	$("#dialogAddConditionalAction").prop("disabled", true);
	$("#dialogAddDefaultActionSelect, #dialogAddConditionalActionSelect").prop("value", "-1");
	$("#dialogChainRootName").empty();
	$("#dialogChainRootNode").hide();
	$("#dialogChainNameEdit").prop("value", "");
	
	$("#dialogAccordion").accordion({
		collapsible: true,
		heightStyle: "content"
	});
	
	$("#dialogInfo").hide();
	// Select dialog
	$("#dialogsView .dialogChainSelection").change(function() {
		if ($(this).prop("value") == "-1") {
			$("#deleteDialogChainButton").prop("disabled", true);
			dialogRootNode = undefined;
		}
		else {
			$("#deleteDialogChainButton").prop("disabled", false);
			dialogRootNode = parseInt($(this).val());
		}
		$("#dialogsView .dialogSelection").prop("value", parseInt($(this).val()));
		$("#dialogsView .dialogSelection").change();
	});
	
	$("#dialogsView .dialogSelection").change(function() {
		
		activeDialogID = parseInt($(this).val());
		activeDialogIndex = undefined;
		$("#dialogInfo").hide();
		$("#deleteDialogButton").prop("disabled", true);
		$("#saveDialogButton").prop("disabled", true);
    $("#dialogSpeechAnimation").empty();
		$("#dialogChoicesList").empty();
		$("#dialogConditionalNextList").empty();
		$("#dialogDefaultActionsList").empty();
		$("#dialogConditionalActionsList").empty();
		$("#dialogAddDefaultAction").prop("disabled", true);
		$("#dialogAddConditionalAction").prop("disabled", true);
		$("#dialogAddDefaultActionSelect, #dialogAddConditionalActionSelect").prop("value", "-1");
		$("#dialogChoiceNbr").html("");
		
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == activeDialogID) {
				activeDialogIndex = i;
				break;
			}
		}
		
		if (activeDialogIndex != undefined) {
			$("#deleteDialogButton").prop("disabled", false);
			$("#saveDialogButton").prop("disabled", false);
			$("#dialogsAddChoice").prop("disabled", false);
			$("#dialogId").prop("value", activeDialogID);
			// Check if "textOnTop" is defined and put it to "text" field in cases of choices
			if (dialogs[activeDialogIndex].textOnTop != undefined) {
				$("#dialogText").prop("value", dialogs[activeDialogIndex].textOnTop);
			}
			else {
				$("#dialogText").prop("value", dialogs[activeDialogIndex].text);
			}
			// Check if there are choices
			if (jQuery.type(dialogs[activeDialogIndex].text) === 'array') {
				// Disable dialogNext
				$("#dialogNext").prop("disabled", true);
				$("#dialogNextDialogueSearch").prop("disabled", true);
				$("#dialogCreateNextButton").prop("disabled", true);
				$("#dialogAddConditionalNext").prop("disabled", true);
				
				for (var i = 0; i < dialogs[activeDialogIndex].text.length; i++) {
					
					var $choiceItem = $('<li class="dialogChoice" id="dialogChoice_' + activeDialogIndex + '_' + i + '"></li>');
					var choiceItemInner = '<span class="sortable-handle"></span> Text: <input type="text" class="dialogChoiceText" id="dialogChoiceText_' + activeDialogIndex + '_' + i + '" value="' + dialogs[activeDialogIndex].text[i].text + '" /> <button class="dialogsDeleteChoice">X</button><br />';
					choiceItemInner += '<input type="checkbox" id="dialogChoiceToggleCondition_' + activeDialogIndex + '_' + i + '" class="toggleChoiceCondition" ';
					if (dialogs[activeDialogIndex].text[i].condition != undefined && dialogs[activeDialogIndex].text[i].condition != "") {
						choiceItemInner += 'checked="checked" /> Condition: <input type="text" value="" id="dialogChoiceCondition_' + activeDialogIndex + '_' + i + '" class="dialogChoiceCondition" /><br />';
					}
					else {
						 choiceItemInner += '/> Condition: <input type="text" value="" id="dialogChoiceCondition_' + activeDialogIndex + '_' + i + '" class="dialogChoiceCondition" disabled="disabled" /><br />';
					}
					choiceItemInner += 'Points: <input type="text" id="dialogChoicePoints_' + activeDialogIndex + '_' + i + '" value="' + dialogs[activeDialogIndex].text[i].points + '" /> ';
					choiceItemInner += 'Audio: <input type="text" id="dialogChoiceAudio_' + activeDialogIndex + '_' + i + '" value="';

          var audio = "";
          if (dialogs[activeDialogIndex].text[i].audio != undefined && dialogs[activeDialogIndex].text[i].audio != "") {
            audio = dialogs[activeDialogIndex].text[i].audio.join(", ");
          }
          choiceItemInner += audio + '" /><br />';
					choiceItemInner += 'Next: ';
					$choiceItem.html(choiceItemInner);
					var $choiceNextSelection = $('<select class="dialogChoiceNext dialogueSelection" id="dialogChoiceNext_' + activeDialogIndex + '_' + i + '"><option value="-1" selected="selected">None</option></select>');
					// Copy enabled options from dialog selection to this selection
					$("#dialogsView .dialogSelection > option:enabled").clone().appendTo($choiceNextSelection);
					$choiceNextSelection.prop("value", "-1");
					$choiceItem.append($choiceNextSelection);
					$choiceItem.append('<button class="dialogChoiceNextCreateButton">New</button> <input type="text" value="" class="dialogueSearch" placeholder="Search..." />');
					$("#dialogChoicesList").append($choiceItem);
					
					if (dialogs[activeDialogIndex].text[i].condition != undefined && dialogs[activeDialogIndex].text[i].condition != "") {
						$("#dialogChoiceCondition_" + activeDialogIndex + "_" + i).prop("value", dialogs[activeDialogIndex].text[i].condition);
					}
					// Hide current dialog from list
					if (activeDialogID != undefined) {
						$('#dialogChoiceNext_' + activeDialogIndex + '_' + i + ' > option[value="' + activeDialogID + '"]').hide();
					}
					if (dialogs[activeDialogIndex].text[i].next != undefined && dialogs[activeDialogIndex].text[i].next != "") {
						$choiceNextSelection.prop("value", dialogs[activeDialogIndex].text[i].next);
					}
				}
				if (dialogs[activeDialogIndex].text.length > 0) {
					$("#dialogChoiceNbr").html("(" + dialogs[activeDialogIndex].text.length + ")");
				}
			}
			else {
				$("#dialogNext").prop("disabled", false);
				$("#dialogNextDialogueSearch").prop("disabled", false);
				$("#dialogCreateNextButton").prop("disabled", false);
				$("#dialogAddConditionalNext").prop("disabled", false);
			}

			$("#dialogRoom").prop("value", "-1");
			if (dialogs[activeDialogIndex].room != undefined && dialogs[activeDialogIndex].room != "") {
				$("#dialogRoom").prop("value", dialogs[activeDialogIndex].room);
			}
			createSayerDropdown();
      
			$("#dialogSayer").prop("value", "-1");
			if (dialogs[activeDialogIndex].sayer != undefined && dialogs[activeDialogIndex].sayer != "") {
				$("#dialogSayer").prop("value", dialogs[activeDialogIndex].sayer);
			}
      createSpeechAnimationDropdown();
      $("#dialogSpeechAnimation").prop("value", "-1");
      if (dialogs[activeDialogIndex].speechAnimation != undefined && dialogs[activeDialogIndex].speechAnimation != "") {
				$("#dialogSpeechAnimation").prop("value", dialogs[activeDialogIndex].speechAnimation);
			}

      $("#dialogAudio").prop("value", "");
			if (dialogs[activeDialogIndex].audio != undefined && dialogs[activeDialogIndex].audio != "") {
        var audio = dialogs[activeDialogIndex].audio.join(", ");
				$("#dialogAudio").prop("value", audio);
			}
      
			// Show all options
			$('#dialogNext > option').show();
			$("#dialogNext").prop("value", "-1");
			// Hide current dialog from list
			if (activeDialogID != undefined) {
				$('#dialogNext > option[value="' + activeDialogID + '"]').hide();
			}
			if (dialogs[activeDialogIndex].next != undefined && jQuery.type(dialogs[activeDialogIndex].next) === 'array') {
				
				$("#dialogNext").prop("disabled", true);
				$("#dialogNextDialogueSearch").prop("disabled", true);
				$("#dialogCreateNextButton").prop("disabled", true);
				$("#dialogsAddChoice").prop("disabled", true);
				for (var i = 0; i < dialogs[activeDialogIndex].next.length; i++) {
					createConditionalNextItem(i);
				}
			}
			else if (dialogs[activeDialogIndex].next != undefined && dialogs[activeDialogIndex].next != "") {
				$("#dialogNext").prop("value", dialogs[activeDialogIndex].next);
				
			}
			
			// Make conditional next items and choices list sortable
			$('#dialogChoicesList, #dialogConditionalNextList').sortable({
				placeholder: "ui-state-highlight",
				cursor: "move",
				axis: "y",
				delay: 300,
				handle: ".sortable-handle",
				update: function(event,ui) {
					
					if ($(this).prop("id") == "dialogConditionalNextList") {
						
						var $nextItems = $("#dialogConditionalNextList > li");
						var newNextItemsList = jQuery.extend(true, [], dialogs[activeDialogIndex].next);
						for (var i = 0; i < $nextItems.length; i++) {
							var oldIndex = $($nextItems[i]).prop("id").replace("dialogConditionalNext_", "");
							var index = parseInt($($nextItems[i]).prop("id").replace("dialogConditionalNext_" + activeDialogIndex + "_", ""));
							dialogs[activeDialogIndex].next[i] = newNextItemsList[index];
							$($nextItems[i]).prop("id", "dialogConditionalNext_" + activeDialogIndex + "_" + i);
							
							$("#dialogConditionalNext_" + activeDialogIndex + "_" + i + " > #dialogConditionalNextCondition_" + oldIndex).prop("id", "dialogConditionalNextCondition_" + activeDialogIndex + "_" + i);
							$("#dialogConditionalNext_" + activeDialogIndex + "_" + i + " > #dialogConditionalNextSelection_" + oldIndex).prop("id", "dialogConditionalNextSelection_" + activeDialogIndex + "_" + i);
						}
					}
					else if ($(this).prop("id") == "dialogChoicesList") {
						var items = $("li.dialogChoice");
						var newChoiceList = jQuery.extend(true, [], dialogs[activeDialogIndex].text);
						for (var i = 0; i < items.length; i++) {
							var oldIndex = $(items[i]).prop("id").replace("dialogChoice_", "");
							var index = parseInt($(items[i]).prop("id").replace("dialogChoice_" + activeDialogIndex + "_", ""));
							dialogs[activeDialogIndex].text[i] = newChoiceList[index];
							$(items[i]).prop("id", "dialogChoice_" + activeDialogIndex + "_" + i);
							
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceText_" + oldIndex).prop("id", "dialogChoiceText_" + activeDialogIndex + "_" + i);
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceToggleCondition_" + oldIndex).prop("id", "dialogChoiceToggleCondition_" + activeDialogIndex + "_" + i);
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceCondition_" + oldIndex).prop("id", "dialogChoiceCondition_" + activeDialogIndex + "_" + i);
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoicePoints_" + oldIndex).prop("id", "dialogChoicePoints_" + activeDialogIndex + "_" + i);
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceAudio_" + oldIndex).prop("id", "dialogChoiceAudio_" + activeDialogIndex + "_" + i);
							$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceNext_" + oldIndex).prop("id", "dialogChoiceNext_" + activeDialogIndex + "_" + i);
						}
					}
					saveJSObjectAsJSON(dialogs, "json/dialogs.json");
					$("#dialogPath").empty();
					$("#dialogPathContainer .multiLinkContainer").remove();

					updateDialogPath("#dialogPath", "#dialogPathContainer");
				}
			});
			$('#dialogChoicesList a, #dialogChoicesList label, #dialogConditionalNextList a, #dialogConditionalNextList label').disableSelection();
			
			// Create actions lists
			if (dialogs[activeDialogIndex].defaultActions != undefined) {
				createDefaultActionsList(dialogs[activeDialogIndex].defaultActions, activeDialogIndex, "dialog");
			}
			if (dialogs[activeDialogIndex].conditionalActions != undefined) {
				createConditionalActionsList(dialogs[activeDialogIndex].conditionalActions, activeDialogIndex, "dialog");
			}
			
			$("#dialogInfo").show();
			if (dialogRefreshPath) {
				$("#dialogChainRootName").empty();
				$("#dialogChainRootNode").hide();
				$("#dialogChainNameEdit").prop("value", "");
				dialogRootNode = undefined;
				
				$("#dialogPath").empty();
				$("#dialogPathContainer .multiLinkContainer").remove();
				$("#dialogsView .dialogChainSelection").prop("value", "-1");
				$("#deleteDialogChainButton").prop("disabled", true);
				updateDialogPath("#dialogPath", "#dialogPathContainer");
			}
			dialogRefreshPath = true;
			updateDialogueSearch();
		}
	});
	
  $("#dialogSayer").change(function(e) {
    createSpeechAnimationDropdown();
    $("#dialogSpeechAnimation").prop("value", "-1");
  });
  
  function createSpeechAnimationDropdown() {
    
    $("#dialogSpeechAnimation").empty();
    $("#dialogSpeechAnimation").append('<option value="-1">None</option>');
    
    var sayer = $("#dialogSayer").prop("value");
    if (activeDialogIndex == undefined || sayer == "-1") {
			return;
		}
    var speechAnimations = [];
    misc.defaultCharacterId
    if (sayer == "you") {
      for (var cha in characters) {
        if (misc.defaultCharacterId == characters[cha].id) {
          speechAnimations = characters[cha].animations;
          break;
        }
      }
    }
    else {
      for (var cha in characters) {
        if (sayer == characters[cha].machineName) {
          speechAnimations = characters[cha].animations;
          break;
        }
      }
    }
    console.log(speechAnimations);
    for (var i = 0; i < speechAnimations.length; i++) {
      $("#dialogSpeechAnimation").append('<option value="' + speechAnimations[i].name + '">' + speechAnimations[i].name + '</option>');
    }
  }
  
	$("#dialogAddConditionalNext").click(function(e) {
		
		e.preventDefault();
		if (activeDialogIndex == undefined) {
			return;
		}
		$("#dialogNext, #dialogCreateNextButton, #dialogsAddChoice, #dialogNextDialogueSearch").prop("disabled", true);
		var index = 0;
		if (jQuery.type(dialogs[activeDialogIndex].next) === 'array') {
			index = dialogs[activeDialogIndex].next.length;
		}
		else {
			dialogs[activeDialogIndex].next = [];
		}
		createConditionalNextItem(index);
		
		var conditionalNext = {"dialogue": "", "condition": "", "gamestates": []};
		dialogs[activeDialogIndex].next.push(conditionalNext);
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
		refreshConditionAutocomplete();
		updateDialogueSearch();
	});
	
	$("body").on("click", ".dialogDeleteConditionalNextItem", function(e){
		
		e.preventDefault();
		var index = parseInt($(this).parent().prop("id").replace("dialogConditionalNext_" + activeDialogIndex + "_", ""));
		if (!confirm("Delete dialog " + dialogs[activeDialogIndex].id + " conditional next item"  + index + "?")) {
			return;
		}
		dialogs[activeDialogIndex].next.splice(index, 1);
		if (dialogs[activeDialogIndex].next.length == 0) {
			dialogs[activeDialogIndex].next = "";
			$("#dialogNext, #dialogCreateNextButton, #dialogsAddChoice, #dialogNextDialogueSearch").prop("disabled", false);
		}
		$(this).parent().remove();
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
		
		// Recreate ids
		var $nextItems = $("#dialogConditionalNextList > li");
		for (var i = 0; i < $nextItems.length; i++) {
			var oldIndex = $($nextItems[i]).prop("id").replace("dialogConditionalNext_", "");
			$($nextItems[i]).prop("id", "dialogConditionalNext_" + activeDialogIndex + "_" + i);
			
			$("#dialogConditionalNext_" + activeDialogIndex + "_" + i + " > #dialogConditionalNextCondition_" + oldIndex).prop("id", "dialogConditionalNextCondition_" + activeDialogIndex + "_" + i);
			$("#dialogConditionalNext_" + activeDialogIndex + "_" + i + " > #dialogConditionalNextSelection_" + oldIndex).prop("id", "dialogConditionalNextSelection_" + activeDialogIndex + "_" + i);
		}
		$("#dialogPath").empty();
		$("#dialogPathContainer .multiLinkContainer").remove();
		updateDialogPath("#dialogPath", "#dialogPathContainer");
	});
	
	$("#newDialogChainButton").click(function(e) {
		
		e.preventDefault();
		var name = $("#dialogChainName").prop("value");
		$("#dialogChainName").prop("value", "");
		var value = parseInt($("#dialogChainNode").prop("value"));
		if (value == 0) {
			$("#createDialogButton").click();
			value = misc.dialogId - 1;
		}
		$("#dialogChainNode").prop("value", "0");
		$("#dialogChainNode").change();
		
		var chain = {"id":misc.dialogChainId,"name":name,"startingNode":value};
		misc.dialogChains.push(chain);
		
		$("#dialogsView .dialogChainSelection").append('<option id="dialogChain_' + chain.id + '" value="' + chain.startingNode + '">(' + chain.startingNode + ') ' + chain.name + '</option>');
		$("#dialogsView .dialogChainSelection").prop("value", chain.startingNode);
		$("#dialogsView .dialogChainSelection").change();
		misc.dialogChainId++;
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
	});
	
	$("#deleteDialogChainButton").click(function(e) {
		
		var value = $("#dialogsView .dialogChainSelection").prop("value");
		var option = $('#dialogsView .dialogChainSelection > option[value="' + value + '"]');
		var id = parseInt($(option).prop("id").replace("dialogChain_", ""));
		
		var index = -1;
		for (var i = 0; i < misc.dialogChains.length; i++) {
			if (misc.dialogChains[i].id == id) {
				index = i;
				break;
			}
		}
		if (!confirm("Delete dialog chain " + misc.dialogChains[index].name + "?")) {
			return;
		}
		$("#dialogsView .dialogChainSelection").prop("value", "-1");
		$("#deleteDialogChainButton").prop("disabled", true);
		$(option).remove();
		misc.dialogChains.splice(index, 1);
		// Create json files
		saveJSObjectAsJSON(misc, "json/misc.json");
		$("#dialogChainRootName").empty();
		$("#dialogChainRootNode").hide();
		$("#dialogChainNameEdit").prop("value", "");
		dialogRootNode = undefined;
	});
	
	$("body").on("click", ".viewDialog", function(e){
		
		e.preventDefault();
		var dialogId = parseInt($(this).parent().prop("id").replace("dialogPathNode_", ""));
		$("#dialogsView .dialogSelection").prop("value", dialogId);
		$("#dialogsView .dialogSelection").change();
		$("#dialogsViewButton").click();
	});
	
	$("body").on("click", ".node .viewDialog", function(e){
		
		e.preventDefault();
		var dialogId = -1;
		if ($(this).parent().hasClass("notEditable")) {
			dialogId = parseInt($(this).text());
		}
		else {
			dialogId = parseInt($(this).parent().parent().prop("id").replace("dialogPathNode_", ""));
		}
		$("#dialogsView .dialogSelection").prop("value", dialogId);
		$("#dialogsView .dialogSelection").change();
		$("#dialogsViewButton").click();
	});
	
	$("#dialogFilterSelection").change(function(e) {
		
		dialogFilter = $(this).prop("value");
		generateDialogsViewSelection();
	});
	
	$("#dialogCreateNextButton").click(function(e) {
		
		e.preventDefault();
		$("#saveDialogButton").click();
		// Create new dialog and add it to chain
		dialogs[activeDialogIndex].next = misc.dialogId;
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");		
		$("#createDialogButton").click();
	});
	
	$("body").on("click", ".dialogChoiceNextCreateButton, .dialogConditionalNextCreateButton", function(e){
		
		e.preventDefault();
		$("#saveDialogButton").click();
		if ($(this).hasClass("dialogChoiceNextCreateButton")) {
			var index = parseInt($(this).parent().prop("id").replace("dialogChoice_" + activeDialogIndex + "_", ""));
			// Create new dialog and add it to choices
			dialogs[activeDialogIndex].text[index].next =  misc.dialogId;
			dialogs[activeDialogIndex].next = "";
		}
		else if ($(this).hasClass("dialogConditionalNextCreateButton")) {
			var index = parseInt($(this).parent().prop("id").replace("dialogConditionalNext_" + activeDialogIndex + "_", ""));
			// Create new dialog and add it to choices
			dialogs[activeDialogIndex].next[index].dialogue = misc.dialogId;
		}
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");		
		$("#createDialogButton").click();
	});
	
	$("#createDialogButton").click(function(e) {
		
		e.preventDefault();
		
		$("#dialogsView .dialogSelection, #dialogsView #dialogNext, #dialogsView .dialogChoiceNext, .dialogConditionalNext").append('<option id="dialog_' + dialogs.length + '" value="' + misc.dialogId + '">' + misc.dialogId + '</option>');
		$("#dialogChainNode, #assetDialogueId").append('<option value="' + misc.dialogId + '">' + misc.dialogId + '</option>');
		var dialog = {"id":misc.dialogId,"room":"","sayer":"","text":"","audio":"","next":"","defaultActions":[],"conditionalActions":[]};
		misc.dialogId++;
		
		dialogs.push(dialog);
		
		$("#dialogsView .dialogSelection").prop("value", dialog.id);
		$("#dialogsView .dialogSelection").change();
		
		// Create json files
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		
		updateDialogueSearch();
	});
	
	$("#deleteDialogButton").click(function(e) {
		
		e.preventDefault();
		if (!confirm("Delete dialog " + activeDialogID + "?")) {
			return;
		}
		dialogs.splice(activeDialogIndex, 1);
		deleteDialogReferences(activeDialogID);
		if (dialogs[activeDialogIndex - 1] != undefined) {
			activeDialogID = dialogs[activeDialogIndex - 1].id;
			activeDialogIndex = activeDialogIndex - 1;
			$("#dialogsView .dialogSelection").prop("value", activeDialogID);
		}
		else {
			activeDialogID = undefined;
			activeDialogIndex = undefined;
			$("#dialogsView .dialogSelection").prop("value", "-1");
		}
		generateDialogsViewSelection();
		$("#dialogsView .dialogSelection").change();
		// Create json files
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
	});
	
	$("#saveDialogButton").click(function(e) {
		
		e.preventDefault();
		// Check if there are choices
		if (jQuery.type(dialogs[activeDialogIndex].text) === 'array') {
			dialogs[activeDialogIndex].next = undefined;
			dialogs[activeDialogIndex].textOnTop = $("#dialogText").prop("value");
		}
		else {
			
			dialogs[activeDialogIndex].text = $("#dialogText").prop("value");
			dialogs[activeDialogIndex].textOnTop = undefined;
			
			if (jQuery.type(dialogs[activeDialogIndex].next) === 'array' && dialogs[activeDialogIndex].next.length > 0) {
				
				var $nextItems = $("#dialogConditionalNextList > li");
				for (var i = 0; i < $nextItems.length; i++) {
					
					var id = $($nextItems[i]).prop("id").replace("dialogConditionalNext_", "");
					dialogs[activeDialogIndex].next[i].condition = undefined;
					dialogs[activeDialogIndex].next[i].gamestates = undefined;
					dialogs[activeDialogIndex].next[i].dialogue = "";
			
					dialogs[activeDialogIndex].next[i].condition = $("#dialogConditionalNextCondition_" + id).prop("value").trim();
				
					var conditionStatesArray = getGameStatesFromCondition(dialogs[activeDialogIndex].next[i].condition);
					if (conditionStatesArray.length == 1 && conditionStatesArray[0].trim() == "") {
						conditionStatesArray = [];
					}
					for (var j = 0; j < conditionStatesArray.length; j++) {
						conditionStatesArray[j] = conditionStatesArray[j].trim();
					}
					dialogs[activeDialogIndex].next[i].gamestates = conditionStatesArray;
					
					if ($("#dialogConditionalNextSelection_" + id).prop("value") != "-1") {
						dialogs[activeDialogIndex].next[i].dialogue = parseInt($("#dialogConditionalNextSelection_" + id).prop("value"));
					}
				}
			}
			else {
				
				dialogs[activeDialogIndex].next = "";
				if ($("#dialogNext").prop("value") != "-1") {
					dialogs[activeDialogIndex].next = parseInt($("#dialogNext").prop("value"));
				}
			}
		}
		// Get choices and save those
		var $choices = $("li.dialogChoice");
		
		$("#dialogChoiceNbr").html("");
		if ($choices.length > 0) {
			$("#dialogChoiceNbr").html("(" + $choices.length + ")");
		}
		
		for (var i = 0; i < $choices.length; i++) {
			
			var id = $($choices[i]).prop("id").replace("dialogChoice_", "");
			dialogs[activeDialogIndex].text[i].text = $("#dialogChoiceText_" + id).prop("value");
			dialogs[activeDialogIndex].text[i].condition = undefined;
			dialogs[activeDialogIndex].text[i].gamestates = undefined;
			if ($("#dialogChoiceToggleCondition_" + id).prop("checked") && $("#dialogChoiceCondition_" + id).prop("value").trim() != "") {
				dialogs[activeDialogIndex].text[i].condition = $("#dialogChoiceCondition_" + id).prop("value").trim();
				
				var conditionStatesArray = getGameStatesFromCondition(dialogs[activeDialogIndex].text[i].condition);
				if (conditionStatesArray.length == 1 && conditionStatesArray[0].trim() == "") {
					conditionStatesArray = [];
				}
				for (var j = 0; j < conditionStatesArray.length; j++) {
					conditionStatesArray[j] = conditionStatesArray[j].trim();
				}
				dialogs[activeDialogIndex].text[i].gamestates = conditionStatesArray;
			}
			dialogs[activeDialogIndex].text[i].points = "";
			if ($("#dialogChoicePoints_" + id).prop("value").trim() != "") {
				dialogs[activeDialogIndex].text[i].points = parseInt($("#dialogChoicePoints_" + id).prop("value"));
			}
      dialogs[activeDialogIndex].text[i].audio = "";
      var audio = $("#dialogChoiceAudio_" + id).prop("value").trim().split(",");
      for (var a = 0; a < audio.length; a++) {
        audio[a] = audio[a].trim();
      }
      if (audio.length > 0 && audio[0] != "") {
        dialogs[activeDialogIndex].text[i].audio = audio;
      }
			dialogs[activeDialogIndex].text[i].next = "";
			if ($("#dialogChoiceNext_" + id).prop("value") != "-1") {
				dialogs[activeDialogIndex].text[i].next = parseInt($("#dialogChoiceNext_" + id).prop("value"));
			}
		}
		dialogs[activeDialogIndex].room = "";
		if ($("#dialogRoom").prop("value") != "-1") {
			dialogs[activeDialogIndex].room = $("#dialogRoom").prop("value");
		}
		dialogs[activeDialogIndex].sayer = undefined;
		if ($("#dialogSayer").prop("value") != "-1") {
			dialogs[activeDialogIndex].sayer = $("#dialogSayer").prop("value");
		}
    dialogs[activeDialogIndex].speechAnimation = undefined;
		if ($("#dialogSpeechAnimation").prop("value") != "-1") {
			dialogs[activeDialogIndex].speechAnimation = $("#dialogSpeechAnimation").prop("value");
		}
    
    dialogs[activeDialogIndex].audio = "";
    var audio = $("#dialogAudio").prop("value").trim().split(",");
    for (var i = 0; i < audio.length; i++) {
      audio[i] = audio[i].trim();
    }
    if (audio.length > 0 && audio[0] != "") {
      dialogs[activeDialogIndex].audio = audio;
    }
    
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
		$("#dialogsView .dialogSelection").change();
	});
	
	$("#dialogChoicesList").on("change", ".toggleChoiceCondition", function() {
		
		var id = $(this).prop("id").replace("dialogChoiceToggleCondition_", "");
		if (this.checked) {
			$("#dialogChoiceCondition_" + id).prop("disabled", false);
		}
		else {
			$("#dialogChoiceCondition_" + id).prop("disabled", true);
		}
	});
	
	$("#dialogsAddChoice").click(function(e) {
		
		e.preventDefault();
		
		var index = 0;
		if (jQuery.type(dialogs[activeDialogIndex].text) === 'array') {
			index = dialogs[activeDialogIndex].text.length;
		}
		else {
			dialogs[activeDialogIndex].textOnTop = dialogs[activeDialogIndex].text;
			dialogs[activeDialogIndex].text = [];
		}
		$("#dialogCreateNextButton").prop("disabled", true);
		$("#dialogNext").prop("disabled", true);
		$("#dialogNextDialogueSearch").prop("disabled", true);
		$("#dialogAddConditionalNext").prop("disabled", true);
		$("#dialogConditionalNextList").empty();
		dialogs[activeDialogIndex].next = "";
		
		var $choiceItem = $('<li class="dialogChoice" id="dialogChoice_' + activeDialogIndex + '_' + index + '"></li>');
		var choiceItemInner = '<span class="sortable-handle"></span> Text: <input type="text" class="dialogChoiceText" id="dialogChoiceText_' + activeDialogIndex + '_' + index + '" value="" /> <button class="dialogsDeleteChoice">X</button><br />';
		choiceItemInner += '<input type="checkbox" id="dialogChoiceToggleCondition_' + activeDialogIndex + '_' + index + '" class="toggleChoiceCondition" /> Condition: <input type="text" value="" id="dialogChoiceCondition_' + activeDialogIndex + '_' + index + '" class="dialogChoiceCondition" disabled="disabled" /><br />';
		choiceItemInner += 'Points: <input type="text" id="dialogChoicePoints_' + activeDialogIndex + '_' + index + '" value="" /> ';
		choiceItemInner += 'Audio: <input type="text" id="dialogChoiceAudio_' + activeDialogIndex + '_' + index + '" value="" /><br />';
		choiceItemInner += 'Next: ';
		$choiceItem.html(choiceItemInner);
		
		var $choiceNextSelection = $('<select class="dialogChoiceNext dialogueSelection" id="dialogChoiceNext_' + activeDialogIndex + '_' + index + '"><option value="-1" selected="selected">None</option></select>');
		// Copy enabled options from dialog selection to this selection
		$("#dialogsView .dialogSelection > option:enabled").clone().appendTo($choiceNextSelection);
		$choiceNextSelection.prop("value", "-1");
		$choiceItem.append($choiceNextSelection);
		$choiceItem.append('<button class="dialogChoiceNextCreateButton">New</button>  <input type="text" value="" class="dialogueSearch" placeholder="Search..." />');
		$("#dialogChoicesList").append($choiceItem);
		// Hide current dialog from list
		if (activeDialogID != undefined) {
			$('#dialogChoiceNext_' + activeDialogIndex + '_' + index + ' > option[value="' + activeDialogID + '"]').hide();
		}
		
		var choice = {"text":"","points":"","audio":"","next":""};
		dialogs[activeDialogIndex].text.push(choice);
		$("#saveDialogButton").click();
		// Create json file
		//saveJSObjectAsJSON(dialogs, "json/dialogs.json");
	});
	
	$("#dialogPathContainer").on("mouseenter", ".node:not(.node_editable,#dialogChainRootNode,.notEditable,.multiLinkRoot)", function(e){
		
		e.stopPropagation();
		$(".dialogDeleteNode, .dialogAddNode").remove();
		$(this).prepend('<span class="dialogDeleteNode">X</span>');
		
		if (checkIfDialogPathAddNode($(this).parent().prop("id"))) {
			$(this).append('<span class="dialogAddNode">+</span>');
		}
	});
	
	$("#dialogPathContainer").on("mouseleave", ".node", function(e){
		$(this).find(".dialogDeleteNode, .dialogAddNode").remove();
	});
	
	$("#dialogPathContainer").on("click", ".dialogAddNode", function(e){
		
		e.preventDefault();
		e.stopPropagation();
		var id = $(this).parent().parent().prop("id");
		addDialogPathNode(id);
	});
	
	$("#dialogPathContainer").on("click", ".dialogDeleteNode", function(e){
		
		e.preventDefault();
		e.stopPropagation();
		var id = $(this).parent().parent().prop("id");
		deleteDialogPathNode(id);
	});
	
	$("body").on("click", ".dialogsDeleteChoice", function(e){
		
		e.preventDefault();
		var index = parseInt($(this).parent().prop("id").replace("dialogChoice_" + activeDialogIndex + "_", ""));
		if (!confirm("Delete dialog " + dialogs[activeDialogIndex].id + " " + (index + 1) + ". choice?")) {
			return;
		}
		dialogs[activeDialogIndex].text.splice(index, 1);
		if (dialogs[activeDialogIndex].text.length == 0) {
			dialogs[activeDialogIndex].text = dialogs[activeDialogIndex].textOnTop;
			dialogs[activeDialogIndex].textOnTop = undefined;
			dialogs[activeDialogIndex].next = "";
			$("#dialogNext").prop("disabled", false);
			$("#dialogNextDialogueSearch").prop("disabled", false);
			$("#dialogCreateNextButton").prop("disabled", false);
			$("#dialogAddConditionalNext").prop("disabled", false);
		}
		$(this).parent().remove();
		// Create json file
		saveJSObjectAsJSON(dialogs, "json/dialogs.json");
		$("#dialogsView .dialogSelection").change();
		return;
		// Recreate ids
		var $choices = $("li.dialogChoice");
		for (var i = 0; i < $choices.length; i++) {
			var oldIndex = $($choices[i]).prop("id").replace("dialogChoice_", "");
			$($choices[i]).prop("id", "dialogChoice_" + activeDialogIndex + "_" + i);
			
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceText_" + oldIndex).prop("id", "dialogChoiceText_" + activeDialogIndex + "_" + i);
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceToggleCondition_" + oldIndex).prop("id", "dialogChoiceToggleCondition_" + activeDialogIndex + "_" + i);
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceCondition_" + oldIndex).prop("id", "dialogChoiceCondition_" + activeDialogIndex + "_" + i);
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoicePoints_" + oldIndex).prop("id", "dialogChoicePoints_" + activeDialogIndex + "_" + i);
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceAudio_" + oldIndex).prop("id", "dialogChoiceAudio_" + activeDialogIndex + "_" + i);
			$("#dialogChoice_" + activeDialogIndex + "_" + i + " #dialogChoiceNext_" + oldIndex).prop("id", "dialogChoiceNext_" + activeDialogIndex + "_" + i);
		}
		$("#dialogChoiceNbr").html("");
		if ($choices.length > 0) {
			$("#dialogChoiceNbr").html("(" + $choices.length + ")");
		}
	});
	
	function createDialogPath(dialogId, element, children) {
		
		var $node;
		// Get next dialog items
		if (children) {
			
			var dialogIndex = -1;
			// Get dialog index
			for (var i = 0; i < dialogs.length; i++) {
				if (dialogs[i].id == dialogId) {
					dialogIndex = i;
					break;
				}
			}
			if (dialogIndex == -1) {
				return element;
			}
			var hoverText = "";
			if (jQuery.type(dialogs[dialogIndex].text) === 'string') {
				hoverText = dialogs[dialogIndex].text;
			}
			else if (jQuery.type(dialogs[dialogIndex].text) === 'array' && dialogs[dialogIndex].textOnTop != undefined) {
				hoverText = dialogs[dialogIndex].textOnTop;
			}
			var nod = '<li id="dialogPathNode_' + dialogId + '" class="dialogPathNode children__item"><div class="node">';
			nod += '<a class="viewDialog" href="" title="' + hoverText + '">' + dialogId + '</a>';
			nod += ' <span class="node__text">' + hoverText + '</span><input type="text" class="node__input" /></div>';
			nod += '</li>';
			$node = $(nod).appendTo(element);
			var $nextItems = $('<ul class="nextItems children"></ul>').appendTo($node);
			
			if (jQuery.type(dialogs[dialogIndex].text) === 'array') {
				for (var i = 0; i < dialogs[dialogIndex].text.length; i++) {
					
					var nod2 = '<li id="dialogPathChoice_' + dialogId + '_' + i +'" class="dialogPathChoice dialogPathNode children__item"><div class="node">';
					nod2 += '<strong>' + dialogId + '.' + i + '</strong>';
					nod2 += ' <span class="node__text">' + dialogs[dialogIndex].text[i].text + '</span><input type="text" class="node__input" /></div>';
					nod2 += '</li>';
					$node2 = $(nod2).appendTo($nextItems);
					var $nextItems2 = $('<ul class="nextItems children"></ul>').appendTo($node2);
					
					if (dialogs[dialogIndex].text[i].next != undefined && dialogs[dialogIndex].text[i].next != "") {
						createDialogPath(dialogs[dialogIndex].text[i].next, $nextItems2, children);
					}
				
				}
			}
			else if (dialogs[dialogIndex].next != undefined && jQuery.type(dialogs[dialogIndex].next) === 'array') {
				
				for (var i = 0; i < dialogs[dialogIndex].next.length; i++) {
					
					var nod2 = '<li id="dialogPathConditionalNext_' + dialogId + '_' + i +'" class="dialogPathConditionalNext dialogPathNode children__item"><div class="node">';
					nod2 += '<strong>' + dialogId + '.' + i + '</strong>';
					nod2 += ' <span class="node__text">' + dialogs[dialogIndex].next[i].condition + '</span><input type="text" class="node__input" /></div>';
					nod2 += '</li>';
					$node2 = $(nod2).appendTo($nextItems);
					var $nextItems2 = $('<ul class="nextItems children"></ul>').appendTo($node2);
					
					if (dialogs[dialogIndex].next[i].dialogue != undefined && dialogs[dialogIndex].next[i].dialogue != "") {
						createDialogPath(dialogs[dialogIndex].next[i].dialogue, $nextItems2, children);
					}
				}
			}
			else {
				if (dialogs[dialogIndex].next != undefined && dialogs[dialogIndex].next != "") {
					createDialogPath(dialogs[dialogIndex].next, $nextItems, children);
				}
			}
		}
		// Get previous dialog items
		else {
			// Find previous
			var parents = [];
			for (var i = 0; i < dialogs.length; i++) {
				if (dialogs[i].next != undefined && jQuery.type(dialogs[i].text) === 'string') {
					
					if (jQuery.type(dialogs[i].next) == 'array') {
						for (var j = 0; j < dialogs[i].next.length; j++) {
							if (dialogs[i].next[j].dialogue != "" && parseInt(dialogs[i].next[j].dialogue) == dialogId) {
								parents.push({ id: dialogs[i].id, index: i });
								break;
							}
						}
					}
					else {
						if (dialogs[i].next != "" && parseInt(dialogs[i].next) == dialogId) {
							parents.push({ id: dialogs[i].id, index: i });
						}
					}
				}
				else if (jQuery.type(dialogs[i].text) === 'array') {
					
					for (var j = 0; j < dialogs[i].text.length; j++) {
						
						if (dialogs[i].text[j].next != undefined && dialogs[i].text[j].next != "" && parseInt(dialogs[i].text[j].next) == dialogId) {
							parents.push({ id: dialogs[i].id, index: i });
						}
					}
				}
			}
			if (!parents.length) {
				return element;
			}
			
			for (var i = 0; i < parents.length; i++) {
				
				var nod = '<li id="dialogPathNode_' + parents[i].id + '" class="dialogPathNode children__item"><div class="node">';
				var hoverText = "";
				if (jQuery.type(dialogs[parents[i].index].text) === 'string') {
					hoverText = dialogs[parents[i].index].text;
				}
				else if (jQuery.type(dialogs[parents[i].index].text) === 'array' && dialogs[parents[i].index].textOnTop != undefined) {
					hoverText = dialogs[parents[i].index].textOnTop;
				}
				nod += '<a class="viewDialog" href="" title="' + hoverText + '">' + parents[i].id + '</a>';
				nod += ' <span class="node__text">' + hoverText + '</div><input type="text" class="node__input" /></span>';
				nod += '</li>';
				$node = $(nod);
				var $nextItems = $('<ul class="nextItems children"></ul>').appendTo($node);
				if (i < 1) {
					element.appendTo($nextItems);
				}
				$node = createDialogPath(parents[i].id, $node, children);
			}
		}
		return $node;
	}
	
	function updateDialogPath(pathSelector, container, nodeId) {
		
		if (nodeId == undefined) {
			nodeId = activeDialogID;
		}
		var $rootNode = $(pathSelector);
		// Get child dialogs
		var children = createDialogPath(nodeId, $rootNode, true);
		
		// Get first node and check if it starts dialog chain
		if (container == "#dialogPathContainer") {
			// Get parent dialogs
			var parents = createDialogPath(nodeId, children, false);
			//$rootNode.append(parents);
			var rootId = parseInt(parents.prop("id").replace("dialogPathNode_", ""));
			if (rootId != undefined) {
				// Create dialog path starting from root item
				$(pathSelector).empty();	
				var path = createDialogPath(rootId, $rootNode, true);
				$rootNode.append(path);
				$(container).mindmap('destroy');
				$(container).mindmap();
				
				for (var i = 0; i < misc.dialogChains.length; i++) {
					if (misc.dialogChains[i].startingNode == rootId) {
						
						$("#dialogChainRootName").html(misc.dialogChains[i].name);
						$("#dialogChainRootNode").show();
						$("#dialogChainNameEdit").prop("value", misc.dialogChains[i].name);
						//dialogRootNode = rootId;
						$("#dialogsView .dialogChainSelection").prop("value", rootId);
						$("#deleteDialogChainButton").prop("disabled", false);
						break;
					}
				}
			}
		}
		else if (container != undefined) {
			
			// Create dialog path starting from root item
			$(pathSelector).empty();	
			var path = createDialogPath(nodeId, $rootNode, true);
			$rootNode.append(path);
			$(container).mindmap('destroy');
			$(container).mindmap();
		}
		// Check if there are multiple connections to some nodes
		var dialogItems = [];
		var itemReferences = [];
		var dialogNodes = $(pathSelector + " .dialogPathNode");

		for (var i = 0; i < dialogNodes.length; i++) {
			var id = $(dialogNodes[i]).prop("id");
			// Leave choices out of this
			if (id.indexOf("dialogPathNode") != -1) {
				// Get all item ids into array and nbr of references too
				var identifier = id.replace("dialogPathNode_", "");
				var index = dialogItems.indexOf(identifier);
				if (index != -1) {
					itemReferences[index]++;
				}
				else {
					dialogItems.push(identifier);
					itemReferences.push(1);
				}
			}
		}
		for (var i = 0; i < itemReferences.length; i++) {
			if (itemReferences[i] > 1) {
				// Remove references under this node
				var childNodes = $(pathSelector + " #dialogPathNode_" + dialogItems[i] + " ul .dialogPathNode");
				for (var j = 0; j < childNodes.length; j++) {
					var id = $(childNodes[j]).prop("id");
					if (id.indexOf("dialogPathNode") != -1) {
						var identifier = id.replace("dialogPathNode_", "");
						var index = dialogItems.indexOf(identifier);
						if (index != -1) {
							itemReferences[index]--;
						}
					}
				}
				while (itemReferences[i] > 0) {
					$(pathSelector + " #dialogPathNode_" + dialogItems[i] + " .node__input, " + pathSelector + " #dialogPathNode_" + dialogItems[i] + " .node__text, " + pathSelector + " #dialogPathNode_" + dialogItems[i] + " ul").remove();
					$(pathSelector + " #dialogPathNode_" + dialogItems[i] + " .node").addClass("notEditable");
					$(pathSelector + " #dialogPathNode_" + dialogItems[i]).prop("id", "");
					itemReferences[i]--;
				}
				var multiLinkContainer = '<div class="multiLinkContainer" id="multiNode_' + dialogItems[i] + '"><div class="multiLinkRoot node node_root"><span class="node__text" id="">' + dialogItems[i] + '</span></div>';
				multiLinkContainer += '<ul id="multiLinkPath_' + dialogItems[i] + '" class="multiLinkPath children children_rightbranch"></ul></div>';
				$("#dialogPathContainer").append(multiLinkContainer);
				updateDialogPath("#multiLinkPath_" + dialogItems[i], "#multiNode_" + dialogItems[i], parseInt(dialogItems[i]));
				
				$("#multiLinkPath_" + dialogItems[i]).off("click", ".dialogAddNode");
				$("#multiLinkPath_" + dialogItems[i]).on("click", ".dialogAddNode", function(e){
		
					e.preventDefault();
					e.stopPropagation();
					
					var id = $(this).parent().parent().prop("id");
					addDialogPathNode(id);
					return false;
				});
				$("#multiLinkPath_" + dialogItems[i]).off("click", ".dialogDeleteNode");
				$("#multiLinkPath_" + dialogItems[i]).on("click", ".dialogDeleteNode", function(e){
					e.preventDefault();
					e.stopPropagation();

					var id = $(this).parent().parent().prop("id");
					deleteDialogPathNode(id);
					return false;
				});
			}
		}
		refreshConditionAutocomplete();
	}
	
	function createConditionalNextItem(index) {
		
		var condition = "";
		var nextId = "-1";
		if (dialogs[activeDialogIndex].next != undefined && dialogs[activeDialogIndex].next[index] != undefined) {
			condition = dialogs[activeDialogIndex].next[index].condition;
			nextId = dialogs[activeDialogIndex].next[index].dialogue;
		}
		var $nextItem = $('<li id="dialogConditionalNext_' + activeDialogIndex + '_' + index + '"></li>');
		var nextItemInner = 'Condition: <input type="text" value="" id="dialogConditionalNextCondition_' + activeDialogIndex + '_' + index + '" class="dialogConditionalNextCondition" />';
		nextItemInner += ' <span class="sortable-handle"></span> <button class="dialogDeleteConditionalNextItem">X</button><br />Next: ';
		$nextItem.append(nextItemInner);
		var $conditionalNextSelection = $('<select class="dialogConditionalNext dialogueSelection" id="dialogConditionalNextSelection_' + activeDialogIndex + '_' + index + '"><option value="-1" selected="selected">None</option></select>');
		// Copy enabled options from dialog selection to this selection
		$("#dialogsView .dialogSelection > option:enabled").clone().appendTo($conditionalNextSelection);
		$nextItem.append($conditionalNextSelection);
		$nextItem.append('<button class="dialogConditionalNextCreateButton">New</button>  <input type="text" value="" class="dialogueSearch" placeholder="Search..." />');
		$("#dialogConditionalNextList").append($nextItem);
		$("#dialogConditionalNextCondition_" + activeDialogIndex + "_" + index).prop("value", condition);
		$conditionalNextSelection.prop("value", nextId.toString());
		// Hide current dialog from list
		if (activeDialogID != undefined) {
			$('#dialogConditionalNextSelection_' + activeDialogIndex + '_' + index + ' > option[value="' + activeDialogID + '"]').hide();
		}
	}
	
	function generateDialogFilterSelection() {
		
		$("#dialogFilterSelection").empty();
		$("#dialogFilterSelection").append('<option value="-1" selected="selected">Show All</option>');
		
		for (var i = 0; i < rooms.length; i++) {
			$("#dialogFilterSelection").append('<option value="' + rooms[i].name + '">' + rooms[i].name + '</option>');
		}
		// If some room is active, select that
		if (dialogFilter != undefined) {
			$("#dialogFilterSelection").prop("value", dialogFilter);
			$("#dialogFilterSelection").change();
		}
	}
	
	function generateDialogsViewSelection() {
		
		$("#dialogsView .dialogSelection, #dialogsView .dialogChainSelection, #dialogChainNode, #assetDialogueId").empty();
		$("#dialogsView .dialogSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Dialog</option>');
		$("#dialogsView .dialogChainSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Chain</option>');
		$("#dialogChainNode").append('<option value="0" selected="selected">New</option>');
		$("#assetDialogueId").append('<option value="-1" selected="selected">None</option>');
		
		var visibleChains = [];
		
		for (var i = 0; i < dialogs.length; i++) {
			var addDialog = false;
			if (dialogFilter == undefined || dialogFilter == "-1") {
				addDialog = true;
			}
			else if (dialogs[i].room != undefined && dialogs[i].room == dialogFilter) {
				addDialog = true;
			}
			if (addDialog) {
				$("#dialogsView .dialogSelection").append('<option id="dialog_' + i + '" value="' + dialogs[i].id + '">' + dialogs[i].id + '</option>');
				$("#dialogChainNode").append('<option value="' + dialogs[i].id + '">' + dialogs[i].id + '</option>');
				// Check if dialog is starting node of a chain
				for (var j = 0; j < misc.dialogChains.length; j++) {
					if (misc.dialogChains[j].startingNode == dialogs[i].id) {
						visibleChains.push(misc.dialogChains[j]);
						break;
					}
				}
			}
			$("#assetDialogueId").append('<option value="' + dialogs[i].id + '">' + dialogs[i].id + '</option>');
		}
		
		// Sort dialog chains
		visibleChains.sort(function(a, b){
			if (a.name < b.name) {
				return -1;
			}
			return 1;
		});
		for (var i = 0; i < visibleChains.length; i++) {
			$("#dialogsView .dialogChainSelection").append('<option id="dialogChain_' + visibleChains[i].id + '" value="' + visibleChains[i].startingNode + '">(' + visibleChains[i].startingNode + ') ' + visibleChains[i].name + '</option>');
		}
		// Generate dialog rooms
		$("#dialogRoom").empty();
		$("#dialogRoom").append('<option value="-1" selected="selected">None</option>');
		for (var i = 0; i < rooms.length; i++) {
			$("#dialogRoom").append('<option value="' + rooms[i].name + '">' + rooms[i].name + '</option>');
		}
		if (activeDialogIndex != undefined && dialogs[activeDialogIndex] != undefined && dialogs[activeDialogIndex].room != undefined && dialogs[activeDialogIndex].room != "") {
			$("#dialogRoom").prop("value", dialogs[activeDialogIndex].room);
		}
		// Generate next selection
		$("#dialogNext").empty();
		$("#dialogNext").append('<option value="-1" selected="selected">None</option>');
		// Copy enabled options from dialog selection to this selection
		$("#dialogsView .dialogSelection > option:enabled").clone().insertAfter("#dialogNext > option:last");
		
		// If some room is active, select that
		if (activeDialogID != undefined) {
			$("#dialogsView .dialogSelection").prop("value", activeDialogID);
			$("#dialogsView .dialogSelection").change();
		}
		updateDialogueSearch();
	}
	
	function updateDialogueSearch() {
		
		dialogueSearch = [];
		// Create search
		for (var i = 0; i < dialogs.length; i++) {
			
			if (dialogs[i].textOnTop != undefined && jQuery.type(dialogs[i].text) === "array" && dialogs[i].textOnTop != "") {
				dialogueSearch.push({value:dialogs[i].id, label:dialogs[i].textOnTop});
			}
			else if (jQuery.type(dialogs[i].text) === "string" && dialogs[i].text != "") {
				dialogueSearch.push({value:dialogs[i].id, label:dialogs[i].text});
			}
		}
		
		$(".dialogueSearch").autocomplete({
			source: dialogueSearch,
			focus: function(event, ui) {
				// prevent autocomplete from updating the textbox
				event.preventDefault();
				// manually update the textbox
				$(this).val("(" + ui.item.value + ") " + ui.item.label);
			},
			select: function(event, ui) {
				// prevent autocomplete from updating the textbox
				event.preventDefault();
				$(this).val("");
				var optionToSelect = $(this).parent().find(' > .dialogueSelection > option[value="' + ui.item.value + '"]');
				if (optionToSelect != undefined && optionToSelect.length && optionToSelect.css('display') != "none") {
					$(this).parent().find(".dialogueSelection").val(ui.item.value);
					$(this).parent().find(".dialogueSelection").change();
				}
				else {
					alert("Selected dialogue is unavailable from the current selection.");
				}
			}
		});
		$(".launchDialogueAutocomplete").autocomplete({
			source: dialogueSearch
		});
	}
	
	/***********************************************
	* SOUNDS VIEW
	***********************************************/
	// Initialize sounds view
	updateGeneralAudio();
	updateAudioSprites();
			
	$("#newAudioSpriteButton").click( function(e) {
		
		e.preventDefault();
		
		var name = $("#audioSpriteName").prop("value").trim();
		var urls = $("#audioSpriteURLs").prop("value").trim().split(",");
		for (var i = 0; i < urls.length; i++) {
			urls[i] = urls[i].trim();
		} 
		var JSON = $("#audioSpriteJSON").prop("value").trim();
		
		var newAudioSprite = [name, urls, JSON];
		sounds.audioSprites.push(newAudioSprite);
		// Create json file
		saveJSObjectAsJSON(sounds, "json/sounds.json");
		
		updateAudioSprites();
		
		$("#audioSpriteName").prop("value", "");
		$("#audioSpriteURLs").prop("value", "");
		$("#audioSpriteJSON").prop("value", "");
	});
	
	$("#audioSpritesList").on("click", ".deleteAudioSpriteButton", function(e) {
		
		e.preventDefault();

		var index = parseInt($(this).parent().prop("id").replace("audioSprite_", ""));
		
		if (!confirm("Delete audio sprite " + sounds.audioSprites[index][0] + "?")) {
			return;
		}
		sounds.audioSprites.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(sounds, "json/sounds.json");
		updateAudioSprites();
	});
	
	$("#newNormalAudioButton").click( function(e) {
		
		e.preventDefault();
		
		var name = $("#normalAudioName").prop("value").trim();
		var files = $("#normalAudioFiles").prop("value").trim().split(",");
		for (var i = 0; i < files.length; i++) {
			files[i] = files[i].trim();
		} 
		
		var newAudio = [name, files];
		sounds.general.push(newAudio);
		// Create json file
		saveJSObjectAsJSON(sounds, "json/sounds.json");
		
		updateGeneralAudio();
		
		$("#normalAudioName").prop("value", "");
		$("#normalAudioFiles").prop("value", "");
	});
	
	$("#normalAudiosList").on("click", ".deleteAudioButton", function(e) {
		
		e.preventDefault();

		var index = parseInt($(this).parent().prop("id").replace("audio_", ""));
		
		if (!confirm("Delete audio file " + sounds.general[index][0] + "?")) {
			return;
		}
		sounds.general.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(sounds, "json/sounds.json");
		updateGeneralAudio();
	});
	
	/***********************************************
	* SPRITE ATLASES VIEW
	***********************************************/
	// Initialize sprite atlases view
	updateSpriteAtlases();
			
	$("#newSpriteAtlasButton").click( function(e) {
		
		e.preventDefault();
		
		var name = $("#spriteAtlasName").prop("value").trim();
		var spritesheet = $("#spriteAtlasSpritesheet").prop("value").trim();
		var atlasJSON = $("#spriteAtlasJSON").prop("value").trim();
		
		var newAtlas = [name, spritesheet, atlasJSON];
		spriteAtlases.push(newAtlas);
		// Create json file
		saveJSObjectAsJSON(spriteAtlases, "json/spriteAtlases.json");
		
		updateSpriteAtlases();
		
		$("#spriteAtlasName").prop("value", "");
		$("#spriteAtlasSpritesheet").prop("value", "");
		$("#spriteAtlasJSON").prop("value", "");
	});
	
	$("#spriteAtlasesList").on("click", ".deleteSpriteAtlasButton", function(e) {
		
		e.preventDefault();

		var index = parseInt($(this).parent().prop("id").replace("spriteAtlas_", ""));
		
		if (!confirm("Delete sprite atlas " + spriteAtlases[index][0] + "?")) {
			return;
		}
		spriteAtlases.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(spriteAtlases, "json/spriteAtlases.json");
		updateSpriteAtlases();
	});
	
	/***********************************************
	* GAMESTATES VIEW
	***********************************************/
	$("#newGamestateButton").click( function(e) {
		
		e.preventDefault();
		
		var name = $("#gamestateName").prop("value").trim();
		var type = $("#gamestateType").prop("value");
		var value = $("#gamestateValue").prop("value").trim();
		
		if (value == "true") {
			value = true;
		}
		else if (value == "false") {
			value = false;
		}
		else if (!isNaN(value)) {
			value = parseFloat(value);
		}
		var createNew = true;
		for (var i = 0; i < gamestates.length; i++) {
			if ((name == "activeRoom" && gamestates[i].name == "activeRoom") || (name == "money" && gamestates[i].name == "money")) {
				createNew = false;
				gamestates[i].type = type;
				gamestates[i].value = value;
				break;
			}
		}
		if (createNew) {
			var newState = {"id":misc.gameStateId,"name":name,"type":type,"value":value};
			gamestates.push(newState);
			misc.gameStateId++;
			saveJSObjectAsJSON(misc, "json/misc.json");
		}
		// Create json files
		saveJSObjectAsJSON(gamestates, "json/gamestates.json");
		
		updateGamestates();
		
		$("#gamestateName").prop("value", "");
		$("#gamestateType").prop("value", "mixed");
		$("#gamestateValue").prop("value", "");
	});
	
	$("body").on("click", ".deleteGamestateButton", function(e) {
		
		e.preventDefault();

		var id = parseInt($(this).parent().prop("id").replace("gamestate_", ""));
		var index = -1;
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].id == id) {
				index = i;
				break;
			}
		}
		if (index == -1) {
			return;
		}
		if (!confirm("Delete game state " + gamestates[index].name + "?")) {
			return;
		}
		gamestates.splice(index, 1);
		
		// Create json file
		saveJSObjectAsJSON(gamestates, "json/gamestates.json");
		// Remove item
		//$(this).parent().remove();
		updateGamestates();
	});
	
	/***********************************************
	* CHARACTERS VIEW
	***********************************************/
	// Initialize assets view
	generateCharactersViewSelection();
	$("#charactersView .characterSelection").prop("value", "-1");
	$("#deleteCharacterButton").prop("disabled", true);
	$("#saveCharacterButton").prop("disabled", true);
	$("#createCharacterButton").prop("disabled", false);
	$("#duplicateCharacterButton").prop("disabled", true);
	
	$("#characterAddDefaultAction").prop("disabled", true);
	$("#characterAddConditionalAction").prop("disabled", true);
	$("#characterAddDefaultActionSelect, #characterAddConditionalActionSelect").prop("value", "-1");
	$("#characterInfo").hide();
	
	$("#characterAccordion").accordion({
		collapsible: true,
		heightStyle: "content"
	});
	
	// Select character
	$("#charactersView .characterSelection").change(function() {
		
		activeCharacterID = $(this).val();
		activeCharacterIndex = undefined;
		$("#characterInfo").hide();
		$("#deleteCharacterButton").prop("disabled", true);
		$("#saveCharacterButton").prop("disabled", true);
		$("#duplicateCharacterButton").prop("disabled", true);
		$("#characterAddDefaultAction").prop("disabled", true);
		$("#characterAddConditionalAction").prop("disabled", true);
    $("#characterAddAnimation").prop("disabled", true);
		$("#characterAddDefaultActionSelect, #characterAddConditionalActionSelect").prop("value", "-1");
		
		$("#characterAnimationsList").empty();
		$("#characterDefaultActionsList").empty();
		$("#characterConditionalActionsList").empty();
		
		for (var i = 0; i < characters.length; i++) {
			if (characters[i].id == activeCharacterID) {
				activeCharacterIndex = i;
				break;
			}
		}
		if (activeCharacterIndex != undefined) {
			$("#deleteCharacterButton").prop("disabled", false);
			$("#saveCharacterButton").prop("disabled", false);
			$("#duplicateCharacterButton").prop("disabled", false);
      $("#characterAddAnimation").prop("disabled", false);
			
			$("#characterId").prop("value", activeCharacterID);
			$("#characterMachineName").prop("value", characters[activeCharacterIndex].machineName);
			$("#characterName").prop("value", characters[activeCharacterIndex].name);
			$("#characterNick").prop("value", characters[activeCharacterIndex].nick);
			$("#characterRoomSelection").prop("value", "-1");
			if (characters[activeCharacterIndex].room != "") {
				for (var i = 0; i < rooms.length; i++) {
					if (rooms[i].name == characters[activeCharacterIndex].room) {
						$("#characterRoomSelection").prop("value", rooms[i].id);
					}
				}
			}
			$("#characterRoomSelection").change();
      $("#characterScaleWithRoom").prop("checked", true);
			if (characters[activeCharacterIndex].scaleWithRoom == undefined || characters[activeCharacterIndex].scaleWithRoom == true) {
				$("#characterScaleWithRoom").prop("checked", false);
			}
			$("#characterX").prop("value", characters[activeCharacterIndex].x);
			$("#characterY").prop("value", characters[activeCharacterIndex].y);
			$("#characterForeground").prop("value", "false");
			if (characters[activeCharacterIndex].foreground != undefined && characters[activeCharacterIndex].foreground) {
				$("#characterForeground").prop("value", "true");
			}
			$("#characterAtlas").prop("value", characters[activeCharacterIndex].spriteAtlas);
			//$("#characterSource").prop("value", characters[activeCharacterIndex].source);
			/*$("#characterTorso").prop("value", characters[activeCharacterIndex].bodyparts.torso);
			$("#characterArms").prop("value", characters[activeCharacterIndex].bodyparts.arms);
			$("#characterLegs").prop("value", characters[activeCharacterIndex].bodyparts.legs);
			$("#characterHead").prop("value", characters[activeCharacterIndex].bodyparts.head);
			$("#characterBoobs").prop("value", "false");
			if (characters[activeCharacterIndex].bodyparts.boobs) {
				$("#characterBoobs").prop("value", "true");
			}
			$("#characterBoobs").change();
			
			$("#characterMouth").prop("value", characters[activeCharacterIndex].headparts.mouth);
			$("#characterEyes").prop("value", characters[activeCharacterIndex].headparts.eyes);
			$("#characterCheeks").prop("value", characters[activeCharacterIndex].headparts.cheeks);
			$("#characterNose").prop("value", characters[activeCharacterIndex].headparts.nose);
			$("#characterHair").prop("value", characters[activeCharacterIndex].hair.hair);
			$("#characterMoustache").prop("value", characters[activeCharacterIndex].hair.moustache);
			$("#characterEyebrows").prop("value", characters[activeCharacterIndex].hair.eyebrows);
			$("#characterBeard").prop("value", characters[activeCharacterIndex].hair.beard);
			$("#characterShirt").prop("value", characters[activeCharacterIndex].clothing.shirt);
			$("#characterShoes").prop("value", characters[activeCharacterIndex].clothing.shoes);
			$("#characterPants").prop("value", characters[activeCharacterIndex].clothing.pants);
			$("#characterColorHair").prop("value", characters[activeCharacterIndex].colors.hair);
			$("#characterColorBeard").prop("value", characters[activeCharacterIndex].colors.beard);
			$("#characterColorMoustache").prop("value", characters[activeCharacterIndex].colors.moustache);
			$("#characterColorEyebrow").prop("value", characters[activeCharacterIndex].colors.eyebrow);
			$("#characterColorShirt").prop("value", characters[activeCharacterIndex].colors.shirt);
			$("#characterColorSkintone").prop("value", characters[activeCharacterIndex].colors.skintone);
			$("#characterColorPants").prop("value", characters[activeCharacterIndex].colors.pants);
			$("#characterColorShoes").prop("value", characters[activeCharacterIndex].colors.shoes);
      
			$("#characterAnimationIdle").prop("value", characters[activeCharacterIndex].animations.idle);
			$("#characterAnimationWalkstyle").prop("value", characters[activeCharacterIndex].animations.walkstyle);
			*/
      
      
      // Create animations
      if (characters[activeCharacterIndex].animations != undefined) {
        for (var i = 0; i < characters[activeCharacterIndex].animations.length; i++) {
          addCharacterAnimationItem(characters[activeCharacterIndex].animations[i], i);
				}
				
				/*if (assets[activeAssetIndex].animations.length > 0) {
					$("#assetAnimationNbr").html("(" + assets[activeAssetIndex].animations.length + ")");
				}*/
      }

			// Create actions lists
			if (characters[activeCharacterIndex].defaultActions != undefined) {
				createDefaultActionsList(characters[activeCharacterIndex].defaultActions, activeCharacterIndex, "character");
			}
			if (characters[activeCharacterIndex].conditionalActions != undefined) {
				createConditionalActionsList(characters[activeCharacterIndex].conditionalActions, activeCharacterIndex, "character");
			}
			// Update color inputs
      $("#charactersView .color").each(function() {
        document.getElementById($(this).attr('id')).color.fromString($(this).val());
      }); 
			$("#characterInfo").show();
		}
	});
	
  function addCharacterAnimationItem(animation, index) {
    
    var animationItem =  '<li class="characterAnimation" id="characterAnimation_' + activeCharacterIndex + '_' + index + '">Name: <input type="text" id="characterAnimationName_' + activeCharacterIndex + '_' + index + '" value="' + animation.name + '" disabled="disabled" /> <button style="display:none;" class="deleteAnimation">X</button> <button style="display:none;" class="saveAnimation">Save</button><button class="editAnimation">Edit</button><br />';
    animationItem += 'FPS: <input type="text" id="characterAnimationFPS_' + activeCharacterIndex + '_' + index + '" value="' + animation.fps + '" disabled="disabled" /> Loop: <select id="characterAnimationLoop_' + activeCharacterIndex + '_' + index + '"  disabled="disabled">';
    animationItem += '<option value="false"';
    if (animation.loop) {
      animationItem += ' selected="selected"';
    }
    animationItem += '>false</option><option value="true"';
    if (animation.loop) {
      animationItem += ' selected="selected"';
    }
    animationItem += '>true</option></select><br />';
    
    animationItem += 'Frames: <input type="text" id="characterAnimationFrames_' + activeCharacterIndex + '_' + index + '" value="';
    for (var j = 0; j < animation.frames.length; j++) {
      animationItem += animation.frames[j] + ", ";
    }
    if (animation.frames.length) {
      animationItem = animationItem.slice(0, -2);
    }
    animationItem += '" disabled="disabled" /><br />';
    animationItem += 'Temp Anchor: <input type="text" id="characterAnimationTempAnchor_' + activeCharacterIndex + '_' + index + '" value="';
    for (var j = 0; j < animation.tempAnchor.length; j++) {
      animationItem += animation.tempAnchor[j] + ", ";
    }
    if (animation.tempAnchor.length) {
      animationItem = animationItem.slice(0, -2);
    }
    animationItem += '" disabled="disabled" /><br />';
    
    animationItem += 'Temp Atlas: <input type="text" id="characterAnimationTempAtlas_' + activeCharacterIndex + '_' + index + '" value="' + animation.tempAtlas + '" disabled="disabled" /><br />';
    animationItem += 'Generate Frame Names: <input type="text" id="characterAnimationGenerateFrameNames_' + activeCharacterIndex + '_' + index + '" value="';
    for (var j = 0; j < animation.generateFrameNames.length; j++) {
      animationItem += animation.generateFrameNames[j] + ", ";
    }
    if (animation.generateFrameNames.length) {
      animationItem = animationItem.slice(0, -2);
    }
    animationItem += '" disabled="disabled" /> Parameters: 0 = prefix, 1 = startNo, 2 = endNo, 3 = suffix, 4 = zeroPad (how many numbers between prefix and suffix) 5 = repeatReverse (should animation be repeated in reverse order';
    
    animationItem += '</li>';
    
    $('#characterAnimationsList').append(animationItem);
  }
          
  $("#characterAnimationsList").on("click", ".editAnimation", function(e) {
    
    e.preventDefault();
    $("#characterAnimationsList .editAnimation").prop("disabled", true);
    var id = $(this).parent().prop("id").replace("characterAnimation_", "");
    $(this).hide();
    $('#characterAnimationName_' + id).prop("disabled", false);
    $('#characterAnimationFPS_' + id).prop("disabled", false);
    $('#characterAnimationLoop_' + id).prop("disabled", false);
    $('#characterAnimationFrames_' + id).prop("disabled", false);
    $('#characterAnimationGenerateFrameNames_' + id).prop("disabled", false);
    $('#characterAnimationTempAnchor_' + id).prop("disabled", false);
    $('#characterAnimationTempAtlas_' + id).prop("disabled", false);
    $('#characterAnimation_' + id + ' .saveAnimation, #characterAnimation_' + id + ' .deleteAnimation').show();
    $("#characterAddAnimation").prop("disabled", true);
    
    /*
    {
                    "name": "walkAni",
                    "fps": 30,
                    "loop": false,
                    "generateFrameNames": ['tikkanen_walkcycle_', 0, 14, '', 5, true],
                    "tempAnchor": [],
                    "tempAtlas": "",
                    "frames": []
                },
    */
  });
  
  $("#characterAnimationsList ").on("click", ".deleteAnimation", function(e) {
		
		e.preventDefault();
		var index = $(this).parent().prop("id").replace("characterAnimation_" + activeCharacterIndex + "_", "");
		
		if (!confirm("Delete animation " + characters[activeCharacterIndex].animations[index].name + "?")) {
			return;
		}
		characters[activeCharacterIndex].animations.splice(index, 1);
		// Create json file
		saveJSObjectAsJSON(characters, "json/characters.json");
		
		// Enable all edit animation buttons
		$('#characterAnimationsList .editAnimation').show();
    $("#characterAddAnimation").prop("disabled", false);
    $("#characterAnimationsList .editAnimation").prop("disabled", false);
		$(this).parent().remove();
		
		var characterAnimations = $("#characterAnimationsList > li");
		/*
		$("#assetAnimationNbr").html("");
		if (assetAnimations.length > 0) {
			$("#assetAnimationNbr").html("(" + assetAnimations.length + ")");
		}*/
		
		// Remove deleted index from the list
		for (var i = 0; i < characterAnimations.length; i++) {
			
			var oldIndex = $(characterAnimations[i]).prop("id").replace("characterAnimation_", "");
			
			$(characterAnimations[i]).prop("id", "characterAnimation_" + activeCharacterIndex + "_" + i);
			$("#characterAnimationName_" + oldIndex).prop("id", "characterAnimationName_" + activeCharacterIndex + "_" + i);
			$("#characterAnimationFPS_" + oldIndex).prop("id", "characterAnimationFPS_" + activeCharacterIndex + "_" + i);
			$("#characterAnimationLoop_" + oldIndex).prop("id", "characterAnimationLoop_" + activeCharacterIndex + "_" + i);
			$("#characterAnimationFrames_" + oldIndex).prop("id", "characterAnimationFrames_" + activeCharacterIndex + "_" + i);
      $("#characterAnimationGenerateFrameNames_" + oldIndex).prop("id", "characterAnimationGenerateFrameNames_" + activeCharacterIndex + "_" + i);
      $("#characterAnimationTempAnchor_" + oldIndex).prop("id", "characterAnimationTempAnchor_" + activeCharacterIndex + "_" + i);
      $("#characterAnimationTempAtlas_" + oldIndex).prop("id", "characterAnimationTempAtlas_" + activeCharacterIndex + "_" + i);
		}
	});
  
  $("#characterAnimationsList").on("click", ".saveAnimation", function(e){
    
    e.preventDefault();
    var id = $(this).parent().prop("id").replace("characterAnimation_", "");
    $('#characterAnimationName_' + id).prop("disabled", true);
    $('#characterAnimationFPS_' + id).prop("disabled", true);
    $('#characterAnimationLoop_' + id).prop("disabled", true);
    $('#characterAnimationFrames_' + id).prop("disabled", true);
    $('#characterAnimationGenerateFrameNames_' + id).prop("disabled", true);
    $('#characterAnimationTempAnchor_' + id).prop("disabled", true);
    $('#characterAnimationTempAtlas_' + id).prop("disabled", true);
    $('#characterAnimation_' + id + ' .saveAnimation, #characterAnimation_' + id + ' .deleteAnimation').hide();
    $('#characterAnimation_' + id + ' .editAnimation').show();
    $("#characterAddAnimation").prop("disabled", false);
    $("#characterAnimationsList .editAnimation").prop("disabled", false);
    
    var index = parseInt(id.split('_')[1]);
    
		var name = $("#characterAnimationName_" + id).prop("value").trim();
		var loop = ($("#characterAnimationLoop_" + id).prop("value") == "true");
		var fps = $("#characterAnimationFPS_" + id).prop("value").trim();
		if (fps != "") {
			fps = parseInt(fps);
		}
		var frames = $("#characterAnimationFrames_" + id).prop("value");
		var framesArray = frames.split(",");
		
		if (framesArray.length == 1 && framesArray[0].trim() == "") {
			framesArray = [];
		}
		for (var i = 0; i < framesArray.length; i++) {
			framesArray[i] = framesArray[i].trim();
		}
    
    var tempAtlas = $('#characterAnimationTempAtlas_' + id).prop("value").trim();
    var tempAnchor = $('#characterAnimationTempAnchor_' + id).prop("value").trim().split(",");
    if (tempAnchor.length == 1 && tempAnchor[0].trim() == "") {
			tempAnchor = [];
		}
		for (var i = 0; i < tempAnchor.length; i++) {
			tempAnchor[i] = parseInt(tempAnchor[i].trim());
		}
    var generateFrameNames = $('#characterAnimationGenerateFrameNames_' + id).prop("value").trim().split(",");
    if (generateFrameNames.length == 1 && generateFrameNames[0].trim() == "") {
			generateFrameNames = [];
		}
		for (var i = 0; i < generateFrameNames.length; i++) {
			generateFrameNames[i] = generateFrameNames[i].trim();
      if (i == 1 || i == 2 || i == 4) {
        generateFrameNames[i] = parseInt(generateFrameNames[i]);
      }
      else if (i == 5) {
        if (generateFrameNames[i] == "true") {
          generateFrameNames[i] = true;
        }
        else {
          generateFrameNames[i] = false;
        }
      }
      //['tikkanen_walkcycle_', 0, 14, '', 5, true],
		}
    $('#characterAnimationGenerateFrameNames_' + id).prop("disabled", true);
		characters[activeCharacterIndex].animations[index].name = name;
		characters[activeCharacterIndex].animations[index].loop = loop;
		characters[activeCharacterIndex].animations[index].fps = fps;
		characters[activeCharacterIndex].animations[index].frames = framesArray;
    characters[activeCharacterIndex].animations[index].tempAtlas = tempAtlas;
    characters[activeCharacterIndex].animations[index].tempAnchor = tempAnchor;
    characters[activeCharacterIndex].animations[index].generateFrameNames = generateFrameNames;
		// Create json file
		saveJSObjectAsJSON(characters, "json/characters.json");
  });
  
  $("#characterAddAnimation").click(function(e) {
    
    e.preventDefault();
    
    var animationsCount = $("li.characterAnimation").length;
    var animation = { "name": "", "fps": 0, "loop": false, "generateFrameNames": [], "tempAnchor": [], "tempAtlas": "", "frames": [] };
    if (characters[activeCharacterIndex].animations == undefined) {
      characters[activeCharacterIndex].animations = [];
    }
    characters[activeCharacterIndex].animations.push(animation);['tikkanen_walkcycle_', 0, 14, '', 5, true],
    addCharacterAnimationItem(animation, animationsCount);
    $('#characterAnimationGenerateFrameNames_' + activeCharacterIndex + '_' + animationsCount).prop("value", "prefix, start, stop, suffix, zeroPad, repeatReverse");
    $("#characterAnimation_" + activeCharacterIndex + "_" + animationsCount + " .editAnimation").click();
  });
  
	$("#duplicateCharacterButton").click(function(e) {
		
		e.preventDefault();
		var newCharacter = jQuery.extend(true, {}, characters[activeCharacterIndex]);
		
		newCharacter.id = misc.characterId;
		newCharacter.name += misc.characterId;
		newCharacter.machineName += misc.characterId;
		newCharacter.room = "";
		
		misc.characterId++;
		$(".characterSelection").append('<option id="character_' + newCharacter.id + '" value="' + newCharacter.id + '">' + newCharacter.machineName + '</option>');
		characters.push(newCharacter);
		// Create json files
		saveJSObjectAsJSON(characters, "json/characters.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		
		$("#charactersView .characterSelection").prop("value", newCharacter.id);
		$("#charactersView .characterSelection").change();
		$("#characterMachineName").focus().select();
		createSayerDropdown();
	});
	
	$("#deleteCharacterButton").click(function(e) {
		
		e.preventDefault();
		if (!confirm("Delete character " + characters[activeCharacterIndex].machineName + "?")) {
			return;
		}
		/*$('#roomNPCList #roomNpc_' + characters[activeCharacterIndex].id).remove();
		$("#roomNPCNbr").html("");
		var npcNbr = $("#roomNPCList > li").length;
		if (npcNbr > 0) {
			$("#roomNPCNbr").html("(" + npcNbr + ")");
		}*/
    // Remove character from room assets
    if (characters[activeCharacterIndex].room != "") {
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name == characters[activeCharacterIndex].room) {
          var npcIndex = rooms[i].assets.indexOf('npc_' + characters[activeCharacterIndex].machineName);
          rooms[i].assets.splice(npcIndex, 1);
          if (rooms[i].id == activeRoomID) {
            $("#roomSelection").change();
          }
          saveJSObjectAsJSON(rooms, "json/rooms.json");
          break;
        }
      }
    }
		characters.splice(activeCharacterIndex, 1);
		if (misc.defaultCharacterId == activeCharacterID) {
			misc.defaultCharacterId = undefined;
			saveJSObjectAsJSON(misc, "json/misc.json");
			updateGamestates();
		}
		activeCharacterID = undefined;
		activeCharacterIndex = undefined;
		generateCharactersViewSelection();
		$("#charactersView .characterSelection").change();
		// Create json file
		saveJSObjectAsJSON(characters, "json/characters.json");
		createSayerDropdown();
	});
	
	$("#saveCharacterButton").click(function(e) {
		
		e.preventDefault();

		var characterName = $("#characterMachineName").prop("value").trim();
		if (characters[activeCharacterIndex].machineName != characterName) {
      // Rename character from room assets
      var charRoomActive = false;
      for (var i = 0; i < rooms.length; i++) {
        var npcIndex = rooms[i].assets.indexOf('npc_' + characters[activeCharacterIndex].machineName);
        
        if (npcIndex != -1) {
          rooms[i].assets[npcIndex] = 'npc_' + characterName;
          if (rooms[i].id == activeRoomID) {
            charRoomActive = true;
          }
        }
      }
      characters[activeCharacterIndex].machineName = characterName;
			$('.characterSelection > option[value="' + activeCharacterID + '"]').html(characterName);
			$('#roomNPCList #roomNpc_' + characters[activeCharacterIndex].id).html('<a class="showCharacter">' + characterName + '</a>');
      if (charRoomActive) {
        $("#roomSelection").change();
      }
		}
		characters[activeCharacterIndex].name = $("#characterName").prop("value").trim();
		characters[activeCharacterIndex].nick = $("#characterNick").prop("value").trim();
		var characterRoom = $("#characterRoomSelection").prop("value");
    // Remove character from room assets
    if (characters[activeCharacterIndex].room != "" && characters[activeCharacterIndex].room != $('#characterRoomSelection > option[value="' + characterRoom + '"]').html()) {
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name == characters[activeCharacterIndex].room) {
          var npcIndex = rooms[i].assets.indexOf('npc_' + characters[activeCharacterIndex].machineName);
          rooms[i].assets.splice(npcIndex, 1);
          if (rooms[i].id == activeRoomID) {
            $("#roomSelection").change();
          }
          break;
        }
      }
    }
		$('#roomNPCList #roomNpc_' + characters[activeCharacterIndex].id).remove();
		characters[activeCharacterIndex].room = "";
		if (characterRoom != "-1") {
			characters[activeCharacterIndex].room = $('#characterRoomSelection > option[value="' + characterRoom + '"]').html();
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].name == characters[activeCharacterIndex].room) {
          if (rooms[i].assets.indexOf('npc_' + characters[activeCharacterIndex].machineName) == -1) {
            rooms[i].assets.push('npc_' + characters[activeCharacterIndex].machineName);
            if (rooms[i].id == activeRoomID) {
              $("#roomSelection").change();
            }
          }
          break;
        }
      }
			if (activeRoomIndex != undefined && rooms[activeRoomIndex].name == characters[activeCharacterIndex].room) {
				if (!$('#roomNPCList #roomNpc_' + characters[activeCharacterIndex].id).length) {
					$('#roomNPCList').append('<li id="roomNpc_' + characters[activeCharacterIndex].id + '"><a class="showCharacter">' + characters[activeCharacterIndex].machineName + '</a></li>');
				}
			}
		}
		$("#roomNPCNbr").html("");
		var npcNbr = $("#roomNPCList > li").length;
		if (npcNbr > 0) {
			$("#roomNPCNbr").html("(" + npcNbr + ")");
		}
		characters[activeCharacterIndex].scaleWithRoom = $("#characterScaleWithRoom").prop("checked") ? false : true;
		characters[activeCharacterIndex].x = "";
		characters[activeCharacterIndex].y = "";
		if ($("#characterX").prop("value").trim() != "") {
			characters[activeCharacterIndex].x = parseInt($("#characterX").prop("value"));
		}
		if ($("#characterY").prop("value").trim() != "") {
			characters[activeCharacterIndex].y = parseInt($("#characterY").prop("value"));
		}
		characters[activeCharacterIndex].foreground = false;
		if ($("#characterForeground").prop("value") == "true") {
			characters[activeCharacterIndex].foreground = true;
		}
		characters[activeCharacterIndex].spriteAtlas = $("#characterAtlas").prop("value");
		//characters[activeCharacterIndex].source = $("#characterSource").prop("value");
		/*characters[activeCharacterIndex].bodyparts.torso = parseInt($("#characterTorso").prop("value"));
		characters[activeCharacterIndex].bodyparts.arms = parseInt($("#characterArms").prop("value"));
		characters[activeCharacterIndex].bodyparts.legs = parseInt($("#characterLegs").prop("value"));
		characters[activeCharacterIndex].bodyparts.head = parseInt($("#characterHead").prop("value"));
		characters[activeCharacterIndex].bodyparts.boobs = false;
		if ($("#characterBoobs").prop("value") == "true") {
			characters[activeCharacterIndex].bodyparts.boobs = true;
		}
		characters[activeCharacterIndex].headparts.eyes = parseInt($("#characterEyes").prop("value"));
		characters[activeCharacterIndex].headparts.cheeks = parseInt($("#characterCheeks").prop("value"));
		characters[activeCharacterIndex].headparts.nose = parseInt($("#characterNose").prop("value"));
		characters[activeCharacterIndex].hair.hair = parseInt($("#characterHair").prop("value"));
		characters[activeCharacterIndex].hair.moustache = parseInt($("#characterMoustache").prop("value"));
		characters[activeCharacterIndex].hair.eyebrows = parseInt($("#characterEyebrows").prop("value"));
		characters[activeCharacterIndex].hair.beard = parseInt($("#characterBeard").prop("value"));
		characters[activeCharacterIndex].clothing.shirt = parseInt($("#characterShirt").prop("value"));
		characters[activeCharacterIndex].clothing.shoes = parseInt($("#characterShoes").prop("value"));
		characters[activeCharacterIndex].clothing.pants = parseInt($("#characterPants").prop("value"));
		characters[activeCharacterIndex].colors.hair = $("#characterColorHair").prop("value");
		characters[activeCharacterIndex].colors.beard = $("#characterColorBeard").prop("value");
		characters[activeCharacterIndex].colors.moustache = $("#characterColorMoustache").prop("value");
		characters[activeCharacterIndex].colors.eyebrow = $("#characterColorEyebrow").prop("value");
		characters[activeCharacterIndex].colors.shirt = $("#characterColorShirt").prop("value");
		characters[activeCharacterIndex].colors.skintone = $("#characterColorSkintone").prop("value");
		characters[activeCharacterIndex].colors.pants = $("#characterColorPants").prop("value");
		characters[activeCharacterIndex].colors.shoes = $("#characterColorShoes").prop("value");
    */
		characters[activeCharacterIndex].animations.idle = $("#characterAnimationIdle").prop("value");
		characters[activeCharacterIndex].animations.walkstyle = $("#characterAnimationWalkstyle").prop("value");
		
		// Create json file
    saveJSObjectAsJSON(rooms, "json/rooms.json");
		saveJSObjectAsJSON(characters, "json/characters.json");
		createSayerDropdown();
	});
	
	$("#createCharacterButton").click(function(e) {
		
		e.preventDefault();
		var character = {"id":misc.characterId,"machineName":"character" + misc.characterId,"name":"New Character","nick":"","spriteAtlas":"TEST_tikkanen","x":"","y":"","foreground":false,/*"source":"character_master","bodyparts":{"torso":1,"arms":1,"legs":1,"head":2,"boobs":false},"headparts":{"mouth":1,"eyes":1,"cheeks":1,"nose":1},"hair":{"hair":3,"moustache":1,"eyebrows":1,"beard":1},"clothing":{"shirt":2,"shoes":1,"pants":1},"colors":{"hair":"999966","beard":"877D69","moustache":"877D69","eyebrow":"877D69","shirt":"CE9E39","skintone":"ffe0bd","pants":"50ADB8","shoes":"999966"},*/"animations":[{"name": "walkAni","fps": 30,"loop": true,"generateFrameNames": ["tikkanen_walkcycle_",0,14,"",5,true],"tempAnchor": [],"tempAtlas": "TEST_tikkanen","frames": []},{"name": "idleAni","fps": 1,"loop": false,"generateFrameNames": [],"tempAnchor": [],"tempAtlas": "TEST_tikkanen","frames": ["tikkanen_idle_00000"]}],"defaultActions":[],"conditionalActions":[]};
		characters.push(character);
		misc.characterId++;
		$(".characterSelection").append('<option id="character_' + character.id + '" value="' + character.id + '">' + character.machineName + '</option>');
		// Create json files
		saveJSObjectAsJSON(characters, "json/characters.json");
		saveJSObjectAsJSON(misc, "json/misc.json");
		$("#charactersView .characterSelection").prop("value", character.id);
		$("#charactersView .characterSelection").change();
		if (characters.length == 1 || misc.defaultCharacterId == undefined) {
			$("#playerCharacter").prop("value", character.id);
			$("#playerCharacter").change();
		}
		createSayerDropdown();
	});
	
	$("#playerCharacter").change(function() {
		
		var id = parseInt($(this).prop("value"));
		
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == "character") {
				gamestates[i].value = id;
				break;
			}
		}
		misc.defaultCharacterId = id;
		saveJSObjectAsJSON(misc, "json/misc.json");
		saveJSObjectAsJSON(gamestates, "json/gamestates.json");
		updateGamestates();
		createSayerDropdown();
	});
	function generateCharactersViewSelection() {
		
		$(".characterSelection").empty();
		$("#charactersView .characterSelection").append('<option value="-1" disabled="disabled" selected="selected">Select Character</option>');
		
		for (var i = 0; i < characters.length; i++) {
			$(".characterSelection").append('<option id="character_' + characters[i].id + '" value="' + characters[i].id + '">' + characters[i].machineName + '</option>');
		}
		$("#playerCharacter").prop("value", misc.defaultCharacterId);
		// If some character is active, select that
		if (activeCharacterID != undefined) {
			$("#charactersView .characterSelection").prop("value", activeCharacterID);
			$("#charactersView .characterSelection").change();
		}
	}
	
	/***********************************************
	* GENERAL JQUERY HANDLERS
	***********************************************/
	// Header buttons:
	$(".headerButton").click(function(e) {
		e.preventDefault();
		var id = this.id.replace("ViewButton", "");
		
		// Toggle selected
		if ($(this).hasClass("selected")) {
			$(this).removeClass("selected");
			// Hide views
			$("#" + id + "View").slideUp(300);
		}
		else {
			// If some panel is open hide it first
			var active = $(".headerButton.selected");
			if (active.length > 0) {
				var activeId = active.prop("id").replace("ViewButton", "");
				active.removeClass("selected");
				$(this).addClass("selected");
				$("#" + activeId + "View").slideUp(300, function() {
					$("#" + id + "View").slideDown(300);
				});
			}
			else {
				$(this).addClass("selected");
				$("#" + id + "View").slideDown(300);
			}
		}
	});
	
	$("body").on("click", ".roomAction a, .assetAction a, .dialogAction a, .characterAction a", function(e){
		
		e.preventDefault();
		var action = $(this).prop("class").replace("linkedAction_", "");
		// Change to actions view
		$("#actionsViewButton").click();
		// Select corresponding action
		$("#actionsView .actionSelection").prop("value", action);
		$("#actionsView .actionSelection").change();
	});
  
  $("body").on("mouseover", ".roomAction, .assetAction, .dialogAction, .characterAction, #actionTasksList > li", function(e){
   
    var id = -1;
    var text = "";
    if ($(this).find('.conditionalTaskSelection, .defaultTaskSelection').prop("value") == "launchDialogue") {
      id = parseInt($(this).find('input:first').prop("value"));
    }
    else if ($(this).prop("id").indexOf("actionTask_") != -1) {
      if ($(this).find('span:first').html() == "launchDialogue") {
        id = parseInt($(this).find('input:first').prop("value"));
      }
    }
    if (!isNaN(id) && id > -1) {
      for (var i = 0; i < dialogs.length; i++) {
        if (dialogs[i].id == id) {
          if (jQuery.type(dialogs[i].text) === "string") {
            text = dialogs[i].text;
          }
          else if (dialogs[i].textOnTop != undefined) {
            text = dialogs[i].textOnTop;
          }
        }
      }
    }
    $(this).prop("title", text);
  });
  
  $("body").on("mouseover", ".actionSelection > option, .addDefaultActionSelect > option, .addConditionalActionSelect > option", function(e){
   
    var text = "";
    var hoveredAction = $(this).prop("value");
    if (hoveredAction != "-1") {
      if (actions[hoveredAction] && actions[hoveredAction].comment != undefined) {
        text = actions[hoveredAction].comment;
      }
    }
    $(this).prop("title", text);
  });
  
	
	$("body").on("change", ".addDefaultActionSelect, .addConditionalActionSelect", function() {
		
		if ($(this).prop("value") == "-1") {
			$("#" + $(this).prop("id").replace("Select", "")).prop("disabled", true);
		}
		else {
			$("#" + $(this).prop("id").replace("Select", "")).prop("disabled", false);
		}
	});
	
	$("body").on("click", ".addDefaultAction", function(e){
		
		var single = false;
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
			
		var type = $(this).prop("id").replace("AddDefaultAction", "");
		var actionName = $("#" + type + "AddDefaultActionSelect").prop("value");
		if (actionName == "singleTask") {
			single = true;
		}
		if (type == "room") {
			activeIndex = activeRoomIndex;
			if (rooms[activeRoomIndex].defaultActions == undefined) {
				rooms[activeRoomIndex].defaultActions = [];
			}
			actionArray = rooms[activeRoomIndex].defaultActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			if (assets[activeAssetIndex].defaultActions == undefined) {
				assets[activeAssetIndex].defaultActions = [];
			}
			actionArray = assets[activeAssetIndex].defaultActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			if (dialogs[activeDialogIndex].defaultActions == undefined) {
				dialogs[activeDialogIndex].defaultActions = [];
			}
			actionArray = dialogs[activeDialogIndex].defaultActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			if (characters[activeCharacterIndex].defaultActions == undefined) {
				characters[activeCharacterIndex].defaultActions = [];
			}
			actionArray = characters[activeCharacterIndex].defaultActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		var actionIndex = actionArray.length;
		var argsNbr = 0;
		var listItem = '<li class="' + type + 'Action" id="' + type + 'DefaultAction_' + activeIndex + '_' + actionIndex + '">';
		// Create single task
		if (single) {
			
			listItem += '<button style="display:none;" class="deleteDefaultTask">X</button> <select class="defaultTaskSelection" id="' + type + 'DefaultTaskNameInput_' + activeIndex + '_' + actionIndex + '" style="display:none;">';
			for (var i = 0; i < tasks.length; i++) {
				listItem += '<option value="' + tasks[i].name + '">' + tasks[i].name + '</option>';
			}
			listItem += '</select><span id="' + type + 'DefaultTaskName_' + activeIndex + '_' + actionIndex + '">' + 'changeGamestate' + '</span>(<input type="text" id="' + type + 'DefaultTaskParamsInput_' + activeIndex + '_' + actionIndex + '" value="';
			listItem +=  '" style="display:none;" />';
			listItem += '<span id="' + type + 'DefaultTaskParams_' + activeIndex + '_' + actionIndex + '">' + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="' + type + 'DefaultTaskWait_' + activeIndex + '_' + actionIndex + '" ';
			listItem += ' disabled="disabled" /> <button class="editDefaultTask">Edit</button>';
			
			var task = {"name":"changeGamestate","params":[]};
			actionArray.push(task);
		}
		else {
			// Loop through tasks of action and check if there are arguments
			for (var i = 0; i < actions[actionName].tasks.length; i++) {
				for (var j = 0; j < actions[actionName].tasks[i].params.length; j++) {
					if (jQuery.type(actions[actionName].tasks[i].params[j]) === "string" && actions[actionName].tasks[i].params[j].indexOf("arguments") != -1) {
						var param = actions[actionName].tasks[i].params[j].replace("arguments[", "");
						param = parseInt(param.replace("]", ""));
						if (param > argsNbr) {
							argsNbr = param;
						}
					}
				}
			}
			if (argsNbr == 0) {
				listItem += '<button class="deleteDefaultAction">X</button> <a title="' + actions[actionName].comment + '" href="" class="linkedAction_' + actionName + '" >' + actionName + '</a>';
				actionArray.push(actionName);
			}
			else if (argsNbr > 0) {
				listItem += '<button class="deleteDefaultAction">X</button> <a href="" title="' + actions[actionName].comment + '" class="linkedAction_' + actionName + '" >' + actionName + '</a> ';
				listItem += 'Params: <input type="text" id="' + type + 'DefaultActionParamsInput_' + activeIndex + '_' + actionIndex + '" value="';
				listItem += '" disabled="disabled" />  <button class="editDefaultActionParams">Edit</button>';
				actionArray.push([actionName, ""]);
			}
		}
		listItem += '<span class="sortable-handle"></span></li>';

		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		$("#" + type + "DefaultActionsList").append(listItem);
		
		$("#" + type + "DefaultActionsNbr").html("");
		if (actionArray.length > 0) {
			$("#" + type + "DefaultActionsNbr").html("(" + actionArray.length + ")");
		}
		
		if (single) {
			$('#' + type + 'DefaultTaskNameInput_' + activeIndex + '_' + actionIndex).prop("value", "changeGamestate");
			$('#' + type + 'DefaultTaskNameInput_' + activeIndex + '_' + actionIndex).change();
			$('#' + type + 'DefaultAction_' + activeIndex + '_' + actionIndex + ' .editDefaultTask').click();
		}
		else if (argsNbr > 0) {
			$('#' + type + 'DefaultAction_' + activeIndex + '_' + actionIndex + ' .editDefaultActionParams').click();
		}
	});
	
	$("body").on("click", ".addConditionalAction", function(e){
				
		var single = false;
		var typeAndId = $(this).prop("id").replace("AddConditionalAction", "");
		var temp = typeAndId.split('_');
		var type = temp[0];
		var id = temp[1] + '_' + temp[2];
		var conditionIndex = parseInt(temp[2]);

		var actionName = $("#" + type + "AddConditionalActionSelect_" + id).prop("value");
		if (actionName == "singleTask") {
			single = true;
		}
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions[conditionIndex].results;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions[conditionIndex].results;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions[conditionIndex].results;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions[conditionIndex].results;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		var resultIndex = actionArray.length;
		var argsNbr = 0;
		var conditionalItem = '<li class="' + type + 'Action" id="' + type + 'ConditionalAction_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '">';	
		
		// Create single task
		if (single) {
			conditionalItem += '<button style="display:none;" class="deleteConditionalTask">X</button> <select class="conditionalTaskSelection" id="' + type + 'ConditionalTaskNameInput_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '" value="' + 'changeGamestate' + '" style="display:none;" >';
			for (var i = 0; i < tasks.length; i++) {
				conditionalItem += '<option value="' + tasks[i].name + '">' + tasks[i].name + '</option>';
			}
			conditionalItem += '</select><span id="' + type + 'ConditionalTaskName_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '">' + 'singleTask' + '</span>(<input type="text" id="' + type + 'ConditionalTaskParamsInput_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '" value="';
			conditionalItem +=  '" style="display:none;" />';
			conditionalItem += '<span id="' + type + 'ConditionalTaskParams_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '">' + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="' + type + 'ConditionalTaskWait_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '" ';
			conditionalItem += ' disabled="disabled" /> <button class="editConditionalTask">Edit</button>';

			var task = {"name":"changeGamestate","params":[]};
			actionArray.push(task);
		}
		else {
			// Loop through tasks of action and check if there are arguments
			for (var i = 0; i < actions[actionName].tasks.length; i++) {
				for (var j = 0; j < actions[actionName].tasks[i].params.length; j++) {
					if (jQuery.type(actions[actionName].tasks[i].params[j]) === "string" && actions[actionName].tasks[i].params[j].indexOf("arguments") != -1) {
						var param = actions[actionName].tasks[i].params[j].replace("arguments[", "");
						param = parseInt(param.replace("]", ""));
						if (param > argsNbr) {
							argsNbr = param;
						}
					}
				}
			}
			if (argsNbr == 0) {
				conditionalItem += '<button class="deleteConditionalAction">X</button> <a title="' + actions[actionName].comment + '" href="" class="linkedAction_' + actionName + '" >' + actionName + '</a>';
				actionArray.push(actionName);
			}
			else if (argsNbr > 0) {
				conditionalItem += '<button class="deleteConditionalAction">X</button> <a title="' + actions[actionName].comment + '" href="" class="linkedAction_' + actionName + '" >' + actionName + '</a> ';
				conditionalItem += 'Params: <input type="text" id="' + type + 'ConditionalActionParamsInput_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + '" value="';
				conditionalItem += '" disabled="disabled" />  <button class="editConditionalActionParams">Edit</button>';
				actionArray.push([actionName, ""]);
			}
		}
		conditionalItem += '<span class="sortable-handle"></span></li>';

		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		$("#" + type + "Condition_" + id + ' ul').append(conditionalItem);
		
		if (single) {
			$('#' + type + 'ConditionalAction_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + ' .editConditionalTask').click();
		}
		else if (argsNbr > 0) {
			$('#' + type + 'ConditionalAction_' + activeIndex + '_' + conditionIndex + '_' + resultIndex + ' .editConditionalActionParams').click();
		}
	});
	
	$("body").on("click", ".editConditionalActionParams", function(e) {
		
		e.preventDefault();
		
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalActionParams").prop("disabled", true);
		$(this).hide();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];
		
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalAction").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalActionSelect").prop("disabled", true);
		$("#" + type + "AddCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalTask").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalAction").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalTask").prop("disabled", true);
		
		$("#" + $(this).parent().prop("id") + " .deleteConditionalAction").prop("disabled", false);
		$('#' + type + 'ConditionalActionParamsInput_' + id).prop("disabled", false);
		
		$(this).parent().append('<button class="saveConditionalActionParams">Save</button> ');
	});
	
	$("body").on("click", ".saveConditionalActionParams", function(e) {
		
		e.preventDefault();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];

		var conditionIndex = parseInt(temp[2]);
		var resultIndex = parseInt(temp[3]);
		
		// Show and enable edit buttons
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalActionParams").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalActionParams").show();
		$("#" + type + "AddCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalActionSelect").prop("disabled", false);
		
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalAction").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalTask").prop("disabled", false);
		
		if ($("#" + type + "AddConditionalActionSelect_" + temp[1] + "_" + temp[2]).prop("value") != "-1") {
			$("#" + type + "AddConditionalAction_" + temp[1] + "_" + temp[2]).prop("disabled", false);
		}
		
		var params = $('#' + type + 'ConditionalActionParamsInput_' + id).prop("value");
		$('#' + type + 'ConditionalActionParamsInput_' + id).prop("disabled", true);
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions[conditionIndex].results;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions[conditionIndex].results;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions[conditionIndex].results;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions[conditionIndex].results;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		var paramsArray = params.split(",");
		
		if (paramsArray.length == 1 && paramsArray[0].trim() == "") {
			paramsArray = [];
		}
		for (var i = 0; i < paramsArray.length; i++) {
			paramsArray[i] = paramsArray[i].trim();
			if (paramsArray[i] == "true") {
				paramsArray[i] = true;
			}
			else if (paramsArray[i] == "false") {
				paramsArray[i] = false;
			}
			else if (!isNaN(paramsArray[i])) {
				paramsArray[i] = parseFloat(paramsArray[i]);
			}
		}
		
		var actionName = "";
		if (jQuery.type(actionArray[resultIndex]) === "string" && actions[actionArray[resultIndex]] != undefined) {
			actionName = actionArray[resultIndex];
		}
		else if (jQuery.type(actionArray[resultIndex]) === "array") {
			actionName = actionArray[resultIndex][0];
		}
		var newAction = [];
		newAction.push(actionName);
		// join arrays
		actionArray[resultIndex] = newAction.concat(paramsArray);
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove save button
		$(this).remove();
	});
	
	$("body").on("click", ".editDefaultActionParams", function(e) {
		
		e.preventDefault();
		
		$("#" + $(this).parent().parent().prop("id") + " .editDefaultTask").prop("disabled", true);
		$("#" + $(this).parent().parent().prop("id") + " .editDefaultActionParams").prop("disabled", true);
		$(this).hide();
		
		var typeAndId = $(this).parent().prop("id").replace("DefaultAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2];
		
		$("#" + type + "AddDefaultAction").prop("disabled", true);
		$("#" + type + "AddDefaultActionSelect").prop("disabled", true);
		$("#" + $(this).parent().parent().prop("id") + " .deleteDefaultTask").prop("disabled", true);
		$("#" + $(this).parent().parent().prop("id") + " .deleteDefaultAction").prop("disabled", true);
		$("#" + $(this).parent().prop("id") + " .deleteDefaultAction").prop("disabled", false);
		$('#' + type + 'DefaultActionParamsInput_' + id).prop("disabled", false);
		
		$(this).parent().append('<button class="saveDefaultActionParams">Save</button> ');
	});
	
	$("body").on("click", ".saveDefaultActionParams", function(e) {
		
		e.preventDefault();
	
		var typeAndId = $(this).parent().prop("id").replace("DefaultAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2];
		var actionIndex = parseInt(temp[2]);
		
		var params = $('#' + type + 'DefaultActionParamsInput_' + id).prop("value");
		$('#' + type + 'DefaultActionParamsInput_' + id).prop("disabled", true);
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].defaultActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].defaultActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].defaultActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].defaultActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		var paramsArray = params.split(",");
		
		if (paramsArray.length == 1 && paramsArray[0].trim() == "") {
			paramsArray = [];
		}
		for (var i = 0; i < paramsArray.length; i++) {
			paramsArray[i] = paramsArray[i].trim();
			if (paramsArray[i] == "true") {
				paramsArray[i] = true;
			}
			else if (paramsArray[i] == "false") {
				paramsArray[i] = false;
			}
			else if (!isNaN(paramsArray[i])) {
				paramsArray[i] = parseFloat(paramsArray[i]);
			}
		}
		var actionName = "";
		if (jQuery.type(actionArray[actionIndex]) === "string" && actions[actionArray[actionIndex]] != undefined) {
			actionName = actionArray[actionIndex];
		}
		else if (jQuery.type(actionArray[actionIndex]) === "array") {
			actionName = actionArray[actionIndex][0];
		}
		var newAction = [];
		newAction.push(actionName);
		// join arrays
		actionArray[actionIndex] = newAction.concat(paramsArray);
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove save button
		$(this).remove();
		activateDefaultActionsAndTasks(type);
	});
	
	$("body").on("click", ".editDefaultTask", function(e) {
		
		e.preventDefault();
		// Disable edit buttons
		$("#" + $(this).parent().parent().prop("id") + " .editDefaultTask").prop("disabled", true);
		$(this).hide();
		var type = $(this).parent().parent().prop("id").replace("DefaultActionsList", "");
		
		// Disable selection
		$("#" + type + "AddDefaultActionSelect").prop("disabled", true);
		// disable delete buttons
		$("#" + type + "DefaultActionsList .deleteDefaultAction").prop("disabled", true);
		$("#" + type + "DefaultActionsList .deleteDefaultTask").prop("disabled", true);
		$('#' + type + 'DefaultActionsList .editDefaultActionParams').prop("disabled", true);
		$("#" + type + "AddDefaultAction").prop("disabled", true);
		var id = $(this).parent().prop("id").replace(type + "DefaultAction_", "");
		// enable delete buttons on this item
		$("#" + $(this).parent().prop("id") + " .deleteDefaultAction").prop("disabled", false);
		$("#" + $(this).parent().prop("id") + " .deleteDefaultTask").prop("disabled", false);
		$('#' + type + 'DefaultTaskWait_' + id).prop("disabled", false);
		$('#' + type + 'DefaultTaskNameInput_' + id).show();
		$('#' + type + 'DefaultTaskNameInput_' + id).change();
		$('#' + type + 'DefaultTaskName_' + id).hide();
		$('#' + type + 'DefaultTaskParamsInput_' + id).show();
		$('#' + type + 'DefaultTaskParams_' + id).hide();
		$('#' + type + 'DefaultAction_' + id + ' .deleteDefaultTask').show();
		$(this).parent().append('<button class="saveDefaultTask">Save</button> ');
		//$("#actionTasksList").sortable( "option", "disabled", true );
	});
	
	$("body").on("click", ".editConditionalTask", function(e) {
		
		e.preventDefault();

		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").prop("disabled", true);
		$(this).hide();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];
		
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalAction").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalActionSelect").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalActionParams").prop("disabled", true);
		$("#" + type + "AddCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteCondition").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalAction").prop("disabled", true);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalTask").prop("disabled", true);
		
		$("#" + $(this).parent().prop("id") + " .deleteConditionalTask").prop("disabled", false);
		$('#' + type + 'ConditionalTaskWait_' + id).prop("disabled", false);
		$('#' + type + 'ConditionalTaskNameInput_' + id).show();
		$('#' + type + 'ConditionalTaskNameInput_' + id).change();
		$('#' + type + 'ConditionalTaskName_' + id).hide();
		$('#' + type + 'ConditionalTaskParamsInput_' + id).show();
		$('#' + type + 'ConditionalTaskParams_' + id).hide();
		$('#' + type + 'ConditionalAction_' + id + ' .deleteConditionalTask').show();
		$(this).parent().append('<button class="saveConditionalTask">Save</button> ');
		
		//$("#actionTasksList").sortable( "option", "disabled", true );
	});
	
	$("body").on("click", ".saveDefaultTask", function(e) {
		
		e.preventDefault();
		// Show edit button
		$('#' + $(this).parent().prop("id") + ' .editDefaultTask').show();
		
		var type = $(this).parent().parent().prop("id").replace("DefaultActionsList", "");
		$("#" + type + "AddDefaultActionSelect").prop("disabled", false);
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].defaultActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].defaultActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].defaultActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].defaultActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		var id = $(this).parent().prop("id").replace(type + "DefaultAction_", "");
		var params = $('#' + type + 'DefaultTaskParamsInput_' + id).prop("value");
		$('#' + type + 'DefaultTaskParams_' + id).html(params);
		var paramsArray = params.split(",");
		
		if (paramsArray.length == 1 && paramsArray[0].trim() == "") {
			paramsArray = [];
		}
		for (var i = 0; i < paramsArray.length; i++) {
			paramsArray[i] = paramsArray[i].trim();
			if (paramsArray[i] == "true") {
				paramsArray[i] = true;
			}
			else if (paramsArray[i] == "false") {
				paramsArray[i] = false;
			}
			else if (!isNaN(paramsArray[i])) {
				paramsArray[i] = parseFloat(paramsArray[i]);
			}
		}
		$('#' + type + 'DefaultTaskWait_' + id).prop("disabled", true);
		var wait = undefined;
		if ($('#' + type + 'DefaultTaskWait_' + id).prop("checked")) {
			wait = true;
		}
		var temp = id.split("_");
		var index = parseInt(temp[1]);
		actionArray[index].params = paramsArray;
		actionArray[index].name = $('#' + type + 'DefaultTaskNameInput_' + id).prop("value");
		actionArray[index].wait = wait;
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		
		$('#' + type + 'DefaultTaskNameInput_' + id).hide();
		$('#' + type + 'DefaultTaskName_' + id).html(actionArray[index].name);
		$('#' + type + 'DefaultTaskName_' + id).show();
		$('#' + type + 'DefaultTaskParamsInput_' + id).hide();
		$('#' + type + 'DefaultTaskParams_' + id).show();
		$(this).remove();
		
		activateDefaultActionsAndTasks(type);
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$("body").on("click", ".deleteDefaultTask", function(e) {
		
		e.preventDefault();

		var type = $(this).parent().parent().prop("id").replace("DefaultActionsList", "");		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].defaultActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].defaultActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].defaultActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].defaultActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		var id = $(this).parent().prop("id").replace(type + "DefaultAction_", "");
		var temp = id.split("_");
		var index = parseInt(temp[1]);
		if (!confirm("Delete default task " + actionArray[index].name + "?")) {
			return;
		}
		actionArray.splice(index, 1);
		
		$("#" + type + "DefaultActionsNbr").html("");
		if (actionArray.length > 0) {
			$("#" + type + "DefaultActionsNbr").html("(" + actionArray.length + ")");
		}
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove item
		$(this).parent().remove();
		fixDefaultActionIds(type, temp[0]);
		activateDefaultActionsAndTasks(type);
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$("body").on("click", ".saveConditionalTask", function(e) {
		
		e.preventDefault();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];

		var conditionIndex = parseInt(temp[2]);
		var resultIndex = parseInt(temp[3]);
		
		// Show and enable edit buttons
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").show();
		$("#" + type + "AddCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalAction").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteConditionalTask").prop("disabled", false);
		
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .addConditionalActionSelect").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalActionParams").prop("disabled", false);
		
		if ($("#" + type + "AddConditionalActionSelect_" + temp[1] + "_" + temp[2]).prop("value") != "-1") {
			$("#" + type + "AddConditionalAction_" + temp[1] + "_" + temp[2]).prop("disabled", false);
		}
		$('#' + type + 'ConditionalTaskWait_' + id).prop("disabled", true);
		var name = $('#' + type + 'ConditionalTaskNameInput_' + id).prop("value");
		$('#' + type + 'ConditionalTaskNameInput_' + id).hide();
		$('#' + type + 'ConditionalTaskName_' + id).html(name);
		$('#' + type + 'ConditionalTaskName_' + id).show();
		var params = $('#' + type + 'ConditionalTaskParamsInput_' + id).prop("value");
		$('#' + type + 'ConditionalTaskParamsInput_' + id).hide();
		$('#' + type + 'ConditionalTaskParams_' + id).html(params);
		$('#' + type + 'ConditionalTaskParams_' + id).show();
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions[conditionIndex].results;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions[conditionIndex].results;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions[conditionIndex].results;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions[conditionIndex].results;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		var paramsArray = params.split(",");
		
		if (paramsArray.length == 1 && paramsArray[0].trim() == "") {
			paramsArray = [];
		}
		for (var i = 0; i < paramsArray.length; i++) {
			paramsArray[i] = paramsArray[i].trim();
			if (paramsArray[i] == "true") {
				paramsArray[i] = true;
			}
			else if (paramsArray[i] == "false") {
				paramsArray[i] = false;
			}
			else if (!isNaN(paramsArray[i])) {
				paramsArray[i] = parseFloat(paramsArray[i]);
			}
		}
		
		var wait = undefined;
		if ($('#' + type + 'ConditionalTaskWait_' + id).prop("checked")) {
			wait = true;
		}
		actionArray[resultIndex].params = paramsArray;
		actionArray[resultIndex].name = name
		actionArray[resultIndex].wait = wait;
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove save button
		$(this).remove();
	});
	
	$("body").on("click", ".deleteConditionalTask", function(e) {
		
		e.preventDefault();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];

		var conditionIndex = parseInt(temp[2]);
		var resultIndex = parseInt(temp[3]);
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions[conditionIndex].results;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions[conditionIndex].results;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions[conditionIndex].results;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions[conditionIndex].results;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		if (!confirm("Delete conditional task " + actionArray[resultIndex].name + "?")) {
			return;
		}
		// Show edit buttons
		$('#' + type + 'ConditionalAction_' + id + ' .editConditionalTask').show();
		// Enable edit buttons
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editConditionalTask").prop("disabled", false);
		$("#" + type + "AddCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .editCondition").prop("disabled", false);
		$("#" + $(this).parent().parent().parent().parent().parent().prop("id") + " .deleteCondition").prop("disabled", false);
		
		if ($("#" + type + "AddConditionalActionSelect_" + conditionIndex).prop("value") != "-1") {
			$("#" + type + "AddConditionalAction_" + conditionIndex).prop("disabled", false);
		}

		actionArray.splice(resultIndex, 1);
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove item
		$(this).parent().remove();
		
		fixConditionResultIds(type, temp[1], conditionIndex);
		activateConditions(type);
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$("body").on("click", ".deleteDefaultAction", function(e) {
		
		e.preventDefault();

		var type = $(this).parent().parent().prop("id").replace("DefaultActionsList", "");

		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].defaultActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].defaultActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].defaultActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].defaultActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		var id = $(this).parent().prop("id").replace(type + "DefaultAction_", "");
		
		var temp = id.split("_");
		var index = parseInt(temp[1]);
		
		var deleteName = "";
		if (jQuery.type(actionArray[index]) === 'array') {
			deleteName = actionArray[index][0];
		}
		else {
			deleteName = actionArray[index]
		}
		if (!confirm("Delete default action " + deleteName + "?")) {
			return;
		}
		actionArray.splice(index, 1);
		
		$("#" + type + "DefaultActionsNbr").html("");
		if (actionArray.length > 0) {
			$("#" + type + "DefaultActionsNbr").html("(" + actionArray.length + ")");
		}
		
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove item
		$(this).parent().remove();
		fixDefaultActionIds(type, temp[0]);
		activateDefaultActionsAndTasks(type);
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$("body").on("click", ".deleteConditionalAction", function(e) {
		
		e.preventDefault();
		
		var typeAndId = $(this).parent().prop("id").replace("ConditionalAction", "");
		var temp = typeAndId.split("_");
		var type = temp[0];
		var id = temp[1] + '_' + temp[2] + '_' + temp[3];

		var conditionIndex = parseInt(temp[2]);
		var resultIndex = parseInt(temp[3]);

		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		if (type == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions[conditionIndex].results;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (type == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions[conditionIndex].results;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (type == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions[conditionIndex].results;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (type == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions[conditionIndex].results;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		var deleteName = "";
		if (jQuery.type(actionArray[resultIndex]) === 'array') {
			deleteName = actionArray[resultIndex][0];
		}
		else {
			deleteName = actionArray[resultIndex]
		}
		if (!confirm("Delete conditional action " + deleteName + "?")) {
			return;
		}
		actionArray.splice(resultIndex, 1);
		
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		// Remove item
		$(this).parent().remove();
		
		fixConditionResultIds(type, temp[1], conditionIndex);
		activateConditions(type);
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$(".addCondition").click(function() {
		
		var type = $(this).prop("id").replace("AddCondition", "");
		createNewCondition(type);
	});
	
	$("body").on("click", ".deleteCondition", function(e) {
		
		e.preventDefault();
		// Get identifier from parents for correct id:s 
		var identifier = $(this).parent().parent().prop("class").replace("Condition", "");
		var id = $(this).parent().parent().prop("id").replace(identifier + 'Condition_', "");
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		var temp = id.split("_");
		var conditionIndex = parseInt(temp[1]);
		
		if (identifier == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (identifier == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (identifier == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (identifier == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		if (!confirm("Delete " + (conditionIndex + 1) + ". condition?")) {
			return;
		}
		actionArray.splice(conditionIndex, 1);
		
		$("#" + identifier + "ConditionalActionsNbr").html("");
		if (actionArray.length > 0) {
			$("#" + identifier + "ConditionalActionsNbr").html("(" + actionArray.length + ")");
		}
		
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		
		// Remove item
		$(this).parent().parent().remove();
		
		activateConditions(identifier);
		fixConditionalActionConditionIds(identifier, temp[0]);
		
		//$("#actionTasksList").sortable( "option", "disabled", false );
	});
	
	$("body").on("click", ".editCondition", function(e) {
		
		e.preventDefault();
		// Get identifier from parents for correct id:s 
		var identifier = $(this).parent().parent().prop("class").replace("Condition", "");
		var id = $(this).parent().parent().prop("id").replace(identifier + 'Condition_', "");
		
		// Disable all from conditions
		$('#' + identifier + 'AddCondition').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .addConditionalActionSelect').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .addConditionalAction').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .deleteConditionalAction').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .editConditionalActionParams').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .deleteCondition').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .editCondition').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .deleteConditionalTask').prop("disabled", true);
		$('#' + identifier + 'ConditionalActionsList .editConditionalTask').prop("disabled", true);

		// Enable necessary things for this condition
		$('#' + identifier + 'Condition_' + id + ' .deleteCondition').prop("disabled", false);
		$('#' + identifier + 'Condition_' + id + ' .saveCondition').prop("disabled", false);
		// Hide and show elements
		$('#' + identifier + 'Condition_' + id + ' .saveCondition').show();
		$('#' + identifier + 'Condition_' + id + ' .conditionInput').prop("disabled", false);
		
		$(this).hide();
	});
	
	$("body").on("click", ".saveCondition", function(e) {
		
		e.preventDefault();
		
		// Get identifier from parents for correct id:s 
		var identifier = $(this).parent().parent().prop("class").replace("Condition", "");
		var id = $(this).parent().parent().prop("id").replace(identifier + 'Condition_', "");
		
		var activeIndex = -1;
		var actionArray = [];
		var arrayToSave = [];
		var filename = "";
		
		var temp = id.split("_");
		var conditionIndex = parseInt(temp[1]);
		
		if (identifier == "room") {
			activeIndex = activeRoomIndex;
			actionArray = rooms[activeRoomIndex].conditionalActions;
			arrayToSave = rooms;
			filename = "json/rooms.json";
		}
		else if (identifier == "asset") {
			activeIndex = activeAssetIndex;
			actionArray = assets[activeAssetIndex].conditionalActions;
			arrayToSave = assets;
			filename = "json/assets.json";
		}
		else if (identifier == "dialog") {
			activeIndex = activeDialogIndex;
			actionArray = dialogs[activeDialogIndex].conditionalActions;
			arrayToSave = dialogs;
			filename = "json/dialogs.json";
		}
		else if (identifier == "character") {
			activeIndex = activeCharacterIndex;
			actionArray = characters[activeCharacterIndex].conditionalActions;
			arrayToSave = characters;
			filename = "json/characters.json";
		}
		
		var condition = $('#' + identifier + 'Condition_' + id + ' .conditionInput').prop("value").split('"').join('\'');
		var conditionStatesArray = getGameStatesFromCondition(condition);

		if (conditionStatesArray.length == 1 && conditionStatesArray[0].trim() == "") {
			conditionStatesArray = [];
		}
		for (var i = 0; i < conditionStatesArray.length; i++) {
			conditionStatesArray[i] = conditionStatesArray[i].trim();
		}
		
		actionArray[conditionIndex].condition = condition;
		actionArray[conditionIndex].gamestates = conditionStatesArray;
		
		// Create json file
		saveJSObjectAsJSON(arrayToSave, filename);
		
		activateConditions(identifier);
		
		$('#' + identifier + 'Condition_' + id + ' .editCondition').show();
		$(this).hide();
		$('#' + identifier + 'Condition_' + id + ' .conditionInput').prop("disabled", true);
	});
	
	$("body").on("change", ".defaultTaskSelection", function(e) {
		
		var value = $(this).prop("value");
		var identifier = $(this).parent().prop("className").replace("Action", "");
		var id = $(this).prop("id").replace(identifier + "DefaultTaskNameInput_", "");
		// Remove autocompletes
		var taskInput = $('#' + identifier + 'DefaultTaskParamsInput_' + id);
		if (taskInput.hasClass("launchDialogueAutocomplete") || taskInput.hasClass("changeGamestateAutocomplete") ||
				taskInput.hasClass("assetNameAutocomplete") || taskInput.hasClass("assetNameWithParameterAutocomplete") || taskInput.hasClass("assetModifyAutocomplete") ||
				taskInput.hasClass("assetMoveAutocomplete") || taskInput.hasClass("assetAnimationAutocomplete") ||
				taskInput.hasClass("npcAnimationAutocomplete") || taskInput.hasClass("npcModifyAutocomplete") ||
				taskInput.hasClass("npcMoveAutocomplete") || taskInput.hasClass("roomNameAutocomplete") || taskInput.hasClass("roomNameWithParameterAutocomplete")
			) {
			
			taskInput.removeClass("launchDialogueAutocomplete changeGamestateAutocomplete assetNameAutocomplete assetNameWithParameterAutocomplete assetModifyAutocomplete roomNameAutocomplete");
			taskInput.removeClass("assetMoveAutocomplete assetAnimationAutocomplete npcAnimationAutocomplete npcModifyAutocomplete npcMoveAutocomplete roomNameWithParameterAutocomplete");
			taskInput.autocomplete("destroy");
		}
		// Add autocompletes
		if (value == "launchDialogue") {
			taskInput.addClass("launchDialogueAutocomplete");
			taskInput.autocomplete({
				source: dialogueSearch
			});
		}
		else if (value == "changeGamestate") {
			taskInput.addClass("changeGamestateAutocomplete");
			taskInput.autocomplete({
				source: availableGameStates,
				select: function(event, ui) {
					event.preventDefault();
					var type = getGamestateType(ui.item.value);
					$(this).val(ui.item.value + ', ' + type + ', false'); // last parameter is increment
				}
			});
		}
    else if (value == "showAsset" || value == "modifyDoor") {
      taskInput.addClass("assetNameWithParameterAutocomplete");
      taskInput.data("parameter", "keepDisabled");
      if (value == "modifyDoor") secondParameter = taskInput.data("parameter", "boolean");
			taskInput.autocomplete({
        source: assetSearch,
        select: function(event, ui) {
          event.preventDefault();
          $(this).val(ui.item.value + ', ' + $(this).data("parameter"));
        }
      });
    }
		else if (value == "hideAsset" || value == "addToInventory" || value == "removeFromInventory") {
			taskInput.addClass("assetNameAutocomplete");
			taskInput.autocomplete({
				source: assetSearch
			});
		}
		else if (value == "modifyAsset") {
			taskInput.addClass("assetModifyAutocomplete");
			taskInput.autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', property, value');
				}
			});
		}
		else if (value == "moveAssetTo") {
			taskInput.addClass("assetMoveAutocomplete");
			taskInput.autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val('x, y, ' + ui.item.value + ', velocity');
				}
			});
		}
		else if (value == "playAnimation") {
			taskInput.addClass("assetAnimationAutocomplete");
			taskInput.autocomplete({
				source: assetSearch.concat(npcSearch).sort(),
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName');
				}
			});
		}
		else if (value == "playNpcAnimation") {
			taskInput.addClass("npcAnimationAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName, loop');
				}
			});
		}
		else if (value == "modifyNpc") {
			taskInput.addClass("npcModifyAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', operation, value(only with some operations)');
				}
			});
		}
		else if (value == "moveNpcTo") {
			taskInput.addClass("npcMoveAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', targetX, velocity');
				}
			});
		} else if (value == "flipNpc") {
      taskInput.addClass("npcMoveAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
          $(this).val(ui.item.value + ', target');
        }
      });
		} else if (value == "teleport") {
			taskInput.addClass("roomNameAutocomplete");
			taskInput.autocomplete({
				source: roomSearch
			});
		} else if (value == "changeMusic") {
			taskInput.addClass("roomNameWithParameterAutocomplete");
			taskInput.autocomplete({
				source: roomSearch,
        select: function(event, ui) {
					event.preventDefault();
          $(this).val(ui.item.value + ', musicName');
        }
			});
		}
	});
	
	$("body").on("change", ".conditionalTaskSelection", function(e) {
		
		var value = $(this).prop("value");
		var identifier = $(this).parent().prop("className").replace("Action", "");
		var id = $(this).prop("id").replace(identifier + "ConditionalTaskNameInput_", "");
		// Remove autocompletes
		var taskInput = $('#' + identifier + 'ConditionalTaskParamsInput_' + id);
		if (taskInput.hasClass("launchDialogueAutocomplete") || taskInput.hasClass("changeGamestateAutocomplete") ||
				taskInput.hasClass("assetNameAutocomplete") || taskInput.hasClass("assetNameWithParameterAutocomplete") || taskInput.hasClass("assetModifyAutocomplete") ||
				taskInput.hasClass("assetMoveAutocomplete") || taskInput.hasClass("assetAnimationAutocomplete") ||
				taskInput.hasClass("npcAnimationAutocomplete") || taskInput.hasClass("npcModifyAutocomplete") ||
				taskInput.hasClass("npcMoveAutocomplete") || taskInput.hasClass("roomNameAutocomplete") || taskInput.hasClass("roomNameWithParameterAutocomplete")
			) {
			
			taskInput.removeClass("launchDialogueAutocomplete changeGamestateAutocomplete assetNameAutocomplete assetNameWithParameterAutocomplete assetModifyAutocomplete roomNameAutocomplete");
			taskInput.removeClass("assetMoveAutocomplete assetAnimationAutocomplete npcAnimationAutocomplete npcModifyAutocomplete npcMoveAutocomplete roomNameWithParameterAutocomplete");
			taskInput.autocomplete("destroy");
		}
		// Add autocompletes
		if (value == "launchDialogue") {
			taskInput.addClass("launchDialogueAutocomplete");
			taskInput.autocomplete({
				source: dialogueSearch
			});
		}
		else if (value == "changeGamestate") {
			taskInput.addClass("changeGamestateAutocomplete");
			taskInput.autocomplete({
				source: availableGameStates,
				select: function(event, ui) {
					event.preventDefault();
					var type = getGamestateType(ui.item.value);
					$(this).val(ui.item.value + ', ' + type + ', false'); // last parameter is increment
				}
			});
		}
    else if (value == "showAsset" || value == "modifyDoor") {
      taskInput.addClass("assetNameWithParameterAutocomplete");
      taskInput.data("parameter", "keepDisabled");
      if (value == "modifyDoor") secondParameter = taskInput.data("parameter", "boolean");
			taskInput.autocomplete({
        source: assetSearch,
        select: function(event, ui) {
          event.preventDefault();
          $(this).val(ui.item.value + ', ' + $(this).data("parameter"));
        }
      });
    }
		else if (value == "hideAsset" || value == "addToInventory" || value == "removeFromInventory") {
			taskInput.addClass("assetNameAutocomplete");
			taskInput.autocomplete({
				source: assetSearch
			});
		}
		else if (value == "modifyAsset") {
			taskInput.addClass("assetModifyAutocomplete");
			taskInput.autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', property, value');
				}
			});
		}
		else if (value == "moveAssetTo") {
			taskInput.addClass("assetMoveAutocomplete");
			taskInput.autocomplete({
				source: assetSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val('x, y, ' + ui.item.value + ', velocity');
				}
			});
		}
		else if (value == "playAnimation") {
			taskInput.addClass("assetAnimationAutocomplete");
			taskInput.autocomplete({
				source: assetSearch.concat(npcSearch).sort(),
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName');
				}
			});
		}
		else if (value == "playNpcAnimation") {
			taskInput.addClass("npcAnimationAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', animationName, loop');
				}
			});
		}
		else if (value == "modifyNpc") {
			taskInput.addClass("npcModifyAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', operation, value(only with some operations)');
				}
			});
		}
		else if (value == "moveNpcTo") {
			taskInput.addClass("npcMoveAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
					$(this).val(ui.item.value + ', targetX, velocity');
				}
			});
		} else if (value == "flipNpc") {
      taskInput.addClass("npcMoveAutocomplete");
			taskInput.autocomplete({
				source: npcSearch,
				select: function(event, ui) {
					event.preventDefault();
          $(this).val(ui.item.value + ', target');
        }
      });
    } else if (value == "teleport") {
      taskInput.addClass("roomNameAutocomplete");
			taskInput.autocomplete({
				source: roomSearch
			});
    } else if (value == "changeMusic") {
			taskInput.addClass("roomNameWithParameterAutocomplete");
			taskInput.autocomplete({
				source: roomSearch,
        select: function(event, ui) {
					event.preventDefault();
          $(this).val(ui.item.value + ', musicName');
        }
			});
		}
	});
	
	$('#createJSONObject').click(function() {
	
		// Whole config
		//saveJSObjectAsJSON(Config, "JSObject.js");
		// Rooms
		//saveJSObjectAsJSON(Config.rooms, "json/rooms.json");
		// spriteAtlases
		//saveJSObjectAsJSON(Config.spriteAtlases, "json/spriteAtlases.json");
		// Actions
		//saveJSObjectAsJSON(Config.actions, "json/actions.json");
		// Assets
		//saveJSObjectAsJSON(Config.assets, "json/assets.json");
		// Sounds
		//saveJSObjectAsJSON(Config.sounds, "json/sounds.json");
		// Dialogs
		//saveJSObjectAsJSON(Config.dialogs, "json/dialogs.json");
	});

	function exportConfigJS () {
		// Get corresponding default and conditional actions to rooms, assets and dialogs
		var modifiedRooms = convertActionsToTasks(rooms);
		var modifiedAssets = convertActionsToTasks(assets);
		var modifiedDialogs = convertActionsToTasks(dialogs);
		var modifiedCharacters = convertActionsToTasks(characters);
		var modifiedGamestates = createActualGamestates();
		var modifiedSpriteAtlases = groupSpriteAtlases();
		var modifiedSounds = groupSounds();
		
		for (var i = 0; i < modifiedRooms.length; i++) {
			modifiedRooms[i].npcs = [];
			for (var j = 0; j < modifiedCharacters.length; j++) {
				if (modifiedCharacters[j].room == modifiedRooms[i].name) {
					modifiedRooms[i].npcs.push(modifiedCharacters[j].machineName);
				}
			}
			
		}
		for (var i = 0; i < modifiedCharacters.length; i++) {
			if (modifiedCharacters[i].foreground == undefined) {
				modifiedCharacters[i].foreground = false;
			}
		}
		// Post via ajax for saving those to disk
		$.post("index.php", {action: 'createConfigFile', rooms: JSON.stringify(modifiedRooms), spriteAtlases: JSON.stringify(modifiedSpriteAtlases), actions: JSON.stringify(actions), assets: JSON.stringify(modifiedAssets), sounds: JSON.stringify(modifiedSounds), dialogs: JSON.stringify(modifiedDialogs), gamestates: JSON.stringify(modifiedGamestates), characters: JSON.stringify(modifiedCharacters), filename: '../app/config.js' }, "json").done();
	}

	$('#createJSObject').click(function() {
		exportConfigJS();
	});

	$('#exportAndLaunch').click(function() {
		exportConfigJS();
		window.open("http://localhost:8081");
	});

	$('#createAsset').click(function() {
		$('#front').hide();
		$('#assetView').show();
	});

	function importRoomsAndAssetsFunction () {
		$.post("index.php", { action: 'importGameObjects' }, "json").done(
			function(response) {
				importRoomsAndAssets(response);

				generateAssetFilterSelection();
				refreshAssetAutocomplete();
				$("#roomsView #roomSelection").prop("value", "-1");
				$("#roomsView #roomSelection").change();
				$("#assetsView .assetSelection").prop("value", "-1");
				$("#assetsView .assetSelection").change();
			}
		);
	}
  
	$("#importRoomsAndAssets").click(function(e) {
		e.preventDefault();
		importRoomsAndAssetsFunction();
	});

	function importAudiosFunction () {
		$.post("index.php", { action: 'importAudios' }, "json").done(
			function(response) {
				importAudios(response);
				$("#roomsView #roomSelection").prop("value", "-1");
				$("#roomsView #roomSelection").change();
				$("#dialogsView .dialogSelection").prop("value", "-1");
				$("#dialogsView .dialogSelection").change();
				$("#assetsView .assetSelection").prop("value", "-1");
				$("#assetsView .assetSelection").change();
			}
		);
	}

	$("#importAudios").click(function(e) {
		e.preventDefault();
		importAudiosFunction();
	});

	$("#importAll").click(function(e) {
		e.preventDefault();
		importRoomsAndAssetsFunction();
		importAudiosFunction();
	});

	// Find gamestates and select room view on start
	updateGamestates();
	
	// Initialize layout
	var outerLayout, middleLayout, innerLayout_Center, innerLayout_South;

	function createLayouts () {

		outerLayout = $('#container').layout({
				name:					"outer"
			,	spacing_open:			3 // ALL panes
			,	spacing_closed:			8 // ALL panes
			,	center__paneSelector:	"#mainWindow"
			//,	south__paneSelector:	"#spriteAtlasesView"
			//,	south__size:			90
			,	east__paneSelector:	"#gamestatesView"
			,	east__size:				300
			,	minSize:				50
			,	enableCursorHotkey:		false
		});

		middleLayout = $('#mainWindow').layout({
				name:					"middle"
			,	center__paneSelector:	"#topWindow"
			,	south__paneSelector:	"#bottomWindow"
			,	south__size:				.50
			,	minSize:				50
			,	spacing_open:			3 // ALL panes
			,	spacing_closed:			8 // ALL panes
			,	enableCursorHotkey:		false
		});

		innerLayout_Center = $('#topWindow').layout({
				name:					"innerCenter"
			,	center__paneSelector:	"#roomsView"
			,	east__paneSelector:		"#assetsView"
			,	east__size:				.50
			,	minSize:				50
			,	spacing_open:			3 // ALL panes
			,	spacing_closed:			8 // ALL panes
			,	enableCursorHotkey:		false
		});

		innerLayout_South = $('#bottomWindow').layout({
				name:					"innerSouth"
			,	center__paneSelector:	"#dialogsView"
			,	west__paneSelector:		"#actionsView"
			,	west__size:				.50
			,	minSize:				50
			,	spacing_open:			3 // ALL panes
			,	spacing_closed:			8 // ALL panes
			//,	west__spacing_closed:	12
			,	enableCursorHotkey:		false
		});

	};
	if (window.loggedIn) {
    createLayouts();
  }
});

/***********************************************
* JAVASCRIPT FUNCTIONS
***********************************************/

// Updates gamestates based on references
function updateGamestates() {
  
  $("#gamestatesList").empty();
  availableGameStates = [];
  if (gamestates == undefined) {
    gamestates = [];
  }
  gamestateRefecences = [];
  
  // Get gamestates from conditional actions of rooms, assets and dialogs
  getUsedGameStates(rooms, gamestates, gamestateRefecences);
  getUsedGameStates(assets, gamestates, gamestateRefecences);
  getUsedGameStates(dialogs, gamestates, gamestateRefecences);
  // Get gamestates from actions
  for (var action in actions) {
    
    for (var i = 0; i < actions[action].tasks.length; i++) {
      
      if (actions[action].tasks[i].name == "changeGamestate") {
        
        var index = -1;
        for (var g = 0; g < gamestates.length; g++) {
            
            if (gamestates[g].name == actions[action].tasks[i].params[0]) {
              index = g;
              break;
            }
          }
          if (index == -1) {

          }
          else {
            if (gamestateRefecences[index] == undefined) {
              gamestateRefecences[index] = 1;
            }
            gamestateRefecences[index]++;
          }
      }
    }
  }
  // Add gamestates to list
  var activeRoom = "";
  var money = 0;
  for (var i = 0; i < gamestates.length; i++) {
    // Skip active room and add it later
    if (gamestates[i].name == "activeRoom") {
      activeRoom = gamestates[i].value;
      continue;
    }
    else if (gamestates[i].name == "money") {
      money = gamestates[i].value;
      continue;
    }
    var stateItem = '<li id="gamestate_' + gamestates[i].id + '"><button class="deleteGamestateButton">X</button> (';
    if (gamestateRefecences[i] != undefined) {
      stateItem += gamestateRefecences[i];
    }
    else {
      stateItem += "0";
    }
    stateItem += ") " + gamestates[i].name + " - " + gamestates[i].type + ": " + gamestates[i].value + '</li>';
    $("#gamestatesList").append(stateItem);
    // Add state to available list used by autocomplete
    availableGameStates.push(gamestates[i].name);
  }
  // Add starting room to list
  if (activeRoom != "") {
    $("#gamestatesList").append('<li>(Starting Room) activeRoom : ' + activeRoom + '</li>');
    availableGameStates.push("activeRoom");
  }
  // Add money to list
  $("#gamestatesList").append('<li>(Player Money) money : ' + money + '</li>');
  availableGameStates.push("money");
  // Add default character to list
  var charName = "";
  for (var i = 0; i < characters.length; i++) {
    if (characters[i].id == misc.defaultCharacterId) {
      charName = characters[i].machineName;
      break;
    }
  }
  $("#gamestatesList").append('<li>(' + charName + ') character : ' + misc.defaultCharacterId + '</li>');
  availableGameStates.push("character");
  // Create gamestates for inventory items too
  for (var i = 0; i < assets.length; i++) {
    if (assets[i].pickable) {
      var found = false;
      // Check that it isn't defined already in gamestates
      for (var j = 0; j < gamestates.length; j++) {
        if (gamestates[j].name == (assets[i].name + "InInv")) {
          found = true;
          break;
        }
      }
      if (!found) {
        var stateItem = '<li>(INV) '+ assets[i].name + 'InInv : false</li>';
        $("#gamestatesList").append(stateItem);
        availableGameStates.push(assets[i].name + "InInv");
      }
    }
  }
  availableGameStates.sort();
  $('.changeGamestateAutocomplete').autocomplete({
    source: availableGameStates,
    select: function(event, ui) {
      event.preventDefault();
      var type = getGamestateType(ui.item.value);
      $(this).val(ui.item.value + ', ' + type + ', false'); // last parameter is increment
    }
  });
}

// Finds gamestates from conditional actions  and adds new gamestates to given gamestates array while updating given reference array numbers
function getUsedGameStates(objectArray, gamestatesArray, gamestateRefecencesArray) {
  
  for (var i = 0; i < objectArray.length; i++) {
    if (objectArray[i].conditionalActions != undefined) {
      for (var j = 0; j < objectArray[i].conditionalActions.length; j++) {
        for (var k = 0; k < objectArray[i].conditionalActions[j].gamestates.length; k++) {
          
          var index = -1;
          for (var g = 0; g < gamestatesArray.length; g++) {
            
            if (gamestatesArray[g].name == objectArray[i].conditionalActions[j].gamestates[k]) {
              index = g;
              break;
            }
          }
          if (index == -1) {
            //gamestatesArray.push(objectArray[i].conditionalActions[j].gamestates[k]);
            //gamestateRefecencesArray.push(1);
          }
          else {
            if (gamestateRefecencesArray[index] == undefined) {
              gamestateRefecencesArray[index] = 1;
            }
            gamestateRefecencesArray[index]++;
          }
        }
      }
    }
  }
}

// TODO: go through asset and dialog audios too
function groupSounds() {
	
	var modifiedSounds = {general:[], audioSprites:[], music: music};
	var usedIndexesGeneral = [];
	var usedIndexesAudioSprites = [];
	var lastIndexGeneral = 0;
	var lastIndexAudioSprites = 0;
	
	for (var i = 0; i < rooms.length; i++) {
		if (rooms[i].group != undefined && rooms[i].group != "") {
			var groupIndex = parseInt(rooms[i].group);
			if (lastIndexGeneral < groupIndex) {
				lastIndexGeneral = groupIndex;
			}
			if (lastIndexAudioSprites < groupIndex) {
				lastIndexAudioSprites = groupIndex;
			}
			for (var j = 0; j < sounds.general.length; j++) {
				if (sounds.general[j][0] == rooms[i].name) {
					if (modifiedSounds.general[groupIndex] == undefined) {
						modifiedSounds.general[groupIndex] = [];
					}
					modifiedSounds.general[groupIndex].push(jQuery.extend(true, [], sounds.general[j]));
					if (usedIndexesGeneral.indexOf(j) == -1) {
						usedIndexesGeneral.push(j);
					}
					break;
				}
			}
			for (var j = 0; j < sounds.audioSprites.length; j++) {
				if (sounds.audioSprites[j][0] == rooms[i].name) {
					if (modifiedSounds.audioSprites[groupIndex] == undefined) {
						modifiedSounds.audioSprites[groupIndex] = [];
					}
					modifiedSounds.audioSprites[groupIndex].push(jQuery.extend(true, [], sounds.general[j]));
					if (usedIndexesAudioSprites.indexOf(j) == -1) {
						usedIndexesAudioSprites.push(j);
					}
					break;
				}
			}
		}
	}
	
	if (modifiedSounds.general[0] == undefined) {
		modifiedSounds.general[0] = [];
	}
	if (modifiedSounds.audioSprites[0] == undefined) {
		modifiedSounds.audioSprites[0] = [];
	}
	for (var i = 0; i < sounds.general.length; i++) {
		if (usedIndexesGeneral.indexOf(i) == -1) {
			modifiedSounds.general[0].push(jQuery.extend(true, [], sounds.general[i]));
		}
	}
	for (var i = 0; i < sounds.audioSprites.length; i++) {
		if (usedIndexesAudioSprites.indexOf(i) == -1) {
			modifiedSounds.audioSprites[0].push(jQuery.extend(true, [], sounds.audioSprites[i]));
		}
	}
	for (var i = 0; i < (lastIndexGeneral+1); i++) {
		if (modifiedSounds.general[i] == undefined) {
			modifiedSounds.general[i] = [];
		}
	}
	for (var i = 0; i < (lastIndexAudioSprites+1); i++) {
		if (modifiedSounds.audioSprites[i] == undefined) {
			modifiedSounds.audioSprites[i] = [];
		}
	}
	
	return modifiedSounds;
}

function groupSpriteAtlases() {
	
	var modifiedAtlases = [];
	var usedIndexes = [];
	var lastIndex = 0;
	
	for (var i = 0; i < rooms.length; i++) {
		if (rooms[i].group != undefined && rooms[i].group != "") {
			for (var j = 0; j < spriteAtlases.length; j++) {
				if (spriteAtlases[j][0] == rooms[i].atlasName) {
					var groupIndex = parseInt(rooms[i].group);
					if (modifiedAtlases[groupIndex] == undefined) {
						modifiedAtlases[groupIndex] = [];
					}
					modifiedAtlases[groupIndex].push(jQuery.extend(true, [], spriteAtlases[j]));
					if (usedIndexes.indexOf(j) == -1) {
						usedIndexes.push(j);
						if (lastIndex < groupIndex) {
							lastIndex = groupIndex;
						}
					}
					// Check that every asset in this room has atlases in this group
					for (var a = 0; a < rooms[i].assets.length; a++) {
						for (var as = 0; as < assets.length; as++) {
							if (assets[as].name == rooms[i].assets[a]) {
								
								if (assets[as].customAtlas != undefined && assets[as].customAtlas != "" && assets[as] != rooms[i].atlasName) {
									var found = false;
									for (var m = 0; m < modifiedAtlases[groupIndex].length; m++) {
										if (modifiedAtlases[groupIndex][m][0] == assets[as].customAtlas) {
											found = true;
											break;
										}
									}
									// Add asset atlas to group if not already
									if (!found) {
										// Find correct atlas
										for (var b = 0; b < spriteAtlases.length; b++) {
											if (spriteAtlases[b][0] == assets[as].customAtlas) {
												modifiedAtlases[rooms[i].group].push(jQuery.extend(true, [], spriteAtlases[b]));
												break;
											}
										}
										
									}
								}
								break;
							}
						}
					}
					break;
				}
			}
		}
	}
	
	if (modifiedAtlases[0] == undefined) {
		modifiedAtlases[0] = [];
	}
	for (var i = 0; i < spriteAtlases.length; i++) {
		if (usedIndexes.indexOf(i) == -1) {
			modifiedAtlases[0].push(jQuery.extend(true, [], spriteAtlases[i]));
		}
	}
	for (var i = 0; i < (lastIndex+1); i++) {
		if (modifiedAtlases[i] == undefined) {
			modifiedAtlases[i] = [];
		}
	}
	//modifiedAtlases.push(jQuery.extend(true, [], spriteAtlases));
	
	return modifiedAtlases;
}

function createSayerDropdown() {
	
	// Create npc autocomplete too
	npcSearch = [];
	$("#dialogSayer").empty();
	$("#dialogSayer").append('<option value="-1">None</option><option value="you">you</option>');
	var sayers = [];
	for (var i = 0; i < assets.length; i++) {
		if (assets[i].npc) {
			if (sayers.indexOf(assets[i].name) == -1) {
				sayers.push(assets[i].name);
			}
		} 
	}
	var playerChar = $('#playerCharacter > option[value="' + misc.defaultCharacterId + '"]').text();
	for (var i = 0; i < characters.length; i++) {
		if (sayers.indexOf(characters[i].machineName) == -1 && characters[i].machineName != playerChar) {
			sayers.push(characters[i].machineName);
		}
		if (npcSearch.indexOf(characters[i].machineName) == -1) {
			npcSearch.push(characters[i].machineName);
		}
	}
	sayers.sort();
	for (var i = 0; i < sayers.length; i++) {
		$("#dialogSayer").append('<option value="' + sayers[i] + '">' + sayers[i] + '</option>');
	}
	npcSearch.sort();
	
	$(".npcAnimationAutocomplete").autocomplete({
		source: npcSearch,
		select: function(event, ui) {
			event.preventDefault();
			$(this).val(ui.item.value + ', animationName, loop');
		}
	});
	$(".npcModifyAutocomplete").autocomplete({
		source: npcSearch,
		select: function(event, ui) {
			event.preventDefault();
			$(this).val(ui.item.value + ', operation, value(only with some operations)');
		}
	});
	$(".npcMoveAutocomplete").autocomplete({
		source: npcSearch,
		select: function(event, ui) {
			event.preventDefault();
			$(this).val(ui.item.value + ', targetX, velocity');
		}
	});
  $(".playAnimationAutocomplete").autocomplete({
    source: npcSearch.concat(assetSearch).sort(),
    select: function(event, ui) {
      event.preventDefault();
      $(this).val(ui.item.value + ', animationName');
    }
  });
}

function deleteDialogReferences(dialogId) {
		
	// Remove references
	var writeDialogs, writeAssets, writeChains = false;
	
	for (var i = 0; i < dialogs.length; i++) {
		if (jQuery.type(dialogs[i].next) === 'array') {
			for (var j = 0; j < dialogs[i].next.length; j++) {
				if (dialogs[i].next[j].dialogue == dialogId) {
					dialogs[i].next[j].dialogue = "";
					writeDialogs = true;
				}
			}
		}
		else {
			if (dialogs[i].next == dialogId) {
				dialogs[i].next = "";
				writeDialogs = true;
			}
		}
		if (jQuery.type(dialogs[i].text) === 'array') {
			for (var j = 0; j < dialogs[i].text.length; j++) {
				if (dialogs[i].text[j].next == dialogId) {
					dialogs[i].text[j].next = "";
					writeDialogs = true;
				}
			}
		}
	}
	for (var i = 0; i < assets.length; i++) {
		if (assets[i].dialogueId == dialogId) {
			assets[i].dialogueId = "";
			writeAssets = true;
		}
	}
	for (var i = 0; i < misc.dialogChains.length; i++) {
		if (misc.dialogChains[i].startingNode == dialogId) {
			misc.dialogChains.splice(i, 1);
			writeChains = true;
		}
	}
	// Create json files
	if (writeDialogs) saveJSObjectAsJSON(dialogs, "json/dialogs.json");
	if (writeAssets) saveJSObjectAsJSON(assets, "json/assets.json");
	if (writeChains) saveJSObjectAsJSON(misc, "json/misc.json");
}

function addDialogPathNode(id) {
		
	if (id.indexOf("dialogPathNode_") != -1) {
		
		var dialogIndex = -1;
		var diaId = parseInt(id.replace("dialogPathNode_", ""));
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				dialogIndex = i;
				break;
			}
		}
		if (dialogIndex != -1) {
			// If dialog node has no next item create new node and add it to chain
			if (jQuery.type(dialogs[dialogIndex].text) === 'string' && (dialogs[dialogIndex].next == undefined || dialogs[dialogIndex].next == "")) {
				dialogs[dialogIndex].next = misc.dialogId;
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");		
				$("#createDialogButton").click();
				$("#dialogPathNode_" + (misc.dialogId - 1) + " .node").click().click();
			}
			// if dialog node has choices add new choice item
			else if (jQuery.type(dialogs[dialogIndex].text) === 'array') {
				var choice = {"text":"","points":"","audio":"","next":""};
				dialogs[dialogIndex].text.push(choice);
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");
				$("#dialogsView .dialogSelection").change();
				$("#dialogPathChoice_" + diaId + "_" + (dialogs[dialogIndex].text.length - 1) + " .node").click().click();
			}
			// if dialog node has conditional next items add new conditional next item
			else if (jQuery.type(dialogs[dialogIndex].next) === 'array') {
				var conditionalNext = {"dialogue": "", "condition": "", "gamestates": []};
				dialogs[dialogIndex].next.push(conditionalNext);
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");
				$("#dialogsView .dialogSelection").change();
				$("#dialogPathConditionalNext_" + diaId + "_" + (dialogs[dialogIndex].next.length - 1) + " .node").click().click();
			}
			// Scroll to bottom of page after new node is created
			$('html, body').scrollTop( $(document).height() );
		}
	}
	else if (id.indexOf("dialogPathChoice_") != -1) {
		
		var temp = id.replace("dialogPathChoice_", "").split("_");
		var diaId = parseInt(temp[0]);
		var choiceIndex = parseInt(temp[1]);

		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (jQuery.type(dialogs[i].text) === 'array' && dialogs[i].text[choiceIndex] != undefined && (dialogs[i].text[choiceIndex].next == undefined || dialogs[i].text[choiceIndex].next == "")) {
					dialogs[i].text[choiceIndex].next = misc.dialogId;
					// Create json file
					saveJSObjectAsJSON(dialogs, "json/dialogs.json");		
					$("#createDialogButton").click();
					$("#dialogPathNode_" + dialogs[i].text[choiceIndex].next + " .node").click().click();
				}
				break;
			}
		}
	}
	else if (id.indexOf("dialogPathConditionalNext_") != -1) {
		
		var temp = id.replace("dialogPathConditionalNext_", "").split("_");
		var diaId = parseInt(temp[0]);
		var conditionIndex = parseInt(temp[1]);

		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (jQuery.type(dialogs[i].next) === 'array' && dialogs[i].next[conditionIndex] != undefined && (dialogs[i].next[conditionIndex].dialogue == undefined || dialogs[i].next[conditionIndex].dialogue == "")) {
					dialogs[i].next[conditionIndex].dialogue = misc.dialogId;
					// Create json file
					saveJSObjectAsJSON(dialogs, "json/dialogs.json");		
					$("#createDialogButton").click();
					$("#dialogPathNode_" + dialogs[i].next[conditionIndex].dialogue + " .node").click().click();
				}
				break;
			}
		}
	}
}

function deleteDialogPathNode(id) {
	
	var dialogIndex = -1;
	var diaId;
	
	if (id.indexOf("dialogPathNode_") != -1) {
		
		diaId = parseInt(id.replace("dialogPathNode_", ""));
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				dialogIndex = i;
				break;
			}
		}
		if (dialogIndex != -1) {
			if (!confirm("Delete dialog " + dialogs[dialogIndex].id + "?")) {
				return;
			}
			deleteDialogReferences(dialogs[dialogIndex].id);
			dialogs.splice(dialogIndex, 1);
		}
		if (activeDialogIndex == dialogIndex) {
			
			if (dialogs[activeDialogIndex - 1] != undefined) {
				activeDialogID = dialogs[activeDialogIndex - 1].id;
				activeDialogIndex = activeDialogIndex - 1;
				$("#dialogsView .dialogSelection").prop("value", activeDialogID);
				console.log(activeDialogID);
			}
			else {
				activeDialogID = undefined;
				activeDialogIndex = undefined;
			}
		}
		//deleteDialogReferences(diaId);
	}
	else if (id.indexOf("dialogPathChoice_") != -1) {
		
		var temp = id.replace("dialogPathChoice_", "").split("_");
		diaId = parseInt(temp[0]);
		var choiceIndex = parseInt(temp[1]);
		var dialogIndex = -1;
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				dialogIndex = i;
				break;
			}
		}
		if (dialogIndex != -1) {
			if (!confirm("Delete dialog " + dialogs[dialogIndex].id + " " + (choiceIndex + 1) + ". choice?")) {
				return;
			}
			dialogs[dialogIndex].text.splice(choiceIndex, 1);
			if (dialogs[dialogIndex].text.length == 0) {
				dialogs[dialogIndex].text = dialogs[activeDialogIndex].textOnTop;
				dialogs[dialogIndex].textOnTop = undefined;
				dialogs[dialogIndex].next = "";
			}
		}
	}
	else if (id.indexOf("dialogPathConditionalNext_") != -1) {
		
		var temp = id.replace("dialogPathConditionalNext_", "").split("_");
		diaId = parseInt(temp[0]);
		var conditionIndex = parseInt(temp[1]);
		var dialogIndex = -1;
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				dialogIndex = i;
				break;
			}
		}
		if (dialogIndex != -1) {
			if (!confirm("Delete dialog " + dialogs[dialogIndex].id + " conditional next item"  + conditionIndex + "?")) {
				return;
			}
			dialogs[dialogIndex].next.splice(conditionIndex, 1);
			if (dialogs[dialogIndex].next.length == 0) {
				dialogs[dialogIndex].next = "";
			}
		}
	}
	// Create json file
	saveJSObjectAsJSON(dialogs, "json/dialogs.json");
	
	$('#dialogNext > option[value="' + diaId + '"], #dialogsView .dialogSelection > option[value="' + diaId + '"], #dialogChainNode > option[value="' + diaId + '"], #assetDialogueId > option[value="' + diaId + '"]').remove();
	if (activeDialogID == undefined) {
		$("#dialogsView .dialogSelection").prop("value", "-1");
	}
	$("#dialogsView .dialogSelection").change();
}

function checkIfDialogPathAddNode(nodeId) {
		
	// If there are no next items append add node button
	if (nodeId.indexOf("dialogPathNode_") != -1) {
		
		var diaId = parseInt(nodeId.replace("dialogPathNode_", ""));
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (dialogs[i].next == undefined || dialogs[i].next == "" || jQuery.type(dialogs[i].next) === 'array') {
					return true;
				}
				break;
			}
		}
	}
	else if (nodeId.indexOf("dialogPathChoice_") != -1) {
		
		var temp = nodeId.replace("dialogPathChoice_", "").split("_");
		var diaId = parseInt(temp[0]);
		var choiceIndex = parseInt(temp[1]);

		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (jQuery.type(dialogs[i].text) === 'array' && dialogs[i].text[choiceIndex] != undefined && (dialogs[i].text[choiceIndex].next == undefined || dialogs[i].text[choiceIndex].next == "")) {
					return true;
				}
				break;
			}
		}
	}
	else if (nodeId.indexOf("dialogPathConditionalNext_") != -1) {
		
		var temp = nodeId.replace("dialogPathConditionalNext_", "").split("_");
		var diaId = parseInt(temp[0]);
		var conditionIndex = parseInt(temp[1]);

		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (dialogs[i].next != undefined && jQuery.type(dialogs[i].next) === 'array' && dialogs[i].next[conditionIndex] != undefined && (dialogs[i].next[conditionIndex].dialogue == undefined || dialogs[i].next[conditionIndex].dialogue == "")) {
					return true;
				}
				break;
			}
		}
	}
	return false;
}

function dialogNodeChanged(nodeId, text) {
		
	// Save dialog chain name
	if (nodeId == "dialogPathContainer" && dialogRootNode != undefined) {
		for (var i = 0; i < misc.dialogChains.length; i++) {
			if (misc.dialogChains[i].startingNode == dialogRootNode) {
				misc.dialogChains[i].name = text.trim();
				// Create json file
				saveJSObjectAsJSON(misc, "json/misc.json");
				// Update dropdown
				$('#dialogsView .dialogChainSelection > option[value="' + dialogRootNode + '"]').html(text.trim());
				break;
			}
		}
	}
	// Save dialog item text
	else if (nodeId.indexOf("dialogPathNode_") != -1) {
		var diaId = parseInt(nodeId.replace("dialogPathNode_", ""));
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				if (jQuery.type(dialogs[i].text) === 'array') {
					dialogs[i].textOnTop = text.trim();
				}
				else {
					dialogs[i].text = text.trim();
				}
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");
				// Update dialog view
				if (activeDialogID == diaId) {
					$("#dialogText").prop("value", text.trim());
				}
				break;
			}
		}
	}
	// Save dialog choice text
	else if (nodeId.indexOf("dialogPathChoice_") != -1) {
		var temp = nodeId.replace("dialogPathChoice_", "").split("_");
		var diaId = parseInt(temp[0]);
		var choiceIndex = parseInt(temp[1]);
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				dialogs[i].text[choiceIndex].text = text.trim();
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");
				// Update dialog view
				if (activeDialogID == diaId) {
					$("#dialogChoiceText_" + activeDialogIndex + "_" + choiceIndex).prop("value", text.trim());
				}
				break;
			}
		}
	}
	// Save dialog conditional next condition
	else if (nodeId.indexOf("dialogPathConditionalNext_") != -1) {
		var temp = nodeId.replace("dialogPathConditionalNext_", "").split("_");
		var diaId = parseInt(temp[0]);
		var conditionIndex = parseInt(temp[1]);
		for (var i = 0; i < dialogs.length; i++) {
			if (dialogs[i].id == diaId) {
				
				dialogs[i].next[conditionIndex].condition = text.trim();
				dialogs[i].next[conditionIndex].gamestates = undefined;
				
				var conditionStatesArray = getGameStatesFromCondition(dialogs[i].next[conditionIndex].condition);
				if (conditionStatesArray.length == 1 && conditionStatesArray[0].trim() == "") {
					conditionStatesArray = [];
				}
				for (var j = 0; j < conditionStatesArray.length; j++) {
					conditionStatesArray[j] = conditionStatesArray[j].trim();
				}
				dialogs[i].next[conditionIndex].gamestates = conditionStatesArray;
				
				// Create json file
				saveJSObjectAsJSON(dialogs, "json/dialogs.json");
				// Update dialog view
				if (activeDialogID == diaId) {
					$("#dialogConditionalNextCondition_" + i + "_" + conditionIndex).prop("value", text.trim());
				}
				break;
			}
		}
	}
}

// Enbaled disabled elements after editing default actions or tasks of rooms, assets or dialogs
function activateDefaultActionsAndTasks(identifier) {
	
	// Show and enable edit buttons
	$("#" + identifier + "DefaultActionsList .editDefaultTask").prop("disabled", false);
	$("#" + identifier + "DefaultActionsList .editDefaultActionParams").prop("disabled", false);
	$("#" + identifier + "DefaultActionsList .editDefaultActionParams").show();
	$("#" + identifier + "AddDefaultActionSelect").prop("disabled", false);
	if ($("#" + identifier + "AddDefaultActionSelect").prop("value") != "-1") {
		$("#" + identifier + "AddDefaultAction").prop("disabled", false);
	}
	$("#" + identifier + "DefaultActionsList .deleteDefaultTask").prop("disabled", false);
	$("#" + identifier + "DefaultActionsList .deleteDefaultAction").prop("disabled", false);
}

// Enabled disabled elements after editing conditional actions of rooms, assets or dialogs
function activateConditions(identifier) {
		
	// Show and enable all conditions
	$('#' + identifier + 'AddCondition').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .addConditionalActionSelect').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .deleteConditionalAction').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .deleteCondition').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .editCondition').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .deleteConditionalTask').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .editConditionalTask').prop("disabled", false);
	$('#' + identifier + 'ConditionalActionsList .editConditionalActionParams').prop("disabled", false);
	
	// Enable those addConditionalActions that have some action selected
	var selections = $('#' + identifier + 'ConditionalActionsList .addConditionalActionSelect');
	for (var i = 0; i < selections.length; i++) {
		if ($(selections[i]).prop("value") != "-1") {
			var selectionId = $(selections[i]).parent().parent().prop("id").replace(identifier + 'Condition_', "");
			$('#' + identifier + 'Condition_' + selectionId + ' .addConditionalAction').prop("disabled", false);
		}
	}
}

// Fixes ids to correct order when deleting or sorting conditional actions
function fixConditionalActionConditionIds(identifier, itemIndex) {
	
	var conditions = $("#" + identifier + "ConditionalActionsList > li");
	// Remove deleted index from the list
	for (var i = 0; i < conditions.length; i++) {
		
		var oldIndex = $(conditions[i]).prop("id").replace(identifier + "Condition_", "");
		
		$(conditions[i]).prop("id", identifier + "Condition_" + itemIndex + '_' + i);
		$("#" + identifier + "Condition_" + itemIndex + '_' + i +" #" + identifier + "ConditionInput_" + oldIndex).prop("id", identifier + "ConditionInput_" + itemIndex + '_' + i);
		$("#" + identifier + "Condition_" + itemIndex + '_' + i +" #" + identifier + "GamestatesInput_" + oldIndex).prop("id", identifier + "GamestatesInput_"  + itemIndex + '_' + i);
		$("#" + identifier + "Condition_" + itemIndex + '_' + i +" #" + identifier + "AddConditionalActionSelect_" + oldIndex).prop("id", identifier + "AddConditionalActionSelect_" + itemIndex + '_' + i);
		$("#" + identifier + "Condition_" + itemIndex + '_' + i +" #" + identifier + "AddConditionalAction_" + oldIndex).prop("id", identifier + "AddConditionalAction_" + itemIndex + '_' + i);
		// Fix results
		fixConditionResultIds(identifier, itemIndex, i);
	}
}

function fixConditionResultIds(identifier, itemIndex, conditionIndex) {
	
	var results = $("#" + identifier + "Condition_" + itemIndex + "_" + conditionIndex + " .right ul > li");
	
	for (var i = 0; i < results.length; i++) {
		
		var oldIndex = $(results[i]).prop("id").replace(identifier + "ConditionalAction_" + itemIndex, "");
		$(results[i]).prop("id", identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i);
    
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalActionParamsInput_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalActionParamsInput_" + itemIndex + '_' + conditionIndex + '_' + i);
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalTaskNameInput_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalTaskNameInput_" + itemIndex + '_' + conditionIndex + '_' + i);
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalTaskName_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalTaskName_" + itemIndex + '_' + conditionIndex + '_' + i);
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalTaskParamsInput_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalTaskParamsInput_" + itemIndex + '_' + conditionIndex + '_' + i);
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalTaskParams_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalTaskParams_" + itemIndex + '_' + conditionIndex + '_' + i);
		$("#" + identifier + "ConditionalAction_" + itemIndex + '_' + conditionIndex + '_' + i + " #" + identifier + "ConditionalTaskWait_" + itemIndex + oldIndex).prop("id", identifier + "ConditionalTaskWait_" + itemIndex + '_' + conditionIndex + '_' + i);
	}
}

// Fixes ids to correct order when deleting or sorting default actions
function fixDefaultActionIds(identifier, itemIndex) {
	
	var defActions = $("#" + identifier + "DefaultActionsList > li");
	
	for (var i = 0; i < defActions.length; i++) {
		
		var oldIndex = $(defActions[i]).prop("id").replace(identifier + "DefaultAction_" + itemIndex + '_', "");
		$(defActions[i]).prop("id", identifier + "DefaultAction_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultActionParamsInput_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultActionParamsInput_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultTaskNameInput_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultTaskNameInput_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultTaskName_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultTaskName_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultTaskParamsInput_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultTaskParamsInput_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultTaskParams_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultTaskParams_" + itemIndex + '_' + i);
		$("#" + identifier + "DefaultAction_" + itemIndex + '_' + i + " #" + identifier + "DefaultTaskWait_" + itemIndex + '_' + oldIndex).prop("id", identifier + "DefaultTaskWait_" + itemIndex + '_' + i);
	}
}


// createDefaultActionsList(rooms[activeRoomIndex].defaultActions, activeRoomIndex, "room");*/
function createDefaultActionsList(actionArray, activeIndex, identifier) {
	
	$("#" + identifier + "DefaultActionsNbr").html("");
	
	if (actionArray != undefined) {
		
		if (actionArray.length > 0) {
			$("#" + identifier + "DefaultActionsNbr").html("(" + actionArray.length + ")");
		}
		
		for (var i = 0; i < actionArray.length; i++) {
			
			var listItem = '<li class="' + identifier + 'Action" id="' + identifier + 'DefaultAction_' + activeIndex + '_' + i + '">';
			if (jQuery.type(actionArray[i]) === "string" && actions[actionArray[i]] != undefined) {
				listItem += '<button class="deleteDefaultAction">X</button> <a href="" title="' + actions[actionArray[i]].comment + '" class="linkedAction_' + actionArray[i] + '" >' + actionArray[i] + '</a><span class="sortable-handle"></span>';
			}
			else if (jQuery.type(actionArray[i]) === "array") {
				
				if (actions[actionArray[i][0]] != undefined) {
					listItem += '<button class="deleteDefaultAction">X</button> <a title="' + actions[actionArray[i][0]].comment + '" href="" class="linkedAction_' + actionArray[i][0] + '" >' + actionArray[i][0] + '</a> ';
					listItem += 'Params: <input type="text" id="' + identifier + 'DefaultActionParamsInput_' + activeIndex + '_' + i + '" value="';
					for (var j = 1; j < actionArray[i].length; j++) {
						listItem += actionArray[i][j] + ", ";
					}
					if (actionArray[i].length > 1) {
						listItem = listItem.slice(0, -2);
					}
					listItem += '" disabled="disabled" />  <button class="editDefaultActionParams">Edit</button><span class="sortable-handle"></span>';
				}
			}
			// Show individual tasks too
			else if (jQuery.type(actionArray[i]) === "object" && actionArray[i].name != undefined) {
				
				//listItem += '<button class="deleteDefaultTask">X</button> <input type="text" id="' + identifier + 'DefaultTaskNameInput_' + activeIndex + '_' + i + '" value="' + actionArray[i].name + '" style="display:none;" /><span id="' + identifier + 'DefaultTaskName_' + activeIndex + '_' + i + '">' + actionArray[i].name + '</span>(<input type="text" id="' + identifier + 'DefaultTaskParamsInput_' + activeIndex + '_' + i + '" value="';
				listItem += '<button class="deleteDefaultTask">X</button>  <select class="defaultTaskSelection" id="' + identifier + 'DefaultTaskNameInput_' + activeIndex + '_' + i + '" style="display:none;">';
				for (var j = 0; j < tasks.length; j++) {
					listItem += '<option value="' + tasks[j].name + '"';
					if (actionArray[i].name == tasks[j].name) {
						listItem += ' selected="selected"';
					}
					listItem += '>' + tasks[j].name + '</option>';
				}
				listItem += '</select><span id="' + identifier + 'DefaultTaskName_' + activeIndex + '_' + i + '">' + actionArray[i].name + '</span>(<input type="text" id="' + identifier + 'DefaultTaskParamsInput_' + activeIndex + '_' + i + '" value="';
				var params = "";
				for (var j = 0; j < actionArray[i].params.length; j++) {
					params += actionArray[i].params[j] + ", ";
				}
				if (actionArray[i].params.length > 0) {
					params = params.slice(0, -2);
				}
				listItem +=  params + '" style="display:none;" />';
				listItem += '<span id="' + identifier + 'DefaultTaskParams_' + activeIndex + '_' + i + '">' + params + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="' + identifier + 'DefaultTaskWait_' + activeIndex + '_' + i + '" ';
				var wait = false;
				if (actionArray[i].wait != undefined) {
					wait = actionArray[i].wait;
					listItem += 'checked="checked"';
				}
				listItem += ' disabled="disabled" /> <button class="editDefaultTask">Edit</button><span class="sortable-handle"></span>';
			}
			listItem += "</li>";

			$("#" + identifier + "DefaultActionsList").append(listItem);
		}
		$("#" + identifier + "DefaultActionsList").sortable({
			placeholder: "ui-state-highlight",
			cursor: "move",
			handle: ".sortable-handle",
			axis: "y",
			delay: 300,
			update: function(event,ui) {
				
				var actionArray2 = [];
				var arrayToSave = [];
				var filename = "";
				
				if (identifier == "room") {
					actionArray2 = rooms[activeIndex].defaultActions;
					arrayToSave = rooms;
					filename = "json/rooms.json";
				}
				else if (identifier == "asset") {
					actionArray2 = assets[activeIndex].defaultActions;
					arrayToSave = assets;
					filename = "json/assets.json";
				}
				else if (identifier == "dialog") {
					actionArray2 = dialogs[activeIndex].defaultActions;
					arrayToSave = dialogs;
					filename = "json/dialogs.json";
				}
				else if (identifier == "character") {
					actionArray2 = characters[activeIndex].defaultActions;
					arrayToSave = characters;
					filename = "json/characters.json";
				}

				var items = $("#" + identifier + "DefaultActionsList > li");
				var newActionList = [];
				for (var i = 0; i < items.length; i++) {
					var actionIndex = parseInt($(items[i]).prop("id").replace(identifier + 'DefaultAction_' + activeIndex + '_', ''));
					newActionList.push(actionArray2[actionIndex]);
				}
				if (identifier == "room") {
					rooms[activeIndex].defaultActions = newActionList;
				}
				else if (identifier == "asset") {
					assets[activeIndex].defaultActions = newActionList;
				}
				else if (identifier == "dialog") {
					dialogs[activeIndex].defaultActions = newActionList;
				}
				else if (identifier == "character") {
					characters[activeIndex].defaultActions = newActionList;
				}
				
				saveJSObjectAsJSON(arrayToSave, filename);
				fixDefaultActionIds(identifier, activeIndex);
			}
		});
		$("#" + identifier + "DefaultActionsList label, #" + identifier + "DefaultActionsList a").disableSelection();
	}
}

// createConditionalActionsList(rooms[activeRoomIndex].conditionalActions, activeRoomIndex, "room");
function createConditionalActionsList(actionArray, activeIndex, identifier) {
	
	$("#" + identifier + "ConditionalActionsList").empty();
	$("#" + identifier + "ConditionalActionsNbr").html("");
	
	if (actionArray != undefined) {
		
		if (actionArray.length > 0) {
			$("#" + identifier + "ConditionalActionsNbr").html("(" + actionArray.length + ")");
		}
		
		for (var i = 0; i < actionArray.length; i++) {
			var conditionString = actionArray[i].condition;
			var conditionalItem =  '<li class="' + identifier + 'Condition" id="' + identifier + 'Condition_' + activeIndex + '_' + i + '"><span class="left"><button class="deleteCondition">X</button><br /><button class="editCondition">Edit</button><button class="saveCondition" style="display:none;">Save</button></span>';
			conditionalItem += '<Span class="right"> Condition: <input type="text" value="' + '" id="' + identifier + 'ConditionInput_' + activeIndex + '_' + i + '" class="conditionInput" disabled="disabled" /><span class="sortable-handle"></span>';
			
			conditionalItem += '<br />Results: <select id="' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + i + '" class="addConditionalActionSelect"></select> <button id="' + identifier + 'AddConditionalAction_' + activeIndex + '_' + i + '" class="addConditionalAction">Add</button><ul>';
			
			for (var j = 0; j < actionArray[i].results.length; j++) {
								
				conditionalItem += '<li class="' + identifier + 'Action" id="' + identifier + 'ConditionalAction_' + activeIndex + '_' + i + '_' + j + '">';
				if (jQuery.type(actionArray[i].results[j]) === "string" && actions[actionArray[i].results[j]] != undefined) {
					
					conditionalItem += '<button class="deleteConditionalAction">X</button> <a title="' + actions[actionArray[i].results[j]].comment + '" href="" class="linkedAction_' + actionArray[i].results[j] + '" >' + actionArray[i].results[j] + '</a>';
				}
				else if (jQuery.type(actionArray[i].results[j]) === "array") {

					if (actions[actionArray[i].results[j][0]] != undefined) {
						
						conditionalItem += '<button class="deleteConditionalAction">X</button> <a title="' + actions[actionArray[i].results[j][0]].comment + '" href="" class="linkedAction_' + actionArray[i].results[j][0] + '" >' + actionArray[i].results[j][0] + '</a> ';
						conditionalItem += 'Params: <input type="text" id="' + identifier + 'ConditionalActionParamsInput_' + activeIndex + '_' + i + '_' + j + '" value="';
						
						for (var k = 1; k < actionArray[i].results[j].length; k++) {
							conditionalItem += actionArray[i].results[j][k] + ", ";
						}
						if (actionArray[i].results[j].length > 1) {
							conditionalItem = conditionalItem.slice(0, -2);
						}
						conditionalItem += '" disabled="disabled" />  <button class="editConditionalActionParams">Edit</button>';
					}
				}
				// Show individual tasks too
				else if (jQuery.type(actionArray[i].results[j]) === "object" && actionArray[i].results[j].name != undefined) {
					
					conditionalItem += '<button class="deleteConditionalTask">X</button> <select class="conditionalTaskSelection" id="' + identifier + 'ConditionalTaskNameInput_' + activeIndex + '_' + i + '_' + j + '" value="' + actionArray[i].results[j].name + '" style="display:none;" >';
					for (var t = 0; t < tasks.length; t++) {
						conditionalItem += '<option value="' + tasks[t].name + '"';
						if (actionArray[i].results[j].name == tasks[t].name) {
							conditionalItem += ' selected="selected"';
						}
						conditionalItem += '>' + tasks[t].name + '</option>';
					}
					conditionalItem += '</select><span id="' + identifier + 'ConditionalTaskName_' + activeIndex + '_' + i + '_' + j + '">' + actionArray[i].results[j].name + '</span>(<input type="text" id="' + identifier + 'ConditionalTaskParamsInput_' + activeIndex + '_' + i + '_' + j + '" value="';
					
					var params = "";
					for (var k = 0; k < actionArray[i].results[j].params.length; k++) {
						params += actionArray[i].results[j].params[k] + ", ";
					}
					if (actionArray[i].results[j].params.length > 0) {
						params = params.slice(0, -2);
					}
					conditionalItem +=  params + '" style="display:none;" />';
					conditionalItem += '<span id="' + identifier + 'ConditionalTaskParams_' + activeIndex + '_' + i + '_' + j + '">' + params + '</span>) Wait: <input type="checkbox" class="waitCheckBox" id="' + identifier + 'ConditionalTaskWait_' + activeIndex + '_' + i + '_' + j + '" ';
					var wait = false;
					if (actionArray[i].results[j].wait != undefined) {
						wait = actionArray[i].results[j].wait;
						conditionalItem += 'checked="checked"';
					}
					conditionalItem += ' disabled="disabled" /> <button class="editConditionalTask">Edit</button>';
				}
				conditionalItem += '<span class="sortable-handle"></span></li>';
			}
			conditionalItem += "</ul>";
			conditionalItem += "</span></li>";
			
			$("#" + identifier + "ConditionalActionsList").append(conditionalItem);
			$("#" + identifier + 'ConditionInput_' + activeIndex + '_' + i).prop("value", conditionString.split('"').join('\''));
			$("#" + identifier + "AddDefaultActionSelect > option").clone().appendTo($('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + i));
			$('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + i).prop("value", "-1");
			$('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + i).change();
			// Make conditional actions sortable
			$("#" + identifier + "ConditionalActionsList #" + identifier + "Condition_" + activeIndex + "_" + i + " ul").sortable({
				placeholder: "ui-state-highlight",
				cursor: "move",
				handle: "> .sortable-handle",
				axis: "y",
				delay: 300,
				items: "> li",
				update: function(event,ui) {
					
					var actionArray2 = [];
					var arrayToSave = [];
					var filename = "";
					
					var temp = $(this).parent().parent().prop("id").replace(identifier + "Condition_", "").split("_");
					var conditionIndex = parseInt(temp[1]);
					if (identifier == "room") {
						actionArray2 = rooms[activeIndex].conditionalActions[conditionIndex].results;
						arrayToSave = rooms;
						filename = "json/rooms.json";
					}
					else if (identifier == "asset") {
						actionArray2 = assets[activeIndex].conditionalActions[conditionIndex].results;
						arrayToSave = assets;
						filename = "json/assets.json";
					}
					else if (identifier == "dialog") {
						actionArray2 = dialogs[activeIndex].conditionalActions[conditionIndex].results;
						arrayToSave = dialogs;
						filename = "json/dialogs.json";
					}
					else if (identifier == "character") {
						actionArray2 = characters[activeIndex].conditionalActions[conditionIndex].results;
						arrayToSave = characters;
						filename = "json/characters.json";
					}

					var items = $("#" + identifier + "ConditionalActionsList #" + identifier + "Condition_" + activeIndex + "_" + conditionIndex + " ul > li");
					var newActionList = [];
					for (var j = 0; j < items.length; j++) {
						var actionIndex = parseInt($(items[j]).prop("id").replace(identifier + 'ConditionalAction_' + activeIndex + '_' + conditionIndex + '_', ''));
						newActionList.push(actionArray2[actionIndex]);
					}
					if (identifier == "room") {
						rooms[activeIndex].conditionalActions[conditionIndex].results = newActionList;
					}
					else if (identifier == "asset") {
						assets[activeIndex].conditionalActions[conditionIndex].results = newActionList;
					}
					else if (identifier == "dialog") {
						dialogs[activeIndex].conditionalActions[conditionIndex].results = newActionList;
					}
					else if (identifier == "character") {
						characters[activeIndex].conditionalActions[conditionIndex].results = newActionList;
					}
					saveJSObjectAsJSON(arrayToSave, filename);
					fixConditionResultIds(identifier, activeIndex, conditionIndex);
				}
			});
			$("#" + identifier + "ConditionalActionsList #" + identifier + "Condition_" + activeIndex + "_" + i + " ul label").disableSelection();
			$("#" + identifier + "ConditionalActionsList #" + identifier + "Condition_" + activeIndex + "_" + i + " ul a").disableSelection();
		}
		refreshConditionAutocomplete();
		// Make conditions sortable
		$("#" + identifier + "ConditionalActionsList").sortable({
			placeholder: "ui-state-highlight",
			cursor: "move",
			handle: "> .right > .sortable-handle",
			axis: "y",
			delay: 300,
			items: "> li",
			update: function(event,ui) {
				
				var actionArray2 = [];
				var arrayToSave = [];
				var filename = "";
				
				if (identifier == "room") {
					actionArray2 = rooms[activeIndex].conditionalActions;
					arrayToSave = rooms;
					filename = "json/rooms.json";
				}
				else if (identifier == "asset") {
					actionArray2 = assets[activeIndex].conditionalActions;
					arrayToSave = assets;
					filename = "json/assets.json";
				}
				else if (identifier == "dialog") {
					actionArray2 = dialogs[activeIndex].conditionalActions;
					arrayToSave = dialogs;
					filename = "json/dialogs.json";
				}
				else if (identifier == "character") {
					actionArray2 = characters[activeIndex].conditionalActions;
					arrayToSave = characters;
					filename = "json/characters.json";
				}

				var items = $("#" + identifier + "ConditionalActionsList > li");
				var newActionList = [];
				for (var i = 0; i < items.length; i++) {
					var actionIndex = parseInt($(items[i]).prop("id").replace(identifier + 'Condition_' + activeIndex + '_', ''));
					newActionList.push(actionArray2[actionIndex]);
				}
				if (identifier == "room") {
					rooms[activeIndex].conditionalActions = newActionList;
				}
				else if (identifier == "asset") {
					assets[activeIndex].conditionalActions = newActionList;
				}
				else if (identifier == "dialog") {
					dialogs[activeIndex].conditionalActions = newActionList;
				}
				else if (identifier == "character") {
					characters[activeIndex].conditionalActions = newActionList;
				}
				
				saveJSObjectAsJSON(arrayToSave, filename);
				fixConditionalActionConditionIds(identifier, activeIndex);
			}
		});
		$("#" + identifier + "ConditionalActionsList label, #" + identifier + "ConditionalActionsList a").disableSelection();
	}
}

function refreshConditionAutocomplete() {
	
	$(".conditionInput, .dialogChoiceCondition, .dialogConditionalNextCondition, .dialogPathConditionalNext > .node > .node__input")
		// don't navigate away from the field on tab when selecting an item
		.bind( "keydown", function( event ) {
			if ( event.keyCode === $.ui.keyCode.TAB && $( this ).autocomplete( "instance" ).menu.active ) {
				event.preventDefault();
			}
		})
		.autocomplete({
			source: availableGameStates,
			minLength: 1,
			source: function( request, response ) {
				var termToSearch = request.term;
				var pos = request.term.lastIndexOf("$");
				if (pos != -1) {
					termToSearch = termToSearch.substr(pos+1);
				}
				response( $.ui.autocomplete.filter(availableGameStates, termToSearch ) );
			},
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function( event, ui ) {
				// Remove search term from input
				var pos = this.value.lastIndexOf("$");
				var searchTerm = this.value.substr(pos + 1);
				if (pos != -1) {
					this.value = this.value.substr(0, (this.value.length - searchTerm.length));
				}
				this.value += ui.item.value + " ";
				return false;
			}
		}
	);
}

function createNewCondition(identifier) {
	
	var activeIndex = -1;
	var conditionArray = [];
	var arrayToSave = [];
	var filename = "";

	var newCondition = {"condition":"$gameState1 == false","gamestates":['gameState1'],"results":[]};
	
	if (identifier == "room") {
		activeIndex = activeRoomIndex;
		if (rooms[activeRoomIndex].conditionalActions == undefined) {
			rooms[activeRoomIndex].conditionalActions = [];
		}
		conditionArray = rooms[activeRoomIndex].conditionalActions;
		arrayToSave = rooms;
		filename = "json/rooms.json";
	}
	else if (identifier == "asset") {
		activeIndex = activeAssetIndex;
		if (assets[activeAssetIndex].conditionalActions == undefined) {
			assets[activeAssetIndex].conditionalActions = [];
		}
		conditionArray = assets[activeAssetIndex].conditionalActions;
		arrayToSave = assets;
		filename = "json/assets.json";
	}
	else if (identifier == "dialog") {
		activeIndex = activeDialogIndex;
		if (dialogs[activeDialogIndex].conditionalActions == undefined) {
			dialogs[activeDialogIndex].conditionalActions = [];
		}
		conditionArray = dialogs[activeDialogIndex].conditionalActions;
		arrayToSave = dialogs;
		filename = "json/dialogs.json";
	}
	else if (identifier == "character") {
		activeIndex = activeCharacterIndex;
		if (characters[activeCharacterIndex].conditionalActions == undefined) {
			characters[activeCharacterIndex].conditionalActions = [];
		}
		conditionArray = characters[activeCharacterIndex].conditionalActions;
		arrayToSave = characters;
		filename = "json/characters.json";
	}
	
	var count = conditionArray.length; // Store previous count for using it as index
	conditionArray.push(newCondition);
	
	$("#" + identifier + "ConditionalActionsNbr").html("(" + conditionArray.length + ")");
	
	// Create json file
	saveJSObjectAsJSON(arrayToSave, filename);
	
	var conditionalItem =  '<li class="' + identifier + 'Condition" id="' + identifier + 'Condition_' + activeIndex + '_' + count + '"><span class="left"><button class="deleteCondition">X</button><br /><button class="editCondition">Edit</button><button class="saveCondition" style="display:none;">Save</button></span>';
	conditionalItem += '<Span class="right"> Condition: <input type="text" value="' + newCondition.condition + '" id="' + identifier + 'ConditionInput_' + activeIndex + '_' + count + '" class="conditionInput" disabled="disabled" /><span class="sortable-handle"></span>';
	
	conditionalItem += '<br />Results: <select id="' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + count + '" class="addConditionalActionSelect"></select> <button id="' + identifier + 'AddConditionalAction_' + activeIndex + '_' + count + '" class="addConditionalAction">Add</button><ul>';
	conditionalItem += "</ul></span></li>";
	
	$("#" + identifier + "ConditionalActionsList").append(conditionalItem);
	
	$("#" + identifier + "AddDefaultActionSelect > option").clone().appendTo($('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + count));
	$('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + count).prop("value", "-1");
	$('#' + identifier + 'AddConditionalActionSelect_' + activeIndex + '_' + count).change();
	
	$('#' + identifier + 'Condition_' + activeIndex + '_' + count + ' .editCondition').click();
	refreshConditionAutocomplete();
}

// Returns new array with corresponding default and conditional actions converted to tasks
function convertActionsToTasks(objectArray) {
	
	var modifiedArray = jQuery.extend(true, [], objectArray);
		
	for (var i = 0; i < objectArray.length; i++) {
		
		if (objectArray[i].defaultActions != undefined) {
			var actionTasks = [];
			// Loop through default actions
			for (var j = 0; j < objectArray[i].defaultActions.length; j++) {
				
				// Check if action without parameters
				if (jQuery.type(objectArray[i].defaultActions[j]) === "string" && actions[objectArray[i].defaultActions[j]] != undefined) {
					$.merge(actionTasks, actions[objectArray[i].defaultActions[j]].tasks);
				}
				// Check if action with parameters
				else if (jQuery.type(objectArray[i].defaultActions[j]) === "array" && actions[objectArray[i].defaultActions[j][0]] != undefined) {
					
					var actArray  = jQuery.extend(true, [], actions[objectArray[i].defaultActions[j][0]].tasks);
					
					for (var parameter = 1; parameter < objectArray[i].defaultActions[j].length; parameter++) {
						
						for (var a = 0; a < actArray.length; a++) {
							for (var b = 0; b < actArray[a].params.length; b++) {
								if (jQuery.type(actArray[a].params[b]) === "string" && actArray[a].params[b] == ("arguments[" + parameter + "]")) {
									actArray[a].params[b] = objectArray[i].defaultActions[j][parameter];
								}
							}
						}
					}
					$.merge(actionTasks, actArray);
				}
				else {
					// Leave individual tasks as they are
					if (jQuery.type(objectArray[i].defaultActions[j]) === "object" && objectArray[i].defaultActions[j].name != undefined) {
						actionTasks.push(objectArray[i].defaultActions[j]);
					}
				}
				
			}
      // Remove comments
      var c = actionTasks.length;
      while (c--) {
        if (actionTasks[c].name == "Comment") {
          actionTasks.splice(c, 1);
        }
      }
			modifiedArray[i].defaultActions = actionTasks;
		}
		if (objectArray[i].conditionalActions != undefined) {
			// Loop through conditional actions
			for (var j = 0; j < objectArray[i].conditionalActions.length; j++) {
				var actionTasks = [];
				// Loop through results
				for (var k = 0; k < objectArray[i].conditionalActions[j].results.length; k++) {
					// Check if action without parameters
					if (jQuery.type(objectArray[i].conditionalActions[j].results[k]) === "string" && actions[objectArray[i].conditionalActions[j].results[k]] != undefined) {
						$.merge(actionTasks, actions[objectArray[i].conditionalActions[j].results[k]].tasks);
					}
					// Check if action with parameters
					else if (jQuery.type(objectArray[i].conditionalActions[j].results[k]) === "array" && actions[objectArray[i].conditionalActions[j].results[k][0]] != undefined) {
						
						var actArray = jQuery.extend(true, [], actions[objectArray[i].conditionalActions[j].results[k][0]].tasks);
						
						for (var parameter = 1; parameter < objectArray[i].conditionalActions[j].results[k].length; parameter++) {
							
							for (var a = 0; a < actArray.length; a++) {
								for (var b = 0; b < actArray[a].params.length; b++) {
									if (jQuery.type(actArray[a].params[b]) === "string" && actArray[a].params[b] == ("arguments[" + parameter + "]")) {
										actArray[a].params[b] = objectArray[i].conditionalActions[j].results[k][parameter];
									}
								}
							}
						}
						$.merge(actionTasks, actArray);
					}
					else {
						// Leave individual tasks as they are
						if (jQuery.type(objectArray[i].conditionalActions[j].results[k]) === "object" && objectArray[i].conditionalActions[j].results[k].name != undefined) {
							actionTasks.push(objectArray[i].conditionalActions[j].results[k]);
						}
					}
				}
        // Remove comments
        var c = actionTasks.length;
        while (c--) {
          if (actionTasks[c].name == "Comment") {
            actionTasks.splice(c, 1);
          }
        }
				modifiedArray[i].conditionalActions[j].results = actionTasks;
			}
		}
	}
	return modifiedArray;
}

function createActualGamestates() {
	
	var actualStates = {};
	
	// Add default character
	var playerChar = undefined;
	for (var i = 0; i < characters.length; i++) {
		if (characters[i].id == misc.defaultCharacterId) {
			playerChar = characters[i].machineName;
			break;
		}
	}
	actualStates.character = playerChar;//misc.defaultCharacterId;
	// Create gamestates from gamestates array
	for (var i = 0; i < gamestates.length; i++) {
		actualStates[gamestates[i].name] = gamestates[i].value;
	}
	// Create inventory items from assets
	for (var i = 0; i < assets.length; i++) {
		// Check if asset can be placed to inventory
		if (assets[i].pickable) {
			// Create inventory item if asset isn't already set to be in inventory
			if (actualStates[assets[i].name + "InInv"] == undefined) {
				actualStates[assets[i].name + "InInv"] = false;
			}
		}
	}
	  
	return actualStates;
}

function getGamestateType(gamestate) {
		
	var type = "";
	if (gamestate == "character") {
		type = "machineName";
	}
	else if (gamestate== "money") {
		type = "int";
	}
	else  if (gamestate == "activeRoom") {
		type = "roomName";
	}
	// Get game state type from gamestates array
	else {
		for (var i = 0; i < gamestates.length; i++) {
			if (gamestates[i].name == gamestate) {
				type = gamestates[i].type;
				break;
			}
		}
	}
	return type;
}

// Returns array of game states found in given condition string
function getGameStatesFromCondition(conditionString) {
		
	// Find variables
	var gameStatesArray = [];
	var condition = conditionString;
	
	while (condition.length > 0) {
		var state = "";
		var pos1 = condition.indexOf("$", 0);
		if (pos1 == -1) {
			condition = "";
			continue;
		}
		var pos2 = condition.indexOf(" ", pos1);
		if (pos2 == -1) {
			state = condition.substr(pos1 + 1);
			condition = "";
		}
		else {
			state = condition.substr(pos1 + 1, pos2 - pos1 - 1);
			condition = condition.substr(pos2+1);
		}
		if (state != "" && gameStatesArray.indexOf(state) == -1) {
			gameStatesArray.push(state);
		}
	}
	return gameStatesArray;
}
	
function updateAudioSprites() {
		
	$("#soundsView #audioSpritesList").empty();
	
	for (var i = 0; i < sounds.audioSprites.length; i++) {
		var audioItem = '<li  id="audioSprite_' + i + '"><button class="deleteAudioSpriteButton">X</button> Name: ' + sounds.audioSprites[i][0] + ' Files: ' + sounds.audioSprites[i][1].join(', ') + ' JSON: ' + sounds.audioSprites[i][2] + '</li>';
		$("#soundsView #audioSpritesList").append(audioItem);
	}
}

function updateGeneralAudio() {
	
	$("#soundsView #normalAudiosList").empty();
	
	for (var i = 0; i < sounds.general.length; i++) {
		var audioItem = '<li  id="audio_' + i + '"><button class="deleteAudioButton">X</button> Name: ' + sounds.general[i][0] + ' Files: ' + sounds.general[i][1].join(', ') + '</li>';
		$("#soundsView #normalAudiosList").append(audioItem);
	}
}

function updateSpriteAtlases() {
		
	$("#spriteAtlasesView #spriteAtlasesList").empty();
	var roomAtlasValue = $("#roomsView #atlasName").prop("value");
	var assetCustomAtlasValue = $("#assetsView #assetCustomAtlas").prop("value");
	$("#roomsView #atlasName").empty();
	$("#assetsView #assetCustomAtlas").empty();
	$("#roomsView #atlasName").append('<option id="roomAtlas_-1" value="-1" selected="selected">No Atlas</option>');
	$("#assetsView #assetCustomAtlas").append('<option id="assetCustomAtlas_-1" value="-1" selected="selected">None</option>');
	
	for (var i = 0; i < spriteAtlases.length; i++) {
		var atlasItem = '<li  id="spriteAtlas_' + i + '"><button class="deleteSpriteAtlasButton">X</button> Name: ' + spriteAtlases[i][0] + ' Spritesheet: ' + spriteAtlases[i][1] + ' JSON: ' + spriteAtlases[i][2] + '</li>';
		$("#spriteAtlasesView #spriteAtlasesList").append(atlasItem);
		$("#roomsView #atlasName").append('<option id="roomAtlas_' + i + '" value="' + spriteAtlases[i][0] + '">' + spriteAtlases[i][0] + '</option>');
		$("#assetsView #assetCustomAtlas").append('<option id="assetCustomAtlas_' + i + '" value="' + spriteAtlases[i][0] + '">' + spriteAtlases[i][0] + '</option>');
	}
	$("#roomsView #atlasName").prop("value", roomAtlasValue);
	$("#assetsView #assetCustomAtlas").prop("value", assetCustomAtlasValue);
}

function saveJSObjectAsJSON(object, file) {
	
	// Post via ajax for saving those to disk
	$.post("index.php", { action: 'saveJSObjectAsJSON', JSObject: JSON.stringify(object), filename: file }, "json").done();
	// Create config file
	$('#createJSObject').click();
}

/***********************************************
* IMPORT ROOMS AND ASSETS, AUDIOS
***********************************************/
function importRoomsAndAssets(jsonData) {
	
	for (var roomName in jsonData) {
		
		var roomIndex = -1;
		for (var i = 0; i < rooms.length; i++) {
			if (rooms[i].name == roomName) {
				roomIndex = i;
				break;
			}
		}
		// Create room if not exist
		if (roomIndex == -1) {
			$(".roomSelection").append('<option id="room_' + rooms.length + '" value="' + misc.roomId + '">' + roomName + '</option>');
			var room = {"id":misc.roomId,"name":roomName,"atlasName":"","bgImage":"","bgWidth":0,"bgHeight":0,"spawnX":200,"spawnY":720,"spawnFace":"left","music":"","assets":[],"defaultActions":[],"conditionalActions":[]};
			misc.roomId++;
			rooms.push(room);
			roomIndex = rooms.length - 1;
			
			var gameStateFound = false;
			for (var i = 0; i < gamestates.length; i++) {
				if (gamestates[i].name == "activeRoom") {
					gameStateFound = true;
					break;
				}
			}
			if (!gameStateFound) {
				var newState = {"id":misc.gameStateId,"name":"activeRoom","type":"string","value":roomName};
				gamestates.push(newState);
				misc.gameStateId++;
				saveJSObjectAsJSON(gamestates, "json/gamestates.json");
			}
		}
		// Get room values
		if (jsonData[roomName]["noAtlas"] != undefined && jsonData[roomName]["noAtlas"]) {
			rooms[roomIndex].atlasName = "";
		}
		else {
			rooms[roomIndex].atlasName = roomName + "Atlas";
		}
		
		var bgImage = "";
		var bgWidth = 0;
		var bgHeight = 0;
		
		for (var i = jsonData[roomName].sprites.length - 1; i > -1; i--) {
			
			var sprite = jsonData[roomName].sprites[i];
			// Get room values
			if (sprite.name == (roomName + "_bg")) {
				bgImage = "img/" + roomName + "/" + sprite.sprite;
				bgWidth = sprite.width;
				bgHeight = sprite.height;
			}
			else {
        
        // Do not create closed door assets
        if (sprite.name.indexOf("doorTo_") != -1 && sprite.name.indexOf("_closed") != -1) {
          continue;
        }
				var doorTarget = "";
				// Get door target
				if (sprite.name.indexOf("doorTo_") != -1) {
					doorTarget = sprite.name.replace(roomName + "_doorTo_", "");
				}
				var assetName = sprite.name;
				// Add asset to room
				if (rooms[roomIndex].assets.indexOf(assetName) == -1) {
					rooms[roomIndex].assets.push(assetName);
				}
				var assetIndex = -1;
				for (var j = 0; j < assets.length; j++) {
					if (assets[j].name == assetName) {
						assetIndex = j;
						break;
					}
				}
				// Create asset if not exist
				if (assetIndex == -1) {
					$("#assetsView .assetSelection").append('<option id="asset_' + assets.length + '" value=' + assetName + '">' + assetName + '</option>');
					var asset = {"id":misc.assetId,"name":assetName,"x":0,"y":0,"animations":[],"defaultActions":[],"conditionalActions":[]};
					misc.assetId++;
					assets.push(asset);
					assetIndex = assets.length - 1;
				}
				assets[assetIndex].x = sprite.x;
				assets[assetIndex].y = sprite.y;
				assets[assetIndex].doorTarget = undefined;
				if (doorTarget != "") {
					assets[assetIndex].doorTarget = doorTarget;
          var closedFound = false;
          var openFound = false;
          for (var a = 0; a < assets[assetIndex].animations.length; a++) {
            if (assets[assetIndex].animations[a].name == "closed") {
              closedFound = true;
            }
            else if (assets[assetIndex].animations[a].name == "open") {
              openFound = true;
            }
          }
          if (!closedFound) {
            assets[assetIndex].animations.push({"name":"closed","fps":1,"loop":true,"frames":[assetName + "_closed"]});
          }
          if (!openFound) {
            assets[assetIndex].animations.push({"name":"open","fps":1,"loop":true,"frames":[assetName]});
          }
          /*var gamestateFound = false;
          for (var g = 0; g < gamestates.length; g++) {
            if (gamestates[g].name == assetName) {
              gamestateFound = true;
              break;
            }
          }
          if (!gamestateFound) {
            gamestates.push({"id":misc.gameStateId,"name":assetName,"type":"bool","value":true});
            misc.gameStateId++;
            saveJSObjectAsJSON(gamestates, "json/gamestates.json");
          }*/
				}
			}
		}
		var atlasIndex = -1;
		// Add atlas to list if not exist
		for (var i = 0; i < spriteAtlases.length; i++) {
			if (spriteAtlases[i][0] == rooms[roomIndex].atlasName) {
				atlasIndex = i;
				break;
			}
		}
		if (atlasIndex == -1 && rooms[roomIndex].atlasName != "") {
			spriteAtlases.push([rooms[roomIndex].atlasName, "img/" + roomName + "/" + roomName + "Atlas.png", "img/" + roomName + "/" + roomName + "Atlas.json"]);
			atlasIndex = spriteAtlases.length - 1;
		}
		rooms[roomIndex].bgImage = bgImage;
		rooms[roomIndex].bgWidth = bgWidth;
		rooms[roomIndex].bgHeight = bgHeight;
	}
	
	// Create json files
	saveJSObjectAsJSON(rooms, "json/rooms.json");
	saveJSObjectAsJSON(assets, "json/assets.json");
	saveJSObjectAsJSON(misc, "json/misc.json");
	saveJSObjectAsJSON(spriteAtlases, "json/spriteAtlases.json");
	updateSpriteAtlases();
  //updateGamestates();
	//console.log(jsonData);
}

function importAudios(jsonData) {
  
  for (var category in jsonData) {
    if (category == 'music' || jsonData[category].length == 0) continue;
    var soundPath = 'sounds/';
    
    if (jsonData[category]['audiosprites']) {
      
      for (var audioSpriteName in jsonData[category]['audiosprites']) {
        var index = -1;
        // Add audiosprite or overwrite it
        for (var i = 0; i < sounds.audioSprites.length; i++) {
          if (sounds.audioSprites[i][0] == audioSpriteName) {
            index = i;
            break;
          }
        }
        var urls = [];
        for (var i = 0; i < jsonData[category]['audiosprites'][audioSpriteName].resources.length; i++) {
          urls.push(soundPath + jsonData[category]['audiosprites'][audioSpriteName].resources[i]);
        }
        var newAudioSprite = [audioSpriteName, urls, soundPath + audioSpriteName + '.json'];
        if (index == -1) {
          sounds.audioSprites.push(newAudioSprite);
        }
        else {
          sounds.audioSprites[index] = newAudioSprite;
        }
        // Add audios
        for (var audio in jsonData[category]['audiosprites'][audioSpriteName].spritemap) {
          var audioTemp = audio.split("_");
          var audioId = parseInt(audioTemp[0]);
          if (category == 'dialogs') {
            //if (audioTemp.length > 2) continue;
            for (var i = 0; i < dialogs.length; i++) {
              if (dialogs[i].id == audioId) {
                dialogs[i].audio = [audio, audioSpriteName];
                break;
              }
            }
          }
          else if (category == 'assets') {
            //if (audioTemp.length > 2) continue;
            for (var i = 0; i < assets.length; i++) {
              if (assets[i].name == audio) {
                assets[i].clickSound = [audio, audioSpriteName];
                break;
              }
            }
          }
        }
      }
    }
    if (jsonData[category]['general']) {
      
      for (var audioName in jsonData[category]['general']) {
        var index = -1;
        // Add general audio or overwrite it
        for (var i = 0; i < sounds.general.length; i++) {
          if (sounds.general[i][0] == audioName) {
            index = i;
            break;
          }
        }
        var urls = [];
        for (var i = 0; i < jsonData[category]['general'][audioName].length; i++) {
          urls.push(soundPath + jsonData[category]['general'][audioName][i]);
        }
        var newGeneralAudio = [audioName, urls];
        if (index == -1) {
          sounds.general.push(newGeneralAudio);
        }
        else {
          sounds.general[index] = newGeneralAudio;
        }
        // Add audio
        var audio = audioName;
        var audioTemp = audio.split("_");
        var audioId = parseInt(audioTemp[0]);
        if (category == 'dialogs') {
          //if (audioTemp.length > 2) continue;
          for (var i = 0; i < dialogs.length; i++) {
            if (dialogs[i].id == audioId) {
              dialogs[i].audio = [audio];
              break;
            }
          }
        }
        else if (category == 'assets') {
          //if (audioTemp.length > 2) continue;
          for (var i = 0; i < assets.length; i++) {
            if (assets[i].name == audio) {
              assets[i].clickSound = [audio];
              break;
            }
          }
        }
      }
    }
  }

  // Create json files
  saveJSObjectAsJSON(assets, "json/dialogs.json");
  saveJSObjectAsJSON(dialogs, "json/dialogs.json");
  saveJSObjectAsJSON(sounds, "json/sounds.json");	
  updateAudioSprites();
  updateGeneralAudio();
}

