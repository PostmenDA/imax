$(function(){
	var jShowtimesBody = $(".showtimes-body");

	var jjAllRows = $(".showtimes-row", jShowtimesBody);
	var jjOneDayRows = jjAllRows.filter(".p-one-day");

	var jClockLine = $(".showtimes-clock .line");
	var jClockLabel = jClockLine.find(".label .text");

    var timePeriod = 'one-day';

	var now = new Date();

    var colon = false;

	function updateClock(){
		now = new Date();
		var nowHours = now.getHours();
		var nowMinutes = now.getMinutes();

		var testDate = new Date();

        var colonClass = colon ? 'colon colon-1' : 'colon colon-0';
		if (oTimeConfig.HOURS_START > nowHours && oTimeConfig.HOURS_END - 24 <= nowHours){
			jClockLine.hide();
		} else if (sPeriod == "one-day")
			jClockLine.show();

		jClockLabel.html((nowHours < 10 ? "0" : "") + nowHours + '<span class = "' + colonClass + '">:</span>' + (nowMinutes < 10 ? "0" : "") + nowMinutes);
		jClockLine.css({
			left: (nowHours + (nowHours < oTimeConfig.HOURS_START ? 24 : 0) + nowMinutes / 60 - oTimeConfig.HOURS_START) * oTimeConfig.HOUR_WIDTH + "%",
			height: jShowtimesBody.height() + 9 //+ jClockLine.position().top + 20
		});

        colon = !colon;
	}

	function initTimes(){
		$("a.time", jjOneDayRows).each(function(){
			var time = $(this).text();
			var _date = new Date();

			var sHours = time.substr(0,2);

			_date.setHours(sHours);
			_date.setMinutes(time.substr(3,2));
			_date.setSeconds(0);

			if (sHours * 1 + 24 < oTimeConfig.HOURS_END) {
				_date.setDate(_date.getDate() + 1);
			}

			this.showtime_date = _date.toString();
		});
	}

	function checkPastTimes(){
		$("a.time", jjOneDayRows).each(function(){
			var
				_className = this.className,
				_date = new Date(this.showtime_date);

			if (_date < new Date (now.getTime()-(15*1000*60))) {
				$(this).replaceWith(
					$("<span/>", {
						"class": _className + " past",
						text: (_date.getHours() < 10 ? "0" : "") + _date.getHours() + ':' + (_date.getMinutes() < 10 ? "0" : "") + _date.getMinutes()
						, css: { left: $(this).css("left") }
					})
				);
			}
		});
	}


	if (jClockLine.length){

		initTimes();

		setInterval(function(){
			updateClock();
			checkPastTimes();
		}, 800);

		updateClock();
		jClockLine.removeClass("hidden");
		checkPastTimes();

	}

	var jjOneDayDates = $(".dates", jjOneDayRows);
	var jjOneDayTitles = $(".title", jjAllRows);
	var jjTitles = $(".movie-title", jShowtimesBody);

	var jDateMdash = $(".showtimes-head .date.current .mdash");
	var jjDates = $(".showtimes-head .date.week, .showtimes-head .date.month");
	var jDateTomorrow = $(".showtimes-head .date.next");

	var jjVisibleTimes;

	var jCalendarButton = $(".calendar-button-container");

	//var sPeriod = "one-day";
	var sPeriod = "week";

	$.eventBus.bind("showtimes-period-switch", function(event, data){
		sPeriod = data.new_value;
        timePeriod = sPeriod;

		jjAllRows
			.addClass("hidden")
			.filter(".p-" + sPeriod)
				.removeClass("hidden");

		if (sPeriod == "one-day"){
			jjOneDayDates.addClass("hidden");
			jjOneDayTitles.removeClass("hidden");
			jjTitles.addClass("hidden");

			jDateMdash.add(jjDates).addClass("hidden");
			jDateTomorrow.removeClass("hidden");

			jCalendarButton.removeClass("hidden");

			jClockLine.fadeIn();
		} else {
			jClockLine.fadeOut();

			jjOneDayDates.removeClass("hidden");
			jjOneDayTitles.addClass("hidden");

			jjDates.not("." + sPeriod).add(jDateTomorrow).addClass("hidden");
			jDateMdash.add(jjDates.filter("." + sPeriod)).removeClass("hidden");

			jCalendarButton.addClass("hidden");
		}

		checkRowsAndTitles();
		updateClock();

		getVisibleTimes();
		$.debounce(correctCloseness(), 300);
		oHourHighlighting.update();
		$.cookie('showtimes-period', sPeriod);
	});



	var jShowtimesBodyReducer = $("> .reducer", jShowtimesBody);
	var oHourHighlighting = {
			on: false,
			globalHighlighter: $(".line.hour-highlight", jShowtimesBody),

			update: function(){
				if (this.on) {
					this.globalHighlighter
						.css({
							left: oHourHighlighting.reference.offset().left - oHourHighlighting.globalHighlighter.parent().offset().left,
							width: oHourHighlighting.reference.get(0).clientWidth,
							height: jShowtimesBody.height() + 3
						})
						.removeClass("hidden");

					var globalHighlighter_right = oHourHighlighting.globalHighlighter.get(0).offsetLeft + oHourHighlighting.globalHighlighter.get(0).offsetWidth;

					var oHighlightWidths = {};

					$(".has-" + this.hour, jjAllRows.not(".hidden")).each(function(){
						var jHourHighlight = $(" .hour-highlight", this);
						var eLastHourTime = $(".h-" + oHourHighlighting.hour + ":last", this).get(0);

						if(!oHighlightWidths[eLastHourTime.innerHTML]){

							var lastHourTime_right = eLastHourTime.offsetLeft + eLastHourTime.offsetWidth;

							if (globalHighlighter_right <= lastHourTime_right + 7){
								lastHourTime_right += 9;
							}

							oHighlightWidths[eLastHourTime.innerHTML] = lastHourTime_right - jHourHighlight.get(0).offsetLeft
						}

						jHourHighlight.css({
							width: oHighlightWidths[eLastHourTime.innerHTML],
							height: $(this).closest(".showtimes-row").get(0).clientHeight
						});
					});
				}
			},

			hide: function(){
				this.off = true;
				this.globalHighlighter.addClass("hidden");
			}
	}

	$.eventBus.bind("hour-highlight-switch", function(event, data){
		//oHourHighlighting.hour = data.new_value;
        //
		//jShowtimesBodyReducer.attr("class", "reducer highlighted-hour-" + data.new_value);
        //
		//if (!data.second_click) {
		//	oHourHighlighting.reference = data.selected_item;
		//	oHourHighlighting.on = true;
		//	oHourHighlighting.update();
		//} else {
		//	oHourHighlighting.hide();
		//	oHourHighlighting.on = false;
		//	data.selected_item.removeClass("selected");
		//	jShowtimesBodyReducer.attr("class", "reducer");
		//}
        //
		//if(jQuery.browser.msie) { data.selected_item.css("zoom", "1") }
	});

	$(window).resize(
		$.throttle(function(){
			correctCloseness()
			oHourHighlighting.update();
		}, 200)
	);


	var jjAllTimes = $(".time", jjAllRows);
    var jjAllTechRows = $(".showtimes-line-technology", jjAllRows);

	var sShowtimesFormat = "all";

	$.eventBus.bind("showtimes-format-switch", function(event, data){
		sShowtimesFormat = data.new_value;

		if (sShowtimesFormat == "all") {
            jjAllTechRows.removeClass("hidden");

			updatePricesInfo("");
		} else {
			jjAllTechRows.addClass("hidden")
				.filter(".t-" + sShowtimesFormat).removeClass("hidden");

			updatePricesInfo(sShowtimesFormat);
		}

		checkRowsAndTitles();
		updateClock();

		getVisibleTimes();
		$.debounce(correctCloseness(), 300);
		oHourHighlighting.update();
		$.cookie('showtimes-format', sShowtimesFormat);
	});

	var jjPricesInfo = $(".showtimes-body .prices-info");
	var jjPricesLinks = $(".showtimes-body .prices-link");

	function updatePricesInfo(sFormat) {
		jjPricesInfo.attr("class", "prices-info" + (sFormat != "" ? (" format-" + sFormat) : ""));
    if(sFormat == 'imax-3d'){
      sFormat = 'imax';
    }
    if(sFormat == '4dx-3d'){
      sFormat = '4dx';
    }
		if (sFormat != "") {
			sFormat = "#" + sFormat
		}
		jjPricesLinks.each(function(){
			this.href = this.href.replace(/#.*/, '') + sFormat;
		});
	}


	function checkRowsAndTitles(){
		jjAllRows.filter(".p-" + sPeriod).each(function(){
			if ($(".showtimes-line-technology:not(.hidden)", this).length) {
				$(this).removeClass("hidden");
			} else {
				$(this).addClass("hidden");
			}
		});

		var jjVisibleRows = jjAllRows.not(".hidden");

		jjAllRows.removeClass("last-row");
		jjVisibleRows.last().addClass("last-row");

		if (jjVisibleRows.length != 1) {
			jShowtimesBody.addClass("can-hover");
		} else {
			jShowtimesBody.removeClass("can-hover");
		}

		if (sPeriod != "one-day"){
			jjTitles.each(function(){
				if (jjAllRows.filter(".movie-" + getSuffixClass(this, 'movie-') + ":not(.hidden)").length){
					$(this).removeClass("hidden");
				} else {
					$(this).addClass("hidden");
				}
			});
		}
	}

	checkRowsAndTitles();

	function getVisibleTimes(){
		jjVisibleTimes = $(".time:not(.hidden)", jjAllRows.not(".hidden"));
	}

	function correctCloseness(){
		var closenessThreshold = 5;

		var oPairs = {};

		jjVisibleTimes.each(function(){
			var jNextTime = $(this).nextAll(".time:not(.hidden)").eq(0);

			if (!oPairs[this.innerHTML]) {
				oPairs[this.innerHTML] = {}
			}

			if (jNextTime.length) {
				var eNextTime = jNextTime.get(0);
				if (!oPairs[this.innerHTML][eNextTime.innerHTML]) {
					//var overlap = jNextTime.offset().left - (jNextTime.get(0).margin ? jNextTime.get(0).margin : 0) - $(this).offset().left - $(this).width() - closenessThreshold;
					var overlap = eNextTime.offsetLeft - (eNextTime.margin ? eNextTime.margin : 0) - this.offsetLeft - this.clientWidth - closenessThreshold;

					if (overlap < 0)
						oPairs[this.innerHTML][eNextTime.innerHTML] = closenessThreshold - overlap;
					else
						oPairs[this.innerHTML][eNextTime.innerHTML] = 0;
				}

				if (oPairs[this.innerHTML][eNextTime.innerHTML] != 0 || jNextTime.get(0).margin != 0) {
					jNextTime.css("margin-left", oPairs[this.innerHTML][eNextTime.innerHTML]);
					eNextTime.margin = oPairs[this.innerHTML][eNextTime.innerHTML];
				}
			}

		});
	}

	getVisibleTimes();
	$.debounce(correctCloseness(), 300);
	
	var hWeeknight = {
		'ru': {
			'12': 'с понедельника на вторник',
			'23': 'со вторника на среду',
			'34': 'со среды на четверг',
			'45': 'с четверга на пятницу',
			'56': 'с пятницы на суботу',
			'60': 'с суботы на воскресенье',
			'01': 'с воскресенья на понедельник'
		},
		'ua': {
			'12': 'з понеділка на вівторок',
			'23': 'з вівторка на среду',
			'34': 'з среди на четвер',
			'45': 'з четверга на п’ятницю',
			'56': 'з п’ятниці на суботу',
			'60': 'з суботи на неділю',
			'01': 'з неділі на понеділок'
		}
	}
	$(".showtimes a.night-show:not(.no-sale-permited)").click(function(){
		var sMessage = sLang == 'ru' ? 'Это ночной сеанс, '+hWeeknight[sLang][getSuffixClass(this, 'weeknight_')]+'. Будьте внимательны при выборе даты!' : 'Це нічний сеанс, '+hWeeknight[sLang][getSuffixClass(this, 'weeknight_')]+'. Будьте уважні при виборі дати!'
		return confirm(sMessage);
	});
	$(".kiev .time.t-imax-3d").click(function(){
		return true;
	  var sMessage = getKievImaxWarringText();
	  return confirm(sMessage);
	});
	
	// T
	
	if(sLang == 'ru'){
		var sMessage = "Внимание! Хронометраж фильма «Ной» увеличен на 20 минут. В связи с этим возможны задержки с началом сеансов с 27 марта по 2 апреля включительно. Обратите внимание, рекламный блок на данных сеансах отсутствует. Детальнее: 0800300600. Извините за неудобства!";
	} else {
		var sMessage = "Увага! Хронометраж фільму «Ной» збільшено на 20 хвилин. У зв’язку з цим можливі затримки з початком сеансів з 27 березня по 2 квітня включно. Наголошуємо, що рекламний блок на даних сеансах відсутній.  Детальніше: 0800300600. Перепрошуємо за незручності.";
	}
	//Tipped.create(".kiev .movie-1003 a.time", sMessage, { maxWidth: 300 })

	var jMovieContainers = $('.showtime-movie-container', jShowtimesBody);
    var jScrollMovieTitle = $('.scroll-movie-title', jShowtimesBody);

	$(window).on('scroll', function(){
        if(timePeriod == 'week'){
            checkMovieContainers();
        }
	});

	function checkMovieContainers(){
        var windowScrollTop =  $(window).scrollTop(),
            isShow = false,
            currentId = -1;


        jMovieContainers.each(function(index, el){
            var jEl = $(el),
                offsetTop = jEl.offset().top,
                h = jEl.height();

            if (windowScrollTop >= offsetTop && windowScrollTop <= offsetTop + h - 60) {

                if(index != currentId) {
                    jScrollMovieTitle.html($(this).find('.movie-title').clone());
                    currentId = index;
                }
                isShow = true;
            }
        });

        if(isShow){
            jScrollMovieTitle.removeClass('hidden');
        }else{
            jScrollMovieTitle.addClass('hidden');
        }


	}
});