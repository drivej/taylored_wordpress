import { useEffect } from 'react';

export type VehicleDataEvent = {
  action: string;
  payload: string;
  //   message: string;
};

export const useInterop = (onMessage: (detail: VehicleDataEvent) => void) => {
  const element = document.body;
  const eventName = 'vehicle-interop';

  const handler = (e: CustomEvent<VehicleDataEvent>) => {
    console.log(e);
    onMessage(e.detail);
  };

  useEffect(() => {
    element.addEventListener(eventName, handler);

    return () => {
      element.removeEventListener(eventName, handler);
    };
  }, []);

  const send = (detail: VehicleDataEvent) => {
    const myEvent = new CustomEvent<VehicleDataEvent>(eventName, {
      detail, //: { message },
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(myEvent);
  };

  return { send };
};
