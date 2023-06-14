import './App.css';
import {useEffect, useState} from "react";
import VisitRow from './components/VisitRow'
import moment from 'moment/moment';

function App(){
  // state
  const [visits, setVisits] = useState();
  const [visitors, setVisitors] = useState();
  const [visitRows, setVisitRows] = useState([]);

  const [sortState, setSortState] = useState(0);// méthode de tri>> 0,1 date // 2,3 nom // 4,5 duration //...
  // behave
  useEffect(() => {
    // Récupération du premier JSON
    fetch('https://x8ki-letl-twmt.n7.xano.io/api:4rpcKqQg/visits')
      .then(response => response.json())
      .then(jsonData => setVisits(jsonData))
      .catch(error => console.log(error));

    // Récupération du deuxième JSON
    fetch('https://x8ki-letl-twmt.n7.xano.io/api:4rpcKqQg/visitors')
      .then(response => response.json())
      .then(jsonData => setVisitors(jsonData))
      .catch(error => console.log(error));
  }, []);

  useEffect(() => {
    // Vérifier si les deux JSON sont chargés, puis les convertir en visitRows
    if (visits && visitors) {
      setVisitRows([...visits].sort((a, b) => b.created_at - a.created_at).map(visit => {
        const visitor = visitors.find((v)=> v.id === visit.visitors_id);
    
        const x = new moment(visit.created_at);
        const y = new moment(visit.left_at);
        const diff = moment.duration(y.diff(x), "milliseconds").humanize();
    
        const uname = visitor.username.replace(" Resident", "");
    
        return {
          id: visit.id,
          created_at: visit.created_at,
          date: moment(visit.created_at).format("ll"),
          displayName: visitor.displayname,
          userName: uname,
          duration: diff,
          durationTime: visit.left_at - visit.created_at,
          link: "https://my.secondlife.com/"+uname.replace(" ", ".")+"/#about_tab"
        }
      }));

    }
  }, [visits, visitors]);

  // méthodes de tris

  useEffect(() => {
    switch(sortState){
      case 0:
        setVisitRows([...visitRows].sort((a, b) => b.created_at - a.created_at));
      break;

      case 1:
        setVisitRows([...visitRows].sort((a, b) => a.created_at - b.created_at));
      break;

      case 2:
        setVisitRows([...visitRows].sort((a, b) => {
          const nameA = a.userName.toUpperCase(); // Convertir en majuscules pour un tri insensible à la casse
          const nameB = b.userName.toUpperCase();
          return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        }));
      break;

      case 3:
        setVisitRows([...visitRows].sort((a, b) => {
          const nameA = a.userName.toUpperCase(); // Convertir en majuscules pour un tri insensible à la casse
          const nameB = b.userName.toUpperCase();
          return (nameA < nameB) ? 1 : (nameA > nameB) ? -1 : 0;
        }));
      break;

      case 4:
        setVisitRows([...visitRows].sort((a, b) => b.durationTime - a.durationTime));
      break;

      case 5:
        setVisitRows([...visitRows].sort((a, b) => a.durationTime - b.durationTime));
      break;

      default:break;
    }
    
  }, [sortState]);

  const handleClickSortDate = () => {
    if (sortState === 0){
      setSortState(1);
    } else {
      setSortState(0);
    }
  }
  const handleClickSortName = () => {
    if (sortState === 2){
      setSortState(3);
    } else {
      setSortState(2);
    }
  }
  const handleClickSortDuration = () => {
    if (sortState === 4){
      setSortState(5);
    } else {
      setSortState(4);
    }
  }

  // render
  return (
    <div>
        <div className='container'>
          <div className='back-office-header'>
            <h1>visits back-office</h1>
            <div className='back-office-header-navbar'>
              <div className={sortState === 0 ? 'back-office-header-date active' : sortState === 1 ? 'back-office-header-date activeRev' : "back-office-header-date"} onClick={handleClickSortDate}>
                <button>📅</button><img src="/arrow.svg" alt="arrow"/>
              </div>
              <div className={sortState === 2 ? 'back-office-header-name active' : sortState === 3 ? 'back-office-header-name activeRev' : "back-office-header-name"} onClick={handleClickSortName}>
                <button>👥</button><img src="/arrow.svg" alt="arrow"/>
              </div>
              <div className={sortState === 4 ? 'back-office-header-duration active' : sortState === 5 ? 'back-office-header-duration activeRev' : "back-office-header-duration"} onClick={handleClickSortDuration}>
                <button>⌚️</button><img src="/arrow.svg" alt="arrow"/>
              </div>
            </div>
          </div>
          <div className='back-office-body'>
            {!(visits && visitors) ? <div className='back-office-loading'>fetching data</div> : ""}
            {visitRows.map(v => (
              <VisitRow
                key={v.id}
                date={v.date}
                displayName={v.displayName}
                userName={v.userName}
                duration={v.duration}
                link={v.link}
              />
            ))}
          </div>
          
        </div>
    </div>
  );
}

export default App;
