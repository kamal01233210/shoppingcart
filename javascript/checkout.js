
var $form = $('#checkout-form');

$form.submit(function(event){
	$form.find('button').prop('disabled',true);
});