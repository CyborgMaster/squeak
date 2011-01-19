var clientID;

function ajaxRequest(type, url, cfunc, data)
{
    var xmlhttp;

    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    if (cfunc)
    {
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState==4 && xmlhttp.status==200)
            {
                cfunc(xmlhttp.responseText);
            }
        };
    }

    if (type == 'POST')
    {
        xmlhttp.open(type, url, true);
        xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("Content-length", data.length);
        xmlhttp.setRequestHeader("Connection", "close");
        xmlhttp.send(data);
    }
    else
    {
        xmlhttp.open(type, url + '?' + data, true);
        xmlhttp.send();    
    }
    
}

function appendToList(text)
{
    var mList = document.getElementById('messageList');
    var liTag = document.createElement('li');
    liTag.innerHTML=text;
    mList.insertBefore(liTag,mList.childNodes[0]);
}

function messageRecieved(messageJSON)
{
    var message = JSON.parse(messageJSON);
    var timestamp = new Date();
    timestamp.setTime(message.timestamp * 1000)
    appendToList('(' + timestamp.format('isoTime') + ') ' + message.sender + ': ' + message.text);
    messageLoop();
}

function messageLoop()
{
    ajaxRequest('GET', '/messages', messageRecieved, 'clientId=' + clientId);
}

function onLoadHandler()
{
    clientId = document.getElementById('clientId').innerHTML;

    setTimeout(function()
               {
                   messageLoop();
               }, 500);
}

function formatTime(date)
{
    return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
}

function sendMessage()
{
    var message = {};
    message.sender = document.getElementById('userName').innerHTML;
    message.text = document.getElementById('messageTextBox').value;
    message.timestamp = new Date().getTime() / 1000; //expects number of seconds, not milliseconds
    ajaxRequest('POST', '/messages', null, JSON.stringify(message));    
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

