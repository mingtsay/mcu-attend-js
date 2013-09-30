/* MCU Attend, Version 0.9.0 */
/* This script release under LGPL License */

/* jQuery from stackoverflow: 8139794 */
function loadJQ(onload) {
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
}

/* Sound from stackoverflow: 17762763, 7210567 */
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
var cssxx = 'form td:hover { background: #FFE1FF; }';
var mycss = document.createElement("style");
mycss.type = 'text/css';
if (mycss.styleSheet) {
    mycss.styleSheet.cssText = cssxx;
} else {
    mycss.appendChild(document.createTextNode(cssxx));
}
head.appendChild(mycss);

var playSound = function (sid) {
    var s = new Sound("http://mt.rmstudio.tw/mcu_attend/wave.php?sid=" + sid);
};

var nowid = "";

loadJQ(function () {
    $(function() {
        $("form td").mouseover(function() {
            var this_id = $(this).find("font")[1].innerHTML;
            if (nowid != this_id) {
                playSound(this_id);
                $("form td").removeClass("xmcuattend");
                $(this).addClass("xmcuattend");
                nowid = this_id;
            }
        });
        /*$("form table").mouseout(function() {
            nowid = "";
        });*/
    });
});

