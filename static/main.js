var clientID;

var ajaxRequests = [];

function ajaxRequest(type, url, data, successFunc, errorFunc)
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
    
    ajaxRequests[ajaxRequest.requestNum++] = xmlHttp;
    
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
                appendToList("Ajax Error: " + type + ", " + xmlHttp.status);
            }
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
                                    if (errorFunc)
                                        errorFunc();
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
    appendToList("recieve timedout");
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
    setTimeout(getMessage, 500);
}

function getMessage()
{
    ajaxRequest('GET', 'messages', 'clientId=' + clientId, messageRecieved, messageTimeout);    
}

function onLoadHandler()
{
    clientId = document.getElementById('clientId').innerHTML;

    setTimeout(function()
               {
                   messageLoop();
               }, 500);
}

function sendMessage()
{
    var message = {};
    message.sender = document.getElementById('userName').innerHTML;
    message.text = document.getElementById('messageTextBox').value;
    message.timestamp = new Date().getTime() / 1000; //expects number of seconds, not milliseconds
    ajaxRequest('POST', 'messages', JSON.stringify(message));    
    document.getElementById('messageTextBox').value = "";
}

// jQuery(document).ready(function() 
//                        {
//                            startMessageLoop();
//                        });

// jQuery(document).ready(function() {
//   setTimeout(startMessageLoop(), 500);
// });

// jQuery(document).ready(function() {
//   setTimeout(function () {
//     startMessageLoop();
//   }, 500);
// });

//                        {
//                            var input_string = jQuery("input#textfield").val();
//                            var request = {
//                                type: "POST",
//                                data: {textfield : input_string},
//                                beforeSend: function ()
//                                {
                                   
//                                },

//                                success: function(data) 
//                                {
//                                    jQuery('#itemList').append("<li>" + data + "</li>")
//                                    jQuery('ul#itemList li:last').hide().fadeIn(1500);
//                                    jQuery.ajax(request);
//                                }
//                            };
                           
//                            startMessageLoop();
                           
//                        });


//     jQuery(".button").click(function() {
//                                 var input_string = $$("input#textfield").val();
//                                 jQuery.ajax({
//                                                 type: "POST",
//                                                 data: {textfield : input_string},
//                                                 success: function(data) {
//                                                     jQuery('#itemList').append("<li>" + data + "</li>")
//                                                     jQuery('ul#itemList li:last').hide().fadeIn(1500);
//                                                 },
//                                             });
//                                 return false;
//                             });
// });

