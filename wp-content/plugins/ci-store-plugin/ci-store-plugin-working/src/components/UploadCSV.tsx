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
    gcTime: Infinity
  });

  const update = (content: IImportedFile) => {
    queryClient.setQueryData<IImportedFile>(importKey, (d) => ({ ...d, ...content }));
    queryClient.refetchQueries({ queryKey: importKey });
  };

  return { ...query, update };
}

export const UploadCSV = () => {
  const importedFile = useImportedFile();
  const $fileInput = useRef<HTMLInputElement>();
  const [status, setStatus] = useState<'none' | 'loading' | 'loaded' | 'error'>('none');
  const isError = status === 'error';
  const isSuccess = status === 'loaded';
  const isLoading = status === 'loading';
  const [inputFile, setInputFile] = useState<File>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setStatus('loading');
    e.preventDefault();
    const file = $fileInput.current.files[0];
    const reader = new FileReader();
    setInputFile(file);

    reader.onload = (event) => {
      const content = event.target?.result?.toString() ?? '';
      importedFile.update({ content });
      setStatus('loaded');
    };
    reader.onerror = (event) => {
      setStatus('error');
    };
    reader.readAsText(file);
  };

  return (
    <div className='card-body'>
      <form method='POST' encType='multipart/form-data' onSubmit={onSubmit}>
        <h5>Upload CSV</h5>
        <div className='input-group'>
          <input className='form-control' ref={$fileInput} type='FILE' name='file' onChange={(e) => console.log(e.currentTarget.form.requestSubmit())} />
          <button className='btn btn-primary' type='submit'>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
