Stripe.setPublishableKey('pk_test_PqvEX8Zwo3vwFa5F6x0UiHPg');

var $form = $('#checkput-form');

$form.submit(function(event){
	$form.find('button').prop('disabled',true);
	$('#charge-error').addClass('hidden');
	Stripe.card.createToken({
		number: $("#card-number").val(),
		cvc: $('#card-cvs').val(),
		exp_month: $('#card-expiry-month').val(),
		exp_year: $('#card-expiry-year').val(),
		name: $('#card-name').val()
	},stripeResponseHandler);
	return false;
});


function stripeResponseHandler(status,response){
	if(response.error){
		$('#charge-error').text(response.error.message);
		$('#charge-error').removeClass('hidden');
		$form.find('button').prop('disabled',false);
	}else{
		var token = response.id;

		$form.append($('<input type="hidden" name="stripeToken" />').val(token));

		$form.get(0).submit();
	}
}