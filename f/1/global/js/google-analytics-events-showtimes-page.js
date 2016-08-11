$(function(){
	//showtimes

	$('.showtimes .showtimes-row .showtimes-line .time').live('click', function(){
		ga('send', 'event', 'buy_ticket', 'start', 'schedule');
	});
});