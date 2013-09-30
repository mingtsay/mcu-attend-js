<?php
    include("config.php");

    $tts_config = array(
        "speaker" => "Theresa",
        "volume" => 100,
        "speed" => -7,
        "output_type" => "wav",
        "pitch_level" => 0,
        "pitch_sign" => 0,
        "pitch_scale" => 5,
    );

    $db = new PDO(DB_DSN . ":host=" . DB_HOSTNAME . ";dbname=" . DB_DATABASE, DB_USERNAME, DB_PASSWORD);
    $db->exec("SET NAMES UTF8");

    foreach ($_GET as $key => $value) {
        $_POST[$key] = $value;
    }

    if (isset($_POST["sid"]) && isset($_POST["name"])) {
        $sid = trim($_POST["sid"]);
        $name = trim($_POST["name"]);

        if (is_numeric($sid) && strlen($sid) == 8 && strlen($name) > 0) {
            $query = $db->prepare("SELECT * FROM `" . DB_TABLENAME . "` WHERE `sid` = :sid LIMIT 1");
            $query->bindParam(":sid", $sid);
            $query->execute();

            if (false !== ($data = $query->fetch())) {
                if ($data["name"] == $name) {
                    $sound = $data["sound"];
                    $wave = base64_decode($data["sound"]);
                } else {
                    $sound = false;
                }
            } else {
                $sound = false;
            }

            if (!$sound) {
                $tts = new SoapClient("http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl");

                # request
                list($r_code, $r_msg, $r_id) = explode("&",
                    $tts->ConvertAdvancedText(
                        TTS_USERNAME, TTS_PASSWORD, $name,
                        $tts_config["speaker"], $tts_config["volume"], $tts_config["speed"],
                        $tts_config["output_type"], $tts_config["pitch_level"], $tts_config["pitch_sign"], $tts_config["pitch_scale"]
                    )
                );

                if ((int) $r_code != 0) {
                    $error = array(500, "TTS service request error ($r_code): $r_msg");
                } else {
                    $time = time();
                    while (true) {
                        $r = explode("&", $tts->GetConvertStatus(TTS_USERNAME, TTS_PASSWORD, (int) $r_id));

                        if (time() - $time > 60) {
                            $error = array(500, "TTS service pending timeout! (60s)");
                            break;
                        } else {
                            if ((int) $r[0] == 0) {
                                if((int) $r[2] == 2) {
                                    $wave = file_get_contents($r[4]);
                                    $sound = base64_encode($wave);
                                    break;
                                }
                            } else {
                                $error = array(500, "TTS service pending error ($r_code): $r_msg");
                                break;
                            }
                        }
                    }

                    if (!isset($error)) {
                        if ($data) {
                            $update = $db->prepare("UPDATE `" . DB_TABLENAME . "` SET `name` = :name, `sound` = :sound WHERE `id` = :id LIMIT 1");
                            $update->bindParam(":id", $data["id"]);
                            $update->bindParam(":name", $name);
                            $update->bindParam(":sound", $sound);
                            $update->execute();
                        } else {
                            $update = $db->prepare("INSERT INTO `" . DB_TABLENAME . "` (`sid`, `name`, `sound`) VALUES (:sid, :name, :sound)");
                            $update->bindParam(":sid", $sid);
                            $update->bindParam(":name", $name);
                            $update->bindParam(":sound", $sound);
                            $update->execute();
                        }
                    }
                }
            }
        } else {
            $error = array(400, "Bad Student ID or name.");
        }
    } else {
        $error = array(400, "Please specify the Student ID and name by HTTP post.");
    }

    if (isset($error)) {
        header("Content-Type: text/plain;charset=utf-8");
        header("Content-Length: " . strlen($error[1]));
        header("HTTP/ " . $error[0]);
        echo($error[1]);
    } else {
        header("Content-Type: audio/vnd.wave");
        header("Content-Length: " . strlen($wave));
        echo($wave);
    }

