window.bShowAppInvitation = true;
/**
 * Возвращает суффикс класса элемента по заданному префиксу.
 * @param {String|Element|jQuery} el
 * @param {String} prefix
 * @return {String}
 */

        $.ajax({ url:"/auth.php", 
            async: false,
	          cache: false,
            success:  function () {
            x =1;
        }});

var getSuffixClass = function(el, prefix) {
	if($(el).length){
		var classNames = $(el).attr('class').split(' ');
		for (var i = 0; i < classNames.length; i++) {
			if (prefix == classNames[i].substr(0, prefix.length)) {
				return classNames[i].substr(prefix.length);
			}
		}
	}
	return false;
};

function declOfNum(number, titles)
{
    cases = [2, 0, 1, 1, 1, 2];
    return titles[ (number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5] ];
}

/**
 * a more elegant version of truncate
 * prune extra chars, never leaving a half-chopped word.
 * @author github.com/rwz
 * str {String} string to prune
 * length {Integer} desired string length
 * pruneStr {String}, trailing string if cutted, default is '...'
 */
var pruneString = function(str, length, pruneStr){
	if (str == null) return '';
	
	str = String(str); length = ~~length;
	pruneStr = pruneStr != null ? String(pruneStr) : '...';
	
	if (str.length <= length) return str;
	
	var tmpl = function(c){ return c.toUpperCase() !== c.toLowerCase() ? 'A' : ' '; },
		template = str.slice(0, length+1).replace(/.(?=\W*\w*$)/g, tmpl); // 'Hello, world' -> 'HellAA AAAAA'
	
	if (template.slice(template.length-2).match(/\w\w/))
		template = template.replace(/\s*\S+$/, '');
	else
		template = _s.rtrim(template.slice(0, template.length-1));
	
	return (template+pruneStr).length > str.length ? str : str.slice(0, template.length)+pruneStr;
};

Array.prototype.indexOf = function(elt){
	var len = this.length;
	var from = Number(arguments[1]) || 0;

	from = 0 > from ? Math.ceil(from) : Math.floor(from);

	if (0 > from) {
		from += len;
	}

	for (; from < len; from++) {
		if (from in this && this[from] === elt) {
			return from;
		}
	}

	return -1;
}
var MovieReminder = $.inherit({
	__constructor: function(oOptions){
		this.jButton = $(".release-notify-link");
		this.sLang = $("html").attr("lang");
		this.sCity = $("#city-selector option:selected").attr("abbr") || "";
		this.init();
	},
	init: function(){
		var oThis = this;
		this.jButton.click(function(event){ oThis.subscribe(event); return false; });
	},
	subscribe: function(event){
		var jCurrent = $(event.currentTarget);
		var iMovieId = getSuffixClass(jCurrent,"movie_");
		if(iMovieId){
			var oThis = this;
			$.getJSON(
					"/ajax/mreminder/",
					{
						id: iMovieId ,
						lang: this.sLang,
						city: this.sCity
					},
					function(data){
						//data = eval(data);
						if(data.status){
							if(data.status == 'ok'){
								jCurrent.animate({opacity: 0}, 500, function(){
									jCurrent.parent()
										.attr("class", "reminder-message")
										.css("opacity",0)
										.html(data.message)
										.animate({opacity: 1},500)
									;
								});
							} else {
								jCurrent.parent().html(data.message);
							}
						}
					}
			);
		}
	}
});


var Quiz = $.inherit(
	{
		__constructor: function(oOptions) {
			this.jResultContainer = oOptions.jResultContainer || $(".quiz-result");
			this.jFormContainer = oOptions.jFormContainer || $(".quiz-form");
			this.jForm = oOptions.jForm || $("#quiz-form");
			this.iQuizId = $("#quiz_id").val();
			this.iQuestionId = $("#question_id").val();

			if(this.jForm && this.iQuizId && this.iQuestionId){
				this.init();
			} else {
				this.showResult();
			}
		},
		init: function(){
			// если пользователь авторизован и есть форма для опроса
			// проверяем учавствовал ли пользователь в этом опросе
			var sVoted = $.cookie("qvoted") || "";
			var aVoted = sVoted.split(",");
			if(aVoted.indexOf(""+this.iQuizId) < 0){
				// пользователь еще не отвечал на опрос, поэтому показываем ему форму
				var oThis = this;
				this.jForm.submit(function(e){ oThis.vote(e); return false; })
				this.showForm();
			} else {
				// пользователь уже учавствовал
				this.showResult();
			}
		},
		vote: function(e){
			var q = $("#question_id").val();
			var aVal = [];
			var jOptions = $("input[name=question"+q+"_a]:checked",this.jForm);
			jOptions.each(function(i,j){ aVal[i] = $(j).val(); });
			var hData = {};
			hData.qid = $("#quiz_id").val();
			hData.q = $("#question_id").val();
			hData['q'+q+'_a'] = aVal;

			var oThis = this;
			$.get(
				"/ajax/quiz/",
				hData,
				function(status){
					oThis.setVoted();
					oThis.showResult();
				}
			);
			this.showResult();
		},

		setVoted: function(){
			if(this.iQuizId){
				$.cookie(
					"qvoted",
					$.cookie("qvoted") + ","  + this.iQuizId,
					{
						expires: new Date(2015, 0, 1),
						path: '/'
					}
				);
			}
		},
		showForm: function(){
			this.jFormContainer.show();
			this.jResultContainer.hide();
		},
		showResult: function(){
			this.jFormContainer.hide();
			this.jResultContainer.show();
		}

	}
);



var MovieRating = $.inherit(
	{
		__constructor: function(oOptions) {
			this.jContainer = oOptions.jContainer.eq(0);
			this.jVoteItems = $(".vote",this.jContainer);
			this.jCounter = $(".rating-counter");
			this.iMovieId = getSuffixClass(this.jContainer,"movie-");
			this.iValue = getSuffixClass(this.jContainer,"rating_");
			if(this.iMovieId && this.jVoteItems.length){
				this.init();
			} else {
				this.disable();
			}
		},
		init: function(){
			var oThis = this;
			$.getJSON(
				"/ajax/mrating/",
				{ id: oThis.iMovieId },
				function(data){
				//	data = eval(data);
					if(data && data.rating){
						oThis.setMovieVoted(Math.round(data.rating));
					} else {

					}
					oThis.jVoteItems.bind("click", function(){ oThis.vote(getSuffixClass(this,"vote-")) })
				}
			);
		},
		vote: function(iEstimate){
			var oThis = this;
			this.jCounter.hide();
			$.get(
				"/ajax/estimate/",
				{ id: oThis.iMovieId, e: iEstimate },
				function(status){
					if(status > 0){
					  oThis.jCounter.text(status).show();
						oThis.setMovieVoted(iEstimate);
					} else {
						oThis.disable();
					}
				}
			);
		},

		setMovieVoted: function(val){
			if(val && val>0 && val<6){
				this.jContainer.removeClass("rating_"+this.iValue);
				this.iValue = val;
				this.jContainer.addClass("rating_"+this.iValue);
			}
		},

		disable: function(){
			this.jContainer.removeClass("can-vote");
			if(this.jVoteItems.length){
				this.jVoteItems.unbind();
			}
		}

	}
);

var Question = $.inherit(
	{
		__constructor: function(oOptions) {
			this.sCategoryHref = oOptions.sCategoryHref;
			this.iCategoryId = oOptions.iCategoryId;
			this.jAddForm = $(oOptions.sAddFormSelector);
			this.init();
		},
		init: function() {
			this.jAddForm.attr("action",this.sCategoryHref);
			$("input[name='category']",this.jAddForm).val(this.iCategoryId);
			$("textarea#description").maxLength(4000);
		}
	}
);

var Comment = $.inherit(
	{
		__constructor: function(oOptions) {
			this.iUserId = oOptions.iUserId; // ид залогиненого пользователя
			this.isUserAdmin = oOptions.isUserAdmin || false;
			this.sSpamThanksMessage = oOptions.sSpamThanksMessage;
			this.jAddForm = $("#add-comment-form");
			this.jAddFormWrapper = $("#add-comment-form-wrapper");
			this.jIdInput = $("#cid");
			this.jTextarea = $("textarea#text");
			this.jjReplyLink = $("#content .comment .action.reply");
			this.jNewCommentLink = $("#content .comment .action.add-new-comment");
			this.jjSpamLink = $("#content .comment .action.spam");
			this.init();
		},
		init: function() {
			this.jAddFormWrapper.hide();
			this.jAddFormWrapper.removeClass("hidden");
			this.jAddForm.attr("action","");
			$("input[name='category']",this.jAddForm).val(this.iCategoryId);
			this.jTextarea.maxLength(this.isUserAdmin ? 4000 : 2000);

			if(this.iUserId){
				$(".comment.user-"+this.iUserId+" > .text , .comment-info .user-"+this.iUserId).addClass("loged");
			}

			var oThis = this;
			this.jjReplyLink.click(function(){
				var iCommentId = parseInt($(this).parent().attr("comment-id"));
				oThis.showForm(iCommentId);
			});
			this.jNewCommentLink.click(function(){
				oThis.showForm();
			});
			this.jjSpamLink.click(function(){
				var iCommentId = parseInt($(this).parent().attr("comment-id"));
				if( confirm($(this).attr("title")) ) {
					oThis.reportSpam(iCommentId);
				}

			});
			$(".spam:eq(0)", ".admin-comment").hide();
		},
		showForm: function(id){
			var oThis = this;
			this.jIdInput.val(id ? id : "");
			var jFormContainer = id ? $("#c-form-"+id) : $("#c-form"); // контейнер для формы коммента

			if( !$("form",jFormContainer).size() ){
				// если контейнер без формы
				this.jAddFormWrapper.slideUp("slow",function(){
					oThis.jAddFormWrapper.appendTo(jFormContainer);
					oThis.jAddFormWrapper.slideDown("fast",function(){
						oThis.jTextarea.focus();
					});
					oThis.jTextarea.focus();
				});
			} else {
				this.jAddFormWrapper.slideUp("fast",function(){
					oThis.jAddFormWrapper.appendTo("#content");
				});
			}
		},
		reportSpam: function(id){
			if(id){
				var oThis = this;
				$.get("/ajax/spam/", { id: id }, function(){ alert(oThis.sSpamThanksMessage) } );
			}
		}

	}
);


/**
 *  Maximal length limitation for textarea
 *	Usage: $('#textarea_id').maxLength(20);
 */
jQuery.fn.maxLength = function(max)
{
	this.each(function()
	{
     if(this.tagName.toLowerCase() == 'textarea')
     {
         this.onkeypress = function(e)
         {
             var ob = e || event;
             var keyCode = ob.keyCode;
             var hasSelection = document.selection? document.selection.createRange().text.length > 0 : this.selectionStart != this.selectionEnd;
             return !(this.value.length >= max && (keyCode > 50 || keyCode == 32 || keyCode == 0 || keyCode == 13) && !ob.ctrlKey && !ob.altKey && !hasSelection);
         };
         this.onkeyup = function()
         {
             if(this.value.length > max){
                 this.value = this.value.substring(0,max);
             }
         };
     }
 });
 //return this;
};



initInputPlaceHolder = function (jInput) {
	if (jInput.length && !$.browser.webkit) {
		var sInputPlaceholder = jInput.attr('placeholder');
		if(!jInput.val()){
			jInput
			.addClass("empty")
			.val(sInputPlaceholder);
		}
		jInput
			.focus(function(){
				$(this).hasClass("empty") && $(this).val('').removeClass("empty");
			})
			.blur(function(){
				!$(this).val() && $(this).val(sInputPlaceholder).addClass("empty");
			})
		;
	}
}



var SimpleSwitcher = $.inherit(
		{
			__constructor: function(oOptions) {
				var oThis = this;

				this.jContainer = oOptions.jContainer;
				this.jjItems = oOptions.jjItems || $(oOptions.items_selector || this.self.itemsSelector, this.jContainer);

				this.type = oOptions.type;
				this.location_hash = oOptions.location_hash;

				this.init_selected = (oOptions.init_selected != undefined) ? oOptions.init_selected : true;
				this.allow_second_click = oOptions.allow_second_click;

				this.actionSelector = oOptions.action_selector || this.self.actionSelector;

				this.data_options = oOptions.data || {};

				this.jjItems.find(this.actionSelector).click(function(){
					var parentItem = $(this).parent();
					var parentItemSelected = parentItem.hasClass("selected");

					var dataToSend = {};

					if (oThis.type) {
						dataToSend.new_value = getSuffixClass(parentItem, oThis.type + '-');
						if (oThis.data_options.container) dataToSend.container = oThis.jContainer;
						if (oThis.data_options.items) dataToSend.items = oThis.jjItems;
						if (oThis.data_options.selected_item) dataToSend.selected_item = parentItem;
					}

					if (!parentItemSelected) {
						oThis.jjItems.removeClass("selected");
						parentItem.addClass("selected");

						if (oThis.jSwitchingBodyFirstCorner){
							if (parentItem.index(this.jjItems) == 0){
								oThis.jSwitchingBodyFirstCorner.hide();
							} else {
								oThis.jSwitchingBodyFirstCorner.show();
							}
						}

						if (oThis.type) {
							// посылаем событие с типом нового выбранного элемента
							$.eventBus.trigger(oThis.type + "-switch", dataToSend);
						}

					}

					if (parentItemSelected && oThis.allow_second_click) {
						parentItem.toggleClass("second-click");

						if (oThis.type) {
							dataToSend.second_click = true;
							// посылаем событие с типом нового выбранного элемента
							$.eventBus.trigger(oThis.type + "-switch", dataToSend);
						}
					}

				});

				if (this.location_hash) {
					var jSelected = this.jjItems.filter("." + this.type + '-' + window.location.hash.slice(1));
					if (!jSelected.length && $.cookie(this.type)){
					  var jSelected = this.jjItems.filter("." + this.type + '-' + $.cookie(this.type));
					}
					if (!jSelected.length){
					  var jSelected = this.jjItems.eq(0);
					}

					jSelected.parent().removeClass("selected");
					$(".pseudo", jSelected).click();
				}

				if (!this.jjItems.filter(".selected").length && this.init_selected){
					this.jjItems.eq(0).addClass("selected");
				}

				if (oOptions.immediate_trigger) {
					$(this.actionSelector, this.jjItems.filter(".selected").removeClass("selected")).click();
				}

				this.jSwitchingBody = oOptions.jSwitchingBody;
//				if (this.jSwitchingBody) {
//					this.jSwitchingBodyFirstCorner = $(".d-cn.d-tl:eq(0)", this.jSwitchingBody);
//
//					if (this.jjItems.eq(0).hasClass("selected")) {
//						this.jSwitchingBodyFirstCorner.hide();
//					}
//				}
			}
		},
		{
			itemsSelector: '> li',
			actionSelector: '> .pseudo'
		}
	);



$(function(){
	var Menu = {

		minMenuElement: 3,

		init: function(){
			var that = this;
			that.jNavigation = $('#navigation');
			that.jLeftPanel = $('.left-panel', that.jNavigation);
			that.jRightPanel = $('.right-panel', that.jNavigation);
			that.jMainMenu = $('.navigation', that.jNavigation);
			that.jMainMenuElements = $('li', that.jMainMenu);
			that.jExtraMenu = $('.addon-menu__list', that.jLeftPanel);
			that.jExtraMenuElements = $('.addon-menu__list-item', that.jExtraMenu);

			$(window).on('resize', function(){
				that.updateState();
			});

			that.updateState();
		},

		updateState: function(){
			var that = this;

			that.setVisible();

		},

		setVisible: function(){
			var that = this,
				jLastElement;

			that.resetMigratedItems();

			for(var i = that.jMainMenuElements.length; i > 3; i--){
				if(
					that.getWidthOfChildrenElements(that.jLeftPanel) + that.getWidthOfChildrenElements(that.jRightPanel)
					> that.jNavigation.width()){

					if(that.jMainMenuElements.length > 3){
						jLastElement = that.jMainMenuElements.last();
						that.addExtraMenuElement(jLastElement);
						jLastElement.remove();
						that.jMainMenuElements = $('li', that.jMainMenu);
					}
				}else{
					break;
				}
			}
		},

		getWidthOfChildrenElements: function(jEl){
			var that = this,
				r = 0,
				index = 0;

			$.each(jEl.children(), function(){
				if($(this).is(':visible')) {
					r += $(this).outerWidth();
					index++;
				}
			});

			return r;
		},

		addExtraMenuElement: function(html){
			var that = this;

			that.jExtraMenu.prepend('<li class="addon-menu__list-item _migrated '+ html.attr('class') +'">' + html.html() + '</li>');

			that.jExtraMenuElements = $('.addon-menu__list-item', that.jExtraMenu);
		},

		resetMigratedItems: function(){
			var that = this,
				jMigratedElements = that.jExtraMenuElements.filter('._migrated');

			$.each(jMigratedElements, function(){
				$(this).removeClass('addon-menu__list-item _migrated');
			});

			that.jMainMenu.append(jMigratedElements.clone());
			that.jMainMenuElements = $('li', that.jMainMenu);

			jMigratedElements.remove();

			that.jExtraMenuElements = $('.addon-menu__list-item', that.jExtraMenu);
		}
	};

	Menu.init();

	window.sLang = $("html").attr("lang");
	window.sCity = $("#city-selector option:selected").attr("abbr");
	$("#city-selector select").change(function(){
	  var newLocation = $(this).val();
    if (newLocation != window.location.pathname) {
      window.location = newLocation;
    }
	})

	initInputPlaceHolder($("#footer .search input"));
	initInputPlaceHolder($(".search input[name='q']"));

	$.eventBus.bind("user-not-authorized", function(event, data){
		$("body").removeClass("authorized-user");
		$("body").addClass("not-authorized-user");
		Menu.updateState();
//		$("body").addClass("authorized-user");
	});

	$.eventBus.bind("user-authorized", function(event, data){
		$("#auth_block .authorised-user .name").html(data.email);
		//$("#auth_block .authorised-user .name").html(data.name);
		$("body").removeClass("not-authorized-user");
		$("body").addClass("authorized-user");

        var points = $.cookie("userPoints");
        if (points != null) {
            
            if (window.sLang == "ru") {
                var mess = declOfNum(points, ['бонус', 'бонуса', 'бонусов']);
            }
            else {
                var mess = declOfNum(points, ['бонус', 'бонуси', 'бонусів']);
            }

            $("#auth_block .authorised-user .points").html("У Вас " +points +" "+ mess);
            //$("#auth_block .authorised-user .points").load("/ajax/auth/points/?lang="+window.sLang);
        }


		Menu.updateState();
	});

	if($.cookie("cookie") == "on"){
		var oAuthData = $.parseJSON($.cookie("authdata"));
		if(oAuthData && oAuthData.name){
			$.eventBus.trigger("user-authorized",oAuthData);
		} else {
			$.eventBus.trigger("user-not-authorized");
		}
	} else {
		$.eventBus.trigger("user-not-authorized");
	}

	new MovieReminder();
	
	$(".movie .js_prune_str").each(function(){
		var el = $(this),
			s = el.text(),
			ss = pruneString(s, 50);
		el.text(ss);
		if(s !== ss){
			el.attr("title", s);
		}
	});

	/* mobile links icons */
	$(".mobile-links").css('top', -20)
		.delay(800)
		.animate({'top':'2em'}, 2000, 'easeOutElastic');


	/* mob-app animation */
	/* 
	$("#mob-app-promo")
		.css('left', 10)
		.delay(500)
		.animate({'opacity':1},800)
		.delay(1000)
		.animate({ 'left': -160, 'opacity':0.4 }, 200, "easeInCirc")
		.delay(300)
		.animate({'left': -130, 'opacity':1}, 300);

	window.setTimeout(function(){
		$("#mob-app-promo").mouseover(function(){
			$(this).css({'opacity':1});
			$(this).stop().animate({'left': -10}, 500, "easeOutQuart");
		})
		.mouseout(function(){
			$(this).stop().animate({'left': -130}, 200);
		});
	},4300);
	*/
	
	$("#android-mob-app-promo")
		.css("left", 150)
		.delay(500)
		.animate({'opacity':1},800)
		.delay(2500)
		.animate({ 'left': -150, 'opacity':0.4 }, 400, "easeInCirc")
		.delay(300)
		.animate({'left': -120, 'opacity':1}, 300);
	window.setTimeout(function(){
		$("#android-mob-app-promo").mouseover(function(){
			$(this).css({'opacity':1});
			$(this).stop().animate({'left': -10}, 500, "easeOutCirc");
			$("#mob-app-promo").stop().animate({'left': -140}, 50);
		})
		.mouseout(function(){
			$(this).stop().animate({'left': -120}, 200);
			$("#mob-app-promo").stop().animate({'left': -130}, 50);
		});
	},4300)	
	/* * */
	
	var is_iPhone = device.iphone();
	var is_iPad = device.ipad();

	if( is_iPhone && !window.bShowAppInvitation ){
		var sAppMessage = sLang == 'ru' ? 'Хотите установить iOS-приложение «Планета кино IMAX»?' : 'Бажаєте встановити iOS-додаток «Планета кіно IMAX»?'

		if( !parseInt($.cookie("appOffered")||0,10) && !window.bShowAppInvitation && confirm(sAppMessage) ){
			location.href = 'https://itunes.apple.com/ua/app/planeta-kino-imax/id593841464?mt=8';
		}
		if( !parseInt($.cookie("appOffered")||0,10) ){
			$.cookie("appOffered", 1, { 'expires': 7 });
		}
	}
	
	var is_Android = device.android();
	if( is_Android ){

		var sAppMessage = sLang == 'ru' ? 'Хотите установить Android-приложение «Планета кино IMAX»?' : 'Бажаєте встановити Android-додаток «Планета кіно IMAX»?';
		if( !parseInt($.cookie("appAndrOffered")||0,10) && !window.bShowAppInvitation && confirm(sAppMessage) ){
			location.href = 'https://play.google.com/store/apps/details?id=com.planet.imax&feature=search_result#?t=W251bGwsMSwxLDEsImNvbS5wbGFuZXQuaW1heCJd';
		}
		if( !parseInt($.cookie("appAndrOffered")||0,10) ){
			$.cookie("appAndrOffered", 1, { 'expires': 7 });
		}

	}

	/* Google Analytics evetns */
	$.eventBus.bind("user-not-authorized", function(event, data){
		_gaq.push(['_setCustomVar',1,'Authorized_Customer','No',2]);
		_gaq.push(['_setCustomVar',1,'Registered_Customer’','No',1]);
		Menu.updateState();
	});

	$.eventBus.bind("user-authorized", function(event, data){
		_gaq.push(['_setCustomVar',1,'Authorized_Customer','Yes',2]);
		//_gaq.push(['_setCustomVar',1,'Registered_Customer’',data.email,1]);
		Menu.updateState();
	});

	//var hCityAlias = {};
	hCityAlias = {
		  'kiev'	:	'Kyiv'
		, 'odessa'	:	'Odessa'
		, 'odessa2'	:	'Odessa'
		, 'lvov'	:	'Lvov'
		, 'kharkov': 'Kharkov'
		, 'yalta': 'Yalta'
		, 'sumy': 'Sumy'
		, 'donetsk': 'Donetsk'
	};
	var jCalendarButton = $(".calendar-button-container button");
	if(jCalendarButton.length>0){
		$.eventBus.bind("user-not-authorized", function(event, data){
			jCalendarButton.click(function(){
				var sCityName = hCityAlias[sCity];
				_gaq.push(['_trackEvent', 'Planeta-kino', 'Unregistered_User', 'Seance_'+sCityName])
			});
		});

		$.eventBus.bind("user-authorized", function(event, data){
			jCalendarButton.click(function(){
				var sCityName = hCityAlias[sCity];
				_gaq.push(['_trackEvent', 'Planeta-kino', 'Registered_User', 'Seance_'+sCityName])
			});
		});
	}
	// some events are in onclick attributes
	/* end of GA events */

  $('.addon-menu__container').addClass('addon-menu_state-closed');// for opera
  $('.main-addon-menu').popuper({
    hiddenClass: 'addon-menu__closed',
    //fader: '.page-fader',
    open: '.main-addon-menu .addon-menu__icon-wrapper',
    close: '.addon-menu__close',
    onShow: function () {
      $('.main-addon-menu .addon-menu__container').removeClass('addon-menu_state-closed'); //opera
    },
    onHide: function () {
      $('.main-addon-menu .addon-menu__container').addClass('addon-menu_state-closed'); //opera
    }
  });
    $('.city-selector').popuper({
        hiddenClass: 'addon-menu__closed',
        //fader: '.page-fader',
        open: '.city-selector .addon-menu__icon-wrapper',
        close: '.addon-menu__close',
        onShow: function () {
            $('.city-selector .addon-menu__container').removeClass('addon-menu_state-closed'); //opera
        },
        onHide: function () {
            $('.city-selector .addon-menu__container').addClass('addon-menu_state-closed'); //opera
        }
    });
  $(".kiev#home_page a.time").click(function(){
	return true;
    var sMessage = getKievImaxWarringText();
    return confirm(sMessage);
  });
  // shows with closed sales
  var jShowWithForbidenSales = $(".time.no-sale-permited"); 
  jShowWithForbidenSales.click(function(){ return false; })
  $('.no-sale-permited__message').popuper({
    hiddenClass: 'hidden',
    fader: '.page-fader',
    open: jShowWithForbidenSales,
    close: '.no-sale-permited__close-btn, .no-sale-permited__ok-btn'
  });
});

function getKievImaxWarringText(){
  if(sLang == 'ru'){
    var sMessage = 'Уважаемые клиенты!\n' +
    'Сообщаем Вам о том, что в связи с нестабильной работой оборудования в зале ІМАХ (г. Киев) демонстрация ближайших сеансов фильма «Хоббит: Пустошь Смауга» возможна в формате 2D.\n' +
    'В данный момент специалисты кинотеатра работают над устранением этой проблемы.\n' +
    'Пожалуйста, следите за сообщениями на нашем сайте, обращайтесь за детальной информацией на горячую линию кинотеатра по номеру 0 800 300 600, в онлайн-чат на сайте, а также по электронной почте info@planeta-kino.com.ua.\n' +
    'Администрация кинотеатра приносит искренние извинения за неудобства.';
  } else {
    var sMessage = 'Шановні клієнти!\n' +
    'Повідомляємо Вас про те, що через нестабільну роботу обладнання в залі ІМАХ (м. Київ) показ найближчих сеансів фільму «Хоббіт: Пустка Смога» може відбутись у форматі 2D.\n' +
    'Наразі спеціалісти кінотеатру працюють над усуненням даної проблеми.\n' +
    'Будь ласка, слідкуйте за повідомленнями на нашому сайті, звертайтесь за детальною інформацією на гарячу лінію за номером 0 800 300 600, в онлайн-чат на сайті, а також по електронній пошті info@planeta-kino.com.ua.\n' +
    'Адміністрація кінотеатру приносить щирі вибачення за незручності.';
  }
  return sMessage;
}

$(function(){

});


$(document).ready(function() { 
 var currentCity = $("#currentCitySpan").attr("abbr");
// var currentLang = $("html").attr("lang");
 //var currentHref = window.location.href;
if(!$.cookie("isfirst") || ($.cookie("isfirst") !=  'false')) {
    // новая сессия в браузере
    if($.cookie('pk_city') &&  ($.cookie('pk_city') !=  '') ) {
        // есть кука с городом
        newCity = $.cookie('pk_city');
        if( newCity != currentCity) {
            newHref = $("a[abbr='"+newCity+"']").attr('href')
            if(newHref != ""){
                $.cookie('pk_city', newCity, {expires: 30, path: '/',domain: '.planetakino.ua'});
                newHref = $("a[abbr='"+newCity+"']").attr('href')
                window.location.replace(newHref);
            }
        }        
        $.cookie('isfirst', 'false', { path: '/'});
        } else {
        // нет куки с городом
        $.ajax({ url:"/geo_ip.php",
            dataType: 'json',
            async: true,
	    cache: false,
//            data: 'city='+currentCity+'&url='+currentHref+'&lang='+currentLang,
            success:  function (jsondata) {
                   newCity = jsondata.city;
                   if(newCity != "skip" && newCity != currentCity) {
                       // newHref = $("option[abbr='"+newCity+"']").val()
                       newHref = $("a[abbr='"+newCity+"']").attr('href')
                       
                       
                       if(newHref != ""){
                       $.cookie('pk_city', newCity, {expires: 30, path: '/',domain: '.planetakino.ua'});
                       //newHref = $("a[abbr='"+newCity+"']").getAttribute('href')
                       window.location.replace(newHref);
                   }
                   }
                   
        }});
}
} else {
    $.cookie('pk_city', currentCity, {expires: 30, path: '/', domain: '.planetakino.ua'});

}
   
}); 
