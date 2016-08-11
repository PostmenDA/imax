$(function(){
	var jMoviesList = $(".movie-posters-list");
	var jComingSoonMoviesList = jMoviesList.find(".coming-soon");
	var jNowPlayingMoviesList = jMoviesList.find(".now-playing");
	var jComingSoonBg = $(".d-bg.for-coming-soon");

	var jjMovies = $(".movie-thumbs .movie", jMoviesList);

	$.eventBus.bind("movie-list-format-switch", function(event, data){
		var sFormatClass = "t-" + data.new_value;

		if (sFormatClass == "t-all"){
			jjMovies.removeClass("hidden-by-format");
		} else {
			jjMovies.not("." + sFormatClass).addClass("hidden-by-format");
			jjMovies.filter("." + sFormatClass).removeClass("hidden-by-format");
		}

		updateColumns();
	});

	function updateColumns(){
		jComingSoon = $(".movie:not(.hidden-by-format)", jComingSoonMoviesList);
		jNowPlaying = $(".movie:not(.hidden-by-format)", jNowPlayingMoviesList);

		if (jComingSoon.length)	jMoviesList.removeClass("no-coming-soon");
		if (jNowPlaying.length)	jMoviesList.removeClass("no-now-playing");

		if (jComingSoon.length && jNowPlaying.length) {

			oComingSoon.count = jComingSoon.length;
			oNowPlaying.count = jNowPlaying.length;

			oNowPlaying.calculatedWidth = jMoviesList.width() * oNowPlaying.count / (oComingSoon.count + oNowPlaying.count) - oNowPlaying.padding;
			oNowPlaying.cols = Math.min(Math.max(1, oNowPlaying.calculatedWidth / oNowPlaying.itemWidth), oComingSoon.count);

			oComingSoon.calculatedWidth = Math.floor ((jMoviesList.width() - oNowPlaying.cols * oNowPlaying.itemWidth - oNowPlaying.padding - oComingSoon.padding) / oComingSoon.itemWidth ) * oComingSoon.itemWidth + oComingSoon.padding;

			oComingSoon.rows = Math.ceil(oComingSoon.itemWidth * oComingSoon.count / (oComingSoon.calculatedWidth - oComingSoon.padding));
			oNowPlaying.rows = Math.ceil(oNowPlaying.itemWidth * oNowPlaying.count / (jMoviesList.width() - oComingSoon.calculatedWidth - oNowPlaying.padding));

			var currentRows = minRows = Math.max(oComingSoon.rows, oNowPlaying.rows);

			while (checkRows(minRows - 1)) {
				minRows--;
			}

			if (currentRows != minRows || currentRows == 1) {
				oComingSoon.calculatedWidth = Math.ceil(oComingSoon.count / minRows) * oComingSoon.itemWidth + oComingSoon.padding;
			}

			applyWidth();

		} else {

			jComingSoonMoviesList.add(jComingSoonBg).add(jNowPlayingMoviesList).removeAttr("style");
			if (jComingSoon.length == 0) jMoviesList.addClass("no-coming-soon");
			if (jNowPlaying.length == 0) jMoviesList.addClass("no-now-playing");

		}

		function checkRows(rows){
			return Math.ceil(oComingSoon.count / rows) * oComingSoon.itemWidth + oComingSoon.padding +
			  Math.ceil(oNowPlaying.count / rows) * oNowPlaying.itemWidth + oNowPlaying.padding <= jMoviesList.width();
		}

		function applyWidth(){
			jComingSoonMoviesList.add(jComingSoonBg).width(oComingSoon.calculatedWidth);
			jNowPlayingMoviesList.css("padding-left", oComingSoon.calculatedWidth);
		}
	}

	var
		oComingSoon = {},
		oNowPlaying = {};

	if(jComingSoonMoviesList.length || jNowPlayingMoviesList.length){
		oComingSoon = {
			itemWidth: $(".movie:visible:eq(0)", jComingSoonMoviesList).outerWidth(),
			padding: parseInt(jComingSoonMoviesList.find(".movie-thumbs").css("padding-left"))
		};
		oNowPlaying = {
			itemWidth: $(".movie:visible:eq(0)", jNowPlayingMoviesList).outerWidth(),
			padding: parseInt(jNowPlayingMoviesList.find(".movie-thumbs").css("padding-left"))
		};

		$(window).resize(updateColumns);
		updateColumns();
	}
});