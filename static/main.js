var clientID;
var userName;

//array  to store references to the XMLHttpRequest objects so they don't get 
//garbage collected while still in use
var ajaxRequests = new Array(10);

function ajaxRequest(type, url, data, successFunc, timeoutFunc, errorFunc)
{
    if (ajaxRequest.requestNum == undefined)
        ajaxRequest.requestNum = 0;

    var xmlHttp;
    var xmlHttpTimeout;
    
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlHttp = new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    //take care of storing the XMLHttpRequest object    
    var thisRequestNum = ajaxRequest.requestNum;
    ajaxRequest.requestNum += 1;
    ajaxRequest.requestNum %= ajaxRequests.length;
    ajaxRequests[thisRequestNum] = xmlHttp;
    
    xmlHttp.onreadystatechange = function()
    {
        if (xmlHttp.readyState == 4)
        {
            clearTimeout(xmlHttpTimeout); 
            
            if (xmlHttp.status == 200)
            {
                if (successFunc)
                    successFunc(xmlHttp.responseText);
            }
            else
            {
                if (errorFunc)
                    errorFunc(xmlHttp.status);
            }

            delete(ajaxRequests[thisRequestNum]);
        }
    };
    
    if (type == 'POST')
    {
        xmlHttp.open(type, url, true);
        xmlHttp.setRequestHeader("Content-type", 
                                 "application/x-www-form-urlencoded");
        xmlHttp.setRequestHeader("Content-length", data.length);
        xmlHttp.setRequestHeader("Connection", "close");
        xmlHttp.send(data);
    }
    else
    {
        xmlHttp.open(type, url + '?' + data, true);
        xmlHttp.send();    
    }
    
    //timeout in 1 minute
    xmlHttpTimeout = setTimeout(function()
                                {
                                    xmlHttp.abort(); 
                                    if (timeoutFunc)
                                        timeoutFunc();
                                }, 90000);
}

function appendToList(text)
{
    var mList = document.getElementById('messageList');
    var liTag = document.createElement('li');
    liTag.innerHTML=text;
    mList.insertBefore(liTag,mList.childNodes[0]);
}

function messageTimeout()
{
    appendToList("Message loop timed out");
}

function messageError(status)
{
    appendToList("Ajax Error: " + type + ", " + status);
    messageLoop();
}

function messageRecieved(messageJSON)
{
    var messageList = JSON.parse(messageJSON, 
                                 function(key, value)
                                 {
                                     if (key == 'timestamp')
                                     {
                                         var time = new Date();
                                         time.setTime(value * 1000);
                                         return time;
                                     }                                     
                                     else
                                     {
                                         return value;
                                     }
                                 });

    for (var i = 0; i < messageList.length; i++)
    {
        var message = messageList[i];
        appendToList('(' + message.timestamp.format('isoTime') + ') ' 
                     + message.sender + ': ' + message.text);
    }

    messageLoop();
}

function messageLoop()
{
    ajaxRequest('GET', 'messages', 'clientId=' + clientId, messageRecieved, messageTimeout);    
}

function onLoadHandler()
{
    clientId = document.getElementById('clientId').innerHTML;
    userName = document.getElementById('userName').innerHTML;

    setTimeout(function()
               {
                   messageLoop();
               }, 500);
}

function sendMessage()
{
    //don't send if the message is blank
    var messageText = document.getElementById('messageTextBox').value;
    if (messageText == "")
        return;

    var message = {};
    message.sender = userName;    
    message.text = messageText;
    message.timestamp = new Date().getTime() / 1000; //expects number of seconds, not milliseconds
    ajaxRequest('POST', 'messages', JSON.stringify(message));    
    document.getElementById('messageTextBox').value = "";
}

