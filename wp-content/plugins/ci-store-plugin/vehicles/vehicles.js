const default_vehicle = {
  year: '',
  make: '',
  model: '',
  id: '',
  name: ''
};

const default_fitment = {
  vehicle_id: 0,
  product_id: 0,
  fitment: false,
  has_vehicles: false,
  product: false,
  variation_ids: [],
  variation_skus: [],
  product_type: ''
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

class Vehicles {
  debug = false;
  storage_key = 'user_vehicle_data';
  $year;
  $make;
  $model;
  $form;
  $message;
  $shop_links;
  $variation_input;
  vehicle = { ...default_vehicle };
  vehicles = {};
  fitment = { ...default_fitment };
  hydrated = false;
  messageTimeout = null;
  fitment_cache = {};
  last_variation_id = 0;

  init = async () => {
    this.$container = document.querySelector('#vehicle_fitment');

    if (!this.$container) {
      console.log('failed to load vehicles');
      return;
    }

    this.attributeSelects = document.querySelectorAll("select[name^='attribute_']");
    this.clearButton = document.querySelector('.variations_form .reset_variations');
    this.$form = this.$container.querySelector('#vehicle_input_form');
    this.$clear_button = this.$container.querySelector('#vehicle_clear_button'); // TODO: rename to cancel
    this.$year = this.$container.querySelector('#vehicle_year');
    this.$make = this.$container.querySelector('#vehicle_make');
    this.$model = this.$container.querySelector('#vehicle_model');
    this.$start_button = this.$container.querySelector('#vehicle_start_button');
    this.$change_button = this.$container.querySelector('#vehicle_change_button');
    this.$shop_links = document.querySelectorAll('a.shop_vehicle_link');
    this.$variation_input = document.querySelector('input[name="variation_id"]');
    this.$vehicle_variation_select_container = document.getElementById('vehicle_variation_select_container');
    this.$vehicle_variation_select = document.getElementById('vehicle_variation_select');
    if (this.$vehicle_variation_select) {
      this.$vehicle_variation_select.addEventListener('change', this.onChangeQuickSelect);
    }

    // search form filter
    this.$search_vehicle = document.getElementById('product_vehicle_filter');
    this.$vehicle_id_inputs = document.querySelectorAll('input[name="product_vehicle"]');
    const $search_form = document.querySelector('#vehicle_search_form form');
    if ($search_form) {
      $search_form.addEventListener('submit', this.onSubmitVehicleSearch);
    }
    // injected in product details
    this.$message = document.getElementById('fitment_message');
    this.$message_info = document.querySelector('#fitment_message [data-fitmentmode="info"]');
    this.$vehicle = document.getElementById('vehicle_select');
    this.$remove_button = document.getElementById('vehicle_remove_button');

    this.$year.addEventListener('change', this.handleChangeYear);
    this.$make.addEventListener('change', this.handleChangeMake);
    this.$model.addEventListener('change', this.handleChangeModel);
    this.$form.addEventListener('submit', this.handleSubmit);
    this.$clear_button.addEventListener('click', this.handleClickClear);
    this.$start_button.addEventListener('click', this.onClickStart);
    this.$change_button.addEventListener('click', this.onClickChange);
    this.$remove_button.addEventListener('click', this.onClickRemove);
    this.$vehicle.addEventListener('change', this.onChangeVehicle);

    if (this.$message_info) {
      this.$message_info.addEventListener('click', this.onClickMessage);
    }

    if (this.$variation_input) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            this.onChangeVariationId();
          }
        });
      });

      observer.observe(this.$variation_input, { attributes: true });
    }

    this.emptySelect(this.$make);
    this.emptySelect(this.$model);
    this.restore();
    this.initAutoOptions();

    const $names_list = document.getElementById('related_vehicles_names');
    if ($names_list) {
      $names_list.style.maxHeight = '300px';
      $names_list.style.overflow = 'auto';
    }
  };

  isLoading = (val) => {
    this.$container.dataset.isloading = val ? '1' : '0';
  };

  save = () => {
    if (this.debug) console.log('save');
    localStorage.setItem(
      this.storage_key,
      JSON.stringify({
        vehicle: this.vehicle, //
        vehicles: this.vehicles
      })
    );
  };

  restore = async () => {
    if (this.debug) console.log('restore()');
    this.isLoading(true);
    const raw = localStorage.getItem(this.storage_key);
    let user_data = {};

    try {
      user_data = JSON.parse(raw);
    } catch (err) {
      if (this.debug) console.log(err);
    }

    this.vehicle = { ...default_vehicle };

    if (user_data?.vehicle && typeof user_data?.vehicle === 'object') {
      this.vehicle = { ...default_vehicle, ...(user_data?.vehicle ?? {}) };
    }

    if (user_data?.vehicles && typeof user_data?.vehicles === 'object' && !Array.isArray(user_data?.vehicles)) {
      this.vehicles = user_data.vehicles;

      for (let vid in this.vehicles) {
        if (!this.vehicles[vid]?.id) {
          delete this.vehicles[vid];
        }
      }
    } else {
      this.vehicles = {};
      this.save();
    }

    if (this.vehicle.id) {
      this.setMode('set');
      this.updateVehicleUI();
      await this.setVehicle(this.vehicle.id);
      await this.refreshFitment();
      this.selectAvailableVariation();
      this.updateFitmentMessage();
    } else {
      this.setMode('invite');
    }
    this.isLoading(false);
  };

  hydrate = async () => {
    if (this.debug) console.log('hydrate()');
    if (this.hydrated) return;
    this.isLoading(true);
    this.hydrated = true;

    // load years
    const years_res = await this.load({ type: 'get_years' });
    this.populateSelect(this.$year, years_res.data);

    if (this.vehicle?.id) {
      await this.setYear(this.vehicle.year);
      await this.setMake(this.vehicle.make);
      await this.setModel(this.vehicle.model);

      this.$year.value = this.vehicle.year;
      this.$make.value = this.vehicle.make;
      this.$model.value = this.vehicle.model;
    }
    this.isLoading(false);
  };

  dispose = () => {
    localStorage.removeItem(this.storage_key);
  };

  // user manually selected vehicle
  onChangeVehicle = async (e) => {
    if (this.debug) console.log('onChangeVehicle()');
    this.setMessage('loading');
    await this.setVehicle(e.currentTarget.value);
    await this.refreshFitment();
    if (this.$variation_input?.value == '') {
      this.selectAvailableVariation();
    }
    this.updateFitmentMessage();
  };

  selectAvailableVariation = () => {
    if (this.debug) console.log('selectAvailableVariation()');
    if (this.fitment?.variation_ids?.length > 0) {
      this.selectVariationId(this.fitment.variation_ids[0]);
    }
  };

  onClickStart = async (e) => {
    if (this.debug) console.log('onClickStart()');
    this.isLoading(true);
    const years_res = await this.load({ type: 'get_years' }).catch(() => console.log('catch'));

    if (!years_res?.data) {
      this.isLoading(false);
      return;
    }
    this.populateSelect(this.$year, years_res.data);
    this.emptySelect(this.$make);
    this.emptySelect(this.$model);
    this.setMode('change');
    this.isLoading(false);
  };

  // Add Vehicle Button
  onClickChange = async (e) => {
    this.hydrate().then(() => this.setMode('change'));
  };

  // change what's visible based on if editing, committed or empty
  setMode = (mode) => {
    if (mode === 'load') {
      this.isLoading(true);
    } else {
      this.$container.dataset.mode = mode;
      this.isLoading(false);
    }
  };

  handleChangeYear = (e) => {
    this.setYear(e.currentTarget.value);
  };

  handleChangeMake = (e) => {
    this.setMake(e.currentTarget.value);
  };

  handleChangeModel = (e) => {
    this.setModel(e.currentTarget.value);
  };

  // onClickSave
  handleSubmit = (e) => {
    if (this.debug) console.log('handleSubmit()');
    e?.preventDefault();
    this.setMode('set');
    this.refreshFitment();
    this.updateFitmentMessage();
    this.save();
  };

  handleClickClear = (e) => {
    if (this.debug) console.log('handleClickClear()');
    e.preventDefault();

    if (Object.keys(this.vehicles).length > 0) {
      this.setMode('set');
    } else {
      this.setMode('invite');
    }
  };

  onClickRemove = () => {
    if (confirm('Are you sure you want to remove this vehicle from your garage?')) {
      this.removeVehicle(this.vehicle.id);
    }
  };

  addVehicle = async (vehicle) => {
    if (this.debug) console.log('addVehicle()');
    this.vehicles[vehicle.id] = vehicle;
    this.updateVehicleUI();
    await this.setVehicle(vehicle.id);
    await this.refreshFitment();
    this.selectAvailableVariation();
    this.updateFitmentMessage();
  };

  removeVehicle = async (vehicle_id) => {
    if (this.debug) console.log('removeVehicle()');
    if (this.vehicles.hasOwnProperty(vehicle_id)) {
      delete this.vehicles[vehicle_id];
    }
    this.updateVehicleUI();

    if (this.vehicle.id == vehicle_id) {
      const keys = Object.keys(this.vehicles);
      if (keys.length > 0) {
        await this.setVehicle(keys[0]);
        await this.refreshFitment();
      } else {
        await this.setVehicle(null);
      }
      this.updateFitmentMessage();
      this.save();
    }
  };

  updateVehicleUI = () => {
    if (this.debug) console.log('updateVehicleUI()');
    // update vehicle select
    const opts = Object.keys(this.vehicles)
      .filter((k) => k && this.vehicles[k] && this.vehicles[k].id)
      .map((k) => ({ name: this.vehicles[k].name, id: k }));

    this.populateSelect(this.$vehicle, opts, false);
    this.$vehicle.value = this.vehicle.id;
  };

  isLoadingSelect = ($select, isLoading) => {
    $select.parentNode.dataset.isloading = isLoading ? '1' : '0';
  };

  setYear = async (value) => {
    this.vehicle.year = value;
    this.emptySelect(this.$model);
    this.isLoadingSelect(this.$make, true);
    const res = await this.load({ type: 'get_makes', year: value });

    if (res && res.data) {
      this.populateSelect(this.$make, res.data);
      this.isLoadingSelect(this.$make, false);
      if (this.vehicle.make && res.data.find((o) => o.id == this.vehicle.make)) {
        this.$make.value = this.vehicle.make;
        this.$make.dispatchEvent(new Event('change'));
      }
    }
  };

  setMake = async (value) => {
    this.vehicle.make = value;
    this.isLoadingSelect(this.$model, true);
    const res = await this.load({ type: 'get_models', year: this.vehicle.year, make: value });

    if (res && res.data) {
      this.populateSelect(this.$model, res.data);
      this.isLoadingSelect(this.$model, false);
    }
  };

  setModel = async (value) => {
    this.vehicle.model = value;
    const res = await this.load({ type: 'get_vehicle', year: this.vehicle.year, model: this.vehicle.model });

    if (res && res.data) {
      this.addVehicle(res.data);
      this.setVehicle(res.data.id);
    }
  };

  setVehicle = async (vehicle_id) => {
    if (this.debug) console.log('setVehicle()', vehicle_id);
    if (!vehicle_id || !this.vehicles.hasOwnProperty(vehicle_id)) {
      this.vehicle = { ...default_vehicle };
      this.setMode('invite');
      return;
    }
    this.vehicle = { ...this.vehicles[vehicle_id] };
    this.$vehicle.value = vehicle_id;

    if (this.$vehicle_id_inputs) {
      this.$vehicle_id_inputs.forEach((el) => {
        el.value = `vehicle_${vehicle_id}`;
      });
    }

    if (this.$shop_links) {
      this.$shop_links.forEach((el) => {
        el.href = `/vehicles/vehicle_${vehicle_id}`;
      });
    }

    this.save();
  };

  refreshFitment = async () => {
    if (this.debug) console.log('refreshFitment()', this.$variation_input?.value);
    if (!vehicles_ajax.is_product || vehicles_ajax.has_vehicles != '1') {
      this.fitment = { ...default_fitment };
      return;
    }
    const product_id = vehicles_ajax?.product_id ?? 0;
    const vehicle_id = this.vehicle.id;
    const cacheKey = `${vehicle_id}_${product_id}`;

    if (!this.fitment_cache.hasOwnProperty(cacheKey)) {
      if (product_id) {
        const res = await this.load({
          type: 'fitment',
          vehicle_id,
          product_id
        });

        if (res?.data) {
          const fitment = { ...default_fitment, ...res.data };
          this.fitment_cache[cacheKey] = fitment;
        }
      }
    }
    this.fitment = { ...this.fitment_cache[cacheKey] };
    this.refreshVariationSelect();
    return this.fitment;
  };

  updateFitmentMessage = (instant) => {
    if (this.debug) console.log('updateFitmentMessage()');

    if (Object.keys(this.vehicles).length === 0) {
      this.setMessage('');
      return;
    }
    // product has no vehicles OR is not a PDP
    if (!vehicles_ajax.is_product || vehicles_ajax.has_vehicles != '1') {
      this.setMessage('');
      return;
    }

    if (this.fitment.product_type === 'simple') {
      if (this.fitment.product === true) {
        this.setMessage('success');
      } else {
        this.setMessage('warning');
      }
      return;
    }

    if (this.fitment.variation_ids.length === 0) {
      this.setMessage('warning');
      return;
    }

    const variation_id = this.$variation_input.value;
    const found = this.fitment.variation_ids.indexOf(parseInt(variation_id));

    if (found > -1) {
      this.setMessage('success');
      return;
    }

    if (this.fitment.product) {
      this.setMessage('info');
      return;
    }

    this.setMessage('warning');
  };

  refreshVariationSelect = () => {
    if (this.debug) console.log('refreshVariationSelect()');
    if (this.$vehicle_variation_select_container) {
      if (this.fitment.variation_ids.length > 1) {
        const variations = window?.woo_product_details?.variations ?? [];
        const $div = document.createElement('div');

        const matching_variations = variations.filter((v) => this.fitment.variation_ids.includes(v.variation_id));

        const options = matching_variations.map((v) => {
          $div.innerHTML = v.variation_description;
          const sku = v?._ci_product_sku ? v._ci_product_sku : null;
          const name = `${$div.innerText} ${sku ? `(${v._ci_product_sku})` : ''}`;
          return { name, id: v.variation_id };
        });

        this.populateSelect(this.$vehicle_variation_select, options, true);
        this.$vehicle_variation_select_container.style.display = 'block';
      } else {
        this.$vehicle_variation_select_container.style.display = 'none';
      }
    }
  };

  setMessage = (mode, instant) => {
    // trying to stop the blip because the variation_id is set to "" before being set to a ID
    if (instant !== true) {
      if (this.messageTimeout) {
        clearTimeout(this.messageTimeout);
      }
      this.messageTimeout = setTimeout(() => this.setMessage(mode, true), 100);
      return;
    }

    if (this.debug) console.log('setMessage()');
    document.body.dataset.fitmentmode = mode;

    if (this.$vehicle_variation_select_container) {
      if (this.fitment.variation_ids.includes(parseInt(this.last_variation_id))) {
        if (this.$vehicle_variation_select.value != this.last_variation_id) {
          this.$vehicle_variation_select.value = this.last_variation_id;
        }
      } else {
        this.$vehicle_variation_select.value = '';
      }
    }
  };

  selectVariationId = async (variation_id) => {
    // TODO: AI thinks this is brittle
    const sleepTime = 10;

    this.clickClear();
    await sleep(sleepTime);

    const variation = woo_product_details.variations.find((v) => v.variation_id == variation_id);

    if (variation) {
      for (const attr in variation.attributes) {
        const $select = document.querySelector(`select[name="${attr}"]`);
        if ($select) {
          $select.value = variation.attributes[attr];
          $select.dispatchEvent(new Event('change', { bubbles: true }));
          await sleep(sleepTime);
        } else {
          if (this.debug) console.log('FAIL', `select[name="${attr}"]`);
        }
      }
    } else {
      if (this.debug) console.log('variation not found', variation_id);
    }

    this.$variation_input.value = variation_id;
    this.$variation_input.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(sleepTime);

    const $variationForm = document.querySelector('.variations_form');

    $variationForm.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(sleepTime);
    $variationForm.dispatchEvent(new Event('woocommerce_variation_select_change', { bubbles: true }));
    await sleep(sleepTime);
    $variationForm.dispatchEvent(new Event('check_variations', { bubbles: true }));
    await sleep(sleepTime);
    $variationForm.dispatchEvent(new Event('woocommerce_variation_has_changed', { bubbles: true }));
  };

  onChangeQuickSelect = async (e) => {
    if (this.debug) console.log('onChangeQuickSelect()', e?.currentTarget?.value ?? false);

    if (e.currentTarget.value) {
      this.selectVariationId(parseInt(e.currentTarget.value));
    }
  };

  // fires when user selects variation or variation is automatically selected
  onChangeVariationId = debounce(async () => {
    const variation_id = this.$variation_input.value;
    if (this.last_variation_id === variation_id) {
      return;
    }
    if (this.debug) console.log('onChangeVariationId()', variation_id);
    this.last_variation_id = variation_id;
    await this.refreshFitment();
    this.updateFitmentMessage();
  }, 250);

  onClickMessage = () => {
    this.selectAvailableVariation();
  };

  populateSelect = ($select, data, showLabel = true) => {
    this.emptySelect($select, showLabel);
    data.sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: 'base' }));
    data.forEach((m) => {
      $select.appendChild(new Option(m.name, m.id));
    });
    $select.disabled = false;
  };

  emptySelect = ($select, showLabel = true) => {
    $select.innerHTML = '';
    if (showLabel) {
      const label = $select?.dataset?.label ?? 'Select...';
      $select.appendChild(new Option(label, ''));
    }
    $select.disabled = true;
  };

  onSubmitVehicleSearch = (e) => {
    console.log('onSubmitVehicleSearch()');
    if (this.vehicle.id) {
      const f = new FormData(e.currentTarget);
      const s = f.get('s');
      if (s.trim() === '') {
        e.preventDefault();
        window.location.href = `/vehicles/vehicle_${this.vehicle.id}`;
      }
    }
  };

  load = async (query) => {
    const CACHE_KEY_PREFIX = 'vehicles_cache_';
    const CACHE_MAX_AGE_MS = 60 * 60 * 1000;
    const USE_CACHE = true;

    // Append the action to the query.
    query.action = vehicles_ajax.action;
    query.nonce = vehicles_ajax.nonce;

    const params = new URLSearchParams();
    Object.keys(query)
      .sort()
      .forEach((name) => {
        params.append(name, query[name]);
      });

    // Create a unique cache key based on the query object.
    // Note: JSON.stringify may be sufficient for simple query objects.
    const cacheKey = CACHE_KEY_PREFIX + params.toString(); //JSON.stringify(query);
    const cached = USE_CACHE && localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const { data, expiry } = JSON.parse(cached);
        if (expiry > Date.now()) {
          return data;
        }
      } catch (e) {
        console.error('Error parsing cached data:', e);
        // If error occurs, fall through to fetch a new result.
      }
    }

    try {
      const response = await fetch(vehicles_ajax.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data?.data) {
        // Cache the response with an expiry of one week.
        const cacheData = {
          data,
          expiry: Date.now() + CACHE_MAX_AGE_MS
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
      return data;
    } catch (error) {
      console.error('Error fetching makes:', error);
      alert('Well... something broke. Try again later.');
      // throw new Error(error);
      return null;
    }
  };

  disableInvalidOptions = () => {
    if (this.debug) console.log('disableInvalidOptions()');

    if ((woo_product_details?.variations?.length ?? 0) == 0) {
      return;
    }

    let selectedAttributes = {};

    // Capture currently selected attributes
    this.attributeSelects.forEach((select) => {
      if (select.value) {
        selectedAttributes[select.name] = select.value;
      }
    });

    this.attributeSelects.forEach((select) => {
      const attributeName = select.name;
      let validOptions = [];

      select.querySelectorAll('option').forEach((option) => {
        if (!option.value) return; // Skip empty option

        let isValid = false;

        // Check if any variation allows this option
        woo_product_details.variations.forEach((variation) => {
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
        // option.style.display = isValid ? 'block' : 'none';
      });

      const options = Array.from(select.options);

      options.sort((a, b) => {
        if(a.value==''){
          return -1;
        }
        if(b.value==''){
          return 1;
        }
        if (a == b) {
          return 0;
        }
        if (a.disabled && !b.disabled) {
          return 1;
        }
        if (!a.disabled && b.disabled) {
          return -1;
        }
        return a.text.localeCompare(b.text);
      });

      select.innerHTML = ''; // Clear the select
      options.forEach((option) => select.appendChild(option)); // Append sorted options

      // ✅ FIX: Prevent infinite loop by only changing value if necessary
      if (validOptions.length === 1 && select.value !== validOptions[0]) {
        select.value = validOptions[0];
        setTimeout(() => select.dispatchEvent(new Event('change')), 10); // Small delay to avoid recursion
      }
    });
  };

  // ✅ Reset all attributes when clicking the "Clear" button
  resetAttributes = () => {
    if (this.debug) console.log('resetAttributes()');
    this.attributeSelects.forEach((select) => {
      select.selectedIndex = 0; // Reset to default option
      select.querySelectorAll('option').forEach((option) => {
        option.disabled = false;
        option.style.display = 'block';
      });
    });

    setTimeout(() => {
      this.disableInvalidOptions(); // Re-run validation
    }, 10);
  };

  initAutoOptions = () => {
    if (this.debug) console.log('initAutoOptions()');
    this.attributeSelects.forEach((select) => {
      select.addEventListener('change', this.disableInvalidOptions);
    });

    // ✅ Event Listener: Reset when clicking the "Clear" button
    if (this.clearButton) {
      this.clearButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.resetAttributes();
      });
    }
  };

  clickClear = () => {
    this.clearButton.dispatchEvent(new Event('click', { bubbles: true }));
  };
}

const vehicles = new Vehicles();

document.addEventListener('DOMContentLoaded', () => {
  vehicles.init();
});
