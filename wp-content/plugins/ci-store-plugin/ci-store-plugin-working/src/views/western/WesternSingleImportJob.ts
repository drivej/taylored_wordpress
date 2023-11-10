import { JobManager } from '../../jobs/JobManager';
import { JobRunner } from '../../jobs/JobRunner';
import { importWesternProduct } from './WPSJobUtils';

export interface IWesternSingleImportPayload {
  supplierProductId: number;
  // lastUpdate?: string;
  // wooProduct?: IWooVariable;
  // wpsProduct?: IWesternProductExt;
  // wooProducts?: Partial<IWooVariable>[];
  // wpsProducts?: Partial<IWesternProductExt>[];
  // wooVariations?: IWooVariation[];
  // updates?: Partial<IWooVariable>[];
  // product?: Product;
}

// interface IWooDelta<D = unknown> {
//   path: string;
//   params: IWooParams;
//   method: FormMethod;
//   data: D;
// }

// const processDeltas = async (config: { deltas: IWooDelta[]; onComplete: () => void; onSuccess: (data: unknown, length: number) => void; onError: (delta: unknown, result: unknown) => void; onResume: () => void; jobRef: JobRunner }) => {
//   if (config.jobRef.paused === true) {
//     config.jobRef.onResume = () => {
//       config.onResume();
//       processDeltas(config);
//     };
//     return;
//   }
//   console.log('processDeltas', config.deltas.length);
//   const delta = config.deltas.pop();
//   const result = await fetchWooAPI(delta.path, delta.params, delta.method);

//   if ((result?.data as any)?.error) {
//     config.onError(delta, result);
//   } else {
//     config.onSuccess(delta, config.deltas.length);
//   }

//   if (config.deltas.length > 0) {
//     processDeltas({ ...config });
//   } else {
//     config.onComplete();
//   }
// };

// class Job_loadWPSProduct extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Load WPS Product';

//   async doRun() {
//     const wpsProduct = await getWPSProduct(this.input.supplierProductId);
//     console.log({ wpsProduct });
//     this.onComplete({ ...this.input, wpsProduct });
//   }
// }

// class Job_getWooProduct extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Get Woo Product';

//   async doRun() {
//     const wooProduct = await getWooProductBySku(`MASTER_${WESTExRN_KEY}_${this.input.supplierProductId}`);
//     console.log({ wooProduct });
//     this.onComplete({ ...this.input, wooProduct });
//   }
// }

// class Job_analyze extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Analyze';

//   async doRun() {
//     const { wooProduct, wpsProduct } = this.input;
//     const needsUpdate = wooNeedsUpdate(wooProduct, wpsProduct);
//     this.log(`needsUpdate=${needsUpdate.toString()}`);
//     if (needsUpdate) {
//       await syncWooProduct(wooProduct, wpsProduct);
//     }
//     this.onComplete(this.input);
//   }
// }

// class Job_complete extends JobRunner<IWesternSingleImportPayload> {
//   name = 'Complete';

//   async doRun() {
//     console.log({ input: this.input });
//     this.onComplete(this.input);
//   }
// }

class Job_importWesternProduct extends JobRunner<IWesternSingleImportPayload> {
  name = 'Import Western Product';

  async doRun() {
    console.log({ input: this.input });
    const result = await importWesternProduct(this.input.supplierProductId);
    this.log(`${result.action}: wpsId=${result.wpsId} wooId=${result.wooId}`);
    this.onComplete(this.input);
  }
}

// 64913

export const WesternSingleImportJobManager = new JobManager<IWesternSingleImportPayload>({
  name: 'Import Single Product',
  stages: [
    new Job_importWesternProduct() //
    // new Job_loadWPSProduct(),
    // new Job_getWooProduct(),
    // new Job_analyze(),
    // new Job_complete()
  ]
});
