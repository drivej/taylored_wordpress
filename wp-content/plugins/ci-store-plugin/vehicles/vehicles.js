const default_vehicle = {
  year: '',
  make: '',
  model: '',
  id: '',
  name: ''
};

const default_fitment = {
  vehicle_id: 0,
  // variation_id: 0,
  product_id: 0,
  fitment: false,
  has_vehicles: false,
  product: false, //
  // variation: false,
  variation_ids: [],
  variation_skus: [],
  product_type: ''
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Vehicles {
  debug = true;
  storage_key = 'user_vehicle_data';
  year = '';
  make = '';
  model = '';
  $year;
  $make;
  $model;
  $form;
  $name;
  $message;
  $shop_link;
  $variation_input;
  vehicle = { ...default_vehicle };
  vehicles = {};
  fitment = { ...default_fitment };
  initialized_fitment = false;
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
    this.$name = this.$container.querySelector('#vehicle_name');
    this.$start_button = this.$container.querySelector('#vehicle_start_button');
    this.$change_button = this.$container.querySelector('#vehicle_change_button');
    this.$label = this.$container.querySelector('#vehicle_label');
    this.$shop_links = document.querySelectorAll('a.shop_vehicle_link');
    this.$variation_input = document.querySelector('input[name="variation_id"]');
    this.$vehicle_variation_select_container = document.getElementById('vehicle_variation_select_container');
    this.$vehicle_variation_select = document.getElementById('vehicle_variation_select');
    this.$vehicle_variation_select.addEventListener('change', this.onChangeQuickSelect);

    // search form filter
    this.$search_vehicle = document.getElementById('product_vehicle_filter');
    this.$vehicle_id_inputs = document.querySelectorAll('input[name="product_vehicle"]');
    const $search_form = document.querySelector('#vehicle_search_form form');
    if ($search_form) {
      $search_form.addEventListener('submit', this.onSubmitVehicleSearch);
    }
    // injected in product details
    this.$message = document.getElementById('fitment_message');
    this.$modal_container = document.getElementById('user_vehicles_modal_container');
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

    if (this.$message) {
      this.$message.addEventListener('click', this.onClickMessage);
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
      // this.selectVariation(this.fitment.variation_ids[0]);
    }
  };

  selectAvailableSku = () => {
    if (this.debug) console.log('selectAvailableSku()');
    if (this.fitment.variation_skus?.length > 0) {
      const $sku_select = document.querySelector('select[name="attribute_sku"]');

      if ($sku_select) {
        const skus = this.fitment.variation_skus.map((s) => String(s).toLowerCase());
        let i = $sku_select.options.length;
        let found = '';

        while (i--) {
          const val = $sku_select.options[i].value.toLowerCase();
          if (skus.includes(val)) {
            found = val;
            break;
          }
        }
        if (found) {
          $sku_select.value = found;
          $sku_select.dispatchEvent(new Event('change', { bubbles: true }));
          this.setMessage('success');
        } else {
          this.setMessage('');
        }
        return true;
      }
    }
    return false;
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
    // console.log({ select: this.$vehicle, vid: this.vehicle.id });
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
    // const variation_id = this.$variation_input?.value ?? 0;
    const vehicle_id = this.vehicle.id;
    // const cacheKey = `${vehicle_id}_${product_id}_${variation_id}`;
    const cacheKey = `${vehicle_id}_${product_id}`;

    if (!this.fitment_cache.hasOwnProperty(cacheKey)) {
      if (product_id) {
        // || variation_id) {
        const res = await this.load({
          type: 'fitment',
          vehicle_id,
          product_id
          // variation_id
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
    // debounce
    // if (instant !== true) {
    //   if (this.fitmentTimeout) {
    //     clearTimeout(this.fitmentTimeout);
    //   }
    //   this.fitmentTimeout = setTimeout(() => this.updateFitmentMessage(true), 250);
    //   return;
    // }
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
    // if (this.debug) console.log('updateFitmentMessage()', { variation_ids: this.fitment.variation_ids.join(), variation_id, found });

    if (found > -1) {
      // selectVariation(this.fitment.variation_ids[0]);
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
          const name = `${$div.innerText} ${sku ? `(${v._ci_product_sku}) ${v.variation_id}` : ''}`;
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
    // if (!this.$message) return;
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

    // if (this.$vehicle_variation_select.value !== this.last_variation_id) {
    //   this.$vehicle_variation_select.value = '';
    // }

    if (this.$vehicle_variation_select_container && !this.userChangedVariationSelect) {
      if (this.fitment.variation_ids.includes(parseInt(this.last_variation_id))) {
        if (this.$vehicle_variation_select.value != this.last_variation_id) {
          this.$vehicle_variation_select.value = this.last_variation_id;
        }
      } else {
        this.$vehicle_variation_select.value = '';
      }
    }

    // if (this.$vehicle_variation_select_container) {
    //   if (this.fitment.variation_ids.includes(parseInt(this.last_variation_id))) {
    //     if (this.$vehicle_variation_select.value != this.last_variation_id) {
    //       this.$vehicle_variation_select.value = this.last_variation_id;
    //     }
    //   } else {
    //     this.$vehicle_variation_select.value = '';
    //   }
    // }
    //   switch (mode) {
    //     case 'success':
    //       this.$message.dataset.fitment = 'success';
    //       this.$message.innerHTML = '✅ Exact match for your vehicle';
    //       break;

    //     case 'warning':
    //       this.$message.dataset.fitment = 'warning';
    //       this.$message.innerHTML = 'This may **NOT** fit your vehicle';
    //       break;

    //     case 'info':
    //       this.$message.dataset.fitment = 'info';
    //       this.$message.innerHTML = 'Find exact match for your vehicle';
    //       break;

    //     case 'loading':
    //       this.$message.dataset.fitment = 'loading';
    //       this.$message.innerHTML = 'Updating...';
    //       break;

    //     default:
    //       this.$message.dataset.fitment = '';
    //       this.$message.innerHTML = '';
    //   }
  };

  userChangedVariationSelect = false;

  // onChangeQuickSelect = (e) => {
  //   if (this.debug) console.log('onChangeQuickSelect()', e.currentTarget.value);
  //   if (e.currentTarget.value !== '') {
  //     this.userChangedVariationSelect = true;
  //     this.selectVariation(e.currentTarget.value);
  //   }
  // };

  onChangeQuickSelectTimeout = null;

  selectVariationId = async (variation_id) => {
    const variation = woo_product_details.variations.find((v) => v.variation_id == variation_id);
    const sleepTime = 10;

    if (variation) {
      for (const attr in variation.attributes) {
        const $select = document.querySelector(`select[name="${attr}"]`);
        if ($select) {
          $select.value = variation.attributes[attr];
          $select.dispatchEvent(new Event('change', { bubbles: true }));
          await sleep(sleepTime);
        } else {
          console.log('FAIL', `select[name="${attr}"]`);
        }
      }
    }

    this.$variation_input.value = variation_id;
    // this.$variation_input.dispatchEvent(new Event('change', { bubbles: true }));

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
    // window.quick_selecting = true;

    if (e.currentTarget.value) {
      this.selectVariationId(parseInt(e.currentTarget.value));
    }

    // return;

    // this.selectVariation(e.currentTarget.value);

    // setTimeout(() => {
    //   window.quick_selecting = false;
    // }, 500);
    // this.userChangedVariationSelect = true;
    // this.doChangeQuickSelect(e);

    // if (this.debug) console.log('onChangeQuickSelect()', e.currentTarget.value);
    // if (e.currentTarget.value !== '') {
    //   // Debounce to prevent race conditions with other updates
    //   clearTimeout(this.onChangeQuickSelectTimeout);

    //   this.onChangeQuickSelectTimeout = setTimeout(() => {
    //     this.last_variation_id = this.$vehicle_variation_select.value; // Sync last_variation_id
    //     this.selectVariation(this.$vehicle_variation_select.value);
    //   }, 50);
    // }
  };

  doChangeQuickSelect = (e) => {
    if (this.debug) console.log('doChangeQuickSelect()', e.currentTarget.value);
    if (e.currentTarget.value !== '') {
      this.last_variation_id = e.currentTarget.value; // Sync immediately
      this.selectVariation(e.currentTarget.value);
    }
  };

  // fires when user selects variation or variation is automatically selected
  // onChangeVariationId_Timeout = null;

  onChangeVariationId = async (instant) => {
    // if (instant !== true) {
    //   if (this.onChangeVariationId_Timeout) {
    //     clearTimeout(this.onChangeVariationId_Timeout);
    //   }
    //   this.onChangeVariationId_Timeout = setTimeout(() => this.onChangeVariationId(true), 250);
    //   return;
    // }

    const variation_id = this.$variation_input.value;
    if (this.last_variation_id === variation_id) {
      return;
    }
    if (this.debug) console.log('onChangeVariationId()', variation_id);
    this.last_variation_id = variation_id;
    await this.refreshFitment();
    this.updateFitmentMessage();
  };

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
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const USE_CACHE = false;

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
          expiry: Date.now() + ONE_WEEK_MS
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

  selectVariation = (variation_id) => {
    console.log('selectVariation(', variation_id, ')');
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
  };

  disableInvalidOptions = () => {
    console.log('disableInvalidOptions()'); //, { quick_selecting: window.quick_selecting });

    if ((woo_product_details?.variations?.length ?? 0) == 0) {
      return;
    }

    // if (window.quick_selecting === true) return;
    // if (instant !== true) {
    //   clearTimeout(debounce_disableInvalidOptions);
    //   debounce_disableInvalidOptions = setTimeout(() => disableInvalidOptions(true), 1000);
    //   return;
    // }
    let selectedAttributes = {};

    // Capture currently selected attributes
    this.attributeSelects.forEach((select) => {
      if (select.value) {
        selectedAttributes[select.name] = select.value;
      }
    });

    console.log({ selectedAttributes });

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
        option.style.display = isValid ? 'block' : 'none';
      });

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
}

const vehicles = new Vehicles();

document.addEventListener('DOMContentLoaded', () => {
  vehicles.init();
});
