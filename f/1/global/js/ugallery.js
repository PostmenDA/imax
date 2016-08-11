/**
 * @author Vlad Yakovlev (red.scorpix@gmail.com)
 * @link www.scorpix.ru
 * @copyright Art.Lebedev Studio (http://www.artlebedev.ru)
 * @version 0.2.13
 * @date 2009-12-24
 * @requires jQuery
 * @requires jTweener
 */

var uGallery={};uGallery.core=function(options){var localCriterion='file://';var state=function(className){var state=false;return function(newState){if(undefined===newState)return state;state=newState;if(state){this.previewEl.addClass(className);this.viewEl.addClass(className)}else{this.previewEl.removeClass(className);this.viewEl.removeClass(className)}}};var previewLeft=function(){var pos=0;return function(newPos,notUpdateEl){if(undefined===newPos)return pos;pos=parseInt(newPos,10);if(!notUpdateEl){this.previewContentEl.css('left',pos)}}};var defOptions={previewEl:null,previewContainerEl:null,previewContentEl:null,previewPicturesEl:null,viewEl:null,animated:state('animate'),eventDispatcher:null,previewLeft:previewLeft(),loader:null,isLocal:localCriterion==location.href.substr(0,localCriterion.length),busy:state('busy'),preloaderWidth:0,paused:state('pause')};return $.extend({},defOptions,options?options:{})};uGallery.abstractLoader=function(core){var selIndex=0,loaded=[],loadedIndexes={},loadedIds={},loadedStart=0;function selectedIndex(newIndex){if(undefined===newIndex)return selIndex;selIndex=newIndex};function selected(){return item(selIndex)};function insert(data,isPrev){loaded.push(data);var index;if(isPrev){loadedStart--;index=loadedStart}else{index=loadedStart+loaded.length-1}loaded[loaded.length-1].index=index;loadedIndexes[index]=loaded.length-1;loadedIds[item(index).id]=index;uGallery.loadImage(item(index).preview.src)};function item(index){return undefined===loadedIndexes[index]?false:loaded[loadedIndexes[index]]};function itemById(id){return undefined===loadedIds[id]?false:item(loadedIds[id])};function indexById(id){return undefined===loadedIds[id]?false:loadedIds[id]};return{count:function(){return loaded.length},first:function(){return loadedStart},indexById:indexById,insert:insert,item:item,itemById:itemById,selectedIndex:selectedIndex,selected:selected}};uGallery.ajaxLoader=function(core,options){options=$.extend({},{tryCount:3,ajaxParams:{},limit:30},options);var firstRequest,prevRequest,nextRequest,isFirst=false,isLast=false,onInited,onLoaded,parent=uGallery.abstractLoader(core);function init(onInit,onLoad){onInited=onInit;onLoaded=onLoad;options.ajaxParams.limit=options.limit;var params={};$.extend(params,options.ajaxParams);params.id=options.imageId;firstRequest={id:params.id,counter:1,params:params};load(params)};function loadPrev(){if(0>=parent.count())return false;if(firstRequest||prevRequest||isFirst)return false;var image=parent.item(parent.first());if(!image)return;var params={};$.extend(params,options.ajaxParams);params.id=image.id;params.direction=-1;prevRequest={id:params.id,counter:1,params:params};load(params);return true};function loadNext(){if(0>=parent.count())return false;if(firstRequest||nextRequest||isLast)return false;var image=parent.item(parent.first()+parent.count()-1);if(!image)return;var params={};$.extend(params,options.ajaxParams);params.id=image.id;params.direction=1;nextRequest={id:params.id,counter:1,params:params};load(params);return true};function load(params){try{$.ajax({imageId:params.id,data:params,dataType:'text',error:onLoadError,success:onLoadSuccess,timeout:2000,type:'GET',url:core.isLocal?'./i/temp/gallery_ajax_'+params.id+'xml.htm':options.ajaxUrl})}catch(e){}};function onLoadSuccess(data,textStatus){if('success'!=textStatus)return;if(!data)return;var responseEl=$('root',uGallery.getXml(data.replace('&','&amp;'))).find('>response'),els=responseEl.find('>d'),imagesLength=els.length,previewSrcPrefix=responseEl.attr('p_src_prefix'),imageSrcPrefix=responseEl.attr('i_src_prefix');if(prevRequest&&prevRequest.id==this.imageId){prevRequest=false;for(var i=els.length-1;i>=0;i--){parent.insert(fillInfo(els.eq(i),previewSrcPrefix,imageSrcPrefix),true)}if(1!=parseInt(responseEl.attr('has_prev'),10)){isFirst=true}onLoaded&&onLoaded()}else if(nextRequest&&nextRequest.id==this.imageId){nextRequest=false;els.each(function(){parent.insert(fillInfo($(this),previewSrcPrefix,imageSrcPrefix))});if(1!=parseInt(responseEl.attr('has_next'),10)){isLast=true}onLoaded&&onLoaded()}else if(firstRequest&&firstRequest.id==this.imageId){firstRequest=false;els.each(function(){parent.insert(fillInfo($(this),previewSrcPrefix,imageSrcPrefix))});if(1!=parseInt(responseEl.attr('has_prev'),10)){isFirst=true}if(1!=parseInt(responseEl.attr('has_next'),10)){isLast=true}onInited&&onInited()}};function onLoadError(){if(prevRequest&&this.imageId==prevRequest.id){if(options.tryCount>=++prevRequest.counter){load(prevRequest.params)}else{prevRequest=false;isFirst=true}}else if(nextRequest&&this.imageId==nextRequest.id){if(options.tryCount>=++nextRequest.counter){load(nextRequest.params)}else{nextRequest=false;isLast=true}}};function fillInfo(el,previewSrcPrefix,imageSrcPrefix){var previewEl=el.find('>p'),imageEl=el.find('>i'),id=el.attr('id');return{id:id,href:el.attr('href'),preview:{src:previewSrcPrefix+previewEl.attr('src'),width:parseInt(previewEl.attr('w'),10),height:parseInt(previewEl.attr('h'),10)},image:{src:imageSrcPrefix+imageEl.attr('src'),width:parseInt(imageEl.attr('w'),10),height:parseInt(imageEl.attr('h'),10)},info:el[0]}};return{count:parent.count,first:parent.first,init:init,indexById:parent.indexById,isLeftBorder:function(){return isFirst},isRightBorder:function(){return isLast},item:parent.item,itemById:parent.itemById,loadNext:loadNext,loadPrev:loadPrev,selectedIndex:parent.selectedIndex,selected:parent.selected}};uGallery.jsonLoader=function(core,options){options=$.extend({},{tryCount:3,ajaxParams:{},limit:30},options);var firstRequest,prevRequest,nextRequest,isFirst=false,isLast=false,onInited,onLoaded,parent=uGallery.abstractLoader(core);function init(onInit,onLoad){onInited=onInit;onLoaded=onLoad;options.ajaxParams.limit=options.limit;var params={};$.extend(params,options.ajaxParams);params.id=options.imageId;firstRequest={id:params.id,counter:1,params:params};load(params)};function loadPrev(){if(0>=parent.count())return false;if(firstRequest||prevRequest||isFirst)return false;var image=parent.item(parent.first());if(!image)return;var params={};$.extend(params,options.ajaxParams);params.id=image.id;params.direction=-1;prevRequest={id:params.id,counter:1,params:params};load(params);return true};function loadNext(){if(0>=parent.count())return false;if(firstRequest||nextRequest||isLast)return false;var image=parent.item(parent.first()+parent.count()-1);if(!image)return;var params={};$.extend(params,options.ajaxParams);params.id=image.id;params.direction=1;nextRequest={id:params.id,counter:1,params:params};load(params);return true};function load(params){try{$.ajax({imageId:params.id,data:params,dataType:'json',error:onLoadError,success:onLoadSuccess,timeout:2000,type:'GET',url:core.isLocal?'./i/temp/gallery_ajax_'+params.id+'.htm':options.ajaxUrl})}catch(e){}};function onLoadSuccess(data,textStatus){if('success'!=textStatus)return;if(!data)return;var els=data.images;if(prevRequest&&prevRequest.id==this.imageId){prevRequest=false;els.reverse();$.each(els,function(){parent.insert(fillInfo(this,data.pSrcPrefix,data.iSrcPrefix),true)});if(1!=data.hasPrev){isFirst=true}onLoaded&&onLoaded()}else if(nextRequest&&nextRequest.id==this.imageId){nextRequest=false;$.each(els,function(){parent.insert(fillInfo(this,data.pSrcPrefix,data.iSrcPrefix))});if(1!=data.hasNext){isLast=true}onLoaded&&onLoaded()}else if(firstRequest&&firstRequest.id==this.imageId){firstRequest=false;$.each(els,function(){parent.insert(fillInfo(this,data.pSrcPrefix,data.iSrcPrefix))});if(1!=data.hasPrev){isFirst=true}if(1!=data.hasNext){isLast=true}onInited&&onInited()}};function onLoadError(){if(prevRequest&&this.imageId==prevRequest.id){if(options.tryCount>=++prevRequest.counter){load(prevRequest.params)}else{prevRequest=false;isFirst=true}}else if(nextRequest&&this.imageId==nextRequest.id){if(options.tryCount>=++nextRequest.counter){load(nextRequest.params)}else{nextRequest=false;isLast=true}}};function fillInfo(el,previewSrcPrefix,imageSrcPrefix){if(previewSrcPrefix){el.preview.src=previewSrcPrefix+el.preview.src}if(imageSrcPrefix){el.image.src=imageSrcPrefix+el.image.src}return el};return{count:parent.count,first:parent.first,indexById:parent.indexById,init:init,isLeftBorder:function(){return isFirst},isRightBorder:function(){return isLast},item:parent.item,itemById:parent.itemById,loadPrev:loadPrev,loadNext:loadNext,selectedIndex:parent.selectedIndex,selected:parent.selected}};uGallery.arrayLoader=function(core,imageData){var parent=uGallery.abstractLoader(core);var loadedIds={};var selIndex=0;function init(onInit){$.each(imageData,function(i){if(undefined===this.id){this.id=i}parent.insert(this)});onInit&&onInit()};return{count:parent.count,first:parent.first,indexById:parent.indexById,init:init,isLeftBorder:function(){return true},isRightBorder:function(){return true},item:parent.item,itemById:parent.itemById,loadPrev:function(){return false},loadNext:function(){return false},selectedIndex:parent.selectedIndex,selected:parent.selected}};uGallery.state=function(core,imageId,options){var temp=0;options=$.extend({},{maxDeviation:150,margin:0,screens:4},options?options:{});core.busy(true);core.loader.init(load,update);function load(){core.eventDispatcher.bind('previewsUpdate',function(){update()});core.eventDispatcher.bind('imageSelect',function(evt){animateToImage(evt.data.index,function(){core.eventDispatcher.dispatch('imageSelected',{index:evt.data.index,imageInfo:evt.data.imageInfo})})});core.eventDispatcher.bind('pause',function(){core.paused(true)});core.eventDispatcher.bind('resume',function(){core.paused(false);update()});$(window).resize(update);update();core.busy(false);var index=core.loader.indexById(imageId);if(false!==index){core.eventDispatcher.dispatch('previewClick',{current:core.loader.item(index),prev:core.loader.item(index-1),next:core.loader.item(index+1)})}core.eventDispatcher.dispatch('loaded')};function update(){if(core.animated()||core.paused())return;var containerWidth=core.previewContainerEl.width();if(!containerWidth)return;var maxElCount;if(options.screens){maxElCount=Math.floor(containerWidth*options.screens/(options.maxWidth+options.margin));if(core.loader.count()<maxElCount&&core.loader.isLeftBorder()&&core.loader.isRightBorder()){maxElCount=core.loader.count()}}else{maxElCount=core.loader.count()}fillContent(maxElCount);var previewsWidth=core.previewPicturesEl.width(),elCount=core.previewPicturesEl.find('img').length,elStartIndex=elCount?core.previewPicturesEl.find('img:first').data('uIndex'):core.loader.first();var minLeft=0>containerWidth-previewsWidth?containerWidth-previewsWidth:0;var maxLeft=0;if(core.loader.first()+core.loader.count()>elStartIndex+elCount||!core.loader.isRightBorder()){minLeft-=core.preloaderWidth}if(core.loader.first()<elStartIndex||!core.loader.isLeftBorder()){maxLeft+=core.preloaderWidth}if(core.previewLeft()<minLeft){core.previewLeft(minLeft)}else if(maxLeft<core.previewLeft()){core.previewLeft(maxLeft)}var deviation=core.previewLeft()+Math.round((previewsWidth-containerWidth)/2);var moveX=0;if(options.maxDeviation<deviation){moveX=fromEndToBegin(deviation,maxElCount)}else if(-options.maxDeviation>deviation){moveX=fromBeginToEnd(deviation)}core.eventDispatcher.dispatch('previewsUpdated',{moveX:moveX})};function fillContent(maxElCount){var elCount=core.previewPicturesEl.find('img').length;var elStartIndex=elCount?core.previewPicturesEl.find('img:first').data('uIndex'):core.loader.first();var operationCount;if(options.screens){operationCount=maxElCount-elCount;if(0<operationCount){var startImage=elStartIndex+core.previewPicturesEl.find('.active').length;if(core.loader.first()+core.loader.count()<startImage+operationCount){operationCount=core.loader.first()+core.loader.count()-startImage;core.loader.loadNext()}for(var i=0;i<operationCount;i++){var el=$('<img />').appendTo(core.previewPicturesEl);fillBlock(el,startImage+i)}}else if(0>operationCount){core.previewPicturesEl.find('img').eq(maxElCount-1).nextAll('img').remove()}}else{var startImage=elStartIndex+core.previewPicturesEl.find('.active').length;operationCount=core.loader.first()+core.loader.count()-startImage;core.loader.loadNext();for(var i=0;i<operationCount;i++){var el=$('<img />').appendTo(core.previewPicturesEl);fillBlock(el,startImage+i)}}};function fromEndToBegin(moved,maxElCount){var operationCount=maxElCount-core.previewPicturesEl.find('img').length,width=0,elStartIndex=core.previewPicturesEl.find('img:first').data('uIndex');while(width<moved){var imageInfo=core.loader.item(elStartIndex-1);if(!imageInfo){core.loader.loadPrev();break}var el;if(!options.screens||0<operationCount){el=$('<img />').prependTo(core.previewPicturesEl);operationCount--}else{el=core.previewPicturesEl.find('img:last').prependTo(core.previewPicturesEl)}fillBlock(el,elStartIndex-1);width+=imageInfo.preview.width+options.margin;elStartIndex--}if(!width)return 0;core.previewLeft(core.previewLeft()-width);return-width};function fromBeginToEnd(moved){var width=0,elStartIndex=core.previewPicturesEl.find('img:first').data('uIndex'),elCount=core.previewPicturesEl.find('img').length,index=elStartIndex;while(width<-moved){if(!core.loader.item(elStartIndex+elCount)){core.loader.loadNext();break}var el=core.previewPicturesEl.find('img:first').attr('class','').appendTo(core.previewPicturesEl);fillBlock(el,elStartIndex+elCount);width+=core.loader.item(elStartIndex).preview.width+options.margin;elStartIndex++}if(!width)return 0;core.previewLeft(core.previewLeft()+width);return width};function fillBlock(el,index){var image=core.loader.item(index);el.removeAttr('src').removeAttr('class').addClass('active i_'+index).data('uIndex',index);if(index==(core.loader.count()-1))el.css('margin-right','0px');el[0].src=image.preview.src;el[0].height=image.preview.height;el[0].width=image.preview.width};function animateToImage(imageIndex,onComplete){var containerWidth=core.previewContainerEl.width(),elStartIndex=core.previewPicturesEl.find('img:first').data('uIndex'),elCount=core.previewPicturesEl.find('img').length;if(imageIndex>=elStartIndex&&imageIndex<elStartIndex+elCount){var offsetLeft=Math.round(core.previewPicturesEl.find('.i_'+imageIndex).offset().left-core.previewContainerEl.offset().left);if(0<offsetLeft&&offsetLeft+core.loader.item(imageIndex).preview.width<containerWidth){onComplete&&onComplete();return}}var leftWidth=0,leftCount=0,rightWidth=0,rightCount=0,leftRemoveCount=0,leftRemoveWidth=0,rightRemoveCount=0,rightRemoveWidth=0,previewsWidth=core.previewPicturesEl.width();var count=core.loader.first();for(var i=imageIndex-1;i>=count;i--){if(leftWidth>=containerWidth/2||!core.loader.item(i))break;leftWidth+=core.loader.item(i).preview.width+options.margin;leftCount++}count=core.loader.first()+core.loader.count();for(var i=imageIndex+1;i<count;i++){if(rightWidth>=containerWidth-leftWidth||!core.loader.item(i))break;rightWidth+=core.loader.item(i).preview.width+options.margin;rightCount++}if(leftWidth+rightWidth<containerWidth){var start=imageIndex-1-leftCount;count=core.loader.first();for(var i=start;i>=count;i--){if(leftWidth+rightWidth>=containerWidth||!core.loader.item(i))break;leftWidth+=core.loader.item(i).preview.width+options.margin;leftCount++}}while(true){var imageInfo=core.loader.item(elStartIndex+leftRemoveCount);if(!imageInfo)break;var previewWidth=imageInfo.preview.width+options.margin;if(0<=core.previewLeft()+leftRemoveWidth+previewWidth)break;leftRemoveWidth+=previewWidth;leftRemoveCount++}while(true){var imageInfo=core.loader.item(elStartIndex+elCount-1-rightRemoveCount);if(!imageInfo)break;var previewWidth=imageInfo.preview.width+options.margin;if(core.previewLeft()+previewsWidth-rightRemoveWidth-previewWidth<=containerWidth)break;rightRemoveWidth+=previewWidth;rightRemoveCount++}if(imageIndex<elStartIndex){var newWidth=0,movedCount=leftCount+rightCount+1,startIndex=imageIndex+rightCount;if(startIndex>=elStartIndex){var t=startIndex-elStartIndex+1;movedCount-=t;startIndex-=t}for(var i=startIndex;i>=imageIndex-leftCount;i--){var el;if(rightRemoveCount){el=core.previewPicturesEl.find('img:last');rightRemoveCount--}else{el=$('<img />')}el.prependTo(core.previewPicturesEl);fillBlock(el,i);newWidth+=core.loader.item(i).preview.width+options.margin}core.previewLeft(core.previewLeft()-newWidth);core.eventDispatcher.dispatch('previewsUpdated',{moveX:-newWidth});core.eventDispatcher.dispatch('previewsMove',{toLeft:0,onComplete:function(){core.previewPicturesEl.find('.i_'+(imageIndex+rightCount)).nextAll('img').remove();onComplete&&onComplete()}})}else if(imageIndex>=elStartIndex+elCount){var oldWidth=0,movedCount=leftCount+rightCount+1,startIndex=imageIndex-leftCount;if(startIndex<=elStartIndex+elCount-1){var t=elStartIndex+elCount-startIndex;movedCount-=t;startIndex+=t}for(var i=startIndex;i<=imageIndex+rightCount;i++){var el;if(leftRemoveCount){el=core.previewPicturesEl.find('img:first');oldWidth+=core.loader.item(el.data('uIndex')).preview.width+options.margin;leftRemoveCount--}else{el=$('<img />')}el.appendTo(core.previewPicturesEl);fillBlock(el,i)}core.previewLeft(core.previewLeft()+oldWidth);core.eventDispatcher.dispatch('previewsUpdated',{moveX:oldWidth});var oldPreviewsWidth=core.previewPicturesEl.width();core.eventDispatcher.dispatch('previewsMove',{toLeft:containerWidth-oldPreviewsWidth,onComplete:function(){core.previewPicturesEl.find('.i_'+(imageIndex-leftCount)).prevAll('img').remove();var newPreviewsWidth=core.previewPicturesEl.width();core.previewLeft(core.previewLeft()+oldPreviewsWidth-newPreviewsWidth);core.eventDispatcher.dispatch('previewsUpdated',{moveX:oldPreviewsWidth-newPreviewsWidth});onComplete&&onComplete()}})}else{if(!core.previewPicturesEl.find('.i_'+imageIndex).length){onComplete&&onComplete();return}if(elStartIndex>imageIndex-leftCount){var movedCount=leftCount>rightRemoveCount?rightRemoveCount:leftCount;var newWidth=0;for(var i=0;i<movedCount;i++){var el=core.previewPicturesEl.find('img:last');fillBlock(el,elStartIndex-1);el.prependTo(core.previewPicturesEl);newWidth+=core.loader.item(elStartIndex-1).preview.width+options.margin;elStartIndex--}core.previewLeft(core.previewLeft()-newWidth);core.eventDispatcher.dispatch('previewsUpdated',{moveX:-newWidth})}else if(elStartIndex+elCount-1<imageIndex+rightCount){var movedCount=rightCount>leftRemoveCount?leftRemoveCount:rightCount;var oldWidth=0;for(var i=0;i<movedCount;i++){var el=core.previewPicturesEl.find('img:first');oldWidth+=core.loader.item(elStartIndex).preview.width+options.margin;fillBlock(el,elStartIndex+elCount);el.appendTo(core.previewPicturesEl);elStartIndex++}core.previewLeft(core.previewLeft()+oldWidth);core.eventDispatcher.dispatch('previewsUpdated',{moveX:oldWidth})}previewsWidth=core.previewPicturesEl.width();var pos=Math.round(containerWidth/2-core.previewPicturesEl.find('.i_'+imageIndex).position().left);if(0<pos){pos=0}else if(containerWidth-previewsWidth>pos){pos=containerWidth-previewsWidth}core.eventDispatcher.dispatch('previewsMove',{toLeft:pos,onComplete:function(){onComplete&&onComplete()}})}}};uGallery.pictures=function(core){var loaded={};core.previewContainerEl.click(onGalleryClick);core.eventDispatcher.bind('imageSelected',function(evt){setCurrent(evt.data.index)});function onGalleryClick(evt){if(core.busy()||core.animated())return;var index=$(evt.target).data('uIndex');if(undefined==index)return;if(core.loader.selectedIndex()==index)return;core.eventDispatcher.dispatch('previewClick',{current:core.loader.item(index),prev:core.loader.item(index-1),next:core.loader.item(index+1)});for(var i=index-2;i<=index+2;i++){loadImage(i)}};function loadImage(index){if(loaded[index])return false;var imageData=core.loader.item(index);if(!imageData)return false;var image=new Image();$(image).load(function(){loaded[index]=2;core.eventDispatcher.dispatch('imageLoaded',{index:index})});image.src=imageData.image.src;loaded[index]=1;return true};function isLoaded(index){return loaded[index]&&2==loaded[index]}function setCurrent(index){if(index==core.loader.selectedIndex())return false;core.loader.selectedIndex(index);core.previewContentEl.find('.selected').removeClass('selected');core.previewContentEl.find('.i_'+index).addClass('selected');for(var i=index-2;i<=index+2;i++){loadImage(i)}return true};return{loadImage:loadImage,isLoaded:isLoaded,setCurrent:setCurrent}};uGallery.previewMover=function(core,options){var defOptions={dndInertiaTime:1};options=$.extend({},defOptions,options?options:{});var stepDuration=1/30;core.eventDispatcher.bind('previewsMove',function(evt){evt.data.speed?animateAfterDnd(evt.data.speed,evt.data.onComplete?evt.data.onComplete:null):animateTo(evt.data.toLeft,evt.data.onComplete?evt.data.onComplete:null)});function animateTo(finishLeft,onComplete){var startLeft=core.previewLeft();core.animated(true);$t(core.previewContentEl,{time:0.3,transition:'easeOutQuad',moveX:function(value){core.previewLeft(startLeft+Math.round((finishLeft-startLeft)*value))},onComplete:function(){core.animated(false);onComplete&&onComplete();core.eventDispatcher.dispatch('previewsUpdate')}}).tween()};function animateAfterDnd(speed,onComplete){var elStartIndex=core.previewPicturesEl.find('img:first').data('uIndex'),elCount=core.previewPicturesEl.find('img').length,previewsWidth=core.previewPicturesEl.width(),containerWidth=core.previewContainerEl.width(),margin=(0<speed&&(core.loader.first()<elStartIndex||!core.loader.isLeftBorder()))||(0>speed&&(core.loader.first()+core.loader.count()-1>elStartIndex+elCount||!core.loader.isRightBorder()))?core.preloaderWidth:0,maxDistance=0<speed?Math.abs(core.previewLeft())+margin:Math.abs(containerWidth-previewsWidth-core.previewLeft())+margin,distance=Math.abs(speed*options.dndInertiaTime/(stepDuration/options.dndInertiaTime-2)),startLeft=core.previewLeft(),finishLeft;core.animated(true);if(distance<maxDistance){finishLeft=0<speed?core.previewLeft()+distance:core.previewLeft()-distance;$t(core.previewContentEl,{time:options.dndInertiaTime,transition:'easeOutQuad',moveX:function(value){core.previewLeft(startLeft+Math.round((finishLeft-startLeft)*value))},onComplete:function(){core.animated(false);onComplete&&onComplete();core.eventDispatcher.dispatch('previewsUpdate')}}).tween();return}var s=2<Math.abs(speed)/3000?2:Math.abs(speed)/3000,time=stepDuration/(uGallery.cubic(s/(s+1),0,(1-Math.abs(speed)*stepDuration/maxDistance)/(s+1)).x[0]+1),transition=function(t,b,c,d){return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b};finishLeft=0<speed?core.previewLeft()+maxDistance:core.previewLeft()-maxDistance;$t(core.previewContentEl,{time:time,transition:transition,moveX:function(value){core.previewLeft(startLeft+Math.round((finishLeft-startLeft)*value))},onComplete:function(){core.animated(false);core.eventDispatcher.dispatch('previewsUpdate')}}).tween()}};uGallery.previewArrowScrolling=function(core,options){var defOptions={animateStep:50};options=$.extend({},defOptions,options);var prevEl=core.previewEl.find('.prev'),nextEl=core.previewEl.find('.next'),timeoutId;prevEl.mousedown(function(){startAnimate(true)});nextEl.mousedown(function(){startAnimate(false)});core.eventDispatcher.bind('previewsUpdated',updateState);function startAnimate(isPrev){if(core.busy())return;if(isPrev&&0<=core.previewLeft())return;if(!isPrev&&core.previewLeft()+core.previewPicturesEl.width()<=core.previewContainerEl.width())return;jTweener.removeTween(core.previewContentEl);var onMouseUp=function(){clearTimeout(timeoutId)};isPrev?prevEl.one('mouseup',onMouseUp):nextEl.one('mouseup',onMouseUp);animate(isPrev)};function animate(isPrev){core.previewLeft(isPrev?core.previewLeft()+options.animateStep:core.previewLeft()-options.animateStep);timeoutId=setTimeout(function(){animate(isPrev)},Math.round(1000/15));core.eventDispatcher.dispatch('previewsUpdate');updateState()};function updateState(){var previewsWidth=core.previewPicturesEl.width();var containerWidth=core.previewContainerEl.width();0<=core.previewLeft()?prevEl.addClass('disabled'):prevEl.removeClass('disabled');core.previewLeft()+previewsWidth<=containerWidth?nextEl.addClass('disabled'):nextEl.removeClass('disabled')};return{updateState:updateState}};uGallery.previewDnd=function(core,options){options=$.extend({},{dndDuration:100},options?options:{});var isDndMove=false,dndDots=[],dndLeft;core.previewContentEl.mousedown(startDnd);function startDnd(evt){evt.preventDefault();evt.stopPropagation();if(core.busy())return;if(core.previewPicturesEl.width()<core.previewContainerEl.width())return;jTweener.removeTween(core.previewContentEl);core.animated(false);core.eventDispatcher.dispatch('previewsUpdate');dndLeft=parseInt(evt.pageX);isDndMove=false;$(document).mousemove(dnd).mouseup(stopDnd)};function dnd(evt){evt.preventDefault();evt.stopPropagation();isDndMove=true;var newLeftPos=core.previewLeft();newLeftPos+=parseInt(evt.pageX)-dndLeft;dndLeft=parseInt(evt.pageX);dndDots.push({x:newLeftPos,time:uGallery.getTime()});core.previewLeft(newLeftPos)};function stopDnd(evt){evt.preventDefault();evt.stopPropagation();$(document).unbind('mousemove',dnd).unbind('mouseup',stopDnd);if(!isDndMove)return;if(core.busy())return;var previewsWidth=core.previewPicturesEl.width();var containerWidth=core.previewContainerEl.width();if(previewsWidth<containerWidth)return;if(0<core.previewLeft()||core.previewLeft()<containerWidth-previewsWidth){core.eventDispatcher.dispatch('previewsMove',{toLeft:core.previewLeft()<containerWidth-previewsWidth?containerWidth-previewsWidth:0});return}var now=uGallery.getTime(),distance=0,fromTime,counter=3;for(var i=dndDots.length-1;i>=0;i--){if(dndDots[i].time+options.dndDuration<now&&0>=counter)break;distance=core.previewLeft()-dndDots[i].x;fromTime=dndDots[i].time;counter--}dndDots=[];var speed=distance?Math.round(distance/(now-fromTime)*1000/1.5):0;speed?core.eventDispatcher.dispatch('previewsMove',{speed:speed}):core.eventDispatcher.dispatch('previewsUpdate')};function onMouseUp(evt){evt.preventDefault();evt.stopPropagation();core.previewContentEl.unbind('mouseup',onMouseUp)}};uGallery.previewRunner=function(core){var runnerEl=core.previewContentEl.find('.selected_runner'),leftEl=core.previewEl.find('.selected_left'),rightEl=core.previewEl.find('.selected_right');leftEl.click(changeSelected);rightEl.click(changeSelected);core.eventDispatcher.bind('imageSelected',function(evt){moveToImage(evt.data.index)});core.eventDispatcher.bind('previewsUpdated',function(evt){setPos(runnerEl.position().left-evt.data.moveX)});function moveToImage(index){var imageInfo=core.previewPicturesEl.find('.i_'+index);if(!imageInfo.length)return false;setPos(Math.round(imageInfo.position().left),core.loader.item(index).preview.width,core.loader.item(index).preview.height);return true};function setPos(left,width,height){runnerEl.css('left',left);runnerEl.css('width',width-4);runnerEl.css('height',height-4);var pos=runnerEl.offset().left-core.previewContainerEl.offset().left;0>pos?leftEl.removeClass('hidden'):leftEl.addClass('hidden');pos>core.previewContainerEl.width()?rightEl.removeClass('hidden'):rightEl.addClass('hidden')};function changeSelected(){if(core.busy())return false;core.eventDispatcher.dispatch('imageSelect',{index:core.loader.selectedIndex(),imageInfo:core.loader.selected()});return true};return{changeSelected:changeSelected,moveToImage:moveToImage,setPos:setPos}};uGallery.previewPreloader=function(core){var preloaderEls=core.previewContentEl.find('.preloader');core.eventDispatcher.bind('previewsUpdated',updateStates);function updateStates(){var elStartIndex=core.previewPicturesEl.find('img:first').data('uIndex'),elCount=core.previewPicturesEl.find('img').length,value;value=core.loader.isLeftBorder&&elStartIndex==core.loader.first()?'hidden':'visible';preloaderEls.eq(0).css('visibility',value);value=core.loader.isRightBorder&&elStartIndex+elCount==core.loader.first()+core.loader.count()?'hidden':'visible';preloaderEls.eq(1).css('visibility',value)};return{updateStates:updateStates}};uGallery.history=function(core,options){options=$.extend({},{anchorPrefix:'image_',firstId:null},options);var curId=null,busyTimeoutId,checkTimeoutId;check();core.eventDispatcher.bind('imageSelected',function(evt){change(evt.data.index)});core.eventDispatcher.bind('pause',function(){clearTimeout(checkTimeoutId)});core.eventDispatcher.bind('resume',check);function check(){var list=window.location.href.split('#');var newId=options.firstId;if(list[1]&&options.anchorPrefix==list[1].substr(0,options.anchorPrefix.length)){var newIdStr=list[1].substr(options.anchorPrefix.length);newId=parseInt(newIdStr,10);if(!(newIdStr==newId&&0<newId)){newId=options.firstId}}if(null===curId){curId=newId}else if(curId!=newId){var index=core.loader.indexById(newId);false===index||dispatchEventClick(index);curId=newId}checkTimeoutId=setTimeout(check,300)};function change(index){clearTimeout(busyTimeoutId);var newId=core.loader.item(index).id;if(newId!=curId){curId=newId;window.location.href=window.location.href.split('#')[0]+'#'+options.anchorPrefix+curId}};function dispatchEventClick(index){clearTimeout(busyTimeoutId);if(core.busy()||core.animated()){busyTimeoutId=setTimeout(function(){dispatchEventClick(index)},200)}else{core.eventDispatcher.dispatch('previewClick',{current:core.loader.item(index),prev:core.loader.item(index-1),next:core.loader.item(index+1)})}};return{getId:function(){return curId}}};uGallery.getXml=function(text){var xmlData=null;try{if(window.ActiveXObject){xmlData=new ActiveXObject('Microsoft.XMLDOM');xmlData.async=false;xmlData.loadXML(text)}else if(window.DOMParser){var xmlData=(new DOMParser()).parseFromString(text,'text/xml')}if(!xmlData||!xmlData.documentElement||'parsererror'==xmlData.documentElement.nodeName||xmlData.getElementsByTagName('parsererror').length){return false}}catch(error){return false}return xmlData};uGallery.loadImage=function(src,onLoad){var image=new Image();image.onload=function(){onLoad&&onLoad()};image.src=src};uGallery.cubic=function(a,b,c){var q=(a*a-3*b)/9,r=(a*(2*a*a-9*b)+27*c)/54,q3=q*q*q;if(r*r<q3){var t=Math.acos(r/Math.sqrt(q3));a/=3;q=-2*Math.sqrt(q);return{type:3,x:[q*Math.cos(t/3)-a,q*Math.cos((t+2*Math.PI)/3)-a,q*Math.cos((t-2*Math.PI)/3)-a]}}r=Math.abs(r);var aa=-Math.pow(r+Math.sqrt(r*r-q3),1/3);var bb=0==aa?0:q/aa;a/=3;q=aa+bb;r=Math.abs(aa-bb);var x=[q-a,-0.5*q-a,(Math.sqrt(3)*0.5)*r];return{type:0==x[2]?2:1,x:x}};uGallery.getTime=function(){return new Date().getTime()};uGallery.eventDispatcher=(function(){function EventDispatcher(){var listenerChain={};var onlyOnceChain={};function bind(type,listener,onlyOnce){if(!listener instanceof Function){throw new Error("Listener isn't a function");}var chain=onlyOnce?onlyOnceChain:listenerChain;type='string'==typeof(type)?type.split(' '):type;for(var i=0;i<type.length;i++){if(!chain[type[i]]){chain[type[i]]=[listener]}else{chain[type[i]].push(listener)}}};function hasBinds(type){return('undefined'!=typeof listenerChain[type]||'undefined'!=typeof onlyOnceChain[type])};function unbind(type,listener){if(!hasBinds(type))return false;var chains=[listenerChain,onlyOnceChain];for(var i=0;i<chains.length;i++){var lst=chains[i][type];for(var j=0;j<lst.length;j++){lst[j]==listener&&lst.splice(j,1)}}return true};function dispatch(type,args){if(!hasBinds(type))return false;var chains=[listenerChain,onlyOnceChain],evt=new CustomEvent(type,this,args);for(var j=0;j<chains.length;j++){var lst=chains[j][type];if(lst){for(var i=0,il=lst.length;i<il;i++){lst[i](evt)}}}if(onlyOnceChain[type]){delete onlyOnceChain[type]}return true};return{bind:bind,hasBinds:hasBinds,unbind:unbind,dispatch:dispatch}}function CustomEvent(type,target,data){this.type=type;this.target=target;if(data){this.data=data}};return function(){return new EventDispatcher()}})();





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
	
	var imageId_fromHash = window.location.hash.slice(1).match(/^image\-(\d+)$/);
	
	if (imageId_fromHash != null) {
		imageId = imageId_fromHash[1] || 1;
		if (imageId > data.length) imageId = 1;
	}
	
	uGallery.state(core, imageId, {
		maxHeight: 55,
		maxWidth: 75,
		margin: 10,
		screens: 0
	});


	core.eventDispatcher.bind('previewClick', function(evt) {
		window.location.hash = "#image-" + (evt.data.current.index + 1)
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
