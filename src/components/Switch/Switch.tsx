import './Switch.css';

export function Switch(props: { firstIsActive: boolean; switchIndex: () => void; labels: string[]; }) {

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