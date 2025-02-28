const default_vehicle = {
  year: '',
  make: '',
  model: '',
  id: '',
  name: ''
};

const default_fitment = {
  vehicle_id: 0,
  variation_id: 0,
  product_id: 0,
  fitment: false,
  has_vehicles: false,
  product: false, //
  variation: false,
  variation_ids: [],
  variation_skus: [],
  product_type: ''
};

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
      selectVariation(this.fitment.variation_ids[0]);
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
    console.log({ select: this.$vehicle, vid: this.vehicle.id });
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
    if (this.debug) console.log('refreshFitment()');
    if (!vehicles_ajax.is_product || vehicles_ajax.has_vehicles != '1') {
      this.fitment = { ...default_fitment };
      return;
    }
    const product_id = vehicles_ajax?.product_id ?? 0;
    const variation_id = this.$variation_input?.value ?? 0;
    const vehicle_id = this.vehicle.id;
    const cacheKey = `${vehicle_id}_${product_id}_${variation_id}`;

    if (!this.fitment_cache.hasOwnProperty(cacheKey)) {
      if (product_id || variation_id) {
        const res = await this.load({
          type: 'fitment',
          vehicle_id,
          product_id,
          variation_id
        });

        if (res?.data) {
          const fitment = { ...default_fitment, ...res.data };
          this.fitment_cache[cacheKey] = fitment;
        }
      }
    }
    this.fitment = { ...this.fitment_cache[cacheKey] };
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

    document.body.dataset.fitmentmode = mode;

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

  // fires when user selects variation or variation is automatically selected
  onChangeVariationId = async () => {
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
}

const vehicles = new Vehicles();

document.addEventListener('DOMContentLoaded', () => {
  vehicles.init();
});
