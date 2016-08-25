/**
 
 RR Eform scripts
 
 
 */
var queue = {};
var alertMsg = {};


function postSQL(dbtype, sql)
{
    //alert(sql);
    //execute("inapp://post-sql/?sql="+sql+"&dbtype"+dbtype);
	execute("inapp://post-sql/?sql="+sql+"&dbtype="+dbtype);
}


    function alertView() //(title,msg,cancelButton,otherButtons,callback)
    {
        //alertMsg[msg] = callback;
        //alert('test2');
        //execute("inapp://alert/?title="+title+"&msg="+msg+"&cancel="+cancelButton+"&other="+otherButtons);
    }

    function alertCallBack(msg,buttonIndex)
    {
        alertMsg[msg](buttonIndex);
    }

    function doSQL(sql,callback)
    {
        queue[sql] = callback;
        execute("inapp://do-sql/;"+sql);
    }

    function execSQL(sql,callback)
    {
        queue[sql] = callback;
        execute("inapp://exec-sql/;"+sql);
    }


function sqlCallBack(sql,obj) {
    var json_str = obj;
    json_str = JSON.parse(json_str);
    queue[sql](json_str);
}

function execute(url)
{
    //alert(url);
    var iframe = document.createElement("IFRAME");
    iframe.setAttribute("src", url);
    document.documentElement.appendChild(iframe);
    iframe.parentNode.removeChild(iframe);
    iframe = null;
}


