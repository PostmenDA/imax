/**
 * @author Vlad Yakovlev (red.scorpix@gmail.com)
 * @link www.scorpix.ru
 * @copyright Art.Lebedev Studio (http://www.artlebedev.ru)
 * @version 0.2.10
 * @date 2009-12-15
 * @requires jQuery
 * @requires uGallery
 */

/**
 * @param {String|Element|jQuery} previewEl
 * @param {String|Element|jQuery} viewEl
 * @param {Number} imageId
 * @param {Object} data
 */

function gallery(previewEl, viewEl, imageId, data) {
	previewEl = $(previewEl);


	var core = uGallery.core({
		previewEl: previewEl,
		previewContainerEl: previewEl.find('.previews .container'),
		previewContentEl: previewEl.find('.previews .content'),
		previewPicturesEl: previewEl.find('.previews .pictures'),
		eventDispatcher: uGallery.eventDispatcher(),
		viewEl: $(viewEl),
		preloaderWidth: previewEl.find('.preloader').innerWidth()
	});

	core.loader = uGallery.arrayLoader(core, data);

	galleryPictures(core);

	uGallery.previewRunner(core);
	uGallery.pictures(core)
	uGallery.previewArrowScrolling(core);
	uGallery.previewDnd(core);
	uGallery.previewMover(core);
	uGallery.previewPreloader(core);

	uGallery.state(core, imageId, {
		maxHeight: 55,
		maxWidth: 75,
		margin: 10,
		screens: 0
	});


}

/**
 * @param {uGallery.core} core
 * @param {Object} [animateParams] Параметры анимации для jTweener'а.
 */
function galleryPictures(core, animateParams) {
	var
		tweenNsPrev = 'uGalleryPicturePrev' + Math.random(),
		tweenNsNext = 'uGalleryPictureNext' + Math.random();

	animateParams = $.extend({}, { time: 0.6 }, animateParams);
	var defaultCss = {height: '',left: '',opacity: '',position: '',top: '',	width: ''};

	var currentIndex;

	core.eventDispatcher.bind('previewClick', change);

	function change(evt) {
		if (core.busy() || core.animated()) return;

		var curPicture = core.viewEl.find('.current .picture');

		fillImage(curPicture.find('img'), evt.data.current);

		//Resize container to match new image width
		var gwrapper = $('#gaw');
		jTweener.removeTween(gwrapper); //prevents flickering

		var newwidth;
		var oldwidth = gwrapper.width();
		gwrapper.width(oldwidth); //To prevent flickering after 100%-sized images
		var ismax = false;
		if ( evt.data.current.image.width > $('.section').width() )//.section - класс контейнера
		{
			newwidth = $('.section').width();
			ismax = true;
		}
		else
		{
			newwidth = evt.data.current.image.width;
		}


		//imageSelect здесь для случая, когда рамка после выбора более узкого
		//изображения закрывает его частично или полностью. В этом случае полоска отъедет назад

		if( newwidth < 520 ){
			newwidth = 520;
		}
		$t(gwrapper).tween({
            width: newwidth,
            time: 0.6,
            onComplete: function(){

				if(ismax){
					$('#gaw').css({
						'width': '100%',
						'max-width': evt.data.current.image.width});

				}

				if (newwidth < oldwidth)
	                core.eventDispatcher.dispatch('imageSelect', {
	        			index: core.loader.selectedIndex(),
	        			imageInfo: evt.data.current
	        		});


            }
		});

		core.eventDispatcher.dispatch('imageSelect', {
			index: evt.data.current.index,
			imageInfo: evt.data.current
		});
	}

	function fillImage(el, imageData) {
		el.removeAttr('height').removeAttr('src').removeAttr('width')

		if (imageData) {
			el.attr({
				height: imageData.image.height,
				src: imageData.image.src,
				width: imageData.image.width
			}).css('visibility', '');
		} else {
			el.css('visibility', 'hidden');
		}
	}
}
/*
$.browser.msie && 8 > parseInt($.browser.version) && $(function() {

	var
		prevArrowEl = $('.gallery_previews .prev'),
		nextArrowEl = $('.gallery_previews .next'),
		arrowTop = prevArrowEl.find('.icon').position().top;

	var arrowHoverIn = function() {
		$(this).addClass('hover').find('.icon').css('top', '');
	};
	var arrowHoverOut = function() {
		$(this).removeClass('hover').find('.icon').css('top', arrowTop);
	};

	prevArrowEl.hover(arrowHoverIn, arrowHoverOut);
	nextArrowEl.hover(arrowHoverIn, arrowHoverOut);
});
*/
