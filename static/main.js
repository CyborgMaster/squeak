function loadXMLDoc(url,cfunc)
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
    
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            cfunc(xmlhttp.responseText);
        }
    };

    xmlhttp.open("POST", url, true);
    xmlhttp.send();
}

function appendToList(text)
{
    var mList = document.getElementById('messageList');
    var liTag = document.createElement('li');
    liTag.innerHTML=text;
    mList.appendChild(liTag);
}

function messageRecieved(message)
{
    appendToList(message);
    loadXMLDoc(location.href, messageRecieved);
}

function startMessageLoop()
{
    loadXMLDoc(location.href, messageRecieved);
}

function onLoadHandler()
{
    startMessageLoop();
}

// jQuery(document).ready(function() 
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

