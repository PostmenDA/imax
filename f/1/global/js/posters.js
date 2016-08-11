var MoviePoster = $.inherit(
	{
		__constructor: function(oOptions) {
			oThis = this;

			this.jContainer = oOptions.jContainer;
			this.eContainer = this.jContainer.get(0);
			this.jjPosters = oOptions.jjPosters;
			this.jjTitles = oOptions.jjTitles;
			this.jjImages = $(".img", this.jjPosters);
			this.aImages = [];
			this.aCanvases = new Array(this.jjPosters.length);

			this.updateContainerHeight(
				this.eContainer.clientHeight,
				this.eContainer.clientWidth * 650 / 100
			);

			this.externalBinds();

			this.init();
		},

		init: function() {
			var total = this.jjImages.length;
			this.jjImages.each(function(index){
				oThis.aImages.push(new Image());
				oThis.aImages[index].isLoaded = false;

				if (oThis.jjPosters.eq(index).is(":visible") || oThis.jjPosters.length == 1) oThis.selectedIndex = index;

				oThis.aImages[index].onload = function() {
					this.isLoaded = true;
					oThis.initPoster(index);
				};

				oThis.aImages[index].src = $(this).attr('src');
				/*
				 if(this.jjImages.length > 1){
				 this.className += " hidden";
				 }
				 */
			});

			$(window).resize(/*$.throttle(*/function(){
				oThis.updateImageSize(oThis.selectedIndex);
			}/*, 200)*/);
		},

		initPoster: function(index) {
			//this.createCanvas(index);

			if(oThis.aImages.length == oThis.jjImages.length && !oThis.selectedIndex) { oThis.selectedIndex = 0; }

			if (index == oThis.selectedIndex) {
				this.updateImageSize(index);
			}
			this.jjPosters.eq(index).removeClass("not-loaded");
		},

		externalBinds: function(){
			$.eventBus.bind("scroll-strip-click", function(event, data){
				var sMovie = ".movie-" + data.movie_id;

				oThis.jjPosters.eq(oThis.selectedIndex).addClass("hidden");

				oThis.selectedIndex = oThis.jjPosters.index(oThis.jjPosters.filter(sMovie).removeClass("hidden"));
				oThis.updateImageSize(oThis.selectedIndex);

				oThis.jjTitles
					.addClass("hidden")
					.filter(sMovie).removeClass("hidden");
			});

			$.eventBus.bind("header-content-switch", function(event, data){
				var jBody = $("body");

				if (data.new_value == 'trailer') {
					oThis.jjPosters
						.add(".mask", oThis.jContainer)
						.addClass("hidden");

					$(".trailer", oThis.jContainer).removeClass("hidden");
				}

				if (data.new_value == 'poster') {
					oThis.jjPosters
						.add(".mask", oThis.jContainer)
						.removeClass("hidden");

					$(".trailer", oThis.jContainer).addClass("hidden");
				}

				if (jBody.hasClass("light-page") || jBody.hasClass("was-light-page")) {
					jBody
						.toggleClass("was-light-page dark-page light-page")

					var h = ["light", "dark"];

					$("#logo a img, .showtimes-head .d-bg").each(function(){
						if (this.src.indexOf(h[0]) == -1 && this.src.indexOf(h[1]) != -1)
							h = [h[1], h[0]];

						this.src = this.src.replace(h[0], h[1]);
					});
				}
			});
		},

		createCanvas: function(index) {
			$(this.self.canvasString).appendTo(this.jjPosters.eq(index));

			this.aCanvases[index] = $(this.self.canvasClass, this.jjPosters.eq(index));
		},

		updateContainerHeight: function(containerHeight, newHeight){
			var newContainerHeight = (window.innerHeight ? window.innerHeight : document.documentElement.clientHeight) - 80;

			if (newHeight < newContainerHeight)
				newContainerHeight = newHeight;

			newContainerHeight = newContainerHeight < 570 ? 570 : newContainerHeight;

			if (containerHeight != newContainerHeight) {
				oThis.jContainer.height(newContainerHeight);
				containerHeight = newContainerHeight;
			}

			return containerHeight;
		},

		updateImageSize: function(index) {
			var
				containerWidth = oThis.eContainer.clientWidth,
				containerHeight = oThis.jContainer.clientHeight,
				newContainerHeight,
				viewportHeight,
				newWidth,
				newHeight,
				options = {},
				jPoster = oThis.jjPosters.eq(index);

			options.marginTop = 0;

			//if (oThis.aImages[index].width / oThis.aImages[index].height < containerWidth / containerHeight) {
			newWidth  = containerWidth;
			newHeight = containerWidth * oThis.aImages[index].height / oThis.aImages[index].width;

			if (index == oThis.selectedIndex){
				containerHeight = oThis.updateContainerHeight(containerHeight, newHeight);
			}

			if (newHeight > containerHeight) {
				options.marginTop = -0.5 * (newHeight - containerHeight);
			}
			//} else {
			//newWidth  = containerHeight * oThis.aImages[index].width / oThis.aImages[index].height;
			//newHeight = containerHeight;
			//}

			options.width  = (isNaN(newWidth))? Math.round(containerWidth):Math.round(newWidth);
			options.height = (isNaN(newHeight))? Math.round(containerHeight):Math.round(newHeight);

			jPoster.css('margin-top', options.marginTop);

			//oThis.updateCanvas(index, options);
			oThis.updateImage(index, options);
		},

		updateCanvas: function(index, options) {
			var jCanvas = oThis.aCanvases[index];

			if (jCanvas) {

				jCanvas.attr({ height: options.height, width: options.width });

				var ctx = jCanvas.get(0).getContext('2d');
				ctx.drawImage(oThis.jjImages.get(index), 0, 0, options.width, options.height);

			}
		},
		updateImage: function(index, options) {
			var jImg = oThis.jjImages[index];
			if (jImg) {
				$(jImg).attr({ height: options.height, width: options.width });
			}
			var jYTPF = $("#ytplayer");
			if (jYTPF.length) {
				jYTPF.attr({ height: options.height, width: options.width });
			}
		}

	},
	{
		canvasString: '<canvas class="canvas"></canvas>',
		canvasClass: '.canvas'
	}
);

var MoviePosterIE = $.inherit(
	MoviePoster,
	{
		updateCanvas: function(index, options) {
			var jCanvas = this.aCanvases[index];

			options.marginTop = 0;

			jCanvas &&
			jCanvas
				.css(options)
				.css(
				'filter',
				"progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this.aImages[index].src + "', sizingMethod='scale')"
			);
		}
	},
	{
		canvasString: '<div class="canvas"></div>'
	}
);



//$(window).load(function() {
$(function(){
	var oMoviePostersOptions = {
		jContainer: $('#header'),
		jjPosters: $('#header .container:has(.img)'),
		jjTitles: $('#header .title-text:not(.text-column-position)')
	}

	if (oMoviePostersOptions.jjPosters.length){
		if (true || 'undefined' != typeof(HTMLCanvasElement)) {
			var oMoviePosters = new MoviePoster(oMoviePostersOptions);
		} else {
			var oMoviePosters = new MoviePosterIE(oMoviePostersOptions);
		}
	} else {
		if($('#header .container:has(iframe)').length){
			var oMoviePosters = new MoviePoster(oMoviePostersOptions);
		}
	}



	var jjMovies = $(".movie-thumbs .movie");

	if (jjMovies.length) {

		//var oSelectors = { globalSelector: $("#global-movie-selector") };

		var posterRotateTimer = setTimeout(rotatePoster, 40000);

		$(".poster", jjMovies).on('click', function(e, type){
			if(type == 'nextPoster') {
				var jMovie = $(this).closest(".movie");
				//var bAllowPosterSwitch = false;

				if (!jMovie.hasClass("selected") && undefined != bAllowPosterSwitch) {
					clearTimeout(posterRotateTimer);

					var jSelectedThumb = jjMovies.filter(".selected").find(".poster");

					jjMovies.removeClass("selected");
					jMovie.addClass("selected");

					//jSelectedThumb.appendTo(jSelectedThumb.next("a"));
					//$(".poster", jMovie).insertBefore($("a:has(.poster)", jMovie));

					bAllowPosterSwitch = true;

					posterRotateTimer = setTimeout(rotatePoster, 10000);

					$.eventBus.trigger("scroll-strip-click", {movie_id: parseInt(jMovie.attr("movie-id"))});
				}

				return false;
			}
		});
	}

	//$(".poster", jjMovies.eq(0)).trigger('click', ['nextPoster']);

	function rotatePoster(){
		var _next = jjMovies.index(jjMovies.filter(".selected")) + 1;
		while (_next >= jjMovies.length || jjMovies.eq(_next).hasClass("hidden-by-format")) {
			_next++;
			if (_next >= jjMovies.length) _next = 0;
		}

		$(".poster", jjMovies.eq(_next)).trigger('click', ['nextPoster']);
	}

});