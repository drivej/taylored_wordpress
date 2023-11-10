import * as React from 'react';
import { useRef, useState } from 'react';

export enum MessageStatus {
  NONE = 'none',
  INFO = 'alert alert-info',
  DANGER = 'alert alert-danger',
  WARNING = 'alert alert-warning'
}
type IMessage = React.ReactNode | string;

interface IMessageContext {
  // status:AlertStatus;
  // message: AlertContent;
  showMessage(message: IMessage, status: MessageStatus): void;
  hide(): void;
}

export const MessageContext = React.createContext<IMessageContext>(null);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
  const $div = useRef<HTMLDivElement>();
  const [message, setMessage] = useState<IMessage>(null);
  const [status, setStatus] = useState<MessageStatus>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showMessage = (message: IMessage, status: MessageStatus = MessageStatus.INFO) => {
    console.log('showMessage', message);
    setMessage(message);
    setStatus(status);
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  return (
    <MessageContext.Provider value={{ showMessage, hide }}>
      {children}
      <div ref={$div} data-component='alertviolator' style={{ zIndex:999, transform: isVisible ? 'translateY(0)' : 'translateY(150%)' }}>
        <div className={`${status} d-flex align-items-center justify-content-between shadow`}>
          <span>{message}</span>
          <div>
          <button className='btn btn-secondary' onClick={() => setIsVisible(false)}>
            close
          </button></div>
        </div>
      </div>
    </MessageContext.Provider>
  );
};
