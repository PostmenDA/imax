$(function(){
	//imax
	$('.fotorama .fotorama__video-play').live('click', function(e){
		if(e.which){
			ga('send', 'event', 'imax', 'promo_video', 'play');
		}
	});

	$('.content-switcher-imax .pseudo, .content-switcher-3d .pseudo').live('click', function(e){
		if(e.which){
			ga('send', 'event', 'imax', 'technology_description');
		}
	});
});