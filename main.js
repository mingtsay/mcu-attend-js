/* MCU Attend, Version 0.9.8 */
/* This script release under LGPL License */

var mcu_attend_version = "0.9.8";
var target_window = (typeof window.mainFrame === 'undefined' ? window : window.mainFrame);
var target_document = target_window.document;

/* jQuery from stackoverflow: 8139794 */
var loadJQ = function (onload, target_document) {
    if (typeof jQuery !== 'undefined') {
        onload();
    } else {
        var head = target_document.getElementsByTagName('head')[0];
        var jq = target_document.createElement('script');
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

/**
 * jBeep
 *
 * Play WAV beeps easily in javascript!
 * Tested on all popular browsers and works perfectly, including IE6.
 *
 * @date 10-19-2012
 * @license MIT
 * @author Everton (www.ultraduz.com.br)
 * @version 1.0
 * @params soundFile The .WAV sound path
 */
window.jBeep = target_window.jBeep = function(a){if(!a)a="jBeep/jBeep.wav";var b,c,d;d=true;try{if(typeof document.createElement("audio").play=="undefined")d=false}catch(e){d=false}c=document.getElementsByTagName("body")[0];if(!c)c=document.getElementsByTagName("html")[0];b=document.getElementById("jBeep");if(b)c.removeChild(b);if(d){b=document.createElement("audio");b.setAttribute("id","jBeep");b.setAttribute("src",a);b.play()}else if(navigator.userAgent.toLowerCase().indexOf("msie")>-1){b=document.createElement("bgsound");b.setAttribute("id","jBeep");b.setAttribute("loop",1);b.setAttribute("src",a);c.appendChild(b)}else{var f;b=document.createElement("object");b.setAttribute("id","jBeep");b.setAttribute("type","audio/wav");b.setAttribute("style","display:none;");b.setAttribute("data",a);f=document.createElement("param");f.setAttribute("name","autostart");f.setAttribute("value","false");b.appendChild(f);c.appendChild(b);try{b.Play()}catch(e){b.object.Play()}}}

/* CSS from stackoverflow: 524696 */
var loadCSS = function (csstext, target_document) {
    var head = target_document.getElementsByTagName('head')[0];
    var mycss = target_document.createElement("style");
    mycss.type = 'text/css';
    if (mycss.styleSheet) {
        mycss.styleSheet.cssText = csstext;
    } else {
        mycss.appendChild(target_document.createTextNode(csstext));
    }
    head.appendChild(mycss);
}

/* trim support for IE from stackoverflow: 2308134 */
if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  }
}

window.playSound = target_window.playSound = function (sid, name) {
    jBeep("http://mt.rmstudio.tw/mcu_attend/wave.php?sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
};

window.regen = target_window.regen = function(sid) {
    jBeep("http://mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&dummy=" + (new Date().getTime()));
}

window.change = target_window.change = function(sid, name) {
    name = window.prompt("請輸入欲修改之語音內容：", name);
    jBeep("http://mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
};

window.replay = target_window.replay = function (sid, name, i) {
    playSound(sid, name);
    $(mcu_attend_list[i]).find("input").focus();
};

window.get_now_index = target_window.get_now_index = function() {
    for (var i in mcu_attend_list) {
        var n = mcu_attend_list[i];
        if ($(n).find("input").is(":focus")) return i;
    }
    return false;
}

var mcu_attend_list = [];

loadJQ(function () {
    loadJQ(function () {
        if ($(target_document).find("form #mcu_attend").length) {
            window.alert("唱名程式已載入，若要重新載入請重新整理頁面！");
            return;
        }

        loadCSS("" +
            "#mcu_attend {" +
                "text-align: center;" +
                "padding: 5px;" +
                "margin: 5px;" +
                "background: #66f;" +
                "color: #ff6;" +
            "}" +
            "#mcu_attend a {" +
                "color: #fcf;" +
                "text-decoration: none;" +
            "}" +
            "#mcu_attend a:hover {" +
                "color: #fff;" +
            "}" +
            "form td.focus {" +
                "background: #E1FFFF;" +
            "}" +
            "form td.hover {" +
                "background: #FFE1FF;" +
            "}" +
            "form td.hover.focus {" +
                "background: #E1FFE1;" +
            "}" +
            "div.function_buttons {" +
                "text-align: center;" +
                "visibility: hidden;" +
            "}" +
            "form td.hover div.function_buttons, form td.focus div.function_buttons {" +
                "visibility: visible;" +
            "}" +
        "", target_document);

        if($(target_document).find("form td").length == 0) {
            window.alert("唱名系統載入失敗，請確認您所開啟的頁面是否為銘傳的點名考勤系統！");
            return;
        }

        $(target_document).find("form td").mouseover(function() {
            $(this).addClass("hover");
        }).each(function() {
            var sid = $(this).find("input")[0].value;
            var name = $($(this)[0]).text().trim().substr(sid.length).trim();
            var btn_replay = "<a href=\"javascript:replay('" + sid + "','" + name + "', " + mcu_attend_list.length + ");\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"http://mt.rmstudio.tw/mcu_attend/images/replay.png\" title=\"重新播放音訊檔案\" alt=\"replay\" /></a>";
            var btn_regen = "<a href=\"javascript:regen('" + sid + "');\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"http://mt.rmstudio.tw/mcu_attend/images/regen.png\" title=\"重新產生音訊檔案\" alt=\"regen\" /></a>";
            var btn_change = "<a href=\"javascript:change('" + sid + "','" + name + "');\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"http://mt.rmstudio.tw/mcu_attend/images/change.png\" title=\"修改發音內容\" alt=\"change\" /></a>";
            $(this).append($("<div class=\"function_buttons\">" + btn_change + "&nbsp;" + btn_regen + "&nbsp;" + btn_replay + "</div>"));
            $(this).attr("mcu_attend_sid", sid);
            $(this).attr("mcu_attend_name", name);
            mcu_attend_list.push(this);
        }).mouseout(function() {
            $(this).removeClass("hover");
        });

        $(target_document).find("form td input").focus(function() {
            $(this).parents("td").addClass("focus");
        }).blur(function() {
            $(this).parents("td").removeClass("focus");
        });

        $(target_document).keydown(function(e) {
            switch(e.keyCode) {
                case 37: // left
                case 39: // right
                case 86: // V
                case 66: // B
                case 78: // N
                    break;
                default: return;
            }

            var play_me = false;
            var now_index = get_now_index();
            if (now_index === false) {
                now_index = 0;
            } else {
                if (!mcu_attend_list.length) {
                    now_index = -1;
                } else {
                    switch (e.keyCode) {
                        case 66: // B(ack)
                            play_me = true;
                        case 37: // left
                            --now_index;
                            break;
                        case 78: // N(ext)
                            play_me = true;
                        case 39: // right
                            ++now_index;
                            break;
                        case 86: // V(oice)
                            play_me = true;
                            break;
                    }
                }
            }

            if (now_index >= 0 && now_index < mcu_attend_list.length) {
                var t = mcu_attend_list[now_index];
                var input = $(t).find("input")[0];
                var sid = $(t).attr("mcu_attend_sid");
                var name = $(t).attr("mcu_attend_name");
                $(input).focus();
                if (play_me) playSound(sid, name);
            }

            e.preventDefault();
        });

        $(target_document).find("form").prepend("<div id=\"mcu_attend\">外掛已載入：<a href=\"http://mt.rmstudio.tw/mcu_attend\" target=\"_blank\" title=\"瀏覽唱名程式專案網頁（另開新視窗）\">唱名程式</a> v" + mcu_attend_version + " Developed by Ming Tsay. 2013</div>");

        window.alert(
            "唱名程式 v" + mcu_attend_version + "已成功載入！\n\n" +
            "使用方法：\n以滑鼠點擊播放按鈕，或使用鍵盤Tab鍵來唱名。以空白鍵(Space)選取缺課學生。\n\n" +
            "　　　　　\n亦可使用下列鍵盤的按鍵操作本系統：V播放、B上一位學生**並播放**、N下一位學生**並播放**。\n\n" +
            "　　　　　\n用滑鼠按下播放按鈕後，游標焦點將會移至核取方塊。\n\n" +
            "障礙排除：\n" +
            "若唸出來的發音錯誤，可點選「修改發音內容」以同音字來發音。\n" +
            "若無法正常唸出姓名，可點選「重新播放音訊檔案」或「重新產生音訊檔案」。\n\n" +
            "本程式以 LGPL v3.0 授權釋出，請依授權指示來使用本程式。\n" +
            "Developed by Ming Tsay. 2013"
        );
    }, target_document);
}, document); 
