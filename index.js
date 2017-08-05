(function(){

  'use strict';

  //----------------------------------------------------------------------------

  var supportedInstruments = [
    {
      /*
       * NOTE:
       * [Deprecation] Card issuer network (
       *   "amex", "diners", "discover", "jcb", "mastercard", "mir",
       *   "unionpay", "visa"
       * ) as payment method is deprecated and will be removed in M64,
       * around January 2018.
       *
       * Please use payment method name "basic-card" with issuer network
       * in the "supportedNetworks" field instead.
       * See https://www.chromestatus.com/features/5725727580225536
       * for more details.
       */
      //supportedMethods: [
      //  'amex',
      //  'bitcoin',
      //  'jcb',
      //  'mastercard',
      //  'visa'
      //]
      supportedMethods: [
        'basic-card'
      ]
    }
  ];

  var details = {
    displayItems: [
      {
        label: '林檎',
        amount: {
          currency: 'JPY',
          value: '300'
        }
      },
      {
        label: '割引',
        amount: {
          currency: 'JPY',
          value: '-100'
        }
      }
    ],
    total: {
      label: '合計',
      amount: {
        currency: 'JPY',
        value: '200'
      }
    }
  };

  //----------------------------------------------------------------------------

  var requestShippingBox = document.getElementById('js-shipping'),
      requestPayerEmailBox = document.getElementById('js-payer-email'),
      requestPayerPhoneBox = document.getElementById('js-payer-phone'),
      requestPayerNameBox = document.getElementById('js-payer-name'),
      forceFailBox = document.getElementById('js-force-fail');

  var buyLink = document.getElementById('js-buy'),
      logArea = document.getElementById('js-log');

  function onClickBuyLink() {
    var options, request, onShippingAddressChange, onShippingOptionChange;

    options = {
      requestShipping: requestShippingBox.checked,
      requestPayerEmail: requestPayerEmailBox.checked,
      requestPayerPhone: requestPayerPhoneBox.checked,
      requestPayerName: requestPayerNameBox.checked 
    };

    request = new PaymentRequest(
      supportedInstruments,
      details,
      options
    );

    onShippingAddressChange = function(event) {
      event.updateWith(new Promise(function(resolve) {
        var shippingOption = {
          id: '',
          label: '',
          amount: {
            currency: 'JPY',
            value: '0'
          },
          selected: true
        };

        if (request.shippingAddress.country === 'JP') {
          shippingOption.id = 'jp';
          shippingOption.label = 'International shipping';
          shippingOption.amount.value = '200';
          details.total.amount.value = '300';
        } else {
          details.shippingOptions = [];

          return Promise.resolve(details);
        }

        if (details.displayItems.length === 2) {
          details.displayItems[2] = shippingOption;
        } else {
          details.displayItems.push(shippingOption);
        }

        details.shippingOptions = [
          shippingOption
        ];

        resolve(details);
      }));
    };

    onShippingOptionChange = function(event) {
      event.updateWith(new Promise(function(resolve) {
        resolve(details);
      }));
    };

    request.addEventListener('shippingaddresschange', onShippingAddressChange, false);
    request.addEventListener('shippingoptionchange', onShippingOptionChange, false);

    request
      .show()
      .then(function(result) {
        return Promise
          .resolve()
          .then(function() {
            var json = JSON.stringify(result, null, 2);

            console.log(json);
            logArea.value = json;

            if (forceFailBox.checked) {
              return result.complete('fail');
            } else {
              return result.complete('success');
            }
          });
      })
      .catch(function(err) {
        console.error(err.message);
        logArea.value = err.message;
      });
  }

  buyLink.addEventListener('click', onClickBuyLink, false);

}());
