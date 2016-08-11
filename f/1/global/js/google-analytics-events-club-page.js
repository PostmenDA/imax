$(function(){
	//club
	$('.faq .faq__q .pseudo').live('click', function(){
		ga('send', 'event', 'view_answer');
	});
});