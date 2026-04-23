import './Switch.css';

type SwitchProps = Readonly<{ firstIsActive: boolean; switchIndex: () => void; labels: string[] }>;

export function Switch(props: SwitchProps) {

  return (
    <button
    type='button'  
    className={`switch-wrapper${props.firstIsActive ? ' isFirstActive' : ''}`}
      onClick={() => props.switchIndex()}
    >

      <div className='label'>
        {props.labels[0]}
      </div>
      <div className='label'>
        {props.labels[1]}
      </div>
    </button>
  )
}