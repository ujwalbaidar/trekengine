jQuery(document).ready(function($) {

    $('.button-collapse').sideNav({
        edge: 'right'
    });

    $('.modal').modal();

    $('select').material_select();

    $('.collapsible').collapsible();

    $('#sidebar .navigation li .menu-collapse-button').click(function(){
    	$('body').toggleClass('collapse-menu');
    });

    $('.booking-detail-page .col .card').matchHeight();
});
