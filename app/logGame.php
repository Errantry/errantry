<?php
session_start();
$action = '';

if (isset($_REQUEST['action'])) {
  $action = $_REQUEST['action'];
}
if ($action == 'createLogFile') {
  createLogFile();
  exit;
}
else if ($action == 'createErrorLogFile') {
  createErrorLogFile();
  exit;
}

function createErrorLogFile() {
  if (isset($_POST["error"])) {
    $errorMsg = $_POST["error"];
  }
  
  if (isset($_POST["filename"])) {
		$file = $_POST["filename"];
	}
  
  $previousErrorLog = "";
  if (is_file('logs/'.$file)) {
    $previousErrorLog = file_get_contents('logs/'.$file);
  }
  
  if (!empty($previousErrorLog)) {
    $errorLog = $previousErrorLog . "\r\n" . $errorMsg;
  }
  else {
    $errorLog = $errorMsg;
  }
  file_put_contents('logs/'.$file, $errorLog);
	exit();
}

function createLogFile() {
	$JS = new stdClass();
	$JS->gamestate = new stdClass();
	$JS->npcState = new stdClass();
	$JS->assetState = new stdClass();
	$JS->questLog = new stdClass();
  
  if (isset($_POST["sessionId"])) {
		$JS->sessionId = $_POST["sessionId"];
	}
  if (isset($_POST["date"])) {
		$JS->date = $_POST["date"];
	}
	if (isset($_POST["gamestate"])) {
		$JS->gamestate = json_decode($_POST["gamestate"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["npcState"])) {
		$JS->npcState = json_decode($_POST["npcState"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["assetState"])) {
		$JS->assetState = json_decode($_POST["assetState"], JSON_FORCE_OBJECT);
	}
	if (isset($_POST["questLog"])) {
		$JS->questLog = json_decode($_POST["questLog"], JSON_FORCE_OBJECT);
	}
  if (isset($_POST["playerCharacterValues"])) {
		$JS->playerCharacterValues = json_decode($_POST["playerCharacterValues"], JSON_FORCE_OBJECT);
	}
  if (isset($_POST["inventory"])) {
		$JS->inventory = json_decode($_POST["inventory"], JSON_FORCE_OBJECT);
	}
  if (isset($_POST["characterX"])) {
		$JS->characterX = json_decode($_POST["characterX"]);
	}
  if (isset($_POST["characterFace"])) {
		$JS->characterFace = json_decode($_POST["characterFace"]);
	}
  
	if (isset($_POST["filename"])) {
		$file = 'logs/'.$JS->sessionId.'-'.$_POST["filename"];
	}
  $previousLog = "";
  if (is_file($file)) {
    $previousLog = file_get_contents($file);
  }
  $previousLog = json_decode($previousLog);
  $newLog = array();
  
  if (!empty($previousLog)) {
    foreach ($previousLog as $logItem) {
      array_push($newLog, $logItem);
    }
  }
  
  array_push($newLog, $JS);
  
  while (count($newLog) > 10) {
    array_splice($newLog, 0, 1); // Remove oldest log items
  }
  
  /*$send_data = true;
  if ($send_data) {
    // Print response
    header('Cache-Control: no-cache, must-revalidate'); // HTTP/1.1
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
    header('Content-Type: application/json; charset=utf-8');
    echo $previousLog;
  }*/
  
	file_put_contents($file, json_encode($newLog, 128/*JSON_PRETTY_PRINT*/ | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
  exit();
}
?>