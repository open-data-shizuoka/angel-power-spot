(function (powerspot, $, document) {
    "use strict";

    // Event処理 詳細画面
    $(document).on({
        "pageshow": function () {
            // alert('pageshow');
            // MAP生成
            powerspot.showMap();
        },
    }, "#detailPage");

    // Event処理 検索画面
	$(document).on({
		"click": function () {
			$('#keyword').val(""); // キャンセルボタンクリック時はキーワードを空に設定
		}
	}, "#keyword-cancel");
    $(document).on({
        "pagebeforeshow": function () {
            $('#keyword').val(""); // ページ表示毎にキーワードを空に設定
        },
        "pagehide": function () {
            // キーワードが入力されていればキーワード検索してリストページ表示
            var keyword = $('#keyword').val();
            if (keyword !== "") {
                powerspot.showListByKeyword(keyword);
                $('body').pagecontainer("change", "#listPage", { transition: 'slide' });
            }
        }
    }, "#searchPage");

    // 岩田：以下は、地域プルダウンの生成のために必要です。当ファイルは呼び出しだけで、中身はfunc.jsに書く方がいいでしょうか。
    // ページ読み込み時処理
    $(document).on('pageshow', '#listPage', function () {
        var $area = $('#area'),
            $city = $('#city');

        // 地域プルダウンの選択値のクリア
        $area.empty();
        $area.selectmenu();
        $area.selectmenu('refresh', true);
        $area.parent().find('.ui-btn-text').html('');
        // 市町プルダウンの選択値のクリア
        $city.empty();
        $city.selectmenu();
        $city.selectmenu('refresh', true);
        $city.parent().find('.ui-btn-text').html('');
        // 初期時は市町プルダウンは非表示
        $city.parent().hide();

        // 地域プルダウン用XML取得
        $.ajax({
            url: 'city.xml',
            type: 'GET',
            dataType: 'xml',
            timeout: 1000
        })
            .done(function (xml) {
                // 地域プルダウンの未選択用項目の追加
                $area.append($('<option>').attr({value: 0}).text("--地域を選択してください--"));
                // 地域データをループ
                $(xml).find("area").each(function () {
                    // 地域キーの取得
                    var areaKey = $(this).find("area_key").text();
                    // 地域名の取得
                    var areaName = $(this).find("area_name").text();
                    // 地域プルダウンの追加
                    $area.append($('<option>').attr({value: areaKey}).text(areaName));
                });
            })
            .fail(function () {
                alert("情報の読み込みに失敗しました");
            });
    });

    $(document).ready(function () {
        var $area = $('#area'),
            $city = $('#city');

        // 地域プルダウンの変更時処理
        $area.change(function () {
            // 市町プルダウンの選択値のクリア
            $city.empty();
            $city.selectmenu('refresh', true);
            $city.parent().find('.ui-btn-text').html('');
            // XML取得→市町プルダウンの再生成
            $.ajax({
                url: 'city.xml',
                type: 'GET',
                dataType: 'xml',
                timeout: 1000
            })
                .done(function (xml) {
                    // 地域選択値の取得
                    var selectArea = $area.val();
                    // 地域データをループ
                    $(xml).find("area").each(function () {
                        // 地域キーの取得
                        var areaKey = $(this).find("area_key").text();
                        // 地域選択値配下にある市町データに対する処理
                        if (areaKey === selectArea) {
                            // 市町プルダウンの未選択用項目の追加
                            $city.append($('<option>').attr({value: 0}).text("--市町を選択してください--"));
                            // 該当地域ごとの市町データをループして取得
                            $(this).find("city").each(function () {
                                // 市町キーの取得
                                var cityKey = $(this).find("city_key").text();
                                // 市町名の取得
                                var cityName = $(this).find("city_name").text();
                                // 市町プルダウンの追加
                                $city.append($('<option>').attr({value: cityKey}).text(cityName));
                            });
                        }
                    });
                    // 地域プルダウンの選択によるリスト絞り込み
                    powerspot.refineByArea();
                    // 地域プルダウンが選択されている場合は市町プルダウンを表示
                    $city.parent().show();
                })
                .fail(function () {
                    alert("情報の読み込みに失敗しました");
                });
        });

        // 地域プルダウンの変更時処理
        $city.change(function () {
            // 市町プルダウンの選択によるリスト絞り込み
            powerspot.refineByCity();
        });
    });
}(window.powerspot = window.powerspot || {}, window.jQuery, document));
