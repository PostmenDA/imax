var isFocus = false;



var global = this;
this.curElemName = 0;
this.startDate = 0;
this.endDate = 0;
var timeSelectedFrom = 0;
var timeSelectedTill = 9999999999999999;
// путь к картинкам
var imagesFolder = '/f/1/global/i/';

// имена месяцев и т.п.
var calendarNamesHash = new Array();

calendarNamesHash.ua = new Array();
calendarNamesHash.ru = new Array();
calendarNamesHash.en = new Array();


calendarNamesHash.ua.month = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];
calendarNamesHash.ua.monthShort = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'сер', 'лип', 'вер', 'жов', 'лис', 'гру'];
calendarNamesHash.ua.weekday = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];
calendarNamesHash.ua.today= 'сегодня';
calendarNamesHash.ru.month = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
calendarNamesHash.ru.monthShort = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
calendarNamesHash.ru.weekday = ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'];
calendarNamesHash.ru.today= 'сегодня';
calendarNamesHash.en.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
calendarNamesHash.en.monthShort = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
calendarNamesHash.en.weekday = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
calendarNamesHash.en.today= 'today';

var calendarNames;


// функция инициализации

function calendar(name, value, options) {
	calendarNames = calendarNamesHash[language];
	
//	$("input[name*="+name+"]").attr('name','nevermind');
	writeInFields(name,value,options);
	updateCalendar(name);
}

// служебные функции

function zeroFill(value){
	return (value<10 ? '0':'')+value;
}

function date2string(date){
	return date.getDate() + ' ' + calendarNames.monthShort[date.getMonth()] + ' ' + date.getFullYear();
}

function date2value(date,forCalc){
	if(forCalc){
		return date.getFullYear()+'-'+zeroFill(date.getMonth()+1)+'-'+zeroFill(date.getDate());
	} else {
		if (date == null){
			return '';
		}
		else {
			return date.getFullYear()+'-'+zeroFill(date.getMonth()+1)+'-'+zeroFill(date.getDate())+' '+ 
					      zeroFill(date.getHours())+':'+zeroFill(date.getMinutes())+':00';
			 }
	}
	
}

function value2date(value){
	if (value && value != '0000-00-00 00:00:00'){
	        var re = /(\d+)-(\d+)-(\d+)\s+(\d+):(\d+):(\d+)/i;
		var date = re.exec(value);
		if (date) return(new Date(date[1],date[2]-1,date[3],date[4],date[5],date[6]));
	}
        return null;
}

// интерфейсные функции

function updateCalendar(name){
	var date = getCalendarDateUnchecked(name);

	var dateInput = document.getElementsByName(name + 'Input')[0];
	var hoursInput = document.getElementsByName(name + 'Hours')[0];
	var minutesInput = document.getElementsByName(name + 'Minutes')[0];

	if (dateInput) dateInput.value = date ? date2string(date) : '';
	if (hoursInput) hoursInput.value = date ? date.getHours() : '';
	if (minutesInput) minutesInput.value = date ? zeroFill(date.getMinutes()) : '';
}

function getCalendarDateUnchecked(name) {
        var hiddenValue = document.getElementsByName(name)[0];
	return hiddenValue ? value2date(hiddenValue.value) : null;
}

function getCalendarDate(name) {
        var date=getCalendarDateUnchecked(name);
	return date ? date : new Date();
}

function putCalendarDate(name, date) {
	var hiddenValue = document.getElementsByName(name)[0];
	if (hiddenValue){ 
		hiddenValue.value = date2value(date);
		updateCalendar(name);
	}
}

function putCalendarValue(name,value){
	var hiddenValue = document.getElementsByName(name)[0];
	if (hiddenValue){
		hiddenValue.value = value;
		updateCalendar(name);
	}
}

function calendarCallback(name, date, mode){
}
var gFrom = '';
	var gTo = '';
function changeCalendarDate(name, date, mode){
	var current=getCalendarDate(name);
	
	if(name=='start' && date!=null){
		gFrom = date2value(date,'forCalc');
	}
	if(name=='end' && date!=null){
		gTo = date2value(date,'forCalc');
	}

	
	putCalendarDate(name,date);

	if (date2value(date) != date2value(current)){
		calendarCallback(name, date, mode);
	}
	
}

//
//  служебные функции, вычисления, HTML и т.д.
//

var closeCalendarTimeOut = 0;

// все-таки придется где-нибудь хранить какой именно календарик открыть (его имя)
var activeCalendarName = '';

// функция вызывается при клике на дату в календаре


function setDateFromCalendar(dayToSet, monthToSet, yearToSet) {
	if(global.curElemName!=0){
		if(global.curElemName=='start'){
			timeSelectedFrom = (new Date(yearToSet, monthToSet-1, dayToSet)).getTime();
		} else {
			timeSelectedTill = (new Date(yearToSet, monthToSet-1, dayToSet)).getTime();
		}
	}
	var dateToSet = getCalendarDate(activeCalendarName);
	
	dateToSet.setFullYear(yearToSet);
	dateToSet.setDate(1);
	dateToSet.setMonth(monthToSet);
	dateToSet.setDate(dayToSet);
	
	// закрываем календарь
	hideCalendar();
	
	changeCalendarDate(activeCalendarName, dateToSet, 'date');
	
}

function setTodayFromCalendar() {
	var date=new Date();
	setDateFromCalendar(date.getDate(),date.getMonth(),date.getFullYear());
}

function getCalendarTimeFromString(fieldName) {
	var hoursInput = document.getElementsByName(fieldName + 'Hours')[0];
	var minutesInput = document.getElementsByName(fieldName + 'Minutes')[0];

	if (hoursInput && minutesInput){
		var newDate = getCalendarDate(fieldName);
		var thisHour=parseInt(hoursInput.value);
		var thisMinutes=parseInt(minutesInput.value);
		if (!isNaN(thisHour)) newDate.setHours(thisHour);
		if (!isNaN(thisMinutes)) newDate.setMinutes(thisMinutes);
		changeCalendarDate(fieldName, newDate, 'time');
	}
}

function getCalendarDateFromString(fieldName) {
	var dateInput = document.getElementsByName(fieldName + 'Input')[0];
	
	var re = /^\s*(\d+)[\s|\/|.]+([^\s]+)[\s|\/|.]+(\d+)\s*$/i;
	
	var results = re.exec(dateInput.value);
	
	if (results){
		// если небыло ошибки регекспа
		
		var newDate = getCalendarDate(fieldName);
		// определяем год
		var newYear = parseInt(results[3],10);
		if (newYear < 30) newYear += 2000;
			else if (newYear < 100) newYear += 1900;
				else if (newYear < 1930) newYear += 2000;
				// что при последнем может получиться - никто не знает
		newDate.setFullYear(newYear);
		newDate.setDate(1);

		if (isNaN(parseInt(results[2],10))) {
			var monthStr = results[2].toLowerCase();
			// в качестве месяца - строка
			// 
			for (var i = 0; i < 12; i++) {
				if (
					monthStr.indexOf(calendarNamesHash.ru.monthShort[i].toLowerCase()) == 0 ||
					// calendarNamesHash.ru.monthShort[i].toLowerCase().indexOf(monthStr) == 0 ||
					// calendarNamesHash.en.month[i].toLowerCase().indexOf(monthStr) == 0 ||
					monthStr.indexOf(calendarNamesHash.en.monthShort[i].toLowerCase()) == 0
					// calendarNamesHash.en.monthShort[i].toLowerCase().indexOf(monthStr) == 0
				) {
					newDate.setMonth(i);
					break;
				}
			}
		} else {
			// пришло число в качестве месяца
			// если нужно проверять не на американский манер
			// ли была передана дата, то это здесь
			newDate.setMonth(parseInt(results[2],10) - 1);
		}
		newDate.setDate(parseInt(results[1]));
		changeCalendarDate(fieldName, newDate, 'date');
	} else if(dateInput.value == '-' || dateInput.value == '') {
		// пустая дата
		changeCalendarDate(fieldName, null, 'date');
	} else {
		// если по какой-то причине регексп не сработал
		//alert('Не понял, что это за дата такая, возвращаю старую...');
	    //updateCalendar(fieldName);
	    $("input[name*="+fieldName+"]").attr('value',$(dateInput).attr('value'));

	}
}

// внешний вид и поведение

var pixelSpacer = '<div style="width: 1px; height: 1px;"><spacer type="block" width="1" height="1" /><\/div>';

function writeInFields(name, value, options) {
	// Вставляет HTML-код с необходимыми полями...
	
	
	document.write('<input type="hidden" name="' + name + '" value="' + value + '" />');
	document.write('<table cellpadding="0" cellspacing="0" border="0"><tr>');
	document.write('<td><input type="text" name="' + name + 'Input" size="12" onBlur="getCalendarDateFromString(\'' + name + '\');" /><\/td>');
	document.write('<td><button tabindex="1" class="calBtn" name="' + name + 'Btn" onClick="showCalendarForElement(\'' + name + '\', event, this); return false;">');
	document.write('&nbsp;<img src="' + imagesFolder + 'dayselect.gif" width="24" height="10" />&nbsp;<\/button><\/td>');
	document.write('<td>' + pixelSpacer + '<\/td>');
	if (options == 1) {
		document.write('<td valign="middle">&nbsp;&nbsp;<\/td>');
		document.write('<td><input type="text" name="' + name + 'Hours" size="3" onBlur="getCalendarTimeFromString(\'' + name + '\');" style="text-align: right;" /><\/td>');
		document.write('<td valign="middle"><small>&nbsp;:&nbsp;<\/small><\/td>');
		document.write('<td><input type="text" name="' + name + 'Minutes" size="3" onBlur="getCalendarTimeFromString(\'' + name + '\');" /><\/td>');
		document.write('<td valign="middle">&nbsp;&nbsp;<\/td>');
	}
	document.write('<\/tr><tr><td colspan="2">' + pixelSpacer + '<\/td>');
	document.write('<td><div id="' + name + 'Ptr" style="width: 1px; height: 1px;"><spacer type="block" width="1" height="1" /><\/div><\/td><\/tr>');
	document.write('<\/table>');
	
	global.startDate = $("input[name*=startInput]");
	global.endDate = $("input[name*=endInput]");
}

function showCalendarForElement(elemName, evt, thatsButton) {
	var calHolder = $("")
//	var calPtr = document.getElementById(elemName + 'Ptr');
//	if (calPtr) {
		// показывает календарь в слое (создает слой, если необходимо)
		var calLayer = document.getElementById('calendarLayer');
		if (!calLayer) {
			calLayer = document.createElement('div');
			calLayer.id = 'calendarLayer';
			
			$(calLayer).addClass('hidden');

			$("#" + elemName).append($(calLayer));
			
		}
		// проверяем показан ли слой, если да - скрываем
		if (calLayer.style.visibility == 'visible' && activeCalendarName == elemName) {
			calLayer.style.visibility = 'hidden';
		} else {
			activeCalendarName = elemName;
			// скрываем слой
			calLayer.style.visibility = 'hidden';
			// вычисляем где именно должен быть этот календарь.
			var calPosition = $(thatsButton).offset();
			//var calPosition = new getElementPosition(thatsButton);
			// заполняем нужным кодом...
			// смотрим какая дата нас интересует
			var currDate = getCalendarDate(elemName);

			var eCalendarBg = document.createElement('img');
			$(calLayer).addClass("bg-not-loaded");
			eCalendarBg.onload = function(){
				//document.title = 'ok'
				$(calLayer).removeClass("bg-not-loaded");
				
			};
			// eCalendarBg.src = $(".calendar" , calLayer).css("backgroundImage").match(/url\("?(.+)"?\)/i)[1];
			eCalendarBg.src = $(".calendar" , calLayer).css("backgroundImage").replace(/url\(|\)|"/ig, "");

			
			// собственно вызываем код
			calLayer.innerHTML = calendarHTML(currDate.getMonth(), currDate.getFullYear(), currDate, elemName);


			// ставим слой на место
//			$(calLayer).css(
//					'left',
//					calPosition.left - 20 + thatsButton.offsetWidth / 2 - calLayer.offsetWidth / 2
//			);
//			$(calLayer).css('top', $(thatsButton).position().top + $(thatsButton).offsetParent().offset().top - $(calLayer).offsetParent().offset().top);

			calLayer.style.visibility = 'visible';
			//$("td a", calLayer).css("z-index", 100)
			
			// наконец, прекращаем баблинг (может, кто-то открыл без event'а)
			if (evt) evt.cancelBubble = true;
			// и ставим свой обработчик на клик на календаре (чтобы не скрывался)
			addEvent(calLayer, 'click', calendarClick);
			// и на mouseout (чтобы скрывался, но через некоторое время ;-)
			addEvent(calLayer, 'mouseover', calendarMouseOver);
			addEvent(calLayer, 'mouseout', calendarMouseOut);
		}
//	}
}

function calendarClick(e) {
	evt = (e)? e : window.event;
	evt.cancelBubble = true;
}

function calendarMouseOver(e) {
	if (closeCalendarTimeOut) {
		clearTimeout(closeCalendarTimeOut);
		closeCalendarTimeOut = 0;
	}
}

function calendarMouseOut(e) {
	if (closeCalendarTimeOut) {
		clearTimeout(closeCalendarTimeOut);
	}
	closeCalendarTimeOut = setTimeout('hideCalendar()', 5000);
}

function hideCalendar() {
	var calLayer = document.getElementById('calendarLayer');
	if (calLayer) calLayer.style.visibility = 'hidden';
	closeCalendarTimeOut = 0;
}


function switchMonthTo(month, year) {
	var calLayer = document.getElementById('calendarLayer');
	if (calLayer) {
		// заполняем нужным кодом...
		// смотрим какая дата нас интересует
		var currDate = getCalendarDate(activeCalendarName);
		// собственно вызываем код
		calLayer.innerHTML = calendarHTML(month, year, currDate, global.curElemName);
	}
}

function calendarHTML(month, year, currDate, curElemName) {
	global.curElemName = curElemName;
	//window.console.log('in', global.curElemName);
	// смотрим этот ли месяц показываем
	var isThisMonth = (currDate)? (currDate.getMonth() == month && currDate.getFullYear() == year) : false;
	
	// генерирует html-код для указанного месяца
	
	// устанавливаем месяц, который будем рисовать
	var drawMonth = new Date(); drawMonth.setMonth(month, 1); drawMonth.setYear(year); drawMonth.setDate(1);
	
	// переменные для кнопок навигации по месяцам/годам
	var thisMonth = drawMonth.getMonth();
	var nextMonth = (thisMonth == 11)? 0 : thisMonth + 1;
	var prevMonth = (thisMonth == 0)? 11 : thisMonth - 1;
	var thisYear = drawMonth.getFullYear();
	var nextMonthYear = (thisMonth == 11)? thisYear + 1 : thisYear;
	var nextYear = thisYear + 1;
	var prevMonthYear = (thisMonth == 0)? thisYear - 1 : thisYear;
	var prevYear = thisYear - 1;
	// запихиваем в строку весь код - открываем таблицы...
	var calendarCode = '<div class="calendar"><table>';
	calendarCode += '<tr><td><table class="year-month">';
		// здесь указываем клик на прошлый год
		//calendarCode += '<tr class="year"><td class="arrow prev"><span class="d-cn" onclick="switchMonthTo(' + thisMonth + ', ' + prevYear + ')"></span><\/td>';
		// текущий (показываемый) год
		//calendarCode += '<td class="caption">' + thisYear + '<\/td>';
		// клик на следующий год
		//calendarCode += '<td class="arrow next"><span class="d-cn" onclick="switchMonthTo(' + thisMonth + ', ' + nextYear + ')"></span><\/td><\/tr>';
	// клик на предыдущий месяц
	calendarCode += '<tr class="month"><td class="arrow prev"><span class="d-cn" onclick="switchMonthTo(' + prevMonth + ', ' + prevMonthYear + ')" onmouseover="this.className = \'d-cn hover\'" onmouseout="this.className = \'d-cn\'"></span><\/td>';
	// текущий месяц
	calendarCode += '<td class="caption">' + calendarNames.month[thisMonth] + ', ' + thisYear + '<\/td>';
	// клик на следующий месяц
	calendarCode += '<td class="arrow next"><span class="d-cn" onclick="switchMonthTo(' + nextMonth + ', ' + nextMonthYear + ')"></span><\/td><\/tr>';
	calendarCode += '<\/table><\/td><\/tr>';
	
	
	// дни недели
	calendarCode += '<tr><td><table class="day-names"><tr>';
	for (var i = 0; i < calendarNames.weekday.length; i++) {
		var styleClass = "day-name";
		switch(i){
			case 0: styleClass = "day-name monday"; break;
			case 6: styleClass = "day-name sunday"; break;
		}
		calendarCode += '<td class="' + styleClass + '">' + calendarNames.weekday[i] + '</td>';
	}
	
	calendarCode += '</tr></table>';
	calendarCode += '<div class="b"></div>';
	
	
	// начинаем таблицу самого месяца
	calendarCode += '<table class="month-calendar"><tr>';

	// рисуем пустые ячейки если нужно...
	var daysToStart = (drawMonth.getDay() == 0)? 7 : drawMonth.getDay();
	for (var i = 0; i < daysToStart - 1; i++) calendarCode += '<td class="day"><br /><\/td>';
	
	// собственно циферки
	//window.console.log(curElemName,'==',timeSelectedFrom,' to',timeSelectedTill,'==',(new Date(year, month-1, i)).getTime()-timeSelectedTill)
	//window.console.log((new Date()).getFullYear(), thisYear);
	var nowMonth = (new Date()).getMonth();
	var nowYear = (new Date()).getFullYear();
	for (var i = 1; i < 32; i++) {
		
		drawMonth.setDate(i);
		var nowTime = (new Date(year, month-1, i)).getTime();
		
		if (( nowMonth == thisMonth && nowYear == thisYear && i < (new Date()).getUTCDate() ) || (( nowMonth > thisMonth) && nowYear == thisYear ) || (nowYear > thisYear) || ( curElemName != 0 ? (curElemName == 'start' ? (timeSelectedTill < nowTime ) : (timeSelectedFrom > nowTime ) )  : '' )) {
			calendarCode += '<td class="day empty' + ((drawMonth.getDay() == 0 || drawMonth.getDay() == 6) ? '-weekend' : '') + '">' + i + '<\/td>'
		} else {
			if (drawMonth.getMonth() == thisMonth) {
				var styleClass = (drawMonth.getDay() == 0 || drawMonth.getDay() == 6) ? 'day weekend' :  (drawMonth.getDay() == 1) ? 'day monday' : 'day normal';
				//calendarCode += '<td class="' + styleClass + '"  onMouseOver="this.className = \'' + styleClass + ' h_over\';" onMouseOut="this.className = \'' + styleClass + '\';" onClick="setDateFromCalendar(' + i + ', ' + month + ', ' + year + ');">' + '<a href="' + showtimesRoot + year + '-' + zeroFill(month + 1) + '-' + zeroFill(i) + '/">' + i + '<ins class="d-cn"></ins></a>' + '<\/td>';
				calendarCode += '<td class="' + styleClass + '" onClick="setDateFromCalendar(' + i + ', ' + month + ', ' + year + ');">' + '<a href="' + showtimesRoot + year + '-' + zeroFill(month + 1) + '-' + zeroFill(i) + '/#one-day">' + i + '<ins class="d-cn"></ins></a>' + '<\/td>';
			} else break;
		}
			if (drawMonth.getDay() == 0) calendarCode += '<\/tr><tr>';
	}
	
	// опять рисуем пустые ячейки
	if (drawMonth.getDay() != 1) {
		var daysToEnd = 8 - ((drawMonth.getDay() == 0)? 7 : drawMonth.getDay());
		for (var i = 0; i < daysToEnd-1; i++) calendarCode += '<td class="day empty"><br /><\/td>';
	}
	calendarCode += '<\/tr><\/table><\/td><\/tr>';

	// ссылка на сегодня
	// calendarCode += '<tr><td class="whiteCell today" onMouseOver="this.className = \'overCell today\';" onMouseOut="this.className = \'whiteCell today\';" style="border-top: 1px solid #000000; padding: 3px; cursor: pointer; cursor: hand;" align="center" onClick="setTodayFromCalendar();">'+calendarNames.today+'<\/td><\/tr>';

	// конец
	calendarCode += '<\/table>';
	
	calendarCode += '</div>';

	return calendarCode;
}

function getElementPosition(thatsButton) {
	var posX = $(thatsButton).parent()[0].offsetLeft;
	var posY = $(thatsButton).parent()[0].offsetTop;
	
	alert(posX + ' ' + posY);
	
	this.x = posX;
	this.y = posY;
	return this;
}

function addEvent(elementPtr, eventType, eventFunc) {
	if (elementPtr.addEventListener) {
		elementPtr.addEventListener(eventType, eventFunc, false);
	} if (elementPtr.attachEvent) {
		elementPtr.attachEvent('on' + eventType, eventFunc);
	} else {
		// что делать если ни то ни другое не поддерживается
	}
}

addEvent(document, 'click', hideCalendar);
addEvent(window, 'resize', hideCalendar);

