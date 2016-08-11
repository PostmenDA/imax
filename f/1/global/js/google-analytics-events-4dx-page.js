$(function(){
	//4DX
	$('.fotorama .fotorama__video-play').on('click', function(e){
		if(e.which){
			ga('send', 'event', '4dx', 'promo_video', 'play');
		}
	});

	$('.content-switcher-chair .pseudo').on('click', function(e){
		if(e.which){
			ga('send', 'event', '4dx', 'technology_description');
		}
	});
});