// 定数
// メッセージ
const MESSAGE001 = "キャンバスをクリアします。\nよろしいですか？";

// id判定用
const BACK1 = "back1";
const BACK2 = "back2";
const BACK3 = "back3";

const BRUSH1 = "brush1";
const BRUSH2 = "brush2";
const BRUSH3 = "brush3";
const BRUSH4 = "brush4";
const BRUSH5 = "brush5";
const ERASER = "eraser";
const BUCKET = "bucket";
const SPUIT  = "spuit";
const LINE   = "line";
const SQUARE = "square";
const CIRCLE = "circle";
const FILL = "fill";
const FRAME = "frame";


$(function() {
	// お絵かきモードフラグ(初期値:false)
	var drawing = false;
	var offset = 5;

	// ブラシ用開始座標
	var start_x = 0;
	var start_y = 0;

	// 図形用開始座標
	var from_x = 0;
	var from_y = 0;
	var to_x = 0;
	var to_y = 0;

	// ツールの初期値を設定
	var selectId = 'brush1';
	var beforeSelectId = 'brush1';
	var onMouseId;
	var brushSize = 1;
	var alphaSize = 1;
	var brushColor = '#000000';
	$('#brush1').css('background-color','#47e4bb');
	$('.shape').css('display','none');

	var canvas = $('canvas').get(0);
	if (canvas.getContext) {
		// canvas要素が利用可能な場合、描画機能を有効にする
		var ctx = canvas.getContext('2d');
	}

	// カラーピッカー設定
	var picker = $.farbtastic('#picker');
	picker.linkTo($("#color"));

	/*
	 * スウォッチをクリックした時の処理
	 */
	$('li').addClass('ofclic');
	$('li').click(function() {
		// クリックされた要素の背景色を取得
		clic_color = new RGBColor($(this).css('background-color'));
		// カラーピッカーと連動
		picker.setColor(clic_color.toHex());
		$('li').removeClass('clic');
		$(this).addClass('clic');
	});

	/*
	 * 背景表示色ラジオボタンを変更した時の処理
	 */
	$('.radio_list').click(function() {
		// 選択されたラジオボタンのidを取得する
		var radioId = $("input[name='back_color']:checked").attr("id");

		// 選択されたラジオボタン別に処理を分岐
		switch(radioId) {
			case BACK1:
				// 背景色を白にする
				$('canvas').css({'background-color':'#ffffff','background-image':'none'});
				$('.sketch_img').css({'background-color':'#ffffff','background-image':'none'});
				break;
			case BACK2:
				// 背景色を黒にする
				$('canvas').css({'background-color':'#000000','background-image':'none'});
				$('.sketch_img').css({'background-color':'#000000','background-image':'none'});
				break;
			case BACK3:
				// 背景色を透明にする
				$('canvas').css('background-image','url(img/clearback.gif)');
				$('.sketch_img').css('background-image','url(img/clearback.gif)');
				break;
			default:
				// 背景色を白にする
				$('canvas').css({'background-color':'#ffffff','background-image':'none'});
				$('.sketch_img').css({'background-color':'#ffffff','background-image':'none'});
				break;
		}
	});

	/*
	 * ブラシサイズ・透明度のテキストボックス入力制御処理呼び出し
	 */
	$('#bw,#alpha').on('keydown',checkValue);
	$('#bw,#alpha').on('blur',zeroSuppress);

	/*
	 * ブラシサイズのスライダーを変更した時の処理
	 */
	$('#slider').slider({
		// ブラシの最小サイズ
		min: 1, 
		// ブラシの最大サイズ
		max: 100,
		// ブラシサイズ初期値
		value : 1,
		slide : function(evt, ui){
			// ブラシサイズを設定
			brushSize = ui.value;
			$("#bw").val(brushSize);
		 }
	 });

	/*
	 * ブラシサイズのテキストボックスを変更した時の処理
	 */
	$('#bw').change(function() {
		var val = $(this).val();

		// ブラシサイズを設定
		$("#slider").slider('value', val );
		brushSize = val;
	 });

	/*
	 * 透明度のスライダーを変更した時の処理
	 */
	$('#slider2').slider({
		// 透明度の最小
		min: 1, 
		// 透明度の最大
		max: 100,
		// 初期値（不透明）
		value : 100,
		slide : function(evt, ui){
			alpha = ui.value;
			$('#alpha').val(alpha);

			//透明度設定処理呼び出し
			alphaSize = setTransparency(alpha);
		}
	 });

	/*
	 * 透明度のテキストボックスを変更した時の処理
	 */
	$('#alpha').change(function() {
		var val = $(this).val();

		// 透明度を設定
		$('#slider2').slider('value', val );
		//透明度設定処理呼び出し
		alphaSize = setTransparency(val);
	 });

	$('#bw').val($('#slider').slider('value'));
	$('#alpha').val($('#slider2').slider('value'));
	$('#slider2').css({'background-image':'url(img/alpha.gif)','background-position':'0px -2px'});

	/*
	 * ツールクリック時の処理
	 */
	$('.tool').click(function() {
		// 選択されたツールのidを取得する
		selectId = $(this).attr("id");

		// ツール背景色を変更
		if(selectId != beforeSelectId){
			$('#'+ selectId).css('background-color','#47e4bb');
			$('#'+ beforeSelectId).css('background-color','#ffffff');
		}

		// 選択ツールにより処理を分岐
		if(selectId == BUCKET || selectId == SPUIT){
			// 塗りつぶし、スポイトの場合は、図形設定、ブラシサイズ、透明度設定を非表示
			$('.shape').css('display','none');
			$('.brushSize,.alphaPer').css('display','none');
		} else if(selectId == SQUARE || selectId == CIRCLE) {
			// 四角、丸の場合は、図形設定を表示、ブラシサイズ設定を非表示
			$('.shape').css('display','');
			$('#fill').prop('checked', true);
			$('.brushSize').css('display','');
			$('.alphaPer').css('display','');
		} else {
			// 上記以外は、図形設定を非表示、ブラシサイズ、透明度設定を表示
			$('.shape').css('display','none');
			$('.brushSize,.alphaPer').css('display','');
		}
		// 前回のツールidを保持
		beforeSelectId = selectId;
	});

	/*
	 * ツールアイコンにマウスが乗ったときの処理
	 */
	$('.tool').hover(
		function() {
			// 選択されたツールのidを取得する
			onMouseId = $(this).attr("id");
			
			if(onMouseId != beforeSelectId){
				// ツール背景色を変更
				$('#'+ onMouseId).css('background-color','#ff8a5c');
			}
		},
		function() {
			if(onMouseId != beforeSelectId){
				// ツール背景色を変更
				$('#'+ onMouseId).css('background-color','#ffffff');
			}
		}
	);

	/*
	 * キャンバス上でクリックしたときの処理
	 */
	$('canvas').click(function(e) {

		// 選択ツールにより処理を分岐
		switch(selectId){ 
			// 塗りつぶし
			case BUCKET:
				// 選択色を取得
				brushColor = picker.color;
				ctx.fillStyle = brushColor;
				ctx.globalAlpha = alphaSize;
				ctx.globalCompositeOperation = 'source-over';
				// キャンバスを塗りつぶし
				ctx.fillRect(0,0,canvas.width,canvas.height);
				break;

			// スポイト
			case SPUIT:
				// クリック箇所の色を取得する
				spuitImage = ctx.getImageData(start_x, start_y, 1, 1);
				r = spuitImage.data[0];
				g = spuitImage.data[1];
				b = spuitImage.data[2];
				spuit_color = new RGBColor('rgb(' + r +','+ g + ',' + b +')');
				// 取得した色をカラーピッカーに連携
				picker.setColor(spuit_color.toHex());
				break;

			default:
				break;
		}
	});

	/*
	 * キャンバス上にマウスダウンしたときの処理
	 */
	$('canvas').mousedown(function(e) {

		// 現在のキャンバス状態を保存
		undoImage = ctx.getImageData(0, 0, canvas.width,canvas.height);
		// 開始座標を取得
		start_x = e.pageX - $(this).offset().left - offset;
		start_y = e.pageY - $(this).offset().top - offset;
		from_x = start_x;
		from_y = start_y;

		var text = $('#text').val();
		if(text == "") {
			// テキストボックスに入力値がなければお絵かきモードON
			drawing = true;
		} else {
			// テキストボックスに入力値があればテキストをキャンバスに反映
			var fontFamily = $('#fontFamily').val();
			var fontSize = $('#fontSize').val();
			var fontSetting = "";

			if($('#fontItalic').prop('checked')){
				fontSetting += ' italic ';
			}
			if($('#fontBold').prop('checked')){
				fontSetting += ' bold ';
			} 

			fontSetting += fontSize + ' ' +  fontFamily ;
			ctx.globalAlpha = alphaSize;
			ctx.fillStyle = picker.color;
			ctx.font =  fontSetting;
			ctx.fillText(text, start_x -10, start_y);
		}
		return false;
	});

	/*
	 * キャンバス上でマウスを動かしたときの処理
	 */
	$('canvas').mousemove(function(e) {
		if (!drawing) {
			return;
		}

		// 終了座標を取得
		var end_x = e.pageX - $('canvas').offset().left - offset;
		var end_y = e.pageY - $('canvas').offset().top - offset;

		// 選択色を取得
		brushColor = picker.color;

		// 選択ツールにより処理を分岐
		switch(selectId) {
			// ブラシ1(通常)
			case BRUSH1:
				ctx.globalAlpha = alphaSize;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'source-over';
				ctx.strokeStyle = brushColor;
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'round';
				ctx.lineCap = 'round';
				ctx.shadowBlur = 0;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			// ブラシ2(ぼかし1)
			case BRUSH2:
				ctx.globalAlpha = alphaSize;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'source-over';
				ctx.strokeStyle = brushColor;
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'round';
				ctx.lineCap = 'round';
				ctx.shadowBlur = brushSize;
				ctx.shadowColor = brushColor;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			// ブラシ3(ぼかし2)
			case BRUSH3:
				brushSizex2 = brushSize + brushSize;
				ctx.globalAlpha = alphaSize;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'source-over';
				ctx.strokeStyle = brushColor;
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'round';
				ctx.lineCap = 'round';
				ctx.shadowBlur = brushSizex2;
				ctx.shadowColor = brushColor;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			// ブラシ4(パステル)
			case BRUSH4:
				ctx.globalAlpha = 0.1;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'source-over';
				ctx.strokeStyle = '#ffffff';
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'miter';
				ctx.lineCap = 'butt';
				ctx.shadowBlur = brushSize;
				ctx.shadowColor = brushColor;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			// ブラシ5(四角)
			case BRUSH5:
				ctx.globalAlpha = alphaSize;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'source-over';
				ctx.strokeStyle = brushColor;
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'miter';
				ctx.lineCap = 'butt';
				ctx.shadowBlur = 0;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			// 消しゴム
			case ERASER:
				ctx.globalAlpha = 1;
				ctx.beginPath();
				ctx.globalCompositeOperation = 'destination-out';
				ctx.strokeStyle = '#000000';
				ctx.lineWidth = brushSize;
				ctx.lineJoin= 'round';
				ctx.lineCap = 'round';
				ctx.shadowBlur = 0;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.moveTo(start_x, start_y);
				ctx.lineTo(end_x, end_y);
				ctx.stroke();
				ctx.closePath();
				break;

			default:
				break;
		}

		start_x = end_x;
		start_y = end_y;
	});


	/*
	 * キャンバス上でマウスアップしたときの処理
	 */
	$('canvas').on('mouseup', function(e) {
		if (!drawing) {
			return;
		}

		//終了座標を取得
		to_x = start_x;
		to_y = start_y;
		// 開始・終了座標の差
		var width = to_x - from_x;
		var height = to_y - from_y;

		// 選択色を取得
		brushColor = picker.color;
		ctx.globalCompositeOperation = 'source-over';

		switch(selectId){
			// 線
			case LINE:
				ctx.globalAlpha = alphaSize;
				ctx.beginPath();
				ctx.strokeStyle = brushColor;
				ctx.lineWidth = brushSize;
				ctx.shadowBlur = 0;
				ctx.moveTo(from_x, from_y);
				ctx.lineTo(to_x, to_y);
				ctx.stroke();
				break;	
			// 四角
			case SQUARE:
				// 選択されたラジオボタンのidを取得する
				var radioId = $("input[name='shape']:checked").attr("id");

				ctx.globalAlpha = alphaSize;
				ctx.lineWidth = brushSize;
				ctx.shadowBlur = 0;
				ctx.beginPath();
				ctx.setTransform(1, 0, 0, 1, 0, 0);

				// ラジオボタンの選択肢で処理を分岐
				if(radioId == FRAME) {
					// 白抜きの場合
					ctx.strokeStyle = brushColor;
					ctx.strokeRect(from_x, from_y, width, height);
				} else {
					// 塗りつぶしの場合
					ctx.fillStyle = brushColor;
					ctx.fillRect(from_x, from_y, width, height);
				}
				ctx.closePath();
				break;
			// 丸
			case CIRCLE:
				// 選択されたラジオボタンのidを取得する
				var radioId = $("input[name='shape']:checked").attr("id");

				if(width > height){
					arc_size = width;
				}else{
					arc_size = height;
				}
				ctx.globalAlpha = alphaSize;
				ctx.lineWidth = brushSize;
				ctx.shadowBlur = 0;
				ctx.beginPath();
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.arc(from_x, from_y,  arc_size, 0, Math.PI*2, true);
				// ラジオボタンの選択肢で処理を分岐
				if(radioId == FRAME) {
					// 白抜きの場合
					ctx.strokeStyle = brushColor;
					ctx.stroke();
				} else {
					// 塗りつぶしの場合
					ctx.fillStyle = brushColor;
					ctx.fill();
				}
				break;	
			default:
				break;

		}

		// お絵かきモードOFF
		drawing = false;

	});

	/*
	 * キャンバス上からマウスが離れたときの処理
	 */
	$('canvas').on('mouseleave', function() {
		getImage = ctx.getImageData(0, 0, canvas.width,canvas.height);
		drawing = false;
	});

	/*
	 * １つ戻るボタン押下時処理
	 */
	$('#undo').click(function(e) {
		ctx.putImageData(undoImage,0,0);
	});

	/*
	 * １つ進むボタン押下時処理
	 */
	$('#redo').click(function(e) {
		ctx.putImageData(getImage,0,0);
	});

	/*
	 * クリアボタン押下時処理
	 */
	$('#clear').click(function(e) {
		if( confirm( MESSAGE001 )) {
			e.preventDefault();
			// 画面を透明にクリア
			ctx.clearRect(0, 0, canvas.width,canvas.height);
		} else {
		 return;
		}
	});

	/*
	 * downloadボタン押下時処理
	 */
	$('#downloadFile').click(function() {

		var dlLink = $('#downloadLink').get(0);
		// ファイル名を作成
		var filename = 'sketchbook_' + getCurrentDate() + '.png';

		if (canvas.msToBlob) {
			// IEの場合
			var blob = canvas.msToBlob();
			window.navigator.msSaveBlob(blob, filename);
		} else {
			// IE以外の場合
			dlLink.href = canvas.toDataURL('image/png');
			dlLink.download = filename;
			dlLink.click();
		}
	});

	/*
	 * uploadボタン押下時処理
	 */
	 $('#uploadFile').css({
		'position': 'absolute',
		'top': '-9999px'
	}).change(function(e) {
		var val = $(this).val();
		var path = val.replace(/\\/g, '/');
		var match = path.lastIndexOf('/');

		$('#fileName').css("display","inline-block");
		$('#fileName').val(match !== -1 ? val.substring(match + 1) : val);

		// ファイルオブジェクトを取得
		var fileData = e.target.files[0];

		if(fileData !== undefined) {
			// ファイルが選択されている場合
			var reader = new FileReader();
			reader.onload = function() {
				// キャンバスをクリア
				ctx.clearRect(0,0,canvas.width,canvas.height);
				var img = new Image();
				img.src = reader.result;
				img.onload = function() {
					// キャンバスの大きさに合わせて画像を貼りつけ
					ctx.drawImage(img,0,0,canvas.width,canvas.height)
				}
			};
			reader.readAsDataURL(fileData);
		} else {
			return;
		}
	});

	$('#uploadFile').click(function() {
		// アップロード機能に対応しているか確認
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			$('#uploadFile').value="";
		} else {
			//対応していない場合は、アラートを表示
  			alert("お使いのブラウザはファイルアップロード機能に対応しておりません。");
		}
	});

	$('#fileName').bind('keyup, keydown, keypress', function() {
		return false;
	});

	$('#upload_btn').click(function() {
		$('#uploadFile').trigger('click');
	});

});

/*
 * ブラシサイズ・透明度テキストボックス入力制御
 */
function checkValue(event){

	// クリックされたキーコードを取得
	var keyCode = event.keyCode;
	var ctrlClick = event.ctrlKey;
	var altClick = event.altKey;
	var shiftClick = event.shiftKey;

	// 
	if(!ctrlClick && !altClick && !shiftClick){
		if((48 <= keyCode && keyCode <= 57)       // 48～57：0～9のキー
		 ||(96 <= keyCode && keyCode <= 105)  // 96～105：テンキーの0～9
		 ||keyCode == 8                      // 8:バックスペース
		 ||keyCode ==46                      // 46：Deleteキー
		){
			return true;
		}
	}

	if(keyCode == 9                          // 9：タブキー
	 ||keyCode == 35                         // 35：Endキー
	 ||keyCode == 36                         // 36：Homeキー
	 ||keyCode == 37                         // 37：左矢印キー
	 ||keyCode == 39                         // 39：右矢印キー
	){
		return true;
	}

	return false;
}

/*
 * ブラシサイズ・透明度テキストボックス
 * 先頭が0の時は0を削除
 */
function zeroSuppress(){
	var value1 = $('#bw').val();
	var value2 = $('#alpha').val();
	value1 = value1.replace(/^\s*0*(\d+)\s*$/,'$1');
	value2 = value2.replace(/^\s*0*(\d+)\s*$/,'$1');
	$('#bw').val(value1);
	$('#alpha').val(value2);
}

/*
 * 透明度設定処理
 */
function setTransparency(e){

	var alpha = e;
	var alphaSize = 1;

	//透明度の設定値によって処理分岐
	if(alpha == 100){
		// 透明度100の場合
		alphaSize = 1;
	}else if(alpha <= 9){
		// 透明度9以下の場合
		alphaSize = '0.0' + alpha;
	}else if(alpha >= 10){
		// 透明度10～99の場合
		alphaSize = '0.' + alpha;
	}
	return alphaSize;
}

/*
 * 現在日時取得処理(YYYYMMDDHH24MISS形式)
 */
function getCurrentDate() {
	var date = new Date();

	var year  = date.getFullYear();
	var month = ( '0' + (date.getMonth()+1)).slice(-2);
	var day   = ( '0' +  date.getDate()).slice(-2);
	var hour  = ( '0' +  date.getHours()).slice(-2);
	var min   = ( '0' +  date.getMinutes()).slice(-2);
	var sec   = ( '0' +  date.getSeconds()).slice(-2);

	var nowDate = year + month + day + hour + min + sec;
	return nowDate;
}

