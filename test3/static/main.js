jQuery(document).ready(function() 
                       {
                           var input_string = jQuery("input#textfield").val();
                           var request = {
                               type: "POST",
                               data: {textfield : input_string},
                               beforeSend: function ()
                               {
                                   
                               },

                               success: function(data) 
                               {
                                   jQuery('#itemList').append("<li>" + data + "</li>")
                                   jQuery('ul#itemList li:last').hide().fadeIn(1500);
                                   jQuery.ajax(request);
                               }
                           };

                           jQuery.ajax(request);
                           
                           
                       });

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

