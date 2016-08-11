$(function(){
	$('#quick-info .buy-ticket').on('click', function(){
		ga('send', 'event', 'buy_ticket', 'start', 'main');
	});

	$('.lt-invite').live('click', function(){
		ga('send', 'event', 'ask_question');
	})
});