import './VisitRow.css';
import { useState } from 'react';

export default function VisitRow(){
    // state
    const [visit, setVisit] = useState({
        date: "13 juin 2023",
        displayName: "Real",
        userName: "Real Burger",
        duration: "17mn"
    });
    // behave

    // render
    return (
        <div className="visit-row">
            <div className='visit-row-date'>{visit.date}</div>
            <div className='visit-row-name'>
                <span className='visit-row-displayname'>{visit.displayName}</span>
                <span className='visit-row-username'>({visit.userName})</span>
            </div>
            <div className='visit-row-duration'>{visit.duration}</div>
        </div>
    );
}