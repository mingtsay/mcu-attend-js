<?php
    include("config.php");

    $tts_config = array(
        "speaker" => "Theresa",
        "volume" => 100,
        "speed" => 0,
        "output_type" => "wav",
        "pitch_level" => 0,
        "pitch_sign" => 0,
        "pitch_scale" => 5,
    );

    $db = new PDO(DB_DSN . ":host=" . DB_HOSTNAME . ";dbname=" . DB_DATABASE, DB_USERNAME, DB_PASSWORD);
    $db->exec("SET NAMES UTF8");

    if (isset($_GET["sid"])) {
        $sid = trim($_GET["sid"]);

        if (is_numeric($sid) && strlen($sid) == 8) {
            $query = $db->prepare("SELECT * FROM `" . DB_TABLENAME . "` WHERE `sid` = :sid LIMIT 1");
            $query->bindParam(":sid", $sid);
            $query->execute();

            $data = $query->fetch();

            if (isset($_GET["regen"])) {
                if (isset($_GET["name"])) {
                    $name = $_GET["name"];
                } else if ($data) {
                    $name = $data["name"];
                } else {
                    $error = array(400, "Please specify name.");
                }

                if (!isset($error) && false !== ($wave = getTTSWave($name))) {
                    $sound = base64_encode($wave);

                    if ($data) {
                        $update = $db->prepare("UPDATE `" . DB_TABLENAME . "` SET `name` = :name, `sound` = :sound WHERE `sid` = :sid");
                    } else {
                        $update = $db->prepare("INSERT INTO `" . DB_TABLENAME . "` (`sid`, `name`, `sound`) VALUES (:sid, :name, :sound);");
                    }

                    $update->bindParam(":sid", $sid);
                    $update->bindParam(":name", $name);
                    $update->bindParam(":sound", $sound);
                    $update->execute();
                } else if (!isset($error)) {
                    $error = array(500, "Error while fetch TTS sound.");
                }
            } else {
                if ($data) {
                    $wave = base64_decode($data["sound"]);
                } else {
                    if (isset($_GET["name"])) {
                        $name = $_GET["name"];

                        if (false !== ($wave = getTTSWave($name))) {
                            $sound = base64_encode($wave);

                            $update = $db->prepare("INSERT INTO `" . DB_TABLENAME . "` (`sid`, `name`, `sound`) VALUES (:sid, :name, :sound);");

                            $update->bindParam(":sid", $sid);
                            $update->bindParam(":name", $name);
                            $update->bindParam(":sound", $sound);
                            $update->execute();
                        } else {
                            $error = array(500, "Error while fetch TTS sound.");
                        }
                    } else {
                        $error = array(404, "Student ID not found.");
                    }
                }
            }
        } else {
            $error = array(400, "Bad Student ID.");
        }
    } else {
        $error = array(400, "Please specify the Student ID by HTTP get.");
    }

    if (isset($error)) {
        header("Content-Type: text/plain;charset=utf-8");
        header("Content-Length: " . strlen($error[1]));
        header("HTTP/ " . $error[0]);
        echo($error[1]);
    } else {
        header("Content-Type: audio/wav");
        header("Content-Length: " . strlen($wave));
        echo($wave);
    }

    exit();

    function getTTSWave($name) {
        global $tts_config;

        $tts = new SoapClient("http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl");
        $r = explode("&", $tts->ConvertAdvancedText(
            TTS_USERNAME, TTS_PASSWORD, $name,
            $tts_config["speaker"], $tts_config["volume"], $tts_config["speed"],
            $tts_config["output_type"], $tts_config["pitch_level"], $tts_config["pitch_sign"], $tts_config["pitch_scale"]
        ));

        if ((int) $r[0] != 0) {
            return false;
        } else {
            $time = time();
            while (true) {
                $q = explode("&", $tts->GetConvertStatus(TTS_USERNAME, TTS_PASSWORD, (int) $r[2]));

                if (time() - $time > 90) {
                    return false;
                } else {
                    if ((int) $q[0] != 0) {
                        return false;
                    } else {
                        if ((int) $q[2] == 2) {
                            return file_get_contents($q[4]);
                        }
                    }
                }
            }
        }
    }

