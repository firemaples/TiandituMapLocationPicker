var map,zoom=18;
var mapclick, mapDbClick, mapmousemove; 
var latLngStr, centerStr;
var marker;
var openGoogleMapText;
var tv_mapTypeText;

var polygonCreating = false;
var currentPointCount = 0;
var currentPoints = [];
var currentPolygon;

$(function(){
    $.material.init();
    // $().dropdown({autoinit: "select"});
    // $(".select").dropdown({"optionClass": "withripple", "dropdownClass": "form-control"});
    
	latLngStr = $("#latLngStr");
	centerStr = $("#centerStr");
	openGoogleMapText = $("#openGoogleMapText");
	tv_mapTypeText = $("#tv_mapTypeText");
	//初始化地图对象 
   	map=new TMap("mapDiv"); 
   	//设置显示地图的中心点和级别 
	setCenterStr(24.56907,118.10037);
	//map.centerAndZoom(new TLngLat(118.10037,24.56907),zoom); 
	//允许鼠标滚轮缩放地图 
	map.enableHandleMouseScroll(); 

	mapclick = TEvent.addListener(map, "click", onMapClick);
	//移除地图的点击事件 
// 	TEvent.removeListener(mapclick); 
    mapDbClick = TEvent.addListener(map,"dblclick",onMapDbClick);
    mapmousemove = TEvent.addListener(map,"mousemove",onMapMouseMove);
    
    


	$("#newPolygon").click(function(){
		clearPoints();
		$("#div_createPolygon").addClass("hidden");
		$("#div_polygonCreating").removeClass("hidden");
	    polygonCreating = true;
	});
	
	$("#clearPolygon").click(function(){
		clearPoints();
	    polygonCreating = false;
	});
	
	$("#cancelPolygon").click(function(){
		clearPoints();
		$("#div_createPolygon").removeClass("hidden");
		$("#div_polygonCreating").addClass("hidden");
	    polygonCreating = false;
	});

	$("#changeCenter").click(function(){
		var latLng = centerStr.val().split(',');
		setCenterStr(latLng[0].trim(),latLng[1].trim());
	});
	
// 	$('input:radio[name="mapType"]').change(
//     function(){
//         if (this.checked) {
//             onMapTypeChange(this.value);
//         }
//     });

	var config = { 
		type:"TMAP_NAVIGATION_CONTROL_LARGE",	//缩放平移的显示类型 
		anchor:"TMAP_ANCHOR_TOP_LEFT",			//缩放平移控件显示的位置 
		offset:[0,0],							//缩放平移控件的偏移值 
		showZoomInfo:true						//是否显示级别提示信息，true表示显示，false表示隐藏。 
	}; 

	//创建缩放平移控件对象 
	control=new TNavigationControl(config); 
	//添加缩放平移控件 
	map.addControl(control);

	//创建比例尺控件对象
    var scale = new TScaleControl();
    //添加比例尺控件
    map.addControl(scale);

	var config = { 
		anchor: "TMAP_ANCHOR_BOTTOM_RIGHT",	//设置鹰眼位置,"TMAP_ANCHOR_TOP_LEFT"表示左上，"TMAP_ANCHOR_TOP_RIGHT"表示右上，"TMAP_ANCHOR_BOTTOM_LEFT"表示左下，"TMAP_ANCHOR_BOTTOM_RIGHT"表示右下，"TMAP_ANCHOR_LEFT"表示左边，"TMAP_ANCHOR_TOP"表示上边，"TMAP_ANCHOR_RIGHT"表示右边，"TMAP_ANCHOR_BOTTOM"表示下边，"TMAP_ANCHOR_OFFSET"表示自定义位置,默认值为"TMAP_ANCHOR_BOTTOM_RIGHT" 
		size  : new TSize(180,120),			//鹰眼显示的大小 
		isOpen : true						//鹰眼是否打开，true表示打开，false表示关闭，默认为关闭 
	}; 
	//创建鹰眼控件对象 
	overviewMap = new TOverviewMapControl(config); 
	//添加鹰眼控件 
    map.addControl(overviewMap); 

	//创建地图类型控件对象
	//var control = new TMapTypeControl();
	//将地图类型控件添加到地图上
	//map.addControl(control);
})

function clearPoints(){
	latLngStr.val("");
	currentPoints = [];
	currentPointCount = 0;
	if(currentPolygon!=null){
	    map.removeOverLay(currentPolygon);
	    currentPolygon = null;
	}
}

function onMapClick(p){
    if(polygonCreating){
    	//将像素坐标转换成经纬度坐标 
    	var lnglat = map.fromContainerPixelToLngLat(p);
    	currentPoints.push(lnglat);
    	currentPointCount++;
    // 	//alert(lnglat.getLat()+","+lnglat.getLng());
    // 	if(latLngStr.val().length>0)
    // 	{
    // 		latLngStr.val(latLngStr.val()+";");
    // 	}
    // 	latLngStr.val(latLngStr.val()+lnglat.getLat()+","+lnglat.getLng());
    }
}

function onMapDbClick(p){
    if(polygonCreating){
    	polygonCreating = false;
    	$("#div_createPolygon").removeClass("hidden");
    	$("#div_polygonCreating").addClass("hidden");
    	
    	var size = currentPoints.length;
    	if(size>=4 &&
    	    currentPoints[size-1].getLat() == currentPoints[size-2].getLat() && 
    	    currentPoints[size-1].getLng() == currentPoints[size-2].getLng()){
    	        currentPoints = currentPoints.slice(0,size-2);
    	    }
    	
    	updateLatLngString();
    	
    	currentPolygon.enableEdit();
    	currentPolygon.onChange(onPolygonEditing);
    	currentPolygon.onEditEnd(onPolygonEditEnd);
    }
}

function onMapMouseMove(p){
    if(polygonCreating && currentPointCount>0){
        //将像素坐标转换成经纬度坐标
        var lnglat = map.fromContainerPixelToLngLat(p);
        if(currentPointCount > 0){
            currentPoints[currentPointCount] = lnglat;
        }
        updateCreatingDraw(lnglat);
    }
}

function updateCreatingDraw(mouseLngLat){
    if(currentPolygon == null){
        currentPolygon = new TPolygon(currentPoints ,{strokeColor:"red", strokeWeight:6, strokeOpacity:1});
        map.addOverLay(currentPolygon);
    }else{
        currentPolygon.setLngLats(currentPoints);
    }
}

function updateLatLngString(){
	var str = "";
	for(var i=0,size=currentPoints.length;i<size;i++){
	    if(str.length>0)
    	{
    		str += ";";
    	}
    	str += currentPoints[i].getLat() + "," + currentPoints[i].getLng();
	}
	latLngStr.val(str);
}

function onPolygonEditing(){
    console.log("onPolygonEditing");
    currentPoints = currentPolygon.getLngLats();
    updateLatLngString();
}

function onPolygonEditEnd(){
    console.log("onPolygonEditEnd");
    currentPoints = currentPolygon.getLngLats();
    updateLatLngString();
}

function setCenterStr(lat, lng){
	centerStr.val(lat + "," + lng);
	openGoogleMapText.attr("href","http://maps.google.com/maps?q=loc:"+lat + "," + lng);
	
	map.centerAndZoom(new TLngLat(lng,lat),zoom); 
	if(marker!=null){
		marker.setLngLat(new TLngLat(lng,lat));
	}else{
		//创建标注对象 
		marker = new TMarker(new TLngLat(lng,lat)); 
		//向地图上添加标注 
		map.addOverLay(marker); 
	}
}

function onMapTypeChange(target){
    var t = $(target);
    var type = t.data("id");
    var name = t.html();
    tv_mapTypeText.html(name);
    switch (type) {
        case 0: //vector
            map.setMapType(TMAP_NORMAL_MAP); 
            break;
        case 1: //satellite
            map.setMapType(TMAP_SATELLITE_MAP); 
            break;
        case 2: //hybrid
            map.setMapType(TMAP_HYBRID_MAP); 
            break;
    }
}

 function addNavControl() 
{ 
	map.removeControl(control); 
	//获得缩放平移控件的样式 
	var selectNavCss = document.getElementById("selectnavcss"); 
	var index = selectNavCss.selectedIndex; 
	var controlCss = selectNavCss.options[index].value; 
	//获得缩放平移控件的位置 
	var selectNavPosition = document.getElementById("selectnavposition"); 
	var index = selectNavPosition.selectedIndex; 
	var controlPosition = selectNavPosition.options[index].value; 
	//添加缩放平移控件 
	var config = { 
		type:controlCss,		//缩放平移控件的显示类型 
		anchor:controlPosition	//缩放平移控件显示的位置 
	}; 
	control = new TNavigationControl(config); 
	map.addControl(control); 
} 