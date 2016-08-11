var bAllowPosterSwitch = true;

var POSTERS_ANIM_DURATION = 650;
var POSTERS_ANIM_EASING = "linear"

$(function(){
	$("#quick-info .movie").each(function(index){
		$(this).get(0).quickInfoIndex = index;
	});
	
	$.eventBus.bind("scroll-strip-click", function(event, data){
		var iWrapperHeight = $("#quick-info .wrapper").height();
	
		$("#quick-info .wrapper").height(iWrapperHeight);
		
		var jCurrent = $("#quick-info .movie:visible");
		
		if (!jCurrent.hasClass("movie-info-" + data.movie_id)) {

			var jNext = $("#quick-info .movie-info-" + data.movie_id);
			var iNextHeight = jNext.height();
			
			var _direction = (jNext.get(0).quickInfoIndex < jCurrent.get(0).quickInfoIndex) ? 1 : (-1);
			
			bAllowPosterSwitch = false;
			
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
				$("#quick-info .wrapper").animate({ height: iNextHeight }, POSTERS_ANIM_DURATION, POSTERS_ANIM_EASING, function(){
					$(this).removeAttr("style");
				});
			}

		}
	});
	
	$.eventBus.bind("quick-info-showtimes-format-switch", function(event, data){
		var	sFormat = data.new_value,
			jContainer = data.container.parent(),
			jjShowtimes = $(".showtimes li", jContainer),
			jjClosestTimes = $(".closest-time", jContainer);
		
		if (sFormat == "all") {
			jjShowtimes.removeClass("hidden");
			jjClosestTimes.addClass("hidden")
			.filter(".nearest").removeClass("hidden");
		} else {
			jjShowtimes.addClass("hidden")
				.filter(".t-" + sFormat).removeClass("hidden");

			jjClosestTimes.addClass("hidden")
				.filter("." + sFormat).removeClass("hidden");
		}
	});
});