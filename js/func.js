(function (powerspot, google, $, document) {
    "use strict";

    var gXml;
    var gLatLng;
    var gSpotName;

    // カテゴリ定義
    var categoryArray = {
        "0": "恋愛・結婚",
        "1": "子宝・安産",
        "2": "夫婦円満",
        "3": "縁結び",
        "4": "観光・自然・デート",
        "5": "諸願成就・その他",
        //"6":"カテゴリなし",
        "77": "Lucky7",
        "88": "検索(keyword)",
        "99": "検索(全表示)"
    };

    // カテゴリ別スポット件数カウント
    function countSpot(showCategory) {
        var cnt = 0;

        // Lucky7
        if (showCategory === "77") {
            return 7;
        }

        $(gXml).find("spot").each(function () {
            var spotCategory1 = $("category1", this).text();
            var spotCategory2 = $("category2", this).text();
            var spotCategory3 = $("category3", this).text();
            if (showCategory === spotCategory1
                || showCategory === spotCategory2
                || showCategory === spotCategory3
                || showCategory === "99") {
                cnt++;
            }
        });
        return cnt;
    }

    // カテゴリ選択ボタン作成
    function createCategory() {
        var btn = '<ul data-role="listview">';
        for (var key in categoryArray) {
            if (categoryArray.hasOwnProperty(key)) {
                if (key === "88") {
                    // キーワード検索
                    btn = btn + '<li><a href="#searchPage" data-transition="pop">検索(keyword)<span class="ui-li-count">?</span></a></li>';
                } else if (key === "77") {
                    // ラッキー7
                    btn = btn + '<li><a href="#listPage" data-transition="slide" onClick="powerspot.showListByLucky()">' + categoryArray[key] + '<span class="ui-li-count">' + countSpot(key) + '</span></a></li>';
                } else {
                    btn = btn + '<li><a href="#listPage" data-transition="slide" onClick="powerspot.showList(' + key + ')">' + categoryArray[key] + '<span class="ui-li-count">' + countSpot(key) + '</span></a></li>';
                }
            }
        }
        btn = btn + '</ul>';
        $('#category').append(btn).trigger('create').listview('refresh');
    }

    //XML取得
    $.ajax({
        url: 'powerspot.xml',
        type: 'GET',
        dataType: 'xml',
        timeout: 2000
    })
        .done(function (xml) {
            gXml = xml;
            createCategory();
        })
        .fail(function () {
            alert("情報の読み込みに失敗しました");
        });

    // Googlemapでの経路検索
    function showRoute() {
        navigator.geolocation.getCurrentPosition(isSuccess, isError);
    }

    function isSuccess(position) {
        var startPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        // 現在地から指定地までの経路検索用リンクの生成
        var route = "http://maps.google.com/maps?saddr=" + startPos + "&daddr=" + gLatLng + "";
        $("#map_route").attr("href", route);
    }

    function isError() {
        $("#map_route").empty();
    }

    // 一覧表示
    powerspot.showList = function (showCategory) {
        var cnt = 0;
        // title書き換え
        $('#listTitle').text(categoryArray[showCategory]);

        // リスト作成
        var loc = '';
        $(gXml).find("spot").each(function () {
            var spotNo = $("no", this).text();
            var spotName = $("name", this).text();
            var spotAdress = $("adress", this).text();
            var spotCategory1 = Number($("category1", this).text());
            var spotCategory2 = Number($("category2", this).text());
            var spotCategory3 = Number($("category3", this).text());

            // カテゴリ99:検索はすべての一覧
            if ( showCategory === spotCategory1
                || showCategory === spotCategory2
                || showCategory === spotCategory3
                || showCategory === 99
                || showCategory === 77) {
                if (!(cnt >= 7 && showCategory === 77)) {
                    loc = loc + '<li><a href="#detailPage" data-transition="slide" onClick="powerspot.showDetail(' + spotNo + ')"><h3>' + spotName + '</h3><p>' + spotAdress + '</p></a></li>';
                    cnt++;
                }
            }
        });
        var $pslist = $('#pslist');
        $pslist.empty();
        $pslist.append(loc).trigger('create').listview('refresh');
    };

    powerspot.showListByKeyword = function (keyword) {
        var cnt = 0;
        // title書き換え
        $('#listTitle').text(keyword);

        // リスト作成
        var loc = '';
        $(gXml).find("spot").each(function () {
            var spotNo = $("no", this).text();
            var spotName = $("name", this).text();
            var spotAdress = $("adress", this).text();

            // キーワードが含まれるか確認
            if (spotName.indexOf(keyword) !== -1 || spotAdress.indexOf(keyword) !== -1) {
                loc = loc + '<li><a href="#detailPage" data-transition="slide" onClick="powerspot.showDetail(' + spotNo + ')"><h3>' + spotName + '</h3><p>' + spotAdress + '</p></a></li>';
                cnt++;
            }
        });
        var $pslist = $('#pslist');
        $pslist.empty();
        $pslist.append(loc).trigger('create').listview('refresh');
    };

    powerspot.showListByLucky = function () {
        // title書き換え
        $('#listTitle').text("Lucky7");

        // XML読み込み
        var spotArray = [];
        $(gXml).find("spot").each(function () {
            var spotNo = $("no", this).text();
            var spotName = $("name", this).text();
            var spotAdress = $("adress", this).text();
            spotArray[spotArray.length] = {no: spotNo, name: spotName, adress: spotAdress};
        });

        // ランダムに7つ取り出し
        var selectedArray = [];
        if (spotArray.length <= 7) {
            // 7つ以下ならあるだけ
            for (var i = 0; i < spotArray.length; i++) {
                selectedArray[selectedArray.length] = i + 1;
            }
        } else {
            // 7つ以上あるときはランダム選択
            while (selectedArray.length < 7) {
                // 1?spotArrayに読み込んだ件数までの乱数生成
                var random = Math.floor(Math.random() * spotArray.length + 1);
                // 既に取り出し済みか確認
                if ($.inArray(random, selectedArray) === -1) {
                    // 取り出し済みArrayになければ取り込む
                    selectedArray[selectedArray.length] = random;
                }
            }
        }

        // リスト作成
        var loc = '';
        for (var i = 0; i < selectedArray.length; i++) {
            loc = loc + '<li><a href="#detailPage" data-transition="slide" onClick="powerspot.showDetail(' + spotArray[selectedArray[i] - 1]['no'] + ')"><h3>' + spotArray[selectedArray[i] - 1]['name'] + '</h3><p>' + spotArray[selectedArray[i] - 1]['adress'] + '</p></a></li>';
        }

        var $pslist = $('#pslist');
        $pslist.empty();
        $pslist.append(loc).trigger('create').listview('refresh');
    };

    powerspot.showDetail = function (showNo) {
        //$('#map').style.display="block";

        $(gXml).find("spot").each(function () {
            var spotNo = Number($("no", this).text());
            if (spotNo === showNo) {
                var spotName = $("name", this).text();
                var spotAdress = $("adress", this).text();
                var spotLat = $("lat", this).text();
                var spotLng = $("lng", this).text();
                var spotComment = $("comment", this).text();

                // title書き換え
                $('#detailTitle').text(spotName);
                gSpotName = spotName;

                // 情報表示
                var dom = '';
                dom = dom + '<h3>' + spotName + '<a href="http://www.google.co.jp/search?q=' + spotName + '" rel="external" target="_blank"><img src="../img/megane.png" style="width:24px;height:24px;"></a></h3>';
                dom = dom + '<p>' + spotComment + '</p>';
                dom = dom + '<p>' + spotAdress + '</p>';
                $('#detail').empty().append(dom).trigger('create');


                // map表示用の緯度経度をグローバル変数にセット
                gLatLng = new google.maps.LatLng(spotLat, spotLng);

                // ルート検索リンクの生成
                showRoute();
            }
        });

        // alert('showDetail_end');
    };

    // 地図表示用関数
    // 引数：緯度経度
    powerspot.showMap = function () {
        // 地図を表示したい場所のHTMLノードの指定
        var mapDiv = document.getElementById("map");
        // Mapクラスを初期化するためのオプションの設定
        var mapOps = {
            zoom: 15,
            center: gLatLng,
            draggable: true,
            disableDefaultUI: true,
            zoomControl: false,
            navigationControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        // Mapクラスのインスタンス生成
        var mapCanvas = new google.maps.Map(mapDiv, mapOps);
        // Markerクラスを初期化するためのオプションの設定
        var markerOps = {
            position: gLatLng,
            map: mapCanvas
        };

        // Markerクラスのインスタンス生成
        var marker = new google.maps.Marker(markerOps);
        // Markerの地図表示
        marker.setMap(mapCanvas);
    };

    // 地域プルダウンの選択によるリスト絞り込み
    powerspot.refineByArea = function () {
        var $list = $('#pslist').find('li > a');

        // pタグの親aタグを全非表示
        $list.hide();

        if ($('#area').find('option:selected').val() === "0") {
            // 市町プルダウンが未選択値の場合
            // liタグ->aタグを全表示
            $list.show();
        } else {
            // liタグ->aタグ->pタグの階層に合致するタグの全検索
            $('#city').find('option').each(function () {
                var city = $(this).text();
                $list.find('p').each(function () {
                    if (($(this).text()).match(new RegExp(city))) {
                        // 市町プルダウン文字列を含むリストの場合
                        // pタグの親aタグを表示
                        $(this).parent('a').show();
                    }
                });
            });
        }
    };

    // 市町プルダウンの選択によるリスト絞り込み
    powerspot.refineByCity = function () {
        var $list = $('#pslist').find('li > a'),
            $selectedCity = $('#city').find('option:selected');

        // pタグの親aタグを全非表示
        $list.hide();

        if ($selectedCity.val() === "0") {
            // 市町プルダウンが未選択値の場合
            // liタグ->aタグを全表示
            $list.show();
        } else {
            // liタグ->aタグ->pタグの階層に合致するタグの全検索
            $list.find('p').each(function () {
                if (($(this).text()).match(new RegExp($selectedCity.text()))) {
                    // 市町プルダウン文字列を含むリストの場合
                    // pタグの親aタグを表示
                    $(this).parent('a').show();
                }
            });
        }
    };
}(window.powerspot = window.powerspot || {}, window.google, window.jQuery, document));
