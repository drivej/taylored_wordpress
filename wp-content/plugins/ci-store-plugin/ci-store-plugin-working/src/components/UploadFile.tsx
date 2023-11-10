import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useRef, useState } from 'react';

interface IImportedFile {
  content: string;
}
export const importKey = ['imported_file'];

export function useImportedFile() {
  const queryClient = useQueryClient();

  const query = useQuery<IImportedFile>({
    queryKey: importKey,
    enabled: false,
    cacheTime: Infinity
  });

  const update = (content: IImportedFile) => {
    queryClient.setQueryData<IImportedFile>(importKey, (d) => ({ ...d, ...content }));
    queryClient.refetchQueries({ queryKey: importKey });
  };

  return { ...query, update };
}

export const UploadFile = ({ onComplete, onError, accept = null }: { onComplete(content: string, file: File): void; accept?: string; onError?(e: ProgressEvent<FileReader>): void }) => {
  // const importedFile = useImportedFile();
  const $fileInput = useRef<HTMLInputElement>();
  const [status, setStatus] = useState<'none' | 'loading' | 'loaded' | 'error'>('none');
  const isError = status === 'error';
  const isSuccess = status === 'loaded';
  const isLoading = status === 'loading';

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setStatus('loading');
    e.preventDefault();
    if ($fileInput.current.files?.[0]) {
      const file = $fileInput.current.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const content = event.target?.result?.toString() ?? '';
        onComplete(content, file);
        setStatus('loaded');
      };
      reader.onerror = (event) => {
        onError(event);
        setStatus('error');
      };
      reader.readAsText(file);
    } else {
      setStatus('none');
    }
  };

  const onClear = () => {
    $fileInput.current.value = '';
    onComplete(null, null);
  };

  return (
    <form method='POST' encType='multipart/form-data' onSubmit={onSubmit} className='mb-0'>
      <div className='input-group'>
        <input disabled={isLoading} className='form-control' ref={$fileInput} type='FILE' name='file' accept={accept} onChange={(e) => console.log(e.currentTarget.form.requestSubmit())} />
        {/* <button disabled={isLoading} className={isSuccess ? 'btn btn-light' : 'btn btn-primary'} type='submit'>
          Upload {isError ? '!' : ''}
        </button> */}
        {isSuccess ? (
          <button disabled={isLoading} className='btn btn-primary' type='button' onClick={onClear}>
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
};

import * as csv from 'csvtojson';

export const UploadCSVFile = ({ onComplete, onError }: { onComplete(csv: any[], file: File): void; onError?(e: ProgressEvent<FileReader>): void }) => {
  const _onComplete = (content: string, file: File) => {
    if (content) {
      csv()
        .fromString(content)
        .then((csv) => onComplete(csv, file));
    } else {
      onComplete(null, null);
    }
  };

  return <UploadFile onComplete={_onComplete} onError={onError} accept={'.csv'} />;
};
