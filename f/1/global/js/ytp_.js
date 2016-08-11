(function ( $ ) {

  $.fn.YTPControls = function(P, jPoster) {
    var jPlayBtn = $('<div>').addClass('ytp-play-btn').hide();
    var jTime = $('<div>').addClass('playback__time');
    var jTimeline = $('<div>').addClass('playback__timeline');
    var jBufferline = $('<div>').addClass('playback__bufferline');
    var jPlayback = $('<div>').addClass('playback');
    var iStatus = -1;
    var jContainer = $(this).html('').hide();
    var jIframe = $(P.getIframe());
    var ControlTimeout;
    var dropCurtainStarted = false;
    
    jContainer.before(jPlayBtn);
    jContainer.addClass('ytp-controls');
    jPlayback
      .append(jTime)
      .append($('<div>').addClass('playback__line'))
      .append(jTimeline)
      .append(jBufferline)
      .appendTo(jContainer);
    //console.log(P.addEventListener)
    P.addEventListener('onReady', onPlayerReady);
    P.addEventListener('onStateChange', onPlayerStateChange);
    //P.addEventListener('onError', function(){});

    jPlayback.click(onPlaybackClick);
    jPlayBtn.click(onPlayBtnClick);
    jIframe
      .on("hover mousemove mouseover", function(){
        jContainer.show();
        clearTimeout(ControlTimeout);
        ControlTimeout = setTimeout(function(){
          jContainer.fadeOut(1000);
        }, 4000);
      });

    
    function onPlayBtnClick(event){
      jPlayBtn.hide();
      P.playVideo();
      jPoster.fadeOut(2000, function(){
        jIframe.fadeIn(4000);
        setTimeout(function(){
          jContainer.fadeIn(1000);
        }, 2000);
      });
    };

    function onPlaybackClick(event){
      var d = P.getDuration();
      var offset = event.offsetX || Math.round(event.clientX-$(this).offset().left);
      //console.log(event, $(this).width(), $(this).offset());
      var x = Math.round(P.getDuration()*offset/$(this).width());
      P.seekTo(x, true);
      if( iStatus==2 ){
        P.playVideo();
      }
    };

    function onPlayerReady(event) {
    	jPlayBtn.show();
      P.setVolume(90);
      P.setPlaybackQuality('highres');
    };

    function onPlayerStateChange(event) {
      iStatus = event.data;
      _playback();
      _buffer();
      if(iStatus==0){
        //jPoster.fadeIn(1000);
        jPlayBtn.show();
        jContainer.hide();
      }
      if(iStatus==1){
        $('#navigation').slideUp(100);
      }else{
        $('#navigation').slideDown(100);
      }
    };
    
    function _playback(){
      var t = P.getCurrentTime();
      var d = P.getDuration();
      if( t && (d-t)<5 && !dropCurtainStarted){
        dropCurtainStarted = true;
        jIframe.fadeOut(4000);
        jPoster.delay(3000).fadeIn(600);
      }
      if(d){
        jTimeline.css('width', 100*t/d+'%');
      }
      jTime.text(toHHMMSS(Math.round(d-t)));
      if( iStatus==1 ){
        jPlayback.width()/d
        setTimeout(_playback, 200);
      }
    };

    function _buffer(){
      var state = P.getVideoLoadedFraction();
      jBufferline.css('width', state*100+'%');
      if( state < 1 ){
        setTimeout(_buffer, 1000);
      }
    };

    return this;
  }

  function toHHMMSS(seconds) {
    var h, m, s, result='';
    // HOURs
    h = Math.floor(seconds/3600);
    seconds -= h*3600;
    if(h){
      result = h<10 ? '0'+h+':' : h+':';
    }
    // MINUTEs
    m = Math.floor(seconds/60);
    seconds -= m*60;
    result += m<10 ? '0'+m+':' : m+':';
    // SECONDs
    s=seconds%60;
    result += s<10 ? '0'+s : s;
    return result;
  }

}( jQuery ));

$(function(){
  var loadYTAPI = jQuery.Deferred();
  loadYTAPI.done(initPlayer);
  
  if(isYouTubeIframeAPIReady){
    loadYTAPI.resolve();
  } else {
    window.onYouTubeIframeAPIReady = function(){
    	isYouTubeIframeAPIReady = true;
      loadYTAPI.resolve();
    }
  }
  
  function initPlayer(){
    var jYTIframe = $("#ytplayer").fadeTo(0, 0);
    var jPoster = $('#header .container:has(iframe) img').hide().removeClass('hidden').fadeIn(1000);
    if(jYTIframe.length){
      var oYP = new YT.Player(jYTIframe.get(0));
      $('.youtube-player-controls').YTPControls(oYP, jPoster);
      
    }
  }
})