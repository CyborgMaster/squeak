function loadXMLDoc(url, cfunc, data)
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
    //xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.send(data);
}

function appendToList(text)
{
    var mList = document.getElementById('messageList');
    var liTag = document.createElement('li');
    liTag.innerHTML=text;
    mList.appendChild(liTag);
}

function login()
{
    appendToList("YAY");
    
    loadXMLDoc(location.href, function(data)
              {
                  appendToList(data);
                  //document.write(data);
              }, "fdjsaklfsj");
}

