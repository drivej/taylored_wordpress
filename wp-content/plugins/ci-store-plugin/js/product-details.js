document.addEventListener('DOMContentLoaded', function () {
  /*

  This automatically selects remaining factes if they're available - but it was causing some strange behavior with the vehicle variation selector

  */
  // return;
  if (typeof woo_product_details === 'undefined') {
    console.error('❌ WooCommerce product data is missing!');
    return;
  }

  const variations = woo_product_details.variations;

  if (!variations || variations.length === 0) {
    console.error('❌ No variations found for this product.');
    return;
  }

  const attributeSelects = document.querySelectorAll("select[name^='attribute_']");
  const form = document.querySelector('.variations_form');
  const clearButton = form.querySelector('.reset_variations'); // WooCommerce clear button

  function disableInvalidOptions() {
    let selectedAttributes = {};

    // Capture currently selected attributes
    attributeSelects.forEach((select) => {
      if (select.value) {
        selectedAttributes[select.name] = select.value;
      }
    });

    attributeSelects.forEach((select) => {
      const attributeName = select.name;
      let validOptions = [];

      select.querySelectorAll('option').forEach((option) => {
        if (!option.value) return; // Skip empty option

        let isValid = false;

        // Check if any variation allows this option
        variations.forEach((variation) => {
          if (!variation.is_in_stock) return;

          let matchesAll = true;

          for (let key in selectedAttributes) {
            if (selectedAttributes[key] && key !== attributeName) {
              if (variation.attributes[key] !== selectedAttributes[key]) {
                matchesAll = false;
                break;
              }
            }
          }

          if (matchesAll && variation.attributes[attributeName] === option.value) {
            isValid = true;
            validOptions.push(option.value);
          }
        });

        // Disable or show/hide the option
        option.disabled = !isValid;
        option.style.display = isValid ? 'block' : 'none';
      });

      // ✅ FIX: Prevent infinite loop by only changing value if necessary
      if (validOptions.length === 1 && select.value !== validOptions[0]) {
        select.value = validOptions[0];
        setTimeout(() => select.dispatchEvent(new Event('change')), 10); // Small delay to avoid recursion
      }
    });
  }

  // ✅ Reset all attributes when clicking the "Clear" button
  function resetAttributes() {
    attributeSelects.forEach((select) => {
      select.selectedIndex = 0; // Reset to default option
      select.querySelectorAll('option').forEach((option) => {
        option.disabled = false;
        option.style.display = 'block';
      });
    });

    setTimeout(() => {
      disableInvalidOptions(); // Re-run validation
    }, 10);
  }

  // ✅ Event Listener: Run when an attribute is selected
  attributeSelects.forEach((select) => {
    select.addEventListener('change', disableInvalidOptions);
  });

  // ✅ Event Listener: Reset when clicking the "Clear" button
  if (clearButton) {
    clearButton.addEventListener('click', function (event) {
      event.preventDefault();
      resetAttributes();
    });
  }

  // ✅ Initialize on page load
  disableInvalidOptions();
});

function selectVariation(variation_id) {
  // Locate the variations form
  const variationForm = document.querySelector('.variations_form');
  if (!variationForm) {
    console.error('Variation form not found.');
    return;
  }

  // Retrieve variations data from the form's data attribute
  let variations;
  if (window?.woo_product_details?.variations) {
    variations = window?.woo_product_details?.variations;
  } else {
    try {
      variations = JSON.parse(variationForm.getAttribute('data-product_variations'));
    } catch (e) {
      console.error('Failed to parse variations data:', e);
      return;
    }
  }

  // Find the variation object that matches the given variation_id
  const matchingVariation = variations.find((v) => v.variation_id == variation_id);
  if (!matchingVariation) {
    console.error(`No matching variation found for variation_id ${variation_id}.`);
    return;
  }

  // Loop through each attribute in the matching variation and update the corresponding select element
  Object.keys(matchingVariation.attributes).forEach((attributeName) => {
    const attributeValue = matchingVariation.attributes[attributeName];
    const selectElem = document.querySelector(`select[name="${attributeName}"]`);
    if (!selectElem) {
      console.warn(`Select element for attribute ${attributeName} not found.`);
      return;
    }
    // Set the attribute value
    selectElem.value = attributeValue;
    // Trigger change event to let WooCommerce know about the update
    selectElem.dispatchEvent(new Event('change', { bubbles: true }));
  });

  // Optionally, update the hidden variation_id input so that WooCommerce knows which variation is selected
  const variationIdInput = document.querySelector('input[name="variation_id"]');
  if (variationIdInput) {
    variationIdInput.value = matchingVariation.variation_id;
    variationIdInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Finally, enable the shop (add-to-cart) button if it's disabled
  const addToCartBtn = document.querySelector('.single_add_to_cart_button');
  if (addToCartBtn) {
    addToCartBtn.disabled = false;
    addToCartBtn.classList.remove('disabled');
  }
}
