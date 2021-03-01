//get current URL path and assign 'active class
var pathname = window.location.pathname;
$('.nav > li > ul > a[href="' + pathname + '"]').parent().addClass('active');
$('.side-navbar > li > a[href="' + pathname + '"]').parent().addClass('active');