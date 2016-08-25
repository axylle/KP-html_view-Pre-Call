/*
 
 this is where we put all the JS scripts specific to this EForm (index.html)
 
 */


 function getData() {
 	alert('inside getData');
 	doSQL("SELECT * FROM psr", function(json) { alert(json); });
 }

// required function called by iDoXs to populate the form with contextual data
// or data that will uniquely identify the contents of this form
/****
 
 CallView will pass itinerary data:
 "clinic_address" = "kapitan pepe";
 "itinerary_date" = "2015-10-29 00:00:00";
 "md_id" = "CM_068";
 "md_name" = "CARDINO, MARBERT JOHN";
 "psr_id" = RR123;
 "psr_name" = "Crist Cruz";
 "specialty_code" = SG;
 "specialty_description" = "GENERAL SURGEON";
 "territory_id" = 84;
 "visit_date" = "";
 "visit_number" = 2;
 */


// required function called by iDoXs to populate location data
function setLocation(currloc)
{
    //alert(currloc);
}


function createForm(obj)
{

}


function saveLead()
{
}

$(document).ready(function() {
	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};

	customAlert();
	$(function(){
		$('#modalDialog').on('show.bs.modal', function(){
			var myModal = $(this);
			clearTimeout(myModal.data('hideInterval'));
			myModal.data('hideInterval', setTimeout(function(){
				myModal.modal('hide');
			}, 1000));
			
		});
	});
});

var alert = 0;
function showAlert(message) {
	alert++;
	var alertDiv = '<div id="alert_id"'+alert+' class="alert alert-danger fade in">\
	<a href="#" class="close" data-dismiss="alert" aria-label="close" title="close">×</a>\
	<pre id="info">'+message+'</pre>\
	</div>\
	';

	$("#alert").append(alertDiv);
	window.location.href = "#alert";
}

function showMessage(type, message) {
	$(".modal-body").removeClass("alert-danger");
	$(".modal-body").removeClass("alert-info");
	$(".modal-body").removeClass("alert-success");
	$(".modal-body").addClass(type);
	$("#modalMessage").html("&nbsp;" + message);
	$('#modalDialog').modal('show');
}

function getDateNow(complete){
	today = new Date();
	var now = today.getFullYear() + '-' +
	('00' + (today.getMonth() + 1)).slice(-2) + '-' +
	('00' + today.getDate()).slice(-2);

	if (complete) {
		now += ('00' + today.getHours()).slice(-2) + ':' +
		('00' + today.getMinutes()).slice(-2) + ':' +
		('00' + today.getSeconds()).slice(-2);    
	} else {
		now += ' 00:00:00';
	}
	
	return now;
}

function getPsr(){
	var psr = [];
	var sql = "select * from psr";
	doSQL(sql, function(obj) {
		psr = obj;
	});

	return psr[0];
}

function view_mode(data) {
	$.each(data, function(i, val) {
		if(val != "") {
			$("#"+i).val(val);
			//showMessage("alert-info", i+":"+val);
		}

		$("#awp_"+i).val(val);
	});
}

function cleanString(element) {
	var value = element.value;
	value = value.replace(/['"]+/g, '');
	element.value = value;
}

function awesomized(element, trueElement, list){
	var id = document.getElementById(element);
	var awesomplete = new Awesomplete(id, {
		minChars: 1,
		autoFirst: true
	});
	awesomplete.list = list;
	
	document.querySelector('#'+element).addEventListener('awesomplete-selectcomplete', function(evt){
		$('#'+trueElement).val($('#'+element).val());
	});
}


function customAlert(){
	var div = '<div id="modalDialog" class="modal fade" role="dialog">\
	<div class="modal-dialog  modal-sm">\
	<div class="modal-content">\
	<div class="modal-body" style="position: relative">\
	<a href="#" class="close" data-dismiss="modal" aria-label="close" title="close">×</a>\
	<p id="modalMessage">Hello Me</p>\
	</div>\
	</div>\
	</div>\
	</div>';

	$("body").prepend(div);		
}

function filterJson(jsonObj, idArray){
	var newJson = {};
	$.each(jsonObj, function(i, val) {
		if($.inArray(i, idArray) !== -1){
			newJson[i] = val;
		}
	});
	return newJson;
}

function removeEmptyElements(jsonObj){
	var newJsonObj = jsonObj;
	$.each(newJsonObj, function(i, val) {
		if(val == ""){
			// newJsonObj[i] = null;
			delete newJsonObj[i];
		}
	});
	return newJsonObj;
}

function getUpdateString(jsonObj){
	var updateString = "";

	$.each(jsonObj, function(i, val) {
		updateString += i + "='" + val + "',";
	});

	updateString = updateString.substring(0, updateString.length - 1);
	return updateString;
}

var months = ["---", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var itinerary = {};

