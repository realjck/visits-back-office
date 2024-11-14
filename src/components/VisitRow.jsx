import './VisitRow.css';

export default function VisitRow(props){
    // behave
    const handleClick = () => {
        window.open(props.link, '_blank');
    }
    // render
    return (
        <div className="visit-row" onClick={handleClick}>
            <div className='visit-row-date'>{props.date}</div>
            <div className='visit-row-name'>
                <span className='visit-row-displayname'>{props.displayName}</span>
                <span className='visit-row-username'>({props.userName})</span>
            </div>
            <div className='visit-row-duration'>{props.duration}</div>
            <div className='visit-row-ground'>{props.ground}</div>
        </div>
    );
}