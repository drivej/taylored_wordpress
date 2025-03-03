import { debounce } from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useFitment } from './utils/useFitment';
import { useInterop, VehicleDataEvent } from './utils/useInterop';

export const VehicleFitment = () => {
  const handler = (detail: VehicleDataEvent) => {
    console.log(detail);
    switch (detail.action) {
      case 'change_variation_id':
        setSelectedVariationId(parseInt(detail.payload));
        break;
    }
  };

  const onChangeVariationId: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    if (e.currentTarget.value !== '') {
      setSelectedVariationId(parseInt(e.currentTarget.value));
    }
  };

  const interop = useInterop(handler);
  const [vehicleId, setVehicleId] = useState(0);
  const [selectedVariationId, setSelectedVariationId] = useState<number>(null);
  const fitment = useFitment(vehicleId);
  const [variationInput, setVariationInput] = useState<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedVariationId) {
      vehicles.selectVariation(selectedVariationId);
    }
  }, [selectedVariationId]);

  const onChangeVariationId2 = debounce(() => {
    console.log('onChangeVariationId2', variationInput?.value);
    if (variationInput?.value) {
      if (parseInt(variationInput?.value) !== selectedVariationId) {
        setSelectedVariationId(parseInt(variationInput?.value));
      }
    }
  }, 1000);

  // find variation input
  useEffect(() => {
    setVariationInput(document.querySelector('input[name="variation_id"]') as HTMLInputElement);
  }, []);

  // listen to changes
  useEffect(() => {
    if (variationInput) {
      console.log('start observer');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
            onChangeVariationId2();
          }
        });
      });

      observer.observe(variationInput, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }
  }, [variationInput]);

  return (
    <div id='vehicle-fitment' className='p-2 d-none'>
      Vehicle cFitment <button onClick={() => interop.send({ action: 'change_variation_id', payload: '492720' })}>TEST</button>
      <button onClick={() => setVehicleId(10843)}>Vehicle 10843</button>
      <button onClick={() => setVehicleId(50605)}>Vehicle 50605</button>
      <select className='form-control' value={selectedVariationId} onChange={onChangeVariationId} disabled={(fitment.data?.variation_ids ?? []).length == 0}>
        <option value=''>Select...</option>
        {fitment.data?.variation_ids?.map((id) => <option value={id}>{id}</option>)}
      </select>
      <div>
        <pre style={{ background: '#000', color: 'orange', fontSize: 11 }}>{JSON.stringify({ vehicles: fitment.data }, null, 2)}</pre>
      </div>
    </div>
  );
};
