
var options = new ExportOptionsPNG24();
var doc = app.activeDocument;

var newdoc = app.documents.add(doc.documentColorSpace, doc.width, doc.height);

newdoc.artboards[0].artboardRect = doc.artboards[0].artboardRect;

var jsonFileName = decodeURI(doc.name);
jsonFileName = jsonFileName.substring(0, jsonFileName.indexOf("."));

var definitionsJSON = "";

saveSubLayers(doc, "");

if (definitionsJSON.length) {
	definitionsJSON = definitionsJSON.slice(0, -2);
	definitionsJSON += "\n";
}
definitionsJSON = "{\n\"sprites\":[\n" + definitionsJSON;
definitionsJSON += "]\n}";

// Write json file
var file = new File(doc.path + "" + "/" +jsonFileName + ".json");
file.remove();
file.open("w", "TEXT");
file.lineFeed = "\n";
file.write(definitionsJSON);
file.close();

newdoc.close(SaveOptions.DONOTSAVECHANGES);

function saveSubLayers (node, path) {
	for (var i = 0; i < node.layers.length; i++) {
		var layer = node.layers[i];
		if (!layer.visible) continue;
		if (layer.layers.length > 0)
			saveSubLayers(layer, path + "/" + layer.name);
		else
			saveLayer(layer, path);
	}
}

function saveLayer (layer, path) {
	newdoc.layers[0].remove();
	var newlayer = newdoc.layers[0];
	var bg = false;
	options.artBoardClipping = false;
	if (layer.name.indexOf("_bg") > -1) {
		bg = true;
		options.artBoardClipping = true;
	}
	for (var ii = layer.pageItems.length - 1; ii >= 0; ii--) {
		
        layer.pageItems[ii].duplicate(newlayer, ElementPlacement.PLACEATBEGINNING);
		//$.writeln(layer.pageItems[ii].left);
		
		var coords = getCoords(layer.pageItems[ii]);
		var width = newlayer.pageItems[ii].width;
		var height = newlayer.pageItems[ii].height;
		if (bg) {
			var change = newlayer.pageItems[ii].left;
			app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
			newlayer.pageItems[ii].left = change;
			app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
			coords.x = 0;
			coords.y = 0;
			width = newdoc.artboards[0].artboardRect[2];
			height = -1*newdoc.artboards[0].artboardRect[3];
			//$.writeln(newdoc.artboards[0].artboardRect);
			//$.writeln(newlayer.pageItems[ii].left);
			//app.coordinateSystem = CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
			//$.writeln(newlayer.pageItems[ii].position);
			
			/*if (newlayer.pageItems[ii].left != 0) {
				newlayer.pageItems[ii].left = 0;
			}*/
			/*if (coords.x < 0) {
				newlayer.pageItems[ii].left 
			}*/
			
			/*else if (newlayer.pageItems[ii].left > 0) {
				newlayer.pageItems[ii].left -= newlayer.pageItems[ii].left;
			}*/
			//newlayer.pageItems[ii].position = [0, newlayer.pageItems[ii].position[1]];
			/*$.writeln(newlayer.pageItems[ii].position);
			newlayer.pageItems[ii].left = -600;
			$.writeln(newlayer.pageItems[ii].position);*/
			//$.writeln(newlayer.pageItems[ii].position);
			
		}
         
        definitionsJSON += "{\"name\":\"" + layer.name + "\",\"sprite\":\"" + layer.name + ".png\",\"x\":" + coords.x + ",\"y\":" + coords.y + ",\"width\":" + Math.round(width) + ",\"height\":" + Math.round(height) + "}";
        //if (ii > 0) {
            definitionsJSON += ",";
        //}
        definitionsJSON += "\n";
	}
	
	new Folder(doc.path + path).create();
	newdoc.exportFile(new File(doc.path + path + "/" + layer.name + ".png"), ExportType.PNG24, options);
}

function getCoords(item){
    
    var pos = doc.convertCoordinate (item.position, CoordinateSystem.DOCUMENTCOORDINATESYSTEM, CoordinateSystem.ARTBOARDCOORDINATESYSTEM);
    var x = parseFloat(pos[0].toFixed(0));
    var y = parseFloat((Math.abs(pos[1])).toFixed(0));
    return {x: x, y: y}; 
}