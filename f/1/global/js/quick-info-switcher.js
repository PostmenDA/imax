var bAllowPosterSwitch = true;

var POSTERS_ANIM_DURATION = 650;
var POSTERS_ANIM_EASING = "linear";

$(function(){
	var
		jQuickInfo = $("#quick-info"),
		jQuickInfoWrapper = jQuickInfo.find(".wrapper");
	
	jQuickInfo.find(".movie").each(function(index){
		$(this).get(0).quickInfoIndex = index;
	});
	
	$.eventBus.bind("scroll-strip-click", function(event, data){
		var jCurrent = jQuickInfo.find(".movie:visible");
		
		if (!jCurrent.hasClass("movie-info-" + data.movie_id)) {

			!jCurrent.length && jQuickInfo.removeClass("hidden");
			
			var
				jNext = jQuickInfo.find(".movie-info-" + data.movie_id),
				iNextHeight = jNext.height(),
				iWrapperHeight,
				_direction;
			
			if (jCurrent.length && jNext.length) {
				_direction = (jNext.get(0).quickInfoIndex < jCurrent.get(0).quickInfoIndex) ? 1 : (-1);
			}
			
			if (!jCurrent.length && jNext.length) {
				_direction = 1;
			}
			
			if (jCurrent.length && !jNext.length) {
				_direction = -1;
			}

			bAllowPosterSwitch = false;
			
			iWrapperHeight = jQuickInfoWrapper.height();
			jQuickInfoWrapper.height(iWrapperHeight);
			
			jCurrent
				.css("position", "absolute")
				.animate({ marginTop: (_direction == -1) ? -iWrapperHeight : iNextHeight }, POSTERS_ANIM_DURATION, POSTERS_ANIM_EASING, function(){
					$(this).addClass("hidden").removeAttr("style");
				});

			jNext
				.css({ position: "absolute", top: (_direction == -1) ? iWrapperHeight : -iNextHeight })
				.removeClass("hidden")
				.animate({ top: 0 }, POSTERS_ANIM_DURATION, POSTERS_ANIM_EASING, function(){
					$(this).removeAttr("style");

					bAllowPosterSwitch = true;
				});
			
			if (iWrapperHeight != iNextHeight) {
				jQuickInfoWrapper.animate({ height: iNextHeight }, POSTERS_ANIM_DURATION, POSTERS_ANIM_EASING, function(){
					jQuickInfoWrapper.removeAttr("style");
					!jNext.length && jQuickInfo.addClass("hidden");
				});
			}
			
		}

	});
	
	$.eventBus.bind("quick-info-showtimes-format-switch", function(event, data){
		var	sFormat = data.new_value,
			jContainer = data.container.parents('.movie'),
			jjShowtimes = $(".showtimes li", jContainer),
			jjClosestTimes = $(".closest-time", jContainer),
            jjClosestTimeBtns = $(".closest-time-btn", jContainer);
		//console.log(data.container)
		if (sFormat == "all") {
			jjShowtimes.removeClass("hidden");
			jjClosestTimes.addClass("hidden")
			    .filter(".nearest").removeClass("hidden");
            jjClosestTimeBtns.addClass('hidden')
                .filter(".nearest").removeClass("hidden");
		} else {
			jjShowtimes.addClass("hidden")
				.filter(".t-" + sFormat).removeClass("hidden");

			jjClosestTimes.addClass("hidden")
				.filter("." + sFormat).removeClass("hidden");

            jjClosestTimeBtns.addClass('hidden')
                .filter("." + sFormat).removeClass("hidden");
		}
	});
});