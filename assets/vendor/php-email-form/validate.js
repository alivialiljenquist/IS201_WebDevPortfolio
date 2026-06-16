/**
* PHP Email Form Validation - v3.11
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    if (action.includes('formsubmit.co')) {
      const subject = formData.get('subject');
      if (subject) {
        formData.set('_subject', '[Portfolio Contact] ' + subject);
      }
    }

    const headers = {'Accept': 'application/json'};
    if (!action.includes('formsubmit.co')) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    fetch(action, {
      method: 'POST',
      body: formData,
      headers: headers
    })
    .then(response => {
      if (response.ok) {
        return response.text();
      } else {
        throw new Error(`${response.status} ${response.statusText} ${response.url}`);
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      const trimmed = data.trim();

      if (trimmed === 'OK') {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
        return;
      }

      try {
        const json = JSON.parse(trimmed);
        if (json.success === true || json.success === 'true') {
          thisForm.querySelector('.sent-message').classList.add('d-block');
          thisForm.reset();
          return;
        }
        throw new Error(json.message || 'Form submission failed.');
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error(trimmed || 'Form submission failed and no error message returned from: ' + action);
        }
        throw error;
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
