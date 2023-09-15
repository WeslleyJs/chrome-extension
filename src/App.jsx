import { useState, useEffect} from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { CiSearch } from 'react-icons/ci';
import { BsLinkedin } from 'react-icons/bs';
// import Img from './assets/logo-marca.png'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);
// import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [search, setSearch] = useState([]);
  const [currentTask, setCurrentTask] = useState('');
  const [shipping, setShipping] = useState();
  const [visits, setVisits] = useState(null);

  const [item, setItem] = useState('');

  const addTask = () => {
    if (currentTask.trim() !== '' || currentTask.trim() !== ' ' ) {
      if(!currentTask.startsWith('MLB')) setSearch('MLB'+currentTask)
      else setSearch(currentTask);
      
      setCurrentTask('');
}};
  function handleKeyPress(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    addTask();
  }
}


useEffect(() => {
  const getItem = async (mlb) => {
    try {
      const element = await axios.get(`https://api.mercadolibre.com/items/${mlb}`)
      const { data } = element
      setItem(data)
    } catch (error) {
      console.log(error.message)
    }
}
  const getShipping = async (mlb) =>{
    try {
      const element = await axios.get(`https://api.mercadolibre.com/items/shipping_options/free?ids=${mlb}`)
      const { data } = element;
      Object.keys(data).map(function (key) {
        const result = data[key].coverage.all_country;
        setShipping(result);
      })
    } catch (error) {
      console.log(error.message)
    }
  }
    const getVisits = async (mlb) => {
      try {
        const element = await axios.get(`https://api.mercadolibre.com/items/${mlb}/visits/time_window?last=7&unit=day`)
        const { data } = element;
        setVisits(data.results);
        
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['Retry-After'];
           await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
           return getVisits(mlb);
          }
        throw error;
      }
    } 
    getVisits(search);
    getItem(search);
    getShipping(search);  
  }, [search]);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      // text: 'Chart.js Line ',
    },
  },
};

const labels = visits ? visits.map(e => dayjs(e.date).format('DD-MM')) : '';

const data = {
  labels,
  datasets: [
    {
      fill: true,
      label: 'Visitas Semanais',
      data: visits ? visits.map(e => e.total): '',
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};
  return (
    <>
    <div className='top-header'>

      <span>Desenvolvido por </span>
      <a style={{ fontSize: '22px'}} href='https://www.linkedin.com/in/weslley-mateus-7a7a43220/'><BsLinkedin style={{width: '30px'}} /></a>
    </div>
      <h1 className='sales-rocket'>Sales Rocket</h1>
    <div style={{ marginTop: '10px'}}>
          <input
          type="text"
          placeholder="Pesquise por um MLB..."
          value={currentTask}
          onChange={(e) => setCurrentTask(e.target.value)}
          onKeyDown={(event) => handleKeyPress(event)}
          />
        <button style={{marginLeft: '10px', fontSize: '22px'}} onClick={addTask}><CiSearch  /></button>
    </div>
    <div className=''>
      { item && (
        <div className='info-item'>
        <div>
          <img style={{width: '180px', padding: '10px'}} src={`http://http2.mlstatic.com/D_${item.thumbnail_id}-O.jp`} alt="" />
        </div>
        <div>
          <ul className='list-item'>
            <li>{item.title}</li>
            <li>Cadastrado em: {dayjs(item.date_created).format('DD/MM/YYYY')}</li>
            <li>Quantidade disponível: {item.available_quantity} un.</li>
            <li>Peso cadastrado: {shipping?.billable_weight}g</li>
            <li>Valor frete Pago: R${shipping?.list_cost}</li>
            <li>Modalidade: <span style={{color: 'green'}}>{item.shipping?.logistic_type === 'fulfillment' ? 'FULL' : 'Cross Docking' }</span></li>
          </ul>
        </div>
        </div>
      )}
      <div>
        {search === null && <p> Loading ...</p>}
        {visits && (
          <div>
            <Line options={options} data={data} />
          </div>
        )}
      </div>
    </div>
</>
  )
}

export default App
