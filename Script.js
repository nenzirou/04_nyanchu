enchant();
enchant.Sound.enabledInMobileSafari = true;

window.onload = function () {
	var core = new Core(400, 500);
	core.fps = 30;
	var url = "http://nenzirou.html.xdomain.jp/Nenchu/index.html";
	url = encodeURI(url);
	var cnt = 0;
	var excnt = 0;
	var swcFlag = false;
	var vcnt = 0;
	//プリロード
	var ASSETS = {
		"se_start": 'sound/start.wav',
		"se_swc": 'sound/switch.mp3',
		"se_explo1": 'sound/explo1.mp3',
		"se_explo2": 'sound/explo2.mp3',
		"se_explo3": 'sound/explo3.mp3',
		"se_cheer": 'sound/cheer.mp3',
		"se_dash": 'sound/dash.mp3',
		"se_supon": 'sound/supon.mp3',
		"se_trumpet": 'sound/trumpet.mp3',
		"v0_1": 'sound/v0_1.mp3',
		"v1_1": 'sound/v1_1.mp3',
		"v2_1": 'sound/v2_1.mp3',
		"v3_1": 'sound/v3_1.mp3',
		"v4_1": 'sound/v4_1.mp3',
		"v5_1": 'sound/v5_1.mp3',
		"v6_1": 'sound/v6_1.mp3',
		"v7_1": 'sound/v7_1.mp3',
		"v8_1": 'sound/v8_1.mp3',
		"v9_1": 'sound/v9_1.mp3',
		"v10_1": 'sound/v10_1.mp3',
		"v11_1": 'sound/v11_1.mp3',
		"v12_1": 'sound/v12_1.mp3',
		"v13_1": 'sound/v13_1.mp3',
		"v14_1": 'sound/v14_1.mp3',
		"v15_1": 'sound/v15_1.mp3',
		"vend": 'sound/v_end.mp3',
		"vend2": 'sound/v_end2.mp3',
		"img_nenchu": 'img/nenchu.png',
		"img_button": 'img/button.png',
		"img_swc": 'img/switch.png',
		"img_explosion": 'img/explosion.png',
		"img_grave": 'img/grave.png',
		"img_background": 'img/background.png',
		"bgm": 'sound/bgm.mp3',
	};
	core.preload(ASSETS);
	////////////////////////////////////////////////クラス・関数////////////////////////////////////////////////////
	//オブジェクトが従うクラス
	var Obj = Class.create(Sprite, {
		initialize: function (width, height, x, y, scene, img) {
			Sprite.call(this, width, height);
			this.x = x;
			this.y = y;
			if (img != null) this.image = core.assets[img];
			this.hp = 1;
			scene.addChild(this);
		},
		move: function (dx, dy) {
			this.x += dx;
			this.y += dy;
		},
	});

	//ボタン
	var Button = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 120, 60, x, y, scene, "img_button");
		}
	});

	// 爆発エフェクト
	var explosion = Class.create(Obj, {
		initialize: function (x, y, scene) {
			Obj.call(this, 128, 128, x, y, scene, "img_explosion");
			this.scale(4, 4);
			this.frame = 8;
			this.addEventListener("enterframe", function () {
				if (this.age % 2 == 1) this.frame++;
				if (this.frame >= 24) scene.removeChild(this);
			});
		}
	});

	//テキスト
	var Text = Class.create(Label, {
		initialize: function (x, y, font, color, scene) {
			Label.call(this);
			this.font = font + "px Meiryo";
			this.color = color;
			this.width = 400;
			this.moveTo(x, y);
			scene.addChild(this);
		}
	})

	//BGM
	var Bgm = enchant.Class.create({
		initialize: function () {
			this.data = null;
			this.isPlay = false;//プレイの状態フラグ
			this.isPuase = false;
		},
		//BGM用音楽ファイルのセット
		set: function (data) {
			this.data = data;
		},
		//再生(再生のみに使う)
		play: function () {
			this.data.play();
			this.isPlay = true;
			if (this.data.src != undefined) {//srcプロパティを持っている場合
				this.data.src.loop = true;
			}
		},
		//ループ再生(必ずループ内に記述すること) PCでのループ再生で使う
		loop: function () {
			if (this.isPlay == true && this.data.src == undefined) {//再生中でsrcプロパティを持っていない場合
				this.data.play();
				this.isPuase = false;//ポーズ画面から戻った場合は自動的に再生を再開させるため
			} else if (this.isPuase) {//srcあり場合でポーズ画面から戻ったとき用
				this.data.play();
				this.data.src.loop = true;//ポーズするとfalseになるっぽい(確認はしていない)
				this.isPuase = false;
			}
		},
		//再生停止(曲を入れ替える前は,必ずstop()させる)
		stop: function () {
			if (this.data != null) {
				if (this.isPuase) {
					this.isPlay = false;
					this.isPuase = false;
					this.data.currentTime = 0;
				} else if (this.isPlay) {
					this.data.stop();
					this.isPlay = false;
				}
			}
		},
		//一時停止（ポーズ画面などの一時的な画面の切り替え時に音を止めたいときのみ使う）
		pause: function () {
			if (this.data != null) {
				this.data.pause();
				this.isPuase = true;
			}
		}
	});

	core.onload = function () {
		state = 99;
		var grave;
		// エンディング画面
		S_END = new Scene();
		// エンディングボタン
		var S_Return = new Button(270, 430, S_END);
		S_Return.frame = 1;
		S_Return.ontouchend = function () {
			core.popScene();
			core.pushScene(S_Start);
		};

		//スタート画面
		S_Start = new Scene();
		core.pushScene(S_Start);
		S_Start.backgroundColor = "#FFFACD";
		var T_Text = new Text(10, 50, 25, "#303030", S_Start);
		T_Text.text = "にゃ〇ちゅうが自爆するスイッチ";

		//startボタン
		var B_Go = new Button(50, 400, S_Start);
		B_Go.frame = 0;
		B_Go.ontouchend = function () {
			state = 0;
			core.popScene();
			core.pushScene(S_MAIN);
			core.assets['se_start'].clone().play();
		};

		//ツイートボタン
		var S_Tweet = new Button(230, 400, S_Start);
		S_Tweet.frame = 2;
		S_Tweet.ontouchend = function () {
			if (cnt == 0) window.open("http://twitter.com/intent/tweet?text=【にゃ〇ちゅうが自爆するスイッチ】皆も自爆スイッチを携えたにゃ〇ちゅうと一緒におしゃべりしよう！" + url);
			else window.open("http://twitter.com/intent/tweet?text=【にゃ〇ちゅうが自爆するスイッチ】" + Math.floor(cnt / 30 - 10) + "秒でにゃ〇ちゅうは自爆した!" + url);
		};

		//シーン設定
		var S_MAIN = new Scene();
		S_MAIN.backgroundColor = "#000020";

		//テキスト
		var C_Text = new Text(0, 0, 15, "#cccccc", S_MAIN);
		//BGM
		var stageBGM = new Bgm();
		stageBGM.set(core.assets["bgm"]);
		//Voice
		var vo = new Bgm();
		var voNo =
			["v0_1", "v1_1", "v2_1", "v3_1", "v4_1", "v5_1", "v6_1", "v7_1", "v8_1", "v9_1", "v10_1", "v11_1", "v12_1", "v13_1", "v14_1", "v15_1", "vend", "vend2"];

		// 背景
		var background = new Obj(400, 500, 0, 0, S_MAIN, "img_background");

		// にゃんちゅう
		var nenchu = new Obj(960, 853, -300, -300, S_MAIN, "img_nenchu");
		nenchu.scale(0.5, 0.5);

		// 自爆スイッチ
		var swc = new Obj(400, 400, -150, 250, S_MAIN, "img_swc");
		swc.scale(0.2, 0.2);
		swc.ontouchend = function () {
			swc.frame = 1;
			if (!swcFlag) core.assets['se_swc'].clone().play();
			swcFlag = true;
		};

		//////////////////////////////////////////////メインループ/////////////////////////////////////////////////////////////
		core.onenterframe = function () {
			stageBGM.loop();
			if (state == 0) {//初期化処理
				state = 1;
				excnt = 0;
				cnt = 0;
				nenchu.opacity = 1;
				swc.frame = 0;
				swcFlag = false;
				stageBGM.play();
				vcnt = 0;
				vo.set(core.assets[voNo[0]]);
			}

			if (state == 1) {
				if (cnt == 0) vo.play();
				if (vo.data.currentTime == vo.data.duration && !swcFlag) {
					vo.stop();
					vcnt++;
					if (vcnt >= 16) swcFlag = true;
					else {
						vo.set(core.assets[voNo[vcnt]]);
						vo.play();
					}
				}
				console.log("currentTime:", vo.data.duration);
				console.log("preVoTime:", vo.data.currentTime);
				//スイッチが押されたときの処理
				if (swcFlag) {
					excnt++;
					vo.stop();
					stageBGM.stop();
					if (excnt < 90) {
						new explosion(Math.random() * 272 + 32, Math.random() * 372 + 32, S_MAIN);
						var p = Math.random() * 3;
						if (p <= 1) core.assets['se_explo1'].clone().play();
						if (p <= 2) core.assets['se_explo2'].clone().play();
						if (p <= 3) core.assets['se_explo3'].clone().play();
						if (excnt == 89) nenchu.opacity = 0;
					}
					if (excnt >= 130) {
						state = 2;
						excnt = 0;
					}
				}
			} else if (state == 2) {
				if (excnt == 0) {
					// お墓
					grave = new Obj(299, 454, 50, -300, S_MAIN, "img_grave");
					grave.scale(0.1, 0.1);
					grave.addEventListener("enterframe", function () {
						if (this.age <= 40) {
							if (this.age == 1) core.assets['se_dash'].clone().play();
							this.rotation += 59;
							this.y += 11;
							if (this.age % 3 == 1) this.scale(1.09, 1.09);
							if (this.age == 40) core.assets['se_supon'].clone().play();
						}
						if (this.age == 80) {
							core.assets['se_trumpet'].clone().play();
							core.assets['se_cheer'].clone().play();
							if (vcnt == 16) core.assets['vend2'].clone().play();
							else core.assets['vend'].clone().play();
						}
					});
				}
				excnt++;
				if (excnt >= 80) nenchu.opacity = 0.3;
				if (excnt >= 190) {
					state = 99;
					grave.parentNode.removeChild(grave);
					core.popScene();
					core.pushScene(S_Start);
				}
			}
			// 全体処理
			if (state != 99) {
				cnt++;
				if (false) {
					stageBGM.stop();
					state = 99;
					core.popScene();
					core.pushScene(S_Start);
				}
			}
		};
		//////////////////////////////////////////////メインループ終了////////////////////////////////////////////////////////////
	};
	core.start();
};