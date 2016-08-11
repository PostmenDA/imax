var CreepyBlock = $.inherit({
	__constructor: function(jContainer){
		this.jContainer = jContainer.css("position", "relative");
		this.iTopInitial = (this.jContainer.position()).top;
		this.iOffset = this.jContainer.offset().top - this.iTopInitial - 20;
		this.jRoot = $(window);
		
		this.jitterBuffer = 10; //anti-jitter buffer, actually. Set to 0 when not using animation.
		this.timeOutId = 0;
		var that = this;
		this.jRoot.scroll(function(){
			that.catchScroll.call(that);
		});
	},
	
	catchScroll: function(){//Debounce
		var self = this; //for setTimeout, 'this' always refers to the window
		if (self.timeOutId) clearTimeout (self.timeOutId);
		self.timeOutId = setTimeout(function(){self.doScroll();}, self.jitterBuffer);
	},
	up: function(){
		this.jContainer.css('top', 0 + 'px');
	},
	doScroll: function(){
		jTweener.removeTween(this.jContainer);
		
		var iScroll = this.jRoot.scrollTop();
		if ( iScroll > this.iOffset )
		{
			var iTop = iScroll-this.iOffset+this.iTopInitial;
		}
		else
		{
			var iTop = this.iTopInitial;
		}

		$t(this.jContainer).tween({
			top: iTop
		});
		//this.jContainer.css('top', iTop + 'px');
	}
});

var FaqGroup = $.inherit({
	__constructor: function(){
		var that = this;
		this.hFaq = {};
		this.sCurrentGroup = "";
		$(".faq-group").each(function(i, jGroup){
			var sName = getSuffixClass(jGroup, 'fg-');
			that.hFaq[sName] = {
					'group' : $(jGroup),
					'container' : $(".faq", jGroup).hide(),
					'answer' : $(".faq__answer", jGroup).hide()
			};
		});
		$(".faq__question .pseudo").click(function(e){
			var jFaq = $(this).parents('.faq:first');
			var jAnswer = $('.faq__answer', jFaq);
			var iQid = getSuffixClass(jFaq, 'faq-');
			//document.location.hash = "#q-"+iQid;
			jAnswer.slideToggle();
		});
	},
	_eachGroup: function(action){
		var that = this;
		$.each(this.hFaq, function(sName, faq){
			action.call(that, sName, faq);
		})		
	},
	hide: function(sName){
		this.hFaq[sName].group.hide();
		this.hFaq[sName].container.hide();
	},
	hideCurrent: function(){
		if(this.sCurrentGroup != ""){
			this.hide(this.sCurrentGroup);
		} else {
			this.hideAll();
		}
	},
	hideAll: function(){
		this._eachGroup(function(sName, faq){
			faq.container.hide();
			faq.group.hide();
		})
	},
	show: function(sName){
		this.sCurrentGroup = sName;
		this.hFaq[sName].group.show();
		this.hFaq[sName].answer.hide();
		this.hFaq[sName].container.each(function(i, jFaq){
			$(jFaq).delay(i*50).fadeIn();
		});
	},
	showAll: function(){
		this.sCurrentGroup = "";
		this._eachGroup(function(sName, faq){
			faq.group.show();
			faq.container.show();
			faq.answer.hide();
		})
	},
	showQuestion: function(id){
	  $(".faq-"+id+" .faq__question .pseudo").click();
	}
});

var FaqNavigation = $.inherit({
	__constructor: function(oGroup, oNavBlock){
		var that = this;
		this.items = $(".faq-group__item");
		this.oGroup = oGroup;
		this.oNavBlock = oNavBlock;
		this.sCurrentItem = "";
		this.iQuestionId = null;
		if(document.location.hash != ""){
		  if($(".g-"+document.location.hash.substr(1)).length){
		    this.sCurrentItem = document.location.hash.substr(1);
		  }
		  if($(document.location.hash) && document.location.hash.match(/^#q-\d+/)){
		    this.iQuestionId = parseInt(document.location.hash.substr(3), 10);
		    this.sCurrentItem = getSuffixClass($(document.location.hash).parents(".faq-group"), 'fg-');
		  }
		}
		this.setGroup(this.sCurrentItem, this.iQuestionId);
		this.oGroup.showQuestion(this.iQuestionId);
		this.items.click(function(e){
			if( $(this).hasClass('faq-group__item_selected') ) return;
			var sGroupName = getSuffixClass(this, 'g-') || "";
			that.setGroup.call(that, sGroupName);
		});
	},
	setGroup: function(sGroupName, iQuestion){
		this.items.removeClass("faq-group__item_selected");
		this.oNavBlock.up();
		if(sGroupName != ""){
		  if(!iQuestion){
		    document.location.hash = "#"+sGroupName;
		  }
			this.oGroup.hideAll();
			this.oGroup.show(sGroupName);
			$(".g-"+sGroupName).addClass('faq-group__item_selected');
		} else {
			document.location.hash = "";
			this.oGroup.showAll();
			$(".faq-group__item_all").addClass('faq-group__item_selected');
		}
	}
});
$(function(){

	oFaqNavBlock = new CreepyBlock( $('.faq-group__navigation'));
	var oFaqNavigation = new FaqNavigation(new FaqGroup(), oFaqNavBlock)
});