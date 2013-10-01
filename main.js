/* MCU Attend, Version 0.9.3 */
/* This script release under LGPL License */

/* jQuery from stackoverflow: 8139794 */
var loadJQ = function (onload) {
    var head = document.getElementsByTagName('head')[0];
    var jq = document.createElement('script');
    jq.src = 'http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
    jq.type = 'text/javascript';
    jq.onload = jq.onreadystatechange = function() {
        if (jq.readyState) {
            if (jq.readyState === 'complete' || jq.readyState === 'loaded') {
                jq.onreadystatechange = null;
                onload();
            }
        } else onload();
    };
    head.appendChild(jq);
};

/* Sound from stackoverflow: 17762763 */
var Sound = (function () {
    var df = document.createDocumentFragment();
    return function Sound(src) {
        var snd = new Audio(src);
        df.appendChild(snd); // keep in fragment until finished playing
        snd.addEventListener('ended', function () {df.removeChild(snd);});
        snd.play();
        return snd;
    }
}());

/* CSS from stackoverflow: 524696 */
var head = document.getElementsByTagName('head')[0];
var csstxt = 'form td:hover { background: #FFE1FF; } div.regen { display: inline-block; text-align: right; visibility: hidden; } form td:hover div.regen { visibility: visible; }';
var mycss = document.createElement("style");
mycss.type = 'text/css';
if (mycss.styleSheet) {
    mycss.styleSheet.cssText = csstxt;
} else {
    mycss.appendChild(document.createTextNode(csstxt));
}
head.appendChild(mycss);

var playSound = function (sid, name) {
    var s = new Sound("http://mt.rmstudio.tw/mcu_attend/wave.php?sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
};

var regen = function(sid) {
    var s = new Sound("http://mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&dummy=" + (new Date().getTime()));
}

var change = function(sid, name) {
    name = window.prompt("請輸入欲修改之語音內容：", name);
    var s = new Sound("http://mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
};

var nowid = "";

loadJQ(function () {
    $(function() {
        $("form td").mouseover(function() {
            var sid = $(this).find("font")[1].innerHTML;
            var name = $($(this).find("font")[0]).text().substr(sid.length).trim();
            if (nowid != sid) {
                playSound(sid, name);
                nowid = sid;
            }
        }).each(function() {
            var sid = $(this).find("font")[1].innerHTML;
            var name = $($(this).find("font")[0]).text().substr(sid.length).trim();
            var btn_regen = "<a href=\"javascript:regen('" + sid + "');\"><img width=\"16px\" height=\"16px\" src=\"http://mt.rmstudio.tw/mcu_attend/images/regen.png\" title=\"重新產生音訊檔案\" alt=\"regen\" /></a>";
            var btn_change = "<a href=\"javascript:change('" + sid + "', '" + name + "');\"><img width=\"16px\" height=\"16px\" src=\"http://mt.rmstudio.tw/mcu_attend/images/change.png\" title=\"修改發音內容\" alt=\"change\" /></a>";
            $(this).prepend($("<div class=\"regen\">" + btn_change + "&nbsp;" + btn_regen + "</div>"));
        });
    });
});

