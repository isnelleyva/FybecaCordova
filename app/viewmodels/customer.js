(function($) {

	window.customer = {

		isAuthenticated : ko.observable(false),
		isGuest : ko.observable(false),

		id : ko.observable(""),
		name : ko.observable(""),
		email : ko.observable(""),
		code : ko.observable(""),

		addresses : ko.observableArray([]),

		addressToAnimate : ko.observable(""),
		selectedAddress : ko.observable(1),

		selectedGuestCity : ko.observable(-1),
		selectedGuestNeighborhood : ko.observable(-1),

		orders : ko.observableArray([]),

		wantEditAddress : ko.observable(false),
		addressToEdit : ko.observable(),

		items : ko.observable({
			cartItems : ko.observableArray([]),
			savedItems : ko.observableArray([]),
		}),

		// Services

		discountCards : ko.observableArray([]),

		paymentTypes : ko.observableArray([]),

		creditTypes : ko.observableArray([]),

	};

})(jQuery);