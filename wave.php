<?php
    include("config.php");

    $db = new PDO(DB_DSN . ":host=" . DB_HOSTNAME . ";dbname=" . DB_DATABASE, DB_USERNAME, DB_PASSWORD);
    $db->exec("SET NAMES UTF8");

    if (isset($_GET["sid"])) {
        $sid = trim($_GET["sid"]);

        if (is_numeric($sid) && strlen($sid) == 8) {
            $query = $db->prepare("SELECT * FROM `" . DB_TABLENAME . "` WHERE `sid` = :sid LIMIT 1");
            $query->bindParam(":sid", $sid);
            $query->execute();

            if (false !== ($data = $query->fetch())) {
                $wave = base64_decode($data["sound"]);
            } else {
                $wave = "";
            }
        } else {
            $error = array(400, "Bad Student ID.");
        }
    } else {
        $error = array(400, "Please specify the Student ID and name by HTTP get.");
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

