var ColorTheme=ColorTheme||function(a,b,c){this.j=c;this.initTheme=function(a){this.colorName=a;switch(a){case "purple":this.color="#74005d";break;case "red1":this.color="#802016";break;case "brown":this.color="#9f6d37";break;case "dark_blue":this.color="#41007f";break;case "orange":this.color="#e76600";break;case "red2":this.color="#7f002d";break;case "blue":this.color="#35a2c3";break;case "yellow":this.color="#f0a900";break;case "violet":this.color="#6202b4";break;case "light_blue":this.color="#01b6dc";
break;case "green":this.color="#708f2b";break;case "crimson":this.color="#cd003a";break;default:this.color="#35a2c3"}};this.root=a;this.initTheme(b);this.j("<link>",{id:"eway_widget_color_theme",rel:"stylesheet",type:"text/css",href:this.root+"/css/theme_"+this.colorName+".css?1"}).appendTo("body")};ColorTheme.prototype.setColorTheme=function(a){this.initTheme(a);this.j("#eway_widget_color_theme").attr("href",this.root+"/css/theme_"+this.colorName+".css")};ColorTheme.prototype.getColorName=function(){return this.colorName};
ColorTheme.prototype.getColor=function(){return this.color};
