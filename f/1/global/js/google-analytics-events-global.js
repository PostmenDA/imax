$(function(){
	//global
	$('#footer .social-icons .vkontakte').live('click', function(){
		ga('send', 'event', 'goto', 'vk');
	});
	$('#footer .social-icons .facebook').live('click', function(){
		ga('send', 'event', 'goto', 'fb');
	});
	$('#footer .social-icons .youtube').live('click', function(){
		ga('send', 'event', 'goto', 'youtube');
	});
	$('#footer .social-icons .instagram').live('click', function(){
		ga('send', 'event', 'goto', 'instagram');
	});
});