/* MCU Attend, Version 0.9.9.2 */
/* This script release under LGPL License */

var mcu_attend_version = "0.9.9.2";
var target_window = (typeof window.mainFrame === 'undefined' ? window : window.mainFrame);
var target_document = target_window.document;

if (typeof window.mainFrame !== 'undefined') {
    if (confirm("唱名程式不支援有框架頁的點名系統，是否自動切換至無框架的頁面？\n您只需要按下確定後重新載入此唱名程式即可使用。"))
        window.location.href = (window.location.protocol == "https:" ? "http:" : window.mainFrame.location.protocol) + window.mainFrame.location.href.substring(window.mainFrame.location.protocol.length);
// } else if (window.location.protocol == "https:") { /* force HTTP from stackoverflow: 4723213 */
//    if (confirm("唱名程式不能於HTTPS的模式下執行，是否自動切換至HTTP模式？\n您只需要按下確定後重新載入此唱名程式即可使用。"))
//        window.location.href = "http:" + window.location.href.substring(window.location.protocol.length);
} else {
    /* jQuery from stackoverflow: 8139794 */
    var loadJQ = function (onload, target_document) {
        if (typeof jQuery !== 'undefined') {
            onload();
        } else {
            var head = target_document.getElementsByTagName('head')[0];
            var jq = target_document.createElement('script');
            jq.src = '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';
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
    window.jBeep = target_window.jBeep = function(a){if(!a)a="jBeep/jBeep.wav";var b,c,d;d=true;try{if(typeof document.createElement("audio").play=="undefined")d=false}catch(e){d=false}c=document.getElementsByTagName("body")[0];if(!c)c=document.getElementsByTagName("html")[0];b=document.getElementById("jBeep");if(b)c.removeChild(b);if(d){b=document.createElement("audio");b.setAttribute("id","jBeep");b.setAttribute("src",a);b.play()}else if(navigator.userAgent.toLowerCase().indexOf("msie")>-1){b=document.createElement("bgsound");b.setAttribute("id","jBeep");b.setAttribute("loop",1);b.setAttribute("src",a);c.appendChild(b)}else{var f;b=document.createElement("object");b.setAttribute("id","jBeep");b.setAttribute("type","audio/wav");b.setAttribute("style","display:none;");b.setAttribute("data",a);f=document.createElement("param");f.setAttribute("name","autostart");f.setAttribute("value","false");b.appendChild(f);c.appendChild(b);try{b.Play()}catch(e){b.object.Play()}}};

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
    };

    /* trim support for IE from stackoverflow: 2308134 */
    if(typeof String.prototype.trim !== 'function') {
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      }
    }

    var playSound = function (sid, name) {
        jBeep("//mt.rmstudio.tw/mcu_attend/wave.php?sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
    };

    var regen = function(sid) {
        jBeep("//mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&dummy=" + (new Date().getTime()));
    };

    var change = function(sid, name) {
        name = window.prompt("請輸入欲修改之語音內容：", name);
        if (name === null) return;
        jBeep("//mt.rmstudio.tw/mcu_attend/wave.php?regen&sid=" + sid + "&name=" + name + "&dummy=" + (new Date().getTime()));
    };

    var replay = function (sid, name, i) {
        playSound(sid, name);
        $(mcu_attend_list[i]).find("input").focus();
    };

    var get_now_index = function() {
        for (var i in mcu_attend_list) {
            var n = mcu_attend_list[i];
            if ($(n).find("input").is(":focus")) return i;
        }

        if (global_now_index != -1) return global_now_index;
        return -1;
    };

    var reverse = function() {
        for (var i in mcu_attend_list) {
            var input = $(mcu_attend_list[i]).find("input")[0];
            input.checked = !input.checked;
        }
    };

    var toggle_keyboard = function() {
        $("#mcu_attend_keyboard_content").toggleClass("toggle_hidden");
    };

    var mcu_attend_list = [];
    var global_now_index = -1;

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
                "#mcu_attend_keyboard {" +
                    "text-align: center;" +
                    "padding: 5px;" +
                    "margin: 5px;" +
                    "background: #099;" +
                    "color: #cff;" +
                    "text-decoration: none;" +
                    "display: block;" +
                "}" +
                "#mcu_attend_keyboard_content {" +
                    "text-align: left;" +
                    "color: #cff;" +
                "}" +
                "#mcu_attend_keyboard_content.toggle_hidden {" +
                    "display: none;" +
                "}" +
                "#mcu_attend_reverse {" +
                    "text-align: center;" +
                    "padding: 5px;" +
                    "margin: 5px;" +
                    "background: #f66;" +
                    "color: #6fc;" +
                "}" +
                "#mcu_attend_reverse a {" +
                    "color: #00f;" +
                    "text-decoration: none;" +
                "}" +
                "#mcu_attend_reverse a:hover {" +
                    "color: #06f;" +
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
            }).mouseout(function() {
                $(this).removeClass("hover");
            }).click(function() {
                var t = this;
                var input = $(t).find("input")[0];
                var sid = $(t).attr("mcu_attend_sid");
                var name = $(t).attr("mcu_attend_name");
                $(input).focus();
            }).each(function() {
                var sid = $(this).find("input")[0].value;
                var name = $($(this)[0]).text().trim().substr(sid.length).trim();
                var btn_replay = "<a href=\"javascript:replay('" + sid + "','" + name + "', " + mcu_attend_list.length + ");\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"//mt.rmstudio.tw/mcu_attend/images/replay.png\" title=\"重新播放音訊檔案\" alt=\"replay\" /></a>";
                var btn_regen = "<a href=\"javascript:regen('" + sid + "');\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"//mt.rmstudio.tw/mcu_attend/images/regen.png\" title=\"重新產生音訊檔案\" alt=\"regen\" /></a>";
                var btn_change = "<a href=\"javascript:change('" + sid + "','" + name + "');\"><img border=\"0\" width=\"16px\" height=\"16px\" src=\"//mt.rmstudio.tw/mcu_attend/images/change.png\" title=\"修改發音內容\" alt=\"change\" /></a>";
                $(this).append($("<div class=\"function_buttons\">" + btn_change + "&nbsp;" + btn_regen + "&nbsp;" + btn_replay + "</div>"));
                $(this).attr("mcu_attend_index", mcu_attend_list.length);
                $(this).attr("mcu_attend_sid", sid);
                $(this).attr("mcu_attend_name", name);
                mcu_attend_list.push(this);
            });

            $(target_document).find("form td input").focus(function() {
                $(this).parents("td").addClass("focus");
                global_now_index = parseInt($(this).parents("td").attr("mcu_attend_index"), 10);
            }).blur(function() {
                $(this).parents("td").removeClass("focus");
                if (global_now_index == parseInt($(this).parents("td").attr("mcu_attend_index"), 10)) {
                    global_now_index = -1;
                }
            });

            $(target_document).keydown(function(e) {
                var play_me = false, action = 0;
                switch(e.keyCode) {
                    case  9: // tab
                        play_me = true;
                        action = (e.shiftKey ? -1 : 1);
                        break;
                    case 38: // up
                        action = -7;
                        break;
                    case 40: // down
                        action = 7;
                        break;
                    case 66: // B
                    case 72: // H
                        play_me = true;
                    case 37: // left
                        action = -1;
                        break;
                    case 78: // N
                    case 75: // K
                        play_me = true;
                    case 39: // right
                        action = 1;
                        break;
                    case 86: // V
                    case 74: // J
                        play_me = true;
                        break;
                    default: return;
                }

                var now_index = parseInt(get_now_index(), 10);
                if (now_index == -1) {
                    if (action < 0) {
                        now_index = mcu_attend_list.length - 1;
                    } else if (action > 0) {
                        now_index = 0;
                    } else {
                        now_index = -1;
                    }
                } else {
                    if (!mcu_attend_list.length) {
                        now_index = -1;
                    } else {
                        now_index += action;
                    }
                }

                if (now_index >= 0 && now_index < mcu_attend_list.length) {
                    var t = mcu_attend_list[now_index];
                    var input = $(t).find("input")[0];
                    var sid = $(t).attr("mcu_attend_sid");
                    var name = $(t).attr("mcu_attend_name");
                    $(input).focus();

                    if (play_me) {
                        playSound(sid, name);
                    }
                }

                e.preventDefault();
            });

            $(target_document).find("form").prepend("<div id=\"mcu_attend\">外掛已載入：<a href=\"//mt.rmstudio.tw/mcu_attend\" target=\"_blank\" title=\"瀏覽唱名程式專案網頁（另開新視窗）\">唱名程式</a> v" + mcu_attend_version + " Developed by Ming Tsay. 2013-2015</div><a  id=\"mcu_attend_keyboard\" href=\"javascript:toggle_keyboard();\">鍵盤對應功能表（展開/收回）<div id=\"mcu_attend_keyboard_content\" class=\"toggle_hidden\"><ul><li>方向鍵：不播放選擇學生</li><li>Space：選取/取消選取目前學生缺席</li><li>Tab/N/K：播放下一位學生姓名</li><li>Shift+Tab/B/H：播放上一位學生姓名</li><li>V/J：播放目前學生姓名</li></ul></div></a><div id=\"mcu_attend_reverse\">您可以先選取有出席的學生並點選 <a href=\"javascript:reverse();\">反向選取</a> 來選擇缺課的學生。</div>");

            window.alert(
                "唱名程式 v" + mcu_attend_version + "已成功載入！\n\n" +
                "使用方法：\n以滑鼠點擊播放按鈕，或使用鍵盤方向鍵來選擇學生，以空白鍵(Space)選取缺課學生。\n" +
                "　　　　　\n亦可使用下列鍵盤的按鍵操作本系統：Tab, V, B, N, H, J, K\n" +
                "　　　　　\n用滑鼠按下播放按鈕後，游標焦點將會移至核取方塊。\n\n" +
                "障礙排除：\n" +
                "若唸出來的發音錯誤，可點選「修改發音內容」以同音字來發音。\n" +
                "若無法正常唸出姓名，可點選「重新播放音訊檔案」或「重新產生音訊檔案」。\n\n" +
                "本程式以 LGPL v3.0 授權釋出，請依授權指示來使用本程式。\n" +
                "Developed by Ming Tsay. 2013-2015"
            );
        }, target_document);
    }, document);
}
