const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message',
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
    this._setupFloatingLabels();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
          cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
          deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
          countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
        }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _setupFloatingLabels() {
    // Add class to fields with values for floating labels
    const inputs = this.elements.container.querySelectorAll('.field__input');

    const checkInput = (input) => {
      const field = input.closest('.field');

      // For select elements, check if the selected option has a value
      if (input.tagName === 'SELECT') {
        const selectedOption = input.options[input.selectedIndex];
        const hasValue = selectedOption && selectedOption.value && selectedOption.value.trim() !== '';

        if (hasValue) {
          field?.classList.add('field--has-value');
        } else {
          field?.classList.remove('field--has-value');
        }
      } else {
        // For text inputs
        if (input.value && input.value.trim() !== '') {
          field?.classList.add('field--has-value');
        } else {
          field?.classList.remove('field--has-value');
        }
      }
    };

    inputs.forEach((input) => {
      // Check initial value
      checkInput(input);

      // Check on input/change
      input.addEventListener('input', () => checkInput(input));
      input.addEventListener('change', () => checkInput(input));
    });
  }

  _toggleExpanded(target) {
    const isExpanded = target.getAttribute(attributes.expanded) === 'true';
    target.setAttribute(attributes.expanded, (!isExpanded).toString());

    // Also toggle a class on the parent for better browser support
    const parent = target.closest(selectors.addressContainer);
    if (parent) {
      parent.classList.toggle('address-form-open', !isExpanded);
    }
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    // eslint-disable-next-line no-alert
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
}
