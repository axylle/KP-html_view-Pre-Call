$(document).ready(function() {
	$("#version").html("<hr>Version 2.0");
	populateProducts();

	developerMode(false);
});

$(window).load(function(){
	activateCopyOnChange();


});

function setInitialData(obj) {
	itinerary = obj;
	view_mode(obj);

	// showMessage("alert-info", JSON.stringify(obj));

	if(obj.selected_month == "") {
		setMonthSelector(obj.selected_month);
	} else{
		setMonthSelector(0);
	}

	//copy button
	preCallButtonActivate();

	//paste button
	if(getPsr().psr_udf1 != ""){
		$("#paste").show();
	}
	
	//if NEWCALL
	if($("#NEWCALL").val() == "YES"){
		$("#visit_number").val("5");
		$("#itinerary_date").val(getDateNow(false));

		var it_sql = "select * from itinerary where md_id = '"+obj.md_id+"' and itinerary_date = '"+getDateNow(false)+"'";
		doSQL(it_sql, function(data) {
			if(data != ""){
				view_mode(data[0]);
			} else {
				resetForm();
			}
		});	
	}

	//if has post_call
	if($("#submitted").val() == "yes"){
		$("#paste").hide();
		$("#copy").hide();
		$("#submit").hide();
		$("#reset").hide();
		$("input").prop("readonly", true);
		$("textarea").prop("readonly", true);
		$("select").attr("disabled", true); 

		promotionalActivityTool();
	}

	if(!jQuery.isEmptyObject(preCallObject())){
		$("#has_pre_call").val("yes");
	}

}

function setMonthSelector(month) {
	var d = new Date();
	var current = d.getMonth() + 1;

	$("#current_month").val(current);
	$("#current").html(months[current]);

	//in case of january
	if(current == 1)
		$("#prev").html(months[12]);
	else
		$("#prev").html(months[current-1]);
	
	//in case of december
	if(current ==12)
		$("#next").html(months[1]);
	else
		$("#next").html(months[current + 1]);

	//if selected_month is not yet set
	if(month == 0) {
		month = current;
	}

	$("#selected_month").val(month);
	
	$("label.btn").removeClass("active");
	if(month < current) {
		$('#prev').addClass('active');
	} else if (month > current){
		$('#next').addClass('active');
	} else {
		$('#current').addClass('active');
	}
	setActivity(month);
}

function prevMonth(){
	var month = $("#current_month").val();
	setMonthSelector(parseInt(month) - 1);
}

function currentMonth(){
	var month = $("#current_month").val();
	setMonthSelector(parseInt(month));
}

function nextMonth(){
	var month = $("#current_month").val();
	setMonthSelector(parseInt(month) + 1);
}

function setActivity(month){
	var activitySql = "select activity_description from promotional_activity where month = '"+month+"' and act_or_tool = 'act'";
	
	var $act1 = $("#pre_activity_1");     
	$act1.empty();

	var $act2 = $("#pre_activity_2");     
	$act2.empty();

	doSQL(activitySql, function(data) {
		data.forEach(function(value, i){
			$act1.append($("<option></option>").attr("value", value["activity_description"]).text(value["activity_description"]));
			$act2.append($("<option></option>").attr("value", value["activity_description"]).text(value["activity_description"]));
		});
	});
	
	if(itinerary.selected_month == month) {
		var a = ""+itinerary.pre_activity_1;
		var b = ""+itinerary.pre_activity_2;

		$.each(a.split(","), function(i,e){
			$("#pre_activity_1 option[value='" + e + "']").prop("selected", true);
		});

		$.each(b.split(","), function(i,e){
			$("#pre_activity_2 option[value='" + e + "']").prop("selected", true);
		});
	}

	//pomotional tool
	var toolSql = "select activity_description from promotional_activity where month = '"+month+"' and act_or_tool = 'tool'";
	
	var $tool1 = $("#pre_tool_1");     
	$tool1.empty();

	var $tool2 = $("#pre_tool_2");     
	$tool2.empty();

	doSQL(toolSql, function(data) {
		data.forEach(function(value, i){
			$tool1.append($("<option></option>").attr("value", value["activity_description"]).text(value["activity_description"]));
			$tool2.append($("<option></option>").attr("value", value["activity_description"]).text(value["activity_description"]));
		});
	});
	
	if(itinerary.selected_month == month) {
		var c = ""+itinerary.pre_tool_1;
		var d = ""+itinerary.pre_tool_2;

		$.each(c.split(","), function(i,e){
			$("#pre_tool_1 option[value='" + e + "']").prop("selected", true);
		});

		$.each(d.split(","), function(i,e){
			$("#pre_tool_2 option[value='" + e + "']").prop("selected", true);
		});
	}
}

function copyNotes() {
	var pre_call = JSON.stringify(preCallObject());
	if(pre_call != '{}') {
		pre_call = pre_call.replace(/"/g , "``");

		sql = "update psr set psr_udf1='"+pre_call+"'";	
		execSQL(sql);

		showMessage("alert-info", "<strong>Information!</strong> Pre-Call Notes Copied.");
	} else {
		dialog("There is nothing to copy.")
	}
	return false;
}

function pasteNotes() {
	$("#copy").show();
	$("#submit").show();
	
	var pre_call = getPsr().psr_udf1;
	pre_call = pre_call.replace(/``/g , "\"");

	view_mode(JSON.parse(pre_call));

	showMessage("alert-info", "<strong>Information!</strong> Pre-Call Notes Pasted.");
	return false;
}

function resetForm() {
	$("#alert").html("");
	var empty = '{"pre_product_1":"","pre_goal":"","pre_product_2":"","general_activities":"","pre_activity_1":"","pre_activity_2":"","pre_tool_1":"","pre_tool_2":""}';
	$.each(JSON.parse(empty), function(i, val) {
		$("#"+i).val(val);
		$("#awp_"+i).val(val);
	});
	setMonthSelector($("#current_month").val());
}

function preCallObject(){
	$("#pre_product_1").val($("#awp_pre_product_1").val());
	$("#pre_product_2").val($("#awp_pre_product_2").val());

	var preCallDataArray = preCallDataIds.split(",");
	var formObj = $('form').serializeObject();
	formObj = removeEmptyElements(formObj);
	return filterJson(formObj, preCallDataArray);
}

function promotionalActivityTool(){
	var obj = itinerary;
	$("#btn-group").hide();

	$("#pre_activity_1").hide();
	var a = ""+obj.pre_activity_1;		
	$.each(a.split(","), function(i,e){
		if(e+"" != "undefined")
			var list = '<li>'+e+'</li>';
		else
			var list = '<li>None</li>';
		$("#pre_activity_1_list").append(list);
	});

	$("#pre_activity_2").hide();
	var b = ""+obj.pre_activity_2;		
	$.each(b.split(","), function(i,e){
		if(e+"" != "undefined")
			var list = '<li>'+e+'</li>';
		else
			var list = '<li>None</li>';
		$("#pre_activity_2_list").append(list);
	});

	$("#pre_tool_1").hide();
	var c = ""+obj.pre_tool_1;		
	$.each(c.split(","), function(i,e){
		if(e+"" != "undefined")
			var list = '<li>'+e+'</li>';
		else
			var list = '<li>None</li>';
		$("#pre_tool_1_list").append(list);
	});

	$("#pre_tool_2").hide();
	var d = ""+obj.pre_tool_2;		
	$.each(d.split(","), function(i,e){
		if(e+"" != "undefined")
			var list = '<li>'+e+'</li>';
		else
			var list = '<li>None</li>';
		$("#pre_tool_2_list").append(list);
	});
}

function populateProducts(){
	sql = "select product_description from products order by product_description";
	
	var list = [];
	doSQL(sql, function(data) {
		data.forEach(function(value, i){
			list.push(value.product_description);
		});
	});

	awesomized("awp_pre_product_1", "pre_product_1", list);
	awesomized("awp_pre_product_2", "pre_product_2", list);
}

function submitForm(){
	var pre_call = JSON.stringify(preCallObject());
	pre_call = pre_call.replace(/"/g , "``");
	$("#pre_call").val(pre_call);

	var json = $('form').serializeObject();
	var localCol = [], localVal = [], itSqlCol = [], itSqlVal = [], itppSqlCol = [], itppSqlVal = [];
	var local = "", itSql = "", itppSql = "";

	$.each(json, function(i, val) {
		localCol.push(i);
		localVal.push(val);

		if($.inArray(i, itineraryIds.split(",")) !== -1){
			itSqlCol.push(i);
			itSqlVal.push(val);
		}
		if($.inArray(i, preCallIds.split(",")) !== -1){
			itppSqlCol.push(i);
			itppSqlVal.push(val);
		}
	});

	//if NEWCALL insert new it, ittp and local
	if($("#NEWCALL").val() == "YES") {
		itSql = "insert into itinerary (" + itSqlCol.join(", ") + ") values ('" + itSqlVal.join("', '") + "')";
		itppSql = "insert into itinerary_pre_post (" + itppSqlCol.join(", ") + ") values ('" + itppSqlVal.join("', '") + "')";
		local = "insert into itinerary (" + localCol.join(", ") + ") values ('" + localCol.join("', '") + "')";	} 
	//update it and local
	else{
		//ok
		local = "update itinerary set " +getUpdateString(json)+ " WHERE md_id = '" + json.md_id + "' and itinerary_date='" + json.itinerary_date + "' and psr_id = '" + json.psr_id + "'";

		//ok
		itSql = "update itinerary set pre_call='"+json.pre_call+"' WHERE md_id = '" + json.md_id + "' and itinerary_date='" + json.itinerary_date + "' and psr_id = '" + json.psr_id + "'";

		//if has pre_call inset ittp
		if($("#has_pre_call").val() == "no"){
			itppSql = "insert into itinerary_pre_post (" + itppSqlCol.join(", ") + ") values ('" + itppSqlVal.join("', '") + "')";
		}
		//update ittp
		else{
			//ok
			itppSql = "update itinerary_pre_post set pre_product_1 = '" + json.pre_product_1 + "', pre_tool_1 = '" + json.pre_tool_1 + "', pre_tool_2 = '" + json.pre_tool_2 + "', selected_month = '" + json.selected_month + "', pre_goal = '" + json.pre_goal + "', pre_activity_1 = '" + json.pre_activity_1 + "', pre_activity_2 = '" + json.pre_activity_2 + "', general_activities = '" + json.general_activities + "' where userid = '" + json.userid + "' and md_id = '" + json.md_id + "' and itinerary_date = '" + json.itinerary_date + "'";
		}
	}

	var call_notes2_string = "PRE-CALL::'||char(10)||'Product1:: "+json.pre_product_1+"'||char(10)||'Product2:: "+json.pre_product_2+"'||char(10)||'Activity 1:: "+json.pre_activity_1+"'||char(10)||'Tool 1:: "+json.pre_tool_1+"'||char(10)||'Activity 2:: "+json.pre_activity_2+"'||char(10)||'Tool 2:: "+json.pre_Tool_2+"'||char(10)||'Goal:: "+json.pre_goal+"'||char(10)||'General Activities:: "+json.general_activities;

	var call_notes2Sql = "insert into call_notes2 values('"+ json.psr_id +"', '"+ json.md_id +"', CURRENT_TIMESTAMP, '"+call_notes2_string+"', '"+ json.territory_id +"', '"+ json.userid +"')";


	var call_notes_string = "PRE-CALL::%0AProduct1:: "+json.pre_product_1+"%0AProduct2:: "+json.pre_product_2+"%0AActivity 1:: "+json.pre_activity_1+"%0AActivity 2:: "+json.pre_activity_2+"%0ATool 1:: "+json.pre_tool_1+"%0ATool 2:: "+json.pre_tool_2+"%0AGoal:: "+json.pre_goal+"%0AGeneral Activities:: "+json.general_activities;
	
	call_notesSql = "insert into call_notes values('"+ json.psr_id +"', '"+ json.md_id +"', getDate(), '"+call_notes_string+"', '"+ json.territory_id +"')";
	
	execSQL(call_notes2Sql);
	postSQL("MSSQL",call_notesSql);

	// showAlert(ittpSql+"<hr>"+itSql+"<hr>"+local);

	postSQL("MSSQL",itppSql);
	postSQL("MSSQL",itSql);
	execSQL(local);

	console.log(itppSql);
	console.log(itSql);

	showMessage("alert-success", "Pre-Call Submitted successfully.");
	return false;
}

function activateCopyOnChange(){
	$("form").keyup(function(){
		preCallButtonActivate();
	});
	$("form").change(function(){
		preCallButtonActivate();
	});
}

function preCallButtonActivate(){
	if(!jQuery.isEmptyObject(preCallObject())){
		$("#copy").show();
		$("#submit").show();
	} else{
		$("#copy").hide();
		$("#submit").hide();
	}
}

function developerMode(flag){
	if(flag){
		$("#hidden_fields").show();
		var currentVersion = $("#version").html();
		$("#version").html('<hr>'+currentVersion + ' - developerMode is On');
	} else{
		$("#hidden_fields").hide();
	}
}

/**
* variables
*/
var preCallDataIds = "pre_product_1,pre_product_2,pre_goal,pre_activity_1,pre_activity_2,general_activities,pre_tool_1,pre_tool_2";
var preCallIds = "userid,territory_id,md_id,md_name,itinerary_date,pre_product_1,pre_product_2,pre_goal,pre_activity_1,pre_activity_2,general_activities,unplanned,pre_tool_1,pre_tool_2,selected_month";
var itineraryIds = "area_id,class_code,date_gps,date_gps_dm,dm_activity,frequency,itinerary_date,itinerary_day,latitude,latitude_dm,longitude,longitude_dm,md_id,missed,post_call,pre_call,psr_id,reason_code,rowguid,segment,signature,territory_id,visit_date,visit_number";
