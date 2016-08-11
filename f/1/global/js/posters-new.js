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
			this.jjImages.each(function(index){
				
				oThis.aImages.push(new Image());
				oThis.aImages[index].isLoaded = false;
				
				if (oThis.jjPosters.eq(index).is(":visible")) oThis.selectedIndex = index;
				
				oThis.aImages[index].onload = function() {
					this.isLoaded = true;
					oThis.initPoster(index);
				};
				
				oThis.aImages[index].src = $(this).attr('src');
			});
			
			if(!oThis.selectedIndex) oThis.selectedIndex = 0;
			
			$(window).resize(/*$.throttle(*/function(){
				oThis.updateImageSize(oThis.selectedIndex);
			}/*, 200)*/);
		},

		initPoster: function(index) {
			this.createCanvas(index);
			if (index == oThis.selectedIndex) {
				this.updateImageSize(index);
			}
			this.jjImages.get(index).className += " hidden";
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
				if (data.new_value == 'trailer') {
					oThis.jjPosters.addClass("hidden");

					$(".trailer", oThis.jContainer).removeClass("hidden");
				}
				if (data.new_value == 'poster') {
					
					oThis.jjPosters.removeClass("hidden");

					$(".trailer", oThis.jContainer).addClass("hidden");
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
			
			newContainerHeight = newContainerHeight < 530 ? 530 : newContainerHeight;
			
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

			options.width  = newWidth;
			options.height = newHeight

			jPoster.css('margin-top', options.marginTop);

			oThis.updateCanvas(index, options)
		},

		updateCanvas: function(index, options) {
			var jCanvas = oThis.aCanvases[index];

			jCanvas.attr({ height: options.height, width: options.width });

			var ctx = jCanvas.get(0).getContext('2d');
			ctx.drawImage(oThis.jjImages.get(index), 0, 0, options.width, options.height);
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
		if ('undefined' != typeof(HTMLCanvasElement)) {
			var oMoviePosters = new MoviePoster(oMoviePostersOptions);
		} else {
			var oMoviePosters = new MoviePosterIE(oMoviePostersOptions);
		}
	}
	
	var jjMovies = $(".movie-thumbs .movie");
	
	if (jjMovies.length) {

		var oSelectors = { globalSelector: $("#global-movie-selector") };
		
		var posterRotateTimer = setTimeout(rotatePoster, 40000);
		
		 $(".poster", jjMovies).click(function(){
			var jMovie = $(this).closest(".movie");
			
			if (!jMovie.hasClass("selected") && bAllowPosterSwitch) {
				clearTimeout(posterRotateTimer);
				
				var jSelectedThumb = jjMovies.filter(".selected").find(".poster");
				
				oSelectors.newSelector = $(".movie-selector", jMovie);
				oSelectors.newOffset = oSelectors.newSelector.offset();
				
				oSelectors.currentSelector = $(".movie-selector", jSelectedThumb);
				if (jjMovies.filter(".selected").hasClass("hidden-by-format")) {
					oSelectors.currentOffset = {
							left: oSelectors.newOffset.left,
							top: -100
					}
				} else {
					oSelectors.currentOffset = oSelectors.currentSelector.offset();
				}
				
				oSelectors.globalOffset = oSelectors.globalSelector.parent().offset();
				
				oSelectors.globalSelector.css({
					left: oSelectors.currentOffset.left - oSelectors.globalOffset.left,
					top:  oSelectors.currentOffset.top  - oSelectors.globalOffset.top				
				})
				
				oSelectors.currentSelector.addClass("hidden");
				
				bAllowPosterSwitch = false;
				
				oSelectors.globalSelector
					.removeClass("hidden")
					.animate({
						left: oSelectors.newOffset.left - oSelectors.globalOffset.left,
						top:  oSelectors.newOffset.top  - oSelectors.globalOffset.top
					}, POSTERS_ANIM_DURATION, POSTERS_ANIM_EASING, function(){
						jjMovies.removeClass("selected");
						jMovie.addClass("selected");
						
						jSelectedThumb.appendTo(jSelectedThumb.next("a"));
						$(".poster", jMovie).insertBefore($("a:has(.poster)", jMovie));
	
						oSelectors.currentSelector.removeClass("hidden");
						oSelectors.globalSelector.addClass("hidden");
						
						bAllowPosterSwitch = true;
						
						posterRotateTimer = setTimeout(rotatePoster, 20000);
					});
			
				$.eventBus.trigger("scroll-strip-click", { movie_id: parseInt(jMovie.attr("movie-id")) });
			}
				
			return false;
		});
	}
	
	function rotatePoster(){
		var _next = jjMovies.index(jjMovies.filter(".selected")) + 1;
		while (_next >= jjMovies.length || jjMovies.eq(_next).hasClass("hidden-by-format")) {
			_next++;
			if (_next >= jjMovies.length) _next = 0;
		}

		$(".poster", jjMovies.eq(_next)).click();
	}
	
});