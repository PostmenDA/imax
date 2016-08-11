$(function(){
	var jShowtimesBody = $(".showtimes-body");
	
	var jjAllRows = $(".showtimes-row", jShowtimesBody);
	var jjOneDayRows = jjAllRows.filter(".p-one-day");

	var jClockLine = $(".showtimes-body .clock");
	var jClockLabel = jClockLine.find(".label .text");
	
	var now = new Date();
	
	function updateClock(){
		now = new Date();
		var nowHours = now.getHours();
		var nowMinutes = now.getMinutes();
		
		var testDate = new Date();

		if (oTimeConfig.HOURS_START > nowHours && oTimeConfig.HOURS_END - 24 <= nowHours){
			jClockLine.hide();
		} else if (sPeriod == "one-day")
			jClockLine.show();

		jClockLabel.text((nowHours < 10 ? "0" : "") + nowHours + ':' + (nowMinutes < 10 ? "0" : "") + nowMinutes);
		jClockLine.css({
			left: (nowHours + (nowHours < oTimeConfig.HOURS_START ? 24 : 0) + nowMinutes / 60 - oTimeConfig.HOURS_START) * oTimeConfig.HOUR_WIDTH + "%",
			height: jShowtimesBody.height() + 3
		});

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
			var _className = this.className;
			var _date = new Date(this.showtime_date);
			if (_date < now) {
				$(this).replaceWith(			
					$("<span/>", {
						"class": _className + " past",
						text: (_date.getHours() < 10 ? "0" : "") + _date.getHours() + ':' + (_date.getMinutes() < 10 ? "0" : "") + _date.getMinutes()
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
		}, 2500);
		
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
	
	var sPeriod = "one-day";

	$.eventBus.bind("showtimes-period-switch", function(event, data){
		sPeriod = data.new_value;
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
		
		getVisibleTimes();
		$.debounce(correctCloseness(), 300);
		oHourHighlighting.update();
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
							
							if (globalHighlighter_right <= lastHourTime_right){
								lastHourTime_right += 8;
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
		oHourHighlighting.hour = data.new_value;

		jShowtimesBodyReducer.attr("class", "reducer highlighted-hour-" + data.new_value);
		
		if (!data.second_click) {
			oHourHighlighting.reference = data.selected_item;
			oHourHighlighting.on = true;
			oHourHighlighting.update();
		} else {
			oHourHighlighting.hide();
			oHourHighlighting.on = false;
			data.selected_item.removeClass("selected");
			jShowtimesBodyReducer.attr("class", "reducer");
		}
		
		if(jQuery.browser.msie) { data.selected_item.css("zoom", "1") }
	});
	
	$(window).resize(
		$.throttle(function(){
			correctCloseness()
			oHourHighlighting.update();
		}, 200)
	);
	
	
	var jjAllTimes = $(".time", jjAllRows);
	
	var sShowtimesFormat = "all";
	
	$.eventBus.bind("showtimes-format-switch", function(event, data){
		sShowtimesFormat = data.new_value;
		
		if (sShowtimesFormat == "all") {
			jjAllTimes.removeClass("hidden");
		} else {
			jjAllTimes.addClass("hidden")
				.filter(".t-" + sShowtimesFormat).removeClass("hidden");
		}
		
		checkRowsAndTitles();
		updateClock();
		
		getVisibleTimes();
		$.debounce(correctCloseness(), 300);
		oHourHighlighting.update();
	});
	
	function checkRowsAndTitles(){
		jjAllRows.filter(".p-" + sPeriod).each(function(){
			if ($(".time:not(.hidden)", this).length) {
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
	
});